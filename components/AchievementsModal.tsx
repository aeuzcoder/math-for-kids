"use client";

import React from "react";
import { useGame } from "@/context/GameContext";
import { X, CheckCircle2, Lock } from "lucide-react";

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ isOpen, onClose }) => {
  const { achievements } = useGame();

  if (!isOpen) return null;

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full border-4 border-purple-300 shadow-2xl overflow-hidden animate-scale-up flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl border border-white/30">
              🏆
            </div>
            <div>
              <h3 className="font-extrabold text-xl">Мои Достижения</h3>
              <p className="text-purple-200 text-xs font-semibold">
                Открыто наград: {unlockedCount} из {achievements.length}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of achievements */}
        <div className="p-6 overflow-y-auto space-y-3.5">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-4 transition-all ${
                ach.unlocked
                  ? "bg-purple-50/70 border-purple-200 shadow-sm"
                  : "bg-slate-50 border-slate-200 opacity-60"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm ${
                  ach.unlocked ? "bg-white border-2 border-purple-200" : "bg-slate-200"
                }`}>
                  {ach.unlocked ? ach.icon : "🔒"}
                </div>
                <div>
                  <h4 className="font-black text-sm text-slate-800">
                    {ach.title}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    {ach.description}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md w-fit">
                    <span>Награда: +{ach.rewardCoins} 🪙</span>
                  </div>
                </div>
              </div>

              <div>
                {ach.unlocked ? (
                  <span className="p-2 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </span>
                ) : (
                  <span className="p-2 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
