/**
 * Vercel Serverless Function — Text Generation Proxy
 * Keeps API keys server-side. Frontend calls POST /api/generate-text
 *
 * Tries Gemini first, falls back to OpenAI.
 */

// ═══ MODEL SETTINGS ═════════════════════════════════
const GEMINI_TEXT_MODEL = 'gemini-3-flash-preview';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const OPENAI_TEXT_MODEL = 'gpt-4o';
const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';
// ═════════════════════════════════════════════════════

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  // ── Try Gemini first ──
  if (GEMINI_API_KEY) {
    try {
      console.log(`[generate-text] Calling Gemini (${GEMINI_TEXT_MODEL}), prompt: ${prompt.length} chars`);

      const url = `${GEMINI_BASE_URL}/${GEMINI_TEXT_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

      const geminiRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 4096,
            responseMimeType: 'application/json',
          },
        }),
        signal: AbortSignal.timeout(25000),
      });

      if (!geminiRes.ok) {
        const errBody = await geminiRes.text().catch(() => '');
        console.error(`[generate-text] Gemini error ${geminiRes.status}: ${errBody.substring(0, 200)}`);
        throw new Error(`Gemini ${geminiRes.status}`);
      }

      const data = await geminiRes.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      console.log(`[generate-text] Gemini success, ${text.length} chars`);

      return res.status(200).json({ text, provider: 'gemini' });
    } catch (err) {
      console.warn(`[generate-text] Gemini failed: ${err.message}, trying OpenAI fallback...`);
    }
  }

  // ── Fallback to OpenAI ──
  if (OPENAI_API_KEY) {
    try {
      console.log(`[generate-text] Calling OpenAI (${OPENAI_TEXT_MODEL})`);

      const openaiRes = await fetch(OPENAI_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: OPENAI_TEXT_MODEL,
          messages: [
            { role: 'system', content: 'You are a creative interactive fiction storyteller.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.9,
          max_tokens: 4096,
        }),
        signal: AbortSignal.timeout(25000),
      });

      if (!openaiRes.ok) {
        const errBody = await openaiRes.text().catch(() => '');
        console.error(`[generate-text] OpenAI error ${openaiRes.status}: ${errBody.substring(0, 200)}`);
        throw new Error(`OpenAI ${openaiRes.status}`);
      }

      const data = await openaiRes.json();
      const text = data.choices?.[0]?.message?.content || '';
      console.log(`[generate-text] OpenAI success, ${text.length} chars`);

      return res.status(200).json({ text, provider: 'openai' });
    } catch (err) {
      console.error(`[generate-text] OpenAI failed: ${err.message}`);
      return res.status(502).json({ error: `All AI providers failed. Last error: ${err.message}` });
    }
  }

  return res.status(500).json({ error: 'No API keys configured on server' });
}
