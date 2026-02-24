import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  console.log(`Starting server in ${process.env.NODE_ENV || 'development'} mode`);

  app.use(express.json());

  // Secure Gemini API Initialization (Server-side only)
  const getAI = () => {
    // Check multiple possible environment variable names for maximum compatibility
    const sources = [
      { name: "GEMINI_API_KEY", value: process.env.GEMINI_API_KEY },
      { name: "API_KEY", value: process.env.API_KEY },
      { name: "VITE_GEMINI_API_KEY", value: process.env.VITE_GEMINI_API_KEY }
    ];

    const found = sources.find(s => s.value && s.value.trim() !== "");
    
    if (!found || !found.value) {
      console.log("Gemini API Key: Not found in any environment variable.");
      return { ai: null, source: "none" };
    }

    console.log(`Gemini API Key: Found in ${found.name}`);
    return { 
      ai: new GoogleGenAI({ apiKey: found.value.trim() }), 
      source: found.name 
    };
  };

  // API Routes
  app.get("/api/health", (req, res) => {
    try {
      const { ai, source } = getAI();
      res.json({ 
        status: ai ? "ok" : "missing",
        source: source,
        envKeys: Object.keys(process.env).filter(k => k.includes("API_KEY") || k.includes("GEMINI"))
      });
    } catch (err: any) {
      res.status(500).json({ status: "error", message: err.message });
    }
  });

  app.get("/api/ai/test", async (req, res) => {
    try {
      const { ai } = getAI();
      if (!ai) return res.status(401).json({ error: "No API key found" });
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Say 'Connection Successful'"
      });
      res.json({ message: response.text });
    } catch (error: any) {
      console.error("Test Error:", error);
      res.status(500).json({ error: error.message || "Test failed" });
    }
  });

  app.post("/api/ai/generate", async (req, res) => {
    try {
      const { model, contents, config } = req.body;
      const { ai } = getAI();
      
      if (!ai) {
        return res.status(500).json({ error: "Gemini API key not configured on server." });
      }

      const response = await ai.models.generateContent({
        model: model || "gemini-3-flash-preview",
        contents,
        config
      });

      res.json(response);
    } catch (error: any) {
      console.error("AI Generation Error:", error);
      
      // Handle specific invalid key error
      if (error.message?.includes("API key not valid") || error.message?.includes("INVALID_ARGUMENT")) {
        return res.status(401).json({ 
          error: "The selected API key is invalid. Please select a valid key from a paid Google Cloud project.",
          code: "API_KEY_INVALID"
        });
      }

      if (error.message?.includes("Requested entity was not found")) {
        return res.status(404).json({
          error: "API key session expired or not found. Please re-select your API key.",
          code: "API_KEY_NOT_FOUND"
        });
      }

      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  // Global error handler for API routes to prevent HTML responses
  app.use("/api", (err: any, req: any, res: any, next: any) => {
    console.error("API Error:", err);
    res.status(err.status || 500).json({
      error: err.message || "Internal Server Error",
      path: req.path
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve from dist
    const distPath = path.resolve("dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
