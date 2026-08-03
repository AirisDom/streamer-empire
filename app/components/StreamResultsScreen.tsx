'use client';

import { useMemo } from 'react';
import { ContentNiche } from '../types';
import {
  StreamResults,
  formatStreamDuration,
  getPerformanceColor,
  getPerformanceDescription,
} from '../data/streamResults';

interface StreamResultsScreenProps {
  results: StreamResults;
  onContinue: () => void;
}

const NICHE_INFO: Record<ContentNiche, { name: string; icon: string }> = {
  [ContentNiche.Gaming]: { name: 'Gaming', icon: '🎮' },
  [ContentNiche.Cooking]: { name: 'Cooking', icon: '🍳' },
  [ContentNiche.Music]: { name: 'Music', icon: '🎵' },
  [ContentNiche.IRL]: { name: 'IRL', icon: '📹' },
};

export default function StreamResultsScreen({ results, onContinue }: StreamResultsScreenProps) {
  const nicheInfo = NICHE_INFO[results.niche];
  const performanceColor = getPerformanceColor(results.performanceRating);
  const performanceDesc = getPerformanceDescription(results.performanceRating);

  const stats = useMemo(() => [
    {
      label: 'Peak Viewers',
      value: results.peakViewers.toLocaleString(),
      icon: '👁️',
      color: 'text-purple-400',
    },
    {
      label: 'Avg Viewers',
      value: results.averageViewers.toLocaleString(),
      icon: '📊',
      color: 'text-zinc-300',
    },
    {
      label: 'New Subscribers',
      value: `+${results.newSubscribers.toLocaleString()}`,
      icon: '⭐',
      color: 'text-yellow-400',
    },
    {
      label: 'Chat Health',
      value: `${results.chatHealthScore}%`,
      icon: results.chatHealthScore >= 70 ? '💚' : results.chatHealthScore >= 40 ? '💛' : '❤️',
      color: results.chatHealthScore >= 70 ? 'text-green-400' : results.chatHealthScore >= 40 ? 'text-yellow-400' : 'text-red-400',
    },
  ], [results]);

  const revenueItems = useMemo(() => [
    {
      label: 'Donations',
      value: results.donationRevenue,
      icon: '💰',
    },
    {
      label: 'Ad Revenue',
      value: results.adRevenue,
      icon: '📺',
    },
  ], [results]);

  return (
    <div className="space-y-4">
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{nicheInfo.icon}</span>
              <div>
                <h2 className="text-white font-bold text-sm">Stream Complete!</h2>
                <p className="text-white/70 text-xs">{results.title}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-white/70 text-xs block">Duration</span>
              <span className="text-white font-mono text-sm">{formatStreamDuration(results.duration)}</span>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-center justify-center py-4">
            <div className="text-center">
              <span className={`text-6xl font-bold ${performanceColor}`}>{results.performanceRating}</span>
              <p className="text-sm text-zinc-400 mt-1">{performanceDesc}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-zinc-900 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{stat.icon}</span>
                  <div className="flex-1">
                    <span className="text-xs text-zinc-500 block">{stat.label}</span>
                    <span className={`text-sm font-medium ${stat.color}`}>{stat.value}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-zinc-900 rounded-lg p-3">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Revenue</h3>
            <div className="space-y-2">
              {revenueItems.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400 flex items-center gap-2">
                    <span>{item.icon}</span>
                    {item.label}
                  </span>
                  <span className="text-sm text-green-400 font-medium">
                    ${item.value.toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="border-t border-zinc-700 pt-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Total</span>
                <span className="text-lg font-bold text-green-400">
                  ${results.totalRevenue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {results.bonuses.length > 0 && (
            <div className="bg-zinc-900 rounded-lg p-3">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Bonuses</h3>
              <div className="space-y-1">
                {results.bonuses.map((bonus, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-zinc-300">{bonus.name}</span>
                      <span className="text-xs text-zinc-500 block">{bonus.description}</span>
                    </div>
                    <span className={`text-sm font-medium ${
                      bonus.type === 'revenue' ? 'text-green-400' :
                      bonus.type === 'subscribers' ? 'text-yellow-400' : 'text-purple-400'
                    }`}>
                      {bonus.type === 'revenue' && `+$${bonus.value}`}
                      {bonus.type === 'subscribers' && `+${bonus.value} subs`}
                      {bonus.type === 'experience' && `+${bonus.value} XP`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-purple-900/30 rounded-lg p-3 flex items-center justify-between">
            <span className="text-sm text-purple-300">Experience Gained</span>
            <span className="text-lg font-bold text-purple-400">+{results.experienceGained} XP</span>
          </div>

          <button
            onClick={onContinue}
            className="w-full px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
