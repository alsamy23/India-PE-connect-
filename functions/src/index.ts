import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
admin.initializeApp();

/**
 * Configuration interface for Transactional Email Providers
 */
interface EmailConfig {
  resendApiKey?: string;
  brevoApiKey?: string;
  fromEmail: string;
  appName: string;
  appUrl: string;
  webhookUrl?: string;
}

/**
 * Retrieve active email configuration from environment or secrets
 */
function getEmailConfig(): EmailConfig {
  return {
    resendApiKey: process.env.RESEND_API_KEY,
    brevoApiKey: process.env.BREVO_API_KEY,
    fromEmail: process.env.FROM_EMAIL || "Smart PE India <welcome@smartpeindia.app>",
    appName: process.env.APP_NAME || "Smart PE India",
    appUrl: process.env.APP_URL || "https://smartpeindia.app",
    webhookUrl: process.env.WELCOME_API_WEBHOOK_URL
  };
}

/**
 * Generate high-converting, responsive HTML email template for newly registered educators
 */
function buildPersonalizedWelcomeEmail(
  name: string,
  email: string,
  appName: string,
  appUrl: string
): { subject: string; html: string; text: string } {
  const safeName = name && name.trim() ? name.trim() : (email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "Physical Education Educator");
  const subject = `Welcome to Smart PE India, ${safeName} — Your 1-Year Free Founding Educator Pass is Active! 🏆`;

  const html = `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${subject}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }
    table { border-collapse: separate; }
    a { color: #0D2B52; text-decoration: none; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #f1f5f9; padding: 24px 0 36px 0; }
    .main { background-color: #ffffff; margin: 0 auto; max-width: 620px; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #0D2B52 0%, #153e75 50%, #0a203d 100%); padding: 40px 32px 32px 32px; text-align: center; color: #ffffff; }
    .badge { display: inline-block; background-color: #D4A017; color: #0D2B52; font-weight: 800; font-size: 11px; text-transform: uppercase; padding: 5px 16px; border-radius: 9999px; letter-spacing: 1px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(212, 160, 23, 0.4); }
    .brand-title { font-size: 28px; font-weight: 900; margin: 0 0 6px 0; letter-spacing: -0.5px; text-transform: uppercase; color: #ffffff; }
    .brand-slogan { font-size: 13px; font-weight: 700; color: #D4A017; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 10px 0; }
    .brand-subtitle { font-size: 14px; opacity: 0.92; margin: 0; color: #e2e8f0; line-height: 1.4; }
    .content { padding: 36px 32px; line-height: 1.7; font-size: 15px; color: #334155; }
    .greeting { font-size: 18px; font-weight: 800; color: #0D2B52; margin: 0 0 16px 0; }
    .intro-p { font-size: 15px; line-height: 1.65; color: #334155; margin: 0 0 20px 0; }
    .hero-banner { background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #D4A017; border-radius: 12px; padding: 18px 20px; margin: 24px 0 28px 0; }
    .hero-banner-title { font-size: 15px; font-weight: 800; color: #0D2B52; margin: 0 0 6px 0; }
    .hero-banner-desc { font-size: 13px; color: #475569; margin: 0; line-height: 1.5; }
    .section-heading { font-size: 16px; font-weight: 800; color: #0D2B52; text-transform: uppercase; letter-spacing: 0.5px; margin: 28px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f1f5f9; }
    .benefit-card { margin-bottom: 12px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; }
    .benefit-icon-td { width: 36px; vertical-align: top; padding-top: 2px; }
    .benefit-content-td { vertical-align: top; padding-left: 12px; }
    .benefit-name { font-size: 14px; font-weight: 800; color: #0D2B52; margin: 0 0 3px 0; }
    .benefit-desc { font-size: 13px; color: #64748b; margin: 0; line-height: 1.5; }
    .cta-container { text-align: center; margin: 36px 0 28px 0; }
    .cta-btn { background-color: #0D2B52; color: #ffffff !important; text-decoration: none; padding: 16px 36px; font-size: 15px; font-weight: 800; border-radius: 10px; display: inline-block; letter-spacing: 0.5px; box-shadow: 0 4px 14px rgba(13, 43, 82, 0.35); text-transform: uppercase; }
    .checklist-box { background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 18px 20px; margin: 28px 0; }
    .checklist-title { font-size: 14px; font-weight: 800; color: #166534; margin: 0 0 10px 0; }
    .checklist-item { font-size: 13px; color: #15803d; margin: 6px 0; line-height: 1.5; }
    .founder-card { margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; }
    .founder-name { font-size: 15px; font-weight: 800; color: #0D2B52; margin: 0; }
    .founder-title { font-size: 13px; color: #64748b; margin: 2px 0 0 0; }
    .footer { background-color: #091D38; padding: 32px 24px; text-align: center; font-size: 12px; color: #94a3b8; line-height: 1.6; }
    .footer a { color: #D4A017; text-decoration: none; font-weight: 600; }
    .footer-links { margin: 12px 0 16px 0; }
    .footer-links a { margin: 0 8px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center">
          <div class="main">
            <!-- Header Banner -->
            <div class="header">
              <div class="badge">1-Year Free Founding Pass Active</div>
              <h1 class="brand-title">Smart PE India</h1>
              <p class="brand-slogan">Plan Smarter. Teach Better.</p>
              <p class="brand-subtitle">India's #1 AI Platform for Physical Education Teachers & Sports Departments</p>
            </div>

            <!-- Main Content Area -->
            <div class="content">
              <!-- Personalized Greeting -->
              <p class="greeting">Dear ${safeName},</p>
              
              <p class="intro-p">
                Welcome to <strong>Smart PE India</strong>! We are thrilled to partner with you in modernizing physical education across India.
              </p>

              <!-- Highlight Pass Activation Card -->
              <div class="hero-banner">
                <div class="hero-banner-title">🌟 Your 1-Year Free Founding Educator Pass is Activated!</div>
                <p class="hero-banner-desc">
                  You have unlocked complete, unrestricted access to India's premier AI curriculum generator, assessment engine, and sports management suite.
                </p>
              </div>

              <!-- Key Benefits Section -->
              <div class="section-heading">⚡ Key Benefits of Your Smart PE India Portal:</div>

              <!-- Benefit 1: AI Lesson Planner -->
              <div class="benefit-card">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td class="benefit-icon-td">
                      <div style="background-color: #eff6ff; color: #0D2B52; width: 32px; height: 32px; border-radius: 8px; text-align: center; line-height: 32px; font-size: 16px;">⚡</div>
                    </td>
                    <td class="benefit-content-td">
                      <div class="benefit-name">AI PE Lesson Planner & Drill Generator</div>
                      <p class="benefit-desc">Generate structured 40-minute lesson plans aligned with CBSE, ICSE & State boards in under 60 seconds with age-appropriate warm-ups and safety protocols.</p>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Benefit 2: Khelo India Fitness Battery -->
              <div class="benefit-card">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td class="benefit-icon-td">
                      <div style="background-color: #fefce8; color: #854d0e; width: 32px; height: 32px; border-radius: 8px; text-align: center; line-height: 32px; font-size: 16px;">🏆</div>
                    </td>
                    <td class="benefit-content-td">
                      <div class="benefit-name">Official Khelo India & SAI Assessment Battery</div>
                      <p class="benefit-desc">Record fitness tests, calculate instant SAI percentile scores, track BMI ratings, and print inspection-ready student health report cards with 1 click.</p>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Benefit 3: Theory & Exam Paper Maker -->
              <div class="benefit-card">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td class="benefit-icon-td">
                      <div style="background-color: #f0fdf4; color: #166534; width: 32px; height: 32px; border-radius: 8px; text-align: center; line-height: 32px; font-size: 16px;">📝</div>
                    </td>
                    <td class="benefit-content-td">
                      <div class="benefit-name">CBSE Theory Master & Exam Question Paper Maker</div>
                      <p class="benefit-desc">Generate complete board-pattern PE question papers for Classes 9–12 with comprehensive answer keys, marking schemes, and blueprint alignment.</p>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Benefit 4: Principal & Department Dashboard -->
              <div class="benefit-card">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td class="benefit-icon-td">
                      <div style="background-color: #faf5ff; color: #6b21a8; width: 32px; height: 32px; border-radius: 8px; text-align: center; line-height: 32px; font-size: 16px;">📊</div>
                    </td>
                    <td class="benefit-content-td">
                      <div class="benefit-name">Principal & Management Inspection Dashboard</div>
                      <p class="benefit-desc">Generate executive summary reports, school-wide physical literacy metrics, and teacher workload schedules to demonstrate program excellence.</p>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Benefit 5: Tournament & Fixtures Maker -->
              <div class="benefit-card">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td class="benefit-icon-td">
                      <div style="background-color: #fff1f2; color: #9f1239; width: 32px; height: 32px; border-radius: 8px; text-align: center; line-height: 32px; font-size: 16px;">🏅</div>
                    </td>
                    <td class="benefit-content-td">
                      <div class="benefit-name">Tournament Fixture & Sports Day Manager</div>
                      <p class="benefit-desc">Build knockout brackets (with official bye calculations), round-robin leagues, and Sports Day point tables with exportable PDF & image sheets.</p>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Benefit 6: AI Biomechanics Lab -->
              <div class="benefit-card">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td class="benefit-icon-td">
                      <div style="background-color: #f0f9ff; color: #075985; width: 32px; height: 32px; border-radius: 8px; text-align: center; line-height: 32px; font-size: 16px;">🏃</div>
                    </td>
                    <td class="benefit-content-td">
                      <div class="benefit-name">AI Sports Biomechanics & Skill Lab</div>
                      <p class="benefit-desc">Analyze athlete technique cues, common faults, and corrective drills across athletics, football, cricket, basketball, and badminton.</p>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Quick Start Steps -->
              <div class="checklist-box">
                <div class="checklist-title">🚀 3 Quick Steps to Get Started:</div>
                <div class="checklist-item"><strong>1.</strong> Click the button below to launch your digital PE portal.</div>
                <div class="checklist-item"><strong>2.</strong> Generate your first AI Lesson Plan or calculate a student's Khelo India test score.</div>
                <div class="checklist-item"><strong>3.</strong> Bookmark <a href="${appUrl}" style="color: #15803d; font-weight: bold;">${appUrl.replace(/^https?:\/\//, "")}</a> on your phone or laptop for daily PE class planning.</div>
              </div>

              <!-- Primary CTA -->
              <div class="cta-container">
                <a href="${appUrl}" class="cta-btn">Launch Your PE Portal Now →</a>
              </div>

              <!-- Founder Signature Note -->
              <div class="founder-card">
                <p style="margin: 0 0 6px 0; font-size: 14px; color: #475569;">
                  <strong>Need assistance or custom school onboarding?</strong>
                </p>
                <p style="margin: 0 0 16px 0; font-size: 13px; color: #64748b;">
                  Feel free to reply directly to this email or reach out to us at <a href="mailto:contact@smartpeindia.app" style="color: #0D2B52; font-weight: bold;">contact@smartpeindia.app</a>. We are dedicated to supporting every Physical Education teacher across India.
                </p>
                <p class="founder-name">Lurtha Samy (L. Samy)</p>
                <p class="founder-title">Founder & Physical Education Educator • ${appName}</p>
              </div>
            </div>

            <!-- Footer -->
            <div class="footer">
              <p style="margin: 0 0 6px 0; font-weight: 800; color: #ffffff; font-size: 14px;">${appName}</p>
              <p style="margin: 0 0 10px 0; color: #94a3b8;">
                Empowering Physical Educators across India with AI Curriculum, Khelo India Assessments & Sports Analytics.
              </p>
              <div class="footer-links">
                <a href="${appUrl}">Portal Home</a> •
                <a href="${appUrl}/#curriculum">Curriculum</a> •
                <a href="${appUrl}/#khelo-india">Khelo India</a> •
                <a href="${appUrl}/#privacy">Privacy Policy</a> •
                <a href="mailto:contact@smartpeindia.app">Contact Support</a>
              </div>
              <p style="margin: 0; font-size: 11px; color: #64748b;">
                © 2026 ${appName}. All rights reserved. You are receiving this because your account was registered on ${appUrl.replace(/^https?:\/\//, "")}.
              </p>
            </div>
          </div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `;

  const text = `
Dear ${safeName},

Welcome to ${appName}! Your 1-Year Free Founding Educator Pass has been activated for ${email}.

🌟 Key Benefits of Your Smart PE India Portal:
1. ⚡ AI PE Lesson Planner & Drill Generator — Generate CBSE/ICSE/State aligned lesson plans in under 60 seconds with diagrams and safety cues.
2. 🏆 Official Khelo India & SAI Assessment Battery — Instant SAI fitness scores, BMI percentiles, and printable student health report cards.
3. 📝 CBSE Theory Master & Exam Question Paper Maker — Board-pattern PE question papers with ready-to-use answer keys for Classes 9–12.
4. 📊 Principal & Management Inspection Dashboard — Inspection-ready physical literacy reports and workload schedules.
5. 🏅 Tournament & Sports Day Manager — Knockout brackets with bye calculations and round-robin league schedules.
6. 🏃 AI Sports Biomechanics Lab — Movement analysis and coaching cues for athletics, football, and cricket.

Launch your PE portal anytime at: ${appUrl}

Need help or custom school onboarding? Contact Founder L. Samy directly at contact@smartpeindia.app.

Best regards,
Lurtha Samy (L. Samy)
Founder & PE Educator
${appName} (${appUrl})
  `;

  return { subject, html, text };
}

/**
 * Dispatch email via Resend REST API (https://api.resend.com/emails)
 */
async function sendViaResend(
  apiKey: string,
  fromEmail: string,
  toEmail: string,
  subject: string,
  html: string,
  text: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject,
        html,
        text
      })
    });

    const result = await response.json();
    if (response.ok) {
      return { success: true, data: result };
    }
    return { success: false, error: result?.message || JSON.stringify(result) };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to reach Resend API" };
  }
}

/**
 * Dispatch email via Brevo REST API (https://api.brevo.com/v3/smtp/email)
 */
async function sendViaBrevo(
  apiKey: string,
  fromEmail: string,
  toEmail: string,
  subject: string,
  html: string,
  text: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const senderEmail = fromEmail.match(/<([^>]+)>/)?.[1] || fromEmail;
    const senderName = fromEmail.replace(/<[^>]+>/, "").trim() || "Smart PE India";

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: toEmail }],
        subject,
        htmlContent: html,
        textContent: text
      })
    });

    const result = await response.json();
    if (response.ok) {
      return { success: true, data: result };
    }
    return { success: false, error: result?.message || JSON.stringify(result) };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to reach Brevo API" };
  }
}

/**
 * Dispatch email via Custom App Webhook REST API
 */
async function sendViaWebhook(
  webhookUrl: string,
  toEmail: string,
  recipientName: string,
  uid: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        toEmail,
        recipientName,
        uid,
        source: "firebase-cloud-function-auth-trigger"
      })
    });

    const result = await response.json();
    if (response.ok) {
      return { success: true, data: result };
    }
    return { success: false, error: result?.error || "Webhook failed" };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to reach Webhook URL" };
  }
}

/**
 * AUTOMATED TRIGGER FUNCTION: sendPersonalizedWelcomeEmail
 * Listens to the Firebase Auth User Creation event (auth.user().onCreate)
 * and invokes Resend / Brevo / Webhook REST API to deliver the welcome message.
 */
export const sendPersonalizedWelcomeEmail = functions.auth
  .user()
  .onCreate(async (user: admin.auth.UserRecord) => {
    const { uid, email, displayName } = user;

    if (!email) {
      functions.logger.warn(`[Auth Trigger] User ${uid} has no email address. Skipping welcome email.`);
      return;
    }

    functions.logger.info(`[Auth Trigger] Processing new user registration for ${email} (UID: ${uid})`);

    const config = getEmailConfig();
    const recipientName = displayName || email.split("@")[0];
    const { subject, html, text } = buildPersonalizedWelcomeEmail(
      recipientName,
      email,
      config.appName,
      config.appUrl
    );

    const db = admin.firestore();
    const mailLogRef = db.collection("mail_logs").doc(`welcome_${uid}`);

    // Check if welcome email was already dispatched to prevent duplicate sends
    const existingLog = await mailLogRef.get();
    if (existingLog.exists && existingLog.data()?.status === "sent") {
      functions.logger.info(`[Auth Trigger] Welcome email already sent to ${email}. Skipping.`);
      return;
    }

    let dispatchResult: { success: boolean; provider: string; data?: any; error?: string };

    // 1. Try Resend REST API if configured
    if (config.resendApiKey) {
      functions.logger.info(`[Auth Trigger] Dispatching via Resend REST API for ${email}...`);
      const resendRes = await sendViaResend(
        config.resendApiKey,
        config.fromEmail,
        email,
        subject,
        html,
        text
      );
      dispatchResult = { ...resendRes, provider: "resend" };
    }
    // 2. Try Brevo REST API if configured
    else if (config.brevoApiKey) {
      functions.logger.info(`[Auth Trigger] Dispatching via Brevo REST API for ${email}...`);
      const brevoRes = await sendViaBrevo(
        config.brevoApiKey,
        config.fromEmail,
        email,
        subject,
        html,
        text
      );
      dispatchResult = { ...brevoRes, provider: "brevo" };
    }
    // 3. Try App REST Webhook URL if configured
    else if (config.webhookUrl) {
      functions.logger.info(`[Auth Trigger] Dispatching via App Webhook REST API for ${email}...`);
      const webhookRes = await sendViaWebhook(
        config.webhookUrl,
        email,
        recipientName,
        uid
      );
      dispatchResult = { ...webhookRes, provider: "webhook" };
    }
    // 4. Simulated Fallback (Logs payload for development environment)
    else {
      functions.logger.warn(
        `[Auth Trigger] No RESEND_API_KEY, BREVO_API_KEY, or WELCOME_API_WEBHOOK_URL found in environment. Email simulated for ${email}.`
      );
      dispatchResult = {
        success: true,
        provider: "simulated",
        data: { message: "Simulated dispatch - configure RESEND_API_KEY or BREVO_API_KEY in functions config" }
      };
    }

    // Save audit log to Firestore for traceability
    try {
      await mailLogRef.set({
        uid,
        email,
        recipientName,
        subject,
        provider: dispatchResult.provider,
        status: dispatchResult.success ? "sent" : "failed",
        error: dispatchResult.error || null,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        triggeredBy: "auth.user().onCreate"
      });
      functions.logger.info(`[Auth Trigger] Audit log recorded for UID ${uid} in collection 'mail_logs'.`);
    } catch (logErr) {
      functions.logger.error("[Auth Trigger] Failed to write Firestore mail log:", logErr);
    }

    if (dispatchResult.success) {
      functions.logger.info(`[Auth Trigger] Welcome email successfully sent to ${email} via ${dispatchResult.provider}`);
    } else {
      functions.logger.error(`[Auth Trigger] Failed to send welcome email to ${email}:`, dispatchResult.error);
    }
  });
