import React, { useRef, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { GameState, GameStatus } from '../types/game';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { useGameLoop } from '../hooks/useGameLoop';
import { applyPlayerPhysics, applyAttack } from '../utils/gamePhysics';
import { updateEnemyAI } from '../utils/enemyAI';
import { processCombat, createNewEnemy, createInitialPlayer, updateParticles } from '../utils/combatSystem';
import OnScreenControls from './OnScreenControls';
import Scene3D from './Scene3D';

function createInitialState(): GameState {
  return {
    player: createInitialPlayer(),
    enemy: createNewEnemy(0),
    gameStatus: GameStatus.START,
    round: 1,
    sukunaDefeated: 0,
    particles: [],
  };
}

const FightingGame: React.FC = () => {
  const stateRef = useRef<GameState>(createInitialState());
  const [uiState, setUiState] = useState<GameState>(createInitialState());
  const keysRef = useKeyboardControls();

  const isRunning = uiState.gameStatus === GameStatus.PLAYING;

  const update = useCallback((dt: number) => {
    let state = stateRef.current;
    if (state.gameStatus !== GameStatus.PLAYING) return;

    // Player update
    let player = applyPlayerPhysics(state.player, keysRef.current, dt);
    player = applyAttack(player, keysRef.current, dt);

    // Enemy AI update
    const enemy = updateEnemyAI(state.enemy, player, dt);

    // Particles
    const particles = updateParticles(state.particles, dt);

    state = { ...state, player, enemy, particles };

    // Combat
    state = processCombat(state);

    stateRef.current = state;

    // Sync UI state
    setUiState({ ...state });
  }, [keysRef]);

  // No-op render since R3F handles its own render loop
  const render = useCallback(() => {}, []);

  useGameLoop(update, render, isRunning);

  const handleStart = () => {
    const newState = createInitialState();
    newState.gameStatus = GameStatus.PLAYING;
    stateRef.current = newState;
    setUiState({ ...newState });
  };

  const handleRestart = () => {
    handleStart();
  };

  return (
    <div className="flex flex-col items-center w-full select-none">
      {/* Health Bars */}
      <div className="w-full max-w-[900px] flex items-center gap-3 px-2 py-3">
        {/* UG Health */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="game-name-ug text-sm font-black tracking-widest">UG</span>
            <span className="text-xs text-gray-400 font-mono">
              {Math.max(0, uiState.player.health)}/{uiState.player.maxHealth}
            </span>
          </div>
          <div className="h-5 bg-gray-900 rounded-sm border border-blue-900 overflow-hidden">
            <div
              className="h-full transition-all duration-100 rounded-sm"
              style={{
                width: `${(uiState.player.health / uiState.player.maxHealth) * 100}%`,
                background: 'linear-gradient(90deg, #1a6fff, #44aaff)',
                boxShadow: '0 0 8px #44aaff88',
              }}
            />
          </div>
        </div>

        {/* VS + Round */}
        <div className="text-center px-2">
          <span className="game-vs text-xl font-black text-purple-400 tracking-widest">VS</span>
          <div className="text-xs text-gray-500 font-mono mt-0.5">R{uiState.sukunaDefeated + 1}</div>
        </div>

        {/* Sukuna Health */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400 font-mono">
              {Math.max(0, uiState.enemy.health)}/{uiState.enemy.maxHealth}
            </span>
            <span className="game-name-sukuna text-sm font-black tracking-widest">SUKUNA</span>
          </div>
          <div className="h-5 bg-gray-900 rounded-sm border border-red-900 overflow-hidden">
            <div
              className="h-full transition-all duration-100 rounded-sm ml-auto"
              style={{
                width: `${(uiState.enemy.health / uiState.enemy.maxHealth) * 100}%`,
                background: 'linear-gradient(270deg, #cc0033, #ff4488)',
                boxShadow: '0 0 8px #ff448888',
              }}
            />
          </div>
        </div>
      </div>

      {/* 3D Canvas + Overlays */}
      <div className="relative w-full max-w-[900px]" style={{ height: '520px' }}>
        <Canvas
          camera={{ position: [0, 4, 18], fov: 55, near: 0.1, far: 100 }}
          shadows
          gl={{ antialias: true, alpha: false }}
          style={{ background: '#050010', borderRadius: '8px', border: '2px solid #4a1a7a' }}
          className="shadow-[0_0_40px_rgba(153,51,255,0.3)]"
        >
          <Scene3D
            player={uiState.player}
            enemy={uiState.enemy}
            particles={uiState.particles}
            sukunaDefeated={uiState.sukunaDefeated}
          />
        </Canvas>

        {/* On-screen touch/click controls */}
        <OnScreenControls keysRef={keysRef} visible={isRunning} />

        {/* START screen */}
        {uiState.gameStatus === GameStatus.START && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-black/75 backdrop-blur-sm">
            <div className="text-center space-y-6">
              <div>
                <h1 className="game-title text-6xl sm:text-7xl font-black tracking-widest text-white drop-shadow-[0_0_30px_rgba(153,51,255,0.9)]">
                  UG
                </h1>
                <p className="game-vs text-2xl font-black text-purple-400 tracking-[0.5em] my-1">VS</p>
                <h1 className="game-title text-6xl sm:text-7xl font-black tracking-widest text-red-400 drop-shadow-[0_0_30px_rgba(255,50,50,0.9)]">
                  SUKUNA
                </h1>
              </div>
              <p className="text-gray-300 text-sm tracking-widest uppercase">The Cursed Battle — Now in 3D</p>
              <button
                onClick={handleStart}
                className="game-btn px-10 py-4 text-xl font-black tracking-widest uppercase rounded-sm border-2 border-purple-500 text-white bg-purple-900/60 hover:bg-purple-700/80 hover:border-purple-300 transition-all duration-200 shadow-[0_0_20px_rgba(153,51,255,0.5)] hover:shadow-[0_0_30px_rgba(153,51,255,0.8)]"
              >
                ⚔ START BATTLE
              </button>
              <div className="text-gray-500 text-xs space-y-1 mt-4">
                <p>MOVE: ← → / A D &nbsp;|&nbsp; JUMP: ↑ / W / Space</p>
                <p>PUNCH: J / Z &nbsp;|&nbsp; KICK: K / X</p>
                <p className="text-purple-600">Touch controls available during battle</p>
              </div>
            </div>
          </div>
        )}

        {/* GAME OVER screen */}
        {uiState.gameStatus === GameStatus.GAME_OVER && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-black/80 backdrop-blur-sm">
            <div className="text-center space-y-6">
              <h2 className="game-title text-6xl font-black tracking-widest text-red-500 drop-shadow-[0_0_20px_rgba(255,0,0,0.8)]">
                GAME OVER
              </h2>
              <p className="text-gray-300 text-lg">
                Sukuna defeated UG after{' '}
                <span className="text-purple-400 font-bold">{uiState.sukunaDefeated}</span>{' '}
                {uiState.sukunaDefeated === 1 ? 'round' : 'rounds'}
              </p>
              <button
                onClick={handleRestart}
                className="game-btn px-10 py-4 text-xl font-black tracking-widest uppercase rounded-sm border-2 border-red-500 text-white bg-red-900/60 hover:bg-red-700/80 transition-all duration-200 shadow-[0_0_20px_rgba(255,0,0,0.4)]"
              >
                ↺ TRY AGAIN
              </button>
            </div>
          </div>
        )}

        {/* VICTORY screen */}
        {uiState.gameStatus === GameStatus.VICTORY && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-black/80 backdrop-blur-sm">
            <div className="text-center space-y-6">
              <h2 className="game-title text-6xl font-black tracking-widest text-yellow-400 drop-shadow-[0_0_20px_rgba(255,200,0,0.8)]">
                YOU WIN!
              </h2>
              <p className="text-gray-300 text-lg">
                UG defeated{' '}
                <span className="text-red-400 font-bold">{uiState.sukunaDefeated}</span>{' '}
                Sukuna{uiState.sukunaDefeated !== 1 ? 's' : ''}!
              </p>
              <button
                onClick={handleRestart}
                className="game-btn px-10 py-4 text-xl font-black tracking-widest uppercase rounded-sm border-2 border-yellow-500 text-white bg-yellow-900/60 hover:bg-yellow-700/80 transition-all duration-200 shadow-[0_0_20px_rgba(255,200,0,0.4)]"
              >
                ⚔ PLAY AGAIN
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard hint */}
      {uiState.gameStatus === GameStatus.PLAYING && (
        <div className="mt-3 text-center text-gray-700 text-xs tracking-widest uppercase space-x-4 hidden sm:block">
          <span>← → Move</span>
          <span>↑ Jump</span>
          <span>J Punch</span>
          <span>K Kick</span>
        </div>
      )}
    </div>
  );
};

export default FightingGame;
