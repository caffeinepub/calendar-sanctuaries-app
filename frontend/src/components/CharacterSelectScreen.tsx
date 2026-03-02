import React, { useState } from 'react';
import { CharacterType, CHARACTER_STATS } from '../types/game';

interface PlayableCharacter {
  type: CharacterType;
  name: string;
  description: string;
  color: string;
  glowColor: string;
  bgColor: string;
  borderColor: string;
  emoji: string;
  stats: {
    health: number;
    speed: number;
    power: number;
  };
}

const PLAYABLE_CHARACTERS: PlayableCharacter[] = [
  {
    type: 'ug',
    name: 'UG',
    description: 'Armored warrior with a glowing chest core. Balanced fighter with sword mastery.',
    color: 'oklch(0.75 0.25 220)',
    glowColor: 'oklch(0.55 0.3 220)',
    bgColor: 'oklch(0.12 0.05 220 / 0.7)',
    borderColor: 'oklch(0.45 0.25 220)',
    emoji: '🛡️',
    stats: { health: 75, speed: 70, power: 65 },
  },
  {
    type: 'yuji',
    name: 'Yuji',
    description: 'Cursed energy fighter with blazing fists. High speed and raw power.',
    color: 'oklch(0.75 0.3 35)',
    glowColor: 'oklch(0.55 0.35 35)',
    bgColor: 'oklch(0.12 0.06 35 / 0.7)',
    borderColor: 'oklch(0.5 0.3 35)',
    emoji: '🔥',
    stats: { health: 85, speed: 85, power: 80 },
  },
];

interface StatBarProps {
  label: string;
  value: number;
  color: string;
  glowColor: string;
}

function StatBar({ label, value, color, glowColor }: StatBarProps) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="font-sans text-xs w-14 text-right tracking-wider uppercase"
        style={{ color: 'oklch(0.55 0.08 270)' }}
      >
        {label}
      </span>
      <div
        className="flex-1 h-2 rounded-sm overflow-hidden"
        style={{ background: 'oklch(0.12 0.03 270)' }}
      >
        <div
          className="h-full rounded-sm transition-all duration-500"
          style={{
            width: `${value}%`,
            background: color,
            boxShadow: `0 0 6px ${glowColor}`,
          }}
        />
      </div>
      <span
        className="font-sans text-xs w-6"
        style={{ color: 'oklch(0.5 0.08 270)' }}
      >
        {value}
      </span>
    </div>
  );
}

interface CharacterCardProps {
  char: PlayableCharacter;
  selected: boolean;
  onSelect: () => void;
}

function CharacterCard({ char, selected, onSelect }: CharacterCardProps) {
  return (
    <div
      className="relative flex flex-col items-center p-5 rounded cursor-pointer transition-all duration-200 select-none"
      style={{
        background: selected ? char.bgColor : 'oklch(0.1 0.03 270 / 0.6)',
        border: `2px solid ${selected ? char.borderColor : 'oklch(0.25 0.05 270)'}`,
        boxShadow: selected ? `0 0 24px ${char.glowColor}, 0 0 8px ${char.glowColor}` : 'none',
        transform: selected ? 'scale(1.03)' : 'scale(1)',
      }}
      onClick={onSelect}
    >
      {/* Character preview box */}
      <div
        className="w-24 h-32 rounded flex items-center justify-center mb-3 relative overflow-hidden"
        style={{
          background: selected
            ? `oklch(0.08 0.04 270 / 0.9)`
            : 'oklch(0.08 0.02 270 / 0.8)',
          border: `1px solid ${selected ? char.borderColor : 'oklch(0.2 0.04 270)'}`,
        }}
      >
        {/* Animated glow bg */}
        {selected && (
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: `radial-gradient(ellipse at center, ${char.glowColor} 0%, transparent 70%)`,
            }}
          />
        )}
        <span className="text-5xl relative z-10">{char.emoji}</span>
      </div>

      {/* Name */}
      <h3
        className="font-display text-2xl tracking-widest mb-1"
        style={{
          color: char.color,
          textShadow: selected ? `0 0 12px ${char.glowColor}` : 'none',
        }}
      >
        {char.name}
      </h3>

      {/* Description */}
      <p
        className="font-sans text-xs text-center mb-4 leading-relaxed"
        style={{ color: 'oklch(0.5 0.06 270)', maxWidth: '180px' }}
      >
        {char.description}
      </p>

      {/* Stats */}
      <div className="w-full space-y-1.5">
        <StatBar label="HP" value={char.stats.health} color={char.color} glowColor={char.glowColor} />
        <StatBar label="Speed" value={char.stats.speed} color={char.color} glowColor={char.glowColor} />
        <StatBar label="Power" value={char.stats.power} color={char.color} glowColor={char.glowColor} />
      </div>

      {/* Selected badge */}
      {selected && (
        <div
          className="absolute top-2 right-2 font-display text-xs tracking-widest px-2 py-0.5 rounded-sm"
          style={{
            background: char.bgColor,
            color: char.color,
            border: `1px solid ${char.borderColor}`,
          }}
        >
          SELECTED
        </div>
      )}
    </div>
  );
}

interface CharacterSelectScreenProps {
  onCharacterSelected: (characterType: CharacterType) => void;
}

export default function CharacterSelectScreen({ onCharacterSelected }: CharacterSelectScreenProps) {
  const [selected, setSelected] = useState<CharacterType>('ug');

  const selectedChar = PLAYABLE_CHARACTERS.find(c => c.type === selected)!;

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'oklch(0.05 0.02 270 / 0.97)' }}
    >
      {/* Title */}
      <div className="mb-6 text-center">
        <p
          className="font-sans text-xs tracking-[0.4em] uppercase mb-1"
          style={{ color: 'oklch(0.45 0.1 270)' }}
        >
          Choose Your Fighter
        </p>
        <h2
          className="font-display text-4xl sm:text-5xl tracking-[0.15em] uppercase"
          style={{
            color: 'oklch(0.9 0.05 60)',
            textShadow: '0 0 20px oklch(0.7 0.3 45)',
          }}
        >
          Select Character
        </h2>
      </div>

      {/* Character cards */}
      <div className="flex gap-4 sm:gap-6 mb-8 flex-wrap justify-center px-4">
        {PLAYABLE_CHARACTERS.map(char => (
          <CharacterCard
            key={char.type}
            char={char}
            selected={selected === char.type}
            onSelect={() => setSelected(char.type)}
          />
        ))}
      </div>

      {/* Confirm button */}
      <button
        onClick={() => onCharacterSelected(selected)}
        className="px-10 py-3 font-display text-xl tracking-[0.2em] uppercase rounded-sm transition-all duration-200 active:scale-95"
        style={{
          background: selectedChar.bgColor,
          color: selectedChar.color,
          border: `2px solid ${selectedChar.borderColor}`,
          boxShadow: `0 0 20px ${selectedChar.glowColor}, 0 0 40px ${selectedChar.glowColor}40`,
        }}
      >
        ⚔ Fight!
      </button>

      {/* Hint */}
      <p
        className="mt-4 font-sans text-xs tracking-widest"
        style={{ color: 'oklch(0.35 0.05 270)' }}
      >
        Click a character to select, then press Fight!
      </p>
    </div>
  );
}
