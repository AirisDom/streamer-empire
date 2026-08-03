'use client';

import { useEffect, useState, useCallback } from 'react';
import { SubscriberMilestone, formatSubscriberCount } from '../data/milestones';

interface MilestoneCelebrationProps {
  milestone: SubscriberMilestone;
  onClose: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  velocityX: number;
  velocityY: number;
}

export default function MilestoneCelebration({ milestone, onClose }: MilestoneCelebrationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showContent, setShowContent] = useState(false);

  const generateParticles = useCallback(() => {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const newParticles: Particle[] = [];

    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: 50 + (Math.random() - 0.5) * 20,
        y: 50,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 8,
        velocityX: (Math.random() - 0.5) * 15,
        velocityY: -10 - Math.random() * 10,
      });
    }

    setParticles(newParticles);
  }, []);

  useEffect(() => {
    generateParticles();
    const showTimer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(showTimer);
  }, [generateParticles]);

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          x: p.x + p.velocityX * 0.1,
          y: p.y + p.velocityY * 0.1,
          velocityY: p.velocityY + 0.5,
        }))
      );
    }, 16);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              transform: 'translate(-50%, -50%)',
              opacity: Math.max(0, 1 - p.y / 150),
            }}
          />
        ))}
      </div>

      <div
        className={`relative bg-zinc-900 border-2 rounded-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-500 ${
          showContent ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}
        style={{ borderColor: milestone.celebrationColor }}
      >
        <div
          className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-24 h-24 rounded-full flex items-center justify-center text-5xl animate-bounce"
          style={{ backgroundColor: milestone.celebrationColor }}
        >
          {milestone.icon}
        </div>

        <div className="mt-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Milestone Reached!</h2>
          <p className="text-4xl font-black mb-1" style={{ color: milestone.celebrationColor }}>
            {milestone.name}
          </p>
          <p className="text-zinc-400 text-sm mb-6">{milestone.description}</p>

          <div className="bg-zinc-800 rounded-xl p-4 mb-6">
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">
              🎁 Rewards Unlocked
            </div>
            <div className="space-y-2">
              {milestone.rewards.map((reward, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-zinc-700/50 rounded-lg px-3 py-2"
                >
                  <span className="text-sm text-zinc-300">{reward.description}</span>
                  <span className="text-lg">
                    {reward.type === 'money' && '💰'}
                    {reward.type === 'equipment_unlock' && '🔧'}
                    {reward.type === 'staff_unlock' && '👤'}
                    {reward.type === 'niche_unlock' && '🎯'}
                    {reward.type === 'reputation' && '⭐'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mb-6">
            <span className="text-xs text-zinc-500">Total Subscribers</span>
            <p className="text-3xl font-bold text-white">
              {formatSubscriberCount(milestone.threshold)}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full px-6 py-3 text-lg font-bold text-white rounded-xl transition-all hover:scale-105"
            style={{ backgroundColor: milestone.celebrationColor }}
          >
            Continue Streaming! 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
