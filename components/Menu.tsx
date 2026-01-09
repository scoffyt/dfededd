
import React from 'react';
import { GameState, CharacterClass, GameSettings } from '../types';

interface MenuProps {
  onStateChange: (state: GameState) => void;
  character: CharacterClass;
  settings: GameSettings;
}

const Menu: React.FC<MenuProps> = ({ onStateChange, character, settings }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 bg-opacity-90 text-white z-50">
      <div className="mb-12 text-center">
        <h1 className="text-6xl font-black italic tracking-tighter text-yellow-500 drop-shadow-lg uppercase">Frag Strike 1.6</h1>
        <p className="text-zinc-500 font-mono tracking-widest mt-2 uppercase">V1.0 MULTIPLAYER READY</p>
      </div>

      <div className="flex flex-col space-y-4 w-64">
        <MenuButton onClick={() => onStateChange(GameState.PLAYING)} label="Jogar Local (Bots)" primary />
        <MenuButton onClick={() => onStateChange(GameState.LOBBY)} label="Multiplayer (Online)" />
        <MenuButton onClick={() => onStateChange(GameState.CHARACTER_SELECT)} label="Escolher Personagem" />
        <MenuButton onClick={() => onStateChange(GameState.SETTINGS)} label="Configurações" />
        
        <div className="pt-8 border-t border-zinc-700 mt-4 text-center">
          <p className="text-xs text-zinc-500 font-mono">USUÁRIO: {settings.nick}</p>
          <p className="text-xs text-zinc-500 font-mono">CLASSE: {character.name}</p>
        </div>
      </div>
    </div>
  );
};

const MenuButton: React.FC<{ onClick: () => void, label: string, primary?: boolean, disabled?: boolean }> = ({ onClick, label, primary, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      py-3 px-6 font-bold uppercase tracking-wider transition-all border-l-4
      ${primary 
        ? 'bg-yellow-600 border-yellow-400 hover:bg-yellow-500' 
        : 'bg-zinc-800 border-zinc-600 hover:bg-zinc-700'}
      ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'active:scale-95'}
    `}
  >
    {label}
  </button>
);

export default Menu;
