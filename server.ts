import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '5mb' }));

// Health endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Gemini AI Copilot Endpoint
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const { message, financialContext, history } = req.body;

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.json({
      reply: null,
      source: 'offline_fallback',
      message: 'No server GEMINI_API_KEY configured. Utilizing local financial analysis engine.',
    });
    return;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemPrompt = `You are FinWise AI, an empathetic, mathematically accurate, and highly practical personal financial advisor and coach.
The target audience includes students, young professionals, and individuals managing their personal finances.

Guidelines:
1. Ground your answers strictly on the user's provided financial summary and mathematical projections.
2. If specific data is missing, provide practical, sound financial education and explain what numbers they should track.
3. Be transparent: explain formulas, rules of thumb (e.g. 50/30/20, emergency fund of 3-6 months), and actionable next steps.
4. Keep advice constructive, encouraging, clear, and structured with concise bullet points.
5. NEVER recommend specific stock purchases, speculative trading, or illegal tax schemes. Always provide prudent financial literacy.
6. Currency is specified in the context (default INR ₹ unless specified). Format monetary values accurately according to the user's currency.

Current Financial Context:
${JSON.stringify(financialContext || {}, null, 2)}`;

    // Build conversation contents
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // Prior chat turns if provided (max last 4)
    if (Array.isArray(history) && history.length > 0) {
      for (const turn of history.slice(-4)) {
        if (turn.role === 'user' || turn.role === 'model') {
          contents.push({
            role: turn.role,
            parts: [{ text: String(turn.text || turn.content || '') }],
          });
        }
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents as any,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    const text = response.text || 'I analyzed your financial data and recommend focusing on building your emergency reserve and tracking non-essential expenses.';
    res.json({
      reply: text,
      source: 'gemini',
    });
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    res.status(500).json({
      error: 'Failed to contact Gemini API',
      details: err.message,
      fallback: true,
    });
  }
});

// Vite middleware in dev or static files in prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FinWise AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
