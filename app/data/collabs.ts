import { ContentNiche, Equipment } from '../types';
import { calculateTotalQualityBonus } from './equipment';

export interface CollabPartner {
  id: string;
  name: string;
  niche: ContentNiche;
  subscribers: number;
  reputation: number;
  equipmentQuality: number;
  personality: CollabPersonality;
}

export type CollabPersonality = 'chill' | 'energetic' | 'professional' | 'chaotic';

export type CollabType = 'guest_appearance' | 'joint_stream' | 'collab_series' | 'crossover_event';

export interface CollabOffer {
  id: string;
  partner: CollabPartner;
  type: CollabType;
  isIncoming: boolean;
  expiresAt: number;
  nicheCompatibility: number;
}

export interface CollabResult {
  subscribersGained: number;
  reputationChange: number;
  experienceGained: number;
  successLevel: CollabSuccessLevel;
  partnerSatisfaction: number;
  message: string;
}

export type CollabSuccessLevel = 'disaster' | 'awkward' | 'decent' | 'great' | 'legendary';

const PARTNER_NAMES_GAMING = [
  'StreamerKing', 'ProPlayz', 'GameMasterX', 'PixelQueen', 'NightGamer',
  'SpeedrunSam', 'LootLord', 'CritMaster', 'BossSlayer', 'ComboKing',
  'GGLegend', 'DigitalDuke', 'VirtualVictor', 'ArcadeAce', 'ConsoleChamp',
];

const PARTNER_NAMES_COOKING = [
  'ChefElite', 'FlavorQueen', 'KitchenWizard', 'TasteMaster', 'SpiceSage',
  'GourmetGuru', 'BakesBetter', 'SousChefStar', 'RecipeRoyalty', 'FoodieFame',
  'CulinaryChamp', 'PlatePerfect', 'SeasonedPro', 'MixMaster', 'DishDiva',
];

const PARTNER_NAMES_MUSIC = [
  'BeatDropper', 'MelodyMaven', 'SoundSage', 'RhythmRoyal', 'TunesTitan',
  'HarmonyHero', 'BassBoss', 'NoteNinja', 'ChordChaser', 'SynthStar',
  'GrooveGod', 'VocalVirtuoso', 'TrackMaster', 'MixMonarch', 'AudioAce',
];

const PARTNER_NAMES_IRL = [
  'RealTalkRay', 'StreetStar', 'VibeVlogger', 'LifeLens', 'UrbanIcon',
  'TravelTrend', 'DailyDose', 'AuthenticAlex', 'JourneyJen', 'MomentMaker',
  'StorySeeker', 'ExplorePro', 'TruthTeller', 'LiveLifeLou', 'AdventurAce',
];

const NICHE_COMPATIBILITY_MATRIX: Record<ContentNiche, Record<ContentNiche, number>> = {
  [ContentNiche.Gaming]: {
    [ContentNiche.Gaming]: 1.0,
    [ContentNiche.Cooking]: 0.4,
    [ContentNiche.Music]: 0.7,
    [ContentNiche.IRL]: 0.6,
  },
  [ContentNiche.Cooking]: {
    [ContentNiche.Gaming]: 0.4,
    [ContentNiche.Cooking]: 1.0,
    [ContentNiche.Music]: 0.5,
    [ContentNiche.IRL]: 0.8,
  },
  [ContentNiche.Music]: {
    [ContentNiche.Gaming]: 0.7,
    [ContentNiche.Cooking]: 0.5,
    [ContentNiche.Music]: 1.0,
    [ContentNiche.IRL]: 0.7,
  },
  [ContentNiche.IRL]: {
    [ContentNiche.Gaming]: 0.6,
    [ContentNiche.Cooking]: 0.8,
    [ContentNiche.Music]: 0.7,
    [ContentNiche.IRL]: 1.0,
  },
};

const COLLAB_TYPE_MULTIPLIERS: Record<CollabType, { subMultiplier: number; repMultiplier: number; xpMultiplier: number }> = {
  guest_appearance: { subMultiplier: 0.5, repMultiplier: 0.5, xpMultiplier: 0.5 },
  joint_stream: { subMultiplier: 1.0, repMultiplier: 1.0, xpMultiplier: 1.0 },
  collab_series: { subMultiplier: 1.5, repMultiplier: 1.5, xpMultiplier: 1.5 },
  crossover_event: { subMultiplier: 2.0, repMultiplier: 2.0, xpMultiplier: 2.0 },
};

function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getPartnerName(niche: ContentNiche): string {
  const namesByNiche: Record<ContentNiche, string[]> = {
    [ContentNiche.Gaming]: PARTNER_NAMES_GAMING,
    [ContentNiche.Cooking]: PARTNER_NAMES_COOKING,
    [ContentNiche.Music]: PARTNER_NAMES_MUSIC,
    [ContentNiche.IRL]: PARTNER_NAMES_IRL,
  };
  return pickRandom(namesByNiche[niche]);
}

export function generateCollabPartner(
  playerSubscribers: number,
  playerNiche: ContentNiche,
  sizeCategory: 'smaller' | 'similar' | 'larger'
): CollabPartner {
  const niches = Object.values(ContentNiche);
  const partnerNiche = Math.random() > 0.6 ? playerNiche : pickRandom(niches);

  const sizeRanges = {
    smaller: { min: 0.2, max: 0.7 },
    similar: { min: 0.7, max: 1.3 },
    larger: { min: 1.5, max: 4.0 },
  };

  const range = sizeRanges[sizeCategory];
  const multiplier = range.min + Math.random() * (range.max - range.min);
  const subscribers = Math.max(50, Math.floor(playerSubscribers * multiplier));

  const reputation = 35 + Math.floor(Math.random() * 50);
  const equipmentQuality = 20 + Math.floor(Math.random() * 60);

  const personalities: CollabPersonality[] = ['chill', 'energetic', 'professional', 'chaotic'];

  return {
    id: crypto.randomUUID(),
    name: getPartnerName(partnerNiche),
    niche: partnerNiche,
    subscribers,
    reputation,
    equipmentQuality,
    personality: pickRandom(personalities),
  };
}

export function calculateNicheCompatibility(playerNiche: ContentNiche, partnerNiche: ContentNiche): number {
  return NICHE_COMPATIBILITY_MATRIX[playerNiche][partnerNiche];
}

export function calculateEquipmentCompatibility(
  playerEquipmentQuality: number,
  partnerEquipmentQuality: number
): number {
  const qualityDiff = Math.abs(playerEquipmentQuality - partnerEquipmentQuality);
  if (qualityDiff <= 10) return 1.0;
  if (qualityDiff <= 25) return 0.85;
  if (qualityDiff <= 50) return 0.7;
  return 0.5;
}

export function calculateCollabSuccessScore(
  nicheCompatibility: number,
  equipmentCompatibility: number,
  playerReputation: number,
  partnerReputation: number
): number {
  const reputationAvg = (playerReputation + partnerReputation) / 200;
  const baseScore = nicheCompatibility * 0.4 + equipmentCompatibility * 0.3 + reputationAvg * 0.3;
  const variance = (Math.random() - 0.5) * 0.2;
  return Math.max(0, Math.min(1, baseScore + variance));
}

export function determineSuccessLevel(score: number): CollabSuccessLevel {
  if (score < 0.2) return 'disaster';
  if (score < 0.4) return 'awkward';
  if (score < 0.6) return 'decent';
  if (score < 0.8) return 'great';
  return 'legendary';
}

export function calculateSubscribersGained(
  partnerSubscribers: number,
  successScore: number,
  nicheCompatibility: number,
  collabType: CollabType
): number {
  const baseConversion = 0.03;
  const compatibilityBonus = nicheCompatibility * 0.02;
  const successBonus = successScore * 0.03;
  const totalRate = baseConversion + compatibilityBonus + successBonus;

  const typeMultiplier = COLLAB_TYPE_MULTIPLIERS[collabType].subMultiplier;
  const rawGain = partnerSubscribers * totalRate * typeMultiplier;

  return Math.max(1, Math.floor(rawGain));
}

export function calculateReputationChange(
  successLevel: CollabSuccessLevel,
  partnerReputation: number,
  collabType: CollabType
): number {
  const baseChanges: Record<CollabSuccessLevel, number> = {
    disaster: -8,
    awkward: -2,
    decent: 2,
    great: 5,
    legendary: 10,
  };

  const partnerBonus = partnerReputation > 70 ? 2 : partnerReputation > 50 ? 1 : 0;
  const typeMultiplier = COLLAB_TYPE_MULTIPLIERS[collabType].repMultiplier;

  return Math.round((baseChanges[successLevel] + partnerBonus) * typeMultiplier);
}

export function calculateExperienceGained(
  successLevel: CollabSuccessLevel,
  collabType: CollabType
): number {
  const baseXp: Record<CollabSuccessLevel, number> = {
    disaster: 5,
    awkward: 10,
    decent: 20,
    great: 35,
    legendary: 50,
  };

  const typeMultiplier = COLLAB_TYPE_MULTIPLIERS[collabType].xpMultiplier;
  return Math.floor(baseXp[successLevel] * typeMultiplier);
}

export function generateCollabSuccessMessage(
  successLevel: CollabSuccessLevel,
  partnerName: string,
  subscribersGained: number
): string {
  const messages: Record<CollabSuccessLevel, string[]> = {
    disaster: [
      `The collab with ${partnerName} was a disaster. Technical issues and awkward silences killed the vibe.`,
      `Things got weird during the ${partnerName} collab. Viewers left in droves.`,
      `${partnerName} and you had zero chemistry. The chat was ruthless.`,
    ],
    awkward: [
      `The ${partnerName} collab had some awkward moments, but it wasn't all bad.`,
      `You and ${partnerName} struggled to find your rhythm. A few viewers stuck around though.`,
      `The collab was a bit cringe, but at least you tried. Gained ${subscribersGained} subs.`,
    ],
    decent: [
      `Solid collab with ${partnerName}! Nothing spectacular but viewers enjoyed it. +${subscribersGained} subs.`,
      `The ${partnerName} stream went smoothly. Good content all around!`,
      `Nice chemistry with ${partnerName}. Your audiences meshed well. +${subscribersGained} subs.`,
    ],
    great: [
      `Amazing collab with ${partnerName}! The chat was going wild! +${subscribersGained} subs.`,
      `You and ${partnerName} absolutely crushed it! Clips are already going viral.`,
      `Incredible synergy with ${partnerName}! Viewers loved every minute. +${subscribersGained} subs.`,
    ],
    legendary: [
      `LEGENDARY collab with ${partnerName}! This will go down in streaming history! +${subscribersGained} subs.`,
      `${partnerName} and you created pure magic! The entire platform is talking about it!`,
      `Absolutely iconic collab! ${partnerName}'s fans are flooding your channel! +${subscribersGained} subs.`,
    ],
  };

  return pickRandom(messages[successLevel]);
}

export function generateCollabOffer(
  playerSubscribers: number,
  playerNiche: ContentNiche,
  isIncoming: boolean = true
): CollabOffer {
  const sizeCategory = isIncoming
    ? (Math.random() > 0.7 ? 'larger' : Math.random() > 0.4 ? 'similar' : 'smaller')
    : (Math.random() > 0.5 ? 'smaller' : 'similar');

  const partner = generateCollabPartner(playerSubscribers, playerNiche, sizeCategory);
  const nicheCompatibility = calculateNicheCompatibility(playerNiche, partner.niche);

  const collabTypes: CollabType[] = ['guest_appearance', 'joint_stream', 'collab_series', 'crossover_event'];
  const typeWeights = [0.4, 0.35, 0.2, 0.05];
  let roll = Math.random();
  let collabType: CollabType = 'joint_stream';
  for (let i = 0; i < typeWeights.length; i++) {
    roll -= typeWeights[i];
    if (roll <= 0) {
      collabType = collabTypes[i];
      break;
    }
  }

  return {
    id: crypto.randomUUID(),
    partner,
    type: collabType,
    isIncoming,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    nicheCompatibility,
  };
}

export function processCollab(
  offer: CollabOffer,
  playerReputation: number,
  playerEquipment: Equipment[]
): CollabResult {
  const playerEquipmentQuality = calculateTotalQualityBonus(playerEquipment);
  const equipmentCompatibility = calculateEquipmentCompatibility(
    playerEquipmentQuality,
    offer.partner.equipmentQuality
  );

  const successScore = calculateCollabSuccessScore(
    offer.nicheCompatibility,
    equipmentCompatibility,
    playerReputation,
    offer.partner.reputation
  );

  const successLevel = determineSuccessLevel(successScore);

  const subscribersGained = calculateSubscribersGained(
    offer.partner.subscribers,
    successScore,
    offer.nicheCompatibility,
    offer.type
  );

  const reputationChange = calculateReputationChange(
    successLevel,
    offer.partner.reputation,
    offer.type
  );

  const experienceGained = calculateExperienceGained(successLevel, offer.type);

  const message = generateCollabSuccessMessage(
    successLevel,
    offer.partner.name,
    subscribersGained
  );

  const partnerSatisfaction = successScore * 100;

  return {
    subscribersGained,
    reputationChange,
    experienceGained,
    successLevel,
    partnerSatisfaction,
    message,
  };
}

export function shouldTriggerCollabOffer(
  playerSubscribers: number,
  playerReputation: number,
  currentWeek: number
): boolean {
  if (playerSubscribers < 100) return false;
  if (currentWeek < 2) return false;

  const baseChance = 0.08;
  const subscriberBonus = Math.min(0.04, playerSubscribers / 50000);
  const reputationBonus = playerReputation > 60 ? 0.03 : playerReputation > 40 ? 0.01 : 0;

  const chance = baseChance + subscriberBonus + reputationBonus;
  return Math.random() < chance;
}

export function canInitiateCollab(playerSubscribers: number, playerReputation: number): boolean {
  return playerSubscribers >= 250 && playerReputation >= 35;
}

export function generateOutgoingCollabTargets(
  playerSubscribers: number,
  playerNiche: ContentNiche,
  count: number = 3
): CollabPartner[] {
  const partners: CollabPartner[] = [];
  const sizes: Array<'smaller' | 'similar' | 'larger'> = ['smaller', 'similar', 'smaller'];

  for (let i = 0; i < count; i++) {
    const partner = generateCollabPartner(playerSubscribers, playerNiche, sizes[i % sizes.length]);
    partners.push(partner);
  }

  return partners;
}

export function getCollabTypeDescription(type: CollabType): string {
  const descriptions: Record<CollabType, string> = {
    guest_appearance: 'A brief appearance on each other\'s streams. Low commitment, modest exposure.',
    joint_stream: 'Stream together for a full session. Balanced risk and reward.',
    collab_series: 'Multiple collaborative streams over time. Higher investment, bigger payoff.',
    crossover_event: 'A major crossover event. Maximum exposure but requires significant planning.',
  };
  return descriptions[type];
}

export function getCollabTypeName(type: CollabType): string {
  const names: Record<CollabType, string> = {
    guest_appearance: 'Guest Appearance',
    joint_stream: 'Joint Stream',
    collab_series: 'Collab Series',
    crossover_event: 'Crossover Event',
  };
  return names[type];
}

export const COLLAB_CHAT_MESSAGES = {
  announcement: [
    'COLLAB HYPE! {partner} is here!',
    'Lets goooo {partner} in the house!',
    'Two legends, one stream!',
    '{partner} collab! This is going to be epic!',
    'COLLAB CONTENT POG',
    'Best crossover since Avengers!',
    '{partner} fans where you at?!',
    'Double the streamers, double the fun!',
  ],
  positive: [
    'These two have such good chemistry!',
    'Best collab ever tbh',
    'Subscribe to {partner} too!',
    'This duo is unstoppable',
    'More collabs please!',
    'Loving this energy!',
    'W collab W stream',
    'Instant follow on {partner}',
  ],
  negative: [
    'Kinda awkward ngl',
    'They don\'t vibe well...',
    'This collab ain\'t it',
    'Cringe collab',
    'Should have collabed with someone else',
    'The energy is off',
  ],
};

export function generateCollabChatMessage(
  partnerName: string,
  isPositive: boolean
): string {
  const templates = isPositive
    ? [...COLLAB_CHAT_MESSAGES.announcement, ...COLLAB_CHAT_MESSAGES.positive]
    : COLLAB_CHAT_MESSAGES.negative;
  const template = pickRandom(templates);
  return template.replace('{partner}', partnerName);
}
