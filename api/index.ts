import express from "express";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
app.use(express.json({ limit: "10mb" }));

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_MODEL = "claude-sonnet-4-20250514";

// ── Non-streaming call (used internally) ─────────────────────────────────
const callClaude = async (systemPrompt: string, userPrompt: string): Promise<string> => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set in Vercel Environment Variables.");

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${errText}`);
  }
  const data: any = await response.json();
  return data?.content?.[0]?.text || "";
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
  const hasKey = !!process.env.ANTHROPIC_API_KEY;
  res.json({ status: hasKey ? "ok" : "missing_key", provider: "claude", model: ANTHROPIC_MODEL, hasKey });
});

apiRouter.get("/ai/test", async (_req, res) => {
  try {
    const text = await callClaude("You are a helpful assistant.", "Say exactly: Claude Connection Successful");
    return res.json({ message: text, provider: "claude" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ── Streaming generate endpoint ──────────────────────────────────────────────
apiRouter.post("/ai/generate", async (req: express.Request, res: express.Response) => {
  const { contents, config } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "ANTHROPIC_API_KEY is not set. Please add it in Vercel → Settings → Environment Variables.",
    });
  }

  const userPrompt = extractPrompt(contents);
  const systemBase = config?.systemInstruction || "You are a helpful Physical Education assistant for Indian teachers.";
  const expectJson = config?.responseMimeType === "application/json";

  const systemPrompt = expectJson
    ? systemBase + "\n\nCRITICAL: Respond ONLY with a valid JSON object. No explanation, no markdown code fences (```), no extra text. Just raw JSON starting with { and ending with }."
    : systemBase;

  // Use streaming for all requests
  const wantsStream = req.headers["accept"] === "text/event-stream";

  if (wantsStream) {
    // SSE streaming mode
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    try {
      const upstream = await fetch(ANTHROPIC_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: ANTHROPIC_MODEL,
          max_tokens: 4096,
          stream: true,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        }),
      });

      if (!upstream.ok) {
        const errText = await upstream.text();
        res.write(`data: ${JSON.stringify({ error: `Anthropic API error ${upstream.status}: ${errText}` })}\n\n`);
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
              if (parsed.type === "content_block_delta" && parsed.delta?.text) {
                fullText += parsed.delta.text;
                res.write(`data: ${JSON.stringify({ delta: parsed.delta.text, text: fullText })}\n\n`);
              }
            } catch (_) {}
          }
        }
      }

      res.write(`data: ${JSON.stringify({ done: true, text: fullText, provider: "claude" })}\n\n`);
      res.end();
    } catch (err: any) {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  } else {
    // Regular JSON mode (for JSON/structured outputs)
    try {
      const text = await callClaude(systemPrompt, userPrompt);
      return res.json({ text, provider: "claude", model: ANTHROPIC_MODEL });
    } catch (err: any) {
      console.error("Claude API error:", err.message);
      return res.status(500).json({ error: err.message || "AI generation failed." });
    }
  }
});

app.use("/api", apiRouter);

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
      console.log(`✅ Server on http://localhost:${PORT} — AI: Claude ${ANTHROPIC_MODEL}`);
    });
  }
}

startServer().catch(console.error);
export default app;
