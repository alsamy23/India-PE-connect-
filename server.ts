import express from "express";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import path from "path";

const app = express();
const PORT = 3000;

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

  // Sanitize: remove quotes or whitespace that might have been pasted accidentally
  const cleanKey = found.value.trim().replace(/^["']|["']$/g, '');

  console.log(`Gemini API Key: Found in ${found.name}`);
  return { 
    ai: new GoogleGenAI({ apiKey: cleanKey }), 
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
    const { ai, source } = getAI();
    
    if (!ai) {
      console.error("AI Generation Error: No API key found in environment.");
      return res.status(500).json({ 
        error: "Gemini API key not configured on server. Please ensure GEMINI_API_KEY is set.",
        source: "server_config"
      });
    }

    console.log(`AI Request: Model=${model || "gemini-3-flash-preview"}, Source=${source}`);

    const response = await ai.models.generateContent({
      model: model || "gemini-3-flash-preview",
      contents,
      config
    });

    res.json(response);
  } catch (error: any) {
    console.error("AI Generation Error Detail:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Handle specific invalid key error
    const errorMessage = error.message || "";
    if (errorMessage.includes("API key not valid") || errorMessage.includes("INVALID_ARGUMENT") || errorMessage.includes("401")) {
      return res.status(401).json({ 
        error: "The API key is invalid or unauthorized. Please check your Google Cloud project billing and API restrictions.",
        code: "API_KEY_INVALID",
        detail: errorMessage
      });
    }

    if (errorMessage.includes("Requested entity was not found") || errorMessage.includes("404")) {
      return res.status(404).json({
        error: "The requested model or resource was not found. This might be a region restriction or invalid model name.",
        code: "MODEL_NOT_FOUND",
        detail: errorMessage
      });
    }

    res.status(500).json({ 
      error: errorMessage || "Internal Server Error during AI generation",
      code: "AI_GEN_ERROR",
      detail: error.toString()
    });
  }
});

// Global 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ 
    error: "API Route not found", 
    path: req.originalUrl 
  });
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
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  // In production, serve from dist
  const distPath = path.resolve(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Only listen if not on Vercel (Vercel handles the listening)
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
