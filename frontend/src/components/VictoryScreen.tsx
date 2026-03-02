import React, { useEffect, useState } from 'react';

interface VictoryScreenProps {
  score: number;
  onReplay: () => void;
}

export default function VictoryScreen({ score, onReplay }: VictoryScreenProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background: 'radial-gradient(ellipse at center, oklch(0.15 0.06 45) 0%, oklch(0.05 0.02 270) 100%)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.8s ease-out',
      }}
    >
      {/* Particle-like decorative dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 3 === 0
                ? 'oklch(0.8 0.3 45)'
                : i % 3 === 1
                ? 'oklch(0.7 0.3 200)'
                : 'oklch(0.9 0.1 60)',
              boxShadow: `0 0 6px currentColor`,
              animation: `pulse ${1.5 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative text-center px-8 max-w-lg">
        {/* Victory title */}
        <p
          className="text-sm tracking-[0.5em] uppercase mb-4 font-sans"
          style={{ color: 'oklch(0.65 0.2 45)' }}
        >
          ✦ All Levels Complete ✦
        </p>

        <h1
          className="font-display text-7xl md:text-8xl leading-none select-none mb-2"
          style={{
            color: 'oklch(0.95 0.08 60)',
            textShadow: `
              0 0 30px oklch(0.8 0.35 45),
              0 0 60px oklch(0.6 0.3 45),
              0 0 100px oklch(0.4 0.25 45)
            `,
          }}
        >
          VICTORY
        </h1>

        <p
          className="font-display text-2xl tracking-widest mt-1 select-none"
          style={{
            color: 'oklch(0.75 0.25 200)',
            textShadow: '0 0 15px oklch(0.5 0.3 200)',
          }}
        >
          SUKUNA DEFEATED
        </p>

        {/* Score */}
        <div
          className="mt-8 px-8 py-4 rounded-sm border"
          style={{
            borderColor: 'oklch(0.4 0.15 45)',
            background: 'oklch(0.1 0.03 270 / 0.8)',
          }}
        >
          <p className="text-xs tracking-widest uppercase font-sans mb-1" style={{ color: 'oklch(0.5 0.1 200)' }}>
            Final Score
          </p>
          <p
            className="font-display text-5xl"
            style={{
              color: 'oklch(0.9 0.3 45)',
              textShadow: '0 0 20px oklch(0.7 0.3 45)',
            }}
          >
            {score.toLocaleString()}
          </p>
        </div>

        {/* Replay button */}
        <button
          onClick={onReplay}
          className="mt-8 px-10 py-3 font-display text-xl tracking-widest uppercase transition-all duration-200 rounded-sm"
          style={{
            background: 'oklch(0.25 0.1 45)',
            color: 'oklch(0.95 0.05 60)',
            border: '1px solid oklch(0.5 0.25 45)',
            boxShadow: '0 0 20px oklch(0.4 0.2 45 / 0.5)',
          }}
          onMouseEnter={e => {
            (e.target as HTMLButtonElement).style.background = 'oklch(0.35 0.15 45)';
            (e.target as HTMLButtonElement).style.boxShadow = '0 0 30px oklch(0.5 0.25 45 / 0.7)';
          }}
          onMouseLeave={e => {
            (e.target as HTMLButtonElement).style.background = 'oklch(0.25 0.1 45)';
            (e.target as HTMLButtonElement).style.boxShadow = '0 0 20px oklch(0.4 0.2 45 / 0.5)';
          }}
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
