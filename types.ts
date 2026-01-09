
export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  SETTINGS = 'SETTINGS',
  CHARACTER_SELECT = 'CHARACTER_SELECT',
  PAUSED = 'PAUSED',
  SHOP = 'SHOP',
  GAMEOVER = 'GAMEOVER',
  LOBBY = 'LOBBY'
}

export enum WeaponType {
  KNIFE = 'KNIFE',
  PISTOL = 'PISTOL',
  RIFLE = 'RIFLE',
  SNIPER = 'SNIPER'
}

export interface WeaponStats {
  id: string;
  name: string;
  type: WeaponType;
  damage: number;
  ammo: number;
  maxAmmo: number;
  recoil: number;
  spread: number;
  reloadTime: number;
  price: number;
}

export interface CharacterClass {
  id: string;
  name: string;
  health: number;
  speed: number;
  initialWeapon: string;
  color: string;
}

export interface GameSettings {
  nick: string;
  sensitivity: number;
  volumeTiros: number;
  volumePassos: number;
  volumeMusica: number;
  graphics: 'Low' | 'Medium' | 'High';
  fov: number;
  showCrosshair: boolean;
}

export interface RemotePlayer {
  id: string;
  nick: string;
  position: { x: number, y: number, z: number };
  rotation: { y: number };
  hp: number;
  weaponId: string;
  lastUpdate: number;
  isDead: boolean;
}

export interface NetworkMessage {
  type: 'POS_UPDATE' | 'SHOOT' | 'SPAWN_ICE' | 'HIT' | 'DEATH';
  payload: any;
  senderId: string;
}
