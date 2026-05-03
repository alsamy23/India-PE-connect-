import express from "express";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
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
        model: "gemini-2.0-flash",
        contents: "Say 'Gemini Connection Successful'"
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
      // Use stable models
      const modelsToTry = [
        model || "gemini-1.5-flash", 
        "gemini-1.5-pro",
        "gemini-2.0-flash"
      ];
      
      for (const key of shuffledKeys) {
        let keyFailed = false;
        for (const currentModel of modelsToTry) {
          if (keyFailed) break;
          try {
            console.log(`Attempting generation with ${currentModel}...`);
            const ai = new GoogleGenAI({ apiKey: key });
            
            // Ensure thinkingLevel is LOW for speed if not specified, but ONLY for models that support it
            const finalConfig = { ...config };
            const supportsThinking = currentModel.includes("gemini-2.0") || currentModel.includes("gemini-3");
            
            if (supportsThinking && !finalConfig.thinkingConfig) {
              finalConfig.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
            } else if (!supportsThinking && finalConfig.thinkingConfig) {
              // Remove thinkingConfig for models that don't support it to avoid errors
              delete finalConfig.thinkingConfig;
            }

            const response = await ai.models.generateContent({
              model: currentModel,
              contents: Array.isArray(contents) ? contents : (typeof contents === 'string' ? [{ role: 'user', parts: [{ text: contents }] }] : contents),
              config: finalConfig
            });

            console.log(`Success with Gemini model: ${currentModel}`);
            return res.json({
              text: response.text,
              provider: "gemini",
              model: currentModel,
              candidates: response.candidates
            });
          } catch (error: any) {
            lastError = error;
            const errorMsg = (error.message || "").toLowerCase();
            
            const isQuotaError = errorMsg.includes("429") || error.status === 429 || errorMsg.includes("resource_exhausted") || errorMsg.includes("quota");
            
            // Only mark key as failed if it's a definitive auth/expired error
            const isDefinitiveBadKey = errorMsg.includes("expired") || 
                                      errorMsg.includes("renew the api key") ||
                                      errorMsg.includes("api key not valid") ||
                                      errorMsg.includes("api_key_invalid") ||
                                      (error.status === 401);

            if (!isDefinitiveBadKey && !isQuotaError) {
              console.error(`Gemini error with model ${currentModel}:`, error.message);
            }

            if (isQuotaError || isDefinitiveBadKey) {
              if (isQuotaError) console.warn("Gemini key hit quota error. Trying next key...");
              keyFailed = true; 
              break; 
            }
            
            // If it's a 400 error (Invalid Argument) or Model Not Found (404), try NEXT MODEL on SAME KEY
            // because "API key not valid" for 2.0-flash often just means "no access to 2.0"
            if (error.status === 400 || error.status === 404 || errorMsg.includes("model") || errorMsg.includes("not found") || errorMsg.includes("404")) {
              console.warn(`Model ${currentModel} failed on this key, trying next available model...`);
              continue;
            }

            // For other errors, try next model
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
        } else if (contents?.parts) {
          prompt = contents.parts.map((p: any) => p.text).join("\n");
        } else if (Array.isArray(contents)) {
          prompt = contents.map((c: any) => typeof c === 'string' ? c : (c.parts ? c.parts.map((p: any) => p.text).join("\n") : "")).join("\n");
        }

        const systemPrompt = config?.systemInstruction || "You are a helpful assistant.";
        
        const completion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt + (config?.responseMimeType === "application/json" ? "\n\nPlease output valid json." : "") },
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
