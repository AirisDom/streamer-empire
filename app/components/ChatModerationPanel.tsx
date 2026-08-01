'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatMessage, Staff, StaffRole } from '../types';
import {
  ModerationIncident,
  ModerationState,
  createIncidentFromMessage,
  shouldModeratorAutoHandle,
  getModeratorResponseDelay,
  calculateChatHealth,
  getHealthLabel,
  createInitialModerationState,
} from '../data/moderation';

interface ChatModerationPanelProps {
  messages: ChatMessage[];
  moderators: Staff[];
  onChatHealthChange?: (health: number) => void;
}

const INCIDENT_COLORS = {
  toxic: { bg: 'bg-red-900/50', border: 'border-red-500', text: 'text-red-400' },
  spam: { bg: 'bg-yellow-900/50', border: 'border-yellow-500', text: 'text-yellow-400' },
  harassment: { bg: 'bg-purple-900/50', border: 'border-purple-500', text: 'text-purple-400' },
};

const INCIDENT_ICONS = {
  toxic: '☠️',
  spam: '📢',
  harassment: '⚠️',
};

export default function ChatModerationPanel({
  messages,
  moderators,
  onChatHealthChange,
}: ChatModerationPanelProps) {
  const [modState, setModState] = useState<ModerationState>(createInitialModerationState);
  const processedMessageIds = useRef<Set<string>>(new Set());
  const pendingModHandles = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const handleIncident = useCallback((incidentId: string, handledBy: 'player' | 'moderator') => {
    setModState(prev => {
      const incident = prev.activeIncidents.find(i => i.id === incidentId);
      if (!incident || incident.handled) return prev;

      const timeout = pendingModHandles.current.get(incidentId);
      if (timeout) {
        clearTimeout(timeout);
        pendingModHandles.current.delete(incidentId);
      }

      const updatedIncidents = prev.activeIncidents.map(i =>
        i.id === incidentId ? { ...i, handled: true, handledBy } : i
      );

      return {
        ...prev,
        activeIncidents: updatedIncidents,
        playerHandled: handledBy === 'player' ? prev.playerHandled + 1 : prev.playerHandled,
        modHandled: handledBy === 'moderator' ? prev.modHandled + 1 : prev.modHandled,
      };
    });
  }, []);

  useEffect(() => {
    const newMessages = messages.filter(m => !processedMessageIds.current.has(m.id));

    newMessages.forEach(message => {
      processedMessageIds.current.add(message.id);
      const incident = createIncidentFromMessage(message);

      if (incident) {
        setModState(prev => ({
          ...prev,
          activeIncidents: [...prev.activeIncidents, incident],
          totalIncidents: prev.totalIncidents + 1,
        }));

        if (moderators.length > 0 && shouldModeratorAutoHandle(moderators)) {
          const delay = getModeratorResponseDelay(moderators);
          const timeout = setTimeout(() => {
            handleIncident(incident.id, 'moderator');
            pendingModHandles.current.delete(incident.id);
          }, delay);
          pendingModHandles.current.set(incident.id, timeout);
        }
      }
    });
  }, [messages, moderators, handleIncident]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setModState(prev => {
        const expired = prev.activeIncidents.filter(
          i => !i.handled && now > i.expiresAt
        );
        const newMissed = prev.missedIncidents + expired.length;

        expired.forEach(incident => {
          const timeout = pendingModHandles.current.get(incident.id);
          if (timeout) {
            clearTimeout(timeout);
            pendingModHandles.current.delete(incident.id);
          }
        });

        const activeIncidents = prev.activeIncidents.filter(
          i => i.handled || now <= i.expiresAt
        );

        const handledToRemove = activeIncidents.filter(
          i => i.handled && now > i.timestamp + 2000
        );
        const finalIncidents = activeIncidents.filter(
          i => !handledToRemove.includes(i)
        );

        return {
          ...prev,
          activeIncidents: finalIncidents,
          missedIncidents: newMissed,
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const health = calculateChatHealth(modState);
    setModState(prev => ({ ...prev, chatHealth: health }));
    onChatHealthChange?.(health);
  }, [modState.activeIncidents, modState.missedIncidents, onChatHealthChange]);

  useEffect(() => {
    return () => {
      pendingModHandles.current.forEach(timeout => clearTimeout(timeout));
      pendingModHandles.current.clear();
    };
  }, []);

  const unhandledIncidents = modState.activeIncidents.filter(i => !i.handled);
  const healthLabel = getHealthLabel(modState.chatHealth);

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden">
      <div className="bg-zinc-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🛡️</span>
          <span className="text-white font-bold text-sm">MODERATION</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Chat Health:</span>
            <div className="flex items-center gap-1">
              <div className="w-20 h-2 bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${modState.chatHealth}%`,
                    backgroundColor: healthLabel.color,
                  }}
                />
              </div>
              <span className="text-xs font-bold" style={{ color: healthLabel.color }}>
                {Math.round(modState.chatHealth)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 space-y-2 min-h-[120px] max-h-[200px] overflow-y-auto">
        {unhandledIncidents.length === 0 ? (
          <div className="text-center py-6 text-zinc-500">
            <span className="text-2xl block mb-2">✨</span>
            <span className="text-sm">Chat is clean! No incidents to handle.</span>
          </div>
        ) : (
          unhandledIncidents.map(incident => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              onTimeout={() => handleIncident(incident.id, 'player')}
            />
          ))
        )}
      </div>

      <div className="bg-zinc-900 px-4 py-2 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-4">
          <span>👤 You: {modState.playerHandled}</span>
          <span>🤖 Mods: {modState.modHandled}</span>
          <span className="text-red-400">❌ Missed: {modState.missedIncidents}</span>
        </div>
        <div>
          {moderators.length > 0 ? (
            <span className="text-green-400">
              {moderators.length} mod{moderators.length > 1 ? 's' : ''} active
            </span>
          ) : (
            <span className="text-yellow-400">No moderators hired</span>
          )}
        </div>
      </div>
    </div>
  );
}

interface IncidentCardProps {
  incident: ModerationIncident;
  onTimeout: () => void;
}

function IncidentCard({ incident, onTimeout }: IncidentCardProps) {
  const [timeLeft, setTimeLeft] = useState(100);
  const colors = INCIDENT_COLORS[incident.type];
  const icon = INCIDENT_ICONS[incident.type];

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const total = incident.expiresAt - incident.timestamp;
      const remaining = incident.expiresAt - now;
      setTimeLeft(Math.max(0, (remaining / total) * 100));
    }, 50);

    return () => clearInterval(interval);
  }, [incident]);

  const urgencyClass = timeLeft < 30 ? 'animate-pulse' : '';

  return (
    <div
      className={`${colors.bg} ${colors.border} border rounded-lg p-2 ${urgencyClass} cursor-pointer hover:brightness-125 transition-all`}
      onClick={onTimeout}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span>{icon}</span>
            <span className={`text-xs font-bold uppercase ${colors.text}`}>
              {incident.type}
            </span>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-zinc-400 truncate">
              {incident.username}
            </span>
          </div>
          <p className="text-sm text-zinc-300 truncate">{incident.message}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTimeout();
          }}
          className="flex-shrink-0 px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded transition-colors"
        >
          TIMEOUT
        </button>
      </div>
      <div className="mt-2 h-1 bg-zinc-700 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-100"
          style={{
            width: `${timeLeft}%`,
            backgroundColor: timeLeft < 30 ? '#ef4444' : timeLeft < 60 ? '#f97316' : '#22c55e',
          }}
        />
      </div>
    </div>
  );
}
