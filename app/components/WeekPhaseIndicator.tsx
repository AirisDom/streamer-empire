'use client';

import { useGameStore, GameStore } from '../store/gameStore';
import { GamePhase } from '../types';

const phaseConfig: Record<GamePhase, { label: string; icon: string; description: string }> = {
  [GamePhase.Planning]: {
    label: 'Planning',
    icon: '📋',
    description: 'Schedule your content for the week',
  },
  [GamePhase.Streaming]: {
    label: 'Streaming',
    icon: '🎥',
    description: 'Go live and interact with viewers',
  },
  [GamePhase.Review]: {
    label: 'Review',
    icon: '📊',
    description: 'Analyze your performance',
  },
};

const phaseOrder: GamePhase[] = [GamePhase.Planning, GamePhase.Streaming, GamePhase.Review];

export default function WeekPhaseIndicator() {
  const currentWeek = useGameStore((state: GameStore) => state.player.currentWeek);
  const currentPhase = useGameStore((state: GameStore) => state.player.currentPhase);
  const advancePhase = useGameStore((state: GameStore) => state.advancePhase);

  const currentPhaseIndex = phaseOrder.indexOf(currentPhase);
  const isLastPhase = currentPhaseIndex === phaseOrder.length - 1;
  const nextPhaseLabel = isLastPhase ? 'Next Week' : phaseConfig[phaseOrder[currentPhaseIndex + 1]].label;

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Week {currentWeek}
        </h3>
        <span className="text-xs text-zinc-500">
          Phase {currentPhaseIndex + 1} of {phaseOrder.length}
        </span>
      </div>

      <div className="flex gap-1 mb-4">
        {phaseOrder.map((phase, index) => (
          <div
            key={phase}
            className={`flex-1 h-2 rounded-full transition-colors ${
              index < currentPhaseIndex
                ? 'bg-green-500'
                : index === currentPhaseIndex
                  ? 'bg-purple-500'
                  : 'bg-zinc-600'
            }`}
          />
        ))}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{phaseConfig[currentPhase].icon}</span>
        <div>
          <div className="text-sm font-medium text-white">
            {phaseConfig[currentPhase].label}
          </div>
          <div className="text-xs text-zinc-400">
            {phaseConfig[currentPhase].description}
          </div>
        </div>
      </div>

      <button
        onClick={advancePhase}
        className="w-full bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium py-2 px-4 rounded transition-colors"
      >
        {isLastPhase ? '→ Start Next Week' : `→ ${nextPhaseLabel}`}
      </button>
    </div>
  );
}
