import { useState, useEffect, useCallback, useRef } from 'react';
import { useGame } from '../store/useGameStore';

export default function SplashScreen() {
  const { dismissSplash } = useGame();
  const [fading, setFading] = useState(false);
  const hasTriggered = useRef(false);

  const handleTransition = useCallback(() => {
    if (hasTriggered.current) return;
    hasTriggered.current = true;
    setFading(true);
    setTimeout(() => {
      dismissSplash();
    }, 600);
  }, [dismissSplash]);

  // Fixed 3 second display, then fade out
  useEffect(() => {
    const timer = setTimeout(handleTransition, 3000);
    return () => clearTimeout(timer);
  }, [handleTransition]);

  return (
    <div className={`splash-screen ${fading ? 'splash-fade-out' : ''}`}>
      <div className="splash-content">
        <div className="splash-text-group">
          <h1 className="splash-title">UNFOLDY</h1>
          <p className="splash-subtitle">Stories Unfold with You</p>
        </div>

        <div className="splash-tree-container">
          <img
            className="splash-tree"
            src="/splash_tree.png"
            alt="A magical tree with unfolding paper leaves"
          />
        </div>
      </div>
    </div>
  );
}
