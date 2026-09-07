"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPersonalizedWelcomeEmail = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin SDK
admin.initializeApp();
/**
 * Retrieve active email configuration from environment or secrets
 */
function getEmailConfig() {
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
function buildPersonalizedWelcomeEmail(name, email, appName, appUrl) {
    const safeName = name || (email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "Physical Education Educator");
    const subject = `Welcome to ${appName} — Your 1-Year Free Founding Educator Pass is Active! 🏆`;
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f6f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; }
    .container { max-width: 600px; margin: 24px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #0D2B52 0%, #1e3a8a 100%); padding: 36px 24px; text-align: center; color: #ffffff; }
    .badge { display: inline-block; background-color: #D4A017; color: #0D2B52; font-weight: 800; font-size: 11px; text-transform: uppercase; padding: 4px 14px; border-radius: 20px; letter-spacing: 1px; margin-bottom: 14px; }
    .title { font-size: 24px; font-weight: 800; margin: 0 0 6px 0; letter-spacing: -0.5px; }
    .subtitle { font-size: 14px; opacity: 0.9; margin: 0; color: #cbd5e1; }
    .content { padding: 32px 28px; line-height: 1.65; font-size: 15px; color: #334155; }
    .highlight-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #D4A017; border-radius: 12px; padding: 18px 20px; margin: 24px 0; }
    .feature-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .feature-table td { padding: 10px 0; vertical-align: top; border-bottom: 1px solid #f1f5f9; }
    .feature-icon { font-size: 20px; width: 32px; }
    .btn-container { text-align: center; margin: 32px 0 24px 0; }
    .btn-primary { background-color: #0D2B52; color: #ffffff !important; text-decoration: none; padding: 15px 34px; font-size: 15px; font-weight: 700; border-radius: 10px; display: inline-block; box-shadow: 0 4px 12px rgba(13,43,82,0.25); }
    .founder-note { margin-top: 28px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 14px; color: #475569; }
    .footer { background-color: #091D38; padding: 24px; text-align: center; font-size: 12px; color: #94a3b8; }
    .footer a { color: #D4A017; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="badge">1-Year Free Founding Pass Activated</div>
      <h1 class="title">Welcome to ${appName}</h1>
      <p class="subtitle">India's #1 AI Platform for Physical Education Teachers & Schools</p>
    </div>

    <!-- Body -->
    <div class="content">
      <p>Dear <strong>${safeName}</strong>,</p>
      
      <p>Welcome to <strong>${appName}</strong>! Your account registration was successful, and we are excited to empower your school's physical education program.</p>

      <div class="highlight-card">
        <strong style="color: #0D2B52; font-size: 15px;">🌟 Your Full Access is Ready:</strong>
        <p style="margin: 6px 0 0 0; font-size: 14px; color: #475569;">You have unlocked the full suite of AI curriculum builders and assessment engines designed specifically for CBSE, ICSE, and Khelo India standards.</p>
      </div>

      <h3 style="color: #0D2B52; font-size: 16px; margin: 24px 0 12px 0;">⚡ Key Features Available in Your Portal:</h3>
      <table class="feature-table">
        <tr>
          <td class="feature-icon">⚡</td>
          <td><strong>AI PE Lesson Planner</strong> — Generate complete CBSE/ICSE aligned lesson plans with warm-ups & drills in seconds.</td>
        </tr>
        <tr>
          <td class="feature-icon">🏆</td>
          <td><strong>Khelo India Assessment Calculator</strong> — Instant SAI fitness scores, BMI percentiles, and printable student health report cards.</td>
        </tr>
        <tr>
          <td class="feature-icon">📝</td>
          <td><strong>Theory Master & Exam Maker</strong> — Board-pattern PE question papers with answer keys for Classes 9–12.</td>
        </tr>
        <tr>
          <td class="feature-icon">📊</td>
          <td><strong>Principal Inspection Dashboard</strong> — Inspection-ready physical literacy and fitness reports for school leaders.</td>
        </tr>
        <tr>
          <td class="feature-icon">🏃</td>
          <td><strong>Sports AI Biomechanics Lab</strong> — Compare and correct athlete movement cues across athletics, football, and cricket.</td>
        </tr>
      </table>

      <div class="btn-container">
        <a href="${appUrl}" class="btn-primary">Launch Your PE Portal Now →</a>
      </div>

      <div class="founder-note">
        <p style="margin: 0 0 4px 0;"><strong>Need Help or Custom School Setup?</strong></p>
        <p style="margin: 0; color: #64748b;">Feel free to reply directly to this email or reach out to us at <a href="mailto:contact@smartpeindia.app" style="color: #0D2B52; font-weight: bold;">contact@smartpeindia.app</a>.</p>
        <br>
        <p style="margin: 0; font-weight: bold; color: #0D2B52;">Lurtha Samy (L. Samy)</p>
        <p style="margin: 0; font-size: 13px; color: #64748b;">Founder & Physical Education Educator • ${appName}</p>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p style="margin: 0 0 8px 0;"><strong>${appName}</strong> (${appUrl.replace(/^https?:\/\//, "")})</p>
      <p style="margin: 0 0 8px 0;">Empowering Physical Educators across India with AI Curriculum & Fitness Management.</p>
      <p style="margin: 0;"><a href="${appUrl}">Visit Portal</a> • <a href="${appUrl}/#privacy">Privacy</a> • <a href="mailto:contact@smartpeindia.app">Support</a></p>
    </div>
  </div>
</body>
</html>
  `;
    const text = `
Dear ${safeName},

Welcome to ${appName}! Your 1-Year Free Founding Educator Pass has been activated for ${email}.

What you can do right now with your portal:
1. AI PE Lesson Planner: Generate CBSE/ICSE aligned lesson plans in under 60 seconds.
2. Khelo India Assessment Calculator: Instant SAI fitness scores and printable health cards.
3. Theory Master: Generate board exam papers with marking schemes.
4. Principal Dashboard: Inspection-ready school physical literacy reports.
5. Biomechanics Lab: AI movement analysis for athletics, football, and cricket.

Log in anytime at: ${appUrl}

Need help or custom school setup? Contact Founder L. Samy directly at contact@smartpeindia.app.

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
async function sendViaResend(apiKey, fromEmail, toEmail, subject, html, text) {
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
    }
    catch (err) {
        return { success: false, error: err.message || "Failed to reach Resend API" };
    }
}
/**
 * Dispatch email via Brevo REST API (https://api.brevo.com/v3/smtp/email)
 */
async function sendViaBrevo(apiKey, fromEmail, toEmail, subject, html, text) {
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
    }
    catch (err) {
        return { success: false, error: err.message || "Failed to reach Brevo API" };
    }
}
/**
 * Dispatch email via Custom App Webhook REST API
 */
async function sendViaWebhook(webhookUrl, toEmail, recipientName, uid) {
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
    }
    catch (err) {
        return { success: false, error: err.message || "Failed to reach Webhook URL" };
    }
}
/**
 * AUTOMATED TRIGGER FUNCTION: sendPersonalizedWelcomeEmail
 * Listens to the Firebase Auth User Creation event (auth.user().onCreate)
 * and invokes Resend / Brevo / Webhook REST API to deliver the welcome message.
 */
exports.sendPersonalizedWelcomeEmail = functions.auth
    .user()
    .onCreate(async (user) => {
    const { uid, email, displayName } = user;
    if (!email) {
        functions.logger.warn(`[Auth Trigger] User ${uid} has no email address. Skipping welcome email.`);
        return;
    }
    functions.logger.info(`[Auth Trigger] Processing new user registration for ${email} (UID: ${uid})`);
    const config = getEmailConfig();
    const recipientName = displayName || email.split("@")[0];
    const { subject, html, text } = buildPersonalizedWelcomeEmail(recipientName, email, config.appName, config.appUrl);
    const db = admin.firestore();
    const mailLogRef = db.collection("mail_logs").doc(`welcome_${uid}`);
    // Check if welcome email was already dispatched to prevent duplicate sends
    const existingLog = await mailLogRef.get();
    if (existingLog.exists && existingLog.data()?.status === "sent") {
        functions.logger.info(`[Auth Trigger] Welcome email already sent to ${email}. Skipping.`);
        return;
    }
    let dispatchResult;
    // 1. Try Resend REST API if configured
    if (config.resendApiKey) {
        functions.logger.info(`[Auth Trigger] Dispatching via Resend REST API for ${email}...`);
        const resendRes = await sendViaResend(config.resendApiKey, config.fromEmail, email, subject, html, text);
        dispatchResult = { ...resendRes, provider: "resend" };
    }
    // 2. Try Brevo REST API if configured
    else if (config.brevoApiKey) {
        functions.logger.info(`[Auth Trigger] Dispatching via Brevo REST API for ${email}...`);
        const brevoRes = await sendViaBrevo(config.brevoApiKey, config.fromEmail, email, subject, html, text);
        dispatchResult = { ...brevoRes, provider: "brevo" };
    }
    // 3. Try App REST Webhook URL if configured
    else if (config.webhookUrl) {
        functions.logger.info(`[Auth Trigger] Dispatching via App Webhook REST API for ${email}...`);
        const webhookRes = await sendViaWebhook(config.webhookUrl, email, recipientName, uid);
        dispatchResult = { ...webhookRes, provider: "webhook" };
    }
    // 4. Simulated Fallback (Logs payload for development environment)
    else {
        functions.logger.warn(`[Auth Trigger] No RESEND_API_KEY, BREVO_API_KEY, or WELCOME_API_WEBHOOK_URL found in environment. Email simulated for ${email}.`);
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
    }
    catch (logErr) {
        functions.logger.error("[Auth Trigger] Failed to write Firestore mail log:", logErr);
    }
    if (dispatchResult.success) {
        functions.logger.info(`[Auth Trigger] Welcome email successfully sent to ${email} via ${dispatchResult.provider}`);
    }
    else {
        functions.logger.error(`[Auth Trigger] Failed to send welcome email to ${email}:`, dispatchResult.error);
    }
});
//# sourceMappingURL=index.js.map