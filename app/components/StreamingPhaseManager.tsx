'use client';

import { useState, useCallback } from 'react';
import { useGameStore, GameStore } from '../store/gameStore';
import { StreamScheduleSlot } from '../types';
import GoLiveScreen from './GoLiveScreen';
import GoingLiveTransition from './GoingLiveTransition';
import LiveStreamView from './LiveStreamView';
import {
  DAYS_OF_WEEK,
  TIME_SLOTS,
} from '../data/schedule';

type StreamingState = 'select_slot' | 'pre_stream' | 'transition' | 'live';

interface StreamSlotSelectorProps {
  slots: StreamScheduleSlot[];
  onSelectSlot: (slot: StreamScheduleSlot) => void;
  onSkipStreaming: () => void;
}

function StreamSlotSelector({ slots, onSelectSlot, onSkipStreaming }: StreamSlotSelectorProps) {
  if (slots.length === 0) {
    return (
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 text-center">
        <p className="text-zinc-400 mb-4">No streams scheduled this week.</p>
        <button
          onClick={onSkipStreaming}
          className="px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-700 rounded-lg hover:bg-zinc-600 transition-colors"
        >
          Skip to Review
        </button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden">
      <div className="px-4 py-3 bg-zinc-700/50 border-b border-zinc-700">
        <h3 className="text-sm font-semibold text-white">Scheduled Streams</h3>
        <p className="text-xs text-zinc-400 mt-0.5">Select a stream slot to go live</p>
      </div>
      <div className="p-4 space-y-2">
        {slots.map((slot, index) => {
          const dayName = DAYS_OF_WEEK[slot.dayOfWeek];
          const timeSlot = TIME_SLOTS.find((t) => t.hour === slot.startHour);

          return (
            <button
              key={index}
              onClick={() => onSelectSlot(slot)}
              className="w-full flex items-center justify-between px-4 py-3 bg-zinc-700/50 rounded-lg hover:bg-zinc-700 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">
                  {slot.niche === 'gaming' && '🎮'}
                  {slot.niche === 'cooking' && '🍳'}
                  {slot.niche === 'music' && '🎵'}
                  {slot.niche === 'irl' && '📹'}
                </span>
                <div>
                  <p className="text-sm font-medium text-white">{dayName}</p>
                  <p className="text-xs text-zinc-400">{timeSlot?.label || `${slot.startHour}:00`}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">{slot.duration}h</span>
                <svg
                  className="w-4 h-4 text-zinc-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          );
        })}
      </div>
      <div className="px-4 py-3 border-t border-zinc-700">
        <button
          onClick={onSkipStreaming}
          className="w-full text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Skip to Review Phase →
        </button>
      </div>
    </div>
  );
}

export default function StreamingPhaseManager() {
  const schedule = useGameStore((state: GameStore) => state.player.channel.schedule);
  const activeStream = useGameStore((state: GameStore) => state.player.channel.activeStream);
  const startStream = useGameStore((state: GameStore) => state.startStream);
  const advancePhase = useGameStore((state: GameStore) => state.advancePhase);

  const [streamingState, setStreamingState] = useState<StreamingState>(
    activeStream ? 'live' : 'select_slot'
  );
  const [selectedSlot, setSelectedSlot] = useState<StreamScheduleSlot | null>(null);

  const handleSelectSlot = useCallback((slot: StreamScheduleSlot) => {
    setSelectedSlot(slot);
    setStreamingState('pre_stream');
  }, []);

  const handleStartStream = useCallback(() => {
    if (selectedSlot) {
      startStream(selectedSlot);
      setStreamingState('transition');
    }
  }, [selectedSlot, startStream]);

  const handleTransitionComplete = useCallback(() => {
    setStreamingState('live');
  }, []);

  const handleCancelPreStream = useCallback(() => {
    setSelectedSlot(null);
    setStreamingState('select_slot');
  }, []);

  const handleEndStream = useCallback(() => {
    setSelectedSlot(null);
    setStreamingState('select_slot');
  }, []);

  const handleSkipStreaming = useCallback(() => {
    advancePhase();
  }, [advancePhase]);

  if (streamingState === 'transition') {
    return <GoingLiveTransition onComplete={handleTransitionComplete} />;
  }

  if (streamingState === 'pre_stream' && selectedSlot) {
    return (
      <GoLiveScreen
        slot={selectedSlot}
        onStartStream={handleStartStream}
        onCancel={handleCancelPreStream}
      />
    );
  }

  if (streamingState === 'live' && activeStream) {
    return <LiveStreamView onEndStream={handleEndStream} />;
  }

  return (
    <StreamSlotSelector
      slots={schedule}
      onSelectSlot={handleSelectSlot}
      onSkipStreaming={handleSkipStreaming}
    />
  );
}
