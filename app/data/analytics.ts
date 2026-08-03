import { StreamSession, Analytics, ContentNiche, RevenueBreakdown } from '../types';
import { DAYS_OF_WEEK } from './schedule';

export interface WeeklyStreamStats {
  streamId: string;
  dayOfWeek: number;
  dayName: string;
  hour: number;
  peakViewers: number;
  averageViewers: number;
  newSubscribers: number;
  revenue: number;
  niche: ContentNiche;
}

export interface DayPerformance {
  dayOfWeek: number;
  dayName: string;
  totalViewers: number;
  streamCount: number;
  averageViewers: number;
}

export interface AnalyticsInsight {
  type: 'positive' | 'negative' | 'neutral';
  icon: string;
  title: string;
  description: string;
}

export interface WeeklyAnalytics {
  weekNumber: number;
  totalStreams: number;
  totalViewers: number;
  averageViewers: number;
  peakViewers: number;
  totalSubscribers: number;
  totalRevenue: number;
  revenueBreakdown: RevenueBreakdown;
  streamStats: WeeklyStreamStats[];
  dayPerformance: DayPerformance[];
  insights: AnalyticsInsight[];
  bestDay: DayPerformance | null;
  worstDay: DayPerformance | null;
  viewerTrend: number[];
  subscriberTrend: number[];
  revenueTrend: number[];
}

export function calculateWeeklyAnalytics(
  streamHistory: StreamSession[],
  currentWeek: number,
  overallAnalytics: Analytics
): WeeklyAnalytics {
  const weekStreams = streamHistory.slice(-7);

  const streamStats: WeeklyStreamStats[] = weekStreams.map((stream, index) => {
    const dayOfWeek = index % 7;
    const startDate = new Date(stream.startTime);
    return {
      streamId: stream.id,
      dayOfWeek,
      dayName: DAYS_OF_WEEK[dayOfWeek],
      hour: startDate.getHours() || 18,
      peakViewers: stream.peakViewers,
      averageViewers: stream.averageViewers,
      newSubscribers: stream.newSubscribers,
      revenue: stream.donations,
      niche: stream.niche,
    };
  });

  const dayMap = new Map<number, { totalViewers: number; streamCount: number }>();
  for (let i = 0; i < 7; i++) {
    dayMap.set(i, { totalViewers: 0, streamCount: 0 });
  }

  streamStats.forEach((stat) => {
    const dayData = dayMap.get(stat.dayOfWeek)!;
    dayData.totalViewers += stat.averageViewers;
    dayData.streamCount += 1;
  });

  const dayPerformance: DayPerformance[] = Array.from(dayMap.entries()).map(
    ([dayOfWeek, data]) => ({
      dayOfWeek,
      dayName: DAYS_OF_WEEK[dayOfWeek],
      totalViewers: data.totalViewers,
      streamCount: data.streamCount,
      averageViewers: data.streamCount > 0 ? Math.round(data.totalViewers / data.streamCount) : 0,
    })
  );

  const daysWithStreams = dayPerformance.filter((d) => d.streamCount > 0);
  const bestDay = daysWithStreams.length > 0
    ? daysWithStreams.reduce((best, day) => day.averageViewers > best.averageViewers ? day : best)
    : null;
  const worstDay = daysWithStreams.length > 0
    ? daysWithStreams.reduce((worst, day) => day.averageViewers < worst.averageViewers ? day : worst)
    : null;

  const totalViewers = streamStats.reduce((sum, s) => sum + s.averageViewers, 0);
  const totalRevenue = streamStats.reduce((sum, s) => sum + s.revenue, 0);
  const totalSubscribers = streamStats.reduce((sum, s) => sum + s.newSubscribers, 0);
  const peakViewers = streamStats.length > 0 ? Math.max(...streamStats.map((s) => s.peakViewers)) : 0;

  const viewerTrend = streamStats.map((s) => s.averageViewers);
  const subscriberTrend = streamStats.map((s) => s.newSubscribers);
  const revenueTrend = streamStats.map((s) => s.revenue);

  const insights = generateInsights(streamStats, dayPerformance, bestDay, worstDay, overallAnalytics);

  return {
    weekNumber: currentWeek,
    totalStreams: streamStats.length,
    totalViewers,
    averageViewers: streamStats.length > 0 ? Math.round(totalViewers / streamStats.length) : 0,
    peakViewers,
    totalSubscribers,
    totalRevenue,
    revenueBreakdown: overallAnalytics.revenueBySource,
    streamStats,
    dayPerformance,
    insights,
    bestDay,
    worstDay,
    viewerTrend,
    subscriberTrend,
    revenueTrend,
  };
}

function generateInsights(
  streamStats: WeeklyStreamStats[],
  dayPerformance: DayPerformance[],
  bestDay: DayPerformance | null,
  worstDay: DayPerformance | null,
  overallAnalytics: Analytics
): AnalyticsInsight[] {
  const insights: AnalyticsInsight[] = [];

  if (bestDay && worstDay && bestDay.dayOfWeek !== worstDay.dayOfWeek) {
    const improvement = bestDay.averageViewers - worstDay.averageViewers;
    const percentBetter = worstDay.averageViewers > 0
      ? Math.round((improvement / worstDay.averageViewers) * 100)
      : 100;

    if (percentBetter >= 15) {
      insights.push({
        type: 'positive',
        icon: '📈',
        title: `${bestDay.dayName} streams perform ${percentBetter}% better`,
        description: `Consider scheduling more streams on ${bestDay.dayName}s for better results.`,
      });
    }
  }

  const fridayPerf = dayPerformance.find((d) => d.dayOfWeek === 4);
  const saturdayPerf = dayPerformance.find((d) => d.dayOfWeek === 5);
  const averageWeekday = dayPerformance
    .filter((d) => d.dayOfWeek < 4 && d.streamCount > 0)
    .reduce((sum, d, _, arr) => sum + d.averageViewers / arr.length, 0);

  if (fridayPerf && fridayPerf.streamCount > 0 && averageWeekday > 0) {
    const fridayBoost = Math.round(((fridayPerf.averageViewers - averageWeekday) / averageWeekday) * 100);
    if (fridayBoost >= 15) {
      insights.push({
        type: 'positive',
        icon: '🎉',
        title: `Friday streams perform ${fridayBoost}% better`,
        description: 'Weekend audiences are more engaged! Keep Friday streams in your schedule.',
      });
    }
  }

  if (saturdayPerf && saturdayPerf.streamCount > 0 && averageWeekday > 0) {
    const saturdayBoost = Math.round(((saturdayPerf.averageViewers - averageWeekday) / averageWeekday) * 100);
    if (saturdayBoost >= 20) {
      insights.push({
        type: 'positive',
        icon: '🌟',
        title: `Saturday is your best day (+${saturdayBoost}%)`,
        description: 'Saturday streams attract more viewers. Maximize this slot!',
      });
    }
  }

  if (streamStats.length > 1) {
    const firstHalfAvg = streamStats
      .slice(0, Math.floor(streamStats.length / 2))
      .reduce((sum, s) => sum + s.averageViewers, 0) / Math.floor(streamStats.length / 2);
    const secondHalfAvg = streamStats
      .slice(Math.floor(streamStats.length / 2))
      .reduce((sum, s) => sum + s.averageViewers, 0) / Math.ceil(streamStats.length / 2);

    if (secondHalfAvg > firstHalfAvg * 1.1) {
      insights.push({
        type: 'positive',
        icon: '🚀',
        title: 'Viewer growth trending up!',
        description: 'Your recent streams are outperforming earlier ones. Keep up the momentum!',
      });
    } else if (secondHalfAvg < firstHalfAvg * 0.9) {
      insights.push({
        type: 'negative',
        icon: '⚠️',
        title: 'Viewership declining',
        description: 'Recent streams have fewer viewers. Consider varying your content or schedule.',
      });
    }
  }

  const eveningStreams = streamStats.filter((s) => s.hour >= 18 && s.hour <= 22);
  const otherStreams = streamStats.filter((s) => s.hour < 18 || s.hour > 22);
  if (eveningStreams.length > 0 && otherStreams.length > 0) {
    const eveningAvg = eveningStreams.reduce((sum, s) => sum + s.averageViewers, 0) / eveningStreams.length;
    const otherAvg = otherStreams.reduce((sum, s) => sum + s.averageViewers, 0) / otherStreams.length;
    const eveningBoost = Math.round(((eveningAvg - otherAvg) / otherAvg) * 100);

    if (eveningBoost >= 20) {
      insights.push({
        type: 'positive',
        icon: '🌙',
        title: `Evening streams perform ${eveningBoost}% better`,
        description: 'Your audience is most active during evening hours (6-10 PM).',
      });
    }
  }

  if (overallAnalytics.totalStreams >= 5) {
    const growthRate = overallAnalytics.subscriberGrowthRate;
    if (growthRate > 10) {
      insights.push({
        type: 'positive',
        icon: '⭐',
        title: 'Strong subscriber growth!',
        description: `Gained ${growthRate} new subscribers this period. Your community is growing!`,
      });
    }
  }

  if (insights.length === 0) {
    insights.push({
      type: 'neutral',
      icon: '💡',
      title: 'Keep streaming to unlock insights',
      description: 'Stream more often to see patterns in your performance data.',
    });
  }

  return insights.slice(0, 4);
}

export function formatCompactNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function calculatePercentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}
