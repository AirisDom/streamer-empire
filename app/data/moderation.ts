import { ChatMessage, Staff, StaffRole } from '../types';

export interface ModerationIncident {
  id: string;
  messageId: string;
  username: string;
  message: string;
  type: 'toxic' | 'spam' | 'harassment';
  severity: 1 | 2 | 3;
  timestamp: number;
  handled: boolean;
  handledBy: 'player' | 'moderator' | 'auto' | null;
  expiresAt: number;
}

export interface ModerationState {
  chatHealth: number;
  activeIncidents: ModerationIncident[];
  totalIncidents: number;
  playerHandled: number;
  modHandled: number;
  missedIncidents: number;
}

const TOXIC_PATTERNS = [
  /\btrash\b/i,
  /\bboring\b/i,
  /\bdead chat\b/i,
  /\bzzzz+\b/i,
  /\byawn\b/i,
  /\bmid\b/i,
  /\bratio\b/i,
  /\bcringe\b/i,
  /\bdogwater\b/i,
  /\btouch grass\b/i,
  /\bwashed\b/i,
  /\bResidentSleeper\b/i,
  /\b-1 viewer\b/i,
  /\bim out\b/i,
  /\bwho asked\b/i,
  /\bnobody cares\b/i,
];

const SPAM_PATTERNS = [
  /(.)\1{4,}/i,
  /^(.)(\1| )*$/,
  /^[A-Z\s!]{10,}$/,
  /^.{1,3}$/,
];

const HARASSMENT_KEYWORDS = [
  'trash',
  'dogwater',
  'ratio',
];

export function detectIncidentType(message: string): { type: ModerationIncident['type']; severity: 1 | 2 | 3 } | null {
  for (const pattern of TOXIC_PATTERNS) {
    if (pattern.test(message)) {
      const severity = HARASSMENT_KEYWORDS.some(k => message.toLowerCase().includes(k)) ? 2 : 1;
      return { type: 'toxic', severity: severity as 1 | 2 };
    }
  }

  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(message) && message.length > 3) {
      return { type: 'spam', severity: 1 };
    }
  }

  if (message.length > 100 && /[A-Z]{5,}/.test(message)) {
    return { type: 'spam', severity: 2 };
  }

  return null;
}

export function createIncidentFromMessage(message: ChatMessage): ModerationIncident | null {
  const detection = detectIncidentType(message.message);
  if (!detection) return null;

  return {
    id: crypto.randomUUID(),
    messageId: message.id,
    username: message.username,
    message: message.message,
    type: detection.type,
    severity: detection.severity,
    timestamp: Date.now(),
    handled: false,
    handledBy: null,
    expiresAt: Date.now() + getIncidentDuration(detection.severity),
  };
}

function getIncidentDuration(severity: 1 | 2 | 3): number {
  switch (severity) {
    case 1: return 8000;
    case 2: return 6000;
    case 3: return 4000;
    default: return 8000;
  }
}

export function calculateModeratorAutoHandleChance(moderators: Staff[]): number {
  if (moderators.length === 0) return 0;

  const totalSkill = moderators.reduce((sum, mod) => sum + mod.skill, 0);
  const avgSkill = totalSkill / moderators.length;
  const baseChance = (avgSkill / 10) * 0.6;
  const modCountBonus = Math.min(moderators.length * 0.1, 0.3);

  return Math.min(baseChance + modCountBonus, 0.9);
}

export function shouldModeratorAutoHandle(moderators: Staff[]): boolean {
  const chance = calculateModeratorAutoHandleChance(moderators);
  return Math.random() < chance;
}

export function getModeratorResponseDelay(moderators: Staff[]): number {
  if (moderators.length === 0) return Infinity;

  const avgSkill = moderators.reduce((sum, m) => sum + m.skill, 0) / moderators.length;
  const baseDelay = 3000;
  const minDelay = 500;
  const skillReduction = (avgSkill / 10) * (baseDelay - minDelay);

  return baseDelay - skillReduction + Math.random() * 500;
}

export function calculateChatHealth(state: ModerationState): number {
  const activeUnhandled = state.activeIncidents.filter(i => !i.handled).length;
  const recentMissed = state.missedIncidents;

  let health = 100;
  health -= activeUnhandled * 5;
  health -= recentMissed * 10;
  health -= (state.totalIncidents - state.playerHandled - state.modHandled) * 2;

  return Math.max(0, Math.min(100, health));
}

export function calculateViewerRetentionModifier(chatHealth: number): number {
  if (chatHealth >= 90) return 1.1;
  if (chatHealth >= 70) return 1.0;
  if (chatHealth >= 50) return 0.9;
  if (chatHealth >= 30) return 0.75;
  return 0.5;
}

export function getHealthLabel(health: number): { text: string; color: string } {
  if (health >= 90) return { text: 'Excellent', color: '#22c55e' };
  if (health >= 70) return { text: 'Good', color: '#84cc16' };
  if (health >= 50) return { text: 'Fair', color: '#eab308' };
  if (health >= 30) return { text: 'Poor', color: '#f97316' };
  return { text: 'Critical', color: '#ef4444' };
}

export function createInitialModerationState(): ModerationState {
  return {
    chatHealth: 100,
    activeIncidents: [],
    totalIncidents: 0,
    playerHandled: 0,
    modHandled: 0,
    missedIncidents: 0,
  };
}
