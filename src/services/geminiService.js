/**
 * AI Service — Unified Text & Image Generation Client
 * 
 * In PRODUCTION (Vercel): calls /api/generate-text and /api/generate-image
 *   → API keys stay server-side in serverless functions
 * 
 * In DEVELOPMENT (Vite): calls Gemini/Imagen APIs directly using VITE_ env vars
 *   → Convenient for local testing
 */

const IS_DEV = import.meta.env.DEV;

// ─── Dev-mode settings (only used locally) ───
const DEV_GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const DEV_GEMINI_TEXT_MODEL = 'gemini-3-flash-preview';
const DEV_IMAGEN_MODEL = 'imagen-4.0-fast-generate-001';
const DEV_GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

const TEXT_TIMEOUT_MS = 30000;
const IMAGE_TIMEOUT_MS = 60000;

/**
 * Creates a fetch request with a timeout.
 */
function fetchWithTimeout(url, options, timeout) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(id)
  );
}

/**
 * Generate story text.
 * Routes to serverless proxy in production, direct API in dev.
 */
export async function callGeminiText(prompt) {
  console.log(`─── TEXT GENERATION REQUEST (${IS_DEV ? 'DEV' : 'PROD'}) ───`);
  console.log(`Prompt length: ${prompt.length} chars`);

  const startTime = Date.now();

  if (IS_DEV) {
    // ── Direct API call in development ──
    const url = `${DEV_GEMINI_BASE_URL}/${DEV_GEMINI_TEXT_MODEL}:generateContent?key=${DEV_GEMINI_API_KEY}`;

    const response = await fetchWithTimeout(
      url,
      {
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
      },
      TEXT_TIMEOUT_MS
    );

    const elapsed = Date.now() - startTime;

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'no body');
      console.error(`❌ Gemini text error: ${response.status} (${elapsed}ms)`);
      console.error(`   Response: ${errorBody.substring(0, 300)}`);
      throw new Error(`Gemini API error: ${response.status} — ${errorBody.substring(0, 100)}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    console.log(`✅ Gemini text success (${elapsed}ms)`);
    console.log(`   Response length: ${text.length} chars`);
    console.log(`   Preview: ${text.substring(0, 150)}...`);
    return text;
  }

  // ── Serverless proxy in production ──
  const response = await fetchWithTimeout(
    '/api/generate-text',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    },
    TEXT_TIMEOUT_MS
  );

  const elapsed = Date.now() - startTime;

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    console.error(`❌ Text generation error: ${response.status} (${elapsed}ms)`);
    throw new Error(errorData.error || `API error: ${response.status}`);
  }

  const data = await response.json();
  console.log(`✅ Text via ${data.provider} (${elapsed}ms), ${data.text.length} chars`);
  return data.text;
}

/**
 * Generate an image.
 * Routes to serverless proxy in production, direct API in dev.
 */
export async function callGeminiImage(imagePrompt) {
  console.log(`─── IMAGE GENERATION REQUEST (${IS_DEV ? 'DEV' : 'PROD'}) ───`);
  console.log(`Prompt: ${imagePrompt.substring(0, 200)}...`);

  const startTime = Date.now();

  if (IS_DEV) {
    // ── Direct Imagen call in development ──
    const url = `${DEV_GEMINI_BASE_URL}/${DEV_IMAGEN_MODEL}:predict`;

    const response = await fetchWithTimeout(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': DEV_GEMINI_API_KEY,
        },
        body: JSON.stringify({
          instances: [{ prompt: imagePrompt }],
          parameters: { sampleCount: 1 },
        }),
      },
      IMAGE_TIMEOUT_MS
    );

    const elapsed = Date.now() - startTime;

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'no body');
      console.error(`❌ Imagen error: ${response.status} (${elapsed}ms)`);
      throw new Error(`Imagen API error: ${response.status} — ${errorBody.substring(0, 100)}`);
    }

    const data = await response.json();
    const predictions = data.predictions || [];
    if (predictions.length > 0 && predictions[0].bytesBase64Encoded) {
      const base64 = predictions[0].bytesBase64Encoded;
      console.log(`✅ Imagen success (${elapsed}ms), ${(base64.length / 1024).toFixed(0)}KB`);
      return `data:image/png;base64,${base64}`;
    }
    throw new Error('No image data in Imagen response');
  }

  // ── Serverless proxy in production ──
  const response = await fetchWithTimeout(
    '/api/generate-image',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: imagePrompt }),
    },
    IMAGE_TIMEOUT_MS
  );

  const elapsed = Date.now() - startTime;

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    console.error(`❌ Image generation error: ${response.status} (${elapsed}ms)`);
    throw new Error(errorData.error || `API error: ${response.status}`);
  }

  const data = await response.json();
  console.log(`✅ Image via ${data.provider} (${elapsed}ms)`);
  return data.image;
}
