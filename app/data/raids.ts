import { ContentNiche } from '../types';

export interface RaidingChannel {
  name: string;
  subscribers: number;
  niche: ContentNiche;
  reputation: number;
}

export interface IncomingRaid {
  id: string;
  raider: RaidingChannel;
  viewerCount: number;
  timestamp: number;
  potentialNewSubs: number;
  hypeBoost: number;
}

export interface OutgoingRaid {
  id: string;
  target: RaidingChannel;
  viewersSent: number;
  timestamp: number;
  reputationGain: number;
}

const RAIDER_NAMES_GAMING = [
  'ProGamerX', 'NightOwlPlays', 'SpeedRunner99', 'EliteGamer', 'FragMaster',
  'TheChampion', 'LegendaryLoot', 'BossHunter', 'CriticalHit', 'GameBreaker',
  'PixelWarrior', 'LootGoblin', 'HighScoreHero', 'QuestMaster', 'GGPlayer',
];

const RAIDER_NAMES_COOKING = [
  'ChefMaster', 'KitchenKing', 'TastyBites', 'FlavorTown', 'SousChefSam',
  'PastaPrincess', 'GrillGuru', 'BakeQueen', 'SpiceLife', 'FoodieFrenzy',
  'MasterChefMike', 'CulinaryKid', 'RecipeRoyal', 'CookingCraze', 'YummyYum',
];

const RAIDER_NAMES_MUSIC = [
  'BeatMaster', 'MelodyMaker', 'RhythmKing', 'TuneTitan', 'SoundWave',
  'HarmonyHero', 'GrooveGuru', 'NoteNinja', 'ChordChamp', 'VibeVirtual',
  'BassBoost', 'AcousticAce', 'SynthStar', 'DrumDemon', 'VocalVibes',
];

const RAIDER_NAMES_IRL = [
  'IRL_Andy', 'StreetStreamer', 'UrbanExplorer', 'TravelVibes', 'CityWalker',
  'RealLifeRyan', 'OutdoorOllie', 'AdventureAce', 'DailyVlogger', 'LifeLive',
  'JourneyJay', 'WanderlustWes', 'ExplorePro', 'VibeCheck', 'AuthenticAnna',
];

function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomRaiderName(niche: ContentNiche): string {
  const namesByNiche: Record<ContentNiche, string[]> = {
    [ContentNiche.Gaming]: RAIDER_NAMES_GAMING,
    [ContentNiche.Cooking]: RAIDER_NAMES_COOKING,
    [ContentNiche.Music]: RAIDER_NAMES_MUSIC,
    [ContentNiche.IRL]: RAIDER_NAMES_IRL,
  };
  return pickRandom(namesByNiche[niche]);
}

export function generateRaidingChannel(
  playerSubscribers: number,
  niche: ContentNiche,
  raidSize: 'small' | 'medium' | 'large'
): RaidingChannel {
  const sizeMultipliers = {
    small: { minSub: 0.1, maxSub: 0.5 },
    medium: { minSub: 0.5, maxSub: 1.5 },
    large: { minSub: 1.5, maxSub: 5 },
  };

  const mult = sizeMultipliers[raidSize];
  const minSubs = Math.max(10, Math.floor(playerSubscribers * mult.minSub));
  const maxSubs = Math.max(50, Math.floor(playerSubscribers * mult.maxSub));
  const subscriberCount = minSubs + Math.floor(Math.random() * (maxSubs - minSubs));

  const reputation = 40 + Math.floor(Math.random() * 40);

  return {
    name: getRandomRaiderName(niche),
    subscribers: subscriberCount,
    niche,
    reputation,
  };
}

export function calculateIncomingRaidViewers(raider: RaidingChannel): number {
  const baseViewers = Math.floor(raider.subscribers * 0.05);
  const variance = Math.floor(baseViewers * 0.3 * (Math.random() - 0.5));
  return Math.max(5, baseViewers + variance);
}

export function calculateRaidSubConversion(
  viewerCount: number,
  raiderReputation: number,
  playerReputation: number
): number {
  const baseConversionRate = 0.05;
  const reputationBonus = Math.min(0.1, (playerReputation - 40) / 400);
  const compatibilityBonus = raiderReputation > 50 ? 0.02 : 0;
  const totalRate = baseConversionRate + reputationBonus + compatibilityBonus;
  return Math.max(1, Math.floor(viewerCount * totalRate));
}

export function calculateRaidHypeBoost(viewerCount: number): number {
  return Math.min(30, Math.floor(viewerCount / 5) + 5);
}

export function generateIncomingRaid(
  playerSubscribers: number,
  playerReputation: number,
  niche: ContentNiche,
  raidSize: 'small' | 'medium' | 'large' = 'small'
): IncomingRaid {
  const raider = generateRaidingChannel(playerSubscribers, niche, raidSize);
  const viewerCount = calculateIncomingRaidViewers(raider);
  const potentialNewSubs = calculateRaidSubConversion(viewerCount, raider.reputation, playerReputation);
  const hypeBoost = calculateRaidHypeBoost(viewerCount);

  return {
    id: crypto.randomUUID(),
    raider,
    viewerCount,
    timestamp: Date.now(),
    potentialNewSubs,
    hypeBoost,
  };
}

export function canInitiateOutgoingRaid(playerSubscribers: number): boolean {
  return playerSubscribers >= 500;
}

export function generateOutgoingRaidTargets(
  playerSubscribers: number,
  playerNiche: ContentNiche,
  count: number = 3
): RaidingChannel[] {
  const targets: RaidingChannel[] = [];
  const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'small'];

  for (let i = 0; i < count; i++) {
    const target = generateRaidingChannel(playerSubscribers, playerNiche, sizes[i % sizes.length]);
    targets.push(target);
  }

  return targets;
}

export function calculateOutgoingRaidReputationGain(
  playerSubscribers: number,
  targetSubscribers: number
): number {
  const ratio = targetSubscribers / playerSubscribers;
  if (ratio < 0.1) return 1;
  if (ratio < 0.5) return 2;
  if (ratio < 1) return 3;
  return 5;
}

export function calculateViewersSentOnRaid(
  currentViewers: number,
  raidPercentage: number = 0.8
): number {
  return Math.floor(currentViewers * raidPercentage);
}

export interface RaidEventResult {
  subscribersGained: number;
  reputationGained: number;
  hypeBoost: number;
  viewersAdded: number;
}

export function processIncomingRaid(
  raid: IncomingRaid,
  playerWelcomedWarmly: boolean
): RaidEventResult {
  const subscribersGained = playerWelcomedWarmly
    ? raid.potentialNewSubs
    : Math.floor(raid.potentialNewSubs * 0.6);

  const reputationGained = playerWelcomedWarmly ? 3 : 1;
  const hypeBoost = playerWelcomedWarmly ? raid.hypeBoost : Math.floor(raid.hypeBoost * 0.7);

  return {
    subscribersGained,
    reputationGained,
    hypeBoost,
    viewersAdded: raid.viewerCount,
  };
}

export function processOutgoingRaid(
  target: RaidingChannel,
  playerSubscribers: number,
  viewersSent: number
): OutgoingRaid {
  const reputationGain = calculateOutgoingRaidReputationGain(playerSubscribers, target.subscribers);

  return {
    id: crypto.randomUUID(),
    target,
    viewersSent,
    timestamp: Date.now(),
    reputationGain,
  };
}

export const RAID_CHAT_MESSAGES = {
  incoming: [
    '{raider} RAID! Welcome raiders!',
    '{raider} squad is here!',
    'RAIDERS INCOMING from {raider}!',
    'Welcome {raider} viewers!',
    '{raider} raid hype!',
    'Lets go {raider} family!',
    'RAID RAID RAID',
    '{raider} nation in the house!',
    'Big love to {raider}!',
    'Raiders welcome! PogChamp',
  ],
  outgoing: [
    'GG everyone, raiding {target}!',
    'Lets go raid {target}!',
    'RAID TIME! {target} here we come!',
    'Show {target} some love!',
    'Raiding {target}, lets go!',
    'Thanks for watching, off to {target}!',
    '{target} raid lets goooo',
    'Follow {target}!',
  ],
};

export function generateRaidChatMessage(
  type: 'incoming' | 'outgoing',
  channelName: string
): string {
  const templates = RAID_CHAT_MESSAGES[type];
  const template = pickRandom(templates);
  return type === 'incoming'
    ? template.replace('{raider}', channelName)
    : template.replace('{target}', channelName);
}

export function shouldTriggerRandomRaid(
  playerSubscribers: number,
  streamDurationSeconds: number,
  currentHype: number
): boolean {
  if (playerSubscribers < 25) return false;
  if (streamDurationSeconds < 120) return false;

  const baseChance = 0.002;
  const hypeBonus = currentHype > 50 ? 0.001 : 0;
  const subscriberBonus = Math.min(0.002, playerSubscribers / 100000);

  const chance = baseChance + hypeBonus + subscriberBonus;
  return Math.random() < chance;
}

export function determineRaidSize(playerSubscribers: number): 'small' | 'medium' | 'large' {
  const roll = Math.random();
  if (playerSubscribers < 500) {
    return 'small';
  }
  if (playerSubscribers < 5000) {
    return roll < 0.8 ? 'small' : 'medium';
  }
  if (roll < 0.6) return 'small';
  if (roll < 0.9) return 'medium';
  return 'large';
}
