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
const getAI = () => {
  const sources = [
    { name: "GEMINI_API_KEY", value: process.env.GEMINI_API_KEY },
    { name: "API_KEY", value: process.env.API_KEY },
    { name: "VITE_GEMINI_API_KEY", value: process.env.VITE_GEMINI_API_KEY }
  ];

  const found = sources.find(s => s.value && s.value.trim() !== "");
  
  if (!found || !found.value) {
    console.warn("No Gemini API key found in environment variables.");
    return { ai: null, source: "none" };
  }

  const cleanKey = found.value.trim().replace(/^["']|["']$/g, '');
  console.log(`Using API key from ${found.name} (starts with ${cleanKey.substring(0, 4)}...)`);
  
  return { 
    ai: new GoogleGenAI({ apiKey: cleanKey }), 
    source: found.name 
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
      model: "gemini-1.5-flash",
      contents: "Say 'Connection Successful'"
    });
    res.json({ message: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Test failed" });
  }
});

apiRouter.post("/ai/generate", async (req, res) => {
  try {
    const { model, contents, config } = req.body;
    const { ai } = getAI();
    
    if (!ai) {
      return res.status(500).json({ error: "Gemini API key not configured." });
    }

    const response = await ai.models.generateContent({
      model: model || "gemini-1.5-flash",
      contents,
      config
    });

    // Explicitly include the text property as it might be a getter not included in JSON.stringify
    res.json({
      ...response,
      text: response.text
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "AI generation failed" });
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
