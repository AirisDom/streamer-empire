'use client';

import { useGameStore, GameStore } from '../store/gameStore';
import {
  getMilestoneProgress,
  formatSubscriberCount,
  getAchievedMilestones,
  SUBSCRIBER_MILESTONES,
} from '../data/milestones';

export default function MilestoneProgress() {
  const subscribers = useGameStore((state: GameStore) => state.player.channel.subscribers);
  const progress = getMilestoneProgress(subscribers);
  const achieved = getAchievedMilestones(subscribers);
  const allCompleted = progress.milestone === null;

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
      <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
        Subscriber Milestone
      </h3>

      {allCompleted ? (
        <div className="text-center py-2">
          <span className="text-2xl">👑</span>
          <p className="text-sm text-yellow-400 font-medium mt-1">All Milestones Complete!</p>
          <p className="text-xs text-zinc-500">{formatSubscriberCount(subscribers)} subscribers</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{progress.milestone?.icon}</span>
            <div className="flex-1">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm font-medium text-white">
                  {progress.milestone?.name}
                </span>
                <span className="text-xs text-zinc-400">
                  {formatSubscriberCount(subscribers)} / {formatSubscriberCount(progress.target)}
                </span>
              </div>
              <div className="relative h-2 bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                  style={{
                    width: `${progress.percentage}%`,
                    backgroundColor: progress.milestone?.celebrationColor ?? '#8B5CF6',
                  }}
                />
              </div>
            </div>
          </div>

          <div className="text-xs text-zinc-500">
            {progress.target - subscribers > 0
              ? `${formatSubscriberCount(progress.target - subscribers)} more to go!`
              : 'Almost there!'}
          </div>
        </>
      )}

      {achieved.length > 0 && (
        <div className="mt-3 pt-3 border-t border-zinc-700">
          <div className="text-xs text-zinc-500 mb-2">Achieved</div>
          <div className="flex gap-1 flex-wrap">
            {achieved.map((m) => (
              <span
                key={m.id}
                className="text-lg cursor-default"
                title={`${m.name} (${formatSubscriberCount(m.threshold)})`}
              >
                {m.icon}
              </span>
            ))}
            {SUBSCRIBER_MILESTONES.slice(achieved.length).map((m) => (
              <span
                key={m.id}
                className="text-lg opacity-30 cursor-default"
                title={`${m.name} (${formatSubscriberCount(m.threshold)})`}
              >
                {m.icon}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
