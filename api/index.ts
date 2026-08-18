import express from "express";
import { GoogleGenAI } from "@google/genai";
import * as genAiPackage from "@google/genai";
const ThinkingLevel = (genAiPackage as any).ThinkingLevel;
import Groq from "groq-sdk";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import { 
  getEmailConfig, 
  buildCorporateWelcomeEmail, 
  buildCorporateFeatureEmail, 
  dispatchEmail 
} from "./email.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Secure AI Initialization (Server-side only)
// Note: While we don't want to expose keys to the client, we allow VITE_ prefixes on the server 
// for compatibility with common Vite/Vercel setup patterns.
const getGeminiKeys = () => {
  const keys: string[] = [];
  const standardNames = ["GEMINI_API_KEY", "API_KEY", "VITE_GEMINI_API_KEY", "GOOGLE_API_KEY"];
  standardNames.forEach(name => {
    const val = process.env[name];
    if (val && val.trim() !== "" && val !== "undefined" && val !== "null") {
      keys.push(val.trim().replace(/^["']|["']$/g, ''));
    }
  });

  for (let i = 1; i <= 20; i++) {
    const key = process.env[`GEMINI_KEY_${i}`];
    if (key && key.trim() !== "" && key !== "undefined" && key !== "null") {
      keys.push(key.trim().replace(/^["']|["']$/g, ''));
    }
  }
  return [...new Set(keys)].filter(k => k.length > 10);
};

const getGroqKey = () => {
  const key = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  if (key && key.trim() !== "" && key !== "undefined" && key !== "null") {
    return key.trim().replace(/^["']|["']$/g, '');
  }
  return null;
};

const getAI = () => {
  const geminiKeys = getGeminiKeys();
  const groqKey = getGroqKey();
  
  return { 
    hasGemini: geminiKeys.length > 0,
    hasGroq: !!groqKey,
    geminiCount: geminiKeys.length,
    groqConfigured: !!groqKey,
    env: process.env.NODE_ENV
  };
};

// API Routes
const apiRouter = express.Router();

apiRouter.get("/health", (req, res) => {
  try {
    const status = getAI();
    const emailStatus = getEmailConfig();
    res.json({ 
      status: (status.hasGemini || status.hasGroq) ? "ok" : "missing",
      emailConfigured: emailStatus.configured,
      emailProvider: emailStatus.provider,
      ...status
    });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: "Health check failed" });
  }
});

// Check transactional email service configuration
apiRouter.get("/email/status", (req, res) => {
  try {
    const config = getEmailConfig();
    res.json(config);
  } catch (err: any) {
    res.status(500).json({ configured: false, error: err.message });
  }
});

// Automated Corporate Welcome Email endpoint
apiRouter.post("/email/welcome", async (req, res) => {
  try {
    const { toEmail, recipientName, schoolName } = req.body;

    if (!toEmail || typeof toEmail !== "string" || !toEmail.includes("@")) {
      return res.status(400).json({ success: false, error: "Valid recipient email address is required" });
    }

    const { subject, html, text } = buildCorporateWelcomeEmail(recipientName, schoolName);
    const result = await dispatchEmail(toEmail, subject, html, text);

    res.json({
      success: result.success,
      message: result.message,
      provider: result.provider,
      recipient: toEmail
    });
  } catch (error: any) {
    console.error("Welcome email error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to dispatch welcome email" });
  }
});

// Corporate Feature Update & Announcement email endpoint
apiRouter.post("/email/announcement", async (req, res) => {
  try {
    const { toEmails, featureTitle, featureDescription, actionUrl } = req.body;

    if (!Array.isArray(toEmails) || toEmails.length === 0) {
      return res.status(400).json({ success: false, error: "Recipient emails list is required" });
    }

    if (!featureTitle || !featureDescription) {
      return res.status(400).json({ success: false, error: "Feature title and description are required" });
    }

    const { subject, html, text } = buildCorporateFeatureEmail(featureTitle, featureDescription, actionUrl);

    let sentCount = 0;
    const sanitizedEmails = [...new Set(toEmails.filter(e => typeof e === "string" && e.includes("@")))];

    for (const email of sanitizedEmails) {
      const resSend = await dispatchEmail(email, subject, html, text);
      if (resSend.success) sentCount++;
    }

    res.json({
      success: true,
      sentCount,
      totalRequested: sanitizedEmails.length,
      message: `Dispatched feature announcement to ${sentCount} recipient(s).`
    });
  } catch (error: any) {
    console.error("Announcement email error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to dispatch announcement" });
  }
});

apiRouter.get("/ai/test", async (req, res) => {
  try {
    const geminiKeys = getGeminiKeys();
    if (geminiKeys.length > 0) {
      const ai = new GoogleGenAI({ 
        apiKey: geminiKeys[0],
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: [{ role: 'user', parts: [{ text: "Say 'Gemini Connection Successful'" }] }]
      });
      return res.json({ message: response.text, provider: "gemini" });
    }
    
    const groqKey = getGroqKey();
    if (groqKey) {
      const groq = new Groq({ apiKey: groqKey });
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: "Say 'Groq Connection Successful'" }],
        model: "llama-3.3-70b-versatile",
      });
      return res.json({ message: completion.choices[0]?.message?.content, provider: "groq" });
    }

    res.status(401).json({ error: "No AI API keys found" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Test failed" });
  }
});

apiRouter.post("/ai/generate", async (req, res) => {
  try {
    const { model, contents, config } = req.body;
    
    const resolveModel = (modelName: string): string => {
      const m = (modelName || "").toLowerCase();
      if (m.includes("3.1-pro") || m.includes("pro-preview")) {
        return "gemini-3.1-pro-preview";
      }
      return "gemini-3.6-flash";
    };

    const resolvedModel = resolveModel(model);
    const geminiKeys = getGeminiKeys();
    const groqKey = getGroqKey();
    
    if (geminiKeys.length === 0 && !groqKey) {
      return res.status(500).json({ 
        error: "No AI API keys configured.",
        message: "Please add a Gemini key via the 'Renew / Upgrade' button OR add GROQ_API_KEY to the Environment Variables tab in the AI Studio sidebar."
      });
    }

    let lastError: any = null;

    // 1. Try Gemini first (with rotation and model fallback)
    if (geminiKeys.length > 0) {
      const shuffledKeys = [...geminiKeys].sort(() => Math.random() - 0.5);
      
      // Determine which models we can try
      const modelsToTry = [
        resolvedModel,
        "gemini-3.6-flash",
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-flash-latest"
      ];
      
      // Filter out duplicates but keep order
      const uniqueModels = [...new Set(modelsToTry)];

      for (const key of shuffledKeys) {
        const ai = new GoogleGenAI({ 
          apiKey: key,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        });
        
        for (const currentModel of uniqueModels) {
          try {
            console.log(`Attempting generation with ${currentModel}...`);
            
            // Prepare contents
            const formattedContents = Array.isArray(contents) 
              ? contents 
              : (typeof contents === 'string' ? [{ role: 'user', parts: [{ text: contents }] }] : [contents]);

            // Ensure thinkingLevel is only used if supported (Gemini 3 series)
            const finalConfig = { ...config };
            const isSupportedModel = currentModel.includes("gemini-3");
            
            if (isSupportedModel && ThinkingLevel) {
              if (!finalConfig.thinkingConfig) {
                finalConfig.thinkingConfig = { thinkingLevel: (ThinkingLevel as any).LOW || "LOW" };
              }
            } else {
              delete finalConfig.thinkingConfig;
            }

            const response = await ai.models.generateContent({
              model: currentModel,
              contents: formattedContents,
              config: finalConfig,
            });

            const textValue = response.text;

            console.log(`Success with Gemini model: ${currentModel}`);
            return res.json({
              text: textValue,
              provider: "gemini",
              model: currentModel,
              candidates: response.candidates
            });
          } catch (error: any) {
            lastError = error;
            const errorMsg = (error.message || "").toLowerCase();
            
            // Log the specific error for debugging
            console.warn(`Gemini error with model ${currentModel}:`, errorMsg);

            // Handle safety blocks
            if (errorMsg.includes("safety") || errorMsg.includes("blocked")) {
              console.error("Safety block triggered. Skipping to next provider/model.");
              break; // Skip this key, try next model or provider
            }

            // If it's a definitive auth/expired error, try NEXT KEY
            const isDefinitiveBadKey = errorMsg.includes("expired") || 
                                      errorMsg.includes("renew") ||
                                      errorMsg.includes("api key not valid") ||
                                      errorMsg.includes("api_key_invalid") ||
                                      (error.status === 401);

            if (isDefinitiveBadKey) {
              console.error(`Definitive bad key detected (${key}). Trying next key.`);
              break; // Break inner loop to try next key
            }

            // Handle Quota
            const isQuotaError = errorMsg.includes("429") || error.status === 429 || errorMsg.includes("resource_exhausted") || errorMsg.includes("quota");
            if (isQuotaError) {
              console.warn("Quota exceeded for this key. Trying next key.");
              break; // Break inner loop to try next key
            }

            // For other errors (like 400 Bad Request if config is invalid), try next model on same key
            continue;
          }
        }
      }
    }

    // 2. Fallback to Groq if Gemini failed or wasn't available
    if (groqKey) {
      try {
        console.log("Falling back to Groq...");
        const groq = new Groq({ apiKey: groqKey });
        
        let prompt = "";
        const processedContents = Array.isArray(contents) ? contents : (contents?.contents || contents);
        
        if (typeof contents === 'string') {
          prompt = contents;
        } else if (Array.isArray(processedContents)) {
          prompt = processedContents.map((c: any) => {
            if (typeof c === 'string') return c;
            if (c.parts) return c.parts.map((p: any) => p.text).join("\n");
            return "";
          }).join("\n");
        } else if (contents?.parts) {
          prompt = contents.parts.map((p: any) => p.text).join("\n");
        }

        const systemPrompt = typeof config?.systemInstruction === 'string' 
          ? config.systemInstruction 
          : (config?.systemInstruction?.parts ? config.systemInstruction.parts.map((p: any) => p.text).join("\n") : "You are a professional assistant.");
        
        const completion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt + (config?.responseMimeType === "application/json" ? "\n\nIMPORTANT: Return ONLY valid JSON that strictly follows this schema structure:\n" + JSON.stringify(config.responseSchema || {}) : "") },
            { role: "user", content: prompt }
          ],
          model: "llama-3.3-70b-versatile",
          temperature: config?.temperature || 0.7,
          response_format: config?.responseMimeType === "application/json" ? { type: "json_object" } : undefined
        });

        return res.json({
          text: completion.choices[0]?.message?.content,
          provider: "groq"
        });
      } catch (groqError: any) {
        console.error("Groq fallback failed:", groqError);
        lastError = groqError;
      }
    }

    let errorMessage = "AI generation failed after trying all available providers.";
    let statusCode = 500;

    const isInvalidKey = lastError?.message?.toLowerCase().includes("expired") || 
                        lastError?.message?.toLowerCase().includes("renew") ||
                        lastError?.message?.toLowerCase().includes("api key not valid") ||
                        lastError?.message?.toLowerCase().includes("api_key_invalid") ||
                        lastError?.message?.toLowerCase().includes("invalid_argument");

    if (isInvalidKey) {
      statusCode = 401;
      errorMessage = "Your Gemini API key is invalid or has expired. To fix this, click the 'Renew / Upgrade' button in the dashboard and select a key from a PAID project, or add a GROQ_API_KEY in the Environment Variables sidebar.";
    } else if (lastError?.message?.toLowerCase().includes("quota") || lastError?.message?.toLowerCase().includes("429")) {
      errorMessage = "Gemini quota exceeded. To continue without interruption, please add a GROQ_API_KEY to the Environment Variables tab in the AI Studio sidebar (left).";
    } else if (!groqKey && geminiKeys.length > 0) {
      errorMessage = "Gemini failed and no Groq fallback was found. Please add a GROQ_API_KEY to the Environment Variables tab in the AI Studio sidebar (left) for a reliable free fallback.";
    }

    res.status(statusCode).json({ 
      error: errorMessage,
      message: errorMessage,
      originalError: lastError?.message,
      details: lastError?.stack
    });
  } catch (globalError: any) {
    console.error("Critical error in /ai/generate:", globalError);
    res.status(500).json({ error: "Internal server error during AI generation.", details: globalError.message });
  }
});

// Mount API routes
app.use("/api", apiRouter);

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in development mode with Vite middleware...");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        host: "0.0.0.0",
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in production mode...");
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get(/.*/, (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Error handler for API
  app.use("/api", (req, res) => {
    res.status(404).json({ error: "API endpoint not found" });
  });

  if (!process.env.VERCEL || process.env.NODE_ENV !== "production") {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});

export default app;
