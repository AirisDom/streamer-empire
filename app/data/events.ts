import { EventType, EventSeverity, ContentNiche } from '../types';

export type EventCategory = 'positive' | 'negative' | 'neutral';

export type ControversyType =
  | 'old_tweets'
  | 'hot_take'
  | 'chat_conflict'
  | 'clip_out_of_context'
  | 'competitor_drama';

export type ControversyResponse = 'apologize' | 'double_down' | 'ignore' | 'address_directly';

export interface NicheReactionModifiers {
  apologize: { reputation: number; subscribers: number };
  double_down: { reputation: number; subscribers: number };
  ignore: { reputation: number; subscribers: number };
  address_directly: { reputation: number; subscribers: number };
}

export const NICHE_CONTROVERSY_MODIFIERS: Record<ContentNiche, NicheReactionModifiers> = {
  [ContentNiche.Gaming]: {
    apologize: { reputation: 0.8, subscribers: 0.9 },
    double_down: { reputation: 1.3, subscribers: 0.7 },
    ignore: { reputation: 0.6, subscribers: 0.8 },
    address_directly: { reputation: 1.1, subscribers: 1.0 },
  },
  [ContentNiche.Cooking]: {
    apologize: { reputation: 1.2, subscribers: 1.1 },
    double_down: { reputation: 1.5, subscribers: 0.5 },
    ignore: { reputation: 0.9, subscribers: 0.9 },
    address_directly: { reputation: 1.3, subscribers: 1.1 },
  },
  [ContentNiche.Music]: {
    apologize: { reputation: 1.0, subscribers: 1.0 },
    double_down: { reputation: 1.4, subscribers: 0.8 },
    ignore: { reputation: 0.7, subscribers: 0.85 },
    address_directly: { reputation: 1.2, subscribers: 1.0 },
  },
  [ContentNiche.IRL]: {
    apologize: { reputation: 1.3, subscribers: 1.2 },
    double_down: { reputation: 1.6, subscribers: 0.4 },
    ignore: { reputation: 0.5, subscribers: 0.6 },
    address_directly: { reputation: 1.4, subscribers: 1.2 },
  },
};

export interface EventTriggerCondition {
  minSubscribers?: number;
  maxSubscribers?: number;
  minWeek?: number;
  maxWeek?: number;
  minReputation?: number;
  maxReputation?: number;
  requiredNiche?: ContentNiche;
  requiredStaffRole?: string;
  probability: number;
}

export interface EventOutcome {
  money?: number;
  subscribers?: number;
  reputation?: number;
  experience?: number;
  description: string;
}

export interface EventChoice {
  id: string;
  label: string;
  description: string;
  outcomes: EventOutcome;
  requiredMoney?: number;
}

export interface EventDefinition {
  id: string;
  type: EventType;
  severity: EventSeverity;
  category: EventCategory;
  title: string;
  description: string;
  choices: EventChoice[];
  triggerConditions: EventTriggerCondition;
  duration?: number;
  cooldownWeeks?: number;
  controversyType?: ControversyType;
}

export const EVENT_DEFINITIONS: EventDefinition[] = [
  {
    id: 'raid_small',
    type: EventType.Raid,
    severity: EventSeverity.Minor,
    category: 'positive',
    title: 'Incoming Raid!',
    description: 'A smaller streamer is raiding your channel with their viewers!',
    choices: [
      {
        id: 'welcome_warmly',
        label: 'Welcome Them Warmly',
        description: 'Give a shoutout and thank them on stream',
        outcomes: { subscribers: 15, reputation: 3, description: 'You gained 15 subscribers and improved reputation!' },
      },
      {
        id: 'continue_normally',
        label: 'Continue Normally',
        description: 'Acknowledge them briefly and continue your content',
        outcomes: { subscribers: 8, description: 'You gained 8 new subscribers.' },
      },
    ],
    triggerConditions: { minSubscribers: 50, probability: 0.15 },
    cooldownWeeks: 2,
  },
  {
    id: 'raid_large',
    type: EventType.Raid,
    severity: EventSeverity.Major,
    category: 'positive',
    title: 'Massive Raid Incoming!',
    description: 'A popular streamer is raiding you with thousands of viewers!',
    choices: [
      {
        id: 'put_on_show',
        label: 'Put On a Show',
        description: 'Go all out to impress the new viewers',
        outcomes: { subscribers: 150, reputation: 10, experience: 50, description: 'Amazing performance! You gained 150 subscribers and boosted your reputation!' },
      },
      {
        id: 'stay_calm',
        label: 'Stay Calm',
        description: 'Continue your regular content style',
        outcomes: { subscribers: 75, reputation: 5, description: 'You gained 75 subscribers.' },
      },
    ],
    triggerConditions: { minSubscribers: 1000, probability: 0.08 },
    cooldownWeeks: 4,
  },
  {
    id: 'controversy_chat_conflict',
    type: EventType.Controversy,
    severity: EventSeverity.Minor,
    category: 'negative',
    title: 'Chat Conflict Escalates',
    description: 'A heated argument in your chat has blown up. Viewers are divided and demanding you pick a side.',
    controversyType: 'chat_conflict',
    choices: [
      {
        id: 'apologize',
        label: 'Apologize',
        description: 'Apologize for letting things get out of hand',
        outcomes: { reputation: -2, description: 'You apologized. Small reputation hit but viewers appreciate your humility.' },
      },
      {
        id: 'ignore',
        label: 'Ignore It',
        description: 'Continue streaming and let it blow over',
        outcomes: { reputation: -5, subscribers: -10, description: 'The controversy grew. You lost some subscribers and reputation.' },
      },
      {
        id: 'address_directly',
        label: 'Address Directly',
        description: 'Explain the situation calmly and set boundaries',
        outcomes: { reputation: 2, description: 'Your mature response actually improved your reputation!' },
      },
    ],
    triggerConditions: { minSubscribers: 100, probability: 0.08 },
    cooldownWeeks: 3,
  },
  {
    id: 'controversy_old_tweets',
    type: EventType.Controversy,
    severity: EventSeverity.Major,
    category: 'negative',
    title: 'Old Tweets Resurface',
    description: 'Someone dug up old social media posts from years ago. They are being shared everywhere and taken out of context.',
    controversyType: 'old_tweets',
    choices: [
      {
        id: 'apologize',
        label: 'Public Apology',
        description: 'Acknowledge your past and apologize sincerely',
        outcomes: { reputation: -8, subscribers: -20, description: 'Your apology helped contain the damage. Some appreciate your growth.' },
      },
      {
        id: 'double_down',
        label: 'Double Down',
        description: 'Refuse to apologize for old posts and criticize cancel culture',
        outcomes: { reputation: -20, subscribers: -100, description: 'The backlash was severe. Many unsubscribed.' },
      },
      {
        id: 'ignore',
        label: 'Stay Silent',
        description: 'Do not engage and wait for it to blow over',
        outcomes: { reputation: -12, subscribers: -50, description: 'The silence was interpreted as guilt by some.' },
      },
    ],
    triggerConditions: { minSubscribers: 2000, probability: 0.04 },
    cooldownWeeks: 10,
  },
  {
    id: 'controversy_hot_take',
    type: EventType.Controversy,
    severity: EventSeverity.Moderate,
    category: 'negative',
    title: 'Hot Take Backfires',
    description: 'Your controversial opinion about a trending topic has divided your audience. Some are defending you while others are outraged.',
    controversyType: 'hot_take',
    choices: [
      {
        id: 'apologize',
        label: 'Walk It Back',
        description: 'Admit you spoke too hastily and clarify your position',
        outcomes: { reputation: -5, subscribers: -15, description: 'Some viewers appreciate the humility, others see it as weak.' },
      },
      {
        id: 'double_down',
        label: 'Double Down',
        description: 'Stand firm on your opinion and defend your view',
        outcomes: { reputation: -15, subscribers: -80, description: 'You lost mainstream appeal but gained hardcore supporters.' },
      },
      {
        id: 'ignore',
        label: 'Move On Quietly',
        description: 'Stop talking about it and continue with regular content',
        outcomes: { reputation: -8, subscribers: -30, description: 'Things eventually calmed down but some viewers are still upset.' },
      },
    ],
    triggerConditions: { minSubscribers: 500, probability: 0.06 },
    cooldownWeeks: 4,
  },
  {
    id: 'controversy_clip_viral',
    type: EventType.Controversy,
    severity: EventSeverity.Major,
    category: 'negative',
    title: 'Clip Taken Out of Context',
    description: 'A clip from your stream is going viral for the wrong reasons. It has been edited to make you look bad.',
    controversyType: 'clip_out_of_context',
    choices: [
      {
        id: 'apologize',
        label: 'Apologize Anyway',
        description: 'Apologize for how it came across regardless of context',
        outcomes: { reputation: -10, money: -100, description: 'Your apology helped but some see it as admitting guilt.' },
      },
      {
        id: 'double_down',
        label: 'Fight Back',
        description: 'Release the full context and call out the manipulation',
        outcomes: { reputation: -5, subscribers: 20, description: 'The truth came out. You gained respect from loyal fans.' },
      },
      {
        id: 'ignore',
        label: 'Wait It Out',
        description: 'Do not engage with bad faith actors',
        outcomes: { reputation: -15, subscribers: -60, description: 'Without your side of the story, the narrative solidified against you.' },
      },
    ],
    triggerConditions: { minSubscribers: 5000, maxReputation: 80, probability: 0.05 },
    cooldownWeeks: 8,
  },
  {
    id: 'controversy_competitor_drama',
    type: EventType.Controversy,
    severity: EventSeverity.Moderate,
    category: 'negative',
    title: 'Competitor Drama',
    description: 'Another streamer in your niche is publicly calling you out. Their fans are flooding your chat and social media.',
    controversyType: 'competitor_drama',
    choices: [
      {
        id: 'apologize',
        label: 'Take the High Road',
        description: 'Publicly apologize and try to de-escalate',
        outcomes: { reputation: 3, subscribers: -10, description: 'You looked mature, but some fans wanted you to fight back.' },
      },
      {
        id: 'double_down',
        label: 'Fire Back',
        description: 'Respond publicly and defend yourself aggressively',
        outcomes: { reputation: -10, subscribers: 30, description: 'Drama brought viewers but damaged your professional image.' },
      },
      {
        id: 'ignore',
        label: 'Ignore Completely',
        description: 'Refuse to engage with the drama',
        outcomes: { reputation: 5, subscribers: -25, description: 'You stayed above it but lost viewers to the drama.' },
      },
    ],
    triggerConditions: { minSubscribers: 1000, probability: 0.05 },
    cooldownWeeks: 6,
  },
  {
    id: 'collab_offer',
    type: EventType.Collab,
    severity: EventSeverity.Moderate,
    category: 'positive',
    title: 'Collaboration Offer',
    description: 'Another creator in your niche wants to collaborate on a stream!',
    choices: [
      {
        id: 'accept_collab',
        label: 'Accept Collaboration',
        description: 'Team up for a joint stream',
        outcomes: { subscribers: 50, reputation: 5, experience: 25, description: 'Great collab! You gained exposure to a new audience.' },
      },
      {
        id: 'decline_politely',
        label: 'Decline Politely',
        description: 'You are too busy right now',
        outcomes: { reputation: -2, description: 'They were disappointed, slight reputation hit.' },
      },
    ],
    triggerConditions: { minSubscribers: 200, minReputation: 40, probability: 0.12 },
    cooldownWeeks: 2,
  },
  {
    id: 'viral_clip',
    type: EventType.ViralMoment,
    severity: EventSeverity.Major,
    category: 'positive',
    title: 'Your Clip Went Viral!',
    description: 'A highlight from your stream is blowing up on social media!',
    choices: [
      {
        id: 'capitalize',
        label: 'Capitalize on It',
        description: 'Create follow-up content and engage with new viewers',
        outcomes: { subscribers: 300, reputation: 15, money: 200, description: 'You rode the wave! Massive subscriber and revenue boost!' },
      },
      {
        id: 'stay_humble',
        label: 'Stay Humble',
        description: 'Continue as usual without making a big deal',
        outcomes: { subscribers: 150, reputation: 8, description: 'Organic growth from the exposure.' },
      },
    ],
    triggerConditions: { minSubscribers: 500, probability: 0.06 },
    cooldownWeeks: 6,
  },
  {
    id: 'brand_deal_small',
    type: EventType.BrandDeal,
    severity: EventSeverity.Minor,
    category: 'positive',
    title: 'Small Brand Deal Offer',
    description: 'A gaming peripherals company wants to sponsor a stream segment.',
    choices: [
      {
        id: 'accept_deal',
        label: 'Accept the Deal',
        description: 'Promote their product during your stream',
        outcomes: { money: 200, reputation: -2, description: 'You earned $200 but some viewers dislike sponsored content.' },
      },
      {
        id: 'negotiate',
        label: 'Negotiate Better Terms',
        description: 'Push for a better rate',
        outcomes: { money: 350, reputation: -1, description: 'You got a better deal! $350 earned with minimal reputation impact.' },
      },
      {
        id: 'decline_deal',
        label: 'Decline',
        description: 'Keep your content ad-free',
        outcomes: { reputation: 3, description: 'Your audience appreciates your integrity.' },
      },
    ],
    triggerConditions: { minSubscribers: 500, minReputation: 50, probability: 0.1 },
    cooldownWeeks: 3,
  },
  {
    id: 'brand_deal_major',
    type: EventType.BrandDeal,
    severity: EventSeverity.Major,
    category: 'positive',
    title: 'Major Brand Partnership',
    description: 'A major brand wants a long-term partnership with your channel!',
    choices: [
      {
        id: 'accept_partnership',
        label: 'Accept Partnership',
        description: 'Become an official partner',
        outcomes: { money: 2000, reputation: 5, description: 'Lucrative deal! $2000 and your channel looks more professional.' },
      },
      {
        id: 'exclusive_deal',
        label: 'Negotiate Exclusive Deal',
        description: 'Push for exclusivity bonuses',
        outcomes: { money: 3500, reputation: 3, description: 'Exclusive partner status! $3500 earned.' },
      },
      {
        id: 'decline_partnership',
        label: 'Decline',
        description: 'Maintain independence',
        outcomes: { reputation: 5, description: 'Your loyal fans appreciate staying independent.' },
      },
    ],
    triggerConditions: { minSubscribers: 10000, minReputation: 60, probability: 0.08 },
    cooldownWeeks: 6,
  },
  {
    id: 'tech_issue_minor',
    type: EventType.TechnicalIssue,
    severity: EventSeverity.Minor,
    category: 'negative',
    title: 'Audio Problems',
    description: 'Your microphone is acting up during the stream!',
    choices: [
      {
        id: 'quick_fix',
        label: 'Quick Restart',
        description: 'Restart your audio setup',
        outcomes: { reputation: -1, description: 'Brief interruption, minor impact.' },
      },
      {
        id: 'buy_backup',
        label: 'Order Backup Equipment',
        description: 'Invest in backup gear to prevent future issues',
        outcomes: { money: -150, reputation: 1, description: 'Spent $150 but now you are prepared for next time.' },
        requiredMoney: 150,
      },
    ],
    triggerConditions: { probability: 0.08 },
    cooldownWeeks: 2,
  },
  {
    id: 'tech_issue_major',
    type: EventType.TechnicalIssue,
    severity: EventSeverity.Major,
    category: 'negative',
    title: 'System Crash',
    description: 'Your streaming PC crashed mid-stream! Viewers are leaving.',
    choices: [
      {
        id: 'restart_stream',
        label: 'Restart ASAP',
        description: 'Get back online as fast as possible',
        outcomes: { subscribers: -20, reputation: -5, description: 'Some viewers left, but most understood.' },
      },
      {
        id: 'end_stream',
        label: 'End Stream Early',
        description: 'Call it a day and fix the issue properly',
        outcomes: { subscribers: -10, reputation: -3, description: 'Fewer viewers lost, you can try again tomorrow.' },
      },
      {
        id: 'emergency_upgrade',
        label: 'Emergency PC Upgrade',
        description: 'Buy better hardware immediately',
        outcomes: { money: -500, reputation: 2, description: 'Spent $500 but upgraded your reliability.' },
        requiredMoney: 500,
      },
    ],
    triggerConditions: { minWeek: 3, probability: 0.05 },
    cooldownWeeks: 4,
  },
  {
    id: 'donation_surge',
    type: EventType.ViralMoment,
    severity: EventSeverity.Moderate,
    category: 'positive',
    title: 'Donation Surge!',
    description: 'A generous viewer just dropped a huge donation!',
    choices: [
      {
        id: 'thank_profusely',
        label: 'Thank Them Enthusiastically',
        description: 'Show major appreciation on stream',
        outcomes: { money: 100, reputation: 3, description: 'Your gratitude earned extra donations and goodwill!' },
      },
      {
        id: 'stay_cool',
        label: 'Stay Professional',
        description: 'Thank them and continue the stream',
        outcomes: { money: 50, description: 'Nice donation! Business as usual.' },
      },
    ],
    triggerConditions: { minSubscribers: 100, probability: 0.12 },
    cooldownWeeks: 1,
  },
  {
    id: 'new_competitor',
    type: EventType.Controversy,
    severity: EventSeverity.Moderate,
    category: 'neutral',
    title: 'Rising Competitor',
    description: 'A new streamer in your niche is growing fast and some of your viewers are checking them out.',
    choices: [
      {
        id: 'improve_content',
        label: 'Step Up Your Game',
        description: 'Work harder on content quality',
        outcomes: { experience: 30, reputation: 3, description: 'Competition made you better!' },
      },
      {
        id: 'collab_with_them',
        label: 'Reach Out to Collaborate',
        description: 'Turn a competitor into an ally',
        outcomes: { subscribers: 25, reputation: 5, description: 'Great collaboration, you both benefit!' },
      },
      {
        id: 'ignore_competition',
        label: 'Ignore Them',
        description: 'Focus on your own path',
        outcomes: { subscribers: -15, description: 'Some viewers drifted away.' },
      },
    ],
    triggerConditions: { minSubscribers: 500, minWeek: 4, probability: 0.07 },
    cooldownWeeks: 5,
  },
  {
    id: 'equipment_malfunction',
    type: EventType.TechnicalIssue,
    severity: EventSeverity.Moderate,
    category: 'negative',
    title: 'Equipment Failure',
    description: 'Your camera stopped working right before a scheduled stream!',
    choices: [
      {
        id: 'stream_audio_only',
        label: 'Stream Audio Only',
        description: 'Continue with just your microphone',
        outcomes: { reputation: -5, subscribers: -10, description: 'Viewers were disappointed but some stayed.' },
      },
      {
        id: 'cancel_stream',
        label: 'Cancel the Stream',
        description: 'Take the day off to fix it',
        outcomes: { reputation: -3, description: 'Viewers understood, minor reputation hit.' },
      },
      {
        id: 'rush_replacement',
        label: 'Rush Order Replacement',
        description: 'Pay extra for same-day delivery',
        outcomes: { money: -300, reputation: 2, description: 'Spent $300 but saved the stream and impressed viewers!' },
        requiredMoney: 300,
      },
    ],
    triggerConditions: { minWeek: 2, probability: 0.06 },
    cooldownWeeks: 4,
  },
  {
    id: 'community_milestone',
    type: EventType.MilestoneReached,
    severity: EventSeverity.Moderate,
    category: 'positive',
    title: 'Community Celebration',
    description: 'Your community wants to celebrate your growth with a special event!',
    choices: [
      {
        id: 'host_event',
        label: 'Host Special Stream',
        description: 'Plan an elaborate celebration stream',
        outcomes: { subscribers: 40, reputation: 8, money: -50, description: 'Amazing event! Community loved it.' },
        requiredMoney: 50,
      },
      {
        id: 'simple_thanks',
        label: 'Simple Thank You',
        description: 'Express gratitude without a big event',
        outcomes: { reputation: 3, description: 'Your community appreciates the acknowledgment.' },
      },
    ],
    triggerConditions: { minSubscribers: 250, probability: 0.1 },
    cooldownWeeks: 4,
  },
];

export interface ActiveEvent {
  event: EventDefinition;
  triggeredAt: number;
  expiresAt?: number;
}

export interface EventCooldown {
  eventId: string;
  expiresAtWeek: number;
}

export interface EventManagerState {
  activeEvents: ActiveEvent[];
  cooldowns: EventCooldown[];
  eventHistory: { eventId: string; choiceId: string; week: number }[];
}

export function checkEventTrigger(
  event: EventDefinition,
  subscribers: number,
  week: number,
  reputation: number,
  niche: ContentNiche,
  cooldowns: EventCooldown[]
): boolean {
  const cooldown = cooldowns.find((c) => c.eventId === event.id);
  if (cooldown && cooldown.expiresAtWeek > week) {
    return false;
  }

  const conditions = event.triggerConditions;

  if (conditions.minSubscribers !== undefined && subscribers < conditions.minSubscribers) {
    return false;
  }
  if (conditions.maxSubscribers !== undefined && subscribers > conditions.maxSubscribers) {
    return false;
  }
  if (conditions.minWeek !== undefined && week < conditions.minWeek) {
    return false;
  }
  if (conditions.maxWeek !== undefined && week > conditions.maxWeek) {
    return false;
  }
  if (conditions.minReputation !== undefined && reputation < conditions.minReputation) {
    return false;
  }
  if (conditions.maxReputation !== undefined && reputation > conditions.maxReputation) {
    return false;
  }
  if (conditions.requiredNiche !== undefined && niche !== conditions.requiredNiche) {
    return false;
  }

  return Math.random() < conditions.probability;
}

export function getEligibleEvents(
  subscribers: number,
  week: number,
  reputation: number,
  niche: ContentNiche,
  cooldowns: EventCooldown[],
  activeEventIds: string[]
): EventDefinition[] {
  return EVENT_DEFINITIONS.filter((event) => {
    if (activeEventIds.includes(event.id)) {
      return false;
    }
    return checkEventTrigger(event, subscribers, week, reputation, niche, cooldowns);
  });
}

export function rollForEvents(
  subscribers: number,
  week: number,
  reputation: number,
  niche: ContentNiche,
  cooldowns: EventCooldown[],
  activeEventIds: string[],
  maxEvents: number = 1
): EventDefinition[] {
  const eligible = getEligibleEvents(subscribers, week, reputation, niche, cooldowns, activeEventIds);
  const triggered: EventDefinition[] = [];

  const shuffled = [...eligible].sort(() => Math.random() - 0.5);

  for (const event of shuffled) {
    if (triggered.length >= maxEvents) break;
    triggered.push(event);
  }

  return triggered;
}

export function applyEventOutcome(
  choice: EventChoice,
  currentMoney: number
): { canApply: boolean; outcome: EventOutcome } {
  if (choice.requiredMoney !== undefined && currentMoney < choice.requiredMoney) {
    return {
      canApply: false,
      outcome: { description: 'Not enough money for this choice.' },
    };
  }
  return { canApply: true, outcome: choice.outcomes };
}

export function calculateCooldownExpiry(currentWeek: number, cooldownWeeks: number): number {
  return currentWeek + cooldownWeeks;
}

export function getEventsByCategory(category: EventCategory): EventDefinition[] {
  return EVENT_DEFINITIONS.filter((e) => e.category === category);
}

export function getEventsBySeverity(severity: EventSeverity): EventDefinition[] {
  return EVENT_DEFINITIONS.filter((e) => e.severity === severity);
}

export function getEventsByType(type: EventType): EventDefinition[] {
  return EVENT_DEFINITIONS.filter((e) => e.type === type);
}

export function getControversyEvents(): EventDefinition[] {
  return EVENT_DEFINITIONS.filter(
    (e) => e.type === EventType.Controversy && e.controversyType !== undefined
  );
}

export function mapChoiceToResponse(choiceId: string): ControversyResponse | null {
  if (choiceId === 'address_directly') return 'address_directly';
  if (choiceId.includes('apolog')) return 'apologize';
  if (choiceId.includes('double_down') || choiceId === 'fire_back') return 'double_down';
  if (choiceId.includes('ignore') || choiceId === 'stay_silent' || choiceId === 'wait_it_out') return 'ignore';
  return null;
}

export function applyNicheModifierToOutcome(
  outcome: EventOutcome,
  niche: ContentNiche,
  responseType: ControversyResponse
): EventOutcome {
  const modifiers = NICHE_CONTROVERSY_MODIFIERS[niche];
  const modifier = modifiers[responseType] || { reputation: 1, subscribers: 1 };

  const modifiedOutcome: EventOutcome = { ...outcome };

  if (modifiedOutcome.reputation !== undefined) {
    modifiedOutcome.reputation = Math.round(modifiedOutcome.reputation * modifier.reputation);
  }
  if (modifiedOutcome.subscribers !== undefined) {
    modifiedOutcome.subscribers = Math.round(modifiedOutcome.subscribers * modifier.subscribers);
  }

  return modifiedOutcome;
}

export function applyControversyOutcome(
  choice: EventChoice,
  currentMoney: number,
  niche: ContentNiche,
  isControversy: boolean
): { canApply: boolean; outcome: EventOutcome } {
  if (choice.requiredMoney !== undefined && currentMoney < choice.requiredMoney) {
    return {
      canApply: false,
      outcome: { description: 'Not enough money for this choice.' },
    };
  }

  let finalOutcome = { ...choice.outcomes };

  if (isControversy) {
    const responseType = mapChoiceToResponse(choice.id);
    if (responseType) {
      finalOutcome = applyNicheModifierToOutcome(finalOutcome, niche, responseType);
      finalOutcome.description = generateNicheSpecificDescription(
        finalOutcome,
        niche,
        responseType
      );
    }
  }

  return { canApply: true, outcome: finalOutcome };
}

function generateNicheSpecificDescription(
  outcome: EventOutcome,
  niche: ContentNiche,
  responseType: ControversyResponse
): string {
  const nicheNames: Record<ContentNiche, string> = {
    [ContentNiche.Gaming]: 'gaming',
    [ContentNiche.Cooking]: 'cooking',
    [ContentNiche.Music]: 'music',
    [ContentNiche.IRL]: 'IRL',
  };

  const nicheName = nicheNames[niche];
  const subChange = outcome.subscribers || 0;
  const repChange = outcome.reputation || 0;

  if (responseType === 'apologize') {
    if (niche === ContentNiche.IRL) {
      return `Your ${nicheName} audience values authenticity. The apology resonated deeply. Rep: ${repChange}, Subs: ${subChange}`;
    }
    if (niche === ContentNiche.Cooking) {
      return `Your wholesome ${nicheName} community appreciated the maturity. Rep: ${repChange}, Subs: ${subChange}`;
    }
    if (niche === ContentNiche.Gaming) {
      return `Your ${nicheName} viewers found the apology okay but some saw it as soft. Rep: ${repChange}, Subs: ${subChange}`;
    }
    return `Your ${nicheName} audience had mixed reactions to the apology. Rep: ${repChange}, Subs: ${subChange}`;
  }

  if (responseType === 'double_down') {
    if (niche === ContentNiche.Gaming) {
      return `Some ${nicheName} fans respect standing your ground, but many still left. Rep: ${repChange}, Subs: ${subChange}`;
    }
    if (niche === ContentNiche.IRL) {
      return `Your ${nicheName} audience expects accountability. Doubling down hurt badly. Rep: ${repChange}, Subs: ${subChange}`;
    }
    if (niche === ContentNiche.Cooking) {
      return `Your family-friendly ${nicheName} audience was shocked. Major damage. Rep: ${repChange}, Subs: ${subChange}`;
    }
    return `Your ${nicheName} community was divided by your stance. Rep: ${repChange}, Subs: ${subChange}`;
  }

  if (responseType === 'ignore') {
    if (niche === ContentNiche.IRL) {
      return `Your ${nicheName} viewers expected engagement. Silence was seen as dismissive. Rep: ${repChange}, Subs: ${subChange}`;
    }
    if (niche === ContentNiche.Gaming) {
      return `Your ${nicheName} community moved on fairly quickly. Rep: ${repChange}, Subs: ${subChange}`;
    }
    return `Your ${nicheName} audience gradually lost interest in the drama. Rep: ${repChange}, Subs: ${subChange}`;
  }

  if (responseType === 'address_directly') {
    if (niche === ContentNiche.IRL) {
      return `Your ${nicheName} audience loved the transparent approach. Direct wins! Rep: ${repChange}, Subs: ${subChange}`;
    }
    if (niche === ContentNiche.Cooking) {
      return `Your ${nicheName} community appreciated the honest conversation. Rep: ${repChange}, Subs: ${subChange}`;
    }
    if (niche === ContentNiche.Gaming) {
      return `Your ${nicheName} viewers respected the direct approach. Rep: ${repChange}, Subs: ${subChange}`;
    }
    return `Your ${nicheName} audience valued your straightforward communication. Rep: ${repChange}, Subs: ${subChange}`;
  }

  return outcome.description;
}

export interface ControversyResult {
  outcome: EventOutcome;
  nicheImpact: string;
  responseType: ControversyResponse;
}

export function resolveControversy(
  event: EventDefinition,
  choice: EventChoice,
  niche: ContentNiche,
  currentMoney: number
): { success: boolean; result: ControversyResult | null; error?: string } {
  if (choice.requiredMoney !== undefined && currentMoney < choice.requiredMoney) {
    return {
      success: false,
      result: null,
      error: 'Not enough money for this choice.',
    };
  }

  const responseType = mapChoiceToResponse(choice.id);
  if (!responseType) {
    return {
      success: true,
      result: {
        outcome: choice.outcomes,
        nicheImpact: 'Standard response applied.',
        responseType: 'ignore',
      },
    };
  }

  const modifiedOutcome = applyNicheModifierToOutcome(choice.outcomes, niche, responseType);
  const description = generateNicheSpecificDescription(modifiedOutcome, niche, responseType);

  return {
    success: true,
    result: {
      outcome: { ...modifiedOutcome, description },
      nicheImpact: getNicheImpactExplanation(niche, responseType),
      responseType,
    },
  };
}

function getNicheImpactExplanation(niche: ContentNiche, responseType: ControversyResponse): string {
  const explanations: Record<ContentNiche, Record<ControversyResponse, string>> = {
    [ContentNiche.Gaming]: {
      apologize: 'Gaming audiences are more tolerant of drama but may see apologies as weak.',
      double_down: 'Some gamers respect not backing down, softening the blow slightly.',
      ignore: 'Gaming communities often move on quickly to the next controversy.',
      address_directly: 'Direct communication works well with gaming audiences.',
    },
    [ContentNiche.Cooking]: {
      apologize: 'Cooking audiences value warmth and forgiveness. Apologies are well-received.',
      double_down: 'Family-friendly cooking audiences react very negatively to confrontation.',
      ignore: 'Cooking viewers prefer resolution but will wait patiently.',
      address_directly: 'Cooking audiences appreciate honest, heartfelt communication.',
    },
    [ContentNiche.Music]: {
      apologize: 'Music audiences have balanced reactions to apologies.',
      double_down: 'Creative communities can be divided on artistic integrity vs accountability.',
      ignore: 'Music fans may interpret silence as artistic temperament.',
      address_directly: 'Music audiences value authenticity in communication.',
    },
    [ContentNiche.IRL]: {
      apologize: 'IRL audiences strongly value authenticity. Sincere apologies gain major respect.',
      double_down: 'IRL viewers expect real accountability. Doubling down is severely punished.',
      ignore: 'IRL communities expect engagement. Silence is seen as hiding something.',
      address_directly: 'IRL audiences highly value transparent, direct communication.',
    },
  };

  return explanations[niche][responseType];
}
