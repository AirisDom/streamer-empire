import { describe, it, expect } from 'vitest';
import {
  TIME_SLOT_INFO,
  NICHE_PEAK_TIMES,
  NICHE_PEAK_BONUS,
  DAYS_OF_WEEK,
  TIME_SLOTS,
  getSlotKey,
  getSlotPopularity,
  getExpectedViewership,
  getViewershipLevel,
  getTimeSlotInfo,
  isNichePeakTime,
  getTimeSlotMultiplier,
  getEquipmentQualityMultiplier,
  calculateProjectedViewership,
  getSimpleProjectedViewers,
  MIN_SLOTS_PER_WEEK,
  MAX_SLOTS_PER_WEEK,
} from './schedule';
import { ContentNiche, Equipment, EquipmentCategory, EquipmentTier } from '../types';

describe('Time Slots', () => {
  it('has 7 days of the week', () => {
    expect(DAYS_OF_WEEK).toHaveLength(7);
    expect(DAYS_OF_WEEK[0]).toBe('Monday');
    expect(DAYS_OF_WEEK[6]).toBe('Sunday');
  });

  it('has 5 time slots per day', () => {
    expect(TIME_SLOTS).toHaveLength(5);
  });

  it('covers morning to night hours', () => {
    const hours = TIME_SLOTS.map(s => s.hour);
    expect(hours).toContain(9);
    expect(hours).toContain(12);
    expect(hours).toContain(15);
    expect(hours).toContain(18);
    expect(hours).toContain(21);
  });

  it('has scheduling constraints defined', () => {
    expect(MIN_SLOTS_PER_WEEK).toBeGreaterThan(0);
    expect(MAX_SLOTS_PER_WEEK).toBeGreaterThan(MIN_SLOTS_PER_WEEK);
  });
});

describe('TIME_SLOT_INFO', () => {
  it('defines info for all time slots', () => {
    for (const slot of TIME_SLOTS) {
      const info = TIME_SLOT_INFO[slot.hour];
      expect(info).toBeDefined();
      expect(info.hour).toBe(slot.hour);
    }
  });

  it('has higher base multipliers for evening/night (prime time)', () => {
    const morningMultiplier = TIME_SLOT_INFO[9].baseMultiplier;
    const eveningMultiplier = TIME_SLOT_INFO[18].baseMultiplier;
    const nightMultiplier = TIME_SLOT_INFO[21].baseMultiplier;

    expect(eveningMultiplier).toBeGreaterThan(morningMultiplier);
    expect(nightMultiplier).toBeGreaterThan(morningMultiplier);
    expect(nightMultiplier).toBeGreaterThan(eveningMultiplier);
  });

  it('marks evening and night as prime time', () => {
    expect(TIME_SLOT_INFO[18].isPrimeTime).toBe(true);
    expect(TIME_SLOT_INFO[21].isPrimeTime).toBe(true);
  });

  it('marks morning and midday as off-hours', () => {
    expect(TIME_SLOT_INFO[9].isPrimeTime).toBe(false);
    expect(TIME_SLOT_INFO[12].isPrimeTime).toBe(false);
  });
});

describe('NICHE_PEAK_TIMES', () => {
  it('defines peak times for all niches', () => {
    const niches = Object.values(ContentNiche);
    for (const niche of niches) {
      expect(NICHE_PEAK_TIMES[niche]).toBeDefined();
      expect(NICHE_PEAK_TIMES[niche].length).toBeGreaterThan(0);
    }
  });

  it('gaming peaks in evening and night', () => {
    expect(NICHE_PEAK_TIMES[ContentNiche.Gaming]).toContain('evening');
    expect(NICHE_PEAK_TIMES[ContentNiche.Gaming]).toContain('night');
  });

  it('cooking peaks in midday and afternoon', () => {
    expect(NICHE_PEAK_TIMES[ContentNiche.Cooking]).toContain('midday');
    expect(NICHE_PEAK_TIMES[ContentNiche.Cooking]).toContain('afternoon');
  });

  it('music peaks in evening and night', () => {
    expect(NICHE_PEAK_TIMES[ContentNiche.Music]).toContain('evening');
    expect(NICHE_PEAK_TIMES[ContentNiche.Music]).toContain('night');
  });

  it('IRL peaks in afternoon and evening', () => {
    expect(NICHE_PEAK_TIMES[ContentNiche.IRL]).toContain('afternoon');
    expect(NICHE_PEAK_TIMES[ContentNiche.IRL]).toContain('evening');
  });
});

describe('getSlotKey', () => {
  it('returns day-hour format', () => {
    expect(getSlotKey(0, 9)).toBe('0-9');
    expect(getSlotKey(5, 18)).toBe('5-18');
  });
});

describe('getSlotPopularity', () => {
  it('returns popularity data for valid slots', () => {
    const popularity = getSlotPopularity(0, 9);
    expect(popularity.baseViewership).toBeGreaterThan(0);
    expect(popularity.nicheMultipliers).toBeDefined();
  });

  it('returns default for unknown slots', () => {
    const popularity = getSlotPopularity(99, 99);
    expect(popularity.baseViewership).toBe(50);
  });

  it('weekends have higher base viewership', () => {
    const weekdayEvening = getSlotPopularity(1, 21);
    const saturdayEvening = getSlotPopularity(5, 21);

    expect(saturdayEvening.baseViewership).toBeGreaterThan(weekdayEvening.baseViewership);
  });
});

describe('getExpectedViewership', () => {
  it('calculates viewership based on niche multiplier', () => {
    const gamingViewership = getExpectedViewership(5, 21, ContentNiche.Gaming);
    const cookingViewership = getExpectedViewership(5, 21, ContentNiche.Cooking);

    expect(gamingViewership).toBeGreaterThan(cookingViewership);
  });

  it('returns positive numbers', () => {
    for (let day = 0; day < 7; day++) {
      for (const slot of TIME_SLOTS) {
        const niches = Object.values(ContentNiche);
        for (const niche of niches) {
          const viewership = getExpectedViewership(day, slot.hour, niche);
          expect(viewership).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe('getViewershipLevel', () => {
  it('returns low for viewership under 45', () => {
    expect(getViewershipLevel(20)).toBe('low');
    expect(getViewershipLevel(44)).toBe('low');
  });

  it('returns medium for viewership 45-69', () => {
    expect(getViewershipLevel(45)).toBe('medium');
    expect(getViewershipLevel(69)).toBe('medium');
  });

  it('returns high for viewership 70-99', () => {
    expect(getViewershipLevel(70)).toBe('high');
    expect(getViewershipLevel(99)).toBe('high');
  });

  it('returns peak for viewership 100+', () => {
    expect(getViewershipLevel(100)).toBe('peak');
    expect(getViewershipLevel(200)).toBe('peak');
  });
});

describe('getTimeSlotInfo', () => {
  it('returns info for valid hours', () => {
    const info = getTimeSlotInfo(18);
    expect(info.hour).toBe(18);
    expect(info.timeOfDay).toBe('evening');
  });

  it('returns default for invalid hours', () => {
    const info = getTimeSlotInfo(99);
    expect(info).toBeDefined();
  });
});

describe('isNichePeakTime', () => {
  it('returns true for gaming during evening', () => {
    expect(isNichePeakTime(ContentNiche.Gaming, 18)).toBe(true);
    expect(isNichePeakTime(ContentNiche.Gaming, 21)).toBe(true);
  });

  it('returns false for gaming during morning', () => {
    expect(isNichePeakTime(ContentNiche.Gaming, 9)).toBe(false);
  });

  it('returns true for cooking during afternoon', () => {
    expect(isNichePeakTime(ContentNiche.Cooking, 12)).toBe(true);
    expect(isNichePeakTime(ContentNiche.Cooking, 15)).toBe(true);
  });

  it('returns false for cooking during night', () => {
    expect(isNichePeakTime(ContentNiche.Cooking, 21)).toBe(false);
  });
});

describe('getTimeSlotMultiplier', () => {
  it('adds peak bonus for niche peak times', () => {
    const baseMultiplier = TIME_SLOT_INFO[21].baseMultiplier;
    const gamingMultiplier = getTimeSlotMultiplier(21, ContentNiche.Gaming);

    expect(gamingMultiplier).toBe(baseMultiplier + NICHE_PEAK_BONUS);
  });

  it('does not add peak bonus for non-peak times', () => {
    const baseMultiplier = TIME_SLOT_INFO[9].baseMultiplier;
    const gamingMultiplier = getTimeSlotMultiplier(9, ContentNiche.Gaming);

    expect(gamingMultiplier).toBe(baseMultiplier);
  });
});

describe('getEquipmentQualityMultiplier', () => {
  it('returns 1 for empty equipment', () => {
    expect(getEquipmentQualityMultiplier([])).toBe(1);
  });

  it('increases with better equipment', () => {
    const basicEquipment: Equipment[] = [
      {
        id: 'test',
        name: 'Test',
        category: EquipmentCategory.Camera,
        tier: EquipmentTier.Basic,
        price: 100,
        qualityBonus: 20,
        description: 'Test equipment',
        asset: 'test',
      },
    ];

    const multiplier = getEquipmentQualityMultiplier(basicEquipment);
    expect(multiplier).toBe(1.2);
  });

  it('stacks quality bonuses', () => {
    const equipment: Equipment[] = [
      {
        id: 'camera',
        name: 'Camera',
        category: EquipmentCategory.Camera,
        tier: EquipmentTier.Basic,
        price: 100,
        qualityBonus: 20,
        description: 'Test',
        asset: 'test',
      },
      {
        id: 'mic',
        name: 'Mic',
        category: EquipmentCategory.Microphone,
        tier: EquipmentTier.Basic,
        price: 100,
        qualityBonus: 30,
        description: 'Test',
        asset: 'test',
      },
    ];

    const multiplier = getEquipmentQualityMultiplier(equipment);
    expect(multiplier).toBe(1.5);
  });
});

describe('calculateProjectedViewership', () => {
  const testEquipment: Equipment[] = [
    {
      id: 'test',
      name: 'Test',
      category: EquipmentCategory.Camera,
      tier: EquipmentTier.Basic,
      price: 100,
      qualityBonus: 50,
      description: 'Test',
      asset: 'test',
    },
  ];

  it('returns all viewership factors', () => {
    const result = calculateProjectedViewership({
      dayOfWeek: 5,
      hour: 21,
      niche: ContentNiche.Gaming,
      equipment: testEquipment,
    });

    expect(result.baseViewers).toBeGreaterThan(0);
    expect(result.timeSlotMultiplier).toBeGreaterThan(0);
    expect(result.nicheMultiplier).toBeGreaterThan(0);
    expect(result.equipmentMultiplier).toBeGreaterThan(1);
    expect(result.projectedViewers).toBeGreaterThan(0);
  });

  it('identifies prime time correctly', () => {
    const primeResult = calculateProjectedViewership({
      dayOfWeek: 0,
      hour: 21,
      niche: ContentNiche.Gaming,
      equipment: [],
    });

    const offPeakResult = calculateProjectedViewership({
      dayOfWeek: 0,
      hour: 9,
      niche: ContentNiche.Gaming,
      equipment: [],
    });

    expect(primeResult.isPrimeTime).toBe(true);
    expect(offPeakResult.isPrimeTime).toBe(false);
  });

  it('identifies niche peak time correctly', () => {
    const gamingNight = calculateProjectedViewership({
      dayOfWeek: 0,
      hour: 21,
      niche: ContentNiche.Gaming,
      equipment: [],
    });

    const gamingMorning = calculateProjectedViewership({
      dayOfWeek: 0,
      hour: 9,
      niche: ContentNiche.Gaming,
      equipment: [],
    });

    expect(gamingNight.isNichePeakTime).toBe(true);
    expect(gamingMorning.isNichePeakTime).toBe(false);
  });

  it('projects higher viewers with better equipment', () => {
    const noEquipment = calculateProjectedViewership({
      dayOfWeek: 0,
      hour: 18,
      niche: ContentNiche.Gaming,
      equipment: [],
    });

    const withEquipment = calculateProjectedViewership({
      dayOfWeek: 0,
      hour: 18,
      niche: ContentNiche.Gaming,
      equipment: testEquipment,
    });

    expect(withEquipment.projectedViewers).toBeGreaterThan(noEquipment.projectedViewers);
  });

  it('projects higher viewers during niche peak times', () => {
    const gamingEvening = calculateProjectedViewership({
      dayOfWeek: 0,
      hour: 18,
      niche: ContentNiche.Gaming,
      equipment: [],
    });

    const gamingMorning = calculateProjectedViewership({
      dayOfWeek: 0,
      hour: 9,
      niche: ContentNiche.Gaming,
      equipment: [],
    });

    expect(gamingEvening.projectedViewers).toBeGreaterThan(gamingMorning.projectedViewers);
  });

  it('cooking gets peak bonus during midday/afternoon', () => {
    const cookingMidday = calculateProjectedViewership({
      dayOfWeek: 0,
      hour: 12,
      niche: ContentNiche.Cooking,
      equipment: [],
    });

    const cookingNight = calculateProjectedViewership({
      dayOfWeek: 0,
      hour: 21,
      niche: ContentNiche.Cooking,
      equipment: [],
    });

    expect(cookingMidday.isNichePeakTime).toBe(true);
    expect(cookingNight.isNichePeakTime).toBe(false);
  });

  it('incorporates subscriber count bonus', () => {
    const noSubs = calculateProjectedViewership({
      dayOfWeek: 0,
      hour: 18,
      niche: ContentNiche.Gaming,
      equipment: [],
      subscriberCount: 0,
    });

    const withSubs = calculateProjectedViewership({
      dayOfWeek: 0,
      hour: 18,
      niche: ContentNiche.Gaming,
      equipment: [],
      subscriberCount: 1000,
    });

    expect(withSubs.projectedViewers).toBeGreaterThan(noSubs.projectedViewers);
  });
});

describe('getSimpleProjectedViewers', () => {
  it('returns projected viewer count directly', () => {
    const viewers = getSimpleProjectedViewers(5, 21, ContentNiche.Gaming, []);
    expect(viewers).toBeGreaterThan(0);
    expect(typeof viewers).toBe('number');
  });
});
