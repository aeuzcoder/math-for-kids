"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useGame } from "@/context/GameContext";
import { sound } from "@/lib/sound";
import { ArrowLeft, RotateCcw, Volume2, Heart } from "lucide-react";

interface Question {
  text: string;
  correctAnswer: number;
  options: number[];
}

const BALLOON_COLORS = [
  "from-pink-400 to-rose-500 shadow-rose-300",
  "from-sky-400 to-blue-500 shadow-blue-300",
  "from-emerald-400 to-teal-500 shadow-teal-300",
  "from-amber-400 to-yellow-500 shadow-yellow-300",
  "from-purple-400 to-violet-500 shadow-violet-300",
];

export const BalloonPopGame: React.FC = () => {
  const { setActiveGameId, addReward, recordGameFinished, triggerConfetti } = useGame();
  
  const [mode, setMode] = useState<"add_sub" | "mult" | "compare">("add_sub");
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [round, setRound] = useState<number>(1);
  const [maxRounds] = useState<number>(8);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  const [poppedIndex, setPoppedIndex] = useState<number | null>(null);
  const [wrongIndex, setWrongIndex] = useState<number | null>(null);

  // Generate question based on mode
  const generateQuestion = useCallback(() => {
    let text = "";
    let correct = 0;

    if (mode === "add_sub") {
      const isAdd = Math.random() > 0.4;
      if (isAdd) {
        const a = Math.floor(Math.random() * 9) + 1;
        const b = Math.floor(Math.random() * 9) + 1;
        correct = a + b;
        text = `${a} + ${b} = ?`;
      } else {
        const a = Math.floor(Math.random() * 12) + 5;
        const b = Math.floor(Math.random() * (a - 1)) + 1;
        correct = a - b;
        text = `${a} - ${b} = ?`;
      }
    } else if (mode === "mult") {
      const a = Math.floor(Math.random() * 7) + 2;
      const b = Math.floor(Math.random() * 6) + 2;
      correct = a * b;
      text = `${a} × ${b} = ?`;
    } else {
      // Compare / find number
      const base = Math.floor(Math.random() * 15) + 5;
      correct = base;
      text = `Какое число равно ${base}?`;
    }

    // Generate unique incorrect options
    const optionsSet = new Set<number>([correct]);
    while (optionsSet.size < 4) {
      const offset = (Math.floor(Math.random() * 7) + 1) * (Math.random() > 0.5 ? 1 : -1);
      const fake = Math.max(1, correct + offset);
      optionsSet.add(fake);
    }

    const shuffled = Array.from(optionsSet).sort(() => Math.random() - 0.5);

    setCurrentQ({
      text,
      correctAnswer: correct,
      options: shuffled,
    });
    setPoppedIndex(null);
    setWrongIndex(null);
  }, [mode]);

  useEffect(() => {
    generateQuestion();
  }, [generateQuestion]);

  const speakQuestion = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window && currentQ) {
      const utterance = new SpeechSynthesisUtterance(currentQ.text.replace("?", "сколько будет"));
      utterance.lang = "ru-RU";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleBalloonClick = (val: number, idx: number) => {
    if (!currentQ || poppedIndex !== null || isGameOver) return;

    if (val === currentQ.correctAnswer) {
      // Correct!
      sound.playPop();
      sound.playCorrect();
      setPoppedIndex(idx);
      setScore((s) => s + 10 + combo * 2);
      setCombo((c) => c + 1);

      setTimeout(() => {
        if (round >= maxRounds) {
          // Won!
          setIsGameOver(true);
          setIsWon(true);
          sound.playFanfare();
          triggerConfetti();
          addReward(3, 25, 60);
          recordGameFinished("balloon", true);
        } else {
          setRound((r) => r + 1);
          generateQuestion();
        }
      }, 700);
    } else {
      // Wrong!
      sound.playWrong();
      setWrongIndex(idx);
      setCombo(0);
      setLives((l) => {
        const next = l - 1;
        if (next <= 0) {
          setIsGameOver(true);
          setIsWon(false);
          recordGameFinished("balloon", false);
        }
        return next;
      });
      setTimeout(() => setWrongIndex(null), 600);
    }
  };

  const restartGame = () => {
    setScore(0);
    setCombo(0);
    setLives(3);
    setRound(1);
    setIsGameOver(false);
    setIsWon(false);
    generateQuestion();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top bar with back button & score */}
      <div className="flex items-center justify-between bg-white p-4 rounded-3xl border-2 border-pink-200 shadow-sm">
        <button
          onClick={() => setActiveGameId(null)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-pink-50 hover:bg-pink-100 text-pink-700 font-extrabold text-sm border border-pink-200 transition-transform active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад</span>
        </button>

        {/* Lives */}
        <div className="flex items-center gap-1">
          {[1, 2, 3].map((heart) => (
            <Heart
              key={heart}
              className={`w-6 h-6 transition-all ${
                heart <= lives
                  ? "text-rose-500 fill-rose-500 scale-100"
                  : "text-slate-300 scale-90"
              }`}
            />
          ))}
        </div>

        {/* Round & Score */}
        <div className="flex items-center gap-4 text-xs sm:text-sm font-extrabold">
          <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-xl">
            Раунд: {round}/{maxRounds}
          </span>
          <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-xl flex items-center gap-1">
            ⭐ {score} очков
          </span>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex justify-center gap-2 bg-pink-100/60 p-1.5 rounded-2xl max-w-md mx-auto">
        {[
          { id: "add_sub", label: "Сложение и вычитание ➕➖" },
          { id: "mult", label: "Умножение ✖️" },
          { id: "compare", label: "Сравнение 🔍" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setMode(tab.id as any);
              setRound(1);
              generateQuestion();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              mode === tab.id
                ? "bg-white text-pink-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Game Stage Area */}
      <div className="relative bg-gradient-to-b from-sky-200 via-sky-100 to-amber-100 rounded-3xl p-6 sm:p-10 border-4 border-sky-300 shadow-xl min-h-[460px] flex flex-col justify-between overflow-hidden">
        
        {/* Clouds & Sun background decor */}
        <div className="absolute top-4 left-6 text-4xl opacity-80 animate-float pointer-events-none">☁️</div>
        <div className="absolute top-8 right-10 text-5xl opacity-90 animate-pulse pointer-events-none">☀️</div>
        <div className="absolute top-16 right-28 text-3xl opacity-70 pointer-events-none">☁️</div>

        {/* Question Header */}
        <div className="relative z-10 mx-auto bg-white/95 backdrop-blur-md px-8 py-5 rounded-3xl border-3 border-pink-400 shadow-lg text-center max-w-md w-full">
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl sm:text-4xl font-black text-slate-800 tracking-wide">
              {currentQ?.text}
            </span>
            <button
              onClick={speakQuestion}
              title="Озвучить пример"
              className="p-2 rounded-xl bg-pink-100 text-pink-600 hover:bg-pink-200 transition-colors"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
          {combo > 1 && (
            <p className="mt-2 text-xs font-black text-orange-500 animate-bounce">
              🔥 СУПЕР СЕРИЯ: {combo}x!
            </p>
          )}
        </div>

        {/* Floating Balloons */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-6 my-auto pt-6">
          {currentQ?.options.map((val, idx) => {
            const isPopped = poppedIndex === idx;
            const isWrong = wrongIndex === idx;
            const colorClass = BALLOON_COLORS[idx % BALLOON_COLORS.length];

            return (
              <div
                key={idx}
                className="flex flex-col items-center justify-center animate-balloon"
                style={{ animationDelay: `${idx * 0.4}s` }}
              >
                <button
                  onClick={() => handleBalloonClick(val, idx)}
                  disabled={isPopped || isGameOver}
                  className={`group relative w-28 h-36 sm:w-32 sm:h-40 rounded-[50%_50%_50%_50%/40%_40%_60%_60%] bg-gradient-to-tr ${colorClass} flex flex-col items-center justify-center text-white font-black text-3xl sm:text-4xl shadow-xl hover:scale-105 active:scale-95 transition-all ${
                    isPopped ? "scale-0 opacity-0 duration-300" : ""
                  } ${isWrong ? "animate-wobble ring-4 ring-rose-500" : ""}`}
                >
                  {/* Balloon reflection */}
                  <div className="absolute top-4 left-5 w-4 h-8 bg-white/40 rounded-full rotate-25 blur-[1px]" />
                  
                  {/* Number inside balloon */}
                  <span className="drop-shadow-md select-none">{val}</span>

                  {/* Balloon tie knot & string */}
                  <div className="absolute -bottom-2 w-3.5 h-3 bg-current rounded-sm opacity-90" />
                  <div className="absolute -bottom-9 w-0.5 h-8 bg-slate-400" />
                </button>
              </div>
            );
          })}
        </div>

        <p className="relative z-10 text-center text-xs font-extrabold text-slate-500 bg-white/70 py-1.5 px-4 rounded-full mx-auto backdrop-blur-xs">
          Найдите правильный ответ и лопните шарик! 🎈
        </p>

        {/* Game Over / Victory Modal Overlay */}
        {isGameOver && (
          <div className="absolute inset-0 z-20 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center border-4 border-amber-300 shadow-2xl animate-scale-up">
              <div className="text-6xl mb-3">{isWon ? "🏆" : "💪"}</div>
              <h3 className="font-black text-2xl text-slate-800">
                {isWon ? "Отличная Победа!" : "Хорошая Попытка!"}
              </h3>
              <p className="text-xs text-slate-600 font-semibold mt-1 mb-5">
                {isWon
                  ? `Вы успешно лопнули все шарики! Заработано: ${score} очков!`
                  : "Ошибки помогают учиться! Попробуйте еще разок!"}
              </p>

              {isWon && (
                <div className="flex justify-center gap-4 bg-amber-50 p-3 rounded-2xl border border-amber-200 mb-5">
                  <div className="font-extrabold text-amber-700 text-sm">
                    🪙 +25 Монет
                  </div>
                  <div className="font-extrabold text-yellow-700 text-sm">
                    ⭐ +3 Звезды
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={restartGame}
                  className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-sm rounded-2xl shadow-md hover:from-pink-600 hover:to-rose-600 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Играть снова</span>
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
