"use client";

import React from "react";
import { useGame } from "@/context/GameContext";
import { 
  Volume2, 
  VolumeX, 
  ShoppingBag, 
  Trophy, 
  Gift, 
  Flame, 
  Sparkles,
  Home
} from "lucide-react";

interface NavbarProps {
  onOpenShop: () => void;
  onOpenAchievements: () => void;
  onOpenDaily: () => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenShop,
  onOpenAchievements,
  onOpenDaily,
  onOpenProfile,
}) => {
  const { 
    stats, 
    soundEnabled, 
    toggleSound, 
    levelInfo, 
    activeGameId, 
    setActiveGameId 
  } = useGame();

  const [hasDailyGift, setHasDailyGift] = React.useState<boolean>(false);

  React.useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setHasDailyGift(stats.dailyClaimedDate !== today);
  }, [stats.dailyClaimedDate]);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b-2 border-amber-200/60 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand / Logo */}
        <button
          onClick={() => setActiveGameId(null)}
          className="flex items-center gap-3 text-left group transition-transform active:scale-95"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-orange-400 flex items-center justify-center text-2xl shadow-md border-2 border-amber-300 group-hover:rotate-6 transition-transform">
            📐
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-orange-500 via-amber-600 to-pink-500 bg-clip-text text-transparent">
                Умная Математика
              </span>
              <span className="text-xs px-2 py-0.5 font-bold rounded-full bg-pink-100 text-pink-600 border border-pink-200">
                Дети
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 hidden sm:block">
              Мир весёлых и полезных игр
            </p>
          </div>
        </button>

        {/* Home button if in game */}
        {activeGameId && (
          <button
            onClick={() => setActiveGameId(null)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-sm border-2 border-blue-200 transition-colors shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span className="hidden md:inline">На главную</span>
          </button>
        )}

        {/* Center/Right stats & actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Daily Streak */}
          <div 
            title="Серия дней подряд"
            className="flex items-center gap-1 bg-orange-50 border-2 border-orange-200 px-2.5 py-1.5 rounded-2xl text-orange-700 font-extrabold text-xs sm:text-sm shadow-sm"
          >
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-bounce" />
            <span>{stats.streak} дн.</span>
          </div>

          {/* Stars */}
          <div 
            title="Звёзды"
            className="flex items-center gap-1 bg-yellow-50 border-2 border-yellow-200 px-2.5 py-1.5 rounded-2xl text-yellow-700 font-extrabold text-xs sm:text-sm shadow-sm"
          >
            <span className="text-base">⭐</span>
            <span>{stats.stars}</span>
          </div>

          {/* Coins */}
          <div 
            title="Золотые монеты"
            className="flex items-center gap-1 bg-amber-50 border-2 border-amber-300 px-3 py-1.5 rounded-2xl text-amber-800 font-extrabold text-xs sm:text-sm shadow-sm"
          >
            <span className="text-base">🪙</span>
            <span>{stats.coins}</span>
          </div>

          {/* Daily Gift Button */}
          <button
            onClick={onOpenDaily}
            className={`relative p-2 rounded-2xl border-2 transition-all active:scale-95 shadow-sm ${
              hasDailyGift
                ? "bg-gradient-to-tr from-pink-500 to-rose-400 text-white border-pink-400 animate-pulse-subtle"
                : "bg-slate-50 text-slate-400 border-slate-200"
            }`}
            title="Ежедневный подарок"
          >
            <Gift className="w-5 h-5" />
            {hasDailyGift && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-yellow-300 rounded-full border-2 border-white animate-ping" />
            )}
          </button>

          {/* Shop Button */}
          <button
            onClick={onOpenShop}
            className="p-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-2 border-emerald-300 transition-transform active:scale-95 shadow-sm"
            title="Магазин наград"
          >
            <ShoppingBag className="w-5 h-5" />
          </button>

          {/* Achievements Button */}
          <button
            onClick={onOpenAchievements}
            className="p-2 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 border-2 border-purple-300 transition-transform active:scale-95 shadow-sm"
            title="Мои достижения"
          >
            <Trophy className="w-5 h-5" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-2xl border-2 transition-colors active:scale-95 shadow-sm ${
              soundEnabled
                ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                : "bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200"
            }`}
            title={soundEnabled ? "Выключить звук" : "Включить звук"}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Profile Pill */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-2xl bg-gradient-to-r from-sky-100 to-indigo-100 hover:from-sky-200 hover:to-indigo-200 border-2 border-sky-300 text-slate-800 transition-transform active:scale-95 shadow-sm"
          >
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-lg shadow-inner border border-sky-200">
              {stats.avatar}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold leading-tight text-slate-800 truncate max-w-[90px]">
                {stats.name}
              </p>
              <div className="flex items-center gap-1 text-[10px] font-extrabold text-indigo-600">
                <Sparkles className="w-2.5 h-2.5" />
                <span>{levelInfo.level} ур.</span>
              </div>
            </div>
          </button>

        </div>

      </div>
    </header>
  );
};
