/**
 * Genre → Visual Style mapping.
 * The artStylePrompt is prepended to EVERY image generation request
 * to ensure visual consistency within a single story session.
 */

export const GENRES = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Neon-lit streets, rogue hackers, and megacorporations.',
    emoji: '🌆',
    artStylePrompt: 'Digital art, neon palette, glitched edges, synthwave aesthetic, cyberpunk cityscape',
    color: '#e040fb',
  },
  {
    id: 'fantasy',
    name: 'Fantasy',
    description: 'Ancient magic, epic quests, and mythical creatures.',
    emoji: '🧙',
    artStylePrompt: 'Watercolor illustration, medieval fantasy, warm golden tones, detailed environments',
    color: '#ffab40',
  },
  {
    id: 'horror',
    name: 'Horror',
    description: 'Dark secrets, creeping dread, and things in the shadows.',
    emoji: '👻',
    artStylePrompt: 'Gritty, dark, film grain, photorealistic horror, unsettling atmosphere, muted colors',
    color: '#ff1744',
  },
  {
    id: 'space-opera',
    name: 'Space Opera',
    description: 'Galactic empires, starships, and interstellar conflict.',
    emoji: '🚀',
    artStylePrompt: 'Epic cinematic sci-fi, vibrant nebula colors, detailed spacecraft, space opera grandeur',
    color: '#448aff',
  },
  {
    id: 'noir',
    name: 'Noir Mystery',
    description: 'Rain-slicked alleys, femme fatales, and hard-boiled detectives.',
    emoji: '🕵️',
    artStylePrompt: 'Black and white, high contrast ink style, film noir, dramatic shadows, 1940s aesthetic',
    color: '#b0bec5',
  },
  {
    id: 'post-apocalyptic',
    name: 'Post-Apocalyptic',
    description: 'A broken world, desperate survivors, and hope in the ruins.',
    emoji: '☢️',
    artStylePrompt: 'Muted desaturated palette, ruined landscapes, gritty realism, post-apocalyptic desolation',
    color: '#8d6e63',
  },
];

/**
 * Turn-based pacing instructions appended to prompts.
 */
export const PACING = {
  1: 'Introduction: Set the scene and introduce the protagonist. Establish the world and tone.',
  2: 'Rising Action: Introduce the first challenge or mystery. Build intrigue.',
  3: 'Rising Action: Deepen the conflict. Introduce a secondary character or complication.',
  4: 'Rising Action: Raise the stakes. Something unexpected happens.',
  5: 'Rising Action: Build tension. The protagonist faces a difficult decision.',
  6: 'Rising Action: The situation becomes dire. Foreshadow the coming climax.',
  7: 'CLIMAX: This is the turning point! Maximum tension, danger, or revelation. The protagonist faces their greatest challenge.',
  8: 'Falling Action: The aftermath of the climax. Show consequences of the protagonist\'s choice.',
  9: 'Resolution Setup: Tie up loose threads. Prepare for the final outcome.',
  10: 'CONCLUSION: Deliver the ending. Wrap up the story satisfyingly. Do NOT provide choices — this is the final scene.',
};

export const MAX_TURNS = 10;
