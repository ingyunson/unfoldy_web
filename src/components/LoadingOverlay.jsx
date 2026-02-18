import { useGame } from '../store/useGameStore';

export default function LoadingOverlay() {
  const { genre, currentTurn, maxTurns } = useGame();

  const messages = [
    'Weaving the narrative threads...',
    'Painting the scene...',
    'The story unfolds...',
    'Crafting your destiny...',
    'Shaping the world around you...',
  ];

  const message = messages[Math.floor(Math.random() * messages.length)];

  return (
    <div className="loading-screen">
      <div className="loading-orb" />
      <p className="loading-text">{message}</p>
      <p className="loading-info">
        {genre} · Turn {currentTurn} of {maxTurns}
      </p>
    </div>
  );
}
