import React, { useState } from 'react';
import FightingGame from './components/FightingGame';
import { CharacterType, CHARACTER_STATS } from './types/game';

const App: React.FC = () => {
  const [playerCharacterType, setPlayerCharacterType] = useState<CharacterType>('ug');

  const playerName = CHARACTER_STATS[playerCharacterType]?.displayName ?? 'UG';

  return (
    <div className="min-h-screen bg-game-bg flex flex-col">
      {/* Header */}
      <header className="w-full py-4 px-4 flex items-center justify-center border-b border-purple-900/40 bg-black/60 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚔️</span>
          <h1 className="game-title text-2xl sm:text-3xl font-black tracking-[0.2em] uppercase">
            <span
              className="drop-shadow-[0_0_10px_rgba(68,170,255,0.8)]"
              style={{
                color: playerCharacterType === 'yuji'
                  ? 'oklch(0.75 0.3 35)'
                  : 'oklch(0.75 0.25 220)',
              }}
            >
              {playerName}
            </span>
            <span className="text-purple-400 mx-2 text-xl">vs</span>
            <span className="text-red-400 drop-shadow-[0_0_10px_rgba(255,68,102,0.8)]">
              THE WORLD
            </span>
          </h1>
          <span className="text-2xl">⚔️</span>
        </div>
      </header>

      {/* Main Game */}
      <main className="flex-1 flex flex-col items-center justify-center px-2 py-4 sm:py-6">
        <FightingGame onPlayerCharacterChange={setPlayerCharacterType} />
      </main>

      {/* Footer */}
      <footer className="w-full py-3 px-4 text-center border-t border-purple-900/30 bg-black/40">
        <p className="text-gray-600 text-xs tracking-wide">
          © {new Date().getFullYear()} Fighting Game &nbsp;·&nbsp; Built with{' '}
          <span className="text-red-500">♥</span> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'fighting-game')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
};

export default App;
