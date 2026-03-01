import React from 'react';
import FightingGame from './components/FightingGame';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-game-bg flex flex-col">
      {/* Header */}
      <header className="w-full py-4 px-4 flex items-center justify-center border-b border-purple-900/40 bg-black/60 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚔️</span>
          <h1 className="game-title text-2xl sm:text-3xl font-black tracking-[0.2em] uppercase">
            <span className="text-blue-400 drop-shadow-[0_0_10px_rgba(68,170,255,0.8)]">UG</span>
            <span className="text-purple-400 mx-2 text-xl">vs</span>
            <span className="text-red-400 drop-shadow-[0_0_10px_rgba(255,68,102,0.8)]">SUKUNA</span>
          </h1>
          <span className="text-2xl">⚔️</span>
        </div>
      </header>

      {/* Main Game */}
      <main className="flex-1 flex flex-col items-center justify-center px-2 py-4 sm:py-6">
        <FightingGame />
      </main>

      {/* Footer */}
      <footer className="w-full py-3 px-4 text-center border-t border-purple-900/30 bg-black/40">
        <p className="text-gray-600 text-xs tracking-wide">
          © {new Date().getFullYear()} UG vs Sukuna &nbsp;·&nbsp; Built with{' '}
          <span className="text-red-500">♥</span> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'ug-vs-sukuna')}`}
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
