'use client';

import { useState, useEffect } from 'react';
import { IncomingRaid, processIncomingRaid, RaidEventResult } from '../data/raids';

interface RaidNotificationProps {
  raid: IncomingRaid;
  onRespond: (result: RaidEventResult, welcomedWarmly: boolean) => void;
  onDismiss: () => void;
}

export default function RaidNotification({ raid, onRespond, onDismiss }: RaidNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasResponded, setHasResponded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleResponse = (welcomedWarmly: boolean) => {
    if (hasResponded) return;
    setHasResponded(true);
    const result = processIncomingRaid(raid, welcomedWarmly);
    onRespond(result, welcomedWarmly);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onDismiss} />

      <div
        className={`relative bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-purple-500/50 transform transition-all duration-500 ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wider animate-pulse">
            Incoming Raid!
          </div>
        </div>

        <div className="text-center mt-4">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>

          <h2 className="text-2xl font-bold text-white mb-2">
            {raid.raider.name} is raiding you!
          </h2>

          <p className="text-purple-200 mb-4">
            {raid.viewerCount} viewers are joining your stream!
          </p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-400">+{raid.viewerCount}</div>
              <div className="text-xs text-zinc-400">Viewers</div>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-pink-400">~{raid.potentialNewSubs}</div>
              <div className="text-xs text-zinc-400">Potential Subs</div>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-yellow-400">+{raid.hypeBoost}%</div>
              <div className="text-xs text-zinc-400">Hype Boost</div>
            </div>
          </div>

          <div className="bg-black/20 rounded-lg p-3 mb-6">
            <p className="text-sm text-purple-200">
              <span className="font-semibold">{raid.raider.name}</span> has{' '}
              <span className="text-white font-bold">{raid.raider.subscribers.toLocaleString()}</span>{' '}
              subscribers
            </p>
          </div>

          {!hasResponded ? (
            <div className="space-y-3">
              <button
                onClick={() => handleResponse(true)}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg"
              >
                🎤 Welcome Them Warmly
                <span className="block text-xs font-normal opacity-80">
                  Shoutout & full engagement
                </span>
              </button>

              <button
                onClick={() => handleResponse(false)}
                className="w-full px-6 py-3 bg-zinc-700 text-white font-medium rounded-lg hover:bg-zinc-600 transition-colors"
              >
                👋 Quick Acknowledgment
                <span className="block text-xs font-normal opacity-60">
                  Brief thanks, continue content
                </span>
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-4xl mb-2">✨</div>
              <p className="text-green-400 font-semibold">Raid welcomed!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
