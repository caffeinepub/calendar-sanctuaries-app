import React, { useEffect, useState } from 'react';

interface LevelTransitionScreenProps {
  level: number;
  onComplete: () => void;
}

export default function LevelTransitionScreen({ level, onComplete }: LevelTransitionScreenProps) {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');

  useEffect(() => {
    const inTimer = setTimeout(() => setPhase('hold'), 400);
    const holdTimer = setTimeout(() => setPhase('out'), 2000);
    const outTimer = setTimeout(() => onComplete(), 2600);

    return () => {
      clearTimeout(inTimer);
      clearTimeout(holdTimer);
      clearTimeout(outTimer);
    };
  }, [onComplete]);

  const opacity =
    phase === 'in' ? 'opacity-0 animate-[fadeIn_0.4s_ease-out_forwards]' :
    phase === 'hold' ? 'opacity-100' :
    'opacity-100 animate-[fadeOut_0.6s_ease-in_forwards]';

  return (
    <div
      className={`absolute inset-0 z-50 flex flex-col items-center justify-center ${opacity}`}
      style={{
        background: 'radial-gradient(ellipse at center, oklch(0.12 0.04 270) 0%, oklch(0.05 0.02 270) 100%)',
        pointerEvents: 'all',
      }}
    >
      {/* Decorative lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute h-px opacity-20"
            style={{
              top: `${10 + i * 12}%`,
              left: 0,
              right: 0,
              background: 'linear-gradient(90deg, transparent, oklch(0.7 0.3 200), transparent)',
              transform: `scaleX(${phase === 'hold' ? 1 : 0})`,
              transition: `transform ${0.3 + i * 0.05}s ease-out`,
            }}
          />
        ))}
      </div>

      <div className="relative text-center px-8">
        {/* Stage label */}
        <p
          className="text-sm tracking-[0.4em] uppercase mb-4 font-sans"
          style={{ color: 'oklch(0.65 0.2 200)' }}
        >
          Stage
        </p>

        {/* Level number */}
        <div
          className="font-display text-[10rem] leading-none select-none"
          style={{
            color: 'oklch(0.95 0.05 200)',
            textShadow: `
              0 0 40px oklch(0.7 0.35 200),
              0 0 80px oklch(0.5 0.3 200),
              0 0 120px oklch(0.4 0.25 200)
            `,
          }}
        >
          {level}
        </div>

        {/* Level name */}
        <p
          className="font-display text-3xl tracking-widest mt-2 select-none"
          style={{
            color: 'oklch(0.8 0.25 30)',
            textShadow: '0 0 20px oklch(0.6 0.3 30)',
          }}
        >
          {level === 1 ? 'THE AWAKENING' : level === 2 ? 'CURSED DOMAIN' : 'FINAL RECKONING'}
        </p>

        {/* Subtitle */}
        <p
          className="text-xs tracking-[0.3em] uppercase mt-6 font-sans"
          style={{ color: 'oklch(0.5 0.1 200)' }}
        >
          {level === 1 ? 'Sukuna awakens...' : level === 2 ? 'His power grows...' : 'The true form unleashed...'}
        </p>
      </div>

      {/* Bottom decorative bar */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 h-0.5 w-48"
        style={{
          background: 'linear-gradient(90deg, transparent, oklch(0.7 0.3 200), transparent)',
          boxShadow: '0 0 10px oklch(0.6 0.3 200)',
        }}
      />
    </div>
  );
}
