/**
 * OpenAI Service — No longer used directly.
 * 
 * Fallback logic has moved to the Vercel Serverless Functions
 * (api/generate-text.js and api/generate-image.js).
 * 
 * These stub exports remain for backward compatibility with storyService.js.
 * They simply re-export from geminiService.js, which now calls the
 * serverless proxy that handles Gemini → OpenAI fallback internally.
 */

export { callGeminiText as callOpenAIText } from './geminiService';
export { callGeminiImage as callOpenAIImage } from './geminiService';
