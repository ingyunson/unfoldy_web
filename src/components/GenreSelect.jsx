import { GENRES } from '../config/styleConfig';
import { useGame } from '../store/useGameStore';

export default function GenreSelect() {
  const { startGame } = useGame();

  return (
    <div className="genre-screen">
      <header className="genre-header">
        <h1 className="genre-logo">Unfoldy</h1>
        <p className="genre-subtitle">Choose your story. Shape your fate.</p>
      </header>

      <div className="genre-grid">
        {GENRES.map((genre) => (
          <button
            key={genre.id}
            id={`genre-${genre.id}`}
            className="genre-card"
            style={{ '--card-accent': genre.color }}
            onClick={() => startGame(genre)}
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
