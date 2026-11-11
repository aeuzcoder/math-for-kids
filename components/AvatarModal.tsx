"use client";

import React, { useState } from "react";
import { useGame } from "@/context/GameContext";
import { AVATAR_OPTIONS } from "@/lib/data";
import { X, Check } from "lucide-react";

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AvatarModal: React.FC<AvatarModalProps> = ({ isOpen, onClose }) => {
  const { stats, updateAvatar, updateName, levelInfo } = useGame();
  const [nameInput, setNameInput] = useState(stats.name);
  const [selectedAvatar, setSelectedAvatar] = useState(stats.avatar);

  if (!isOpen) return null;

  const handleSave = () => {
    updateName(nameInput);
    updateAvatar(selectedAvatar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full border-4 border-amber-300 shadow-2xl overflow-hidden animate-scale-up">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-400 to-orange-400 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl border border-white/30">
              {selectedAvatar}
            </div>
            <div>
              <h3 className="font-extrabold text-xl">Мой Профиль</h3>
              <p className="text-amber-100 text-xs font-medium">Выберите героя и укажите имя</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Level & XP progress bar */}
          <div className="bg-amber-50 rounded-2xl p-4 border-2 border-amber-200">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-bold text-amber-800">
                {levelInfo.level}-й Уровень: <span className="text-orange-600">{levelInfo.name}</span>
              </span>
              <span className="text-xs font-bold text-amber-600">
                {levelInfo.currentXp} / {levelInfo.nextXp} XP
              </span>
            </div>
            <div className="w-full bg-amber-200/70 h-3.5 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${levelInfo.progress}%` }}
              />
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-blue-50 rounded-2xl p-2.5 border-2 border-blue-200">
              <p className="text-lg font-black text-blue-700">{stats.solvedProblems}</p>
              <p className="text-[11px] font-bold text-blue-600">Решено</p>
            </div>
            <div className="bg-emerald-50 rounded-2xl p-2.5 border-2 border-emerald-200">
              <p className="text-lg font-black text-emerald-700">{stats.gamesPlayed}</p>
              <p className="text-[11px] font-bold text-emerald-600">Сыграно</p>
            </div>
            <div className="bg-yellow-50 rounded-2xl p-2.5 border-2 border-yellow-200">
              <p className="text-lg font-black text-yellow-700">{stats.stars}</p>
              <p className="text-[11px] font-bold text-yellow-600">Звёздочки</p>
            </div>
          </div>

          {/* Name input */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
              Ваше имя или никнейм:
            </label>
            <input
              type="text"
              maxLength={20}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-amber-400 focus:outline-none text-base font-bold text-slate-800 bg-slate-50 focus:bg-white transition-colors"
              placeholder="Например: Артём"
            />
          </div>

          {/* Avatar selector */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
              Выберите персонажа:
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {AVATAR_OPTIONS.map((av) => {
                const isSelected = selectedAvatar === av.emoji;
                return (
                  <button
                    key={av.id}
                    onClick={() => setSelectedAvatar(av.emoji)}
                    className={`p-3 rounded-2xl flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? "bg-amber-100 border-3 border-amber-400 scale-105 shadow-md"
                        : "bg-slate-50 hover:bg-slate-100 border-2 border-slate-200"
                    }`}
                  >
                    <span className="text-3xl mb-1">{av.emoji}</span>
                    <span className="text-[10px] font-bold text-slate-700 truncate w-full text-center">
                      {av.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-base shadow-lg shadow-orange-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            <span>Сохранить и продолжить</span>
          </button>
        </div>

      </div>
    </div>
  );
};
