'use client';

import { useState, useMemo } from 'react';
import { ContentNiche } from '../types';
import {
  RaidingChannel,
  generateOutgoingRaidTargets,
  canInitiateOutgoingRaid,
  calculateViewersSentOnRaid,
  processOutgoingRaid,
  OutgoingRaid,
} from '../data/raids';

interface OutgoingRaidPanelProps {
  playerSubscribers: number;
  playerNiche: ContentNiche;
  currentViewers: number;
  onRaid: (raid: OutgoingRaid) => void;
  onSkip: () => void;
}

export default function OutgoingRaidPanel({
  playerSubscribers,
  playerNiche,
  currentViewers,
  onRaid,
  onSkip,
}: OutgoingRaidPanelProps) {
  const canRaid = canInitiateOutgoingRaid(playerSubscribers);
  const viewersToSend = calculateViewersSentOnRaid(currentViewers);

  const targets = useMemo<RaidingChannel[]>(() => {
    if (!canRaid) return [];
    return generateOutgoingRaidTargets(playerSubscribers, playerNiche);
  }, [canRaid, playerSubscribers, playerNiche]);

  const [selectedTarget, setSelectedTarget] = useState<RaidingChannel | null>(null);
  const [isRaiding, setIsRaiding] = useState(false);

  const handleRaid = () => {
    if (!selectedTarget || isRaiding) return;
    setIsRaiding(true);

    const raid = processOutgoingRaid(selectedTarget, playerSubscribers, viewersToSend);
    setTimeout(() => {
      onRaid(raid);
    }, 1500);
  };

  if (!canRaid) {
    return (
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
        <div className="text-center">
          <div className="text-4xl mb-3">🔒</div>
          <h3 className="text-lg font-semibold text-white mb-2">Outgoing Raids Locked</h3>
          <p className="text-sm text-zinc-400 mb-4">
            Reach 500 subscribers to unlock the ability to raid other streamers.
          </p>
          <div className="bg-zinc-900 rounded-lg p-3">
            <div className="text-xs text-zinc-500 mb-1">Current Progress</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-zinc-700 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (playerSubscribers / 500) * 100)}%` }}
                />
              </div>
              <span className="text-sm text-zinc-400">{playerSubscribers}/500</span>
            </div>
          </div>
          <button
            onClick={onSkip}
            className="mt-4 px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            End Stream Without Raid →
          </button>
        </div>
      </div>
    );
  }

  if (isRaiding) {
    return (
      <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 border border-purple-500/50 rounded-xl p-6">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🚀</div>
          <h3 className="text-xl font-bold text-white mb-2">Raiding {selectedTarget?.name}!</h3>
          <p className="text-purple-200">
            Sending {viewersToSend} viewers their way...
          </p>
          <div className="mt-4">
            <div className="w-16 h-16 mx-auto border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span>🎯</span> Raid Another Channel
        </h3>
        <p className="text-xs text-purple-200 mt-0.5">
          Send your {viewersToSend} viewers to support a fellow streamer
        </p>
      </div>

      <div className="p-4">
        <div className="space-y-2 mb-4">
          {targets.map((target, index) => (
            <button
              key={index}
              onClick={() => setSelectedTarget(target)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                selectedTarget === target
                  ? 'bg-purple-600/30 border-2 border-purple-500'
                  : 'bg-zinc-700/50 border-2 border-transparent hover:bg-zinc-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  {target.name.charAt(0)}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-white">{target.name}</p>
                  <p className="text-xs text-zinc-400">
                    {target.subscribers.toLocaleString()} subs
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-zinc-500">Rep Gain</div>
                <div className="text-sm font-semibold text-green-400">
                  +{target.subscribers < playerSubscribers * 0.5 ? 2 : target.subscribers < playerSubscribers ? 3 : 5}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="bg-zinc-900 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Viewers you&apos;ll send:</span>
            <span className="font-bold text-purple-400">{viewersToSend}</span>
          </div>
          {selectedTarget && (
            <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-zinc-800">
              <span className="text-zinc-400">Reputation gain:</span>
              <span className="font-bold text-green-400">
                +{selectedTarget.subscribers < playerSubscribers * 0.5 ? 2 : selectedTarget.subscribers < playerSubscribers ? 3 : 5}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onSkip}
            className="flex-1 px-4 py-3 text-sm font-medium text-zinc-400 bg-zinc-700 rounded-lg hover:bg-zinc-600 transition-colors"
          >
            Skip Raid
          </button>
          <button
            onClick={handleRaid}
            disabled={!selectedTarget}
            className={`flex-1 px-4 py-3 text-sm font-bold rounded-lg transition-all ${
              selectedTarget
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 transform hover:scale-105'
                : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
            }`}
          >
            🚀 Start Raid
          </button>
        </div>
      </div>
    </div>
  );
}
