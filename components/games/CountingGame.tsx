"use client";

import React, { useState, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import { sound } from "@/lib/sound";
import { ArrowLeft, RotateCcw, Volume2 } from "lucide-react";

interface FruitItem {
  id: number;
  emoji: string;
  name: string;
  countedNumber: number | null;
  xOffset: number;
  yOffset: number;
}

const FRUIT_TYPES = [
  { emoji: "🍎", name: "яблок" },
  { emoji: "🍓", name: "клубничек" },
  { emoji: "🍌", name: "бананов" },
  { emoji: "🍊", name: "апельсинов" },
  { emoji: "🍉", name: "арбузиков" },
];

export const CountingGame: React.FC = () => {
  const { setActiveGameId, addReward, recordGameFinished, triggerConfetti } = useGame();

  const [round, setRound] = useState<number>(1);
  const [maxRounds] = useState<number>(5);
  const [targetCount, setTargetCount] = useState<number>(4);
  const [currentFruit, setCurrentFruit] = useState(FRUIT_TYPES[0]);
  const [fruits, setFruits] = useState<FruitItem[]>([]);
  const [nextCountNumber, setNextCountNumber] = useState<number>(1);
  const [options, setOptions] = useState<number[]>([]);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [selectedWrong, setSelectedWrong] = useState<number | null>(null);

  const initRound = (roundNum: number) => {
    const fruitType = FRUIT_TYPES[(roundNum - 1) % FRUIT_TYPES.length];
    setCurrentFruit(fruitType);

    // Number of fruits (3 to 10)
    const count = Math.min(10, Math.floor(Math.random() * 5) + 3 + (roundNum - 1));
    setTargetCount(count);
    setNextCountNumber(1);
    setSelectedWrong(null);

    // Generate fruit positions with slight random jitter
    const generated: FruitItem[] = [];
    for (let i = 0; i < count; i++) {
      generated.push({
        id: i,
        emoji: fruitType.emoji,
        name: fruitType.name,
        countedNumber: null,
        xOffset: (Math.random() - 0.5) * 12,
        yOffset: (Math.random() - 0.5) * 12,
      });
    }
    setFruits(generated);

    // Generate options
    const optSet = new Set<number>([count]);
    while (optSet.size < 4) {
      const delta = (Math.floor(Math.random() * 3) + 1) * (Math.random() > 0.5 ? 1 : -1);
      const fake = Math.max(1, count + delta);
      optSet.add(fake);
    }
    setOptions(Array.from(optSet).sort(() => Math.random() - 0.5));
  };

  useEffect(() => {
    initRound(1);
  }, []);

  const handleTapFruit = (id: number) => {
    setFruits((prev) =>
      prev.map((f) => {
        if (f.id === id && f.countedNumber === null) {
          sound.playCoin();
          const current = nextCountNumber;
          setNextCountNumber((c) => c + 1);
          return { ...f, countedNumber: current };
        }
        return f;
      })
    );
  };

  const handleAnswerSelect = (val: number) => {
    if (val === targetCount) {
      // Correct!
      sound.playCorrect();
      triggerConfetti();

      if (round >= maxRounds) {
        setIsWon(true);
        sound.playFanfare();
        addReward(3, 30, 50);
        recordGameFinished("counting", true);
      } else {
        setTimeout(() => {
          setRound((r) => r + 1);
          initRound(round + 1);
        }, 1000);
      }
    } else {
      // Wrong
      sound.playWrong();
      setSelectedWrong(val);
      setTimeout(() => setSelectedWrong(null), 700);
    }
  };

  const speakPrompt = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const text = `Сколько ${currentFruit.name} в саду? Нажимайте на них по очереди и считайте!`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ru-RU";
      window.speechSynthesis.speak(utterance);
    }
  };

  const countedSoFar = fruits.filter((f) => f.countedNumber !== null).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-3xl border-2 border-emerald-200 shadow-sm">
        <button
          onClick={() => setActiveGameId(null)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-sm border border-emerald-200 transition-transform active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="bg-emerald-100 text-emerald-800 font-extrabold text-xs sm:text-sm px-3.5 py-1.5 rounded-xl">
            Раунд: {round} / {maxRounds}
          </span>
          <span className="bg-amber-100 text-amber-800 font-extrabold text-xs sm:text-sm px-3 py-1.5 rounded-xl">
            Сосчитано: {countedSoFar} / {targetCount}
          </span>
        </div>
      </div>

      {/* Main Garden Stage */}
      <div className="relative bg-gradient-to-b from-sky-100 via-emerald-50 to-green-100 rounded-3xl p-6 sm:p-8 border-4 border-emerald-300 shadow-xl min-h-[480px] flex flex-col justify-between overflow-hidden">
        
        {/* Banner with voice */}
        <div className="bg-white/95 backdrop-blur-md px-6 py-4 rounded-3xl border-3 border-emerald-300 shadow-md text-center max-w-lg mx-auto w-full">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800">
              Сколько {currentFruit.name} на полянке?
            </h3>
            <button
              onClick={speakPrompt}
              className="p-1.5 rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
              title="Озвучить задание"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs font-bold text-emerald-700 mt-1">
            💡 Подсказка: Нажимайте пальчиком на каждый фрукт, чтобы сосчитать!
          </p>
        </div>

        {/* Garden Picnic Mat / Fruit area */}
        <div className="my-auto py-6">
          <div className="bg-white/60 backdrop-blur-xs p-6 rounded-3xl border-3 border-dashed border-emerald-300 max-w-2xl mx-auto min-h-[220px] flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {fruits.map((f) => {
              const isCounted = f.countedNumber !== null;
              return (
                <button
                  key={f.id}
                  onClick={() => handleTapFruit(f.id)}
                  style={{
                    transform: `translate(${f.xOffset}px, ${f.yOffset}px)`,
                  }}
                  className={`group relative p-2 rounded-2xl transition-all duration-200 active:scale-90 ${
                    isCounted
                      ? "bg-amber-100/90 ring-4 ring-amber-400 scale-105"
                      : "hover:scale-110 hover:bg-white/80"
                  }`}
                >
                  <span className="text-5xl sm:text-6xl drop-shadow-md select-none block">
                    {f.emoji}
                  </span>

                  {/* Counted badge */}
                  {isCounted && (
                    <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-amber-500 text-white font-black text-base flex items-center justify-center shadow-lg border-2 border-white animate-scale-up">
                      {f.countedNumber}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Options Row */}
        <div className="space-y-3">
          <p className="text-center text-xs font-black text-slate-600 uppercase tracking-wider">
            Выберите правильный ответ:
          </p>
          <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
            {options.map((opt) => {
              const isWrong = selectedWrong === opt;
              return (
                <button
                  key={opt}
                  onClick={() => handleAnswerSelect(opt)}
                  className={`py-4 rounded-2xl text-2xl font-black shadow-md border-3 transition-all active:scale-95 ${
                    isWrong
                      ? "bg-rose-500 text-white border-rose-600 animate-wobble"
                      : "bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50 hover:border-emerald-400"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Victory Screen */}
        {isWon && (
          <div className="absolute inset-0 z-20 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center border-4 border-emerald-400 shadow-2xl animate-scale-up">
              <div className="text-6xl mb-3">🧺🍎</div>
              <h3 className="font-black text-2xl text-slate-800">
                Браво, Мастер Счёта!
              </h3>
              <p className="text-xs text-slate-600 font-semibold mt-1 mb-5">
                Вы правильно сосчитали все фрукты на полянке!
              </p>
              <div className="flex justify-center gap-4 bg-emerald-50 p-3 rounded-2xl border border-emerald-200 mb-5">
                <div className="font-extrabold text-emerald-700 text-sm">
                  🪙 +30 Монет
                </div>
                <div className="font-extrabold text-yellow-700 text-sm">
                  ⭐ +3 Звезды
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsWon(false);
                    setRound(1);
                    initRound(1);
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-sm rounded-2xl shadow-md hover:from-emerald-600 hover:to-teal-600 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Считать снова</span>
                </button>
                <button
                  onClick={() => setActiveGameId(null)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm rounded-2xl transition-all"
                >
                  В меню
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
