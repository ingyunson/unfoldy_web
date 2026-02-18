import { useGame } from '../store/useGameStore';

export default function Epilogue() {
  const { currentNarrative, currentImage, genre, resetGame } = useGame();

  return (
    <div className="epilogue-screen">
      {/* Final Image */}
      <div className="story-image-container">
        {currentImage ? (
          <img
            className="story-image"
            src={currentImage}
            alt="Story epilogue scene"
          />
        ) : (
          <div className="story-image-placeholder">✨</div>
        )}
        <div className="story-image-overlay" />
      </div>

      <div className="epilogue-badge">
        <span>The End</span>
      </div>

      <div className="epilogue-content">
        <h2 className="epilogue-title">Your {genre} Story</h2>
        <p className="story-narrative">{currentNarrative}</p>

        <button
          id="play-again"
          className="play-again-button"
          onClick={resetGame}
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
