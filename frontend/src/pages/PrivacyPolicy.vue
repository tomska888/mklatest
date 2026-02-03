<template>
  <section class="legal-page">
    <div class="container">
      <!-- Hero -->
      <header class="hero-block">
        <h1 class="title">Privacy Policy</h1>
        <p class="subtitle">Last updated: {{ lastUpdated }}</p>
      </header>

      <!-- Content -->
      <article class="legal-content">
        <section class="section">
          <h2>1. Introduction</h2>
          <p>MK Automobile ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.</p>
        </section>

        <section class="section">
          <h2>2. Information We Collect</h2>
          <h3>2.1 Personal Information</h3>
          <p>We may collect personal information that you voluntarily provide to us when you:</p>
          <ul>
            <li>Register for an account</li>
            <li>Submit an inquiry about a vehicle</li>
            <li>Subscribe to our newsletter</li>
            <li>Contact us through our contact form</li>
            <li>Request a test drive</li>
          </ul>
          <p>This information may include:</p>
          <ul>
            <li>Name and contact information (email address, phone number)</li>
            <li>Account credentials (username, password)</li>
            <li>Vehicle preferences and inquiry details</li>
            <li>Communication records</li>
          </ul>

          <h3>2.2 Automatically Collected Information</h3>
          <p>When you visit our website, we may automatically collect certain information about your device and browsing activity, including:</p>
          <ul>
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Operating system</li>
            <li>Pages visited and time spent on pages</li>
            <li>Referring website addresses</li>
          </ul>
        </section>

        <section class="section">
          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Process your inquiries and respond to your requests</li>
            <li>Send you newsletters and marketing communications (with your consent)</li>
            <li>Manage your account and provide customer support</li>
            <li>Analyze website usage and improve user experience</li>
            <li>Detect, prevent, and address technical issues or fraud</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section class="section">
          <h2>4. Legal Basis for Processing (GDPR)</h2>
          <p>If you are from the European Economic Area (EEA), our legal basis for collecting and using your personal information depends on the data and context:</p>
          <ul>
            <li><strong>Consent:</strong> You have given clear consent for us to process your personal data for a specific purpose (e.g., newsletter subscription)</li>
            <li><strong>Contract:</strong> Processing is necessary for a contract we have with you</li>
            <li><strong>Legal obligation:</strong> Processing is necessary to comply with the law</li>
            <li><strong>Legitimate interests:</strong> Processing is necessary for our legitimate interests (e.g., improving our services)</li>
          </ul>
        </section>

        <section class="section">
          <h2>5. Data Sharing and Disclosure</h2>
          <p>We do not sell your personal information. We may share your information with:</p>
          <ul>
            <li><strong>Service providers:</strong> Third-party vendors who perform services on our behalf (e.g., email delivery, analytics)</li>
            <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
            <li><strong>Business transfers:</strong> In connection with a merger, sale, or acquisition</li>
          </ul>
        </section>

        <section class="section">
          <h2>6. Data Security</h2>
          <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.</p>
        </section>

        <section class="section">
          <h2>7. Data Retention</h2>
          <p>We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When data is no longer needed, we will securely delete or anonymize it.</p>
        </section>

        <section class="section">
          <h2>8. Your Rights</h2>
          <p>Depending on your location, you may have the following rights regarding your personal data:</p>
          <ul>
            <li><strong>Access:</strong> Request access to your personal data</li>
            <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
            <li><strong>Deletion:</strong> Request deletion of your personal data</li>
            <li><strong>Restriction:</strong> Request restriction of processing your data</li>
            <li><strong>Portability:</strong> Request transfer of your data to another organization</li>
            <li><strong>Objection:</strong> Object to processing of your personal data</li>
            <li><strong>Withdraw consent:</strong> Withdraw consent at any time (where processing is based on consent)</li>
          </ul>
          <p>To exercise any of these rights, please contact us using the information provided below.</p>
        </section>

        <section class="section">
          <h2>9. Cookies and Tracking Technologies</h2>
          <p>We use cookies and similar tracking technologies to enhance your browsing experience and analyze website traffic. You can control cookie settings through your browser preferences. Please note that disabling cookies may affect website functionality.</p>
        </section>

        <section class="section">
          <h2>10. Third-Party Links</h2>
          <p>Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies before providing any personal information.</p>
        </section>

        <section class="section">
          <h2>11. Children's Privacy</h2>
          <p>Our services are not directed to individuals under the age of 16. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.</p>
        </section>

        <section class="section">
          <h2>12. Changes to This Privacy Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.</p>
        </section>

        <section class="section">
          <h2>13. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
          <div class="contact-info">
            <p><strong>MK Automobile</strong></p>
            <p>Volkmarsen, Germany</p>
            <p>Email: <a href="mailto:info@mk-automobile.de">info@mk-automobile.de</a></p>
            <p>Phone: +49 5693 8029580</p>
          </div>
        </section>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';

const lastUpdated = computed(() => {
  const date = new Date('2026-02-03');
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
});
</script>

<style scoped>
.legal-page {
  padding-top: 1rem;
  padding-bottom: 2rem;
}

.hero-block {
  text-align: center;
  margin: 1.25rem 0 2rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1.5rem;
}

.title {
  font-size: 44px;
  line-height: 1.2;
  margin: 0 0 0.5rem;
  font-weight: 500;
  color: #0b1b2b;
  letter-spacing: 0;
}

.subtitle {
  color: #64748b;
  font-size: 0.95rem;
  margin: 0;
}

.legal-content {
  max-width: 900px;
  margin: 0 auto;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(2, 6, 23, 0.05);
}

.section {
  margin-bottom: 2rem;
}

.section:last-child {
  margin-bottom: 0;
}

.section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.section h3 {
  font-size: 1.15rem;
  font-weight: 600;
  color: #1e293b;
  margin: 1.25rem 0 0.75rem;
}

.section p {
  color: #334155;
  line-height: 1.7;
  margin: 0 0 1rem;
}

.section p:last-child {
  margin-bottom: 0;
}

.section ul {
  margin: 0.75rem 0 1rem;
  padding-left: 1.5rem;
  color: #334155;
}

.section li {
  margin-bottom: 0.5rem;
  line-height: 1.7;
}

.section li:last-child {
  margin-bottom: 0;
}

.section strong {
  color: #0f172a;
  font-weight: 600;
}

.contact-info {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.25rem;
  margin-top: 1rem;
}

.contact-info p {
  margin: 0 0 0.5rem;
}

.contact-info p:last-child {
  margin-bottom: 0;
}

.contact-info a {
  color: #2563eb;
  text-decoration: none;
  transition: color 0.16s ease;
}

.contact-info a:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .title {
    font-size: 36px;
  }

  .legal-content {
    padding: 1.5rem;
  }

  .section h2 {
    font-size: 1.35rem;
  }

  .section h3 {
    font-size: 1.1rem;
  }
}

@media (max-width: 520px) {
  .title {
    font-size: 30px;
  }

  .legal-content {
    padding: 1.25rem;
  }
}
</style>
