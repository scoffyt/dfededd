
import React, { useState, useEffect } from 'react';
import { GameState, GameSettings, CharacterClass, WeaponStats } from './types';
import { DEFAULT_SETTINGS, CHARACTER_CLASSES, WEAPONS } from './constants';
import Menu from './components/Menu';
import Settings from './components/Settings';
import CharacterSelect from './components/CharacterSelect';
import GameEngine from './components/GameEngine';
import HUD from './components/HUD';
import Shop from './components/Shop';
import GameOver from './components/GameOver';
import Lobby from './components/Lobby';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem('frag_strike_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });
  const [character, setCharacter] = useState<CharacterClass>(CHARACTER_CLASSES[0]);
  
  const [hp, setHp] = useState(100);
  const [ammo, setAmmo] = useState(0);
  const [money, setMoney] = useState(16000);
  const [currentWeapon, setCurrentWeapon] = useState<WeaponStats>(WEAPONS['glock']);
  const [isScoped, setIsScoped] = useState(false);

  useEffect(() => {
    localStorage.setItem('frag_strike_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    setAmmo(currentWeapon.maxAmmo);
  }, [currentWeapon]);

  const handleUpdateStats = (newHp: number, newAmmo: number, moneyAdded?: number) => {
    setHp(newHp);
    setAmmo(newAmmo);
    if (moneyAdded) setMoney(prev => prev + moneyAdded);
  };

  const handleBuy = (weapon: WeaponStats) => {
    if (money >= weapon.price) {
      setMoney(prev => prev - weapon.price);
      setCurrentWeapon(weapon);
      setGameState(GameState.PLAYING);
    }
  };

  const handleDeath = () => {
    document.exitPointerLock?.();
    setGameState(GameState.GAMEOVER);
  };

  const resetGame = () => {
    setHp(100);
    setMoney(16000);
    setCurrentWeapon(WEAPONS['glock']);
    setIsScoped(false);
    setGameState(GameState.MENU);
  };

  const startMultiplayer = () => {
    setIsMultiplayer(true);
    setGameState(GameState.PLAYING);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyB') {
        if (gameState === GameState.PLAYING) {
          setGameState(GameState.SHOP);
          document.exitPointerLock?.();
        } else if (gameState === GameState.SHOP) {
          setGameState(GameState.PLAYING);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [gameState]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none">
      {gameState === GameState.MENU && (
        <Menu 
          onStateChange={setGameState} 
          character={character} 
          settings={settings} 
        />
      )}

      {gameState === GameState.LOBBY && (
        <Lobby 
          onBack={() => setGameState(GameState.MENU)}
          onJoin={startMultiplayer}
        />
      )}

      {gameState === GameState.SETTINGS && (
        <Settings 
          settings={settings} 
          onSave={setSettings} 
          onBack={() => setGameState(GameState.MENU)} 
        />
      )}

      {gameState === GameState.CHARACTER_SELECT && (
        <CharacterSelect 
          onSelect={setCharacter} 
          selected={character} 
          onBack={() => setGameState(GameState.MENU)} 
        />
      )}

      {gameState === GameState.SHOP && (
        <Shop 
          money={money} 
          onBuy={handleBuy} 
          onClose={() => setGameState(GameState.PLAYING)} 
        />
      )}

      {gameState === GameState.GAMEOVER && (
        <GameOver onReset={resetGame} />
      )}

      {(gameState === GameState.PLAYING || gameState === GameState.PAUSED || gameState === GameState.SHOP) && (
        <>
          <GameEngine 
            settings={settings} 
            character={character} 
            currentWeapon={currentWeapon}
            onUpdateStats={handleUpdateStats}
            onDeath={handleDeath}
            isScoped={isScoped}
            setIsScoped={setIsScoped}
            isMultiplayer={isMultiplayer}
          />
          <HUD 
            hp={hp} 
            ammo={ammo} 
            money={money}
            currentWeapon={currentWeapon}
            settings={settings} 
            onBackToMenu={() => setGameState(GameState.MENU)}
            isScoped={isScoped}
          />
        </>
      )}
    </div>
  );
};

export default App;
