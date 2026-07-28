export enum ContentNiche {
  Gaming = 'gaming',
  Cooking = 'cooking',
  Music = 'music',
  IRL = 'irl',
}

export enum EquipmentTier {
  Starter = 1,
  Basic = 2,
  Intermediate = 3,
  Professional = 4,
  Elite = 5,
}

export enum EquipmentCategory {
  Camera = 'camera',
  Microphone = 'microphone',
  Lighting = 'lighting',
  Computer = 'computer',
  StreamDeck = 'stream_deck',
  Background = 'background',
  Chair = 'chair',
}

export enum StaffRole {
  Editor = 'editor',
  Moderator = 'moderator',
  Manager = 'manager',
  Designer = 'designer',
}

export enum EventType {
  Raid = 'raid',
  Controversy = 'controversy',
  Collab = 'collab',
  ViralMoment = 'viral_moment',
  BrandDeal = 'brand_deal',
  TechnicalIssue = 'technical_issue',
  MilestoneReached = 'milestone_reached',
}

export enum EventSeverity {
  Minor = 'minor',
  Moderate = 'moderate',
  Major = 'major',
}

export interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  tier: EquipmentTier;
  price: number;
  qualityBonus: number;
  description: string;
}

export interface StaffPerk {
  id: string;
  name: string;
  description: string;
  effect: Record<string, number>;
}

export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
  salary: number;
  skill: number;
  perks: StaffPerk[];
  hiredAt: number;
}

export interface GameEvent {
  id: string;
  type: EventType;
  severity: EventSeverity;
  title: string;
  description: string;
  options: EventOption[];
  occurredAt: number;
  expiresAt?: number;
  resolved: boolean;
}

export interface EventOption {
  id: string;
  label: string;
  description: string;
  effects: EventEffect[];
}

export interface EventEffect {
  stat: string;
  value: number;
  isPercentage: boolean;
}

export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: number;
  isSubscriber: boolean;
  donationAmount?: number;
}

export interface StreamSession {
  id: string;
  title: string;
  niche: ContentNiche;
  startTime: number;
  endTime?: number;
  peakViewers: number;
  averageViewers: number;
  newSubscribers: number;
  donations: number;
  chatMessages: ChatMessage[];
  events: GameEvent[];
}

export interface StreamScheduleSlot {
  dayOfWeek: number;
  startHour: number;
  duration: number;
  niche: ContentNiche;
}

export interface Analytics {
  totalStreams: number;
  totalStreamTime: number;
  averageViewers: number;
  peakViewers: number;
  totalSubscribers: number;
  subscriberGrowthRate: number;
  totalRevenue: number;
  revenueBySource: RevenueBreakdown;
  viewersByNiche: Record<ContentNiche, number>;
  bestStreamDay: number;
  bestStreamHour: number;
}

export interface RevenueBreakdown {
  subscriptions: number;
  donations: number;
  brandDeals: number;
  adRevenue: number;
}

export interface Channel {
  id: string;
  name: string;
  niche: ContentNiche;
  subscribers: number;
  followers: number;
  reputation: number;
  createdAt: number;
  schedule: StreamScheduleSlot[];
  equipment: Equipment[];
  staff: Staff[];
  analytics: Analytics;
  activeStream?: StreamSession;
  streamHistory: StreamSession[];
}

export interface Player {
  id: string;
  username: string;
  money: number;
  energy: number;
  maxEnergy: number;
  experience: number;
  level: number;
  channel: Channel;
  currentWeek: number;
  currentDay: number;
  unlockedNiches: ContentNiche[];
  activeEvents: GameEvent[];
  completedEventIds: string[];
}

export interface GameState {
  player: Player;
  isPaused: boolean;
  gameSpeed: number;
  lastSaveTime: number;
}
