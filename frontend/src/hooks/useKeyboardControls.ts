import { useEffect, useRef } from 'react';
import { KeyState } from '../types/game';

export function useKeyboardControls(): React.MutableRefObject<KeyState> {
  const keysRef = useRef<KeyState>({
    left: false,
    right: false,
    up: false,
    punch: false,
    kick: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          keysRef.current.left = true;
          e.preventDefault();
          break;
        case 'ArrowRight':
        case 'KeyD':
          keysRef.current.right = true;
          e.preventDefault();
          break;
        case 'ArrowUp':
        case 'KeyW':
        case 'Space':
          keysRef.current.up = true;
          e.preventDefault();
          break;
        case 'KeyJ':
        case 'KeyZ':
          keysRef.current.punch = true;
          e.preventDefault();
          break;
        case 'KeyK':
        case 'KeyX':
          keysRef.current.kick = true;
          e.preventDefault();
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
        case 'KeyJ':
        case 'KeyZ':
          keysRef.current.punch = false;
          break;
        case 'KeyK':
        case 'KeyX':
          keysRef.current.kick = false;
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
