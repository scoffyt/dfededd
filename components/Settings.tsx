
import React from 'react';
import { GameSettings, GameState } from '../types';

interface SettingsProps {
  settings: GameSettings;
  onSave: (settings: GameSettings) => void;
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSave, onBack }) => {
  const [localSettings, setLocalSettings] = React.useState(settings);

  const handleSave = () => {
    onSave(localSettings);
    onBack();
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 z-50 p-8 overflow-y-auto">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 p-8 shadow-2xl">
        <h2 className="text-3xl font-black text-yellow-500 mb-8 border-b border-zinc-800 pb-4 uppercase tracking-tighter italic">Player Options</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="space-y-6">
            <label className="block">
              <span className="text-xs uppercase tracking-widest text-zinc-500 mb-2 block">Player Nickname</span>
              <input 
                type="text" 
                value={localSettings.nick}
                onChange={e => setLocalSettings({...localSettings, nick: e.target.value})}
                className="w-full bg-zinc-800 border border-zinc-700 p-2 text-white font-mono focus:outline-none focus:border-yellow-500"
              />
            </label>

            <label className="block">
              <span className="text-xs uppercase tracking-widest text-zinc-500 mb-2 block">Mouse Sensitivity ({localSettings.sensitivity})</span>
              <input 
                type="range" min="0.1" max="10" step="0.1"
                value={localSettings.sensitivity}
                onChange={e => setLocalSettings({...localSettings, sensitivity: parseFloat(e.target.value)})}
                className="w-full accent-yellow-500"
              />
            </label>

            <label className="block">
              <span className="text-xs uppercase tracking-widest text-zinc-500 mb-2 block">Graphics Quality</span>
              <select 
                value={localSettings.graphics}
                onChange={e => setLocalSettings({...localSettings, graphics: e.target.value as any})}
                className="w-full bg-zinc-800 border border-zinc-700 p-2 text-white font-mono focus:outline-none"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </label>
          </div>

          <div className="space-y-6">
            <label className="block">
              <span className="text-xs uppercase tracking-widest text-zinc-500 mb-2 block">Volume: Shots</span>
              <input 
                type="range" min="0" max="1" step="0.01"
                value={localSettings.volumeTiros}
                onChange={e => setLocalSettings({...localSettings, volumeTiros: parseFloat(e.target.value)})}
                className="w-full accent-yellow-500"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-widest text-zinc-500 mb-2 block">Volume: Steps</span>
              <input 
                type="range" min="0" max="1" step="0.01"
                value={localSettings.volumePassos}
                onChange={e => setLocalSettings({...localSettings, volumePassos: parseFloat(e.target.value)})}
                className="w-full accent-yellow-500"
              />
            </label>
            <div className="flex items-center space-x-3">
              <input 
                type="checkbox" 
                checked={localSettings.showCrosshair}
                onChange={e => setLocalSettings({...localSettings, showCrosshair: e.target.checked})}
                className="w-5 h-5 accent-yellow-500"
              />
              <span className="text-xs uppercase tracking-widest text-zinc-300">Show Crosshair</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button onClick={handleSave} className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-black py-4 font-black uppercase italic transition-colors">Apply Changes</button>
          <button onClick={onBack} className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-4 font-black uppercase italic transition-colors">Discard</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
