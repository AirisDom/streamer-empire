import { ChatMessage } from '../types';

export type HypeBoostAction = 'shoutout' | 'giveaway' | 'reaction' | 'subscriber_goal';

export interface HypeBoost {
  type: HypeBoostAction;
  name: string;
  description: string;
  hypeGain: number;
  cooldown: number;
  energyCost: number;
  icon: string;
}

export interface HypeState {
  currentHype: number;
  maxHype: number;
  decayRate: number;
  lastBoostTimes: Record<HypeBoostAction, number>;
  totalHypeGained: number;
  peakHype: number;
}

export const HYPE_BOOSTS: HypeBoost[] = [
  {
    type: 'shoutout',
    name: 'Shoutout',
    description: 'Give a shoutout to chat, boosting engagement',
    hypeGain: 15,
    cooldown: 30000,
    energyCost: 5,
    icon: '📣',
  },
  {
    type: 'giveaway',
    name: 'Giveaway',
    description: 'Announce a giveaway to excite viewers',
    hypeGain: 35,
    cooldown: 120000,
    energyCost: 15,
    icon: '🎁',
  },
  {
    type: 'reaction',
    name: 'Hype Reaction',
    description: 'React enthusiastically to boost the mood',
    hypeGain: 10,
    cooldown: 15000,
    energyCost: 3,
    icon: '🔥',
  },
  {
    type: 'subscriber_goal',
    name: 'Sub Goal',
    description: 'Set a subscriber goal to motivate viewers',
    hypeGain: 25,
    cooldown: 180000,
    energyCost: 10,
    icon: '🎯',
  },
];

export const HYPE_CONFIG = {
  baseDecayRate: 2,
  decayInterval: 1000,
  minHype: 0,
  maxHype: 100,
  chatMessageHypeGain: 0.5,
  donationHypeMultiplier: 2,
  subscriberHypeGain: 3,
  hypeMessageThreshold: 0.7,
};

export function createInitialHypeState(): HypeState {
  return {
    currentHype: 20,
    maxHype: HYPE_CONFIG.maxHype,
    decayRate: HYPE_CONFIG.baseDecayRate,
    lastBoostTimes: {
      shoutout: 0,
      giveaway: 0,
      reaction: 0,
      subscriber_goal: 0,
    },
    totalHypeGained: 0,
    peakHype: 20,
  };
}

export function calculateHypeDecay(hype: number, elapsed: number): number {
  const decayAmount = HYPE_CONFIG.baseDecayRate * (elapsed / HYPE_CONFIG.decayInterval);
  return Math.max(HYPE_CONFIG.minHype, hype - decayAmount);
}

export function calculateChatHypeContribution(message: ChatMessage): number {
  let contribution = HYPE_CONFIG.chatMessageHypeGain;

  if (message.donationAmount) {
    contribution += Math.min(message.donationAmount * HYPE_CONFIG.donationHypeMultiplier, 20);
  }

  if (message.isSubscriber) {
    contribution += 0.3;
  }

  const hypeKeywords = ['pog', 'hype', 'lets go', 'W', 'gooo', 'amazing', 'insane', 'poggers'];
  const lowerMessage = message.message.toLowerCase();
  if (hypeKeywords.some(keyword => lowerMessage.includes(keyword))) {
    contribution += 0.5;
  }

  return contribution;
}

export function isBoostOnCooldown(boost: HypeBoost, lastBoostTimes: Record<HypeBoostAction, number>): boolean {
  const lastUsed = lastBoostTimes[boost.type];
  return Date.now() - lastUsed < boost.cooldown;
}

export function getCooldownRemaining(boost: HypeBoost, lastBoostTimes: Record<HypeBoostAction, number>): number {
  const lastUsed = lastBoostTimes[boost.type];
  const remaining = boost.cooldown - (Date.now() - lastUsed);
  return Math.max(0, remaining);
}

export function applyHypeBoost(state: HypeState, boost: HypeBoost): HypeState {
  const newHype = Math.min(state.maxHype, state.currentHype + boost.hypeGain);
  return {
    ...state,
    currentHype: newHype,
    lastBoostTimes: {
      ...state.lastBoostTimes,
      [boost.type]: Date.now(),
    },
    totalHypeGained: state.totalHypeGained + boost.hypeGain,
    peakHype: Math.max(state.peakHype, newHype),
  };
}

export function calculateSubscriberConversionRate(hype: number, baseRate: number = 0.01): number {
  if (hype >= 90) return baseRate * 3.0;
  if (hype >= 75) return baseRate * 2.5;
  if (hype >= 60) return baseRate * 2.0;
  if (hype >= 45) return baseRate * 1.5;
  if (hype >= 30) return baseRate * 1.2;
  if (hype >= 15) return baseRate * 1.0;
  return baseRate * 0.5;
}

export function getHypeLevel(hype: number): { label: string; color: string; emoji: string } {
  if (hype >= 90) return { label: 'INSANE', color: '#ff00ff', emoji: '🔥' };
  if (hype >= 75) return { label: 'HYPE', color: '#ff4444', emoji: '⚡' };
  if (hype >= 60) return { label: 'Excited', color: '#ff8800', emoji: '🎉' };
  if (hype >= 45) return { label: 'Engaged', color: '#ffcc00', emoji: '😊' };
  if (hype >= 30) return { label: 'Chill', color: '#88cc44', emoji: '👍' };
  if (hype >= 15) return { label: 'Quiet', color: '#6688aa', emoji: '😐' };
  return { label: 'Dead', color: '#666666', emoji: '💤' };
}

export function shouldTriggerHypeMessage(hype: number): boolean {
  return Math.random() < (hype / 100) * HYPE_CONFIG.hypeMessageThreshold;
}
