import { Equipment, Staff, StreamSession, ContentNiche, StaffRole } from '../types';
import { calculateTotalQualityBonus } from './equipment';
import { getStaffEffectValue, getAverageSkillByRole } from './staff';

export interface StreamResults {
  streamId: string;
  title: string;
  niche: ContentNiche;
  duration: number;
  peakViewers: number;
  averageViewers: number;
  newSubscribers: number;
  donationRevenue: number;
  adRevenue: number;
  totalRevenue: number;
  chatHealthScore: number;
  performanceRating: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  experienceGained: number;
  bonuses: StreamBonus[];
}

export interface StreamBonus {
  name: string;
  description: string;
  value: number;
  type: 'revenue' | 'subscribers' | 'experience';
}

export interface StreamPerformanceInput {
  session: StreamSession;
  equipment: Equipment[];
  staff: Staff[];
  currentViewers: number;
  peakViewers: number;
  chatHealth: number;
  hype: number;
  newSubs: number;
  elapsedSeconds: number;
}

export function calculateStreamResults(input: StreamPerformanceInput): StreamResults {
  const {
    session,
    equipment,
    staff,
    currentViewers,
    peakViewers,
    chatHealth,
    hype,
    newSubs,
    elapsedSeconds,
  } = input;

  const qualityBonus = calculateTotalQualityBonus(equipment);
  const qualityMultiplier = 1 + qualityBonus / 100;

  const managerPayoutBonus = getStaffEffectValue(staff, 'brandDealPayoutBonus');
  const editorEngagementBonus = getStaffEffectValue(staff, 'engagementBonus');
  const modRetentionBonus = getStaffEffectValue(staff, 'subscriberRetentionBonus');

  const baseDonations = Math.floor(peakViewers * 0.02 * (hype / 50));
  const donationRevenue = Math.round(baseDonations * qualityMultiplier * (1 + editorEngagementBonus));

  const streamMinutes = Math.floor(elapsedSeconds / 60);
  const baseAdRevenue = Math.floor(streamMinutes * 0.5 * (peakViewers / 50));
  const adRevenue = Math.round(baseAdRevenue * (1 + managerPayoutBonus));

  const totalRevenue = donationRevenue + adRevenue;

  const avgViewers = Math.floor((currentViewers + peakViewers) / 2);

  const bonuses: StreamBonus[] = [];

  if (chatHealth >= 90) {
    bonuses.push({
      name: 'Healthy Chat',
      description: 'Chat health stayed above 90%',
      value: Math.floor(totalRevenue * 0.1),
      type: 'revenue',
    });
  }

  if (hype >= 80) {
    bonuses.push({
      name: 'Hype Train',
      description: 'Peak hype reached 80%+',
      value: Math.ceil(newSubs * 0.2),
      type: 'subscribers',
    });
  }

  if (elapsedSeconds >= 3600) {
    bonuses.push({
      name: 'Marathon Stream',
      description: 'Streamed for over an hour',
      value: 50,
      type: 'experience',
    });
  }

  if (peakViewers >= 100) {
    bonuses.push({
      name: 'Crowd Pleaser',
      description: 'Hit 100+ peak viewers',
      value: 25,
      type: 'experience',
    });
  }

  const modSkill = getAverageSkillByRole(staff, StaffRole.Moderator);
  const adjustedChatHealth = Math.min(100, chatHealth + modSkill * modRetentionBonus * 10);
  const chatHealthScore = Math.round(adjustedChatHealth);

  const revenueBonus = bonuses
    .filter(b => b.type === 'revenue')
    .reduce((sum, b) => sum + b.value, 0);
  const subBonus = bonuses
    .filter(b => b.type === 'subscribers')
    .reduce((sum, b) => sum + b.value, 0);
  const expBonus = bonuses
    .filter(b => b.type === 'experience')
    .reduce((sum, b) => sum + b.value, 0);

  const finalRevenue = totalRevenue + revenueBonus;
  const finalNewSubs = newSubs + subBonus;

  const performanceScore =
    (chatHealthScore / 100) * 25 +
    (hype / 100) * 25 +
    Math.min(peakViewers / 200, 1) * 25 +
    Math.min(finalRevenue / 100, 1) * 25;

  let performanceRating: StreamResults['performanceRating'];
  if (performanceScore >= 90) performanceRating = 'S';
  else if (performanceScore >= 75) performanceRating = 'A';
  else if (performanceScore >= 60) performanceRating = 'B';
  else if (performanceScore >= 45) performanceRating = 'C';
  else if (performanceScore >= 30) performanceRating = 'D';
  else performanceRating = 'F';

  const baseExperience = Math.floor(elapsedSeconds / 30) + Math.floor(finalNewSubs * 5) + Math.floor(finalRevenue / 10);
  const experienceGained = baseExperience + expBonus;

  return {
    streamId: session.id,
    title: session.title,
    niche: session.niche,
    duration: elapsedSeconds,
    peakViewers,
    averageViewers: avgViewers,
    newSubscribers: finalNewSubs,
    donationRevenue,
    adRevenue,
    totalRevenue: finalRevenue,
    chatHealthScore,
    performanceRating,
    experienceGained,
    bonuses,
  };
}

export function formatStreamDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

export function getPerformanceColor(rating: StreamResults['performanceRating']): string {
  switch (rating) {
    case 'S': return 'text-yellow-400';
    case 'A': return 'text-green-400';
    case 'B': return 'text-blue-400';
    case 'C': return 'text-zinc-300';
    case 'D': return 'text-orange-400';
    case 'F': return 'text-red-400';
  }
}

export function getPerformanceDescription(rating: StreamResults['performanceRating']): string {
  switch (rating) {
    case 'S': return 'Legendary stream!';
    case 'A': return 'Excellent performance!';
    case 'B': return 'Good stream overall';
    case 'C': return 'Average performance';
    case 'D': return 'Needs improvement';
    case 'F': return 'Rough stream...';
  }
}
