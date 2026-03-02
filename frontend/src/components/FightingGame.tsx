import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { GameState, Character, LEVEL_CONFIGS, MAX_LEVELS } from '../types/game';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { useGameLoop } from '../hooks/useGameLoop';
import { applyPhysics, applyPlayerInput } from '../utils/gamePhysics';
import { updateEnemyAI, getEnemyConfigForLevel } from '../utils/enemyAI';
import {
  checkMeleeHit,
  updateParticles,
  updateProjectiles,
  checkProjectileHitsEnemy,
  spawnProjectileHitParticles,
} from '../utils/combatSystem';
import Scene3D from './Scene3D';
import OnScreenControls from './OnScreenControls';
import GameHUD from './GameHUD';
import LevelTransitionScreen from './LevelTransitionScreen';
import VictoryScreen from './VictoryScreen';

const ATTACK_DURATION = 0.35;
const ATTACK_COOLDOWN = 0.5;
const HIT_FLASH_DURATION = 0.2;
const SWORD_ATTACK_DURATION = 0.45;
const SWORD_COOLDOWN = 0.7;

function createPlayer(): Character {
  return {
    id: 'player',
    x: -2,
    y: 0,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    health: 150,
    maxHealth: 150,
    facing: 1,
    isAttacking: false,
    attackType: 'none',
    attackTimer: 0,
    isJumping: false,
    isGrounded: true,
    hitFlashTimer: 0,
    isBlocking: false,
    swordActive: false,
    swordDamageMultiplier: 1.0,
  };
}

function createEnemy(level: number): Character {
  const cfg = LEVEL_CONFIGS.find(c => c.level === level) ?? LEVEL_CONFIGS[0];
  return {
    id: 'enemy',
    x: 2,
    y: 0,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    health: Math.round(120 * cfg.enemyHealthMultiplier),
    maxHealth: Math.round(120 * cfg.enemyHealthMultiplier),
    facing: -1,
    isAttacking: false,
    attackType: 'none',
    attackTimer: 0,
    isJumping: false,
    isGrounded: true,
    hitFlashTimer: 0,
    isBlocking: false,
    swordActive: false,
    swordDamageMultiplier: 1.0,
  };
}

function createInitialState(): GameState {
  return {
    player: createPlayer(),
    enemies: [createEnemy(1)],
    particles: [],
    projectiles: [],
    gamePhase: 'playing',
    score: 0,
    timeElapsed: 0,
    muzzleFlashTime: -999,
    playerDamageFlashTime: -999,
    playerLandedTime: -999,
    enemyLandedTime: -999,
    explosionEvents: [],
    currentLevel: 1,
    enemiesDefeatedInLevel: 0,
    levelTransitioning: false,
    levelTransitionTimer: 0,
    allLevelsComplete: false,
  };
}

export default function FightingGame() {
  const [gameState, setGameState] = useState<GameState>(createInitialState);
  const keysRef = useKeyboardControls();
  const stateRef = useRef<GameState>(gameState);
  const attackCooldownRef = useRef(0);
  const enemyAICooldownRef = useRef(0);
  const playerWasGroundedRef = useRef(true);
  const enemyWasGroundedRef = useRef(true);
  const [showLevelTransition, setShowLevelTransition] = useState(false);
  const [transitionLevel, setTransitionLevel] = useState(1);

  // Keep stateRef in sync
  useEffect(() => {
    stateRef.current = gameState;
  }, [gameState]);

  const handleLevelTransitionComplete = useCallback(() => {
    setShowLevelTransition(false);
    setGameState(prev => ({
      ...prev,
      levelTransitioning: false,
    }));
  }, []);

  const handleReplay = useCallback(() => {
    const fresh = createInitialState();
    stateRef.current = fresh;
    setGameState(fresh);
    attackCooldownRef.current = 0;
    enemyAICooldownRef.current = 0;
    setShowLevelTransition(false);
  }, []);

  const update = useCallback((delta: number) => {
    const state = stateRef.current;

    // Don't update during level transition or if game over
    if (
      state.levelTransitioning ||
      state.allLevelsComplete ||
      state.gamePhase === 'playerWon' ||
      state.gamePhase === 'playerLost'
    ) {
      return;
    }

    let player = { ...state.player };
    let enemies = state.enemies.map(e => ({ ...e }));
    let particles = [...state.particles];
    let projectiles = [...state.projectiles];
    let score = state.score;
    let muzzleFlashTime = state.muzzleFlashTime;
    let playerDamageFlashTime = state.playerDamageFlashTime;
    let playerLandedTime = state.playerLandedTime;
    let enemyLandedTime = state.enemyLandedTime;
    let explosionEvents = [...state.explosionEvents];
    let currentLevel = state.currentLevel;
    let enemiesDefeatedInLevel = state.enemiesDefeatedInLevel;
    let levelTransitioning = false;
    let allLevelsComplete = false;

    const now = state.timeElapsed + delta;

    // ── Attack cooldown ──
    attackCooldownRef.current = Math.max(0, attackCooldownRef.current - delta);

    // ── Sword input ──
    const swordKeyPressed = keysRef.current.sword;
    if (swordKeyPressed && attackCooldownRef.current <= 0 && !player.isAttacking) {
      player.isAttacking = true;
      player.attackType = 'punch'; // use punch hitbox, sword multiplies it
      player.attackTimer = SWORD_ATTACK_DURATION;
      player.swordActive = true;
      player.swordDamageMultiplier = 1.0;
      attackCooldownRef.current = SWORD_COOLDOWN;
    }

    // ── Regular attack input ──
    const punchPressed = keysRef.current.punch;
    const kickPressed = keysRef.current.kick;
    if (!swordKeyPressed && attackCooldownRef.current <= 0 && !player.isAttacking) {
      if (punchPressed) {
        player.isAttacking = true;
        player.attackType = 'punch';
        player.attackTimer = ATTACK_DURATION;
        player.swordActive = false;
        attackCooldownRef.current = ATTACK_COOLDOWN;
      } else if (kickPressed) {
        player.isAttacking = true;
        player.attackType = 'kick';
        player.attackTimer = ATTACK_DURATION;
        player.swordActive = false;
        attackCooldownRef.current = ATTACK_COOLDOWN;
      }
    }

    // ── Shoot input ──
    if (keysRef.current.shoot && attackCooldownRef.current <= 0) {
      projectiles.push({
        id: Date.now() + Math.random(),
        x: player.x + player.facing * 0.5,
        y: player.y + 1.0,
        z: 0,
        vx: player.facing * 14,
        vy: 0,
        vz: 0,
        life: 2.0,
        ownerId: 'player',
      });
      muzzleFlashTime = now;
      attackCooldownRef.current = 0.25;
    }

    // ── Player physics ──
    player = applyPlayerInput(player, keysRef.current, delta);
    const wasGrounded = playerWasGroundedRef.current;
    player = applyPhysics(player, delta);
    if (!wasGrounded && player.isGrounded) {
      playerLandedTime = now;
    }
    playerWasGroundedRef.current = player.isGrounded;

    // ── Player attack timer ──
    if (player.isAttacking) {
      player.attackTimer -= delta;
      if (player.attackTimer <= 0) {
        player.isAttacking = false;
        player.attackType = 'none';
        player.attackTimer = 0;
        player.swordActive = false;
      }
    }

    // ── Player hit flash ──
    if (player.hitFlashTimer > 0) {
      player.hitFlashTimer = Math.max(0, player.hitFlashTimer - delta);
    }

    // ── Blocking ──
    player.isBlocking = keysRef.current.block;

    // ── Enemy update ──
    const enemyCfg = getEnemyConfigForLevel(currentLevel);
    const updatedEnemies: Character[] = [];

    for (let i = 0; i < enemies.length; i++) {
      let enemy = enemies[i];

      // Enemy hit flash
      if (enemy.hitFlashTimer > 0) {
        enemy.hitFlashTimer = Math.max(0, enemy.hitFlashTimer - delta);
      }

      // Enemy attack timer
      if (enemy.isAttacking) {
        enemy.attackTimer -= delta;
        if (enemy.attackTimer <= 0) {
          enemy.isAttacking = false;
          enemy.attackType = 'none';
          enemy.attackTimer = 0;
        }
      }

      const enemyWasGrounded = enemyWasGroundedRef.current;
      const aiResult = updateEnemyAI(enemy, player, delta, enemyAICooldownRef, enemyCfg);
      enemy = aiResult.enemy;

      if (!enemyWasGrounded && enemy.isGrounded) {
        enemyLandedTime = now;
      }
      enemyWasGroundedRef.current = enemy.isGrounded;

      // Enemy attacks player
      if (aiResult.didAttack) {
        enemy.isAttacking = true;
        enemy.attackType = 'punch';
        enemy.attackTimer = ATTACK_DURATION;

        if (!player.isBlocking) {
          const dmg = aiResult.attackDamage;
          player.health = Math.max(0, player.health - dmg);
          player.hitFlashTimer = HIT_FLASH_DURATION;
          playerDamageFlashTime = now;
          const hitParticles = spawnProjectileHitParticles(player.x, player.y + 1, player.z);
          particles = [...particles, ...hitParticles];
        }
      }

      updatedEnemies.push(enemy);
    }

    // ── Player melee hits enemies ──
    if (player.isAttacking && player.attackType !== 'none') {
      for (let i = 0; i < updatedEnemies.length; i++) {
        const enemy = updatedEnemies[i];
        if (enemy.health <= 0) continue;

        const hitResult = checkMeleeHit(player, enemy, player.attackType === 'kick' ? 'kick' : 'punch');
        if (hitResult.hit) {
          updatedEnemies[i] = {
            ...enemy,
            health: Math.max(0, enemy.health - hitResult.damage),
            hitFlashTimer: HIT_FLASH_DURATION,
          };
          particles = [...particles, ...hitResult.newParticles];
          score += player.swordActive ? 20 : 10;
        }
      }
    }

    // ── Projectile hits enemies ──
    const remainingProjectiles: typeof projectiles = [];
    for (const proj of projectiles) {
      let hit = false;
      for (let i = 0; i < updatedEnemies.length; i++) {
        const enemy = updatedEnemies[i];
        if (enemy.health <= 0) continue;
        if (checkProjectileHitsEnemy(proj, enemy)) {
          updatedEnemies[i] = {
            ...enemy,
            health: Math.max(0, enemy.health - 20),
            hitFlashTimer: HIT_FLASH_DURATION,
          };
          const expId = Date.now() + Math.random();
          explosionEvents = [
            ...explosionEvents.filter(e => now - e.time < 1.0),
            { id: expId, x: proj.x, y: proj.y, z: proj.z, time: now },
          ];
          particles = [...particles, ...spawnProjectileHitParticles(proj.x, proj.y, proj.z)];
          score += 15;
          hit = true;
          break;
        }
      }
      if (!hit) remainingProjectiles.push(proj);
    }

    // ── Check enemy defeats & level progression ──
    const allEnemiesDefeated = updatedEnemies.every(e => e.health <= 0);
    if (allEnemiesDefeated && updatedEnemies.length > 0) {
      enemiesDefeatedInLevel += updatedEnemies.length;

      if (currentLevel >= MAX_LEVELS) {
        // All levels complete!
        allLevelsComplete = true;
      } else {
        // Advance to next level
        currentLevel += 1;
        levelTransitioning = true;
        // Reset enemy for new level
        const newEnemy = createEnemy(currentLevel);
        updatedEnemies.length = 0;
        updatedEnemies.push(newEnemy);
        enemyAICooldownRef.current = 0;
        // Reset player position
        player.x = -2;
        player.y = 0;
        player.vx = 0;
        player.vy = 0;
      }
    }

    // ── Game phase ──
    // Use explicit type to satisfy GameState['gamePhase'] union
    let gamePhase: GameState['gamePhase'] = state.gamePhase;
    if (player.health <= 0) {
      gamePhase = 'playerLost';
    } else if (allLevelsComplete) {
      gamePhase = 'playerWon';
    }

    // ── Update particles & projectiles ──
    particles = updateParticles(particles, delta);
    const updatedProjectiles = updateProjectiles(remainingProjectiles, delta);

    // Trim old explosion events
    explosionEvents = explosionEvents.filter(e => now - e.time < 1.5);

    const newState: GameState = {
      player,
      enemies: updatedEnemies,
      particles,
      projectiles: updatedProjectiles,
      gamePhase,
      score,
      timeElapsed: now,
      muzzleFlashTime,
      playerDamageFlashTime,
      playerLandedTime,
      enemyLandedTime,
      explosionEvents,
      currentLevel,
      enemiesDefeatedInLevel,
      levelTransitioning,
      levelTransitionTimer: 0,
      allLevelsComplete,
    };

    stateRef.current = newState;

    // Trigger level transition screen
    if (levelTransitioning) {
      setTransitionLevel(currentLevel);
      setShowLevelTransition(true);
    }

    setGameState(newState);
  }, [keysRef]);

  // No-op render callback — R3F handles its own render loop
  const render = useCallback(() => {}, []);

  const isRunning =
    gameState.gamePhase === 'playing' &&
    !gameState.levelTransitioning &&
    !gameState.allLevelsComplete;

  useGameLoop(update, render, isRunning);

  const enemy = gameState.enemies[0];
  const isPlayerDamaged = gameState.timeElapsed - gameState.playerDamageFlashTime < 0.3;

  return (
    <div className="relative w-full" style={{ aspectRatio: '16/9', maxHeight: '80vh' }}>
      <Canvas
        camera={{ position: [0, 2, 7], fov: 60 }}
        style={{ background: '#0a0a1a' }}
        shadows
      >
        <Scene3D gameState={gameState} />
      </Canvas>

      {/* HUD overlay */}
      {gameState.gamePhase === 'playing' && !gameState.allLevelsComplete && (
        <GameHUD
          currentLevel={gameState.currentLevel}
          maxLevels={MAX_LEVELS}
          playerHealth={gameState.player.health}
          playerMaxHealth={gameState.player.maxHealth}
          enemyHealth={enemy?.health ?? 0}
          enemyMaxHealth={enemy?.maxHealth ?? 120}
          score={gameState.score}
          swordActive={gameState.player.swordActive}
        />
      )}

      {/* Player damage vignette */}
      {isPlayerDamaged && (
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, oklch(0.4 0.3 15 / 0.6) 100%)',
          }}
        />
      )}

      {/* On-screen controls */}
      {gameState.gamePhase === 'playing' && !gameState.allLevelsComplete && !showLevelTransition && (
        <OnScreenControls keysRef={keysRef} />
      )}

      {/* Level transition screen */}
      {showLevelTransition && (
        <LevelTransitionScreen
          level={transitionLevel}
          onComplete={handleLevelTransitionComplete}
        />
      )}

      {/* Victory screen */}
      {(gameState.allLevelsComplete || gameState.gamePhase === 'playerWon') && !showLevelTransition && (
        <VictoryScreen score={gameState.score} onReplay={handleReplay} />
      )}

      {/* Game over screen */}
      {gameState.gamePhase === 'playerLost' && (
        <div
          className="absolute inset-0 z-50 flex flex-col items-center justify-center"
          style={{ background: 'oklch(0.05 0.02 15 / 0.92)' }}
        >
          <p
            className="font-display text-6xl mb-2"
            style={{ color: 'oklch(0.65 0.3 15)', textShadow: '0 0 30px oklch(0.5 0.3 15)' }}
          >
            DEFEATED
          </p>
          <p
            className="font-sans text-sm tracking-widest mb-6"
            style={{ color: 'oklch(0.5 0.1 15)' }}
          >
            Sukuna's curse was too strong...
          </p>
          <p className="font-display text-2xl mb-6" style={{ color: 'oklch(0.7 0.2 45)' }}>
            Score: {gameState.score}
          </p>
          <button
            onClick={handleReplay}
            className="px-8 py-3 font-display text-lg tracking-widest uppercase rounded-sm transition-all"
            style={{
              background: 'oklch(0.2 0.08 15)',
              color: 'oklch(0.9 0.05 15)',
              border: '1px solid oklch(0.45 0.2 15)',
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Controls hint */}
      {gameState.gamePhase === 'playing' && !showLevelTransition && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 pointer-events-none z-10">
          <p
            className="font-sans text-xs tracking-widest opacity-40"
            style={{ color: 'oklch(0.7 0.1 220)' }}
          >
            WASD/Arrows: Move · J: Punch · K: Kick · E: Sword · F: Shoot · L: Block
          </p>
        </div>
      )}
    </div>
  );
}
