import { useState, useEffect } from 'react';
import { GENRES } from '../config/styleConfig';
import { useGame } from '../store/useGameStore';

const LANGUAGES = [
  { code: 'ko', label: '한국어', flag: '🇰🇷', langName: '한국어' },
  { code: 'en', label: 'English', flag: '🇺🇸', langName: 'English' },
  { code: 'ja', label: '日本語', flag: '🇯🇵', langName: '日本語' },
];

// UI text translations
const UI_TEXT = {
  ko: {
    subtitle: '당신의 이야기를 선택하세요. 운명을 만들어가세요.',
  },
  en: {
    subtitle: 'Choose your story. Shape your fate.',
  },
  ja: {
    subtitle: 'あなたの物語を選んでください。運命を切り拓こう。',
  },
};

/**
 * Detect the user's likely language by their IP geolocation.
 * Uses the free ip-api.com service.
 * Returns 'ko' for Korea, 'ja' for Japan, 'en' for everything else.
 */
async function detectLanguageFromIP() {
  try {
    const response = await fetch('http://ip-api.com/json/?fields=countryCode', {
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return 'ko'; // fallback
    const data = await response.json();
    const countryCode = data.countryCode;
    if (countryCode === 'KR') return 'ko';
    if (countryCode === 'JP') return 'ja';
    return 'en';
  } catch {
    return 'ko'; // fallback to Korean
  }
}

export default function GenreSelect() {
  const { startGame } = useGame();
  const [langCode, setLangCode] = useState('ko'); // default Korean
  const [langDetected, setLangDetected] = useState(false);

  // Detect language from IP on mount
  useEffect(() => {
    detectLanguageFromIP().then((code) => {
      setLangCode(code);
      setLangDetected(true);
    });
  }, []);

  // Get the language label for startGame (used in story generation prompts)
  const langLabel = LANGUAGES.find((l) => l.code === langCode)?.label || '한국어';

  return (
    <div className="genre-screen">
      <header className="genre-header">
        <h1 className="genre-logo">Unfoldy</h1>
        <p className="genre-subtitle">{UI_TEXT[langCode]?.subtitle}</p>

        {/* Language Selector */}
        <div className="language-selector">
          <select
            id="language-select"
            className="language-dropdown"
            value={langCode}
            onChange={(e) => setLangCode(e.target.value)}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.label}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="genre-grid">
        {GENRES.map((genre) => (
          <button
            key={genre.id}
            id={`genre-${genre.id}`}
            className="genre-card"
            style={{ '--card-accent': genre.color }}
            onClick={() => startGame({ ...genre, name: genre.name.en }, langLabel)}
          >
            <span className="genre-emoji">{genre.emoji}</span>
            <h3 className="genre-name">{genre.name[langCode] || genre.name.en}</h3>
            <p className="genre-desc">{genre.description[langCode] || genre.description.en}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
