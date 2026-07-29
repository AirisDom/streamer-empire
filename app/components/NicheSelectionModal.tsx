'use client';

import { useState } from 'react';
import { ContentNiche } from '../types';
import { useGameStore } from '../store/gameStore';

interface NicheSelectionModalProps {
  onClose: () => void;
  onSelect: () => void;
}

interface NicheOption {
  niche: ContentNiche;
  name: string;
  icon: string;
  description: string;
  audienceBehavior: string;
}

const nicheOptions: NicheOption[] = [
  {
    niche: ContentNiche.Gaming,
    name: 'Gaming',
    icon: '🎮',
    description: 'Play and stream video games to entertain your audience.',
    audienceBehavior: 'High engagement during new releases. Viewers expect skilled gameplay and entertaining commentary. Peak hours: evenings and weekends.',
  },
  {
    niche: ContentNiche.Cooking,
    name: 'Cooking',
    icon: '🍳',
    description: 'Share recipes and cooking techniques with hungry viewers.',
    audienceBehavior: 'Loyal, older demographic. Viewers value consistency and learning. Higher donation potential. Peak hours: meal times.',
  },
  {
    niche: ContentNiche.Music,
    name: 'Music',
    icon: '🎵',
    description: 'Perform live music, produce beats, or teach instruments.',
    audienceBehavior: 'Passionate fanbase with strong subscription retention. Viewers expect regular uploads and song requests. Peak hours: late nights.',
  },
  {
    niche: ContentNiche.IRL,
    name: 'IRL',
    icon: '📱',
    description: 'Share your daily life, travel, and real-world adventures.',
    audienceBehavior: 'Unpredictable but viral potential. Personal connection matters most. Higher drama event frequency. Peak hours: varies by content.',
  },
];

export default function NicheSelectionModal({ onClose, onSelect }: NicheSelectionModalProps) {
  const [selectedNiche, setSelectedNiche] = useState<ContentNiche | null>(null);
  const [channelName, setChannelName] = useState('');
  const initializeGame = useGameStore((state) => state.initializeGame);

  const handleStartGame = () => {
    if (!selectedNiche || !channelName.trim()) return;
    initializeGame(channelName.trim(), selectedNiche);
    onSelect();
  };

  const canStart = selectedNiche !== null && channelName.trim().length > 0;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-zinc-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Choose Your Niche</h2>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-zinc-400 mt-2">
            Your niche determines your content style and audience behavior
          </p>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <label htmlFor="channelName" className="block text-sm font-medium text-zinc-300 mb-2">
              Channel Name
            </label>
            <input
              id="channelName"
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              placeholder="Enter your channel name..."
              className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              maxLength={24}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {nicheOptions.map((option) => (
              <button
                key={option.niche}
                onClick={() => setSelectedNiche(option.niche)}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  selectedNiche === option.niche
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-zinc-600 bg-zinc-700/50 hover:border-zinc-500'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{option.icon}</span>
                  <span className="text-lg font-semibold text-white">{option.name}</span>
                </div>
                <p className="text-sm text-zinc-300 mb-2">{option.description}</p>
                <p className="text-xs text-zinc-400">{option.audienceBehavior}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-zinc-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 text-zinc-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleStartGame}
            disabled={!canStart}
            className={`px-8 py-2 font-semibold rounded-lg transition-all duration-200 ${
              canStart
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500'
                : 'bg-zinc-600 text-zinc-400 cursor-not-allowed'
            }`}
          >
            Start Streaming
          </button>
        </div>
      </div>
    </div>
  );
}
