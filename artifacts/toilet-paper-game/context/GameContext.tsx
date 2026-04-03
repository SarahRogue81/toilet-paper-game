import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type GamePhase = "idle" | "playing" | "ended";

export interface WipeEntry {
  squares: number;
  scoreDelta: number;
  scoreAfter: number;
  bonusAfter: number;
}

export interface GameState {
  phase: GamePhase;
  score: number;
  bonus: number;
  bonusEnabled: boolean;
  wipes: WipeEntry[];
  finalScore: number | null;
  totalSquares: number;
}

interface GameContextValue {
  game: GameState;
  startGame: (constant: number, bonusEnabled: boolean) => void;
  recordWipe: (squares: number, constant: number) => void;
  endGame: () => void;
  resetGame: () => void;
}

const GAME_KEY = "@tpg_game";

const INITIAL_GAME: GameState = {
  phase: "idle",
  score: 0,
  bonus: 0,
  bonusEnabled: true,
  wipes: [],
  finalScore: null,
  totalSquares: 0,
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [game, setGame] = useState<GameState>(INITIAL_GAME);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(GAME_KEY);
        if (raw) {
          const saved: GameState = JSON.parse(raw);
          if (saved.phase === "playing") {
            setGame(saved);
          }
        }
      } catch (_) {}
    })();
  }, []);

  const persist = useCallback((state: GameState) => {
    AsyncStorage.setItem(GAME_KEY, JSON.stringify(state)).catch(() => {});
  }, []);

  const startGame = useCallback(
    (constant: number, bonusEnabled: boolean) => {
      const newGame: GameState = {
        phase: "playing",
        score: 0,
        bonus: bonusEnabled ? constant : 0,
        bonusEnabled,
        wipes: [],
        finalScore: null,
        totalSquares: 0,
      };
      setGame(newGame);
      persist(newGame);
    },
    [persist]
  );

  const recordWipe = useCallback(
    (squares: number, constant: number) => {
      setGame((prev) => {
        if (prev.phase !== "playing") return prev;

        const doubleConstant = constant * 2;

        const delta = constant - squares;
        let newScore = prev.score + delta;
        let newBonus = prev.bonus;

        if (prev.bonusEnabled) {
          // Bonus absorbs negative score only when bonus is positive
          if (newScore < 0 && newBonus > 0) {
            newBonus += newScore;
            newScore = 0;
          }

          // If absorbing pushed bonus negative, overflow goes to score and bonus resets
          if (newBonus < 0) {
            newScore += newBonus;
            newBonus = 0;
          }

          // Bonus grows at every new multiple of K*2
          const prevMultiple = Math.floor(Math.max(0, prev.score) / doubleConstant);
          const newMultiple = Math.floor(Math.max(0, newScore) / doubleConstant);
          if (newMultiple > prevMultiple && newScore >= doubleConstant) {
            newBonus += (newMultiple - prevMultiple) * constant;
          }
        }

        const wipeEntry: WipeEntry = {
          squares,
          scoreDelta: constant - squares,
          scoreAfter: newScore,
          bonusAfter: newBonus,
        };

        const next: GameState = {
          ...prev,
          score: newScore,
          bonus: newBonus,
          wipes: [...prev.wipes, wipeEntry],
          totalSquares: prev.totalSquares + squares,
        };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const endGame = useCallback(() => {
    setGame((prev) => {
      if (prev.phase !== "playing") return prev;
      const finalScore = prev.bonusEnabled
        ? prev.score + prev.bonus
        : prev.score;
      const next: GameState = {
        ...prev,
        phase: "ended",
        finalScore,
      };
      AsyncStorage.removeItem(GAME_KEY).catch(() => {});
      return next;
    });
  }, []);

  const resetGame = useCallback(() => {
    setGame(INITIAL_GAME);
    AsyncStorage.removeItem(GAME_KEY).catch(() => {});
  }, []);

  return (
    <GameContext.Provider
      value={{ game, startGame, recordWipe, endGame, resetGame }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
