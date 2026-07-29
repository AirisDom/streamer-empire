'use client';

import GameLayout from './GameLayout';

interface GameViewProps {
  onReturnToMenu: () => void;
}

export default function GameView({ onReturnToMenu }: GameViewProps) {
  return <GameLayout onReturnToMenu={onReturnToMenu} />;
}
