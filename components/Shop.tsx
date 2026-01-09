
import React from 'react';
import { WEAPONS } from '../constants';
import { WeaponStats } from '../types';

interface ShopProps {
  money: number;
  onBuy: (weapon: WeaponStats) => void;
  onClose: () => void;
}

const Shop: React.FC<ShopProps> = ({ money, onBuy, onClose }) => {
  const weaponsToSell = Object.values(WEAPONS);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 z-[100] backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border-2 border-yellow-600 w-full max-w-2xl p-8 shadow-2xl flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-black italic text-yellow-500 uppercase tracking-tighter">Armaria / Shop</h2>
          <div className="text-right">
            <p className="text-zinc-500 text-[10px] uppercase tracking-widest">Saldo Atual</p>
            <p className="text-3xl font-black text-green-500">${money}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[60vh] pr-2">
          {weaponsToSell.map(w => (
            <div key={w.id} className={`flex items-center justify-between p-4 border ${money >= w.price ? 'border-zinc-700 hover:bg-zinc-800' : 'border-red-900 opacity-50 grayscale'}`}>
              <div>
                <h3 className="text-xl font-bold uppercase">{w.name}</h3>
                <p className="text-xs text-zinc-500 uppercase">{w.type} | DANO: {w.damage} | PENTE: {w.maxAmmo}</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-2xl font-black text-yellow-600">${w.price}</span>
                <button 
                  disabled={money < w.price}
                  onClick={() => onBuy(w)}
                  className={`px-6 py-2 font-black uppercase italic transition-all ${money >= w.price ? 'bg-yellow-600 hover:bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}`}
                >
                  Comprar
                </button>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={onClose}
          className="mt-8 bg-zinc-800 hover:bg-zinc-700 text-white py-4 font-black uppercase tracking-widest transition-colors border-t border-zinc-700"
        >
          Fechar [ESC / B]
        </button>
      </div>
    </div>
  );
};

export default Shop;
