import { describe, it, expect } from 'vitest';
import { ContentNiche } from '../types';
import {
  generateRaidingChannel,
  calculateIncomingRaidViewers,
  calculateRaidSubConversion,
  calculateRaidHypeBoost,
  generateIncomingRaid,
  canInitiateOutgoingRaid,
  generateOutgoingRaidTargets,
  calculateOutgoingRaidReputationGain,
  calculateViewersSentOnRaid,
  processIncomingRaid,
  processOutgoingRaid,
  shouldTriggerRandomRaid,
  determineRaidSize,
  generateRaidChatMessage,
  RAID_CHAT_MESSAGES,
} from './raids';

describe('Raid System', () => {
  describe('generateRaidingChannel', () => {
    it('should generate a valid raiding channel', () => {
      const channel = generateRaidingChannel(1000, ContentNiche.Gaming, 'small');
      expect(channel.name).toBeDefined();
      expect(channel.subscribers).toBeGreaterThan(0);
      expect(channel.niche).toBe(ContentNiche.Gaming);
      expect(channel.reputation).toBeGreaterThanOrEqual(40);
      expect(channel.reputation).toBeLessThanOrEqual(80);
    });

    it('should scale subscriber count with player subscribers', () => {
      const smallChannel = generateRaidingChannel(100, ContentNiche.Gaming, 'small');
      const largeChannel = generateRaidingChannel(10000, ContentNiche.Gaming, 'small');
      expect(largeChannel.subscribers).toBeGreaterThanOrEqual(smallChannel.subscribers);
    });

    it('should generate larger channels for large raid size', () => {
      const channels: number[] = [];
      for (let i = 0; i < 10; i++) {
        const small = generateRaidingChannel(1000, ContentNiche.Gaming, 'small');
        const large = generateRaidingChannel(1000, ContentNiche.Gaming, 'large');
        channels.push(large.subscribers - small.subscribers);
      }
      const avgDiff = channels.reduce((a, b) => a + b, 0) / channels.length;
      expect(avgDiff).toBeGreaterThan(0);
    });
  });

  describe('calculateIncomingRaidViewers', () => {
    it('should calculate viewers based on raider subscribers', () => {
      const raider = {
        name: 'TestRaider',
        subscribers: 1000,
        niche: ContentNiche.Gaming,
        reputation: 60,
      };
      const viewers = calculateIncomingRaidViewers(raider);
      expect(viewers).toBeGreaterThanOrEqual(5);
    });

    it('should always return at least 5 viewers', () => {
      const smallRaider = {
        name: 'SmallRaider',
        subscribers: 10,
        niche: ContentNiche.Gaming,
        reputation: 50,
      };
      const viewers = calculateIncomingRaidViewers(smallRaider);
      expect(viewers).toBeGreaterThanOrEqual(5);
    });
  });

  describe('calculateRaidSubConversion', () => {
    it('should return at least 1 subscriber', () => {
      const subs = calculateRaidSubConversion(10, 50, 50);
      expect(subs).toBeGreaterThanOrEqual(1);
    });

    it('should increase conversion with higher player reputation', () => {
      const lowRepSubs = calculateRaidSubConversion(100, 50, 40);
      const highRepSubs = calculateRaidSubConversion(100, 50, 80);
      expect(highRepSubs).toBeGreaterThanOrEqual(lowRepSubs);
    });
  });

  describe('calculateRaidHypeBoost', () => {
    it('should calculate hype boost based on viewer count', () => {
      const boost = calculateRaidHypeBoost(50);
      expect(boost).toBeGreaterThanOrEqual(5);
      expect(boost).toBeLessThanOrEqual(30);
    });

    it('should cap hype boost at 30', () => {
      const maxBoost = calculateRaidHypeBoost(1000);
      expect(maxBoost).toBe(30);
    });
  });

  describe('generateIncomingRaid', () => {
    it('should generate a complete incoming raid', () => {
      const raid = generateIncomingRaid(1000, 60, ContentNiche.Gaming, 'medium');
      expect(raid.id).toBeDefined();
      expect(raid.raider).toBeDefined();
      expect(raid.viewerCount).toBeGreaterThan(0);
      expect(raid.potentialNewSubs).toBeGreaterThanOrEqual(1);
      expect(raid.hypeBoost).toBeGreaterThan(0);
      expect(raid.timestamp).toBeDefined();
    });
  });

  describe('canInitiateOutgoingRaid', () => {
    it('should require 500 subscribers to raid', () => {
      expect(canInitiateOutgoingRaid(499)).toBe(false);
      expect(canInitiateOutgoingRaid(500)).toBe(true);
      expect(canInitiateOutgoingRaid(1000)).toBe(true);
    });
  });

  describe('generateOutgoingRaidTargets', () => {
    it('should generate the specified number of targets', () => {
      const targets = generateOutgoingRaidTargets(1000, ContentNiche.Gaming, 3);
      expect(targets).toHaveLength(3);
    });

    it('should generate valid raiding channels', () => {
      const targets = generateOutgoingRaidTargets(1000, ContentNiche.Cooking);
      targets.forEach((target) => {
        expect(target.name).toBeDefined();
        expect(target.subscribers).toBeGreaterThan(0);
        expect(target.niche).toBe(ContentNiche.Cooking);
      });
    });
  });

  describe('calculateOutgoingRaidReputationGain', () => {
    it('should give more reputation for raiding larger channels', () => {
      const smallTargetRep = calculateOutgoingRaidReputationGain(1000, 50);
      const largeTargetRep = calculateOutgoingRaidReputationGain(1000, 2000);
      expect(largeTargetRep).toBeGreaterThan(smallTargetRep);
    });

    it('should return 1-5 reputation', () => {
      const tinyTarget = calculateOutgoingRaidReputationGain(1000, 50);
      const hugeTarget = calculateOutgoingRaidReputationGain(1000, 5000);
      expect(tinyTarget).toBeGreaterThanOrEqual(1);
      expect(hugeTarget).toBeLessThanOrEqual(5);
    });
  });

  describe('calculateViewersSentOnRaid', () => {
    it('should send 80% of viewers by default', () => {
      const sent = calculateViewersSentOnRaid(100);
      expect(sent).toBe(80);
    });

    it('should allow custom percentage', () => {
      const sent = calculateViewersSentOnRaid(100, 0.5);
      expect(sent).toBe(50);
    });
  });

  describe('processIncomingRaid', () => {
    it('should give more rewards when welcomed warmly', () => {
      const raid = generateIncomingRaid(1000, 60, ContentNiche.Gaming, 'medium');
      const warmResult = processIncomingRaid(raid, true);
      const coldResult = processIncomingRaid(raid, false);

      expect(warmResult.subscribersGained).toBeGreaterThan(coldResult.subscribersGained);
      expect(warmResult.reputationGained).toBeGreaterThan(coldResult.reputationGained);
      expect(warmResult.hypeBoost).toBeGreaterThan(coldResult.hypeBoost);
    });

    it('should return correct result structure', () => {
      const raid = generateIncomingRaid(1000, 60, ContentNiche.Gaming, 'small');
      const result = processIncomingRaid(raid, true);

      expect(result.subscribersGained).toBeGreaterThanOrEqual(0);
      expect(result.reputationGained).toBeGreaterThanOrEqual(0);
      expect(result.hypeBoost).toBeGreaterThanOrEqual(0);
      expect(result.viewersAdded).toBe(raid.viewerCount);
    });
  });

  describe('processOutgoingRaid', () => {
    it('should create a valid outgoing raid', () => {
      const target = {
        name: 'TargetChannel',
        subscribers: 500,
        niche: ContentNiche.Gaming,
        reputation: 60,
      };
      const raid = processOutgoingRaid(target, 1000, 80);

      expect(raid.id).toBeDefined();
      expect(raid.target).toBe(target);
      expect(raid.viewersSent).toBe(80);
      expect(raid.reputationGain).toBeGreaterThanOrEqual(1);
    });
  });

  describe('shouldTriggerRandomRaid', () => {
    it('should not trigger for low subscriber counts', () => {
      const result = shouldTriggerRandomRaid(10, 300, 50);
      expect(result).toBe(false);
    });

    it('should not trigger in first 2 minutes', () => {
      const result = shouldTriggerRandomRaid(1000, 60, 50);
      expect(result).toBe(false);
    });

    it('should return a boolean', () => {
      const result = shouldTriggerRandomRaid(1000, 300, 50);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('determineRaidSize', () => {
    it('should always return small for low subscriber counts', () => {
      for (let i = 0; i < 10; i++) {
        const size = determineRaidSize(100);
        expect(size).toBe('small');
      }
    });

    it('should return valid raid sizes', () => {
      const validSizes = ['small', 'medium', 'large'];
      const size = determineRaidSize(10000);
      expect(validSizes).toContain(size);
    });
  });

  describe('generateRaidChatMessage', () => {
    it('should generate incoming raid messages with raider name', () => {
      const message = generateRaidChatMessage('incoming', 'TestRaider');
      expect(RAID_CHAT_MESSAGES.incoming.some((m) =>
        message.includes('TestRaider') || !m.includes('{raider}')
      )).toBe(true);
    });

    it('should generate outgoing raid messages with target name', () => {
      const message = generateRaidChatMessage('outgoing', 'TargetChannel');
      expect(RAID_CHAT_MESSAGES.outgoing.some((m) =>
        message.includes('TargetChannel') || !m.includes('{target}')
      )).toBe(true);
    });
  });

  describe('RAID_CHAT_MESSAGES', () => {
    it('should have incoming messages', () => {
      expect(RAID_CHAT_MESSAGES.incoming.length).toBeGreaterThan(0);
    });

    it('should have outgoing messages', () => {
      expect(RAID_CHAT_MESSAGES.outgoing.length).toBeGreaterThan(0);
    });
  });
});
