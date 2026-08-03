import { EquipmentCategory, StaffRole } from '../types';

export interface MilestoneReward {
  type: 'money' | 'equipment_unlock' | 'staff_unlock' | 'niche_unlock' | 'reputation';
  value: number | string;
  description: string;
}

export interface SubscriberMilestone {
  id: string;
  threshold: number;
  name: string;
  icon: string;
  description: string;
  rewards: MilestoneReward[];
  celebrationColor: string;
}

export const SUBSCRIBER_MILESTONES: SubscriberMilestone[] = [
  {
    id: 'milestone_100',
    threshold: 100,
    name: 'First Hundred',
    icon: '🌟',
    description: 'You reached 100 subscribers!',
    rewards: [
      { type: 'money', value: 100, description: 'Bonus: $100' },
      { type: 'reputation', value: 5, description: '+5 Reputation' },
    ],
    celebrationColor: '#8B5CF6',
  },
  {
    id: 'milestone_1k',
    threshold: 1000,
    name: 'Rising Star',
    icon: '⭐',
    description: 'You reached 1,000 subscribers!',
    rewards: [
      { type: 'money', value: 500, description: 'Bonus: $500' },
      { type: 'equipment_unlock', value: EquipmentCategory.Lighting, description: 'Unlock Pro Lighting' },
      { type: 'reputation', value: 10, description: '+10 Reputation' },
    ],
    celebrationColor: '#F59E0B',
  },
  {
    id: 'milestone_10k',
    threshold: 10000,
    name: 'Established Creator',
    icon: '🏆',
    description: 'You reached 10,000 subscribers!',
    rewards: [
      { type: 'money', value: 2500, description: 'Bonus: $2,500' },
      { type: 'staff_unlock', value: StaffRole.Manager, description: 'Unlock Manager Hires' },
      { type: 'reputation', value: 15, description: '+15 Reputation' },
    ],
    celebrationColor: '#10B981',
  },
  {
    id: 'milestone_100k',
    threshold: 100000,
    name: 'Internet Celebrity',
    icon: '💎',
    description: 'You reached 100,000 subscribers!',
    rewards: [
      { type: 'money', value: 10000, description: 'Bonus: $10,000' },
      { type: 'equipment_unlock', value: EquipmentCategory.PC, description: 'Unlock Elite PC Setup' },
      { type: 'niche_unlock', value: 'all', description: 'All Niches Unlocked' },
      { type: 'reputation', value: 20, description: '+20 Reputation' },
    ],
    celebrationColor: '#EC4899',
  },
  {
    id: 'milestone_1m',
    threshold: 1000000,
    name: 'Streaming Legend',
    icon: '👑',
    description: 'You reached 1,000,000 subscribers!',
    rewards: [
      { type: 'money', value: 50000, description: 'Bonus: $50,000' },
      { type: 'reputation', value: 25, description: '+25 Reputation' },
    ],
    celebrationColor: '#EF4444',
  },
];

export function getNextMilestone(currentSubscribers: number): SubscriberMilestone | null {
  return SUBSCRIBER_MILESTONES.find((m) => m.threshold > currentSubscribers) ?? null;
}

export function getMilestoneProgress(currentSubscribers: number): {
  current: number;
  target: number;
  percentage: number;
  milestone: SubscriberMilestone | null;
  previousThreshold: number;
} {
  const nextMilestone = getNextMilestone(currentSubscribers);

  if (!nextMilestone) {
    return {
      current: currentSubscribers,
      target: currentSubscribers,
      percentage: 100,
      milestone: null,
      previousThreshold: SUBSCRIBER_MILESTONES[SUBSCRIBER_MILESTONES.length - 1]?.threshold ?? 0,
    };
  }

  const milestoneIndex = SUBSCRIBER_MILESTONES.indexOf(nextMilestone);
  const previousThreshold = milestoneIndex > 0 ? SUBSCRIBER_MILESTONES[milestoneIndex - 1].threshold : 0;
  const progressInRange = currentSubscribers - previousThreshold;
  const rangeSize = nextMilestone.threshold - previousThreshold;
  const percentage = Math.min(100, Math.floor((progressInRange / rangeSize) * 100));

  return {
    current: currentSubscribers,
    target: nextMilestone.threshold,
    percentage,
    milestone: nextMilestone,
    previousThreshold,
  };
}

export function getAchievedMilestones(currentSubscribers: number): SubscriberMilestone[] {
  return SUBSCRIBER_MILESTONES.filter((m) => currentSubscribers >= m.threshold);
}

export function checkNewMilestone(
  previousSubscribers: number,
  currentSubscribers: number
): SubscriberMilestone | null {
  const newlyReached = SUBSCRIBER_MILESTONES.find(
    (m) => previousSubscribers < m.threshold && currentSubscribers >= m.threshold
  );
  return newlyReached ?? null;
}

export function formatSubscriberCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}
