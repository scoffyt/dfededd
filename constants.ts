
import { WeaponType, WeaponStats, CharacterClass, GameSettings } from './types';

export const WEAPONS: Record<string, WeaponStats> = {
  'glock': {
    id: 'glock',
    name: 'Glock-18',
    type: WeaponType.PISTOL,
    damage: 22,
    ammo: 20,
    maxAmmo: 20,
    recoil: 0.015,
    spread: 0.008,
    reloadTime: 1200,
    price: 400
  },
  'ak47': {
    id: 'ak47',
    name: 'AK-47',
    type: WeaponType.RIFLE,
    damage: 35,
    ammo: 30,
    maxAmmo: 30,
    recoil: 0.04,
    spread: 0.02,
    reloadTime: 2200,
    price: 2700
  },
  'awp': {
    id: 'awp',
    name: 'AWP',
    type: WeaponType.SNIPER,
    damage: 150,
    ammo: 10,
    maxAmmo: 10,
    recoil: 0.2,
    spread: 0.001,
    reloadTime: 3500,
    price: 4750
  }
};

export const CHARACTER_CLASSES: CharacterClass[] = [
  { id: 'tactical_unit', name: 'Tactical Unit', health: 100, speed: 0.7, initialWeapon: 'glock', color: '#1a1a1a' },
  { id: 'strike_team', name: 'Strike Team', health: 100, speed: 0.7, initialWeapon: 'glock', color: '#2f4f4f' }
];

export const DEFAULT_SETTINGS: GameSettings = {
  nick: 'Operator',
  sensitivity: 2.0,
  volumeTiros: 0.4,
  volumePassos: 0.2,
  volumeMusica: 0.1,
  graphics: 'High',
  fov: 85,
  showCrosshair: true
};

export const TEXTURES = {
  // Textura que imita o "grafiato" da imagem enviada
  WALL: 'https://images.unsplash.com/photo-1516550100458-91bd9d6d621b?auto=format&fit=crop&q=80&w=1024',
  FLOOR: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/grid.png',
  WATER: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/water/Water_2_M_Normal.jpg'
};

export const NPC_COUNT = 8;
