import express from "express";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
app.use(express.json({ limit: "10mb" }));

// ── Groq API Config (FREE) ─────────────────────────────────────────────────
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile"; // Best free model on Groq

const getGroqKey = () => {
  const key = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  if (key && key.trim() !== "" && key !== "undefined") return key.trim();
  return null;
};

// ── Call Groq ──────────────────────────────────────────────────────────────
const callGroq = async (systemPrompt: string, userPrompt: string, expectJson = false): Promise<string> => {
  const apiKey = getGroqKey();
  if (!apiKey) throw new Error("GROQ_API_KEY is not set in Vercel Environment Variables.");

  const body: any = {
    model: GROQ_MODEL,
    max_tokens: 4096,
    temperature: 0.7,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  };

  if (expectJson) {
    body.response_format = { type: "json_object" };
  }

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errText}`);
  }

  const data: any = await response.json();
  return data?.choices?.[0]?.message?.content || "";
};

// ── Extract prompt from Gemini-style body ──────────────────────────────────
const extractPrompt = (contents: any): string => {
  if (typeof contents === "string") return contents;
  if (contents?.parts) return contents.parts.map((p: any) => p.text || "").join("\n");
  if (Array.isArray(contents))
    return contents.map((c: any) =>
      typeof c === "string" ? c : c.parts ? c.parts.map((p: any) => p.text || "").join("\n") : ""
    ).join("\n");
  return "";
};

// ── Routes ──────────────────────────────────────────────────────────────────
const apiRouter = express.Router();

apiRouter.get("/health", (_req, res) => {
  const hasKey = !!getGroqKey();
  res.json({ 
    status: hasKey ? "ok" : "missing_key", 
    provider: "groq", 
    model: GROQ_MODEL, 
    hasKey 
  });
});

apiRouter.get("/ai/test", async (_req, res) => {
  try {
    const text = await callGroq("You are a helpful assistant.", "Say exactly: Groq Connection Successful");
    return res.json({ message: text, provider: "groq" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ── Streaming generate endpoint ────────────────────────────────────────────
apiRouter.post("/ai/generate", async (req: express.Request, res: express.Response) => {
  const { contents, config } = req.body;
  const apiKey = getGroqKey();

  if (!apiKey) {
    return res.status(500).json({
      error: "GROQ_API_KEY is not set. Please add it in Vercel → Settings → Environment Variables.",
    });
  }

  const userPrompt = extractPrompt(contents);
  const systemBase = config?.systemInstruction || "You are a helpful Physical Education assistant for Indian teachers.";
  const expectJson = config?.responseMimeType === "application/json";

  const systemPrompt = expectJson
    ? systemBase + "\n\nCRITICAL: Respond ONLY with a valid JSON object. No explanation, no markdown fences (```), no extra text. Just raw JSON starting with { and ending with }."
    : systemBase;

  const wantsStream = req.headers["accept"] === "text/event-stream";

  if (wantsStream) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    try {
      const body: any = {
        model: GROQ_MODEL,
        max_tokens: 4096,
        temperature: 0.7,
        stream: true,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      };

      const upstream = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!upstream.ok) {
        const errText = await upstream.text();
        res.write(`data: ${JSON.stringify({ error: `Groq API error ${upstream.status}: ${errText}` })}\n\n`);
        res.end();
        return;
      }

      const reader = upstream.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const delta = parsed?.choices?.[0]?.delta?.content;
              if (delta) {
                fullText += delta;
                res.write(`data: ${JSON.stringify({ delta, text: fullText })}\n\n`);
              }
            } catch (_) {}
          }
        }
      }

      res.write(`data: ${JSON.stringify({ done: true, text: fullText, provider: "groq" })}\n\n`);
      res.end();
    } catch (err: any) {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  } else {
    // Regular JSON mode
    try {
      const text = await callGroq(systemPrompt, userPrompt, expectJson);
      return res.json({ text, provider: "groq", model: GROQ_MODEL });
    } catch (err: any) {
      console.error("Groq API error:", err.message);
      return res.status(500).json({ error: err.message || "AI generation failed." });
    }
  }
});

app.use("/api", apiRouter);

// ── Start Server ──────────────────────────────────────────────────────────
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: { port: 24679 } },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get(/.*/, (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server on http://localhost:${PORT}`);
      console.log(`🆓 AI Provider: Groq (${GROQ_MODEL}) — FREE!`);
    });
  }
}

startServer().catch(console.error);
export default app;
