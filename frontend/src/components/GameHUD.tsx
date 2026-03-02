import React from 'react';

interface GameHUDProps {
  currentLevel: number;
  maxLevels: number;
  playerHealth: number;
  playerMaxHealth: number;
  enemyHealth: number;
  enemyMaxHealth: number;
  score: number;
  swordActive: boolean;
}

export default function GameHUD({
  currentLevel,
  maxLevels,
  playerHealth,
  playerMaxHealth,
  enemyHealth,
  enemyMaxHealth,
  score,
  swordActive,
}: GameHUDProps) {
  const playerHpPct = Math.max(0, (playerHealth / playerMaxHealth) * 100);
  const enemyHpPct = Math.max(0, (enemyHealth / enemyMaxHealth) * 100);

  const hpColor = (pct: number) =>
    pct > 60
      ? 'oklch(0.65 0.25 145)'
      : pct > 30
      ? 'oklch(0.75 0.3 60)'
      : 'oklch(0.6 0.3 25)';

  return (
    <div className="absolute inset-x-0 top-0 z-30 pointer-events-none select-none">
      {/* Top bar */}
      <div className="flex items-start justify-between px-3 pt-2 gap-2">
        {/* Player health */}
        <div className="flex-1 max-w-xs">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="font-display text-sm tracking-widest"
              style={{ color: 'oklch(0.75 0.25 220)' }}
            >
              UG
            </span>
            <span
              className="font-sans text-xs"
              style={{ color: 'oklch(0.6 0.1 220)' }}
            >
              {Math.max(0, Math.round(playerHealth))}/{playerMaxHealth}
            </span>
          </div>
          <div
            className="h-3 rounded-sm overflow-hidden"
            style={{ background: 'oklch(0.15 0.03 270)' }}
          >
            <div
              className="h-full transition-all duration-150 rounded-sm"
              style={{
                width: `${playerHpPct}%`,
                background: hpColor(playerHpPct),
                boxShadow: `0 0 8px ${hpColor(playerHpPct)}`,
              }}
            />
          </div>
        </div>

        {/* Center: Level + Score */}
        <div className="flex flex-col items-center gap-0.5 min-w-[90px]">
          <div
            className="font-display text-xs tracking-[0.3em] uppercase"
            style={{ color: 'oklch(0.55 0.1 270)' }}
          >
            Level
          </div>
          <div
            className="font-display text-3xl leading-none"
            style={{
              color: 'oklch(0.9 0.05 60)',
              textShadow: '0 0 12px oklch(0.7 0.3 45)',
            }}
          >
            {currentLevel}
            <span
              className="text-base"
              style={{ color: 'oklch(0.45 0.08 270)' }}
            >
              /{maxLevels}
            </span>
          </div>
          <div
            className="font-sans text-xs tracking-widest"
            style={{ color: 'oklch(0.55 0.15 45)' }}
          >
            {score.toLocaleString()}
          </div>
        </div>

        {/* Enemy health */}
        <div className="flex-1 max-w-xs">
          <div className="flex items-center justify-end gap-2 mb-1">
            <span
              className="font-sans text-xs"
              style={{ color: 'oklch(0.6 0.1 15)' }}
            >
              {Math.max(0, Math.round(enemyHealth))}/{enemyMaxHealth}
            </span>
            <span
              className="font-display text-sm tracking-widest"
              style={{ color: 'oklch(0.65 0.3 15)' }}
            >
              SUKUNA
            </span>
          </div>
          <div
            className="h-3 rounded-sm overflow-hidden"
            style={{ background: 'oklch(0.15 0.03 270)' }}
          >
            <div
              className="h-full transition-all duration-150 rounded-sm ml-auto"
              style={{
                width: `${enemyHpPct}%`,
                background: hpColor(enemyHpPct),
                boxShadow: `0 0 8px ${hpColor(enemyHpPct)}`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Sword active indicator */}
      {swordActive && (
        <div
          className="absolute top-16 left-1/2 -translate-x-1/2 font-display text-sm tracking-widest uppercase px-4 py-1 rounded-sm"
          style={{
            color: 'oklch(0.9 0.05 200)',
            background: 'oklch(0.15 0.05 200 / 0.8)',
            border: '1px solid oklch(0.5 0.3 200)',
            boxShadow: '0 0 15px oklch(0.5 0.3 200 / 0.6)',
          }}
        >
          ⚔ SWORD ACTIVE
        </div>
      )}
    </div>
  );
}
