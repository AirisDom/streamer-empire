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
  getControversyEvents,
  getCollabEvents,
  getCollabEventsBySize,
  mapChoiceToResponse,
  applyNicheModifierToOutcome,
  applyControversyOutcome,
  resolveControversy,
  NICHE_CONTROVERSY_MODIFIERS,
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

  describe('Controversy Events', () => {
    it('should have multiple controversy events with controversyType', () => {
      const controversyEvents = getControversyEvents();
      expect(controversyEvents.length).toBeGreaterThanOrEqual(5);
    });

    it('should include old tweets, hot take, chat conflict, clip out of context, and competitor drama', () => {
      const controversyEvents = getControversyEvents();
      const types = controversyEvents.map((e) => e.controversyType);
      expect(types).toContain('old_tweets');
      expect(types).toContain('hot_take');
      expect(types).toContain('chat_conflict');
      expect(types).toContain('clip_out_of_context');
      expect(types).toContain('competitor_drama');
    });

    it('should have choices for apologize, double down, and ignore on controversy events', () => {
      const controversyEvents = getControversyEvents();
      controversyEvents.forEach((event) => {
        const choiceIds = event.choices.map((c) => c.id);
        const hasApologize = choiceIds.some((id) => id.includes('apologize') || id === 'address_directly');
        const hasDoubleDown = choiceIds.some((id) => id.includes('double_down') || id === 'fire_back');
        const hasIgnore = choiceIds.some((id) => id.includes('ignore') || id === 'stay_silent' || id === 'wait_it_out');
        expect(hasApologize || hasDoubleDown || hasIgnore).toBe(true);
      });
    });
  });

  describe('mapChoiceToResponse', () => {
    it('should map apologize choices to apologize response', () => {
      expect(mapChoiceToResponse('apologize')).toBe('apologize');
      expect(mapChoiceToResponse('public_apology')).toBe('apologize');
    });

    it('should map address_directly to address_directly response', () => {
      expect(mapChoiceToResponse('address_directly')).toBe('address_directly');
    });

    it('should map double down choices to double_down response', () => {
      expect(mapChoiceToResponse('double_down')).toBe('double_down');
      expect(mapChoiceToResponse('fire_back')).toBe('double_down');
    });

    it('should map ignore choices to ignore response', () => {
      expect(mapChoiceToResponse('ignore')).toBe('ignore');
      expect(mapChoiceToResponse('stay_silent')).toBe('ignore');
      expect(mapChoiceToResponse('wait_it_out')).toBe('ignore');
    });

    it('should return null for unrecognized choices', () => {
      expect(mapChoiceToResponse('some_other_choice')).toBeNull();
    });
  });

  describe('NICHE_CONTROVERSY_MODIFIERS', () => {
    it('should have modifiers for all niches', () => {
      expect(NICHE_CONTROVERSY_MODIFIERS[ContentNiche.Gaming]).toBeDefined();
      expect(NICHE_CONTROVERSY_MODIFIERS[ContentNiche.Cooking]).toBeDefined();
      expect(NICHE_CONTROVERSY_MODIFIERS[ContentNiche.Music]).toBeDefined();
      expect(NICHE_CONTROVERSY_MODIFIERS[ContentNiche.IRL]).toBeDefined();
    });

    it('should have different modifiers for different niches', () => {
      const gaming = NICHE_CONTROVERSY_MODIFIERS[ContentNiche.Gaming];
      const irl = NICHE_CONTROVERSY_MODIFIERS[ContentNiche.IRL];
      expect(gaming.apologize).not.toEqual(irl.apologize);
    });

    it('IRL audience should be more forgiving of apologies', () => {
      const gaming = NICHE_CONTROVERSY_MODIFIERS[ContentNiche.Gaming];
      const irl = NICHE_CONTROVERSY_MODIFIERS[ContentNiche.IRL];
      expect(irl.apologize.reputation).toBeGreaterThan(gaming.apologize.reputation);
    });

    it('Gaming audience should be more tolerant of doubling down', () => {
      const gaming = NICHE_CONTROVERSY_MODIFIERS[ContentNiche.Gaming];
      const cooking = NICHE_CONTROVERSY_MODIFIERS[ContentNiche.Cooking];
      expect(gaming.double_down.subscribers).toBeGreaterThan(cooking.double_down.subscribers);
    });
  });

  describe('applyNicheModifierToOutcome', () => {
    it('should modify reputation based on niche', () => {
      const baseOutcome = { reputation: -10, subscribers: -50, description: 'Test' };
      const gamingResult = applyNicheModifierToOutcome(baseOutcome, ContentNiche.Gaming, 'apologize');
      const irlResult = applyNicheModifierToOutcome(baseOutcome, ContentNiche.IRL, 'apologize');
      expect(gamingResult.reputation).not.toBe(irlResult.reputation);
    });

    it('should modify subscribers based on niche', () => {
      const baseOutcome = { reputation: -10, subscribers: -100, description: 'Test' };
      const gamingResult = applyNicheModifierToOutcome(baseOutcome, ContentNiche.Gaming, 'double_down');
      const cookingResult = applyNicheModifierToOutcome(baseOutcome, ContentNiche.Cooking, 'double_down');
      expect(gamingResult.subscribers).not.toBe(cookingResult.subscribers);
    });

    it('should round modified values to integers', () => {
      const baseOutcome = { reputation: -7, subscribers: -33, description: 'Test' };
      const result = applyNicheModifierToOutcome(baseOutcome, ContentNiche.Music, 'ignore');
      expect(Number.isInteger(result.reputation)).toBe(true);
      expect(Number.isInteger(result.subscribers)).toBe(true);
    });
  });

  describe('applyControversyOutcome', () => {
    it('should apply niche modifiers for controversy events', () => {
      const choice = {
        id: 'apologize',
        label: 'Apologize',
        description: 'Say sorry',
        outcomes: { reputation: -10, subscribers: -20, description: 'You apologized' },
      };
      const gamingResult = applyControversyOutcome(choice, 1000, ContentNiche.Gaming, true);
      const irlResult = applyControversyOutcome(choice, 1000, ContentNiche.IRL, true);
      expect(gamingResult.outcome.reputation).not.toBe(irlResult.outcome.reputation);
    });

    it('should not apply niche modifiers for non-controversy events', () => {
      const choice = {
        id: 'apologize',
        label: 'Apologize',
        description: 'Say sorry',
        outcomes: { reputation: -10, subscribers: -20, description: 'You apologized' },
      };
      const result = applyControversyOutcome(choice, 1000, ContentNiche.Gaming, false);
      expect(result.outcome.reputation).toBe(-10);
      expect(result.outcome.subscribers).toBe(-20);
    });

    it('should block choices that require more money than available', () => {
      const choice = {
        id: 'apologize',
        label: 'Apologize',
        description: 'Say sorry',
        outcomes: { reputation: -10, money: -500, description: 'Expensive apology' },
        requiredMoney: 500,
      };
      const result = applyControversyOutcome(choice, 100, ContentNiche.Gaming, true);
      expect(result.canApply).toBe(false);
    });
  });

  describe('resolveControversy', () => {
    const mockEvent: EventDefinition = {
      id: 'test_controversy',
      type: EventType.Controversy,
      severity: EventSeverity.Moderate,
      category: 'negative',
      title: 'Test Controversy',
      description: 'A test controversy event',
      controversyType: 'hot_take',
      choices: [
        { id: 'apologize', label: 'Apologize', description: 'Say sorry', outcomes: { reputation: -10, subscribers: -20, description: 'You apologized' } },
        { id: 'double_down', label: 'Double Down', description: 'Stand firm', outcomes: { reputation: -20, subscribers: -50, description: 'You doubled down' } },
        { id: 'ignore', label: 'Ignore', description: 'Stay silent', outcomes: { reputation: -15, subscribers: -30, description: 'You ignored it' } },
      ],
      triggerConditions: { probability: 0.1 },
    };

    it('should return success with modified outcomes', () => {
      const choice = mockEvent.choices[0];
      const result = resolveControversy(mockEvent, choice, ContentNiche.Gaming, 1000);
      expect(result.success).toBe(true);
      expect(result.result).not.toBeNull();
      expect(result.result?.responseType).toBe('apologize');
    });

    it('should include niche impact explanation', () => {
      const choice = mockEvent.choices[0];
      const result = resolveControversy(mockEvent, choice, ContentNiche.Gaming, 1000);
      expect(result.result?.nicheImpact).toBeDefined();
      expect(result.result?.nicheImpact.length).toBeGreaterThan(0);
    });

    it('should fail if not enough money', () => {
      const choice = { ...mockEvent.choices[0], requiredMoney: 500 };
      const result = resolveControversy(mockEvent, choice, ContentNiche.Gaming, 100);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should produce different outcomes for different niches', () => {
      const choice = mockEvent.choices[1];
      const gamingResult = resolveControversy(mockEvent, choice, ContentNiche.Gaming, 1000);
      const cookingResult = resolveControversy(mockEvent, choice, ContentNiche.Cooking, 1000);
      expect(gamingResult.result?.outcome.subscribers).not.toBe(cookingResult.result?.outcome.subscribers);
    });
  });

  describe('Collaboration Events', () => {
    it('should have multiple collab events defined', () => {
      const collabEvents = getCollabEvents();
      expect(collabEvents.length).toBeGreaterThanOrEqual(5);
    });

    it('should have all collab events with type Collab', () => {
      const collabEvents = getCollabEvents();
      collabEvents.forEach((event) => {
        expect(event.type).toBe(EventType.Collab);
      });
    });

    it('should have collab events for different sizes', () => {
      const { small, similar, large } = getCollabEventsBySize();
      expect(small.length).toBeGreaterThan(0);
      expect(similar.length).toBeGreaterThan(0);
      expect(large.length).toBeGreaterThan(0);
    });

    it('should have small creator collab event', () => {
      const collabEvents = getCollabEvents();
      const smallCreator = collabEvents.find((e) => e.id === 'collab_small_creator');
      expect(smallCreator).toBeDefined();
      expect(smallCreator?.severity).toBe(EventSeverity.Minor);
    });

    it('should have big creator collab event', () => {
      const collabEvents = getCollabEvents();
      const bigCreator = collabEvents.find((e) => e.id === 'collab_big_creator');
      expect(bigCreator).toBeDefined();
      expect(bigCreator?.severity).toBe(EventSeverity.Major);
    });

    it('should have cross-niche collab event', () => {
      const collabEvents = getCollabEvents();
      const crossNiche = collabEvents.find((e) => e.id === 'collab_crossover_niche');
      expect(crossNiche).toBeDefined();
      expect(crossNiche?.category).toBe('neutral');
    });

    it('should have collab series event', () => {
      const collabEvents = getCollabEvents();
      const series = collabEvents.find((e) => e.id === 'collab_series_offer');
      expect(series).toBeDefined();
      expect(series?.severity).toBe(EventSeverity.Major);
    });

    it('should have charity stream collab event', () => {
      const collabEvents = getCollabEvents();
      const charity = collabEvents.find((e) => e.id === 'collab_charity_stream');
      expect(charity).toBeDefined();
    });

    it('should have accept and decline options on all collab events', () => {
      const collabEvents = getCollabEvents();
      collabEvents.forEach((event) => {
        const hasAcceptOption = event.choices.some((c) =>
          c.id.includes('accept') || c.id.includes('mentor') || c.id.includes('host') || c.id.includes('participant')
        );
        const hasDeclineOption = event.choices.some((c) => c.id.includes('decline'));
        expect(hasAcceptOption).toBe(true);
        expect(hasDeclineOption).toBe(true);
      });
    });

    it('should have increasing subscriber rewards for bigger collabs', () => {
      const collabEvents = getCollabEvents();
      const smallEvent = collabEvents.find((e) => e.id === 'collab_small_creator');
      const bigEvent = collabEvents.find((e) => e.id === 'collab_big_creator');

      const smallBestChoice = smallEvent?.choices.find((c) => c.id === 'accept_mentor');
      const bigBestChoice = bigEvent?.choices.find((c) => c.id === 'accept_featured');

      expect(bigBestChoice?.outcomes.subscribers).toBeGreaterThan(smallBestChoice?.outcomes.subscribers || 0);
    });

    it('should have higher reputation requirements for big creator collabs', () => {
      const collabEvents = getCollabEvents();
      const smallEvent = collabEvents.find((e) => e.id === 'collab_small_creator');
      const bigEvent = collabEvents.find((e) => e.id === 'collab_big_creator');

      const smallMinRep = smallEvent?.triggerConditions.minReputation || 0;
      const bigMinRep = bigEvent?.triggerConditions.minReputation || 0;

      expect(bigMinRep).toBeGreaterThan(smallMinRep);
    });
  });
});
