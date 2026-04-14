import express from "express";
import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Secure AI Initialization (Server-side only)
// IMPORTANT: Do NOT use VITE_ prefix for these keys, as that would expose them to the browser.
const getGeminiKeys = () => {
  const keys: string[] = [];
  const standardNames = ["GEMINI_API_KEY", "API_KEY"];
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
  const key = process.env.GROQ_API_KEY;
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
    res.json({ 
      status: (status.hasGemini || status.hasGroq) ? "ok" : "missing",
      ...status
    });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: "Health check failed" });
  }
});

apiRouter.get("/ai/test", async (req, res) => {
  try {
    const geminiKeys = getGeminiKeys();
    if (geminiKeys.length > 0) {
      const ai = new GoogleGenAI({ apiKey: geminiKeys[0] });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Say 'Gemini Connection Successful'"
      });
      return res.json({ message: response.text, provider: "gemini" });
    }
    
    const groqKey = getGroqKey();
    if (groqKey) {
      const groq = new Groq({ apiKey: groqKey });
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: "Say 'Groq Connection Successful'" }],
        model: "llama3-70b-8192",
      });
      return res.json({ message: completion.choices[0]?.message?.content, provider: "groq" });
    }

    res.status(401).json({ error: "No AI API keys found" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Test failed" });
  }
});

apiRouter.post("/ai/generate", async (req, res) => {
  const { model, contents, config } = req.body;
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
    // Prefer Gemini 3 models as per guidelines
    const modelsToTry = [
      model || "gemini-3-flash-preview", 
      "gemini-3.1-flash-lite-preview",
      "gemini-flash-latest"
    ];
    
    for (const key of shuffledKeys) {
      for (const currentModel of modelsToTry) {
        try {
          console.log(`Attempting generation with ${currentModel}...`);
          const ai = new GoogleGenAI({ apiKey: key });
          
          // Ensure thinkingLevel is LOW for speed if not specified, but ONLY for Gemini 3 models
          const finalConfig = { ...config };
          const isGemini3 = currentModel.includes("gemini-3");
          
          if (isGemini3 && !finalConfig.thinkingConfig) {
            finalConfig.thinkingConfig = { thinkingLevel: 'LOW' };
          } else if (!isGemini3 && finalConfig.thinkingConfig) {
            // Remove thinkingConfig for non-Gemini 3 models to avoid errors
            delete finalConfig.thinkingConfig;
          }

          const response = await ai.models.generateContent({
            model: currentModel,
            contents,
            config: finalConfig
          });

          return res.json({
            text: response.text,
            provider: "gemini",
            model: currentModel,
            candidates: response.candidates
          });
        } catch (error: any) {
          lastError = error;
          const errorMsg = (error.message || "").toLowerCase();
          
          // If it's a model error, try the next model with the same key
          if (errorMsg.includes("model") || errorMsg.includes("not found") || errorMsg.includes("404")) {
            console.warn(`Model ${currentModel} failed, trying next model...`);
            continue;
          }

          const isQuotaError = errorMsg.includes("429") || error.status === 429 || errorMsg.includes("resource_exhausted") || errorMsg.includes("quota");
          const isInvalidKeyError = errorMsg.includes("400") || error.status === 400 || 
                                   errorMsg.includes("api_key_invalid") || errorMsg.includes("api key not valid") || 
                                   errorMsg.includes("expired") || errorMsg.includes("invalid_argument") ||
                                   errorMsg.includes("renew the api key");

          if (isQuotaError || isInvalidKeyError) {
            console.warn(`Gemini key hit ${isQuotaError ? 'quota' : 'invalid/expired'} error. Trying next key...`);
            
            // Try to extract a cleaner error message from Gemini's JSON response
            if (isInvalidKeyError) {
              const jsonStart = errorMsg.indexOf('{');
              if (jsonStart !== -1) {
                try {
                  const parsed = JSON.parse(errorMsg.substring(jsonStart));
                  if (parsed.error?.message) {
                    lastError = new Error(parsed.error.message);
                  }
                } catch (e) {
                  // Ignore parsing errors
                }
              }
            }
            break; // Try next key
          }
          
          // For other errors, try next model or next key
          console.error(`Gemini error with ${currentModel}:`, errorMsg);
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
      
      // Convert Gemini format to OpenAI/Groq format
      let prompt = "";
      if (typeof contents === 'string') {
        prompt = contents;
      } else if (contents.parts) {
        prompt = contents.parts.map((p: any) => p.text).join("\n");
      } else if (Array.isArray(contents)) {
        prompt = contents.map((c: any) => typeof c === 'string' ? c : (c.parts ? c.parts.map((p: any) => p.text).join("\n") : "")).join("\n");
      }

      const systemPrompt = config?.systemInstruction || "You are a helpful assistant.";
      
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        model: "llama3-70b-8192",
        temperature: config?.temperature || 0.7,
        response_format: config?.responseMimeType === "application/json" ? { type: "json_object" } : undefined
      });

      return res.json({
        text: completion.choices[0]?.message?.content,
        provider: "groq"
      });
    } catch (groqError: any) {
      console.error("Groq fallback failed:", groqError);
      const groqMsg = groqError.message || "";
      if (groqMsg.toLowerCase().includes("api_key_invalid") || groqMsg.toLowerCase().includes("invalid api key")) {
        lastError = new Error("Groq API key is invalid. Please check your GROQ_API_KEY in the Environment Variables.");
      } else {
        lastError = groqError;
      }
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
        hmr: { port: 24679 } // Use a different port for HMR to avoid conflicts
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

  if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});

export default app;
