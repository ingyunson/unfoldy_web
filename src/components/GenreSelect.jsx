import { useState } from 'react';
import { GENRES } from '../config/styleConfig';
import { useGame } from '../store/useGameStore';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
];

export default function GenreSelect() {
  const { startGame } = useGame();
  const [language, setLanguage] = useState('English');

  return (
    <div className="genre-screen">
      <header className="genre-header">
        <h1 className="genre-logo">Unfoldy</h1>
        <p className="genre-subtitle">Choose your story. Shape your fate.</p>

        {/* Language Selector */}
        <div className="language-selector">
          <select
            id="language-select"
            className="language-dropdown"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.label}>
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
            onClick={() => startGame(genre, language)}
          >
            <span className="genre-emoji">{genre.emoji}</span>
            <h3 className="genre-name">{genre.name}</h3>
            <p className="genre-desc">{genre.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
