/**
 * Vercel Serverless Function — Image Generation Proxy
 * Keeps API keys server-side. Frontend calls POST /api/generate-image
 *
 * Tries Imagen first, falls back to DALL-E.
 */

// ═══ MODEL SETTINGS ═════════════════════════════════
const IMAGEN_MODEL = 'imagen-4.0-fast-generate-001';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const OPENAI_IMAGE_MODEL = 'dall-e-3';
const OPENAI_IMAGE_URL = 'https://api.openai.com/v1/images/generations';
const OPENAI_IMAGE_SIZE = '1024x1024';
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

  // ── Try Imagen first ──
  if (GEMINI_API_KEY) {
    try {
      console.log(`[generate-image] Calling Imagen (${IMAGEN_MODEL}), prompt: ${prompt.substring(0, 100)}...`);

      const url = `${GEMINI_BASE_URL}/${IMAGEN_MODEL}:predict`;

      const imagenRes = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: { sampleCount: 1 },
        }),
        signal: AbortSignal.timeout(50000),
      });

      if (!imagenRes.ok) {
        const errBody = await imagenRes.text().catch(() => '');
        console.error(`[generate-image] Imagen error ${imagenRes.status}: ${errBody.substring(0, 200)}`);
        throw new Error(`Imagen ${imagenRes.status}`);
      }

      const data = await imagenRes.json();
      const predictions = data.predictions || [];

      if (predictions.length > 0 && predictions[0].bytesBase64Encoded) {
        const base64 = predictions[0].bytesBase64Encoded;
        console.log(`[generate-image] Imagen success, ${(base64.length / 1024).toFixed(0)}KB`);
        return res.status(200).json({
          image: `data:image/png;base64,${base64}`,
          provider: 'imagen',
        });
      }

      throw new Error('No image data in Imagen response');
    } catch (err) {
      console.warn(`[generate-image] Imagen failed: ${err.message}, trying DALL-E fallback...`);
    }
  }

  // ── Fallback to DALL-E ──
  if (OPENAI_API_KEY) {
    try {
      console.log(`[generate-image] Calling DALL-E (${OPENAI_IMAGE_MODEL})`);

      const dalleRes = await fetch(OPENAI_IMAGE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: OPENAI_IMAGE_MODEL,
          prompt,
          n: 1,
          size: OPENAI_IMAGE_SIZE,
          quality: 'standard',
        }),
        signal: AbortSignal.timeout(50000),
      });

      if (!dalleRes.ok) {
        const errBody = await dalleRes.text().catch(() => '');
        console.error(`[generate-image] DALL-E error ${dalleRes.status}: ${errBody.substring(0, 200)}`);
        throw new Error(`DALL-E ${dalleRes.status}`);
      }

      const data = await dalleRes.json();
      const url = data.data?.[0]?.url || '';
      console.log(`[generate-image] DALL-E success`);

      return res.status(200).json({ image: url, provider: 'dalle' });
    } catch (err) {
      console.error(`[generate-image] DALL-E failed: ${err.message}`);
      return res.status(502).json({ error: `All image providers failed. Last error: ${err.message}` });
    }
  }

  return res.status(500).json({ error: 'No API keys configured on server' });
}
