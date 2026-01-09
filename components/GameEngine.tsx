
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GameSettings, CharacterClass, WeaponStats, WeaponType, RemotePlayer } from '../types';
import { audioService } from '../services/audioService';
import { multiplayerService } from '../services/multiplayerService';
import { WEAPONS, TEXTURES, NPC_COUNT } from '../constants';

interface GameEngineProps {
  settings: GameSettings;
  character: CharacterClass;
  currentWeapon: WeaponStats;
  onUpdateStats: (hp: number, ammo: number, moneyAdded?: number) => void;
  onDeath: () => void;
  isScoped: boolean;
  setIsScoped: (scoped: boolean) => void;
  isMultiplayer?: boolean;
}

type NPC = THREE.Group & {
  hp: number;
  velocity: THREE.Vector3;
  nextChange: number;
  lastShot: number;
  isDead: boolean;
  hpBar: THREE.Mesh;
};

interface IceWall {
  mesh: THREE.Mesh;
  createdAt: number;
  boundingBox: THREE.Box3;
}

interface DamageIndicator {
  sprite: THREE.Sprite;
  createdAt: number;
  velocity: THREE.Vector3;
}

const GameEngine: React.FC<GameEngineProps> = ({ settings, character, currentWeapon, onUpdateStats, onDeath, isScoped, setIsScoped, isMultiplayer }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const remotePlayersRef = useRef<Map<string, { mesh: THREE.Group, data: RemotePlayer }>>(new Map());
  
  const gameRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    player: THREE.Group;
    weaponGroup: THREE.Group;
    ammo: number;
    hp: number;
    isReloading: boolean;
    velocity: THREE.Vector3;
    isJumping: boolean;
    lastShot: number;
    npcs: NPC[];
    iceWalls: IceWall[];
    damageIndicators: DamageIndicator[];
    collidables: THREE.Object3D[];
    clock: THREE.Clock;
    isScopedLocal: boolean;
    isDead: boolean;
  } | null>(null);

  useEffect(() => {
    if (gameRef.current) {
      gameRef.current.isScopedLocal = isScoped;
      const { camera, weaponGroup } = gameRef.current;
      camera.fov = isScoped ? 18 : settings.fov;
      camera.updateProjectionMatrix();
      weaponGroup.visible = !isScoped;
    }
  }, [isScoped, settings.fov]);

  const createNameTag = (text: string) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 256; canvas.height = 64;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0,0,256,64);
    ctx.font = 'bold 32px monospace';
    ctx.fillStyle = '#ffff00';
    ctx.textAlign = 'center';
    ctx.fillText(text, 128, 45);
    const tex = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex }));
    sprite.scale.set(2, 0.5, 1);
    sprite.position.y = 2.5;
    return sprite;
  };

  const buildRemoteModel = (nick: string) => {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.7, 0.5), new THREE.MeshStandardMaterial({ color: 0x2244aa }));
    body.position.y = 0.85;
    group.add(body);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), new THREE.MeshStandardMaterial({ color: 0xddaa88 }));
    head.position.y = 1.9;
    group.add(head);
    group.add(createNameTag(nick));
    return group;
  };

  const createDamageSprite = (value: number, color: string, position: THREE.Vector3) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 128; canvas.height = 128;
    ctx.font = '900 60px "Courier New"';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 6;
    ctx.strokeText(value.toString(), 64, 64);
    ctx.fillText(value.toString(), 64, 64);
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.position.copy(position);
    sprite.scale.set(1.5, 1.5, 1);
    return sprite;
  };

  const buildWeapon = (wpId: string) => {
    const group = new THREE.Group();
    const matBlack = new THREE.MeshStandardMaterial({ color: 0x0a0a0a });
    const matMetal = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8 });
    const matWood = new THREE.MeshStandardMaterial({ color: 0x5d4037 });
    if (wpId === 'glock') {
      const slide = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.48), matMetal);
      slide.position.y = 0.04; group.add(slide);
      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.32, 0.12), matBlack);
      grip.position.set(0, -0.18, 0.16); grip.rotation.x = 0.3; group.add(grip);
    } else if (wpId === 'ak47') {
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2), matMetal);
      barrel.rotation.x = Math.PI / 2; barrel.position.z = -0.4; group.add(barrel);
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.15, 0.6), matMetal); group.add(body);
      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, 0.5), matWood);
      stock.position.set(0, -0.05, 0.5); group.add(stock);
    } else if (wpId === 'awp') {
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 1.2), matBlack); group.add(body);
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.8), matMetal);
      barrel.rotation.x = Math.PI / 2; barrel.position.z = -1.2; group.add(barrel);
    }
    return group;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); 
    scene.fog = new THREE.Fog(0x87ceeb, 20, 150);

    const camera = new THREE.PerspectiveCamera(settings.fov, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();
    const wallTexture = textureLoader.load(TEXTURES.WALL);
    wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(4, 2);
    const wallMat = new THREE.MeshStandardMaterial({ map: wallTexture, roughness: 0.9 });

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const sun = new THREE.DirectionalLight(0xffffff, 1.0);
    sun.position.set(50, 100, 50);
    sun.castShadow = true;
    scene.add(sun);

    const collidables: THREE.Object3D[] = [];
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), new THREE.MeshStandardMaterial({ color: 0x4a5d23 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const createWall = (x: number, z: number, w: number, h: number, r = 0) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, 2), wallMat);
      mesh.position.set(x, h/2, z);
      mesh.rotation.y = r;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      collidables.push(mesh);
    };

    createWall(0, -100, 200, 15); createWall(0, 100, 200, 15);
    createWall(-100, 0, 200, 15, Math.PI/2); createWall(100, 0, 200, 15, Math.PI/2);

    const weaponGroup = buildWeapon(currentWeapon.id);
    weaponGroup.position.set(0.35, -0.4, -0.7);
    camera.add(weaponGroup);

    const npcs: NPC[] = [];
    if (!isMultiplayer) {
      for (let i = 0; i < NPC_COUNT; i++) {
        const npc = new THREE.Group() as NPC;
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.7, 0.5), new THREE.MeshStandardMaterial({ color: 0x333333 }));
        body.position.y = 0.85; npc.add(body);
        npc.hp = 100; npc.isDead = false; npc.velocity = new THREE.Vector3();
        npc.position.set(Math.random()*160-80, 0, Math.random()*160-80);
        const hpBar = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.1), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
        hpBar.position.y = 2.4; npc.add(hpBar); npc.hpBar = hpBar;
        scene.add(npc); npcs.push(npc);
      }
    }

    const iceWalls: IceWall[] = [];
    const damageIndicators: DamageIndicator[] = [];

    gameRef.current = {
      scene, camera, renderer, 
      player: new THREE.Group().add(camera),
      weaponGroup, ammo: currentWeapon.ammo, hp: 100, isReloading: false,
      velocity: new THREE.Vector3(), isJumping: false, lastShot: 0,
      npcs, iceWalls, damageIndicators, collidables, clock: new THREE.Clock(),
      isScopedLocal: isScoped, isDead: false
    };
    scene.add(gameRef.current.player);
    gameRef.current.player.position.set(0, 1.7, 80);

    const checkCollision = (pos: THREE.Vector3): boolean => {
      const g = gameRef.current;
      if (!g) return false;
      const playerBox = new THREE.Box3().setFromCenterAndSize(pos, new THREE.Vector3(1.4, 1.8, 1.4));
      for (const obj of collidables) {
        const box = new THREE.Box3().setFromObject(obj);
        if (playerBox.intersectsBox(box)) return true;
      }
      for (const wall of iceWalls) {
        if (playerBox.intersectsBox(wall.boundingBox)) return true;
      }
      return false;
    };

    const spawnIceWall = (pos?: THREE.Vector3, rotY?: number, remote = false) => {
      const g = gameRef.current;
      if (!g || g.isDead) return;
      
      let spawnPos: THREE.Vector3;
      let spawnRot: number;

      if (pos && rotY !== undefined) {
        spawnPos = pos;
        spawnRot = rotY;
      } else {
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(g.player.quaternion);
        spawnPos = g.player.position.clone().add(forward.multiplyScalar(3.5));
        spawnPos.y = 1.6;
        spawnRot = g.player.rotation.y;
        if (isMultiplayer) multiplayerService.broadcast('SPAWN_ICE', { pos: spawnPos, rot: spawnRot });
      }

      const geo = new THREE.BoxGeometry(6.5, 4, 2);
      const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1.0, emissive: 0xffffff, emissiveIntensity: 0.1 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(spawnPos);
      mesh.rotation.y = spawnRot;
      mesh.castShadow = true; mesh.receiveShadow = true;
      mesh.updateMatrixWorld();
      const boundingBox = new THREE.Box3().setFromObject(mesh);
      scene.add(mesh);
      g.iceWalls.push({ mesh, createdAt: Date.now(), boundingBox });
      audioService.playReload(settings.volumeTiros * 0.3);
    };

    // Escuta de Multiplayer
    if (isMultiplayer) {
      multiplayerService.onMessage((msg) => {
        const g = gameRef.current;
        if (!g) return;

        if (msg.type === 'POS_UPDATE') {
          const { id, pos, rot, nick, hp, isDead } = msg.payload;
          if (!remotePlayersRef.current.has(id)) {
            const mesh = buildRemoteModel(nick);
            scene.add(mesh);
            remotePlayersRef.current.set(id, { mesh, data: msg.payload });
          }
          const remote = remotePlayersRef.current.get(id)!;
          remote.mesh.position.set(pos.x, pos.y - 1.7, pos.z);
          remote.mesh.rotation.y = rot.y;
          remote.data = msg.payload;
          if (isDead) remote.mesh.rotation.x = Math.PI / 2; else remote.mesh.rotation.x = 0;
        }

        if (msg.type === 'SPAWN_ICE') {
          spawnIceWall(new THREE.Vector3(msg.payload.pos.x, msg.payload.pos.y, msg.payload.pos.z), msg.payload.rot, true);
        }

        if (msg.type === 'SHOOT') {
          audioService.playShoot(settings.volumeTiros * 0.5);
        }

        if (msg.type === 'HIT' && msg.payload.targetId === multiplayerService.getMyId()) {
          g.hp -= msg.payload.damage;
          onUpdateStats(g.hp, g.ammo);
          if (g.hp <= 0 && !g.isDead) {
            g.isDead = true;
            multiplayerService.broadcast('DEATH', { id: multiplayerService.getMyId() });
            onDeath();
          }
        }
      });
    }

    const shoot = () => {
      const g = gameRef.current;
      if (!g || g.isDead) return;
      const delay = currentWeapon.type === WeaponType.SNIPER ? 1200 : 150;
      if (g.isReloading || g.ammo <= 0 || Date.now() - g.lastShot < delay) return;
      
      g.ammo--;
      g.lastShot = Date.now();
      audioService.playShoot(settings.volumeTiros);
      if (isMultiplayer) multiplayerService.broadcast('SHOOT', { weaponId: currentWeapon.id });
      
      camera.rotation.x += currentWeapon.recoil;
      const ray = new THREE.Raycaster();
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      ray.set(camera.getWorldPosition(new THREE.Vector3()), dir);

      const walls = [...collidables, ...g.iceWalls.map(w => w.mesh)];
      
      // Checar Bots (NPCs)
      const hitNPCs = g.npcs.filter(n => !n.isDead).flatMap(n => n.children.filter(c => c.type === 'Mesh'));
      
      // Checar Players Remotos
      const hitRemotes: THREE.Object3D[] = [];
      remotePlayersRef.current.forEach(rp => { if (!rp.data.isDead) rp.mesh.children.forEach(c => { if(c.type === 'Mesh') hitRemotes.push(c); })});

      const allPossibleHits = ray.intersectObjects([...hitNPCs, ...hitRemotes, ...walls]);

      if (allPossibleHits.length > 0) {
        const firstHit = allPossibleHits[0];
        if (walls.includes(firstHit.object)) return;

        // Dano em NPC
        let target: any = firstHit.object;
        while(target.parent && target.parent.type !== 'Scene' && !(target as any).hpBar) target = target.parent;
        if (target.hpBar) {
          const npc = target as NPC;
          npc.hp -= currentWeapon.damage;
          npc.hpBar.scale.x = Math.max(0, npc.hp / 100);
          if (npc.hp <= 0) { npc.isDead = true; npc.rotation.x = Math.PI/2; onUpdateStats(g.hp, g.ammo, 300); }
        }

        // Dano em Player Remoto
        remotePlayersRef.current.forEach((rp, id) => {
          if (rp.mesh.children.includes(firstHit.object)) {
            multiplayerService.broadcast('HIT', { targetId: id, damage: currentWeapon.damage });
            const sprite = createDamageSprite(currentWeapon.damage, '#ffff00', rp.mesh.position.clone().add(new THREE.Vector3(0, 2, 0)));
            scene.add(sprite);
            g.damageIndicators.push({ sprite, createdAt: Date.now(), velocity: new THREE.Vector3(0, 1, 0) });
          }
        });
      }
      onUpdateStats(g.hp, g.ammo);
    };

    const keys: Record<string, boolean> = {};
    const handleKey = (e: KeyboardEvent) => {
      if (e.type === 'keydown') {
        keys[e.code] = true;
        const g = gameRef.current;
        if (g && e.code === 'KeyR') { g.isReloading = true; setIsScoped(false); audioService.playReload(settings.volumeTiros); setTimeout(() => { if(gameRef.current) { gameRef.current.ammo = currentWeapon.maxAmmo; gameRef.current.isReloading = false; onUpdateStats(gameRef.current.hp, gameRef.current.ammo); }}, currentWeapon.reloadTime); }
        if (e.code === 'KeyQ') spawnIceWall();
        if (e.code === 'Space' && gameRef.current && !gameRef.current.isJumping) { gameRef.current.velocity.y = 7.5; gameRef.current.isJumping = true; }
      } else { keys[e.code] = false; }
    };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKey);

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) { if (document.pointerLockElement !== renderer.domElement) { renderer.domElement.requestPointerLock(); audioService.init(); } else { shoot(); } }
      else if (e.button === 2 && currentWeapon.type === WeaponType.SNIPER) setIsScoped(!gameRef.current?.isScopedLocal);
    };
    window.addEventListener('mousedown', onMouseDown);

    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== renderer.domElement) return;
      const g = gameRef.current; if (!g || g.isDead) return;
      const mult = g.isScopedLocal ? 0.2 : 1.0;
      const sens = settings.sensitivity * 0.0008 * mult;
      g.player.rotation.y -= e.movementX * sens;
      camera.rotation.x -= e.movementY * sens;
      camera.rotation.x = Math.max(-1.5, Math.min(1.5, camera.rotation.x));
    };
    window.addEventListener('mousemove', onMouseMove);

    let animationId: number;
    let networkTimer = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const g = gameRef.current;
      if (!g) return;
      const dt = g.clock.getDelta();

      if (!g.isDead) {
        if (g.isJumping || g.player.position.y > 1.7) {
          g.velocity.y -= 22 * dt;
          g.player.position.y += g.velocity.y * dt;
          if (g.player.position.y <= 1.7) { g.player.position.y = 1.7; g.velocity.y = 0; g.isJumping = false; }
        }

        const dir = new THREE.Vector3();
        if (keys['KeyW']) dir.z -= 1; if (keys['KeyS']) dir.z += 1;
        if (keys['KeyA']) dir.x -= 1; if (keys['KeyD']) dir.x += 1;
        dir.normalize();
        const speed = character.speed * (g.isScopedLocal ? 0.06 : 0.16);
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(g.player.quaternion);
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(g.player.quaternion);
        const moveVec = new THREE.Vector3().addScaledVector(forward, -dir.z).addScaledVector(right, dir.x);
        moveVec.y = 0; moveVec.normalize().multiplyScalar(speed);
        const nextPos = g.player.position.clone();
        const tryX = nextPos.clone().setX(nextPos.x + moveVec.x); if (!checkCollision(tryX)) nextPos.x = tryX.x;
        const tryZ = nextPos.clone().setZ(nextPos.z + moveVec.z); if (!checkCollision(tryZ)) nextPos.z = tryZ.z;
        g.player.position.x = nextPos.x; g.player.position.z = nextPos.z;

        // Broadcast de posição
        if (isMultiplayer) {
          networkTimer += dt;
          if (networkTimer > 0.05) {
            multiplayerService.broadcast('POS_UPDATE', {
              id: multiplayerService.getMyId(),
              nick: settings.nick,
              pos: g.player.position,
              rot: { y: g.player.rotation.y },
              hp: g.hp,
              isDead: g.isDead
            });
            networkTimer = 0;
          }
        }
      }

      g.iceWalls = g.iceWalls.filter(w => { if (Date.now() - w.createdAt > 10000) { scene.remove(w.mesh); return false; } return true; });
      g.damageIndicators = g.damageIndicators.filter(di => {
        const age = Date.now() - di.createdAt;
        if (age > 1000) { scene.remove(di.sprite); return false; }
        di.sprite.position.addScaledVector(di.velocity, dt);
        di.sprite.material.opacity = 1 - (age/1000);
        return true;
      });

      // Update NPCs (Bots)
      g.npcs.forEach(n => {
        if (n.isDead) return;
        const dist = n.position.distanceTo(g.player.position);
        if (dist < 30) {
          n.lookAt(g.player.position.x, 0, g.player.position.z);
          if (Date.now() - n.lastShot > 1800) {
            n.lastShot = Date.now();
            audioService.playShoot(settings.volumeTiros * 0.4);
            g.hp -= 10; onUpdateStats(g.hp, g.ammo);
            if (g.hp <= 0) { g.isDead = true; onDeath(); }
          }
        }
        n.hpBar.lookAt(camera.position);
      });

      // Limpeza de jogadores inativos
      remotePlayersRef.current.forEach((rp, id) => {
        if (Date.now() - rp.data.lastUpdate > 5000) { scene.remove(rp.mesh); remotePlayersRef.current.delete(id); }
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', handleKey); window.removeEventListener('keyup', handleKey);
      window.removeEventListener('mousedown', onMouseDown); window.removeEventListener('mousemove', onMouseMove);
      if (containerRef.current && renderer.domElement.parentNode) containerRef.current.removeChild(renderer.domElement);
      renderer.dispose();
      multiplayerService.disconnect();
    };
  }, [character, settings, currentWeapon, isMultiplayer]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default GameEngine;
