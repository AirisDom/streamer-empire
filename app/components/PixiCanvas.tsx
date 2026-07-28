'use client';

import { useEffect, useRef } from 'react';
import { Application, Graphics } from 'pixi.js';

interface PixiCanvasProps {
  width?: number;
  height?: number;
}

export default function PixiCanvas({ width = 800, height = 600 }: PixiCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const app = new Application();
    appRef.current = app;

    const initApp = async () => {
      await app.init({
        width,
        height,
        backgroundColor: 0x1a1a2e,
        antialias: true,
      });

      if (!containerRef.current) return;
      containerRef.current.appendChild(app.canvas);

      const sprite = new Graphics();
      sprite.circle(0, 0, 40);
      sprite.fill(0x6366f1);
      sprite.x = width / 2;
      sprite.y = height / 2;
      app.stage.addChild(sprite);

      let elapsed = 0;
      app.ticker.add((ticker) => {
        elapsed += ticker.deltaTime;
        sprite.x = width / 2 + Math.cos(elapsed / 30) * 100;
        sprite.y = height / 2 + Math.sin(elapsed / 30) * 100;
        sprite.scale.set(1 + Math.sin(elapsed / 20) * 0.2);
      });
    };

    initApp();

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
    };
  }, [width, height]);

  return <div ref={containerRef} className="rounded-lg overflow-hidden shadow-lg" />;
}
