import { useEffect, useCallback } from 'react';
import { useGame } from './store/useGameStore';
import { generateStoryContent, generateImage } from './services/storyService';
import GenreSelect from './components/GenreSelect';
import StoryTurn from './components/StoryTurn';
import LoadingOverlay from './components/LoadingOverlay';
import Epilogue from './components/Epilogue';

function App() {
  const {
    gamePhase,
    currentTurn,
    maxTurns,
    language,
    genre,
    artStylePrompt,
    history,
    isLoading,
    error,
    setTurnContent,
    setError,
    resetGame,
  } = useGame();

  /**
   * Generate content for the current turn.
   * Called when the game enters a 'loading' phase (on start, or after a choice).
   */
  const generateTurn = useCallback(async () => {
    try {
      const storyState = {
        currentTurn,
        maxTurns,
        language,
        genre,
        artStylePrompt,
        history,
      };

      // Generate text + choices
      const content = await generateStoryContent(storyState);

      // Generate image in parallel (or after text, doesn't block choices)
      let image = null;
      if (content.imagePrompt) {
        try {
          image = await generateImage(content.imagePrompt, artStylePrompt);
        } catch (imgErr) {
          console.warn('Image generation failed:', imgErr.message);
        }
      }

      setTurnContent({
        narrative: content.narrative,
        image,
        choices: content.choices,
        usedFallback: content.usedFallback,
      });
    } catch (err) {
      console.error('Turn generation failed:', err);
      setError(err.message);
    }
  }, [currentTurn, maxTurns, language, genre, artStylePrompt, history, setTurnContent, setError]);

  // Trigger generation when entering loading state
  useEffect(() => {
    if (isLoading && gamePhase === 'loading') {
      generateTurn();
    }
  }, [isLoading, gamePhase, generateTurn]);

  return (
    <div className="app">
      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <strong>⚠ Something went wrong</strong>
          {error}
          <button className="retry-button" onClick={() => generateTurn()}>
            Retry
          </button>
          <button
            className="retry-button"
            style={{ marginLeft: 8 }}
            onClick={resetGame}
          >
            Back to Menu
          </button>
        </div>
      )}

      {/* Screen Router */}
      {gamePhase === 'menu' && <GenreSelect />}
      {gamePhase === 'loading' && <LoadingOverlay />}
      {gamePhase === 'playing' && <StoryTurn />}
      {gamePhase === 'epilogue' && <Epilogue />}
    </div>
  );
}

export default App;
