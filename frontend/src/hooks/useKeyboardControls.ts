import { useEffect, useRef } from 'react';
import { KeyState } from '../types/game';

export function useKeyboardControls() {
  const keysRef = useRef<KeyState>({
    left: false,
    right: false,
    up: false,
    down: false,
    punch: false,
    kick: false,
    block: false,
    shoot: false,
    sword: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          keysRef.current.left = true;
          break;
        case 'ArrowRight':
        case 'KeyD':
          keysRef.current.right = true;
          break;
        case 'ArrowUp':
        case 'KeyW':
        case 'Space':
          keysRef.current.up = true;
          break;
        case 'ArrowDown':
        case 'KeyS':
          keysRef.current.down = true;
          break;
        case 'KeyJ':
          keysRef.current.punch = true;
          break;
        case 'KeyK':
          keysRef.current.kick = true;
          break;
        case 'KeyL':
          keysRef.current.block = true;
          break;
        case 'KeyF':
          keysRef.current.shoot = true;
          break;
        case 'KeyE':
          keysRef.current.sword = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          keysRef.current.left = false;
          break;
        case 'ArrowRight':
        case 'KeyD':
          keysRef.current.right = false;
          break;
        case 'ArrowUp':
        case 'KeyW':
        case 'Space':
          keysRef.current.up = false;
          break;
        case 'ArrowDown':
        case 'KeyS':
          keysRef.current.down = false;
          break;
        case 'KeyJ':
          keysRef.current.punch = false;
          break;
        case 'KeyK':
          keysRef.current.kick = false;
          break;
        case 'KeyL':
          keysRef.current.block = false;
          break;
        case 'KeyF':
          keysRef.current.shoot = false;
          break;
        case 'KeyE':
          keysRef.current.sword = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return keysRef;
}
