'use client';

import { useMemo } from 'react';
import { useGameStore, GameStore } from '../store/gameStore';
import {
  calculateWeeklyAnalytics,
  WeeklyAnalytics,
  AnalyticsInsight,
  formatCompactNumber,
} from '../data/analytics';

interface MiniLineChartProps {
  data: number[];
  color: string;
  height?: number;
  width?: number;
}

function MiniLineChart({ data, color, height = 60, width = 200 }: MiniLineChartProps) {
  if (data.length === 0) {
    return (
      <div style={{ width, height }} className="flex items-center justify-center text-zinc-500 text-xs">
        No data
      </div>
    );
  }

  const maxVal = Math.max(...data, 1);
  const minVal = Math.min(...data, 0);
  const range = maxVal - minVal || 1;
  const padding = 4;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = data.map((val, i) => {
    const x = padding + (i / Math.max(data.length - 1, 1)) * chartWidth;
    const y = padding + chartHeight - ((val - minVal) / range) * chartHeight;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `${pathD} L ${padding + chartWidth},${padding + chartHeight} L ${padding},${padding + chartHeight} Z`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#gradient-${color})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((val, i) => {
        const x = padding + (i / Math.max(data.length - 1, 1)) * chartWidth;
        const y = padding + chartHeight - ((val - minVal) / range) * chartHeight;
        return <circle key={i} cx={x} cy={y} r="3" fill={color} />;
      })}
    </svg>
  );
}

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  width?: number;
}

function BarChart({ data, height = 120, width = 280 }: BarChartProps) {
  if (data.length === 0) {
    return (
      <div style={{ width, height }} className="flex items-center justify-center text-zinc-500 text-xs">
        No data
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const barWidth = (width - 20) / data.length - 4;
  const chartHeight = height - 30;

  return (
    <svg width={width} height={height}>
      {data.map((item, i) => {
        const barHeight = (item.value / maxVal) * chartHeight;
        const x = 10 + i * (barWidth + 4);
        const y = chartHeight - barHeight;
        const color = item.color || '#a855f7';

        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={color}
              rx="2"
              className="transition-all duration-300"
            />
            <text
              x={x + barWidth / 2}
              y={chartHeight + 12}
              textAnchor="middle"
              fill="#71717a"
              fontSize="9"
            >
              {item.label.slice(0, 3)}
            </text>
            <text
              x={x + barWidth / 2}
              y={y - 4}
              textAnchor="middle"
              fill="#a1a1aa"
              fontSize="9"
            >
              {formatCompactNumber(item.value)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

interface RevenueDonutProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
}

function RevenueDonut({ data, size = 100 }: RevenueDonutProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) {
    return (
      <div style={{ width: size, height: size }} className="flex items-center justify-center text-zinc-500 text-xs">
        $0
      </div>
    );
  }

  const radius = (size - 20) / 2;
  const center = size / 2;
  const strokeWidth = 12;

  let currentAngle = -90;
  const segments = data.map((item) => {
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = ((startAngle + angle) * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    return {
      ...item,
      path: `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`,
    };
  });

  return (
    <svg width={size} height={size}>
      {segments.map((seg, i) => (
        <path key={i} d={seg.path} fill={seg.color} className="transition-all duration-300" />
      ))}
      <circle cx={center} cy={center} r={radius - strokeWidth} fill="#27272a" />
      <text x={center} y={center - 4} textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">
        ${formatCompactNumber(total)}
      </text>
      <text x={center} y={center + 10} textAnchor="middle" fill="#71717a" fontSize="9">
        Total
      </text>
    </svg>
  );
}

interface InsightCardProps {
  insight: AnalyticsInsight;
}

function InsightCard({ insight }: InsightCardProps) {
  const bgColor = insight.type === 'positive'
    ? 'bg-green-900/20 border-green-800/50'
    : insight.type === 'negative'
      ? 'bg-red-900/20 border-red-800/50'
      : 'bg-zinc-800 border-zinc-700';

  return (
    <div className={`p-3 rounded-lg border ${bgColor}`}>
      <div className="flex items-start gap-2">
        <span className="text-lg">{insight.icon}</span>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-white truncate">{insight.title}</h4>
          <p className="text-xs text-zinc-400 mt-0.5">{insight.description}</p>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: number;
  color?: string;
}

function StatCard({ label, value, icon, trend, color = 'text-white' }: StatCardProps) {
  return (
    <div className="bg-zinc-800 rounded-lg p-3 border border-zinc-700">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm">{icon}</span>
        <span className="text-xs text-zinc-500">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <span className={`text-lg font-bold ${color}`}>{value}</span>
        {trend !== undefined && (
          <span className={`text-xs ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
}

interface AnalyticsDashboardProps {
  onContinue: () => void;
}

export default function AnalyticsDashboard({ onContinue }: AnalyticsDashboardProps) {
  const streamHistory = useGameStore((state: GameStore) => state.player.channel.streamHistory);
  const analytics = useGameStore((state: GameStore) => state.player.channel.analytics);
  const currentWeek = useGameStore((state: GameStore) => state.player.currentWeek);
  const subscribers = useGameStore((state: GameStore) => state.player.channel.subscribers);

  const weeklyData: WeeklyAnalytics = useMemo(
    () => calculateWeeklyAnalytics(streamHistory, currentWeek, analytics),
    [streamHistory, currentWeek, analytics]
  );

  const revenueData = useMemo(() => [
    { label: 'Donations', value: weeklyData.revenueBreakdown.donations, color: '#22c55e' },
    { label: 'Ads', value: weeklyData.revenueBreakdown.adRevenue, color: '#3b82f6' },
    { label: 'Subs', value: weeklyData.revenueBreakdown.subscriptions, color: '#a855f7' },
    { label: 'Brands', value: weeklyData.revenueBreakdown.brandDeals, color: '#f59e0b' },
  ].filter((d) => d.value > 0), [weeklyData]);

  const dayBarData = useMemo(() =>
    weeklyData.dayPerformance
      .filter((d) => d.streamCount > 0)
      .map((d) => ({
        label: d.dayName,
        value: d.averageViewers,
        color: d === weeklyData.bestDay ? '#22c55e' : '#a855f7',
      })),
    [weeklyData]
  );

  return (
    <div className="space-y-3">
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">📊</span>
              <div>
                <h2 className="text-white font-bold text-sm">Week {currentWeek} Analytics</h2>
                <p className="text-white/70 text-xs">Performance Review</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-white/70 text-xs block">Streams</span>
              <span className="text-white font-mono text-sm">{weeklyData.totalStreams}</span>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <StatCard
              label="Peak Viewers"
              value={formatCompactNumber(weeklyData.peakViewers)}
              icon="👁️"
              color="text-purple-400"
            />
            <StatCard
              label="Avg Viewers"
              value={formatCompactNumber(weeklyData.averageViewers)}
              icon="📊"
              color="text-zinc-300"
            />
            <StatCard
              label="New Subs"
              value={`+${formatCompactNumber(weeklyData.totalSubscribers)}`}
              icon="⭐"
              color="text-yellow-400"
            />
            <StatCard
              label="Total Subs"
              value={formatCompactNumber(subscribers)}
              icon="👥"
              color="text-blue-400"
            />
          </div>

          {weeklyData.viewerTrend.length > 1 && (
            <div className="bg-zinc-900 rounded-lg p-3">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Viewer Trend
              </h3>
              <div className="flex justify-center">
                <MiniLineChart data={weeklyData.viewerTrend} color="#a855f7" width={220} height={60} />
              </div>
            </div>
          )}

          {dayBarData.length > 0 && (
            <div className="bg-zinc-900 rounded-lg p-3">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Viewers by Day
              </h3>
              <div className="flex justify-center">
                <BarChart data={dayBarData} width={240} height={100} />
              </div>
            </div>
          )}

          <div className="bg-zinc-900 rounded-lg p-3">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Revenue Breakdown
            </h3>
            <div className="flex items-center gap-4">
              <RevenueDonut data={revenueData} size={80} />
              <div className="flex-1 space-y-1">
                {revenueData.map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-zinc-400">{item.label}</span>
                    </div>
                    <span className="text-zinc-300">${formatCompactNumber(item.value)}</span>
                  </div>
                ))}
                {revenueData.length === 0 && (
                  <p className="text-zinc-500 text-xs">No revenue this week</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Insights
            </h3>
            {weeklyData.insights.map((insight, i) => (
              <InsightCard key={i} insight={insight} />
            ))}
          </div>

          {weeklyData.bestDay && (
            <div className="bg-green-900/20 border border-green-800/50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-green-400 font-medium">Best Performing Day</span>
                  <p className="text-white font-bold">{weeklyData.bestDay.dayName}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-zinc-400">Avg Viewers</span>
                  <p className="text-green-400 font-bold">{weeklyData.bestDay.averageViewers}</p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={onContinue}
            className="w-full px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all"
          >
            Start Week {currentWeek + 1} →
          </button>
        </div>
      </div>
    </div>
  );
}
