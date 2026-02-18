/**
 * Unified Story Service
 * Orchestrates text + image generation with Gemini → OpenAI fallback.
 * Handles prompt construction with pacing, style consistency,
 * and full story continuity across turns.
 */

import { callGeminiText, callGeminiImage } from './geminiService';
import { callOpenAIText, callOpenAIImage } from './openaiService';
import { PACING } from '../config/styleConfig';

/**
 * Build the full prompt for story generation based on current game state.
 * Includes FULL history of previous turns for narrative continuity.
 */
function buildStoryPrompt(storyState) {
  const { currentTurn, maxTurns, genre, artStylePrompt, history } = storyState;
  const pacingInstruction = PACING[currentTurn] || '';
  const isFinalTurn = currentTurn >= maxTurns;

  // ── Build FULL history context for continuity ──
  // Include the complete narrative of each past turn + the player's choice.
  // This ensures the AI continues the story rather than starting fresh.
  let historyContext;
  if (history.length > 0) {
    historyContext = history
      .map((h, i) => {
        let entry = `--- Turn ${i + 1} ---\n${h.narrative}`;
        if (h.choiceMade) {
          entry += `\n\n🎯 The player chose: "${h.choiceMade}"`;
        }
        return entry;
      })
      .join('\n\n');
  } else {
    historyContext = '(No previous turns — this is the very beginning of the story.)';
  }

  // ── Build the last choice reminder ──
  const lastChoice =
    history.length > 0 && history[history.length - 1].choiceMade
      ? `\n\n**IMPORTANT — The player just chose:** "${history[history.length - 1].choiceMade}"\nYour next story segment MUST directly continue from this choice. Show the immediate consequences and reactions.`
      : '';

  const prompt = `You are a masterful interactive fiction Storytelling AI. You are writing a continuous, evolving story. Each new turn MUST directly continue from the previous events and the player's latest choice. Never restart, reset, or ignore previous story events.

**Genre:** ${genre}
**Visual Style:** ${artStylePrompt}
**Current Turn:** ${currentTurn} of ${maxTurns}
**Pacing Instruction:** ${pacingInstruction}

══════════════════════════════════
COMPLETE STORY SO FAR (you must continue from this):
══════════════════════════════════
${historyContext}
══════════════════════════════════
${lastChoice}

**Your Task for Turn ${currentTurn}:**
1. Write the next story segment that DIRECTLY continues the narrative above. It must be vivid, immersive, and 100-150 words long. Write in second person ("You..."). Reference specific events, characters, and details from previous turns to maintain continuity.
2. Create an image prompt for this scene. CRITICAL: The image prompt MUST begin with the exact phrase: "${artStylePrompt}" followed by a detailed scene description.
${isFinalTurn ? '3. This is the FINAL turn. Write a satisfying conclusion that resolves the story threads from all previous turns. Do NOT provide any choices.' : '3. Provide exactly 3 distinct, meaningful choices for the player. Each choice should lead to a different narrative direction and be relevant to the current situation.'}

**You MUST respond in this exact JSON format (no markdown fences, no extra text):**
{
  "narrative": "Your story text here...",
  "imagePrompt": "${artStylePrompt}, [detailed scene description]",
  ${isFinalTurn ? '"choices": []' : '"choices": ["Choice 1 text", "Choice 2 text", "Choice 3 text"]'}
}`;

  return prompt;
}

/**
 * Parse the AI response text into structured data.
 * Handles various response formats and extracts the JSON.
 */
function parseResponse(rawText) {
  let jsonStr = rawText.trim();

  // Remove markdown code fences if present
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  // Try to find JSON object in the text
  const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    jsonStr = objectMatch[0];
  }

  try {
    const parsed = JSON.parse(jsonStr);
    return {
      narrative: parsed.narrative || 'The story continues...',
      imagePrompt: parsed.imagePrompt || '',
      choices: Array.isArray(parsed.choices) ? parsed.choices.slice(0, 3) : [],
    };
  } catch (e) {
    console.warn('⚠ Failed to parse JSON response:', e.message);
    console.warn('   Raw text:', rawText.substring(0, 500));
    return {
      narrative: rawText.substring(0, 500),
      imagePrompt: '',
      choices: ['Continue forward', 'Look around', 'Take a different path'],
    };
  }
}

/**
 * Generate story content (text + choices) with Gemini → OpenAI fallback.
 * @param {object} storyState - Current story state
 * @returns {Promise<{narrative: string, imagePrompt: string, choices: string[]}>}
 */
export async function generateStoryContent(storyState) {
  const prompt = buildStoryPrompt(storyState);

  console.log('═══════════════════════════════════');
  console.log(`📖 GENERATING TURN ${storyState.currentTurn}/${storyState.maxTurns}`);
  console.log(`   Genre: ${storyState.genre}`);
  console.log(`   History: ${storyState.history.length} previous turns`);
  if (storyState.history.length > 0) {
    const lastChoice = storyState.history[storyState.history.length - 1].choiceMade;
    console.log(`   Last choice: "${lastChoice}"`);
  }
  console.log(`   Prompt length: ${prompt.length} chars`);
  console.log('═══════════════════════════════════');

  let rawText;
  let usedFallback = false;

  try {
    rawText = await callGeminiText(prompt);
  } catch (geminiError) {
    console.warn(`⚠ Gemini text failed: ${geminiError.message}`);
    console.warn('   Falling back to OpenAI...');
    usedFallback = true;
    try {
      rawText = await callOpenAIText(prompt);
    } catch (openaiError) {
      console.error('❌ Both APIs failed!');
      console.error(`   Gemini: ${geminiError.message}`);
      console.error(`   OpenAI: ${openaiError.message}`);
      throw new Error(
        `Both APIs failed. Gemini: ${geminiError.message} | OpenAI: ${openaiError.message}`
      );
    }
  }

  const parsed = parseResponse(rawText);
  parsed.usedFallback = usedFallback;

  console.log('───── PARSED RESULT ─────');
  console.log(`   Narrative: "${parsed.narrative.substring(0, 100)}..."`);
  console.log(`   Image prompt: "${parsed.imagePrompt.substring(0, 100)}..."`);
  console.log(`   Choices: ${parsed.choices.length}`);
  parsed.choices.forEach((c, i) => console.log(`     ${i + 1}. ${c}`));
  console.log(`   Used fallback: ${usedFallback}`);

  return parsed;
}

/**
 * Generate an image with art style prepended.
 * Tries Gemini → fallback DALL-E 3.
 * @param {string} imagePrompt - Scene-specific image prompt
 * @param {string} artStylePrompt - Session-locked art style
 * @returns {Promise<string>} Image URL or base64 data URI
 */
export async function generateImage(imagePrompt, artStylePrompt) {
  // Ensure the art style is prepended for consistency
  const fullPrompt = imagePrompt.startsWith(artStylePrompt)
    ? imagePrompt
    : `${artStylePrompt}, ${imagePrompt}`;

  console.log('🎨 GENERATING IMAGE');
  console.log(`   Full prompt: ${fullPrompt.substring(0, 200)}...`);

  try {
    const result = await callGeminiImage(fullPrompt);
    console.log('✅ Image generated via Gemini');
    return result;
  } catch (geminiError) {
    console.warn(`⚠ Gemini image failed: ${geminiError.message}`);
    console.warn('   Falling back to OpenAI DALL-E...');
    try {
      const result = await callOpenAIImage(fullPrompt);
      console.log('✅ Image generated via OpenAI DALL-E');
      return result;
    } catch (openaiError) {
      console.error(`❌ Both image APIs failed: ${openaiError.message}`);
      return null;
    }
  }
}
