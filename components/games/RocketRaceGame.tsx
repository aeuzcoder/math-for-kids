"use client";

import React, { useState, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import { sound } from "@/lib/sound";
import { ArrowLeft, RotateCcw, Zap } from "lucide-react";

interface Question {
  text: string;
  correct: number;
  options: number[];
}

export const RocketRaceGame: React.FC = () => {
  const { setActiveGameId, addReward, recordGameFinished, triggerConfetti } = useGame();

  const [playerPos, setPlayerPos] = useState<number>(5); // 0 to 100%
  const [rivalPos, setRivalPos] = useState<number>(5);
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [isTurbo, setIsTurbo] = useState<boolean>(false);
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");

  // Timer for rival alien ship
  useEffect(() => {
    if (gameState !== "playing") return;

    const interval = setInterval(() => {
      setRivalPos((prev) => {
        const next = prev + Math.random() * 2.5 + 1.2;
        if (next >= 100) {
          setGameState("lost");
          sound.playWrong();
          recordGameFinished("rocket", false);
        }
        return Math.min(100, next);
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [gameState, recordGameFinished]);

  const generateProblem = () => {
    const isAdd = Math.random() > 0.45;
    let text = "";
    let correct = 0;

    if (isAdd) {
      const a = Math.floor(Math.random() * 20) + 5;
      const b = Math.floor(Math.random() * 15) + 3;
      correct = a + b;
      text = `${a} + ${b} = ?`;
    } else {
      const a = Math.floor(Math.random() * 25) + 10;
      const b = Math.floor(Math.random() * (a - 5)) + 2;
      correct = a - b;
      text = `${a} - ${b} = ?`;
    }

    const set = new Set<number>([correct]);
    while (set.size < 3) {
      const diff = (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1);
      const fake = Math.max(1, correct + diff);
      set.add(fake);
    }

    setCurrentQ({
      text,
      correct,
      options: Array.from(set).sort(() => Math.random() - 0.5),
    });
  };

  useEffect(() => {
    generateProblem();
  }, []);

  const handleAnswer = (val: number) => {
    if (gameState !== "playing" || !currentQ) return;

    if (val === currentQ.correct) {
      sound.playCorrect();
      setIsTurbo(true);
      setTimeout(() => setIsTurbo(false), 800);

      const boost = 14 + streak * 2;
      const nextPos = Math.min(100, playerPos + boost);
      setPlayerPos(nextPos);
      setStreak((s) => s + 1);

      if (nextPos >= 100) {
        setGameState("won");
        sound.playFanfare();
        triggerConfetti();
        addReward(4, 40, 80);
        recordGameFinished("rocket", true);
      } else {
        generateProblem();
      }
    } else {
      sound.playWrong();
      setStreak(0);
      generateProblem();
    }
  };

  const restartRace = () => {
    setPlayerPos(5);
    setRivalPos(5);
    setStreak(0);
    setGameState("playing");
    generateProblem();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-3xl border-2 border-blue-200 shadow-sm">
        <button
          onClick={() => setActiveGameId(null)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-sm border border-blue-200 transition-transform active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад</span>
        </button>

        <div className="flex items-center gap-2">
          {streak > 1 && (
            <span className="flex items-center gap-1 bg-amber-100 text-amber-800 font-black text-xs sm:text-sm px-3 py-1 rounded-xl animate-bounce">
              <Zap className="w-4 h-4 text-amber-600 fill-amber-600" />
              <span>ТУРБО x{streak}</span>
            </span>
          )}
          <span className="bg-blue-100 text-blue-800 font-extrabold text-xs sm:text-sm px-3.5 py-1.5 rounded-xl">
            Дистанция: {Math.round(playerPos)}%
          </span>
        </div>
      </div>

      {/* Race Track Canvas */}
      <div className="relative bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 rounded-3xl p-6 sm:p-8 border-4 border-blue-400 shadow-2xl min-h-[460px] flex flex-col justify-between overflow-hidden text-white">
        
        {/* Stars in space */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute top-6 left-12 text-sm animate-pulse">✨</div>
          <div className="absolute top-24 left-1/3 text-lg animate-ping">⭐</div>
          <div className="absolute top-12 right-1/4 text-xs animate-pulse">🌟</div>
          <div className="absolute bottom-12 left-1/4 text-sm animate-ping">✨</div>
        </div>

        {/* Finish Line Planet */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center">
          <span className="text-5xl sm:text-6xl animate-float">🪐</span>
          <span className="text-[11px] font-black text-amber-300 mt-1 uppercase tracking-wider">
            Финишная Планета
          </span>
        </div>

        {/* Race Lanes */}
        <div className="space-y-6 my-auto max-w-[85%]">
          
          {/* Lane 1: Player's Rocket */}
          <div className="relative">
            <div className="flex items-center justify-between text-xs font-black text-cyan-300 mb-1">
              <span>🚀 Ваша Ракета</span>
              <span>{Math.round(playerPos)}%</span>
            </div>
            <div className="h-12 bg-white/10 rounded-2xl border-2 border-cyan-400/40 relative flex items-center px-2">
              <div
                className="absolute transition-all duration-300 flex items-center"
                style={{ left: `calc(${playerPos}% - 24px)` }}
              >
                <div className={`text-4xl transition-transform ${isTurbo ? "scale-125" : ""}`}>
                  🚀
                </div>
                {isTurbo && (
                  <span className="text-2xl -ml-2 animate-pulse">🔥</span>
                )}
              </div>
            </div>
          </div>

          {/* Lane 2: Alien Rival Ship */}
          <div className="relative">
            <div className="flex items-center justify-between text-xs font-black text-pink-300 mb-1">
              <span>🛸 Пришелец Зорк</span>
              <span>{Math.round(rivalPos)}%</span>
            </div>
            <div className="h-12 bg-white/10 rounded-2xl border-2 border-pink-400/40 relative flex items-center px-2">
              <div
                className="absolute transition-all duration-300 flex items-center"
                style={{ left: `calc(${rivalPos}% - 24px)` }}
              >
                <div className="text-4xl">🛸</div>
              </div>
            </div>
          </div>

        </div>

        {/* Question Panel */}
        <div className="relative z-10 bg-slate-800/90 backdrop-blur-md p-5 rounded-3xl border-3 border-blue-400 shadow-lg text-center max-w-lg mx-auto w-full">
          <p className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-1">
            Считайте быстрее и включайте турбо-ускорение!
          </p>
          <div className="text-3xl sm:text-4xl font-black text-white my-2">
            {currentQ?.text}
          </div>

          {/* Options */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {currentQ?.options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                className="py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xl shadow-lg border border-blue-300 active:scale-95 transition-all"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Win / Lose Screen */}
        {gameState !== "playing" && (
          <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center border-4 border-blue-400 shadow-2xl text-slate-800 animate-scale-up">
              <div className="text-6xl mb-3">
                {gameState === "won" ? "🏆🚀" : "🛸💔"}
              </div>
              <h3 className="font-black text-2xl">
                {gameState === "won" ? "Космический Чемпион!" : "Зорк прилетел раньше!"}
              </h3>
              <p className="text-xs text-slate-600 font-semibold mt-1 mb-5">
                {gameState === "won"
                  ? "Вы первым пересекли финишную черту и покорили далекую планету!"
                  : "В следующий раз у вас точно получится! Считайте чуть быстрее!"}
              </p>

              {gameState === "won" && (
                <div className="flex justify-center gap-4 bg-blue-50 p-3 rounded-2xl border border-blue-200 mb-5">
                  <div className="font-extrabold text-blue-700 text-sm">
                    🪙 +40 Монет
                  </div>
                  <div className="font-extrabold text-amber-700 text-sm">
                    ⭐ +4 Звезды
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={restartRace}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm rounded-2xl shadow-md hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Реванш</span>
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
