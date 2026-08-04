'use client';

import { useState, useEffect } from 'react';
import {
  CollabOffer,
  CollabResult,
  processCollab,
  calculateNicheCompatibility,
  getCollabTypeName,
  getCollabTypeDescription,
} from '../data/collabs';
import { Equipment, ContentNiche } from '../types';

interface CollabNotificationProps {
  offer: CollabOffer;
  playerReputation: number;
  playerEquipment: Equipment[];
  playerNiche: ContentNiche;
  onAccept: (result: CollabResult) => void;
  onDecline: () => void;
  onDismiss: () => void;
}

const nicheEmojis: Record<ContentNiche, string> = {
  [ContentNiche.Gaming]: '🎮',
  [ContentNiche.Cooking]: '🍳',
  [ContentNiche.Music]: '🎵',
  [ContentNiche.IRL]: '📸',
};

const personalityDescriptions: Record<string, string> = {
  chill: 'Laid-back vibes',
  energetic: 'High energy!',
  professional: 'Business-focused',
  chaotic: 'Unpredictable fun',
};

function getNicheCompatibilityLabel(compatibility: number): { label: string; color: string } {
  if (compatibility >= 0.9) return { label: 'Perfect Match', color: 'text-green-400' };
  if (compatibility >= 0.7) return { label: 'Good Fit', color: 'text-emerald-400' };
  if (compatibility >= 0.5) return { label: 'Decent Fit', color: 'text-yellow-400' };
  return { label: 'Risky Match', color: 'text-orange-400' };
}

export default function CollabNotification({
  offer,
  playerReputation,
  playerEquipment,
  playerNiche,
  onAccept,
  onDecline,
  onDismiss,
}: CollabNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasResponded, setHasResponded] = useState(false);
  const [result, setResult] = useState<CollabResult | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const nicheCompatibility = calculateNicheCompatibility(playerNiche, offer.partner.niche);
  const compatLabel = getNicheCompatibilityLabel(nicheCompatibility);

  const handleAccept = () => {
    if (hasResponded) return;
    setHasResponded(true);
    const collabResult = processCollab(offer, playerReputation, playerEquipment);
    setResult(collabResult);
    onAccept(collabResult);
  };

  const handleDecline = () => {
    if (hasResponded) return;
    setHasResponded(true);
    onDecline();
  };

  const partnerSizeLabel = (): string => {
    if (offer.partner.subscribers > 10000) return 'Major Creator';
    if (offer.partner.subscribers > 1000) return 'Rising Star';
    return 'Emerging Creator';
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onDismiss} />

      <div
        className={`relative bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl border border-blue-500/50 transform transition-all duration-500 ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wider animate-pulse">
            {offer.isIncoming ? 'Collab Request!' : 'Collab Opportunity'}
          </div>
        </div>

        <div className="text-center mt-4">
          <div className="text-6xl mb-4">
            {nicheEmojis[offer.partner.niche]} 🤝 {nicheEmojis[playerNiche]}
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            {offer.partner.name} wants to collab!
          </h2>

          <p className="text-blue-200 mb-2">
            {getCollabTypeName(offer.type)}
          </p>
          <p className="text-sm text-zinc-400 mb-4">
            {getCollabTypeDescription(offer.type)}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-xl font-bold text-cyan-400">
                {offer.partner.subscribers.toLocaleString()}
              </div>
              <div className="text-xs text-zinc-400">Subscribers</div>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-xl font-bold text-pink-400">
                {offer.partner.reputation}
              </div>
              <div className="text-xs text-zinc-400">Reputation</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
            <div className="bg-black/20 rounded-lg p-2">
              <div className="text-lg">{nicheEmojis[offer.partner.niche]}</div>
              <div className="text-xs text-zinc-400 capitalize">{offer.partner.niche}</div>
            </div>
            <div className="bg-black/20 rounded-lg p-2">
              <div className={`font-semibold ${compatLabel.color}`}>
                {Math.round(nicheCompatibility * 100)}%
              </div>
              <div className="text-xs text-zinc-400">{compatLabel.label}</div>
            </div>
            <div className="bg-black/20 rounded-lg p-2">
              <div className="text-zinc-300 capitalize text-sm">{offer.partner.personality}</div>
              <div className="text-xs text-zinc-400">
                {personalityDescriptions[offer.partner.personality]}
              </div>
            </div>
          </div>

          <div className="bg-black/20 rounded-lg p-3 mb-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-400">Partner Size:</span>
              <span className="text-white font-medium">{partnerSizeLabel()}</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-1">
              <span className="text-zinc-400">Equipment Quality:</span>
              <span className="text-white font-medium">{offer.partner.equipmentQuality}/100</span>
            </div>
          </div>

          {!hasResponded ? (
            <div className="space-y-3">
              <button
                onClick={handleAccept}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg"
              >
                🎬 Accept Collaboration
                <span className="block text-xs font-normal opacity-80">
                  Share audiences and grow together
                </span>
              </button>

              <button
                onClick={handleDecline}
                className="w-full px-6 py-3 bg-zinc-700 text-white font-medium rounded-lg hover:bg-zinc-600 transition-colors"
              >
                👋 Decline Politely
                <span className="block text-xs font-normal opacity-60">
                  Not the right time
                </span>
              </button>
            </div>
          ) : result ? (
            <div className="text-center">
              <div className="text-4xl mb-2">
                {result.successLevel === 'legendary' && '🌟'}
                {result.successLevel === 'great' && '✨'}
                {result.successLevel === 'decent' && '👍'}
                {result.successLevel === 'awkward' && '😬'}
                {result.successLevel === 'disaster' && '💀'}
              </div>
              <p className={`font-semibold mb-2 ${
                result.successLevel === 'disaster' || result.successLevel === 'awkward'
                  ? 'text-red-400'
                  : 'text-green-400'
              }`}>
                {result.successLevel.charAt(0).toUpperCase() + result.successLevel.slice(1)} Collab!
              </p>
              <p className="text-sm text-zinc-300 mb-3">{result.message}</p>
              <div className="flex justify-center gap-4 text-sm">
                <div>
                  <span className="text-zinc-400">Subs: </span>
                  <span className={result.subscribersGained >= 0 ? 'text-green-400' : 'text-red-400'}>
                    +{result.subscribersGained}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400">Rep: </span>
                  <span className={result.reputationChange >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {result.reputationChange >= 0 ? '+' : ''}{result.reputationChange}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400">XP: </span>
                  <span className="text-blue-400">+{result.experienceGained}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-yellow-400 font-semibold">Declined politely</p>
              <p className="text-sm text-zinc-400">Maybe next time!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
