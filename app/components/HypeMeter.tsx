'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatMessage } from '../types';
import {
  HypeState,
  HypeBoost,
  HYPE_BOOSTS,
  createInitialHypeState,
  calculateHypeDecay,
  calculateChatHypeContribution,
  isBoostOnCooldown,
  getCooldownRemaining,
  applyHypeBoost,
  getHypeLevel,
  calculateSubscriberConversionRate,
} from '../data/hype';

interface HypeMeterProps {
  messages: ChatMessage[];
  onHypeChange?: (hype: number) => void;
  onSubscriberConversion?: (rate: number) => void;
  playerEnergy: number;
  onEnergyUsed?: (amount: number) => void;
}

export default function HypeMeter({
  messages,
  onHypeChange,
  onSubscriberConversion,
  playerEnergy,
  onEnergyUsed,
}: HypeMeterProps) {
  const [hypeState, setHypeState] = useState<HypeState>(createInitialHypeState);
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const lastMessageCountRef = useRef(0);
  const lastDecayTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (lastDecayTimeRef.current === null) {
      lastDecayTimeRef.current = Date.now();
    }
  }, []);

  useEffect(() => {
    const newMessages = messages.slice(lastMessageCountRef.current);
    lastMessageCountRef.current = messages.length;

    if (newMessages.length > 0) {
      let hypeGain = 0;
      newMessages.forEach((msg) => {
        hypeGain += calculateChatHypeContribution(msg);
      });

      if (hypeGain > 0) {
        setHypeState((prev) => {
          const newHype = Math.min(prev.maxHype, prev.currentHype + hypeGain);
          return {
            ...prev,
            currentHype: newHype,
            totalHypeGained: prev.totalHypeGained + hypeGain,
            peakHype: Math.max(prev.peakHype, newHype),
          };
        });
      }
    }
  }, [messages.length]);

  useEffect(() => {
    const decayInterval = setInterval(() => {
      const now = Date.now();
      const lastTime = lastDecayTimeRef.current ?? now;
      const elapsed = now - lastTime;
      lastDecayTimeRef.current = now;

      setHypeState((prev) => ({
        ...prev,
        currentHype: calculateHypeDecay(prev.currentHype, elapsed),
      }));
    }, 1000);

    return () => clearInterval(decayInterval);
  }, []);

  useEffect(() => {
    const cooldownInterval = setInterval(() => {
      const newCooldowns: Record<string, number> = {};
      HYPE_BOOSTS.forEach((boost) => {
        const remaining = getCooldownRemaining(boost, hypeState.lastBoostTimes);
        if (remaining > 0) {
          newCooldowns[boost.type] = remaining;
        }
      });
      setCooldowns(newCooldowns);
    }, 100);

    return () => clearInterval(cooldownInterval);
  }, [hypeState.lastBoostTimes]);

  useEffect(() => {
    onHypeChange?.(hypeState.currentHype);
    onSubscriberConversion?.(calculateSubscriberConversionRate(hypeState.currentHype));
  }, [hypeState.currentHype, onHypeChange, onSubscriberConversion]);

  const handleBoostAction = useCallback(
    (boost: HypeBoost) => {
      if (isBoostOnCooldown(boost, hypeState.lastBoostTimes)) return;
      if (playerEnergy < boost.energyCost) return;

      setHypeState((prev) => applyHypeBoost(prev, boost));
      onEnergyUsed?.(boost.energyCost);
    },
    [hypeState.lastBoostTimes, playerEnergy, onEnergyUsed]
  );

  const hypeLevel = getHypeLevel(hypeState.currentHype);
  const hypePercentage = (hypeState.currentHype / hypeState.maxHype) * 100;

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{hypeLevel.emoji}</span>
            <span className="text-white font-bold">Hype Meter</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-bold px-2 py-0.5 rounded"
              style={{ backgroundColor: hypeLevel.color, color: '#fff' }}
            >
              {hypeLevel.label}
            </span>
            <span className="text-white font-mono text-lg">
              {Math.round(hypeState.currentHype)}%
            </span>
          </div>
        </div>

        <div className="relative h-4 bg-zinc-900 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 transition-all duration-300 rounded-full"
            style={{
              width: `${hypePercentage}%`,
              background: `linear-gradient(90deg, ${hypeLevel.color}88, ${hypeLevel.color})`,
              boxShadow: hypePercentage > 75 ? `0 0 10px ${hypeLevel.color}` : 'none',
            }}
          />
          {[25, 50, 75].map((mark) => (
            <div
              key={mark}
              className="absolute top-0 bottom-0 w-px bg-zinc-600"
              style={{ left: `${mark}%` }}
            />
          ))}
        </div>

        <div className="flex justify-between mt-1 text-xs text-zinc-500">
          <span>Sub Rate: {(calculateSubscriberConversionRate(hypeState.currentHype) * 100).toFixed(1)}%</span>
          <span>Peak: {Math.round(hypeState.peakHype)}%</span>
        </div>
      </div>

      <div className="p-3">
        <div className="text-xs text-zinc-400 mb-2 font-medium">Hype Boosts</div>
        <div className="grid grid-cols-2 gap-2">
          {HYPE_BOOSTS.map((boost) => {
            const onCooldown = isBoostOnCooldown(boost, hypeState.lastBoostTimes);
            const cooldownRemaining = cooldowns[boost.type] || 0;
            const canAfford = playerEnergy >= boost.energyCost;
            const disabled = onCooldown || !canAfford;

            return (
              <button
                key={boost.type}
                onClick={() => handleBoostAction(boost)}
                disabled={disabled}
                className={`relative flex flex-col items-center p-2 rounded-lg border transition-all ${
                  disabled
                    ? 'bg-zinc-900 border-zinc-700 text-zinc-500 cursor-not-allowed'
                    : 'bg-zinc-700 border-zinc-600 text-white hover:bg-zinc-600 hover:border-zinc-500'
                }`}
              >
                <span className="text-xl mb-1">{boost.icon}</span>
                <span className="text-xs font-medium">{boost.name}</span>
                <span className="text-xs text-zinc-400">
                  +{boost.hypeGain}% | -{boost.energyCost}⚡
                </span>

                {onCooldown && (
                  <div className="absolute inset-0 bg-zinc-900/80 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-mono text-zinc-400">
                      {Math.ceil(cooldownRemaining / 1000)}s
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
