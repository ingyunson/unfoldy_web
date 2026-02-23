/**
 * Genre → Visual Style mapping.
 * The artStylePrompt is prepended to EVERY image generation request
 * to ensure visual consistency within a single story session.
 *
 * Localized names & descriptions are used for the genre selection UI.
 */

export const GENRES = [
  {
    id: 'cyberpunk',
    name: { en: 'Cyberpunk', ko: '사이버펑크', ja: 'サイバーパンク' },
    description: {
      en: 'Neon-lit streets, rogue hackers, and megacorporations.',
      ko: '네온 불빛 거리, 해커, 그리고 거대 기업의 이야기.',
      ja: 'ネオンの街、ローグハッカー、巨大企業の物語。',
    },
    emoji: '🌆',
    artStylePrompt: 'Digital art, neon palette, glitched edges, synthwave aesthetic, cyberpunk cityscape',
    color: '#e040fb',
  },
  {
    id: 'fantasy',
    name: { en: 'Fantasy', ko: '판타지', ja: 'ファンタジー' },
    description: {
      en: 'Ancient magic, epic quests, and mythical creatures.',
      ko: '고대 마법, 장대한 모험, 그리고 신화 속 생물.',
      ja: '古代の魔法、壮大な冒険、神話の生物。',
    },
    emoji: '🧙',
    artStylePrompt: 'Watercolor illustration, medieval fantasy, warm golden tones, detailed environments',
    color: '#ffab40',
  },
  {
    id: 'horror',
    name: { en: 'Horror', ko: '호러', ja: 'ホラー' },
    description: {
      en: 'Dark secrets, creeping dread, and things in the shadows.',
      ko: '어둠 속 비밀, 스며드는 공포, 그림자 속 존재.',
      ja: '暗い秘密、忍び寄る恐怖、影に潜むもの。',
    },
    emoji: '👻',
    artStylePrompt: 'Gritty, dark, film grain, photorealistic horror, unsettling atmosphere, muted colors',
    color: '#ff1744',
  },
  {
    id: 'space-opera',
    name: { en: 'Space Opera', ko: '스페이스 오페라', ja: 'スペースオペラ' },
    description: {
      en: 'Galactic empires, starships, and interstellar conflict.',
      ko: '은하 제국, 우주선, 그리고 성간 전쟁.',
      ja: '銀河帝国、宇宙船、星間紛争。',
    },
    emoji: '🚀',
    artStylePrompt: 'Epic cinematic sci-fi, vibrant nebula colors, detailed spacecraft, space opera grandeur',
    color: '#448aff',
  },
  {
    id: 'noir',
    name: { en: 'Noir Mystery', ko: '느와르 미스터리', ja: 'ノワール・ミステリー' },
    description: {
      en: 'Rain-slicked alleys, femme fatales, and hard-boiled detectives.',
      ko: '비에 젖은 골목, 팜 파탈, 그리고 하드보일드 탐정.',
      ja: '雨に濡れた路地、ファム・ファタール、ハードボイルド探偵。',
    },
    emoji: '🕵️',
    artStylePrompt: 'Black and white, high contrast ink style, film noir, dramatic shadows, 1940s aesthetic',
    color: '#b0bec5',
  },
  {
    id: 'post-apocalyptic',
    name: { en: 'Post-Apocalyptic', ko: '포스트 아포칼립스', ja: 'ポスト・アポカリプス' },
    description: {
      en: 'A broken world, desperate survivors, and hope in the ruins.',
      ko: '무너진 세계, 절박한 생존자, 그리고 폐허 속 희망.',
      ja: '崩壊した世界、必死の生存者、廃墟の中の希望。',
    },
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
