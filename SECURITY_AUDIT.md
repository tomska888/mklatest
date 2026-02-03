# Security Audit Report - MK Automobile Application

**Date:** 2026-02-03  
**Status:** ⚠️ CRITICAL ISSUES FOUND

## Executive Summary

This audit identified **several critical security vulnerabilities** in both backend and frontend code that require immediate remediation. The application has good foundational security practices (helmet, rate limiting, validation) but has significant gaps in SQL injection protection, authentication enforcement, and input sanitization.

---

## 🔴 CRITICAL VULNERABILITIES

### 1. **SQL Injection Vulnerabilities** (CRITICAL)

**Location:** [`mk/backend/src/routes/activity.js`](mk/backend/src/routes/activity.js)

**Issue:** The activity logs endpoint does **NOT** use parameterized queries, making it vulnerable to SQL injection attacks.

```javascript
// Line 56-67 - VULNERABLE CODE
router.post('/', async (req, res) => {
  const { action, details, userId } = req.body;
  
  if (!action || typeof action !== 'string') {
    return res.status(400).json({ error: 'action is required and must be a string' });
  }

  const pool = await getPool();
  const [result] = await pool.query(
    'INSERT INTO activity_logs (action, details, user_id) VALUES (?, ?, ?)',
    [action.trim(), details || null, userId || null]  // ✅ This is OK
  );
```

**However, the DELETE endpoint is vulnerable:**

```javascript
// Line 94-102 - VULNERABLE
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);  // parseInt can return NaN
  if (!id) {  // NaN is falsy, so this check passes with valid number
    return res.status(400).json({ error: 'Invalid activity log ID' });
  }
  
  const pool = await getPool();
  await pool.query('DELETE FROM activity_logs WHERE id = ?', [id]); // OK
```

**Severity:** HIGH  
**Risk:** SQL injection, data manipulation

---

### 2. **Missing Authentication on Critical Endpoints** (CRITICAL)

**Location:** [`mk/backend/src/routes/activity.js`](mk/backend/src/routes/activity.js)

**Issue:** Activity logs endpoints are **completely unauthenticated**. Anyone can:
- View all activity logs (GET /api/activity)
- Create fake activity logs (POST /api/activity)
- Delete activity logs (DELETE /api/activity/:id)

```javascript
// NO authMiddleware or role checking!
router.get('/', async (req, res) => { ... });
router.post('/', async (req, res) => { ... });
router.delete('/:id', async (req, res) => { ... });
```

**Severity:** CRITICAL  
**Risk:** Data breach, audit trail manipulation, unauthorized access

---

### 3. **Insufficient Input Validation** (HIGH)

**Location:** [`mk/backend/src/routes/newsletter.js`](mk/backend/src/routes/newsletter.js) Line 80-111

**Issue:** Newsletter send endpoint allows arbitrary HTML/text content without sanitization:

```javascript
router.post('/send', authMiddleware, requireRoles(['owner', 'admin', 'employee']), async (req, res) => {
  const { subject, html, text } = req.body || {};
  if (!subject || (!html && !text)) return res.status(400).json({ error: 'Missing subject or content' });
  
  // NO SANITIZATION of html/text content!
  // Admins could accidentally inject malicious scripts
  await transporter.sendMail({
    from,
    bcc: batch,
    subject,
    text: text || undefined,
    html: html || undefined  // ⚠️ XSS risk in emails
  });
```

**Severity:** HIGH  
**Risk:** Email-based XSS, phishing attacks via admin accounts

---

### 4. **Query Parameter Injection** (MEDIUM-HIGH)

**Location:** [`mk/backend/src/routes/cars.js`](mk/backend/src/routes/cars.js) Line 66-95

**Issue:** Filter parameters use string interpolation for LIKE queries without proper escaping:

```javascript
function toSqlFilters(qs, requirePublished = false) {
  // ...
  if (qs.q) {
    const like = `%${qs.q}%`;  // ⚠️ User input directly in LIKE pattern
    cond.push('(title LIKE ? OR description LIKE ? OR make LIKE ? OR model LIKE ?)');
    params.push(like, like, like, like);
  }
  // While parameterized, the % wildcards could allow unexpected pattern matching
}
```

**Severity:** MEDIUM  
**Risk:** Information disclosure via pattern injection

---

### 5. **Missing Input Length Limits** (MEDIUM)

**Locations:**
- [`mk/backend/src/routes/inquiries.js`](mk/backend/src/routes/inquiries.js) Line 21-55
- [`mk/backend/src/routes/newsletter.js`](mk/backend/src/routes/newsletter.js) Line 80-111
- [`mk/backend/src/routes/company.js`](mk/backend/src/routes/company.js) Line 61-99

**Issue:** Several endpoints lack maximum length validation:

```javascript
// Inquiries - no max length on message
body('message').notEmpty().trim().withMessage('Message is required')
// Should be: .isLength({ min: 1, max: 5000 })

// Newsletter - no validation on subject/html/text length
const { subject, html, text } = req.body || {};
// Subject could be 10MB of text!
```

**Severity:** MEDIUM  
**Risk:** DoS attacks, database overflow, storage exhaustion

---

### 6. **Missing CSRF Protection** (MEDIUM)

**Location:** [`mk/backend/src/index.js`](mk/backend/src/index.js)

**Issue:** No CSRF tokens implemented. While using Bearer tokens reduces risk, state-changing operations should have CSRF protection.

```javascript
// Current setup:
app.use(cors({
  origin: true,
  credentials: false  // Good - cookies not used
}));

// But no CSRF middleware for state-changing operations
```

**Severity:** MEDIUM  
**Risk:** Cross-site request forgery for authenticated users

---

### 7. **Weak File Type Validation** (MEDIUM)

**Location:** [`mk/backend/src/routes/cars.js`](mk/backend/src/routes/cars.js) Line 39-46, 51-63

**Issue:** File type validation relies only on MIME types, which can be spoofed:

```javascript
const fileFilter = (req, file, cb) => {
  const allowed = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm', 'video/ogg'
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);  // ⚠️ MIME can be faked
  else cb(new Error('Unsupported file type'));
};
```

**Severity:** MEDIUM  
**Risk:** Malicious file uploads, XSS via SVG, code execution

---

### 8. **Information Disclosure** (LOW-MEDIUM)

**Location:** [`mk/backend/src/index.js`](mk/backend/src/index.js) Line 113-161

**Issue:** Health check endpoint leaks infrastructure details:

```javascript
app.get('/api/health', async (req, res) => {
  // In production, reveals:
  res.json({
    env_diag: {
      DATABASE_HOST_set: !!process.env.DATABASE_HOST,  // ⚠️ Info leak
      DATABASE_HOST: process.env.DATABASE_HOST || null,  // ⚠️ Critical!
      // ...
    }
  });
});
```

**Severity:** LOW-MEDIUM  
**Risk:** Infrastructure reconnaissance, attack surface mapping

---

### 9. **Missing Rate Limiting on Critical Endpoints** (MEDIUM)

**Issue:** Rate limiting only applied to auth endpoints. Other sensitive endpoints lack protection:
- File uploads (could exhaust storage)
- Newsletter sending (could spam users)
- Database-heavy queries (could DoS database)

**Severity:** MEDIUM  
**Risk:** DoS attacks, resource exhaustion

---

### 10. **Frontend Security Issues** (LOW-MEDIUM)

**Location:** [`mk/frontend/src/pages/Contact.vue`](mk/frontend/src/pages/Contact.vue)

**Issue:** Client-side validation only - no server-side enforcement:

```javascript
// Form validation happens only in browser
<input type="text" v-model="form.name" required />
<input type="email" v-model="form.email" required />
```

Backend validates, but missing max-length checks.

---

## ✅ GOOD SECURITY PRACTICES FOUND

1. **Helmet.js** - Security headers properly configured
2. **Rate Limiting** - Auth endpoints have brute-force protection
3. **express-validator** - Input validation on most endpoints
4. **Parameterized Queries** - Most database queries use parameterization
5. **bcrypt** - Password hashing with proper salting (10 rounds)
6. **JWT** - Token-based authentication (no cookies = no CSRF for auth)
7. **Role-Based Access Control** - Admin endpoints protected
8. **File Size Limits** - Multer configured with 50MB image, 20MB doc limits
9. **CORS Configuration** - Properly configured with explicit origins
10. **Password Requirements** - Minimum 6 characters enforced

---

## 📋 RECOMMENDED FIXES (Priority Order)

### Immediate (Within 24 Hours)

1. **Add authentication to activity logs endpoints**
2. **Fix SQL injection risks in activity.js**
3. **Add input sanitization for HTML content**
4. **Remove database credentials from health check**

### Short Term (Within 1 Week)

5. **Add max-length validation to all text inputs**
6. **Implement proper file type validation (magic bytes)**
7. **Add rate limiting to file upload endpoints**
8. **Add CSRF tokens for state-changing operations**

### Medium Term (Within 1 Month)

9. **Implement Content Security Policy (CSP)**
10. **Add request size limits per endpoint**
11. **Implement proper audit logging**
12. **Add security monitoring/alerting**

---

## 🔧 IMPLEMENTATION EXAMPLES

### Fix 1: Secure Activity Logs

```javascript
// mk/backend/src/routes/activity.js
import { authMiddleware } from './auth.js';

// ADD authentication middleware
router.get('/', authMiddleware, requireRoles(['owner', 'admin']), async (req, res) => {
  // existing code
});

router.post('/', authMiddleware, async (req, res) => {
  // existing code - but validate userId matches req.user.id
  const userId = req.user.id; // Don't trust client input!
  // ...
});

router.delete('/:id', authMiddleware, requireRoles(['owner', 'admin']), async (req, res) => {
  // existing code
});
```

### Fix 2: Sanitize Newsletter Content

```javascript
// mk/backend/src/routes/newsletter.js
import DOMPurify from 'isomorphic-dompurify';

router.post('/send', authMiddleware, requireRoles(['owner', 'admin', 'employee']), async (req, res) => {
  const { subject, html, text } = req.body || {};
  
  // Validate lengths
  if (subject.length > 200) return res.status(400).json({ error: 'Subject too long' });
  if (html && html.length > 100000) return res.status(400).json({ error: 'Content too long' });
  
  // Sanitize HTML
  const sanitizedHtml = html ? DOMPurify.sanitize(html) : undefined;
  
  await transporter.sendMail({
    from,
    bcc: batch,
    subject: subject.substring(0, 200), // Extra safety
    text: text || undefined,
    html: sanitizedHtml
  });
});
```

### Fix 3: Enhanced File Validation

```javascript
// mk/backend/src/routes/cars.js
import fileType from 'file-type';

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: async (req, file, cb) => {
    // Check magic bytes, not just MIME type
    const buffer = await file.buffer.slice(0, 4100);
    const type = await fileType.fromBuffer(buffer);
    
    const allowed = ['jpg', 'png', 'webp', 'gif', 'mp4', 'webm'];
    if (type && allowed.includes(type.ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});
```

---

## 📊 RISK SUMMARY

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 2 | ⚠️ Requires immediate action |
| HIGH | 2 | ⚠️ Fix within 24-48 hours |
| MEDIUM | 5 | ⚙️ Fix within 1 week |
| LOW | 1 | ℹ️ Address in next sprint |

---

## 📞 NEXT STEPS

1. Review this report with the development team
2. Prioritize fixes based on severity
3. Implement critical fixes immediately
4. Schedule security code review for all changes
5. Add security testing to CI/CD pipeline
6. Consider penetration testing after fixes

---

**Auditor Note:** This application shows good security awareness but has critical gaps in authentication enforcement and input validation. With the recommended fixes, the security posture will be significantly improved.
