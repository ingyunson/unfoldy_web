/**
 * OpenAI API Service (Fallback)
 * Handles text generation (GPT-4o) and image generation (DALL-E 3).
 * Used when the Gemini API is unavailable or times out.
 *
 * ──────────────────────────────────────────
 * MODEL CONFIGURATION — Edit these constants
 * to change which OpenAI models are used.
 * ──────────────────────────────────────────
 */

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// ═══ MODEL SETTINGS ═════════════════════════════════
// Text generation model
const OPENAI_TEXT_MODEL = 'gpt-4o';
// Image generation model
const OPENAI_IMAGE_MODEL = 'dall-e-3';
// Image size
const OPENAI_IMAGE_SIZE = '1024x1024';
// API URLs
const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_IMAGE_URL = 'https://api.openai.com/v1/images/generations';
// ═════════════════════════════════════════════════════

/**
 * Call OpenAI GPT-4o for text generation (story + choices).
 * @param {string} prompt - The full system + user prompt
 * @returns {Promise<string>} Raw text response
 */
export async function callOpenAIText(prompt) {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_key_here') {
    throw new Error('OpenAI API key not configured');
  }

  console.log('─── OPENAI TEXT REQUEST ───');
  console.log(`Model: ${OPENAI_TEXT_MODEL}`);
  console.log(`Prompt length: ${prompt.length} chars`);

  const startTime = Date.now();

  const response = await fetch(OPENAI_CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_TEXT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a creative interactive fiction storyteller.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.9,
      max_tokens: 1024,
    }),
  });

  const elapsed = Date.now() - startTime;

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'no body');
    console.error(`❌ OpenAI text error: ${response.status} (${elapsed}ms)`);
    console.error(`   Response: ${errorBody.substring(0, 300)}`);
    throw new Error(`OpenAI API error: ${response.status} — ${errorBody.substring(0, 100)}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';

  console.log(`✅ OpenAI text success (${elapsed}ms)`);
  console.log(`   Response length: ${text.length} chars`);
  console.log(`   Preview: ${text.substring(0, 150)}...`);

  return text;
}

/**
 * Call DALL-E 3 for image generation.
 * @param {string} imagePrompt - The image prompt with art style prepended
 * @returns {Promise<string>} Image URL
 */
export async function callOpenAIImage(imagePrompt) {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_key_here') {
    throw new Error('OpenAI API key not configured');
  }

  console.log('─── OPENAI IMAGE REQUEST ───');
  console.log(`Model: ${OPENAI_IMAGE_MODEL}`);
  console.log(`Prompt: ${imagePrompt.substring(0, 200)}...`);

  const startTime = Date.now();

  const response = await fetch(OPENAI_IMAGE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_IMAGE_MODEL,
      prompt: imagePrompt,
      n: 1,
      size: OPENAI_IMAGE_SIZE,
      quality: 'standard',
    }),
  });

  const elapsed = Date.now() - startTime;

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'no body');
    console.error(`❌ DALL-E error: ${response.status} (${elapsed}ms)`);
    console.error(`   Response: ${errorBody.substring(0, 300)}`);
    throw new Error(`DALL-E API error: ${response.status} — ${errorBody.substring(0, 100)}`);
  }

  const data = await response.json();
  const url = data.data?.[0]?.url || '';

  console.log(`✅ DALL-E image success (${elapsed}ms)`);
  console.log(`   Image URL: ${url.substring(0, 80)}...`);

  return url;
}
