# India PE Connect 🏃‍♂️

**Free AI Lesson Planner & Network for PE Teachers**

## ✅ AI Provider: Anthropic Claude (Fixed!)

This project now uses **Anthropic Claude** instead of Gemini/Groq, which were having key expiry issues.

---

## 🚀 Setup on Vercel (Free Hosting)

### Step 1: Get a Free Anthropic API Key
1. Go to → **https://console.anthropic.com**
2. Sign up (free)
3. Go to **API Keys** → click **Create Key**
4. Copy the key (starts with `sk-ant-...`)

### Step 2: Add Key to Vercel
1. Open your project on **vercel.com**
2. Go to **Settings** → **Environment Variables**
3. Click **Add New**
   - Name: `ANTHROPIC_API_KEY`
   - Value: paste your key
4. Click **Save**
5. **Redeploy** the project (Deployments → click ⋮ → Redeploy)

### Step 3: Done! ✅
All AI features (Lesson Plans, Yearly Planner, Theory Hub, Fitness Tests, etc.) will now work perfectly.

---

## 💻 Run Locally

```bash
npm install
# Create a .env file and add: ANTHROPIC_API_KEY=sk-ant-your-key-here
npm run dev
```

---

## 📁 Project Structure

```
api/index.ts          ← Backend server (now uses Claude API)
services/geminiService.ts  ← Frontend AI service (calls /api/ai/generate)
components/           ← React UI components
```
