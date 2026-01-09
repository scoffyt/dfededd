
import React from 'react';

interface Props {
  onReset: () => void;
}

const GameOver: React.FC<Props> = ({ onReset }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-red-600 z-[200] animate-pulse">
      <h1 className="text-8xl font-black italic tracking-tighter mb-4 uppercase">SE FUDEU!</h1>
      <p className="text-zinc-500 font-mono mb-12 text-xl uppercase tracking-widest">Você foi eliminado em combate.</p>
      
      <button 
        onClick={onReset}
        className="bg-red-700 hover:bg-red-600 text-white px-12 py-6 text-2xl font-black uppercase italic tracking-tighter border-4 border-red-500 transition-all hover:scale-110 active:scale-95"
      >
        TENTAR NOVAMENTE
      </button>

      <div className="absolute bottom-10 text-[10px] text-zinc-800 uppercase font-mono">
        MISSION FAILED - STATUS: KIA
      </div>
    </div>
  );
};

export default GameOver;
