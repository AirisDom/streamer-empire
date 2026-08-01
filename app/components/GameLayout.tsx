'use client';

import { useState } from 'react';
import { useGameStore, GameStore } from '../store/gameStore';
import { GamePhase } from '../types';
import StreamingRoom from './StreamingRoom';
import StatsOverlay from './StatsOverlay';
import EquipmentShop from './EquipmentShop';
import StaffPanel from './StaffPanel';
import WeekPhaseIndicator from './WeekPhaseIndicator';
import WeeklyPlanner from './WeeklyPlanner';
import StreamingPhaseManager from './StreamingPhaseManager';

interface GameLayoutProps {
  onReturnToMenu: () => void;
}

export default function GameLayout({ onReturnToMenu }: GameLayoutProps) {
  const [showShop, setShowShop] = useState(false);
  const [showStaffPanel, setShowStaffPanel] = useState(false);
  const [showPlanner, setShowPlanner] = useState(false);
  const player = useGameStore((state: GameStore) => state.player);
  const resetGame = useGameStore((state: GameStore) => state.resetGame);

  const isPlanning = player.currentPhase === GamePhase.Planning;
  const isStreaming = player.currentPhase === GamePhase.Streaming;
  const isLive = player.channel.activeStream !== undefined;

  const handleReturnToMenu = () => {
    resetGame();
    onReturnToMenu();
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-900 font-sans">
      <header className="w-full bg-zinc-800 border-b border-zinc-700 px-6 py-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-white">{player.channel.name}</h1>
            <span className="text-xs text-zinc-400 bg-zinc-700 px-2 py-1 rounded-full capitalize">
              {player.channel.niche}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <QuickStat label="Money" value={`$${player.money.toLocaleString()}`} />
            <QuickStat label="Subs" value={player.channel.subscribers.toLocaleString()} />
            <QuickStat label="Week" value={player.currentWeek.toString()} />
            <button
              onClick={handleReturnToMenu}
              className="text-sm text-zinc-400 hover:text-white transition-colors px-3 py-1 rounded hover:bg-zinc-700"
            >
              Menu
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-zinc-850 border-r border-zinc-700 p-4 overflow-y-auto shrink-0 bg-zinc-800/50">
          <StatsOverlay />
        </aside>

        <main className="flex-1 flex items-center justify-center p-6 bg-zinc-900">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 rounded-xl blur-sm" />
            <div className="relative bg-zinc-800 p-2 rounded-xl border border-zinc-700">
              <StreamingRoom width={720} height={480} />
            </div>
          </div>
        </main>

        <aside className="w-64 bg-zinc-800/50 border-l border-zinc-700 p-4 overflow-y-auto shrink-0">
          <div className="space-y-4">
            <WeekPhaseIndicator />

            {isStreaming && <StreamingPhaseManager />}

            {!isLive && (
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <ActionButton
                    label="Schedule"
                    onClick={() => setShowPlanner(true)}
                    disabled={!isPlanning}
                  />
                  <ActionButton label="Shop" onClick={() => setShowShop(true)} />
                  <ActionButton label="Staff" onClick={() => setShowStaffPanel(true)} />
                </div>
              </div>
            )}

            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                Activity
              </h3>
              <div className="text-sm text-zinc-500 italic">
                {isLive ? 'Streaming live...' : 'No recent activity'}
              </div>
            </div>
          </div>
        </aside>
      </div>

      <footer className="w-full bg-zinc-800 border-t border-zinc-700 px-6 py-2 shrink-0">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>Week {player.currentWeek} · {player.currentPhase.charAt(0).toUpperCase() + player.currentPhase.slice(1)} Phase</span>
          <span>Press SPACE to pause</span>
          <span>Streamer Empire v0.1</span>
        </div>
      </footer>

      {showShop && <EquipmentShop onClose={() => setShowShop(false)} />}
      {showStaffPanel && <StaffPanel onClose={() => setShowStaffPanel(false)} />}
      {showPlanner && <WeeklyPlanner onClose={() => setShowPlanner(false)} />}
    </div>
  );
}

interface QuickStatProps {
  label: string;
  value: string;
}

function QuickStat({ label, value }: QuickStatProps) {
  return (
    <div className="text-sm">
      <span className="text-zinc-500">{label}:</span>{' '}
      <span className="text-zinc-300 font-medium">{value}</span>
    </div>
  );
}

interface ActionButtonProps {
  label: string;
  disabled?: boolean;
  onClick?: () => void;
}

function ActionButton({ label, disabled, onClick }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left text-sm px-3 py-2 rounded transition-colors ${
        disabled
          ? 'text-zinc-500 bg-zinc-700/50 cursor-not-allowed'
          : 'text-zinc-200 bg-zinc-700 hover:bg-zinc-600'
      }`}
    >
      {label}
    </button>
  );
}
