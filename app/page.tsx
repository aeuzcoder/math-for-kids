"use client";

import React, { useState } from "react";
import { GameProvider, useGame } from "@/context/GameContext";
import { Navbar } from "@/components/Navbar";
import { AvatarModal } from "@/components/AvatarModal";
import { ShopModal } from "@/components/ShopModal";
import { AchievementsModal } from "@/components/AchievementsModal";
import { DailyRewardModal } from "@/components/DailyRewardModal";
import { GAMES } from "@/lib/data";
import { AgeGroup } from "@/lib/types";
import { BalloonPopGame } from "@/components/games/BalloonPopGame";
import { CountingGame } from "@/components/games/CountingGame";
import { RocketRaceGame } from "@/components/games/RocketRaceGame";
import { MemoryGame } from "@/components/games/MemoryGame";
import { PizzaFractionGame } from "@/components/games/PizzaFractionGame";
import { TrainSequenceGame } from "@/components/games/TrainSequenceGame";
import { 
  Play, 
  Sparkles, 
  Dices, 
  ShieldCheck,
} from "lucide-react";

function MainContent() {
  const { 
    stats, 
    activeGameId, 
    setActiveGameId, 
    levelInfo 
  } = useGame();

  const [selectedAge, setSelectedAge] = useState<AgeGroup>("all");
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isDailyOpen, setIsDailyOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Filter games based on age group
  const filteredGames = GAMES.filter((g) => {
    if (selectedAge === "all") return true;
    if (g.ageGroup === "all") return true;
    return g.ageGroup === selectedAge;
  });

  const handleRandomGame = () => {
    const randomGame = GAMES[Math.floor(Math.random() * GAMES.length)];
    setActiveGameId(randomGame.id);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 text-slate-800">
      
      {/* Top Navigation */}
      <Navbar
        onOpenShop={() => setIsShopOpen(true)}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        onOpenDaily={() => setIsDailyOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* If a game is currently active, render the game component */}
        {activeGameId ? (
          <div className="animate-fade-in">
            {activeGameId === "balloon" && <BalloonPopGame />}
            {activeGameId === "counting" && <CountingGame />}
            {activeGameId === "rocket" && <RocketRaceGame />}
            {activeGameId === "memory" && <MemoryGame />}
            {activeGameId === "pizza" && <PizzaFractionGame />}
            {activeGameId === "train" && <TrainSequenceGame />}
          </div>
        ) : (
          /* Home Dashboard */
          <div className="space-y-10 animate-fade-in">
            
            {/* Hero Welcome Banner */}
            <div className="relative rounded-3xl bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 p-6 sm:p-10 text-white shadow-xl overflow-hidden border-4 border-amber-300">
              
              {/* Fun playful background shapes */}
              <div className="absolute top-2 right-12 text-6xl opacity-20 pointer-events-none select-none">
                ✨
              </div>
              <div className="absolute bottom-4 left-1/3 text-8xl opacity-15 pointer-events-none select-none">
                📐
              </div>

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                
                {/* Left greeting & action */}
                <div className="space-y-3 text-center md:text-left max-w-xl">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-extrabold border border-white/30">
                    <Sparkles className="w-4 h-4 text-yellow-200" />
                    <span>Математическая площадка №1 для детей</span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-black tracking-tight drop-shadow-sm leading-tight">
                    Привет, {stats.name}! {stats.avatar}
                  </h1>

                  <p className="text-amber-50 text-sm sm:text-base font-medium leading-relaxed">
                    В какую игру сыграем сегодня? Учите математику весело: лопайте шарики, собирайте урожай фруктов и побеждайте в космических гонках!
                  </p>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                    <button
                      onClick={handleRandomGame}
                      className="px-6 py-3.5 rounded-2xl bg-white text-orange-600 font-extrabold text-sm sm:text-base shadow-lg shadow-black/10 hover:bg-amber-50 active:scale-95 transition-all flex items-center gap-2"
                    >
                      <Dices className="w-5 h-5 text-orange-500" />
                      <span>Случайная Игра</span>
                    </button>
                    
                    <button
                      onClick={() => setIsDailyOpen(true)}
                      className="px-5 py-3.5 rounded-2xl bg-orange-600/50 hover:bg-orange-600/70 border-2 border-white/30 text-white font-black text-sm active:scale-95 transition-all flex items-center gap-2 backdrop-blur-xs"
                    >
                      <span>🎁 Ежедневный Подарок</span>
                    </button>
                  </div>
                </div>

                {/* Right Hero Mascot & Progress Card */}
                <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 text-slate-800 shadow-2xl border-3 border-amber-200 max-w-xs w-full flex flex-col items-center text-center">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-3xl bg-amber-100 flex items-center justify-center text-5xl shadow-inner border-2 border-amber-300 animate-float">
                      {stats.avatar}
                    </div>
                    <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-orange-500 text-white text-[11px] font-black shadow-md border-2 border-white">
                      {levelInfo.level}-й Уровень
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-800 mt-3">
                    {stats.name}
                  </h3>
                  <p className="text-xs font-bold text-orange-600">
                    {levelInfo.name}
                  </p>

                  {/* XP Bar */}
                  <div className="w-full mt-3 space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-500">
                      <span>Опыт (XP)</span>
                      <span>{levelInfo.currentXp} / {levelInfo.nextXp} XP</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${levelInfo.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Mini Stats */}
                  <div className="grid grid-cols-2 gap-2 w-full mt-4 pt-3 border-t border-slate-100 text-center">
                    <div className="bg-amber-50 rounded-xl p-1.5 border border-amber-200">
                      <p className="text-xs font-black text-amber-800">{stats.coins} 🪙</p>
                      <p className="text-[10px] text-amber-600 font-bold">Монеты</p>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-1.5 border border-yellow-200">
                      <p className="text-xs font-black text-yellow-800">{stats.stars} ⭐</p>
                      <p className="text-[10px] text-yellow-600 font-bold">Звёзды</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Age Filter Tabs */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Коллекция Игр 🎮
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-500">
                  Выберите интересную игру под ваш возраст и тему
                </p>
              </div>

              {/* Age group selector pill tabs */}
              <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border-2 border-slate-200 shadow-sm overflow-x-auto no-scrollbar max-w-full">
                {[
                  { id: "all", label: "Все игры" },
                  { id: "preschool", label: "4-6 лет (Малыши) 🐥" },
                  { id: "grade1_2", label: "7-8 лет (1-2 класс) 🎒" },
                  { id: "grade3_4", label: "9-10 лет (3-4 класс) 🚀" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedAge(tab.id as AgeGroup)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                      selectedAge === tab.id
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Game Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGames.map((game) => (
                <div
                  key={game.id}
                  className={`group rounded-3xl border-3 ${game.borderColor} bg-white shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1`}
                >
                  <div>
                    {/* Card Header with gradient */}
                    <div className={`p-6 bg-gradient-to-tr ${game.color} text-white relative`}>
                      <div className="flex items-start justify-between">
                        <span className="text-5xl drop-shadow-md select-none group-hover:scale-110 transition-transform duration-300">
                          {game.icon}
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-white/25 backdrop-blur-md text-[11px] font-black border border-white/30 text-white uppercase tracking-wider">
                          {game.badge}
                        </span>
                      </div>
                      <div className="mt-4">
                        <h3 className="text-2xl font-black tracking-tight">
                          {game.title}
                        </h3>
                        <p className="text-white/80 text-xs font-bold mt-0.5">
                          {game.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 space-y-4">
                      <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                        {game.description}
                      </p>

                      {/* Skills Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {game.skills.map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-[11px] font-black"
                          >
                            ✓ {skill}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-xs font-bold text-slate-500 pt-1">
                        <span>Возраст:</span>
                        <span className="text-slate-800 font-extrabold bg-slate-100 px-2.5 py-0.5 rounded-lg">
                          {game.ageLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Play Button */}
                  <div className="p-6 pt-0">
                    <button
                      onClick={() => setActiveGameId(game.id)}
                      className={`w-full py-3.5 rounded-2xl bg-gradient-to-r ${game.color} text-white font-black text-base shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 group-hover:opacity-95`}
                    >
                      <Play className="w-5 h-5 fill-white" />
                      <span>Играть</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Math Tips & Parent Corner */}
            <div className="rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-blue-50 border-3 border-indigo-200 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-xl">
                  💡
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">
                    Секреты Быстрого Счета и Советы Родителям
                  </h3>
                  <p className="text-xs font-semibold text-slate-500">
                    Как сделать занятия математикой лёгкими и увлекательными
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border-2 border-indigo-100 shadow-xs">
                  <span className="text-2xl mb-1 block">✋ Таблица умножения на 9</span>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Используйте пальчики рук! Чтобы умножить 9 на 3, загните 3-й палец: слева останется 2 пальца, справа 7 — ответ 27!
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl border-2 border-indigo-100 shadow-xs">
                  <span className="text-2xl mb-1 block">⏱️ Всего 10 минут в день</span>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Короткие игровые тренировки каждый день развивают скорость мышления и логику ребенка в 3 раза эффективнее скучных учебников.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl border-2 border-indigo-100 shadow-xs">
                  <span className="text-2xl mb-1 block">🌟 Радость побед</span>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Каждая ошибка — это шаг к новому пониманию. Поощряйте старания ребенка звёздами и красивыми наклейками!
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t-2 border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-2">
            <span className="text-base">📐</span>
            <span>Умная Математика © 2026 — Безопасный образовательный портал для детей</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Безопасно для детей (Без рекламы)</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AvatarModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <ShopModal isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} />
      <AchievementsModal isOpen={isAchievementsOpen} onClose={() => setIsAchievementsOpen(false)} />
      <DailyRewardModal isOpen={isDailyOpen} onClose={() => setIsDailyOpen(false)} />

    </div>
  );
}

export default function Home() {
  return (
    <GameProvider>
      <MainContent />
    </GameProvider>
  );
}
