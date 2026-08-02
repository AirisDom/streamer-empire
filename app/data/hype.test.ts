import { describe, it, expect } from 'vitest';
import {
  createInitialHypeState,
  calculateHypeDecay,
  calculateChatHypeContribution,
  isBoostOnCooldown,
  getCooldownRemaining,
  applyHypeBoost,
  calculateSubscriberConversionRate,
  getHypeLevel,
  HYPE_BOOSTS,
  HYPE_CONFIG,
} from './hype';
import { ChatMessage } from '../types';

describe('hype system', () => {
  describe('createInitialHypeState', () => {
    it('creates state with default values', () => {
      const state = createInitialHypeState();
      expect(state.currentHype).toBe(20);
      expect(state.maxHype).toBe(100);
      expect(state.peakHype).toBe(20);
      expect(state.totalHypeGained).toBe(0);
    });
  });

  describe('calculateHypeDecay', () => {
    it('decays hype over time', () => {
      const initialHype = 50;
      const elapsed = 1000;
      const decayed = calculateHypeDecay(initialHype, elapsed);
      expect(decayed).toBeLessThan(initialHype);
    });

    it('does not go below minimum', () => {
      const decayed = calculateHypeDecay(1, 10000);
      expect(decayed).toBe(HYPE_CONFIG.minHype);
    });
  });

  describe('calculateChatHypeContribution', () => {
    it('returns base contribution for normal message', () => {
      const message: ChatMessage = {
        id: '1',
        username: 'user',
        message: 'hello',
        timestamp: Date.now(),
        isSubscriber: false,
      };
      const contribution = calculateChatHypeContribution(message);
      expect(contribution).toBe(HYPE_CONFIG.chatMessageHypeGain);
    });

    it('adds bonus for subscriber messages', () => {
      const message: ChatMessage = {
        id: '1',
        username: 'user',
        message: 'hello',
        timestamp: Date.now(),
        isSubscriber: true,
      };
      const contribution = calculateChatHypeContribution(message);
      expect(contribution).toBeGreaterThan(HYPE_CONFIG.chatMessageHypeGain);
    });

    it('adds bonus for hype keywords', () => {
      const message: ChatMessage = {
        id: '1',
        username: 'user',
        message: 'POGGERS lets go!',
        timestamp: Date.now(),
        isSubscriber: false,
      };
      const contribution = calculateChatHypeContribution(message);
      expect(contribution).toBeGreaterThan(HYPE_CONFIG.chatMessageHypeGain);
    });

    it('adds significant bonus for donations', () => {
      const message: ChatMessage = {
        id: '1',
        username: 'user',
        message: 'here you go!',
        timestamp: Date.now(),
        isSubscriber: false,
        donationAmount: 10,
      };
      const contribution = calculateChatHypeContribution(message);
      expect(contribution).toBeGreaterThan(HYPE_CONFIG.chatMessageHypeGain + 10);
    });
  });

  describe('boost cooldowns', () => {
    it('detects when boost is on cooldown', () => {
      const boost = HYPE_BOOSTS[0];
      const lastBoostTimes = { ...createInitialHypeState().lastBoostTimes };
      lastBoostTimes[boost.type] = Date.now();
      expect(isBoostOnCooldown(boost, lastBoostTimes)).toBe(true);
    });

    it('detects when boost is off cooldown', () => {
      const boost = HYPE_BOOSTS[0];
      const lastBoostTimes = { ...createInitialHypeState().lastBoostTimes };
      lastBoostTimes[boost.type] = Date.now() - boost.cooldown - 1000;
      expect(isBoostOnCooldown(boost, lastBoostTimes)).toBe(false);
    });

    it('returns correct remaining cooldown', () => {
      const boost = HYPE_BOOSTS[0];
      const lastBoostTimes = { ...createInitialHypeState().lastBoostTimes };
      lastBoostTimes[boost.type] = Date.now() - 1000;
      const remaining = getCooldownRemaining(boost, lastBoostTimes);
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(boost.cooldown);
    });
  });

  describe('applyHypeBoost', () => {
    it('increases hype by boost amount', () => {
      const state = createInitialHypeState();
      const boost = HYPE_BOOSTS[0];
      const newState = applyHypeBoost(state, boost);
      expect(newState.currentHype).toBe(state.currentHype + boost.hypeGain);
    });

    it('does not exceed max hype', () => {
      const state = { ...createInitialHypeState(), currentHype: 95 };
      const boost = { ...HYPE_BOOSTS[0], hypeGain: 20 };
      const newState = applyHypeBoost(state, boost);
      expect(newState.currentHype).toBe(100);
    });

    it('updates last boost time', () => {
      const state = createInitialHypeState();
      const boost = HYPE_BOOSTS[0];
      const before = Date.now();
      const newState = applyHypeBoost(state, boost);
      expect(newState.lastBoostTimes[boost.type]).toBeGreaterThanOrEqual(before);
    });

    it('updates peak hype if new high', () => {
      const state = createInitialHypeState();
      const boost = HYPE_BOOSTS[1];
      const newState = applyHypeBoost(state, boost);
      expect(newState.peakHype).toBe(state.currentHype + boost.hypeGain);
    });
  });

  describe('calculateSubscriberConversionRate', () => {
    it('returns higher rate for high hype', () => {
      const highHypeRate = calculateSubscriberConversionRate(90);
      const lowHypeRate = calculateSubscriberConversionRate(10);
      expect(highHypeRate).toBeGreaterThan(lowHypeRate);
    });

    it('returns 3x rate at max hype', () => {
      const maxRate = calculateSubscriberConversionRate(100);
      const baseRate = 0.01;
      expect(maxRate).toBe(baseRate * 3.0);
    });

    it('returns 0.5x rate at very low hype', () => {
      const minRate = calculateSubscriberConversionRate(5);
      const baseRate = 0.01;
      expect(minRate).toBe(baseRate * 0.5);
    });
  });

  describe('getHypeLevel', () => {
    it('returns correct labels for different hype levels', () => {
      expect(getHypeLevel(95).label).toBe('INSANE');
      expect(getHypeLevel(80).label).toBe('HYPE');
      expect(getHypeLevel(65).label).toBe('Excited');
      expect(getHypeLevel(50).label).toBe('Engaged');
      expect(getHypeLevel(35).label).toBe('Chill');
      expect(getHypeLevel(20).label).toBe('Quiet');
      expect(getHypeLevel(5).label).toBe('Dead');
    });

    it('returns emoji for each level', () => {
      expect(getHypeLevel(95).emoji).toBeDefined();
      expect(getHypeLevel(50).emoji).toBeDefined();
      expect(getHypeLevel(5).emoji).toBeDefined();
    });
  });

  describe('HYPE_BOOSTS', () => {
    it('has all required boost actions', () => {
      const types = HYPE_BOOSTS.map((b) => b.type);
      expect(types).toContain('shoutout');
      expect(types).toContain('giveaway');
      expect(types).toContain('reaction');
      expect(types).toContain('subscriber_goal');
    });

    it('all boosts have valid properties', () => {
      HYPE_BOOSTS.forEach((boost) => {
        expect(boost.hypeGain).toBeGreaterThan(0);
        expect(boost.cooldown).toBeGreaterThan(0);
        expect(boost.energyCost).toBeGreaterThan(0);
        expect(boost.name).toBeDefined();
        expect(boost.icon).toBeDefined();
      });
    });
  });
});
