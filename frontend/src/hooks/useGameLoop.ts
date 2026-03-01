import { useEffect, useRef, useCallback } from 'react';

type UpdateFn = (deltaTime: number) => void;
type RenderFn = () => void;

export function useGameLoop(update: UpdateFn, render: RenderFn, running: boolean) {
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const updateRef = useRef<UpdateFn>(update);
  const renderRef = useRef<RenderFn>(render);

  updateRef.current = update;
  renderRef.current = render;

  const loop = useCallback((timestamp: number) => {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = timestamp;
    }
    const deltaTime = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05); // cap at 50ms
    lastTimeRef.current = timestamp;

    updateRef.current(deltaTime);
    renderRef.current();

    rafRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    if (running) {
      lastTimeRef.current = 0;
      rafRef.current = requestAnimationFrame(loop);
    } else {
      cancelAnimationFrame(rafRef.current);
    }
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [running, loop]);
}
