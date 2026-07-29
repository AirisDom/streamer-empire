import { Staff, StaffPerk, StaffRole } from '../types';

export interface StaffTemplate {
  role: StaffRole;
  baseSalary: number;
  salaryVariance: number;
  minSkill: number;
  maxSkill: number;
}

export const STAFF_TEMPLATES: Record<StaffRole, StaffTemplate> = {
  [StaffRole.Editor]: {
    role: StaffRole.Editor,
    baseSalary: 500,
    salaryVariance: 200,
    minSkill: 1,
    maxSkill: 10,
  },
  [StaffRole.Moderator]: {
    role: StaffRole.Moderator,
    baseSalary: 200,
    salaryVariance: 100,
    minSkill: 1,
    maxSkill: 10,
  },
  [StaffRole.Manager]: {
    role: StaffRole.Manager,
    baseSalary: 800,
    salaryVariance: 400,
    minSkill: 1,
    maxSkill: 10,
  },
  [StaffRole.Designer]: {
    role: StaffRole.Designer,
    baseSalary: 400,
    salaryVariance: 150,
    minSkill: 1,
    maxSkill: 10,
  },
};

export const EDITOR_PERKS: StaffPerk[] = [
  {
    id: 'perk_fast_turnaround',
    name: 'Fast Turnaround',
    description: 'Reduces content prep time by 20%',
    effect: { contentPrepTimeReduction: 0.2 },
  },
  {
    id: 'perk_viral_cuts',
    name: 'Viral Cuts',
    description: 'Increases chance of clips going viral by 15%',
    effect: { viralChanceBonus: 0.15 },
  },
  {
    id: 'perk_thumbnail_master',
    name: 'Thumbnail Master',
    description: 'Boosts click-through rate by 10%',
    effect: { clickThroughBonus: 0.1 },
  },
  {
    id: 'perk_batch_processor',
    name: 'Batch Processor',
    description: 'Can edit multiple videos at once, reducing queue time by 25%',
    effect: { queueTimeReduction: 0.25 },
  },
  {
    id: 'perk_trend_spotter',
    name: 'Trend Spotter',
    description: 'Identifies trending formats, boosting engagement by 12%',
    effect: { engagementBonus: 0.12 },
  },
];

export const MODERATOR_PERKS: StaffPerk[] = [
  {
    id: 'perk_chat_guardian',
    name: 'Chat Guardian',
    description: 'Improves chat health by 25%',
    effect: { chatHealthBonus: 0.25 },
  },
  {
    id: 'perk_hype_builder',
    name: 'Hype Builder',
    description: 'Increases viewer engagement during streams by 15%',
    effect: { viewerEngagementBonus: 0.15 },
  },
  {
    id: 'perk_troll_hunter',
    name: 'Troll Hunter',
    description: 'Reduces negative events from chat by 30%',
    effect: { trollEventReduction: 0.3 },
  },
  {
    id: 'perk_community_builder',
    name: 'Community Builder',
    description: 'Increases subscriber retention by 10%',
    effect: { subscriberRetentionBonus: 0.1 },
  },
  {
    id: 'perk_event_coordinator',
    name: 'Event Coordinator',
    description: 'Raid and collab events are 20% more effective',
    effect: { eventEffectivenessBonus: 0.2 },
  },
];

export const MANAGER_PERKS: StaffPerk[] = [
  {
    id: 'perk_deal_closer',
    name: 'Deal Closer',
    description: 'Increases brand deal payouts by 20%',
    effect: { brandDealPayoutBonus: 0.2 },
  },
  {
    id: 'perk_negotiator',
    name: 'Negotiator',
    description: 'Better contract terms, reducing exclusivity requirements',
    effect: { contractFlexibilityBonus: 0.25 },
  },
  {
    id: 'perk_network_connector',
    name: 'Network Connector',
    description: 'Increases collab opportunities by 30%',
    effect: { collabChanceBonus: 0.3 },
  },
  {
    id: 'perk_crisis_manager',
    name: 'Crisis Manager',
    description: 'Reduces reputation damage from controversies by 40%',
    effect: { controversyDamageReduction: 0.4 },
  },
  {
    id: 'perk_sponsorship_magnet',
    name: 'Sponsorship Magnet',
    description: 'Attracts 25% more brand deal offers',
    effect: { brandDealFrequencyBonus: 0.25 },
  },
];

export const DESIGNER_PERKS: StaffPerk[] = [
  {
    id: 'perk_brand_identity',
    name: 'Brand Identity',
    description: 'Improves channel recognition, boosting new follower rate by 15%',
    effect: { followerGrowthBonus: 0.15 },
  },
  {
    id: 'perk_overlay_expert',
    name: 'Overlay Expert',
    description: 'Professional overlays increase perceived quality by 20%',
    effect: { perceivedQualityBonus: 0.2 },
  },
  {
    id: 'perk_emote_creator',
    name: 'Emote Creator',
    description: 'Custom emotes boost subscriber satisfaction by 15%',
    effect: { subscriberSatisfactionBonus: 0.15 },
  },
  {
    id: 'perk_merch_designer',
    name: 'Merch Designer',
    description: 'Unlocks merchandise revenue stream with 10% bonus',
    effect: { merchRevenueBonus: 0.1 },
  },
];

const PERKS_BY_ROLE: Record<StaffRole, StaffPerk[]> = {
  [StaffRole.Editor]: EDITOR_PERKS,
  [StaffRole.Moderator]: MODERATOR_PERKS,
  [StaffRole.Manager]: MANAGER_PERKS,
  [StaffRole.Designer]: DESIGNER_PERKS,
};

const FIRST_NAMES = [
  'Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Quinn', 'Avery',
  'Sage', 'Phoenix', 'River', 'Skyler', 'Cameron', 'Dakota', 'Finley', 'Harper',
  'Hayden', 'Jamie', 'Jesse', 'Kendall', 'Logan', 'Marley', 'Peyton', 'Reese',
  'Sam', 'Sydney', 'Tatum', 'Blake', 'Charlie', 'Drew', 'Ellis', 'Frankie',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Thompson', 'White', 'Harris', 'Clark', 'Lewis', 'Walker', 'Hall',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Green', 'Baker', 'Adams',
];

function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function pickRandomSubset<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, array.length));
}

function generateStaffName(): string {
  return `${pickRandom(FIRST_NAMES)} ${pickRandom(LAST_NAMES)}`;
}

function calculateSalary(template: StaffTemplate, skill: number): number {
  const skillMultiplier = 1 + (skill - 1) * 0.15;
  const variance = randomInRange(-template.salaryVariance, template.salaryVariance);
  return Math.round((template.baseSalary * skillMultiplier + variance) / 10) * 10;
}

function determinePerkCount(skill: number): number {
  if (skill >= 9) return 3;
  if (skill >= 6) return 2;
  if (skill >= 3) return 1;
  return Math.random() > 0.5 ? 1 : 0;
}

export function generateStaffCandidate(role: StaffRole): Staff {
  const template = STAFF_TEMPLATES[role];
  const availablePerks = PERKS_BY_ROLE[role];
  const skill = randomInRange(template.minSkill, template.maxSkill);
  const perkCount = determinePerkCount(skill);
  const perks = pickRandomSubset(availablePerks, perkCount);

  return {
    id: crypto.randomUUID(),
    name: generateStaffName(),
    role,
    salary: calculateSalary(template, skill),
    skill,
    perks,
    hiredAt: 0,
  };
}

export function generateHiringPool(poolSize: number = 6): Staff[] {
  const pool: Staff[] = [];
  const roles = [StaffRole.Editor, StaffRole.Moderator, StaffRole.Manager];

  const rolesPerType = Math.max(1, Math.floor(poolSize / roles.length));
  const remainder = poolSize - rolesPerType * roles.length;

  for (const role of roles) {
    for (let i = 0; i < rolesPerType; i++) {
      pool.push(generateStaffCandidate(role));
    }
  }

  for (let i = 0; i < remainder; i++) {
    pool.push(generateStaffCandidate(pickRandom(roles)));
  }

  return pool.sort(() => Math.random() - 0.5);
}

export function generateRoleSpecificPool(role: StaffRole, count: number = 3): Staff[] {
  const pool: Staff[] = [];
  for (let i = 0; i < count; i++) {
    pool.push(generateStaffCandidate(role));
  }
  return pool;
}

export function refreshHiringPool(
  currentPool: Staff[],
  refreshCount: number = 2
): Staff[] {
  const keepCount = Math.max(0, currentPool.length - refreshCount);
  const kept = currentPool.slice(0, keepCount);
  const newCandidates: Staff[] = [];

  const roles = [StaffRole.Editor, StaffRole.Moderator, StaffRole.Manager];
  for (let i = 0; i < refreshCount; i++) {
    newCandidates.push(generateStaffCandidate(pickRandom(roles)));
  }

  return [...kept, ...newCandidates].sort(() => Math.random() - 0.5);
}

export function getStaffEffectValue(staff: Staff[], effectKey: string): number {
  let total = 0;
  for (const member of staff) {
    for (const perk of member.perks) {
      if (effectKey in perk.effect) {
        total += perk.effect[effectKey];
      }
    }
  }
  return total;
}

export function getStaffByRole(staff: Staff[], role: StaffRole): Staff[] {
  return staff.filter((s) => s.role === role);
}

export function calculateTotalSalaries(staff: Staff[]): number {
  return staff.reduce((total, s) => total + s.salary, 0);
}

export function getAverageSkillByRole(staff: Staff[], role: StaffRole): number {
  const roleStaff = getStaffByRole(staff, role);
  if (roleStaff.length === 0) return 0;
  return roleStaff.reduce((sum, s) => sum + s.skill, 0) / roleStaff.length;
}

export function getRoleDisplayName(role: StaffRole): string {
  const names: Record<StaffRole, string> = {
    [StaffRole.Editor]: 'Editor',
    [StaffRole.Moderator]: 'Moderator',
    [StaffRole.Manager]: 'Manager',
    [StaffRole.Designer]: 'Designer',
  };
  return names[role];
}

export function getRoleDescription(role: StaffRole): string {
  const descriptions: Record<StaffRole, string> = {
    [StaffRole.Editor]: 'Reduces content prep time and improves video quality',
    [StaffRole.Moderator]: 'Improves chat health and viewer engagement',
    [StaffRole.Manager]: 'Boosts brand deals and handles business negotiations',
    [StaffRole.Designer]: 'Creates overlays, emotes, and improves channel branding',
  };
  return descriptions[role];
}
