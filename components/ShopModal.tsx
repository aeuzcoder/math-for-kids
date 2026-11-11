"use client";

import React, { useState } from "react";
import { useGame } from "@/context/GameContext";
import { SHOP_ITEMS } from "@/lib/data";
import { X, Check } from "lucide-react";

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({ isOpen, onClose }) => {
  const { stats, buyItem } = useGame();
  const [filter, setFilter] = useState<"all" | "hat" | "sticker" | "badge">("all");
  const [msg, setMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredItems = SHOP_ITEMS.filter(
    (item) => filter === "all" || item.category === filter
  );

  const handleBuy = (itemId: string, price: number) => {
    const success = buyItem(itemId, price);
    if (success) {
      setMsg("Поздравляем! Новый предмет успешно куплен! 🎉");
      setTimeout(() => setMsg(null), 3000);
    } else {
      setMsg("Недостаточно монет! Играйте больше и побеждайте! 💪");
      setTimeout(() => setMsg(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full border-4 border-emerald-300 shadow-2xl overflow-hidden animate-scale-up flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl border border-white/30">
              🛍️
            </div>
            <div>
              <h3 className="font-extrabold text-xl">Магазин Наград</h3>
              <div className="flex items-center gap-1.5 text-emerald-100 text-xs font-bold mt-0.5">
                <span>Ваш баланс:</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-white flex items-center gap-1">
                  🪙 {stats.coins} монет
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice alert if any */}
        {msg && (
          <div className="px-6 py-2.5 bg-amber-100 text-amber-900 text-xs font-bold text-center border-b border-amber-200">
            {msg}
          </div>
        )}

        {/* Filter categories */}
        <div className="p-4 border-b border-slate-100 flex gap-2 overflow-x-auto shrink-0">
          {[
            { id: "all", label: "Все товары" },
            { id: "hat", label: "Шляпы 🎩" },
            { id: "sticker", label: "Стикеры 🌈" },
            { id: "badge", label: "Кубки 🏆" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                filter === cat.id
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 gap-3.5">
            {filteredItems.map((item) => {
              const isUnlocked = stats.unlockedItemIds.includes(item.id);
              const canAfford = stats.coins >= item.price;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-between text-center transition-all ${
                    isUnlocked
                      ? "bg-emerald-50/70 border-emerald-200"
                      : "bg-white border-slate-200 hover:border-emerald-300"
                  }`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-4xl mb-2.5 shadow-inner">
                    {item.emoji}
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-800 mb-1">
                    {item.name}
                  </h4>
                  
                  {isUnlocked ? (
                    <div className="mt-2 w-full py-2 bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-300">
                      <Check className="w-4 h-4" />
                      <span>Куплено</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleBuy(item.id, item.price)}
                      disabled={!canAfford}
                      className={`mt-2 w-full py-2 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all ${
                        canAfford
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 active:scale-95"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                      }`}
                    >
                      <span>🪙</span>
                      <span>{item.price} монет</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
