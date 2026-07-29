'use client';

import { useState } from 'react';
import NicheSelectionModal from './NicheSelectionModal';

interface MainMenuProps {
  onStartGame: () => void;
}

export default function MainMenu({ onStartGame }: MainMenuProps) {
  const [showNicheModal, setShowNicheModal] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-900">
      <div className="flex flex-col items-center gap-8 p-12">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 tracking-tight">
            Streamer Empire
          </h1>
          <p className="text-zinc-400 text-xl">
            Build your streaming empire from bedroom to studio
          </p>
        </div>

        <div className="flex flex-col gap-4 mt-8">
          <button
            onClick={() => setShowNicheModal(true)}
            className="px-12 py-4 text-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all duration-200 shadow-lg hover:shadow-purple-500/25 hover:scale-105"
          >
            New Game
          </button>
        </div>

        <div className="mt-12 text-zinc-600 text-sm">
          Choose your niche • Schedule streams • Build your audience
        </div>
      </div>

      {showNicheModal && (
        <NicheSelectionModal
          onClose={() => setShowNicheModal(false)}
          onSelect={() => {
            setShowNicheModal(false);
            onStartGame();
          }}
        />
      )}
    </div>
  );
}
