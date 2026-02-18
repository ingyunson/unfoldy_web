import { useGame } from '../store/useGameStore';

export default function StoryTurn() {
  const {
    currentTurn,
    maxTurns,
    currentNarrative,
    currentImage,
    currentChoices,
    genreColor,
    usedFallback,
    makeChoice,
    resetGame,
  } = useGame();

  const progressPercent = (currentTurn / maxTurns) * 100;

  return (
    <div className="story-screen">
      {/* Turn Progress Bar */}
      <div className="turn-bar">
        <span className="turn-label">Turn</span>
        <div className="turn-progress-track">
          <div
            className="turn-progress-fill"
            style={{
              width: `${progressPercent}%`,
              background: `linear-gradient(90deg, ${genreColor}, ${genreColor}88)`,
            }}
          />
        </div>
        <span className="turn-badge">
          {currentTurn}/{maxTurns}
        </span>
        <button
          className="quit-button"
          onClick={resetGame}
          title="Quit Story"
        >
          ✕
        </button>
      </div>

      {/* Story Image */}
      <div className="story-image-container">
        {currentImage ? (
          <img
            className="story-image"
            src={currentImage}
            alt={`Story scene - Turn ${currentTurn}`}
          />
        ) : (
          <div className="story-image-placeholder">🎭</div>
        )}
        <div className="story-image-overlay" />
      </div>

      {/* Story Content */}
      <div className="story-content">
        {usedFallback && (
          <span className="fallback-badge">⚡ Using backup AI</span>
        )}

        <p className="story-narrative">{currentNarrative}</p>

        {/* Choices */}
        {currentChoices.length > 0 && (
          <div className="choices-section">
            <p className="choices-label">What will you do?</p>
            {currentChoices.map((choice, index) => (
              <button
                key={index}
                id={`choice-${index}`}
                className="choice-button"
                onClick={() => makeChoice(choice)}
              >
                <span className="choice-number">{index + 1}</span>
                {choice}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
