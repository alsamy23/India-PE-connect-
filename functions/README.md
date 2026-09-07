# Firebase Cloud Functions: Automated Auth User Welcome Email

This Firebase Cloud Functions package contains an automated trigger function `sendPersonalizedWelcomeEmail` that listens to Firebase Authentication user creation events (`auth.user().onCreate`) and invokes the configured transactional email REST API (Resend or Brevo) or an external webhook to deliver a personalized welcome email.

---

## 🚀 How It Works

1. **User Sign Up**: When a new teacher/educator registers or signs in with Google Auth or Email in your application, Firebase Auth emits an `onCreate` user event.
2. **Cloud Function Trigger**: The `sendPersonalizedWelcomeEmail` function is automatically executed by Google Cloud infrastructure.
3. **Personalization**: The function parses the user's name, email, and metadata, and formats a responsive HTML welcome email containing their 1-Year Free Founding Pass confirmation and curriculum quick-links.
4. **REST API Dispatch**:
   - If `RESEND_API_KEY` is configured: calls `POST https://api.resend.com/emails` with Bearer authentication.
   - If `BREVO_API_KEY` is configured: calls `POST https://api.brevo.com/v3/smtp/email` with `api-key` header.
   - If `WELCOME_API_WEBHOOK_URL` is set: forwards the event to your custom backend endpoint.
5. **Audit Logging & Deduplication**: Records the delivery record in the Firestore `mail_logs` collection to prevent duplicate sends and track delivery status.

---

## 🛠️ Deployment Instructions

### 1. Prerequisites
Ensure you have the Firebase CLI installed and logged in:
```bash
npm install -g firebase-tools
firebase login
```

### 2. Configure Secrets / Environment Variables
Set your chosen provider's API key in Firebase Cloud Functions:

#### Option A: Using Firebase Secrets (Recommended)
```bash
# Set Resend API Key:
firebase functions:secrets:set RESEND_API_KEY

# OR set Brevo API Key:
firebase functions:secrets:set BREVO_API_KEY
```

#### Option B: Using Functions `.env` file
Create a `functions/.env` file with:
```env
RESEND_API_KEY=re_123456789...
FROM_EMAIL="Smart PE India <welcome@smartpeindia.app>"
APP_NAME="Smart PE India"
APP_URL="https://smartpeindia.app"
```

### 3. Build and Deploy
From the project root:
```bash
# Install functions dependencies
cd functions && npm install

# Build TypeScript
npm run build

# Deploy Cloud Functions to Firebase
cd .. && firebase deploy --only functions
```

Or deploy only the specific trigger function:
```bash
firebase deploy --only functions:sendPersonalizedWelcomeEmail
```

---

## 📊 Viewing Logs
To stream live execution logs in your terminal:
```bash
firebase functions:log --only sendPersonalizedWelcomeEmail
```
You can also view function executions in the **Google Cloud Console** or **Firebase Console > Functions > Logs**.
