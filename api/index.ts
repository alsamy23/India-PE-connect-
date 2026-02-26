import express from "express";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Secure Gemini API Initialization (Server-side only)
const getAllKeys = () => {
  const keys: string[] = [];
  
  // Check standard names
  const standardNames = ["GEMINI_API_KEY", "API_KEY", "VITE_GEMINI_API_KEY"];
  standardNames.forEach(name => {
    const val = process.env[name];
    if (val && val.trim() !== "") {
      keys.push(val.trim().replace(/^["']|["']$/g, ''));
    }
  });

  // Check numbered keys (GEMINI_KEY_1, GEMINI_KEY_2, etc.)
  for (let i = 1; i <= 10; i++) {
    const key = process.env[`GEMINI_KEY_${i}`];
    if (key && key.trim() !== "") {
      keys.push(key.trim().replace(/^["']|["']$/g, ''));
    }
  }

  // Remove duplicates
  return [...new Set(keys)];
};

const getAI = (specificKey?: string) => {
  const keys = getAllKeys();
  
  if (keys.length === 0) {
    console.warn("No Gemini API key found in environment variables.");
    return { ai: null, source: "none" };
  }

  const keyToUse = specificKey || keys[Math.floor(Math.random() * keys.length)];
  const source = specificKey ? "Rotated Key" : "Random Key";
  
  return { 
    ai: new GoogleGenAI({ apiKey: keyToUse }), 
    source: source,
    key: keyToUse
  };
};

// API Routes
const apiRouter = express.Router();

apiRouter.get("/health", (req, res) => {
  try {
    const { ai, source } = getAI();
    res.json({ 
      status: ai ? "ok" : "missing",
      source: source,
      env: process.env.NODE_ENV,
      hasKey: !!ai
    });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

apiRouter.get("/ai/test", async (req, res) => {
  try {
    const { ai } = getAI();
    if (!ai) return res.status(401).json({ error: "No API key found" });
    
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: "Say 'Connection Successful'"
    });
    res.json({ message: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Test failed" });
  }
});

apiRouter.post("/ai/generate", async (req, res) => {
  const { model, contents, config } = req.body;
  const keys = getAllKeys();
  
  if (keys.length === 0) {
    return res.status(500).json({ error: "Gemini API key not configured." });
  }

  // Shuffle keys to try them in random order
  const shuffledKeys = [...keys].sort(() => Math.random() - 0.5);
  let lastError: any = null;

  for (const key of shuffledKeys) {
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: model || "gemini-flash-latest",
        contents,
        config
      });

      return res.json({
        ...response,
        text: response.text
      });
    } catch (error: any) {
      lastError = error;
      const errorMsg = error.message || "";
      const isQuotaError = errorMsg.includes("429") || error.status === 429 || errorMsg.includes("RESOURCE_EXHAUSTED");
      const isInvalidKeyError = errorMsg.includes("400") || error.status === 400 || errorMsg.includes("API_KEY_INVALID");

      // If it's a quota error or invalid key, try the next key
      if (isQuotaError || isInvalidKeyError) {
        const reason = isQuotaError ? "quota limit" : "invalid key error";
        console.warn(`Key starting with ${key.substring(0, 4)} hit ${reason}. Trying next key...`);
        continue;
      }
      // For other critical errors, break and return
      break;
    }
  }

  res.status(500).json({ error: lastError?.message || "AI generation failed after trying all keys" });
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
