import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Secure Gemini API Initialization (Server-side only)
  const getAI = () => {
    // Check multiple possible environment variable names for maximum compatibility
    const apiKey = process.env.GEMINI_API_KEY || 
                   process.env.API_KEY || 
                   process.env.VITE_GEMINI_API_KEY;
                   
    if (!apiKey || apiKey.trim() === "") {
      return null;
    }
    return new GoogleGenAI({ apiKey: apiKey.trim() });
  };

  // API Routes
  app.get("/api/health", (req, res) => {
    const ai = getAI();
    res.json({ status: ai ? "ok" : "missing" });
  });

  app.post("/api/ai/generate", async (req, res) => {
    try {
      const { model, contents, config } = req.body;
      const ai = getAI();
      
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
