export type AgeGroup = "all" | "preschool" | "grade1_2" | "grade3_4";

export interface GameInfo {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  badge: string;
  color: string;
  bgColor: string;
  borderColor: string;
  accentColor: string;
  ageGroup: "preschool" | "grade1_2" | "grade3_4" | "all";
  ageLabel: string;
  skills: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  rewardCoins: number;
}

export interface ShopItem {
  id: string;
  name: string;
  category: "avatar" | "hat" | "sticker" | "badge";
  emoji: string;
  price: number;
  unlocked: boolean;
  equipped?: boolean;
}

export interface PlayerStats {
  name: string;
  avatar: string;
  stars: number;
  coins: number;
  xp: number;
  streak: number;
  gamesPlayed: number;
  solvedProblems: number;
  unlockedItemIds: string[];
  achievements: Record<string, boolean>;
  dailyClaimedDate: string | null;
}

