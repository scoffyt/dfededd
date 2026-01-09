
import React from 'react';
import { CHARACTER_CLASSES, WEAPONS } from '../constants';
import { CharacterClass } from '../types';

interface Props {
  onSelect: (c: CharacterClass) => void;
  selected: CharacterClass;
  onBack: () => void;
}

const CharacterSelect: React.FC<Props> = ({ onSelect, selected, onBack }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 text-white z-50 p-8">
      <h2 className="text-4xl font-black italic text-yellow-500 mb-12 uppercase">Choose Your Class</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        {CHARACTER_CLASSES.map(c => (
          <div 
            key={c.id}
            onClick={() => onSelect(c)}
            className={`
              cursor-pointer p-6 border-2 transition-all group relative overflow-hidden
              ${selected.id === c.id ? 'border-yellow-500 bg-yellow-500 bg-opacity-10 scale-105' : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'}
            `}
          >
            <div 
              className="w-full h-48 mb-4 flex items-center justify-center"
              style={{ backgroundColor: c.color }}
            >
              <span className="text-white text-5xl font-black opacity-20 group-hover:opacity-40 transition-opacity">?</span>
            </div>
            
            <h3 className="text-xl font-bold mb-2 uppercase tracking-tighter">{c.name}</h3>
            
            <div className="space-y-1 text-xs font-mono text-zinc-400">
              <p>HP: {c.health}</p>
              <p>SPEED: {c.speed}x</p>
              <p>PRIMARY: {WEAPONS[c.initialWeapon].name}</p>
            </div>

            {selected.id === c.id && (
              <div className="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 text-[10px] font-bold">SELECTED</div>
            )}
          </div>
        ))}
      </div>

      <button 
        onClick={onBack}
        className="mt-12 bg-zinc-800 hover:bg-zinc-700 px-12 py-4 font-black uppercase tracking-widest italic transition-colors"
      >
        Confirm & Back
      </button>
    </div>
  );
};

export default CharacterSelect;
