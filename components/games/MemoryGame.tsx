"use client";

import React, { useState, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import { sound } from "@/lib/sound";
import { ArrowLeft, RotateCcw, HelpCircle } from "lucide-react";

interface MemoryCard {
  id: string;
  pairId: number;
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const PAIR_PRESETS = [
  { pId: 1, expr: "2 + 3", val: "5" },
  { pId: 2, expr: "6 + 4", val: "10" },
  { pId: 3, expr: "9 - 5", val: "4" },
  { pId: 4, expr: "3 × 3", val: "9" },
  { pId: 5, expr: "8 + 7", val: "15" },
  { pId: 6, expr: "12 - 4", val: "8" },
];

export const MemoryGame: React.FC = () => {
  const { setActiveGameId, addReward, recordGameFinished, triggerConfetti } = useGame();

  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<MemoryCard[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [matches, setMatches] = useState<number>(0);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  const initGame = () => {
    const rawCards: MemoryCard[] = [];
    PAIR_PRESETS.forEach((item, idx) => {
      // Problem card
      rawCards.push({
        id: `p-${idx}`,
        pairId: item.pId,
        content: item.expr,
        isFlipped: false,
        isMatched: false,
      });
      // Answer card
      rawCards.push({
        id: `a-${idx}`,
        pairId: item.pId,
        content: item.val,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle
    const shuffled = rawCards.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setIsWon(false);
    setIsLocked(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleCardClick = (card: MemoryCard) => {
    if (isLocked || card.isFlipped || card.isMatched) return;

    sound.playClick();
    const updatedCards = cards.map((c) =>
      c.id === card.id ? { ...c, isFlipped: true } : c
    );
    setCards(updatedCards);

    const newFlipped = [...flippedCards, card];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      setIsLocked(true);

      const [first, second] = newFlipped;
      if (first.pairId === second.pairId) {
        // Matched!
        sound.playCorrect();
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.pairId === first.pairId
                ? { ...c, isMatched: true, isFlipped: true }
                : c
            )
          );
          setFlippedCards([]);
          setIsLocked(false);
          const newMatches = matches + 1;
          setMatches(newMatches);

          if (newMatches === PAIR_PRESETS.length) {
            // Victory
            setIsWon(true);
            sound.playFanfare();
            triggerConfetti();
            addReward(3, 35, 70);
            recordGameFinished("memory", true);
          }
        }, 500);
      } else {
        // Not matched
        sound.playWrong();
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === first.id || c.id === second.id
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlippedCards([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-3xl border-2 border-amber-200 shadow-sm">
        <button
          onClick={() => setActiveGameId(null)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-extrabold text-sm border border-amber-200 transition-transform active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="bg-amber-100 text-amber-800 font-extrabold text-xs sm:text-sm px-3.5 py-1.5 rounded-xl">
            Попыток: {moves}
          </span>
          <span className="bg-emerald-100 text-emerald-800 font-extrabold text-xs sm:text-sm px-3.5 py-1.5 rounded-xl">
            Найдено: {matches} / {PAIR_PRESETS.length}
          </span>
        </div>
      </div>

      {/* Main Board */}
      <div className="relative bg-gradient-to-b from-amber-100 via-orange-50 to-amber-200 rounded-3xl p-6 sm:p-8 border-4 border-amber-300 shadow-xl min-h-[460px] flex flex-col justify-between overflow-hidden">
        
        {/* Banner */}
        <div className="bg-white/95 backdrop-blur-md px-6 py-3.5 rounded-3xl border-3 border-amber-300 shadow-md text-center max-w-md mx-auto w-full">
          <h3 className="text-xl font-black text-slate-800">
            Найдите Все Пары!
          </h3>
          <p className="text-xs font-bold text-amber-700 mt-0.5">
            Соедините пример и карточку с его правильным ответом (например: 2 + 3 = 5)
          </p>
        </div>

        {/* 4x3 Cards Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 my-auto py-4 max-w-2xl mx-auto w-full">
          {cards.map((card) => {
            const isOpen = card.isFlipped || card.isMatched;

            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card)}
                disabled={isOpen || isLocked}
                className={`h-24 sm:h-28 rounded-2xl font-black text-xl sm:text-2xl flex items-center justify-center transition-all duration-300 shadow-md border-3 ${
                  card.isMatched
                    ? "bg-emerald-100 text-emerald-800 border-emerald-400 scale-95 opacity-80"
                    : isOpen
                    ? "bg-white text-amber-900 border-amber-400 shadow-lg scale-100"
                    : "bg-gradient-to-tr from-amber-400 to-orange-400 text-white border-amber-300 hover:scale-105 active:scale-95"
                }`}
              >
                {isOpen ? (
                  <span className="animate-scale-up select-none">
                    {card.content}
                  </span>
                ) : (
                  <HelpCircle className="w-8 h-8 text-white/80" />
                )}
              </button>
            );
          })}
        </div>

        {/* Victory Screen */}
        {isWon && (
          <div className="absolute inset-0 z-20 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center border-4 border-amber-400 shadow-2xl animate-scale-up">
              <div className="text-6xl mb-3">🧠✨</div>
              <h3 className="font-black text-2xl text-slate-800">
                Блестящая Память!
              </h3>
              <p className="text-xs text-slate-600 font-semibold mt-1 mb-5">
                Вы отыскали все математические пары за {moves} ходов!
              </p>
              <div className="flex justify-center gap-4 bg-amber-50 p-3 rounded-2xl border border-amber-200 mb-5">
                <div className="font-extrabold text-amber-700 text-sm">
                  🪙 +35 Монет
                </div>
                <div className="font-extrabold text-yellow-700 text-sm">
                  ⭐ +3 Звезды
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={initGame}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-sm rounded-2xl shadow-md hover:from-amber-600 hover:to-orange-600 active:scale-95 transition-all flex items-center justify-center gap-1.5"
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
