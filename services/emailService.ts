// Client-side service to trigger corporate transactional emails via the Smart PE backend API

export interface SendEmailPayload {
  toEmail: string;
  recipientName?: string;
  schoolName?: string;
  subject?: string;
  type?: 'welcome' | 'feature_update' | 'custom';
  customMessage?: string;
  featureTitle?: string;
}

export interface EmailServiceStatus {
  configured: boolean;
  provider: string; // 'smtp' | 'resend' | 'brevo' | 'sendgrid' | 'simulated'
  fromEmail: string;
}

export async function sendAutomatedWelcomeEmail(
  toEmail: string,
  recipientName?: string,
  schoolName?: string
): Promise<{ success: boolean; message: string; previewUrl?: string }> {
  try {
    const res = await fetch('/api/email/welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toEmail,
        recipientName: recipientName || 'Physical Education Educator',
        schoolName: schoolName || 'Smart PE Partner School'
      })
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error('Error sending automated welcome email:', err);
    return { success: false, message: err.message || 'Failed to dispatch email' };
  }
}

export async function sendFeatureAnnouncementEmail(
  toEmails: string[],
  featureTitle: string,
  featureDescription: string,
  actionUrl?: string
): Promise<{ success: boolean; sentCount: number; message: string }> {
  try {
    const res = await fetch('/api/email/announcement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toEmails,
        featureTitle,
        featureDescription,
        actionUrl: actionUrl || 'https://smartpeindia.app'
      })
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error('Error sending feature announcement email:', err);
    return { success: false, sentCount: 0, message: err.message || 'Failed to dispatch announcement' };
  }
}

export async function getEmailConfigStatus(): Promise<EmailServiceStatus> {
  try {
    const res = await fetch('/api/email/status');
    const data = await res.json();
    return data;
  } catch {
    return {
      configured: false,
      provider: 'simulated',
      fromEmail: 'welcome@smartpeindia.app'
    };
  }
}
