'use client';

import { useGameStore, GameStore } from '../store/gameStore';
import { StreamScheduleSlot, ContentNiche } from '../types';
import {
  DAYS_OF_WEEK,
  TIME_SLOTS,
  calculateProjectedViewership,
} from '../data/schedule';

interface GoLiveScreenProps {
  slot: StreamScheduleSlot;
  onStartStream: () => void;
  onCancel: () => void;
}

const NICHE_INFO: Record<ContentNiche, { name: string; icon: string; color: string }> = {
  [ContentNiche.Gaming]: { name: 'Gaming', icon: '🎮', color: 'bg-purple-500' },
  [ContentNiche.Cooking]: { name: 'Cooking', icon: '🍳', color: 'bg-orange-500' },
  [ContentNiche.Music]: { name: 'Music', icon: '🎵', color: 'bg-pink-500' },
  [ContentNiche.IRL]: { name: 'IRL', icon: '📹', color: 'bg-blue-500' },
};

export default function GoLiveScreen({ slot, onStartStream, onCancel }: GoLiveScreenProps) {
  const player = useGameStore((state: GameStore) => state.player);
  const equipment = player.channel.equipment;

  const timeSlot = TIME_SLOTS.find((t) => t.hour === slot.startHour);
  const dayName = DAYS_OF_WEEK[slot.dayOfWeek];
  const nicheInfo = NICHE_INFO[slot.niche];

  const projection = calculateProjectedViewership({
    dayOfWeek: slot.dayOfWeek,
    hour: slot.startHour,
    niche: slot.niche,
    equipment,
    subscriberCount: player.channel.subscribers,
  });

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-4xl">{nicheInfo.icon}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Ready to Go Live?</h2>
              <p className="text-white/80 text-sm mt-1">{nicheInfo.name} Stream</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-zinc-700/50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Stream Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-zinc-500">Day</span>
                <p className="text-white font-medium">{dayName}</p>
              </div>
              <div>
                <span className="text-xs text-zinc-500">Time</span>
                <p className="text-white font-medium">{timeSlot?.label || `${slot.startHour}:00`}</p>
              </div>
              <div>
                <span className="text-xs text-zinc-500">Duration</span>
                <p className="text-white font-medium">{slot.duration} hours</p>
              </div>
              <div>
                <span className="text-xs text-zinc-500">Content</span>
                <p className="text-white font-medium flex items-center gap-1">
                  <span>{nicheInfo.icon}</span>
                  {nicheInfo.name}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-700/50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Viewer Projection
            </h3>
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <span className="text-3xl font-bold text-purple-400">
                  {projection.projectedViewers}
                </span>
                <p className="text-xs text-zinc-500 mt-1">Expected Viewers</p>
              </div>
              <div className="h-12 w-px bg-zinc-600" />
              <div className="flex-1 pl-4">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Time Slot</span>
                    <span className={projection.isPrimeTime ? 'text-green-400' : 'text-zinc-400'}>
                      {projection.isPrimeTime ? 'Prime Time' : 'Off-Peak'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Niche Bonus</span>
                    <span className={projection.isNichePeakTime ? 'text-green-400' : 'text-zinc-400'}>
                      {projection.isNichePeakTime ? 'Peak Hours' : 'Normal'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Equipment</span>
                    <span className="text-purple-400">
                      {Math.round((projection.equipmentMultiplier - 1) * 100)}% bonus
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 text-sm font-medium text-zinc-300 bg-zinc-700 rounded-xl hover:bg-zinc-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onStartStream}
              className="flex-1 px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-pink-600 rounded-xl hover:from-red-500 hover:to-pink-500 transition-all shadow-lg shadow-red-500/25 flex items-center justify-center gap-2"
            >
              <span className="w-3 h-3 bg-white rounded-full animate-pulse" />
              Go Live!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
