'use client';

import { useGameStore, GameStore } from '../store/gameStore';
import MilestoneProgress from './MilestoneProgress';

export default function StatsOverlay() {
  const player = useGameStore((state: GameStore) => state.player);

  return (
    <div className="flex flex-col gap-4">
      <MilestoneProgress />

      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Channel Stats
        </h3>
        <div className="space-y-3">
          <StatItem label="Subscribers" value={player.channel.subscribers.toLocaleString()} icon="👥" />
          <StatItem label="Followers" value={player.channel.followers.toLocaleString()} icon="❤️" />
          <StatItem label="Reputation" value={`${player.channel.reputation}/100`} icon="⭐" />
        </div>
      </div>

      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Resources
        </h3>
        <div className="space-y-3">
          <StatItem label="Money" value={`$${player.money.toLocaleString()}`} icon="💰" />
          <StatItem label="Energy" value={`${player.energy}/${player.maxEnergy}`} icon="⚡" />
          <StatItem label="Level" value={player.level.toString()} icon="📊" />
        </div>
      </div>

      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Time
        </h3>
        <div className="space-y-3">
          <StatItem label="Week" value={player.currentWeek.toString()} icon="📅" />
          <StatItem label="Day" value={player.currentDay.toString()} icon="🌅" />
        </div>
      </div>

      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Equipment
        </h3>
        <div className="text-sm text-zinc-300">
          {player.channel.equipment.length === 0 ? (
            <span className="text-zinc-500 italic">No equipment yet</span>
          ) : (
            <span>{player.channel.equipment.length} items</span>
          )}
        </div>
      </div>

      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Staff
        </h3>
        <div className="text-sm text-zinc-300">
          {player.channel.staff.length === 0 ? (
            <span className="text-zinc-500 italic">No staff hired</span>
          ) : (
            <span>{player.channel.staff.length} members</span>
          )}
        </div>
      </div>
    </div>
  );
}

interface StatItemProps {
  label: string;
  value: string;
  icon: string;
}

function StatItem({ label, value, icon }: StatItemProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-zinc-400 flex items-center gap-2">
        <span>{icon}</span>
        {label}
      </span>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  );
}
