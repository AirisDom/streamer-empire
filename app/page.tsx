'use client';

import { useState } from 'react';
import MainMenu from './components/MainMenu';
import GameView from './components/GameView';

type GameScreen = 'menu' | 'game';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('menu');

  if (currentScreen === 'menu') {
    return <MainMenu onStartGame={() => setCurrentScreen('game')} />;
  }

  return <GameView onReturnToMenu={() => setCurrentScreen('menu')} />;
}
