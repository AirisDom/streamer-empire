'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameStore, GameStore } from '../store/gameStore';
import { ContentNiche, ChatMessage, StaffRole } from '../types';
import { createChatGenerator } from '../data/chat';
import { calculateViewerRetentionModifier } from '../data/moderation';
import { calculateSubscriberConversionRate } from '../data/hype';
import {
  IncomingRaid,
  RaidEventResult,
  generateIncomingRaid,
  shouldTriggerRandomRaid,
  determineRaidSize,
  generateRaidChatMessage,
} from '../data/raids';
import PixiChatPanel from './PixiChatPanel';
import ChatModerationPanel from './ChatModerationPanel';
import HypeMeter from './HypeMeter';
import RaidNotification from './RaidNotification';

export interface StreamEndData {
  elapsed: number;
  currentViewers: number;
  peakViewers: number;
  chatHealth: number;
  hype: number;
  newSubs: number;
  raidsReceived: number;
}

interface LiveStreamViewProps {
  onEndStream: (data: StreamEndData) => void;
}

const NICHE_INFO: Record<ContentNiche, { name: string; icon: string }> = {
  [ContentNiche.Gaming]: { name: 'Gaming', icon: '🎮' },
  [ContentNiche.Cooking]: { name: 'Cooking', icon: '🍳' },
  [ContentNiche.Music]: { name: 'Music', icon: '🎵' },
  [ContentNiche.IRL]: { name: 'IRL', icon: '📹' },
};

function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function LiveStreamView({ onEndStream }: LiveStreamViewProps) {
  const activeStream = useGameStore((state: GameStore) => state.player.channel.activeStream);
  const channelName = useGameStore((state: GameStore) => state.player.channel.name);
  const staff = useGameStore((state: GameStore) => state.player.channel.staff);
  const playerEnergy = useGameStore((state: GameStore) => state.player.energy);
  const subscribers = useGameStore((state: GameStore) => state.player.channel.subscribers);
  const reputation = useGameStore((state: GameStore) => state.player.channel.reputation);
  const updateSubscribers = useGameStore((state: GameStore) => state.updateSubscribers);
  const updateReputation = useGameStore((state: GameStore) => state.updateReputation);
  const endStream = useGameStore((state: GameStore) => state.endStream);

  const [elapsed, setElapsed] = useState(0);
  const [currentViewers, setCurrentViewers] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [messagesPerMinute, setMessagesPerMinute] = useState(0);
  const [chatHealth, setChatHealth] = useState(100);
  const [currentHype, setCurrentHype] = useState(20);
  const [newSubsThisStream, setNewSubsThisStream] = useState(0);
  const [activeRaid, setActiveRaid] = useState<IncomingRaid | null>(null);
  const [raidViewerBonus, setRaidViewerBonus] = useState(0);
  const [raidsReceivedCount, setRaidsReceivedCount] = useState(0);

  const viewerCountRef = useRef(0);
  const chatHealthRef = useRef(100);
  const hypeRef = useRef(20);
  const messageTimestampsRef = useRef<number[]>([]);
  const chatGeneratorRef = useRef<ReturnType<typeof createChatGenerator> | null>(null);
  const lastSubCheckRef = useRef<number | null>(null);
  const lastRaidCheckRef = useRef<number | null>(null);
  const peakViewersRef = useRef(0);

  const moderators = staff.filter(s => s.role === StaffRole.Moderator);

  useEffect(() => {
    viewerCountRef.current = currentViewers;
  }, [currentViewers]);

  useEffect(() => {
    chatHealthRef.current = chatHealth;
  }, [chatHealth]);

  useEffect(() => {
    hypeRef.current = currentHype;
  }, [currentHype]);

  const handleChatHealthChange = useCallback((health: number) => {
    setChatHealth(health);
  }, []);

  const handleHypeChange = useCallback((hype: number) => {
    setCurrentHype(hype);
  }, []);

  const handleEnergyUsed = useCallback(() => {
    if (chatGeneratorRef.current) {
      chatGeneratorRef.current.triggerHypeEvent();
    }
  }, []);

  const handleRaidResponse = useCallback((result: RaidEventResult, welcomedWarmly: boolean) => {
    updateSubscribers(result.subscribersGained);
    updateReputation(result.reputationGained);
    setNewSubsThisStream((prev) => prev + result.subscribersGained);
    setCurrentHype((prev) => Math.min(100, prev + result.hypeBoost));
    setRaidViewerBonus((prev) => prev + result.viewersAdded);

    if (chatGeneratorRef.current && activeStream) {
      const raidMsg = generateRaidChatMessage('incoming', activeRaid?.raider.name || 'Raider');
      const chatMessage: ChatMessage = {
        id: crypto.randomUUID(),
        username: welcomedWarmly ? channelName : 'system',
        message: raidMsg,
        timestamp: Date.now(),
        isSubscriber: true,
      };
      setChatMessages((prev) => [...prev.slice(-50), chatMessage]);
    }

    setTimeout(() => {
      setActiveRaid(null);
      setRaidViewerBonus((prev) => Math.max(0, prev - Math.floor(result.viewersAdded * 0.5)));
    }, 30000);
  }, [updateSubscribers, updateReputation, activeStream, activeRaid, channelName]);

  const handleRaidDismiss = useCallback(() => {
    setActiveRaid(null);
  }, []);

  useEffect(() => {
    if (!activeStream) return;

    const interval = setInterval(() => {
      const elapsedMs = Date.now() - activeStream.startTime;
      const elapsedSecs = Math.floor(elapsedMs / 1000);
      setElapsed(elapsedSecs);

      const baseViewers = 10 + Math.floor(Math.random() * 20);
      const timeBonus = Math.min(Math.floor(elapsedMs / 10000), 50);
      const retentionModifier = calculateViewerRetentionModifier(chatHealthRef.current);
      const hypeBonus = Math.floor(hypeRef.current / 10);
      const rawViewerCount = baseViewers + timeBonus + hypeBonus + raidViewerBonus + Math.floor(Math.random() * 10);
      const newViewerCount = Math.floor(rawViewerCount * retentionModifier);
      setCurrentViewers(newViewerCount);

      if (newViewerCount > peakViewersRef.current) {
        peakViewersRef.current = newViewerCount;
      }

      const now = Date.now();
      const lastSubCheck = lastSubCheckRef.current ?? now;
      if (now - lastSubCheck >= 5000) {
        lastSubCheckRef.current = now;
        const conversionRate = calculateSubscriberConversionRate(hypeRef.current);
        const viewerPool = Math.max(1, newViewerCount);
        if (Math.random() < conversionRate * (viewerPool / 100)) {
          const newSubs = 1 + Math.floor(Math.random() * Math.ceil(hypeRef.current / 50));
          updateSubscribers(newSubs);
          setNewSubsThisStream((prev) => prev + newSubs);
        }
      }

      const lastRaidCheck = lastRaidCheckRef.current ?? now;
      if (!activeRaid && now - lastRaidCheck >= 10000) {
        lastRaidCheckRef.current = now;
        if (shouldTriggerRandomRaid(subscribers, elapsedSecs, hypeRef.current)) {
          const raidSize = determineRaidSize(subscribers);
          const incomingRaid = generateIncomingRaid(
            subscribers,
            reputation,
            activeStream.niche,
            raidSize
          );
          setActiveRaid(incomingRaid);
          setRaidsReceivedCount((prev) => prev + 1);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeStream, updateSubscribers, raidViewerBonus, subscribers, reputation, activeRaid]);

  useEffect(() => {
    if (!activeStream) return;

    const handleNewMessage = (message: ChatMessage) => {
      setChatMessages((prev) => [...prev.slice(-50), message]);
      messageTimestampsRef.current.push(Date.now());
    };

    const generator = createChatGenerator({
      niche: activeStream.niche,
      channelName,
      getViewerCount: () => viewerCountRef.current,
      onMessage: handleNewMessage,
    });

    chatGeneratorRef.current = generator;
    generator.start();

    return () => {
      generator.stop();
      chatGeneratorRef.current = null;
    };
  }, [activeStream, channelName]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const oneMinuteAgo = now - 60000;
      messageTimestampsRef.current = messageTimestampsRef.current.filter(
        (ts) => ts > oneMinuteAgo
      );
      setMessagesPerMinute(messageTimestampsRef.current.length);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleEndStream = useCallback(() => {
    if (chatGeneratorRef.current) {
      chatGeneratorRef.current.stop();
    }
    endStream();
    onEndStream({
      elapsed,
      currentViewers,
      peakViewers: peakViewersRef.current,
      chatHealth: chatHealthRef.current,
      hype: hypeRef.current,
      newSubs: newSubsThisStream,
      raidsReceived: raidsReceivedCount,
    });
  }, [endStream, onEndStream, elapsed, currentViewers, newSubsThisStream, raidsReceivedCount]);

  if (!activeStream) {
    return null;
  }

  const nicheInfo = NICHE_INFO[activeStream.niche];

  return (
    <div className="space-y-4">
      {activeRaid && (
        <RaidNotification
          raid={activeRaid}
          onRespond={handleRaidResponse}
          onDismiss={handleRaidDismiss}
        />
      )}

      <div className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-pink-600 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 bg-white rounded-full animate-pulse" />
              <span className="text-white font-bold text-sm">LIVE</span>
            </span>
            <span className="text-white/80 text-sm">|</span>
            <span className="text-white font-medium text-sm">{channelName}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/80 text-sm flex items-center gap-1">
              <span>{nicheInfo.icon}</span>
              {nicheInfo.name}
            </span>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="bg-zinc-900 rounded-lg px-4 py-2 flex items-center gap-3">
              <svg
                className="w-5 h-5 text-zinc-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <span className="text-xs text-zinc-500 block">Duration</span>
                <span className="text-lg font-mono font-bold text-white">
                  {formatDuration(elapsed)}
                </span>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-lg px-4 py-2 flex items-center gap-3">
              <svg
                className="w-5 h-5 text-zinc-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <div>
                <span className="text-xs text-zinc-500 block">Viewers</span>
                <span className="text-lg font-mono font-bold text-purple-400">
                  {currentViewers}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            <StatBox
              label="Hype"
              value={`${Math.round(currentHype)}%`}
              color={currentHype >= 75 ? 'text-pink-400' : currentHype >= 45 ? 'text-orange-400' : 'text-zinc-400'}
            />
            <StatBox label="New Subs" value={newSubsThisStream.toString()} />
            <StatBox label="Donations" value={`$${activeStream.donations}`} />
            <StatBox
              label="Chat Health"
              value={`${Math.round(chatHealth)}%`}
              color={chatHealth >= 70 ? 'text-green-400' : chatHealth >= 40 ? 'text-yellow-400' : 'text-red-400'}
            />
          </div>

          <button
            onClick={handleEndStream}
            className="w-full px-4 py-3 text-sm font-bold text-white bg-zinc-700 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
              />
            </svg>
            End Stream
          </button>
        </div>
      </div>

      <HypeMeter
        messages={chatMessages}
        onHypeChange={handleHypeChange}
        playerEnergy={playerEnergy}
        onEnergyUsed={handleEnergyUsed}
      />

      <ChatModerationPanel
        messages={chatMessages}
        moderators={moderators}
        onChatHealthChange={handleChatHealthChange}
      />

      <PixiChatPanel
        width={256}
        height={320}
        messages={chatMessages}
        messagesPerMinute={messagesPerMinute}
      />
    </div>
  );
}

interface StatBoxProps {
  label: string;
  value: string;
  color?: string;
}

function StatBox({ label, value, color = 'text-zinc-300' }: StatBoxProps) {
  return (
    <div className="bg-zinc-900 rounded-lg px-3 py-2">
      <span className="text-xs text-zinc-500 block">{label}</span>
      <span className={`text-sm font-medium ${color}`}>{value}</span>
    </div>
  );
}
