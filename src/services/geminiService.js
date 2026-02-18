/**
 * Gemini API Service
 * Handles text generation (Gemini 3 Flash) and image generation (Imagen 4).
 *
 * ──────────────────────────────────────────
 * MODEL CONFIGURATION — Edit these constants
 * to change which models are used.
 * ──────────────────────────────────────────
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// ═══ MODEL SETTINGS ═════════════════════════════════
// Text generation model (Gemini 2.5 Flash — free tier)
const GEMINI_TEXT_MODEL = 'gemini-3-flash-preview';
// Image generation model (Imagen 4 Fast — free tier)
const IMAGEN_MODEL = 'imagen-4.0-fast-generate-001';
// Base URL for the Gemini API
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
// Timeout for text generation (ms)
const TEXT_TIMEOUT_MS = 15000;
// Timeout for image generation (ms)
const IMAGE_TIMEOUT_MS = 30000;
// ═════════════════════════════════════════════════════

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
 * Call Gemini 3 Flash for text generation (story + choices).
 * @param {string} prompt - The full system + user prompt
 * @returns {Promise<string>} Raw text response
 */
export async function callGeminiText(prompt) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_key_here') {
    throw new Error('Gemini API key not configured');
  }

  const url = `${GEMINI_BASE_URL}/${GEMINI_TEXT_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  console.log('─── GEMINI TEXT REQUEST ───');
  console.log(`Model: ${GEMINI_TEXT_MODEL}`);
  console.log(`Prompt length: ${prompt.length} chars`);
  console.log(`Timeout: ${TEXT_TIMEOUT_MS}ms`);

  const startTime = Date.now();

  const response = await fetchWithTimeout(
    url,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 1024,
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

/**
 * Call Imagen 4 for image generation.
 * Uses the Imagen REST API (:predict endpoint), which has a different
 * request/response format than the Gemini generateContent API.
 *
 * @param {string} imagePrompt - The image prompt with art style prepended
 * @returns {Promise<string>} Base64 image data URI
 */
export async function callGeminiImage(imagePrompt) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_key_here') {
    throw new Error('Gemini API key not configured');
  }

  // Imagen uses the :predict endpoint with x-goog-api-key header
  const url = `${GEMINI_BASE_URL}/${IMAGEN_MODEL}:predict`;

  console.log('─── IMAGEN IMAGE REQUEST ───');
  console.log(`Model: ${IMAGEN_MODEL}`);
  console.log(`Prompt: ${imagePrompt.substring(0, 200)}...`);
  console.log(`Timeout: ${IMAGE_TIMEOUT_MS}ms`);

  const startTime = Date.now();

  const response = await fetchWithTimeout(
    url,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        instances: [
          {
            prompt: imagePrompt,
          },
        ],
        parameters: {
          sampleCount: 1,
        },
      }),
    },
    IMAGE_TIMEOUT_MS
  );

  const elapsed = Date.now() - startTime;

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'no body');
    console.error(`❌ Imagen error: ${response.status} (${elapsed}ms)`);
    console.error(`   Response: ${errorBody.substring(0, 300)}`);
    throw new Error(`Imagen API error: ${response.status} — ${errorBody.substring(0, 100)}`);
  }

  const data = await response.json();

  console.log(`✅ Imagen response (${elapsed}ms)`);

  // Imagen returns predictions[].bytesBase64Encoded
  const predictions = data.predictions || [];
  if (predictions.length > 0 && predictions[0].bytesBase64Encoded) {
    const base64 = predictions[0].bytesBase64Encoded;
    console.log(`   Image data: ${(base64.length / 1024).toFixed(0)}KB base64`);
    return `data:image/png;base64,${base64}`;
  }

  console.error('   No image data in Imagen response:', JSON.stringify(data).substring(0, 300));
  throw new Error('No image data in Imagen response');
}
