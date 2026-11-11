"use client";

import React, { useState, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import { sound } from "@/lib/sound";
import { ArrowLeft, RotateCcw, Volume2, Check } from "lucide-react";

interface PizzaOrder {
  numerator: number;
  denominator: number;
  label: string;
  topping: string;
  toppingEmoji: string;
}

const ORDERS_PRESETS: PizzaOrder[] = [
  { numerator: 1, denominator: 2, label: "1/2 (Половина)", topping: "сыра", toppingEmoji: "🧀" },
  { numerator: 1, denominator: 4, label: "1/4 (Четверть)", topping: "томатов", toppingEmoji: "🍅" },
  { numerator: 3, denominator: 4, label: "3/4 (Три четверти)", topping: "оливок", toppingEmoji: "🫒" },
  { numerator: 2, denominator: 4, label: "2/4 (Половина)", topping: "грибов", toppingEmoji: "🍄" },
  { numerator: 4, denominator: 4, label: "4/4 (Целая пицца)", topping: "специального микса", toppingEmoji: "🍕" },
];

export const PizzaFractionGame: React.FC = () => {
  const { setActiveGameId, addReward, recordGameFinished, triggerConfetti } = useGame();

  const [orderIndex, setOrderIndex] = useState<number>(0);
  const [slices, setSlices] = useState<boolean[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isWon, setIsWon] = useState<boolean>(false);

  const currentOrder = ORDERS_PRESETS[orderIndex];

  const initOrder = (idx: number) => {
    const order = ORDERS_PRESETS[idx];
    setSlices(new Array(order.denominator).fill(false));
    setFeedback(null);
  };

  useEffect(() => {
    initOrder(0);
  }, []);

  const toggleSlice = (idx: number) => {
    sound.playClick();
    setSlices((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  const handleDeliver = () => {
    const activeCount = slices.filter(Boolean).length;
    if (activeCount === currentOrder.numerator) {
      // Success!
      sound.playCorrect();
      setFeedback("Отлично! Заказ приготовлен в точности по рецепту! 😋");
      triggerConfetti();

      setTimeout(() => {
        if (orderIndex + 1 >= ORDERS_PRESETS.length) {
          setIsWon(true);
          sound.playFanfare();
          addReward(4, 45, 90);
          recordGameFinished("pizza", true);
        } else {
          const nextIdx = orderIndex + 1;
          setOrderIndex(nextIdx);
          initOrder(nextIdx);
        }
      }, 1200);
    } else {
      // Wrong
      sound.playWrong();
      setFeedback(
        `Почти получилось! Вы заполнили ${activeCount}/${currentOrder.denominator} частей, а нужно ${currentOrder.numerator}/${currentOrder.denominator}.`
      );
    }
  };

  const speakOrder = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const text = `Заказ клиента: положите ${currentOrder.topping} на ${currentOrder.numerator} кусочка пиццы!`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ru-RU";
      window.speechSynthesis.speak(utterance);
    }
  };

  const activeCount = slices.filter(Boolean).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-3xl border-2 border-orange-200 shadow-sm">
        <button
          onClick={() => setActiveGameId(null)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-extrabold text-sm border border-orange-200 transition-transform active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="bg-orange-100 text-orange-800 font-extrabold text-xs sm:text-sm px-3.5 py-1.5 rounded-xl">
            Заказ: {orderIndex + 1} / {ORDERS_PRESETS.length}
          </span>
          <span className="bg-amber-100 text-amber-800 font-extrabold text-xs sm:text-sm px-3.5 py-1.5 rounded-xl">
            Заполнено: {activeCount} / {currentOrder?.denominator}
          </span>
        </div>
      </div>

      {/* Main Kitchen Board */}
      <div className="relative bg-gradient-to-b from-amber-50 via-orange-50 to-red-50 rounded-3xl p-6 sm:p-8 border-4 border-orange-300 shadow-xl min-h-[480px] flex flex-col justify-between overflow-hidden">
        
        {/* Customer Order Ticket */}
        <div className="bg-white/95 backdrop-blur-md px-6 py-4 rounded-3xl border-3 border-orange-300 shadow-md text-center max-w-lg mx-auto w-full">
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl">👨‍🍳</span>
            <div className="text-left">
              <h3 className="text-lg sm:text-xl font-black text-slate-800">
                Заказ: Пицца на{" "}
                <span className="text-orange-600 underline decoration-amber-400">
                  {currentOrder?.label}
                </span>
              </h3>
              <p className="text-xs font-bold text-slate-500">
                Добавьте: {currentOrder?.toppingEmoji} {currentOrder?.topping} ({currentOrder?.numerator} кусочка)
              </p>
            </div>
            <button
              onClick={speakOrder}
              className="p-2 rounded-xl bg-orange-100 text-orange-600 hover:bg-orange-200 transition-colors ml-auto"
              title="Озвучить рецепт"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback message if any */}
        {feedback && (
          <div className="max-w-md mx-auto my-2 px-4 py-2 bg-amber-100 text-amber-900 rounded-2xl text-xs font-bold text-center border border-amber-300 animate-scale-up">
            {feedback}
          </div>
        )}

        {/* Interactive Pizza Visualizer */}
        <div className="my-auto py-4 flex flex-col items-center justify-center">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-amber-200 border-8 border-amber-600 shadow-2xl p-2 flex items-center justify-center overflow-hidden">
            
            {/* Pizza Base Crust */}
            <div className="absolute inset-2 rounded-full bg-amber-300/80 border-4 border-dashed border-amber-400" />

            {/* Slices Grid */}
            <div
              className={`relative z-10 w-full h-full grid ${
                currentOrder.denominator === 2
                  ? "grid-cols-2"
                  : "grid-cols-2 grid-rows-2"
              } gap-1.5 p-2`}
            >
              {slices.map((isActive, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleSlice(idx)}
                  className={`group relative rounded-2xl flex flex-col items-center justify-center transition-all duration-200 border-2 active:scale-95 ${
                    isActive
                      ? "bg-gradient-to-tr from-red-500 to-amber-500 border-amber-200 shadow-inner"
                      : "bg-amber-100 hover:bg-amber-200/90 border-amber-300"
                  }`}
                >
                  <span className="text-3xl sm:text-4xl select-none group-hover:scale-110 transition-transform">
                    {isActive ? currentOrder.toppingEmoji : "➕"}
                  </span>
                  <span
                    className={`text-[10px] font-black mt-1 ${
                      isActive ? "text-white" : "text-amber-700"
                    }`}
                  >
                    Кусочек {idx + 1}
                  </span>
                </button>
              ))}
            </div>

          </div>

          <p className="text-xs font-black text-slate-500 mt-4 bg-white/70 px-4 py-1.5 rounded-full">
            👆 Нажимайте на дольки пиццы, чтобы добавить или убрать начинку
          </p>
        </div>

        {/* Deliver button */}
        <div className="max-w-xs mx-auto w-full">
          <button
            onClick={handleDeliver}
            className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-black text-base rounded-2xl shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            <span>Подать клиенту 🍕</span>
          </button>
        </div>

        {/* Victory Screen */}
        {isWon && (
          <div className="absolute inset-0 z-20 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center border-4 border-orange-400 shadow-2xl animate-scale-up">
              <div className="text-6xl mb-3">🍕👨‍🍳</div>
              <h3 className="font-black text-2xl text-slate-800">
                Шеф-Повар Пиццы!
              </h3>
              <p className="text-xs text-slate-600 font-semibold mt-1 mb-5">
                Вы безупречно приготовили все пиццы с дробями и накормили гостей!
              </p>
              <div className="flex justify-center gap-4 bg-orange-50 p-3 rounded-2xl border border-orange-200 mb-5">
                <div className="font-extrabold text-orange-700 text-sm">
                  🪙 +45 Монет
                </div>
                <div className="font-extrabold text-amber-700 text-sm">
                  ⭐ +4 Звезды
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsWon(false);
                    setOrderIndex(0);
                    initOrder(0);
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-black text-sm rounded-2xl shadow-md hover:from-orange-600 hover:to-red-600 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Готовить еще</span>
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
