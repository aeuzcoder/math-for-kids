"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import confetti from "canvas-confetti";
import { sound } from "@/lib/sound";
import { PlayerStats, Achievement } from "@/lib/types";
import { INITIAL_ACHIEVEMENTS } from "@/lib/data";

interface GameContextType {
  stats: PlayerStats;
  achievements: Achievement[];
  soundEnabled: boolean;
  activeGameId: string | null;
  setActiveGameId: (id: string | null) => void;
  toggleSound: () => void;
  updateName: (name: string) => void;
  updateAvatar: (avatar: string) => void;
  addReward: (stars: number, coins: number, xp?: number) => void;
  spendCoins: (amount: number) => boolean;
  buyItem: (itemId: string, price: number) => boolean;
  recordGameFinished: (gameId: string, won: boolean) => void;
  unlockAchievement: (achId: string) => void;
  claimDailyReward: () => { coins: number; stars: number } | null;
  triggerConfetti: () => void;
  levelInfo: { level: number; name: string; progress: number; currentXp: number; nextXp: number };
}

const STORAGE_KEY = "matemik_player_stats_ru_v1";

const DEFAULT_STATS: PlayerStats = {
  name: "Юный Гений",
  avatar: "🦁",
  stars: 12,
  coins: 45,
  xp: 120,
  streak: 3,
  gamesPlayed: 4,
  solvedProblems: 15,
  unlockedItemIds: ["sticker_medal"],
  achievements: { first_game: true },
  dailyClaimedDate: null,
};

const LEVELS = [
  { minXp: 0, level: 1, name: "Начинающий Счетовод" },
  { minXp: 100, level: 2, name: "Маленький Мудрец" },
  { minXp: 250, level: 3, name: "Умный Математик" },
  { minXp: 500, level: 4, name: "Знаток Созвездий" },
  { minXp: 900, level: 5, name: "Волшебный Пифагор" },
  { minXp: 1500, level: 6, name: "Космический Чемпион" },
];

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stats, setStats] = useState<PlayerStats>(DEFAULT_STATS);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load from local storage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setStats((prev) => ({ ...prev, ...parsed }));
        }
        const savedSound = localStorage.getItem("matemik_sound_enabled");
        if (savedSound !== null) {
          const enabled = savedSound === "true";
          setSoundEnabled(enabled);
          sound.setEnabled(enabled);
        }
      } catch {
        // Fallback to defaults
      }
      setIsLoaded(true);
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
      } catch {
        // Ignore
      }
    }
  }, [stats, isLoaded]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      sound.setEnabled(next);
      if (typeof window !== "undefined") {
        localStorage.setItem("matemik_sound_enabled", String(next));
      }
      if (next) sound.playClick();
      return next;
    });
  }, []);

  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"],
      });
    } catch {
      // Fallback
    }
  }, []);

  const updateName = useCallback((name: string) => {
    setStats((prev) => ({ ...prev, name: name.trim() || "Юный Гений" }));
  }, []);

  const updateAvatar = useCallback((avatar: string) => {
    setStats((prev) => ({ ...prev, avatar }));
    sound.playClick();
  }, []);

  const unlockAchievement = useCallback((achId: string) => {
    setStats((prev) => {
      if (prev.achievements[achId]) return prev;
      const ach = INITIAL_ACHIEVEMENTS.find((a) => a.id === achId);
      const bonus = ach ? ach.rewardCoins : 20;
      sound.playFanfare();
      triggerConfetti();
      return {
        ...prev,
        coins: prev.coins + bonus,
        stars: prev.stars + 5,
        achievements: { ...prev.achievements, [achId]: true },
      };
    });
  }, [triggerConfetti]);

  const addReward = useCallback((stars: number, coins: number, xp = 25) => {
    setStats((prev) => {
      const nextCoins = prev.coins + coins;
      const nextStars = prev.stars + stars;
      const nextXp = prev.xp + xp;
      const nextSolved = prev.solvedProblems + 1;

      // Auto check coin achievement
      const newAchievements: Record<string, boolean> = { ...prev.achievements };
      if (nextCoins >= 100 && !newAchievements["coin_rich"]) {
        newAchievements["coin_rich"] = true;
      }

      return {
        ...prev,
        coins: nextCoins,
        stars: nextStars,
        xp: nextXp,
        solvedProblems: nextSolved,
        achievements: newAchievements,
      };
    });
    sound.playCoin();
  }, []);

  const spendCoins = useCallback((amount: number): boolean => {
    if (stats.coins < amount) {
      sound.playWrong();
      return false;
    }
    setStats((prev) => ({ ...prev, coins: prev.coins - amount }));
    sound.playCoin();
    return true;
  }, [stats.coins]);

  const buyItem = useCallback((itemId: string, price: number): boolean => {
    if (stats.coins < price || stats.unlockedItemIds.includes(itemId)) {
      sound.playWrong();
      return false;
    }
    setStats((prev) => ({
      ...prev,
      coins: prev.coins - price,
      unlockedItemIds: [...prev.unlockedItemIds, itemId],
    }));
    sound.playFanfare();
    triggerConfetti();
    return true;
  }, [stats.coins, stats.unlockedItemIds, triggerConfetti]);

  const recordGameFinished = useCallback((gameId: string, won: boolean) => {
    setStats((prev) => {
      const newPlayed = prev.gamesPlayed + 1;
      const newAchievements: Record<string, boolean> = { ...prev.achievements, first_game: true };

      if (gameId === "balloon" && won) newAchievements["balloon_master"] = true;
      if (gameId === "rocket" && won) newAchievements["rocket_champion"] = true;
      if (gameId === "memory" && won) newAchievements["memory_genius"] = true;
      if (gameId === "pizza" && won) newAchievements["pizza_chef"] = true;

      return {
        ...prev,
        gamesPlayed: newPlayed,
        achievements: newAchievements,
      };
    });
  }, []);

  const claimDailyReward = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (stats.dailyClaimedDate === today) {
      sound.playWrong();
      return null;
    }
    const reward = { coins: 30, stars: 5 };
    setStats((prev) => ({
      ...prev,
      coins: prev.coins + reward.coins,
      stars: prev.stars + reward.stars,
      streak: prev.streak + 1,
      dailyClaimedDate: today,
    }));
    sound.playFanfare();
    triggerConfetti();
    return reward;
  }, [stats.dailyClaimedDate, triggerConfetti]);

  // Calculate Level and Progress
  const currentXp = stats.xp;
  let currentLevelObj = LEVELS[0];
  let nextLevelObj = LEVELS[1];

  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (currentXp >= LEVELS[i].minXp) {
      currentLevelObj = LEVELS[i];
      nextLevelObj = LEVELS[i + 1] || { minXp: currentLevelObj.minXp + 500, level: currentLevelObj.level + 1, name: "Легендарный Пифагор" };
      break;
    }
  }

  const xpInThisLevel = currentXp - currentLevelObj.minXp;
  const xpNeeded = nextLevelObj.minXp - currentLevelObj.minXp;
  const progressPercent = Math.min(100, Math.round((xpInThisLevel / (xpNeeded || 1)) * 100));

  const levelInfo = {
    level: currentLevelObj.level,
    name: currentLevelObj.name,
    progress: progressPercent,
    currentXp: stats.xp,
    nextXp: nextLevelObj.minXp,
  };

  const fullAchievements: Achievement[] = INITIAL_ACHIEVEMENTS.map((ach) => ({
    ...ach,
    unlocked: !!stats.achievements[ach.id],
  }));

  return (
    <GameContext.Provider
      value={{
        stats,
        achievements: fullAchievements,
        soundEnabled,
        activeGameId,
        setActiveGameId,
        toggleSound,
        updateName,
        updateAvatar,
        addReward,
        spendCoins,
        buyItem,
        recordGameFinished,
        unlockAchievement,
        claimDailyReward,
        triggerConfetti,
        levelInfo,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within a GameProvider");
  return ctx;
};
