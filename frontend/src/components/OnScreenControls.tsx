import React, { useRef } from 'react';
import { KeyState } from '../types/game';

interface OnScreenControlsProps {
  keysRef: React.MutableRefObject<KeyState>;
}

interface ButtonConfig {
  label: string;
  key: keyof KeyState;
  icon: React.ReactNode;
  color: string;
  glowColor: string;
}

const MoveSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const MoveRightSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const JumpSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const PunchSVG = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M18 11V9a2 2 0 0 0-2-2 2 2 0 0 0-2 2v1a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2a2 2 0 0 0-2-2 2 2 0 0 0-2 2v4a8 8 0 0 0 16 0v-5a2 2 0 0 0-2-2z" />
  </svg>
);

const KickSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <path d="M12 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
    <path d="M6 8h12l-2 8H8L6 8z" />
    <path d="M8 16l-2 6M16 16l2 6" />
  </svg>
);

const GunSVG = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M3 10h2V7h10v3h1l2 2v2h-2v1H4v-1H3v-4zm2 1v2h10v-2H5zm11 0v2h1v-2h-1z" />
    <rect x="5" y="15" width="3" height="2" rx="1" />
  </svg>
);

const SwordSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
    <path d="M13 19l6-6" />
    <path d="M16 16l4 4" />
    <path d="M19 21l2-2" />
  </svg>
);

export default function OnScreenControls({ keysRef }: OnScreenControlsProps) {
  const setKey = (key: keyof KeyState, value: boolean) => {
    keysRef.current[key] = value;
  };

  const makeHandlers = (key: keyof KeyState) => ({
    onMouseDown: (e: React.MouseEvent) => { e.preventDefault(); setKey(key, true); },
    onMouseUp: (e: React.MouseEvent) => { e.preventDefault(); setKey(key, false); },
    onMouseLeave: (e: React.MouseEvent) => { setKey(key, false); },
    onTouchStart: (e: React.TouchEvent) => { e.preventDefault(); setKey(key, true); },
    onTouchEnd: (e: React.TouchEvent) => { e.preventDefault(); setKey(key, false); },
  });

  const btnBase =
    'flex items-center justify-center rounded-full select-none touch-none active:scale-90 transition-transform duration-75 font-display text-xs tracking-wider';

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {/* Left side: movement */}
      <div className="absolute bottom-6 left-4 flex gap-2 pointer-events-auto">
        <button
          className={`${btnBase} w-14 h-14`}
          style={{
            background: 'oklch(0.2 0.05 270 / 0.85)',
            border: '2px solid oklch(0.45 0.15 220)',
            color: 'oklch(0.8 0.2 220)',
            boxShadow: '0 0 10px oklch(0.4 0.2 220 / 0.4)',
          }}
          {...makeHandlers('left')}
        >
          <MoveSVG />
        </button>
        <button
          className={`${btnBase} w-14 h-14`}
          style={{
            background: 'oklch(0.2 0.05 270 / 0.85)',
            border: '2px solid oklch(0.45 0.15 220)',
            color: 'oklch(0.8 0.2 220)',
            boxShadow: '0 0 10px oklch(0.4 0.2 220 / 0.4)',
          }}
          {...makeHandlers('right')}
        >
          <MoveRightSVG />
        </button>
        <button
          className={`${btnBase} w-14 h-14`}
          style={{
            background: 'oklch(0.2 0.05 270 / 0.85)',
            border: '2px solid oklch(0.55 0.2 200)',
            color: 'oklch(0.8 0.25 200)',
            boxShadow: '0 0 10px oklch(0.4 0.2 200 / 0.4)',
          }}
          {...makeHandlers('up')}
        >
          <JumpSVG />
        </button>
      </div>

      {/* Right side: actions */}
      <div className="absolute bottom-6 right-4 flex flex-col gap-2 pointer-events-auto items-end">
        {/* Top row: Punch + Kick */}
        <div className="flex gap-2">
          <button
            className={`${btnBase} w-14 h-14`}
            style={{
              background: 'oklch(0.2 0.05 270 / 0.85)',
              border: '2px solid oklch(0.5 0.25 30)',
              color: 'oklch(0.85 0.25 30)',
              boxShadow: '0 0 10px oklch(0.4 0.2 30 / 0.4)',
            }}
            {...makeHandlers('punch')}
          >
            <PunchSVG />
          </button>
          <button
            className={`${btnBase} w-14 h-14`}
            style={{
              background: 'oklch(0.2 0.05 270 / 0.85)',
              border: '2px solid oklch(0.5 0.25 15)',
              color: 'oklch(0.75 0.3 15)',
              boxShadow: '0 0 10px oklch(0.4 0.25 15 / 0.4)',
            }}
            {...makeHandlers('kick')}
          >
            <KickSVG />
          </button>
        </div>

        {/* Bottom row: Shoot + Sword */}
        <div className="flex gap-2">
          <button
            className={`${btnBase} w-14 h-14`}
            style={{
              background: 'oklch(0.2 0.05 270 / 0.85)',
              border: '2px solid oklch(0.6 0.3 80)',
              color: 'oklch(0.85 0.3 80)',
              boxShadow: '0 0 10px oklch(0.5 0.3 80 / 0.4)',
            }}
            {...makeHandlers('shoot')}
          >
            <GunSVG />
          </button>
          <button
            className={`${btnBase} w-14 h-14`}
            style={{
              background: 'oklch(0.2 0.05 270 / 0.85)',
              border: '2px solid oklch(0.55 0.3 200)',
              color: 'oklch(0.85 0.3 200)',
              boxShadow: '0 0 12px oklch(0.5 0.3 200 / 0.5)',
            }}
            {...makeHandlers('sword')}
          >
            <SwordSVG />
          </button>
        </div>
      </div>
    </div>
  );
}
