'use client';

import { useGameStore } from '../store/gameStore';
import PixiCanvas from './PixiCanvas';

interface GameViewProps {
  onReturnToMenu: () => void;
}

export default function GameView({ onReturnToMenu }: GameViewProps) {
  const player = useGameStore((state) => state.player);
  const resetGame = useGameStore((state) => state.resetGame);

  const handleReturnToMenu = () => {
    resetGame();
    onReturnToMenu();
  };

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-900 font-sans">
      <header className="w-full bg-zinc-800 border-b border-zinc-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-white">{player.channel.name}</h1>
            <span className="text-sm text-zinc-400 bg-zinc-700 px-3 py-1 rounded-full capitalize">
              {player.channel.niche}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-sm text-zinc-300">
              <span className="text-zinc-500">Money:</span> ${player.money.toLocaleString()}
            </div>
            <div className="text-sm text-zinc-300">
              <span className="text-zinc-500">Subscribers:</span> {player.channel.subscribers.toLocaleString()}
            </div>
            <div className="text-sm text-zinc-300">
              <span className="text-zinc-500">Week:</span> {player.currentWeek}
            </div>
            <button
              onClick={handleReturnToMenu}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Menu
            </button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 w-full flex-col items-center justify-center gap-8 py-16 px-8">
        <PixiCanvas width={800} height={500} />
      </main>
    </div>
  );
}
