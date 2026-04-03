import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface Settings {
  username: string;
  bonusEnabled: boolean;
  constant: number;
}

export interface Stats {
  highScore: number;
  bestTissueAverage: number;
}

interface SettingsContextValue {
  settings: Settings;
  stats: Stats;
  updateSettings: (partial: Partial<Settings>) => Promise<void>;
  updateStats: (finalScore: number, tissueAverage: number) => Promise<void>;
  resetStats: () => Promise<void>;
  isLoaded: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  username: "Player",
  bonusEnabled: true,
  constant: 4,
};

const DEFAULT_STATS: Stats = {
  highScore: 0,
  bestTissueAverage: 0,
};

const SETTINGS_KEY = "@tpg_settings";
const STATS_KEY = "@tpg_stats";

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [settingsRaw, statsRaw] = await Promise.all([
          AsyncStorage.getItem(SETTINGS_KEY),
          AsyncStorage.getItem(STATS_KEY),
        ]);
        if (settingsRaw) setSettings(JSON.parse(settingsRaw));
        if (statsRaw) setStats(JSON.parse(statsRaw));
      } catch (_) {
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  const updateSettings = useCallback(async (partial: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const updateStats = useCallback(
    async (finalScore: number, tissueAverage: number) => {
      setStats((prev) => {
        const next: Stats = {
          highScore: Math.max(prev.highScore, finalScore),
          bestTissueAverage:
            prev.bestTissueAverage === 0
              ? tissueAverage
              : tissueAverage < prev.bestTissueAverage
                ? tissueAverage
                : prev.bestTissueAverage,
        };
        AsyncStorage.setItem(STATS_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    []
  );

  const resetStats = useCallback(async () => {
    setStats(DEFAULT_STATS);
    await AsyncStorage.removeItem(STATS_KEY);
  }, []);

  return (
    <SettingsContext.Provider
      value={{ settings, stats, updateSettings, updateStats, resetStats, isLoaded }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
