/**
 * Game Store - React Context + useReducer state management.
 * Manages story state, turn progression, and localStorage persistence.
 */

import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { MAX_TURNS } from '../config/styleConfig';

const STORAGE_KEY = 'unfoldy-game-state';

// ─── Initial State ───────────────────────────────────
const initialState = {
  gamePhase: 'menu', // 'menu' | 'playing' | 'loading' | 'epilogue'
  currentTurn: 1,
  maxTurns: MAX_TURNS,
  language: 'English',
  genre: '',
  genreId: '',
  artStylePrompt: '',
  genreColor: '#e040fb',
  history: [],
  currentNarrative: '',
  currentImage: null,
  currentChoices: [],
  isLoading: false,
  error: null,
  usedFallback: false,
};

// ─── Actions ─────────────────────────────────────────
const ACTIONS = {
  START_GAME: 'START_GAME',
  SET_LOADING: 'SET_LOADING',
  SET_TURN_CONTENT: 'SET_TURN_CONTENT',
  MAKE_CHOICE: 'MAKE_CHOICE',
  SET_ERROR: 'SET_ERROR',
  RESET_GAME: 'RESET_GAME',
  RESTORE_STATE: 'RESTORE_STATE',
};

// ─── Reducer ─────────────────────────────────────────
function gameReducer(state, action) {
  switch (action.type) {
    case ACTIONS.START_GAME:
      return {
        ...initialState,
        gamePhase: 'loading',
        language: action.payload.language,
        genre: action.payload.genre,
        genreId: action.payload.genreId,
        artStylePrompt: action.payload.artStylePrompt,
        genreColor: action.payload.color,
        currentTurn: 1,
        isLoading: true,
      };

    case ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
        gamePhase: action.payload ? 'loading' : state.gamePhase,
      };

    case ACTIONS.SET_TURN_CONTENT:
      return {
        ...state,
        gamePhase: state.currentTurn >= state.maxTurns ? 'epilogue' : 'playing',
        currentNarrative: action.payload.narrative,
        currentImage: action.payload.image,
        currentChoices: action.payload.choices || [],
        isLoading: false,
        error: null,
        usedFallback: action.payload.usedFallback || false,
      };

    case ACTIONS.MAKE_CHOICE: {
      const newHistory = [
        ...state.history,
        {
          turn: state.currentTurn,
          narrative: state.currentNarrative,
          image: state.currentImage,
          choiceMade: action.payload.choiceText,
        },
      ];
      return {
        ...state,
        history: newHistory,
        currentTurn: state.currentTurn + 1,
        isLoading: true,
        gamePhase: 'loading',
        currentChoices: [],
      };
    }

    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        gamePhase: state.history.length > 0 ? 'playing' : 'menu',
      };

    case ACTIONS.RESET_GAME:
      localStorage.removeItem(STORAGE_KEY);
      return { ...initialState };

    case ACTIONS.RESTORE_STATE:
      return { ...action.payload, isLoading: false };

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────
const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Restore state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only restore if there's an active game
        if (parsed.gamePhase !== 'menu' && parsed.history.length > 0) {
          dispatch({ type: ACTIONS.RESTORE_STATE, payload: parsed });
        }
      }
    } catch {
      console.warn('Failed to restore game state');
    }
  }, []);

  // Auto-save to localStorage on state change (but not loading states)
  useEffect(() => {
    if (state.gamePhase !== 'menu' && !state.isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        console.warn('Failed to save game state');
      }
    }
  }, [state]);

  const startGame = useCallback(
    (genreData, language) => {
      dispatch({
        type: ACTIONS.START_GAME,
        payload: {
          language,
          genre: genreData.name,
          genreId: genreData.id,
          artStylePrompt: genreData.artStylePrompt,
          color: genreData.color,
        },
      });
    },
    []
  );

  const setTurnContent = useCallback(
    (content) => {
      dispatch({ type: ACTIONS.SET_TURN_CONTENT, payload: content });
    },
    []
  );

  const makeChoice = useCallback(
    (choiceText) => {
      dispatch({ type: ACTIONS.MAKE_CHOICE, payload: { choiceText } });
    },
    []
  );

  const setError = useCallback(
    (error) => {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error });
    },
    []
  );

  const setLoading = useCallback(
    (loading) => {
      dispatch({ type: ACTIONS.SET_LOADING, payload: loading });
    },
    []
  );

  const resetGame = useCallback(() => {
    dispatch({ type: ACTIONS.RESET_GAME });
  }, []);

  return (
    <GameContext.Provider
      value={{
        ...state,
        startGame,
        setTurnContent,
        makeChoice,
        setError,
        setLoading,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
