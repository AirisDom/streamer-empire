import { describe, it, expect } from 'vitest';
import {
  calculateStreamResults,
  formatStreamDuration,
  getPerformanceColor,
  getPerformanceDescription,
  StreamPerformanceInput,
} from './streamResults';
import { ContentNiche, StreamSession, Equipment, EquipmentCategory, EquipmentTier, Staff, StaffRole } from '../types';

function createMockSession(): StreamSession {
  return {
    id: 'test-session',
    title: 'Test Stream',
    niche: ContentNiche.Gaming,
    startTime: Date.now() - 3600000,
    peakViewers: 0,
    averageViewers: 0,
    newSubscribers: 0,
    donations: 0,
    chatMessages: [],
    events: [],
  };
}

function createMockEquipment(): Equipment[] {
  return [
    {
      id: 'camera_basic',
      name: 'USB Webcam',
      category: EquipmentCategory.Camera,
      tier: EquipmentTier.Basic,
      price: 75,
      qualityBonus: 15,
      description: 'A basic webcam',
      asset: 'camera_usb',
    },
    {
      id: 'mic_basic',
      name: 'USB Headset',
      category: EquipmentCategory.Microphone,
      tier: EquipmentTier.Basic,
      price: 50,
      qualityBonus: 15,
      description: 'A basic headset',
      asset: 'mic_headset',
    },
  ];
}

function createMockStaff(): Staff[] {
  return [
    {
      id: 'mod1',
      name: 'Test Mod',
      role: StaffRole.Moderator,
      salary: 200,
      skill: 5,
      perks: [],
      hiredAt: Date.now(),
    },
  ];
}

function createDefaultInput(): StreamPerformanceInput {
  return {
    session: createMockSession(),
    equipment: createMockEquipment(),
    staff: createMockStaff(),
    currentViewers: 50,
    peakViewers: 80,
    chatHealth: 75,
    hype: 60,
    newSubs: 5,
    elapsedSeconds: 1800,
  };
}

describe('calculateStreamResults', () => {
  it('calculates basic stream results', () => {
    const input = createDefaultInput();
    const results = calculateStreamResults(input);

    expect(results.streamId).toBe('test-session');
    expect(results.title).toBe('Test Stream');
    expect(results.niche).toBe(ContentNiche.Gaming);
    expect(results.duration).toBe(1800);
    expect(results.peakViewers).toBe(80);
    expect(results.newSubscribers).toBeGreaterThanOrEqual(5);
  });

  it('calculates revenue based on viewers and hype', () => {
    const input = createDefaultInput();
    const results = calculateStreamResults(input);

    expect(results.donationRevenue).toBeGreaterThanOrEqual(0);
    expect(results.adRevenue).toBeGreaterThanOrEqual(0);
    expect(results.totalRevenue).toBe(results.donationRevenue + results.adRevenue);
  });

  it('awards healthy chat bonus when chat health is 90+', () => {
    const input = createDefaultInput();
    input.chatHealth = 95;
    const results = calculateStreamResults(input);

    const healthyBonus = results.bonuses.find(b => b.name === 'Healthy Chat');
    expect(healthyBonus).toBeDefined();
    expect(healthyBonus?.type).toBe('revenue');
  });

  it('awards hype train bonus when hype is 80+', () => {
    const input = createDefaultInput();
    input.hype = 85;
    const results = calculateStreamResults(input);

    const hypeBonus = results.bonuses.find(b => b.name === 'Hype Train');
    expect(hypeBonus).toBeDefined();
    expect(hypeBonus?.type).toBe('subscribers');
  });

  it('awards marathon bonus for streams over 1 hour', () => {
    const input = createDefaultInput();
    input.elapsedSeconds = 3700;
    const results = calculateStreamResults(input);

    const marathonBonus = results.bonuses.find(b => b.name === 'Marathon Stream');
    expect(marathonBonus).toBeDefined();
    expect(marathonBonus?.value).toBe(50);
    expect(marathonBonus?.type).toBe('experience');
  });

  it('awards crowd pleaser bonus for 100+ peak viewers', () => {
    const input = createDefaultInput();
    input.peakViewers = 150;
    const results = calculateStreamResults(input);

    const crowdBonus = results.bonuses.find(b => b.name === 'Crowd Pleaser');
    expect(crowdBonus).toBeDefined();
    expect(crowdBonus?.value).toBe(25);
  });

  it('calculates experience based on duration, subs, and revenue', () => {
    const input = createDefaultInput();
    const results = calculateStreamResults(input);

    expect(results.experienceGained).toBeGreaterThan(0);
  });

  it('assigns performance rating based on overall metrics', () => {
    const input = createDefaultInput();
    const results = calculateStreamResults(input);

    expect(['S', 'A', 'B', 'C', 'D', 'F']).toContain(results.performanceRating);
  });

  it('gives higher rating for excellent performance', () => {
    const input = createDefaultInput();
    input.chatHealth = 95;
    input.hype = 90;
    input.peakViewers = 200;
    const results = calculateStreamResults(input);

    expect(['S', 'A']).toContain(results.performanceRating);
  });

  it('gives lower rating for poor performance', () => {
    const input = createDefaultInput();
    input.chatHealth = 20;
    input.hype = 10;
    input.peakViewers = 5;
    input.newSubs = 0;
    const results = calculateStreamResults(input);

    expect(['D', 'F']).toContain(results.performanceRating);
  });

  it('applies equipment quality bonus to calculations', () => {
    const inputWithEquipment = createDefaultInput();
    const inputWithoutEquipment = createDefaultInput();
    inputWithoutEquipment.equipment = [];

    const resultsWithEquipment = calculateStreamResults(inputWithEquipment);
    const resultsWithoutEquipment = calculateStreamResults(inputWithoutEquipment);

    expect(resultsWithEquipment.donationRevenue).toBeGreaterThanOrEqual(resultsWithoutEquipment.donationRevenue);
  });
});

describe('formatStreamDuration', () => {
  it('formats seconds only', () => {
    expect(formatStreamDuration(45)).toBe('45s');
  });

  it('formats minutes and seconds', () => {
    expect(formatStreamDuration(125)).toBe('2m 5s');
  });

  it('formats hours, minutes, and seconds', () => {
    expect(formatStreamDuration(3665)).toBe('1h 1m 5s');
  });

  it('handles zero seconds', () => {
    expect(formatStreamDuration(0)).toBe('0s');
  });

  it('handles exact hour', () => {
    expect(formatStreamDuration(3600)).toBe('1h 0m 0s');
  });
});

describe('getPerformanceColor', () => {
  it('returns yellow for S rating', () => {
    expect(getPerformanceColor('S')).toBe('text-yellow-400');
  });

  it('returns green for A rating', () => {
    expect(getPerformanceColor('A')).toBe('text-green-400');
  });

  it('returns blue for B rating', () => {
    expect(getPerformanceColor('B')).toBe('text-blue-400');
  });

  it('returns zinc for C rating', () => {
    expect(getPerformanceColor('C')).toBe('text-zinc-300');
  });

  it('returns orange for D rating', () => {
    expect(getPerformanceColor('D')).toBe('text-orange-400');
  });

  it('returns red for F rating', () => {
    expect(getPerformanceColor('F')).toBe('text-red-400');
  });
});

describe('getPerformanceDescription', () => {
  it('returns appropriate descriptions for each rating', () => {
    expect(getPerformanceDescription('S')).toBe('Legendary stream!');
    expect(getPerformanceDescription('A')).toBe('Excellent performance!');
    expect(getPerformanceDescription('B')).toBe('Good stream overall');
    expect(getPerformanceDescription('C')).toBe('Average performance');
    expect(getPerformanceDescription('D')).toBe('Needs improvement');
    expect(getPerformanceDescription('F')).toBe('Rough stream...');
  });
});
