import { ContentNiche } from '../types';

export interface TimeSlot {
  dayOfWeek: number;
  hour: number;
  label: string;
}

export interface SlotPopularity {
  baseViewership: number;
  nicheMultipliers: Record<ContentNiche, number>;
}

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const TIME_SLOTS = [
  { hour: 9, label: 'Morning (9 AM)' },
  { hour: 12, label: 'Midday (12 PM)' },
  { hour: 15, label: 'Afternoon (3 PM)' },
  { hour: 18, label: 'Evening (6 PM)' },
  { hour: 21, label: 'Night (9 PM)' },
];

const SLOT_POPULARITY: Record<string, SlotPopularity> = {
  '0-9': { baseViewership: 40, nicheMultipliers: { gaming: 0.5, cooking: 1.2, music: 0.6, irl: 0.8 } },
  '0-12': { baseViewership: 50, nicheMultipliers: { gaming: 0.6, cooking: 1.4, music: 0.7, irl: 1.0 } },
  '0-15': { baseViewership: 60, nicheMultipliers: { gaming: 0.8, cooking: 1.0, music: 0.8, irl: 1.1 } },
  '0-18': { baseViewership: 80, nicheMultipliers: { gaming: 1.2, cooking: 0.9, music: 1.0, irl: 1.2 } },
  '0-21': { baseViewership: 100, nicheMultipliers: { gaming: 1.4, cooking: 0.6, music: 1.3, irl: 1.0 } },

  '1-9': { baseViewership: 35, nicheMultipliers: { gaming: 0.5, cooking: 1.1, music: 0.6, irl: 0.7 } },
  '1-12': { baseViewership: 45, nicheMultipliers: { gaming: 0.6, cooking: 1.3, music: 0.7, irl: 0.9 } },
  '1-15': { baseViewership: 55, nicheMultipliers: { gaming: 0.7, cooking: 1.0, music: 0.8, irl: 1.0 } },
  '1-18': { baseViewership: 75, nicheMultipliers: { gaming: 1.1, cooking: 0.9, music: 1.0, irl: 1.1 } },
  '1-21': { baseViewership: 95, nicheMultipliers: { gaming: 1.3, cooking: 0.6, music: 1.2, irl: 0.9 } },

  '2-9': { baseViewership: 35, nicheMultipliers: { gaming: 0.5, cooking: 1.1, music: 0.6, irl: 0.7 } },
  '2-12': { baseViewership: 45, nicheMultipliers: { gaming: 0.6, cooking: 1.3, music: 0.7, irl: 0.9 } },
  '2-15': { baseViewership: 55, nicheMultipliers: { gaming: 0.7, cooking: 1.0, music: 0.8, irl: 1.0 } },
  '2-18': { baseViewership: 75, nicheMultipliers: { gaming: 1.1, cooking: 0.9, music: 1.0, irl: 1.1 } },
  '2-21': { baseViewership: 95, nicheMultipliers: { gaming: 1.3, cooking: 0.6, music: 1.2, irl: 0.9 } },

  '3-9': { baseViewership: 40, nicheMultipliers: { gaming: 0.5, cooking: 1.2, music: 0.6, irl: 0.8 } },
  '3-12': { baseViewership: 50, nicheMultipliers: { gaming: 0.6, cooking: 1.4, music: 0.7, irl: 1.0 } },
  '3-15': { baseViewership: 60, nicheMultipliers: { gaming: 0.8, cooking: 1.0, music: 0.8, irl: 1.1 } },
  '3-18': { baseViewership: 85, nicheMultipliers: { gaming: 1.2, cooking: 0.9, music: 1.1, irl: 1.2 } },
  '3-21': { baseViewership: 105, nicheMultipliers: { gaming: 1.5, cooking: 0.6, music: 1.3, irl: 1.0 } },

  '4-9': { baseViewership: 30, nicheMultipliers: { gaming: 0.4, cooking: 1.0, music: 0.5, irl: 0.7 } },
  '4-12': { baseViewership: 40, nicheMultipliers: { gaming: 0.5, cooking: 1.2, music: 0.6, irl: 0.9 } },
  '4-15': { baseViewership: 55, nicheMultipliers: { gaming: 0.7, cooking: 0.9, music: 0.8, irl: 1.0 } },
  '4-18': { baseViewership: 90, nicheMultipliers: { gaming: 1.3, cooking: 0.8, music: 1.2, irl: 1.3 } },
  '4-21': { baseViewership: 120, nicheMultipliers: { gaming: 1.6, cooking: 0.5, music: 1.4, irl: 1.2 } },

  '5-9': { baseViewership: 60, nicheMultipliers: { gaming: 1.0, cooking: 1.3, music: 0.8, irl: 1.2 } },
  '5-12': { baseViewership: 80, nicheMultipliers: { gaming: 1.2, cooking: 1.5, music: 1.0, irl: 1.4 } },
  '5-15': { baseViewership: 100, nicheMultipliers: { gaming: 1.4, cooking: 1.2, music: 1.1, irl: 1.5 } },
  '5-18': { baseViewership: 110, nicheMultipliers: { gaming: 1.5, cooking: 1.0, music: 1.3, irl: 1.4 } },
  '5-21': { baseViewership: 130, nicheMultipliers: { gaming: 1.7, cooking: 0.7, music: 1.5, irl: 1.3 } },

  '6-9': { baseViewership: 55, nicheMultipliers: { gaming: 0.9, cooking: 1.4, music: 0.7, irl: 1.3 } },
  '6-12': { baseViewership: 75, nicheMultipliers: { gaming: 1.1, cooking: 1.6, music: 0.9, irl: 1.5 } },
  '6-15': { baseViewership: 90, nicheMultipliers: { gaming: 1.3, cooking: 1.3, music: 1.0, irl: 1.4 } },
  '6-18': { baseViewership: 100, nicheMultipliers: { gaming: 1.4, cooking: 1.1, music: 1.2, irl: 1.3 } },
  '6-21': { baseViewership: 110, nicheMultipliers: { gaming: 1.5, cooking: 0.8, music: 1.4, irl: 1.1 } },
};

export function getSlotKey(dayOfWeek: number, hour: number): string {
  return `${dayOfWeek}-${hour}`;
}

export function getSlotPopularity(dayOfWeek: number, hour: number): SlotPopularity {
  const key = getSlotKey(dayOfWeek, hour);
  return SLOT_POPULARITY[key] || {
    baseViewership: 50,
    nicheMultipliers: { gaming: 1, cooking: 1, music: 1, irl: 1 }
  };
}

export function getExpectedViewership(dayOfWeek: number, hour: number, niche: ContentNiche): number {
  const popularity = getSlotPopularity(dayOfWeek, hour);
  const multiplier = popularity.nicheMultipliers[niche];
  return Math.round(popularity.baseViewership * multiplier);
}

export function getViewershipLevel(viewership: number): 'low' | 'medium' | 'high' | 'peak' {
  if (viewership >= 100) return 'peak';
  if (viewership >= 70) return 'high';
  if (viewership >= 45) return 'medium';
  return 'low';
}

export const MIN_SLOTS_PER_WEEK = 3;
export const MAX_SLOTS_PER_WEEK = 5;
export const DEFAULT_STREAM_DURATION = 2;
