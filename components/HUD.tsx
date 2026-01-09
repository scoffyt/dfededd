
import React from 'react';
import { CharacterClass, GameSettings, WeaponStats, WeaponType } from '../types';

interface HUDProps {
  hp: number;
  ammo: number;
  money: number;
  currentWeapon: WeaponStats;
  settings: GameSettings;
  onBackToMenu: () => void;
  isScoped: boolean;
}

const HUD: React.FC<HUDProps> = ({ hp, ammo, money, currentWeapon, settings, onBackToMenu, isScoped }) => {
  return (
    <div className="absolute inset-0 pointer-events-none select-none p-8 flex flex-col justify-between text-yellow-500 font-mono z-40">
      
      {/* Sniper Scope Overlay */}
      {isScoped && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
          <div className="w-full h-full border-[100px] sm:border-[200px] md:border-[300px] border-black rounded-full shadow-[0_0_0_2000px_rgba(0,0,0,1)]">
             <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black opacity-80" />
             <div className="absolute left-1/2 top-0 h-full w-[1px] bg-black opacity-80" />
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="flex justify-between items-start">
        <div className="flex space-x-4">
          <div className="bg-black bg-opacity-70 p-4 border-l-4 border-yellow-500 backdrop-blur-sm pointer-events-auto">
            <p className="text-[10px] opacity-70 uppercase tracking-widest">Operator</p>
            <p className="text-xl font-black">{settings.nick}</p>
          </div>
          
          <button 
            onClick={onBackToMenu}
            className="bg-zinc-900 bg-opacity-80 border border-zinc-700 px-6 py-4 text-xs font-black uppercase italic tracking-tighter hover:bg-yellow-600 hover:text-black transition-all pointer-events-auto"
          >
            Menu [ESC]
          </button>
        </div>

        <div className="text-right bg-black bg-opacity-70 p-4 border-r-4 border-green-500 backdrop-blur-sm">
          <p className="text-[10px] opacity-70 italic uppercase tracking-widest">Saldo Bancário</p>
          <p className="text-2xl font-black text-green-400">${money}</p>
        </div>
      </div>

      {/* Crosshair */}
      {settings.showCrosshair && !isScoped && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 opacity-80">
          <div className="absolute top-1/2 left-0 w-3 h-[2px] bg-green-400" />
          <div className="absolute top-1/2 right-0 w-3 h-[2px] bg-green-400" />
          <div className="absolute top-0 left-1/2 w-[2px] h-3 bg-green-400" />
          <div className="absolute bottom-0 left-1/2 w-[2px] h-3 bg-green-400" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-green-400 rounded-full" />
        </div>
      )}

      {/* Center Messages */}
      <div className="flex flex-col items-center justify-center mb-40 space-y-4">
        {ammo === 0 && (
          <div className="bg-red-600 bg-opacity-90 text-white px-8 py-2 font-black text-xl animate-bounce uppercase tracking-tighter">
            RELOAD REQUIRED [R]
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="flex justify-between items-end">
        <div className="bg-black bg-opacity-80 p-6 flex items-baseline space-x-6 border-b-4 border-yellow-500 backdrop-blur-md">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase opacity-60 font-black">Vitalidade</span>
            <span className={`text-5xl font-black leading-none ${hp < 35 ? 'text-red-500 animate-pulse' : ''}`}>{hp}</span>
          </div>
          <div className="w-[2px] h-10 bg-zinc-800" />
          <div className="flex flex-col">
             <span className="text-[10px] uppercase opacity-60 font-black">Loja [B]</span>
             <span className="text-4xl font-bold opacity-80 leading-none">LOJA</span>
          </div>
        </div>

        <div className="bg-black bg-opacity-80 p-6 flex flex-col items-end border-b-4 border-yellow-500 min-w-[200px] backdrop-blur-md">
          <span className="text-[10px] uppercase opacity-60 font-black mb-1 tracking-widest">{currentWeapon.name}</span>
          <div className="flex items-baseline space-x-3">
            <span className={`text-6xl font-black leading-none ${ammo < (currentWeapon.maxAmmo/4) ? 'text-red-500' : ''}`}>{ammo}</span>
            <span className="text-2xl opacity-40 font-black">/ {currentWeapon.maxAmmo * 5}</span>
          </div>
        </div>
      </div>

      {/* Interaction Hint */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] opacity-50 text-white uppercase tracking-widest font-mono text-center">
        Q: PAREDE DE GELO | Botão Direito: Mira Sniper | B: Loja | ESC: Menu
      </div>
    </div>
  );
};

export default HUD;
