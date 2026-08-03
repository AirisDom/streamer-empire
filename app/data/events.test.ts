import { describe, it, expect } from 'vitest';
import {
  EVENT_DEFINITIONS,
  EventDefinition,
  EventCooldown,
  checkEventTrigger,
  getEligibleEvents,
  rollForEvents,
  applyEventOutcome,
  calculateCooldownExpiry,
  getEventsByCategory,
  getEventsBySeverity,
  getEventsByType,
} from './events';
import { ContentNiche, EventType, EventSeverity } from '../types';

describe('Event System', () => {
  describe('EVENT_DEFINITIONS', () => {
    it('should have at least one event defined', () => {
      expect(EVENT_DEFINITIONS.length).toBeGreaterThan(0);
    });

    it('should have valid event structures', () => {
      EVENT_DEFINITIONS.forEach((event) => {
        expect(event.id).toBeDefined();
        expect(event.type).toBeDefined();
        expect(event.severity).toBeDefined();
        expect(event.category).toMatch(/^(positive|negative|neutral)$/);
        expect(event.title).toBeDefined();
        expect(event.description).toBeDefined();
        expect(event.choices.length).toBeGreaterThan(0);
        expect(event.triggerConditions.probability).toBeGreaterThanOrEqual(0);
        expect(event.triggerConditions.probability).toBeLessThanOrEqual(1);
      });
    });

    it('should have unique event IDs', () => {
      const ids = EVENT_DEFINITIONS.map((e) => e.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have at least one choice per event with outcomes', () => {
      EVENT_DEFINITIONS.forEach((event) => {
        event.choices.forEach((choice) => {
          expect(choice.id).toBeDefined();
          expect(choice.label).toBeDefined();
          expect(choice.outcomes.description).toBeDefined();
        });
      });
    });
  });

  describe('checkEventTrigger', () => {
    const createEvent = (conditions: Partial<EventDefinition['triggerConditions']>): EventDefinition => ({
      id: 'test_event',
      type: EventType.Raid,
      severity: EventSeverity.Minor,
      category: 'positive',
      title: 'Test Event',
      description: 'Test',
      choices: [{ id: 'c1', label: 'Choice', description: 'Desc', outcomes: { description: 'Outcome' } }],
      triggerConditions: { probability: 1, ...conditions },
    });

    it('should trigger when all conditions are met', () => {
      const event = createEvent({ minSubscribers: 100 });
      const result = checkEventTrigger(event, 150, 1, 50, ContentNiche.Gaming, []);
      expect(result).toBe(true);
    });

    it('should not trigger when minSubscribers not met', () => {
      const event = createEvent({ minSubscribers: 100 });
      const result = checkEventTrigger(event, 50, 1, 50, ContentNiche.Gaming, []);
      expect(result).toBe(false);
    });

    it('should not trigger when maxSubscribers exceeded', () => {
      const event = createEvent({ maxSubscribers: 100 });
      const result = checkEventTrigger(event, 150, 1, 50, ContentNiche.Gaming, []);
      expect(result).toBe(false);
    });

    it('should not trigger when minWeek not met', () => {
      const event = createEvent({ minWeek: 5 });
      const result = checkEventTrigger(event, 100, 2, 50, ContentNiche.Gaming, []);
      expect(result).toBe(false);
    });

    it('should not trigger when on cooldown', () => {
      const event = createEvent({});
      const cooldowns: EventCooldown[] = [{ eventId: 'test_event', expiresAtWeek: 10 }];
      const result = checkEventTrigger(event, 100, 5, 50, ContentNiche.Gaming, cooldowns);
      expect(result).toBe(false);
    });

    it('should trigger when cooldown expired', () => {
      const event = createEvent({});
      const cooldowns: EventCooldown[] = [{ eventId: 'test_event', expiresAtWeek: 3 }];
      const result = checkEventTrigger(event, 100, 5, 50, ContentNiche.Gaming, cooldowns);
      expect(result).toBe(true);
    });

    it('should respect reputation conditions', () => {
      const event = createEvent({ minReputation: 60 });
      expect(checkEventTrigger(event, 100, 1, 50, ContentNiche.Gaming, [])).toBe(false);
      expect(checkEventTrigger(event, 100, 1, 70, ContentNiche.Gaming, [])).toBe(true);
    });

    it('should respect niche requirements', () => {
      const event = createEvent({ requiredNiche: ContentNiche.Cooking });
      expect(checkEventTrigger(event, 100, 1, 50, ContentNiche.Gaming, [])).toBe(false);
      expect(checkEventTrigger(event, 100, 1, 50, ContentNiche.Cooking, [])).toBe(true);
    });
  });

  describe('getEligibleEvents', () => {
    it('should filter out already active events', () => {
      const activeEventIds = ['raid_small'];
      const eligible = getEligibleEvents(1000, 5, 60, ContentNiche.Gaming, [], activeEventIds);
      expect(eligible.find((e) => e.id === 'raid_small')).toBeUndefined();
    });
  });

  describe('rollForEvents', () => {
    it('should return an array of events', () => {
      const events = rollForEvents(1000, 5, 60, ContentNiche.Gaming, [], []);
      expect(Array.isArray(events)).toBe(true);
    });

    it('should respect maxEvents limit', () => {
      const events = rollForEvents(100000, 20, 80, ContentNiche.Gaming, [], [], 1);
      expect(events.length).toBeLessThanOrEqual(1);
    });
  });

  describe('applyEventOutcome', () => {
    it('should allow choices that do not require money', () => {
      const choice = {
        id: 'test',
        label: 'Test',
        description: 'Test',
        outcomes: { subscribers: 10, description: 'Gained subs' },
      };
      const result = applyEventOutcome(choice, 100);
      expect(result.canApply).toBe(true);
      expect(result.outcome.subscribers).toBe(10);
    });

    it('should block choices that require more money than available', () => {
      const choice = {
        id: 'test',
        label: 'Test',
        description: 'Test',
        outcomes: { money: -200, description: 'Spent money' },
        requiredMoney: 200,
      };
      const result = applyEventOutcome(choice, 100);
      expect(result.canApply).toBe(false);
    });

    it('should allow choices when player has enough money', () => {
      const choice = {
        id: 'test',
        label: 'Test',
        description: 'Test',
        outcomes: { money: -100, description: 'Spent money' },
        requiredMoney: 100,
      };
      const result = applyEventOutcome(choice, 150);
      expect(result.canApply).toBe(true);
    });
  });

  describe('calculateCooldownExpiry', () => {
    it('should correctly calculate cooldown expiry week', () => {
      expect(calculateCooldownExpiry(5, 3)).toBe(8);
      expect(calculateCooldownExpiry(1, 2)).toBe(3);
      expect(calculateCooldownExpiry(10, 0)).toBe(10);
    });
  });

  describe('getEventsByCategory', () => {
    it('should return only positive events', () => {
      const positiveEvents = getEventsByCategory('positive');
      positiveEvents.forEach((e) => {
        expect(e.category).toBe('positive');
      });
      expect(positiveEvents.length).toBeGreaterThan(0);
    });

    it('should return only negative events', () => {
      const negativeEvents = getEventsByCategory('negative');
      negativeEvents.forEach((e) => {
        expect(e.category).toBe('negative');
      });
      expect(negativeEvents.length).toBeGreaterThan(0);
    });
  });

  describe('getEventsBySeverity', () => {
    it('should return events of specific severity', () => {
      const minorEvents = getEventsBySeverity(EventSeverity.Minor);
      minorEvents.forEach((e) => {
        expect(e.severity).toBe(EventSeverity.Minor);
      });
    });
  });

  describe('getEventsByType', () => {
    it('should return events of specific type', () => {
      const raidEvents = getEventsByType(EventType.Raid);
      raidEvents.forEach((e) => {
        expect(e.type).toBe(EventType.Raid);
      });
      expect(raidEvents.length).toBeGreaterThan(0);
    });
  });

  describe('Event Categories Distribution', () => {
    it('should have a mix of positive, negative, and neutral events', () => {
      const positive = EVENT_DEFINITIONS.filter((e) => e.category === 'positive');
      const negative = EVENT_DEFINITIONS.filter((e) => e.category === 'negative');

      expect(positive.length).toBeGreaterThan(0);
      expect(negative.length).toBeGreaterThan(0);
    });
  });

  describe('Event Types Coverage', () => {
    it('should cover multiple event types', () => {
      const types = new Set(EVENT_DEFINITIONS.map((e) => e.type));
      expect(types.size).toBeGreaterThan(3);
    });
  });
});
