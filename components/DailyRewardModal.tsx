"use client";

import React, { useState, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import { X, Gift, Sparkles } from "lucide-react";

interface DailyRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({ isOpen, onClose }) => {
  const { stats, claimDailyReward } = useGame();
  const [opened, setOpened] = useState(false);
  const [isAlreadyClaimed, setIsAlreadyClaimed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const today = new Date().toISOString().slice(0, 10);
      setIsAlreadyClaimed(stats.dailyClaimedDate === today);
    }
  }, [stats.dailyClaimedDate, isOpen]);

  if (!isOpen) return null;

  const handleOpenBox = () => {
    if (isAlreadyClaimed) return;
    const res = claimDailyReward();
    if (res) {
      setOpened(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full border-4 border-pink-300 shadow-2xl overflow-hidden animate-scale-up text-center">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-400 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-yellow-300" />
            <h3 className="font-extrabold text-lg">Ежедневный Подарок</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center">
          {isAlreadyClaimed || opened ? (
            <div className="space-y-4 my-2">
              <div className="w-24 h-24 rounded-3xl bg-pink-50 border-3 border-pink-200 flex items-center justify-center text-5xl mx-auto shadow-inner animate-bounce">
                🎉
              </div>
              <h4 className="font-black text-xl text-slate-800">
                {opened ? "Поздравляем!" : "Подарок уже получен!"}
              </h4>
              <p className="text-xs text-slate-600 font-medium">
                {opened
                  ? "Вы получили +30 золотых монет и +5 звёздочек!"
                  : "Возвращайтесь завтра за новым подарком и держите серию!"}
              </p>
              <div className="flex justify-center gap-4 bg-amber-50 p-3 rounded-2xl border border-amber-200">
                <div className="flex items-center gap-1 font-black text-amber-700">
                  <span>🪙</span>
                  <span>+30 Монет</span>
                </div>
                <div className="flex items-center gap-1 font-black text-yellow-700">
                  <span>⭐</span>
                  <span>+5 Звёзд</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-sm shadow-md active:scale-95 transition-all"
              >
                Отлично
              </button>
            </div>
          ) : (
            <div className="space-y-4 my-2">
              <div 
                onClick={handleOpenBox}
                className="cursor-pointer group relative w-28 h-28 rounded-3xl bg-gradient-to-tr from-pink-400 to-rose-300 border-4 border-pink-300 flex items-center justify-center text-6xl mx-auto shadow-xl hover:scale-105 active:scale-95 transition-all animate-pulse-subtle"
              >
                🎁
                <Sparkles className="absolute -top-2 -right-2 w-7 h-7 text-yellow-300 animate-spin" />
              </div>
              <div>
                <h4 className="font-black text-lg text-slate-800">
                  Нажмите на коробку, чтобы открыть!
                </h4>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  Заходите каждый день и не прерывайте серию ({stats.streak} дн. подряд!)
                </p>
              </div>
              <button
                onClick={handleOpenBox}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-black text-base shadow-lg shadow-pink-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Открыть подарок</span>
                <span>✨</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
