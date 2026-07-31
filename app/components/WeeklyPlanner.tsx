'use client';

import { useState, useCallback } from 'react';
import { useGameStore, GameStore } from '../store/gameStore';
import { ContentNiche, StreamScheduleSlot } from '../types';
import {
  DAYS_OF_WEEK,
  TIME_SLOTS,
  getExpectedViewership,
  getViewershipLevel,
  MIN_SLOTS_PER_WEEK,
  MAX_SLOTS_PER_WEEK,
  DEFAULT_STREAM_DURATION,
} from '../data/schedule';

interface WeeklyPlannerProps {
  onClose: () => void;
}

const NICHE_INFO: Record<ContentNiche, { name: string; icon: string; color: string }> = {
  [ContentNiche.Gaming]: { name: 'Gaming', icon: '🎮', color: 'bg-purple-500' },
  [ContentNiche.Cooking]: { name: 'Cooking', icon: '🍳', color: 'bg-orange-500' },
  [ContentNiche.Music]: { name: 'Music', icon: '🎵', color: 'bg-pink-500' },
  [ContentNiche.IRL]: { name: 'IRL', icon: '📹', color: 'bg-blue-500' },
};

const VIEWERSHIP_COLORS: Record<string, string> = {
  low: 'bg-zinc-700',
  medium: 'bg-yellow-600',
  high: 'bg-green-600',
  peak: 'bg-purple-600',
};

interface SelectedSlot {
  dayOfWeek: number;
  hour: number;
  niche: ContentNiche;
}

export default function WeeklyPlanner({ onClose }: WeeklyPlannerProps) {
  const player = useGameStore((state: GameStore) => state.player);
  const setSchedule = useGameStore((state: GameStore) => state.setSchedule);
  const advancePhase = useGameStore((state: GameStore) => state.advancePhase);

  const existingSchedule = player.channel.schedule;
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>(
    existingSchedule.map((slot) => ({
      dayOfWeek: slot.dayOfWeek,
      hour: slot.startHour,
      niche: slot.niche,
    }))
  );
  const [selectedNiche, setSelectedNiche] = useState<ContentNiche>(player.channel.niche);

  const getSlotSelection = useCallback(
    (dayOfWeek: number, hour: number) =>
      selectedSlots.find((s) => s.dayOfWeek === dayOfWeek && s.hour === hour),
    [selectedSlots]
  );

  const handleSlotClick = (dayOfWeek: number, hour: number) => {
    const existing = getSlotSelection(dayOfWeek, hour);

    if (existing) {
      setSelectedSlots((prev) =>
        prev.filter((s) => !(s.dayOfWeek === dayOfWeek && s.hour === hour))
      );
    } else if (selectedSlots.length < MAX_SLOTS_PER_WEEK) {
      setSelectedSlots((prev) => [...prev, { dayOfWeek, hour, niche: selectedNiche }]);
    }
  };

  const handleConfirm = () => {
    const schedule: StreamScheduleSlot[] = selectedSlots.map((slot) => ({
      dayOfWeek: slot.dayOfWeek,
      startHour: slot.hour,
      duration: DEFAULT_STREAM_DURATION,
      niche: slot.niche,
    }));
    setSchedule(schedule);
    advancePhase();
    onClose();
  };

  const totalExpectedViewers = selectedSlots.reduce((sum, slot) => {
    return sum + getExpectedViewership(slot.dayOfWeek, slot.hour, slot.niche);
  }, 0);

  const canConfirm = selectedSlots.length >= MIN_SLOTS_PER_WEEK;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-zinc-700 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Weekly Schedule</h2>
              <p className="text-zinc-400 mt-1">
                Week {player.currentWeek} · Plan {MIN_SLOTS_PER_WEEK}-{MAX_SLOTS_PER_WEEK} streams
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 border-b border-zinc-700 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400">Content Type:</span>
              <div className="flex gap-2">
                {Object.entries(NICHE_INFO).map(([niche, info]) => (
                  <button
                    key={niche}
                    onClick={() => setSelectedNiche(niche as ContentNiche)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                      selectedNiche === niche
                        ? `${info.color} text-white`
                        : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                    }`}
                  >
                    <span>{info.icon}</span>
                    <span>{info.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-zinc-400">
                Slots: <span className={selectedSlots.length >= MIN_SLOTS_PER_WEEK ? 'text-green-400' : 'text-yellow-400'}>
                  {selectedSlots.length}/{MAX_SLOTS_PER_WEEK}
                </span>
              </span>
              <span className="text-zinc-400">
                Est. Viewers: <span className="text-purple-400">{totalExpectedViewers}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-8 gap-1">
            <div className="p-2" />
            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-semibold text-zinc-300">
                {day.slice(0, 3)}
              </div>
            ))}

            {TIME_SLOTS.map(({ hour, label }) => (
              <div key={`row-${hour}`} className="contents">
                <div className="p-2 text-right text-xs text-zinc-500 flex items-center justify-end">
                  {label.split(' ')[0]}
                </div>
                {DAYS_OF_WEEK.map((_, dayIndex) => {
                  const selection = getSlotSelection(dayIndex, hour);
                  const viewership = getExpectedViewership(dayIndex, hour, selectedNiche);
                  const level = getViewershipLevel(viewership);

                  return (
                    <TimeSlotCell
                      key={`${dayIndex}-${hour}`}
                      dayOfWeek={dayIndex}
                      hour={hour}
                      viewership={viewership}
                      level={level}
                      selection={selection}
                      disabled={!selection && selectedSlots.length >= MAX_SLOTS_PER_WEEK}
                      onClick={() => handleSlotClick(dayIndex, hour)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-zinc-700 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-xs">
              <span className="text-zinc-400">Viewership:</span>
              <div className="flex items-center gap-3">
                <ViewershipLegend level="low" label="Low" />
                <ViewershipLegend level="medium" label="Medium" />
                <ViewershipLegend level="high" label="High" />
                <ViewershipLegend level="peak" label="Peak" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-700 rounded-lg hover:bg-zinc-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!canConfirm}
                className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
                  canConfirm
                    ? 'bg-purple-600 text-white hover:bg-purple-500'
                    : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                }`}
              >
                Confirm Schedule ({selectedSlots.length} streams)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TimeSlotCellProps {
  dayOfWeek: number;
  hour: number;
  viewership: number;
  level: 'low' | 'medium' | 'high' | 'peak';
  selection: SelectedSlot | undefined;
  disabled: boolean;
  onClick: () => void;
}

function TimeSlotCell({
  viewership,
  level,
  selection,
  disabled,
  onClick,
}: TimeSlotCellProps) {
  const baseColor = VIEWERSHIP_COLORS[level];

  if (selection) {
    const nicheInfo = NICHE_INFO[selection.niche];
    return (
      <button
        onClick={onClick}
        className={`p-2 rounded-lg ${nicheInfo.color} border-2 border-white/50 transition-all hover:scale-105 flex flex-col items-center justify-center min-h-[60px]`}
      >
        <span className="text-lg">{nicheInfo.icon}</span>
        <span className="text-xs text-white/80 mt-0.5">{viewership}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-lg ${baseColor} transition-all flex flex-col items-center justify-center min-h-[60px] ${
        disabled
          ? 'opacity-40 cursor-not-allowed'
          : 'hover:ring-2 hover:ring-purple-400 hover:scale-105 cursor-pointer'
      }`}
    >
      <span className="text-xs text-white/70">{viewership}</span>
    </button>
  );
}

interface ViewershipLegendProps {
  level: string;
  label: string;
}

function ViewershipLegend({ level, label }: ViewershipLegendProps) {
  return (
    <div className="flex items-center gap-1">
      <span className={`w-3 h-3 rounded ${VIEWERSHIP_COLORS[level]}`} />
      <span className="text-zinc-500">{label}</span>
    </div>
  );
}
