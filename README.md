# AM Automobile – Vite Vue 3 + Express + MySQL (Hostinger-ready)

Monorepo providing a full car shop website with filters, details, admin panel, newsletter, and company pages.

Structure:
- [backend](backend/): Express API, static hosting for built frontend, file uploads, MySQL
- [frontend](frontend/): Vite + Vue 3 SPA (Vue Router + Pinia), responsive UI

Key files:
- [backend/src/index.js](backend/src/index.js): Express server entry
- [backend/src/db.js](backend/src/db.js): MySQL pool and schema init
- [backend/sql/schema.sql](backend/sql/schema.sql): Database schema
- [backend/.env.example](backend/.env.example): Environment variable template
- [backend/src/routes](backend/src/routes): API routes (auth, cars, newsletter, company)
- [frontend/index.html](frontend/index.html): Vite HTML entry
- [frontend/src/main.js](frontend/src/main.js): SPA bootstrap
- [frontend/src/router/index.js](frontend/src/router/index.js): App routes (public + admin)

Features
- Public: Home with hero slider + featured cars, cars list with left filter sidebar, car detail page, about & contact (Leaflet map), newsletter subscription.
- Auth: Register/Login with JWT; client-side route guards. Promote a user to owner/admin/employee via DB.
- Admin: Cars CRUD, media upload (images/videos stored under backend/public/uploads), company info edit, newsletter send + list subscribers.

Local development (Windows cmd.exe)
1) Clone your repo and enter the project directory
   - git clone https://github.com/tomska888/MKAvue.git
   - cd MKAvue

2) Install dependencies (backend + frontend)
   - cd backend && npm install && cd ..
   - cd frontend && npm install && cd ..

3) Create the database schema (using any local MySQL or your Hostinger DB)
   - Create a database (e.g., am_auto)
   - Import [backend/sql/schema.sql](backend/sql/schema.sql) via phpMyAdmin or mysql client

4) Configure environment variables
   - Copy [backend/.env.example](backend/.env.example) to backend/.env and fill values

5) Run API
   - cd backend
   - npm run dev
   API: http://localhost:3000/api/health

6) Run SPA
   - cd frontend
   - npm run dev
   App: http://localhost:5173 (proxy to /api -> http://localhost:3000)

Production build steps (locally)
- cd frontend && npm run build
- cd backend && npm run sync-frontend (copies frontend/dist to backend/public)
- Start server: node src/index.js

Hostinger deployment (Shared Hosting Node.js App + MySQL)
1) Upload the repository to your hosting account (via File Manager/FTP) preserving the monorepo structure so backend and frontend folders are siblings.

2) Create MySQL database and user in hPanel
   - hPanel -> Databases -> MySQL Databases
   - Note the DB Name, Username, Password
   - Open phpMyAdmin and import [backend/sql/schema.sql](backend/sql/schema.sql)

3) Create a Node.js App in hPanel
   - hPanel -> Advanced -> Node.js
   - Create Application:
     - Application root: backend
     - Application startup file: src/index.js
     - Node.js version: 18+

4) Set environment variables in App -> Environment Variables
   - Copy from [backend/.env.example](backend/.env.example)
   - Required: DATABASE_HOST, DATABASE_PORT, DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME, JWT_SECRET, SMTP_* (if newsletter), COMPANY_*
   - On shared Hostinger MySQL, DATABASE_HOST is usually localhost

5) Install dependencies (hPanel does this in the App root)
   - Click Install Dependencies
   - The backend/package.json has a postinstall that will:
     - npm --prefix ../frontend install
     - npm --prefix ../frontend run build
     - Sync build to backend/public

6) Start the application
   - Click Start or Restart in the Node.js App page
   - Open the Application URL

7) Map your domain/subdomain to the Node.js app
   - hPanel -> Domains -> Manage -> Node.js App -> Attach Domain (if applicable)

Create an owner/admin account
- Register a user via the site (Register page)
- In phpMyAdmin, run:
  UPDATE users SET role = 'owner' WHERE email = 'your@email.here';
- Owner role grants full admin access; alternatively use 'admin' or 'employee'.

API endpoints (quick ref)
- Auth: POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
- Cars: GET /api/cars (filters, sort, pagination), GET /api/cars/:id
- Admin Cars: POST /api/cars, PUT /api/cars/:id, DELETE /api/cars/:id
- Media: POST /api/cars/:id/media (files[]), DELETE /api/cars/:id/media/:mediaId
- Newsletter: POST /api/newsletter/subscribe, GET /api/newsletter/subscribers, POST /api/newsletter/send
- Company: GET /api/company, PUT /api/company

Notes
- Uploads are saved to backend/public/uploads and served statically; do not commit these to git.
- Max upload size currently 50MB per file; adjust in [backend/src/routes/cars.js](backend/src/routes/cars.js).
- JWT secret must be long and random in production.
- Newsletter requires working SMTP credentials (Hostinger Email -> SMTP details) and SPF/DKIM set up on your domain for better deliverability.

Smoke test after deploy
- Open /api/health -> { ok: true, db: true }
- Register a user, promote to owner via DB
- Login, open /admin
- Create a car, upload images/videos
- Mark featured, verify Home shows featured cars and list page filters work
- Subscribe with email in footer; send a newsletter from Admin -> Newsletter

Troubleshooting
- If postinstall fails, manually build frontend and sync:
  - cd frontend && npm install && npm run build
  - cd backend && node scripts/sync-frontend.js
- Check logs in hPanel Node.js App for errors
- Validate .env values and DB connectivity using /api/health
