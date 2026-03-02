import React, { useCallback } from 'react';
import { KeyState } from '../types/game';

interface OnScreenControlsProps {
  keysRef: React.MutableRefObject<KeyState>;
  visible: boolean;
}

interface ControlButtonProps {
  label: React.ReactNode;
  onPress: () => void;
  onRelease: () => void;
  className?: string;
  ariaLabel: string;
}

const ControlButton: React.FC<ControlButtonProps> = ({ label, onPress, onRelease, className = '', ariaLabel }) => {
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onPress();
  }, [onPress]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onRelease();
  }, [onRelease]);

  const handleMouseLeave = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onRelease();
  }, [onRelease]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    onPress();
  }, [onPress]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    onRelease();
  }, [onRelease]);

  return (
    <button
      aria-label={ariaLabel}
      className={`flex items-center justify-center select-none touch-none rounded-sm border-2 font-black tracking-widest uppercase transition-all duration-75 active:scale-95 ${className}`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onContextMenu={(e) => e.preventDefault()}
    >
      {label}
    </button>
  );
};

// Fist/Punch SVG icon
const FistIcon: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="10" width="14" height="9" rx="2" fill="currentColor" />
    <rect x="7" y="7" width="3" height="5" rx="1" fill="currentColor" />
    <rect x="10.5" y="6" width="3" height="5" rx="1" fill="currentColor" />
    <rect x="14" y="7" width="3" height="5" rx="1" fill="currentColor" />
    <rect x="5" y="10" width="3" height="4" rx="1" fill="currentColor" />
    <rect x="5" y="14" width="5" height="5" rx="1" fill="currentColor" />
  </svg>
);

// Kick/Boot SVG icon
const KickIcon: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Leg */}
    <rect x="9" y="3" width="5" height="9" rx="2" fill="currentColor" />
    {/* Knee bend */}
    <rect x="11" y="9" width="8" height="4" rx="2" fill="currentColor" />
    {/* Foot/boot */}
    <rect x="15" y="11" width="6" height="4" rx="2" fill="currentColor" />
    <rect x="14" y="13" width="7" height="3" rx="1.5" fill="currentColor" />
  </svg>
);

// Gun SVG icon
const GunIcon: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Barrel */}
    <rect x="2" y="9" width="12" height="4" rx="1" fill="currentColor" />
    {/* Body */}
    <rect x="8" y="9" width="8" height="6" rx="1" fill="currentColor" />
    {/* Grip */}
    <rect x="11" y="14" width="4" height="5" rx="1.5" fill="currentColor" />
    {/* Trigger guard */}
    <rect x="10" y="13" width="2" height="4" rx="1" fill="currentColor" />
    {/* Muzzle flash hint */}
    <rect x="14" y="10" width="3" height="2" rx="1" fill="currentColor" opacity="0.7" />
    {/* Sight */}
    <rect x="9" y="7" width="2" height="3" rx="0.5" fill="currentColor" />
  </svg>
);

const OnScreenControls: React.FC<OnScreenControlsProps> = ({ keysRef, visible }) => {
  if (!visible) return null;

  const press = (key: keyof KeyState) => () => { keysRef.current[key] = true; };
  const release = (key: keyof KeyState) => () => { keysRef.current[key] = false; };

  return (
    <div className="absolute inset-x-0 bottom-0 pointer-events-none" style={{ height: '160px' }}>
      {/* Movement buttons — bottom left */}
      <div className="absolute bottom-4 left-3 pointer-events-auto flex flex-col items-center gap-2">
        {/* Jump button centered above left/right */}
        <ControlButton
          ariaLabel="Jump"
          onPress={press('up')}
          onRelease={release('up')}
          className="w-14 h-14 text-2xl border-blue-500 text-blue-300 bg-blue-950/80 hover:bg-blue-800/90 shadow-[0_0_12px_rgba(68,170,255,0.5)] active:shadow-[0_0_20px_rgba(68,170,255,0.9)]"
          label={<span className="text-xl leading-none">↑</span>}
        />
        <div className="flex gap-2">
          <ControlButton
            ariaLabel="Move Left"
            onPress={press('left')}
            onRelease={release('left')}
            className="w-14 h-14 text-2xl border-blue-500 text-blue-300 bg-blue-950/80 hover:bg-blue-800/90 shadow-[0_0_12px_rgba(68,170,255,0.5)] active:shadow-[0_0_20px_rgba(68,170,255,0.9)]"
            label={<span className="text-xl leading-none">←</span>}
          />
          <ControlButton
            ariaLabel="Move Right"
            onPress={press('right')}
            onRelease={release('right')}
            className="w-14 h-14 text-2xl border-blue-500 text-blue-300 bg-blue-950/80 hover:bg-blue-800/90 shadow-[0_0_12px_rgba(68,170,255,0.5)] active:shadow-[0_0_20px_rgba(68,170,255,0.9)]"
            label={<span className="text-xl leading-none">→</span>}
          />
        </div>
      </div>

      {/* Attack buttons — bottom right */}
      <div className="absolute bottom-4 right-3 pointer-events-auto flex gap-2 items-end">
        {/* Shoot */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-black tracking-widest text-yellow-400 uppercase">Shoot</span>
          <ControlButton
            ariaLabel="Shoot"
            onPress={press('shoot')}
            onRelease={release('shoot')}
            className="w-16 h-16 border-yellow-500 text-yellow-300 bg-yellow-950/80 hover:bg-yellow-800/90 shadow-[0_0_14px_rgba(255,220,0,0.5)] active:shadow-[0_0_24px_rgba(255,220,0,0.9)]"
            label={<GunIcon size={30} />}
          />
        </div>
        {/* Kick */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-black tracking-widest text-red-400 uppercase">Kick</span>
          <ControlButton
            ariaLabel="Kick"
            onPress={press('kick')}
            onRelease={release('kick')}
            className="w-16 h-16 border-red-500 text-red-300 bg-red-950/80 hover:bg-red-800/90 shadow-[0_0_14px_rgba(255,68,68,0.5)] active:shadow-[0_0_24px_rgba(255,68,68,0.9)]"
            label={<KickIcon size={30} />}
          />
        </div>
        {/* Punch */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-black tracking-widest text-purple-400 uppercase">Punch</span>
          <ControlButton
            ariaLabel="Punch"
            onPress={press('punch')}
            onRelease={release('punch')}
            className="w-16 h-16 border-purple-500 text-purple-300 bg-purple-950/80 hover:bg-purple-800/90 shadow-[0_0_14px_rgba(153,51,255,0.5)] active:shadow-[0_0_24px_rgba(153,51,255,0.9)]"
            label={<FistIcon size={30} />}
          />
        </div>
      </div>
    </div>
  );
};

export default OnScreenControls;
