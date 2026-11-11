"use client";

import React, { useState, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import { sound } from "@/lib/sound";
import { ArrowLeft, RotateCcw, Volume2 } from "lucide-react";

interface TrainRound {
  sequence: (number | null)[];
  missingIndex: number;
  correctAnswer: number;
  step: number;
  options: number[];
}

export const TrainSequenceGame: React.FC = () => {
  const { setActiveGameId, addReward, recordGameFinished, triggerConfetti } = useGame();

  const [round, setRound] = useState<number>(1);
  const [maxRounds] = useState<number>(5);
  const [currentRound, setCurrentRound] = useState<TrainRound | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isChooChoo, setIsChooChoo] = useState<boolean>(false);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [isWrong, setIsWrong] = useState<boolean>(false);

  const generateRound = (roundNum: number) => {
    // Determine step size: 1, 2, 3, 5, or 10
    const possibleSteps = [1, 2, 3, 5, 10];
    const step = possibleSteps[roundNum - 1] || 2;
    const start = Math.floor(Math.random() * 5) * step + step;

    const fullSeq: number[] = [];
    for (let i = 0; i < 5; i++) {
      fullSeq.push(start + i * step);
    }

    // Pick missing index (1, 2, or 3) so start and end are usually visible
    const missingIdx = Math.floor(Math.random() * 3) + 1;
    const correct = fullSeq[missingIdx];

    const seqWithMissing = fullSeq.map((val, idx) =>
      idx === missingIdx ? null : val
    );

    // Options
    const optSet = new Set<number>([correct]);
    while (optSet.size < 3) {
      const delta = (Math.floor(Math.random() * 4) + 1) * (Math.random() > 0.5 ? step : -step);
      const fake = Math.max(1, correct + delta);
      optSet.add(fake);
    }

    setCurrentRound({
      sequence: seqWithMissing,
      missingIndex: missingIdx,
      correctAnswer: correct,
      step,
      options: Array.from(optSet).sort(() => Math.random() - 0.5),
    });
    setSelectedAnswer(null);
    setIsChooChoo(false);
    setIsWrong(false);
  };

  useEffect(() => {
    generateRound(1);
  }, []);

  const handlePickOption = (val: number) => {
    if (!currentRound || isChooChoo) return;

    if (val === currentRound.correctAnswer) {
      // Correct!
      sound.playCorrect();
      setSelectedAnswer(val);
      setIsChooChoo(true);
      triggerConfetti();

      setTimeout(() => {
        if (round >= maxRounds) {
          setIsWon(true);
          sound.playFanfare();
          addReward(3, 30, 60);
          recordGameFinished("train", true);
        } else {
          setRound((r) => r + 1);
          generateRound(round + 1);
        }
      }, 1400);
    } else {
      // Wrong
      sound.playWrong();
      setIsWrong(true);
      setTimeout(() => setIsWrong(false), 600);
    }
  };

  const speakTask = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window && currentRound) {
      const text = `Найдите пропавший вагончик поезда! Числовой шаг равен ${currentRound.step}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ru-RU";
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-3xl border-2 border-purple-200 shadow-sm">
        <button
          onClick={() => setActiveGameId(null)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold text-sm border border-purple-200 transition-transform active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="bg-purple-100 text-purple-800 font-extrabold text-xs sm:text-sm px-3.5 py-1.5 rounded-xl">
            Раунд: {round} / {maxRounds}
          </span>
          <span className="bg-amber-100 text-amber-800 font-extrabold text-xs sm:text-sm px-3.5 py-1.5 rounded-xl">
            Закономерность: +{currentRound?.step}
          </span>
        </div>
      </div>

      {/* Main Train Station Board */}
      <div className="relative bg-gradient-to-b from-purple-100 via-indigo-50 to-blue-100 rounded-3xl p-6 sm:p-8 border-4 border-purple-300 shadow-xl min-h-[460px] flex flex-col justify-between overflow-hidden">
        
        {/* Banner with voice */}
        <div className="bg-white/95 backdrop-blur-md px-6 py-4 rounded-3xl border-3 border-purple-300 shadow-md text-center max-w-lg mx-auto w-full">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-xl font-black text-slate-800">
              Какой вагончик потерялся?
            </h3>
            <button
              onClick={speakTask}
              className="p-1.5 rounded-xl bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
              title="Озвучить задание"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs font-bold text-purple-700 mt-1">
            Определите шаг между числами и выберите недостающий вагон!
          </p>
        </div>

        {/* Train on Rails */}
        <div className="my-auto py-6 overflow-x-auto no-scrollbar">
          <div className={`flex items-center justify-center gap-2 min-w-[550px] mx-auto transition-transform duration-700 ${
            isChooChoo ? "translate-x-8" : ""
          }`}>
            
            {/* Locomotive */}
            <div className="relative flex flex-col items-center">
              {isChooChoo && (
                <div className="absolute -top-6 -left-2 text-2xl animate-bounce">
                  💨
                </div>
              )}
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 border-3 border-purple-900 shadow-lg flex flex-col items-center justify-center text-white">
                <span className="text-4xl">🚂</span>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-200 mt-0.5">
                  Экспресс
                </span>
              </div>
              {/* Wheels */}
              <div className="flex gap-2 mt-1">
                <div className="w-5 h-5 rounded-full bg-slate-800 border-2 border-slate-600" />
                <div className="w-5 h-5 rounded-full bg-slate-800 border-2 border-slate-600" />
              </div>
            </div>

            {/* Wagon Connector */}
            <div className="w-3 h-1.5 bg-slate-600" />

            {/* Wagons */}
            {currentRound?.sequence.map((val, idx) => {
              const isMissingSlot = val === null;
              const displayVal = isMissingSlot ? selectedAnswer : val;

              return (
                <React.Fragment key={idx}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-20 h-20 rounded-2xl flex items-center justify-center font-black text-2xl shadow-md border-3 transition-all ${
                        isMissingSlot
                          ? selectedAnswer !== null
                            ? "bg-emerald-100 text-emerald-800 border-emerald-400 scale-105"
                            : "bg-white/80 text-purple-600 border-dashed border-purple-400 animate-pulse"
                          : "bg-gradient-to-tr from-purple-500 to-violet-400 text-white border-purple-600"
                      }`}
                    >
                      {displayVal !== null ? (
                        <span>{displayVal}</span>
                      ) : (
                        <span className="text-3xl font-extrabold text-purple-400">?</span>
                      )}
                    </div>
                    {/* Wheels */}
                    <div className="flex gap-3 mt-1">
                      <div className="w-4 h-4 rounded-full bg-slate-800 border-2 border-slate-600" />
                      <div className="w-4 h-4 rounded-full bg-slate-800 border-2 border-slate-600" />
                    </div>
                  </div>

                  {idx < currentRound.sequence.length - 1 && (
                    <div className="w-2.5 h-1.5 bg-slate-600" />
                  )}
                </React.Fragment>
              );
            })}

          </div>

          {/* Railway Tracks */}
          <div className="max-w-2xl mx-auto mt-2 h-3 bg-slate-700 rounded-full border-b-2 border-slate-900 relative">
            <div className="absolute inset-0 flex justify-between px-2">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="w-1 h-3 bg-amber-800" />
              ))}
            </div>
          </div>
        </div>

        {/* Options to pick */}
        <div className="space-y-3">
          <p className="text-center text-xs font-black text-slate-600 uppercase tracking-wider">
            Выберите число для пустого вагона:
          </p>
          <div className="grid grid-cols-3 gap-3.5 max-w-sm mx-auto">
            {currentRound?.options.map((opt) => (
              <button
                key={opt}
                onClick={() => handlePickOption(opt)}
                disabled={isChooChoo}
                className={`py-3.5 rounded-2xl font-black text-2xl shadow-md border-3 transition-all active:scale-95 ${
                  isWrong
                    ? "bg-rose-100 text-rose-700 border-rose-400 animate-wobble"
                    : "bg-white text-purple-800 border-purple-300 hover:bg-purple-50 hover:border-purple-400"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Victory Screen */}
        {isWon && (
          <div className="absolute inset-0 z-20 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center border-4 border-purple-400 shadow-2xl animate-scale-up">
              <div className="text-6xl mb-3">🚂🌟</div>
              <h3 className="font-black text-2xl text-slate-800">
                Поезд Отправился! Чух-Чух!
              </h3>
              <p className="text-xs text-slate-600 font-semibold mt-1 mb-5">
                Все вагончики стоят на своих местах в точном порядке чисел!
              </p>
              <div className="flex justify-center gap-4 bg-purple-50 p-3 rounded-2xl border border-purple-200 mb-5">
                <div className="font-extrabold text-purple-700 text-sm">
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
                    generateRound(1);
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-sm rounded-2xl shadow-md hover:from-purple-700 hover:to-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-1.5"
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
