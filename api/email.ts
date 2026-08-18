import nodemailer from "nodemailer";

export interface EmailSenderConfig {
  configured: boolean;
  provider: "smtp" | "gmail" | "resend" | "brevo" | "simulated";
  fromEmail: string;
}

export function getEmailConfig(): EmailSenderConfig {
  if (process.env.RESEND_API_KEY) {
    return {
      configured: true,
      provider: "resend",
      fromEmail: process.env.FROM_EMAIL || "Smart PE India <welcome@smartpeindia.app>"
    };
  }

  if (process.env.BREVO_API_KEY) {
    return {
      configured: true,
      provider: "brevo",
      fromEmail: process.env.FROM_EMAIL || "Smart PE India <welcome@smartpeindia.app>"
    };
  }

  if (process.env.GMAIL_USER && (process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASS)) {
    return {
      configured: true,
      provider: "gmail",
      fromEmail: `Smart PE India <${process.env.GMAIL_USER}>`
    };
  }

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return {
      configured: true,
      provider: "smtp",
      fromEmail: process.env.FROM_EMAIL || `Smart PE India <${process.env.SMTP_USER}>`
    };
  }

  return {
    configured: false,
    provider: "simulated",
    fromEmail: process.env.FROM_EMAIL || "Smart PE India <welcome@smartpeindia.app>"
  };
}

export function createTransporter() {
  const config = getEmailConfig();

  if (config.provider === "gmail") {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASS
      }
    });
  }

  if (config.provider === "smtp") {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  return null;
}

export function buildCorporateWelcomeEmail(recipientName: string, schoolName: string): { subject: string; html: string; text: string } {
  const safeName = recipientName || "Physical Education Educator";
  const safeSchool = schoolName || "Partner School";
  const subject = `Welcome to Smart PE India — Your 1-Year Free Founding Pass is Active! 🏆`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f6f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #0D2B52 0%, #1e3a8a 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .logo-img { width: 64px; height: 64px; margin-bottom: 12px; }
    .badge { display: inline-block; background-color: #D4A017; color: #0D2B52; font-weight: 800; font-size: 11px; text-transform: uppercase; padding: 4px 12px; border-radius: 20px; letter-spacing: 1px; margin-bottom: 12px; }
    .title { font-size: 24px; font-weight: 800; margin: 0 0 6px 0; letter-spacing: -0.5px; }
    .subtitle { font-size: 14px; opacity: 0.9; margin: 0; color: #cbd5e1; }
    .content { padding: 32px 28px; line-height: 1.65; font-size: 15px; color: #334155; }
    .highlight-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #D4A017; border-radius: 12px; padding: 18px 20px; margin: 24px 0; }
    .feature-list { margin: 20px 0; padding: 0; list-style: none; }
    .feature-item { padding: 10px 0; border-bottom: 1px solid #f1f5f9; display: flex; align-items: flex-start; }
    .feature-icon { margin-right: 12px; font-size: 18px; line-height: 1; }
    .btn-container { text-align: center; margin: 32px 0 24px 0; }
    .btn-primary { background-color: #0D2B52; color: #ffffff !important; text-decoration: none; padding: 14px 32px; font-size: 15px; font-weight: 700; border-radius: 10px; display: inline-block; box-shadow: 0 4px 12px rgba(13,43,82,0.25); }
    .founder-note { margin-top: 28px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 14px; color: #475569; }
    .footer { background-color: #091D38; padding: 24px; text-align: center; font-size: 12px; color: #94a3b8; }
    .footer a { color: #D4A017; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <img src="https://smartpeindia.app/logo.png" alt="Smart PE India Logo" class="logo-img">
      <br>
      <div class="badge">1-Year Free Founding Pass Activated</div>
      <h1 class="title">Welcome to Smart PE India</h1>
      <p class="subtitle">India's #1 AI Platform for Physical Education Teachers & Schools</p>
    </div>

    <!-- Body -->
    <div class="content">
      <p>Dear <strong>${safeName}</strong>,</p>
      
      <p>Welcome to <strong>Smart PE India</strong>! We are thrilled to have you and <strong>${safeSchool}</strong> join India's fastest-growing digital physical education network.</p>

      <div class="highlight-card">
        <strong style="color: #0D2B52; font-size: 15px;">🌟 Your Full Access is Ready:</strong>
        <p style="margin: 6px 0 0 0; font-size: 14px; color: #475569;">You have unlocked the full suite of AI-powered tools designed specifically for CBSE, ICSE, and Khelo India Physical Education curricula.</p>
      </div>

      <h3 style="color: #0D2B52; font-size: 16px; margin: 24px 0 12px 0;">⚡ What You Can Do Right Now:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; vertical-align: top; width: 28px; font-size: 18px;">⚡</td>
          <td style="padding: 8px 0;"><strong>AI PE Lesson Planner</strong> — Generate complete CBSE/ICSE aligned lesson plans with age-graded warm-ups & drills in 45 seconds.</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; vertical-align: top; font-size: 18px;">🏆</td>
          <td style="padding: 8px 0;"><strong>Khelo India Assessment Calculator</strong> — Instant SAI fitness scores, BMI percentiles, and printable student health cards.</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; vertical-align: top; font-size: 18px;">📝</td>
          <td style="padding: 8px 0;"><strong>Theory Master & Exam Maker</strong> — Board-pattern PE question papers with marking schemes for Classes 9–12.</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; vertical-align: top; font-size: 18px;">📊</td>
          <td style="padding: 8px 0;"><strong>Principal Dashboard</strong> — Inspection-ready physical literacy and fitness reports for school leaders.</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; vertical-align: top; font-size: 18px;">🏃</td>
          <td style="padding: 8px 0;"><strong>Sports AI Biomechanics Lab</strong> — Compare and correct athlete technique cues across athletics, football, and cricket.</td>
        </tr>
      </table>

      <div class="btn-container">
        <a href="https://smartpeindia.app" class="btn-primary">Launch Your PE Portal Now →</a>
      </div>

      <div class="founder-note">
        <p style="margin: 0 0 4px 0;"><strong>Need Help or Custom School Setup?</strong></p>
        <p style="margin: 0; color: #64748b;">Feel free to reply directly to this email or reach out to me at <a href="mailto:contact@smartpeindia.app" style="color: #0D2B52; font-weight: bold;">contact@smartpeindia.app</a>. We are here to support every PE teacher in India.</p>
        <br>
        <p style="margin: 0; font-weight: bold; color: #0D2B52;">Lurtha Samy (L. Samy)</p>
        <p style="margin: 0; font-size: 13px; color: #64748b;">Founder & Physical Education Educator • Smart PE India</p>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p style="margin: 0 0 8px 0;"><strong>Smart PE India (smartpeindia.app)</strong></p>
      <p style="margin: 0 0 8px 0;">Empowering Physical Educators across India with AI Curriculum & Fitness Management.</p>
      <p style="margin: 0;"><a href="https://smartpeindia.app">Visit Website</a> • <a href="https://smartpeindia.app/#privacy">Privacy Policy</a> • <a href="mailto:contact@smartpeindia.app">Support</a></p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Dear ${safeName},

Welcome to Smart PE India! Your 1-Year Free Founding Educator Pass has been activated for ${safeSchool}.

What you can do right now with your portal:
1. AI PE Lesson Planner: Generate CBSE/ICSE aligned lesson plans in under 60 seconds.
2. Khelo India Assessment Calculator: Instant SAI fitness scores and printable health cards.
3. Theory Master: Generate board exam papers with marking schemes.
4. Principal Dashboard: Inspection-ready school physical literacy reports.
5. Biomechanics Lab: AI movement analysis for athletics, football, and cricket.

Log in anytime at: https://smartpeindia.app

Need help or school setup? Contact Founder L. Samy directly at contact@smartpeindia.app.

Best regards,
Lurtha Samy (L. Samy)
Founder & PE Educator
Smart PE India (smartpeindia.app)
  `;

  return { subject, html, text };
}

export function buildCorporateFeatureEmail(featureTitle: string, featureDescription: string, actionUrl?: string): { subject: string; html: string; text: string } {
  const subject = `New on Smart PE India: ${featureTitle} 🚀`;
  const url = actionUrl || "https://smartpeindia.app";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 0; background-color: #f4f6f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: #0D2B52; padding: 28px 24px; text-align: center; color: #ffffff; }
    .content { padding: 32px 28px; line-height: 1.65; font-size: 15px; color: #334155; }
    .btn-primary { background-color: #0D2B52; color: #ffffff !important; text-decoration: none; padding: 14px 32px; font-size: 15px; font-weight: 700; border-radius: 10px; display: inline-block; }
    .footer { background-color: #091D38; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://smartpeindia.app/logo.png" alt="Smart PE India Logo" width="50" height="50">
      <h2 style="margin: 10px 0 0 0; color: #ffffff;">New Feature Announcement</h2>
    </div>
    <div class="content">
      <h2 style="color: #0D2B52; margin-top: 0;">${featureTitle}</h2>
      <p style="font-size: 15px; color: #334155; line-height: 1.7;">${featureDescription}</p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${url}" class="btn-primary">Try Feature on Portal →</a>
      </div>

      <p style="font-size: 14px; color: #64748b; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
        Warm regards,<br>
        <strong>Smart PE India Team</strong><br>
        <a href="https://smartpeindia.app" style="color: #0D2B52;">smartpeindia.app</a>
      </p>
    </div>
    <div class="footer">
      <p style="margin: 0;">Smart PE India • #1 AI Platform for Physical Education Teachers</p>
    </div>
  </div>
</body>
</html>
  `;

  return { subject, html, text: `${featureTitle}\n\n${featureDescription}\n\nAccess it at: ${url}` };
}

export async function dispatchEmail(toEmail: string, subject: string, html: string, text: string): Promise<{ success: boolean; message: string; provider: string }> {
  const config = getEmailConfig();

  // If Resend API key is available via HTTP API
  if (config.provider === "resend" && process.env.RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: config.fromEmail,
          to: [toEmail],
          subject,
          html,
          text
        })
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true, message: "Welcome email dispatched via Resend", provider: "resend" };
      }
      console.warn("Resend API error:", data);
    } catch (e: any) {
      console.error("Resend dispatch error:", e);
    }
  }

  // If Brevo API key is available via HTTP API
  if (config.provider === "brevo" && process.env.BREVO_API_KEY) {
    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.BREVO_API_KEY
        },
        body: JSON.stringify({
          sender: { name: "Smart PE India", email: process.env.FROM_EMAIL || "contact@smartpeindia.app" },
          to: [{ email: toEmail }],
          subject,
          htmlContent: html,
          textContent: text
        })
      });
      if (res.ok) {
        return { success: true, message: "Welcome email dispatched via Brevo", provider: "brevo" };
      }
    } catch (e: any) {
      console.error("Brevo dispatch error:", e);
    }
  }

  // If SMTP / Gmail transporter is configured
  const transporter = createTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: config.fromEmail,
        to: toEmail,
        subject,
        html,
        text
      });
      return { success: true, message: `Email delivered to ${toEmail} via ${config.provider}`, provider: config.provider };
    } catch (smtpErr: any) {
      console.error("SMTP delivery error:", smtpErr);
      return { success: false, message: `SMTP error: ${smtpErr.message}`, provider: config.provider };
    }
  }

  // Simulated Corporate Dispatch (Logs full email and returns successfully)
  console.log(`[Smart PE Corporate Email Dispatcher] -> Simulated delivery to ${toEmail} | Subject: "${subject}"`);
  return {
    success: true,
    message: `Corporate welcome email generated for ${toEmail}. (Add SMTP or RESEND_API_KEY in settings for live inbox delivery).`,
    provider: "simulated"
  };
}
