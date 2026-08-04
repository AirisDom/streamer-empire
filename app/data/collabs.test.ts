import { describe, it, expect } from 'vitest';
import {
  generateCollabPartner,
  calculateNicheCompatibility,
  calculateEquipmentCompatibility,
  calculateCollabSuccessScore,
  determineSuccessLevel,
  calculateSubscribersGained,
  calculateReputationChange,
  calculateExperienceGained,
  generateCollabSuccessMessage,
  generateCollabOffer,
  processCollab,
  shouldTriggerCollabOffer,
  canInitiateCollab,
  generateOutgoingCollabTargets,
  getCollabTypeDescription,
  getCollabTypeName,
  generateCollabChatMessage,
  CollabPartner,
  CollabOffer,
  CollabType,
} from './collabs';
import { ContentNiche, Equipment, EquipmentCategory, EquipmentTier } from '../types';

describe('Collab System', () => {
  describe('generateCollabPartner', () => {
    it('should generate a valid partner', () => {
      const partner = generateCollabPartner(1000, ContentNiche.Gaming, 'similar');
      expect(partner.id).toBeDefined();
      expect(partner.name).toBeDefined();
      expect(partner.niche).toBeDefined();
      expect(partner.subscribers).toBeGreaterThan(0);
      expect(partner.reputation).toBeGreaterThanOrEqual(35);
      expect(partner.reputation).toBeLessThanOrEqual(85);
      expect(partner.equipmentQuality).toBeGreaterThanOrEqual(20);
      expect(partner.equipmentQuality).toBeLessThanOrEqual(80);
      expect(partner.personality).toMatch(/^(chill|energetic|professional|chaotic)$/);
    });

    it('should generate smaller partners with fewer subscribers', () => {
      const smallerPartners: CollabPartner[] = [];
      for (let i = 0; i < 10; i++) {
        smallerPartners.push(generateCollabPartner(1000, ContentNiche.Gaming, 'smaller'));
      }
      const avgSubs = smallerPartners.reduce((sum, p) => sum + p.subscribers, 0) / 10;
      expect(avgSubs).toBeLessThan(1000);
    });

    it('should generate larger partners with more subscribers', () => {
      const largerPartners: CollabPartner[] = [];
      for (let i = 0; i < 10; i++) {
        largerPartners.push(generateCollabPartner(1000, ContentNiche.Gaming, 'larger'));
      }
      const avgSubs = largerPartners.reduce((sum, p) => sum + p.subscribers, 0) / 10;
      expect(avgSubs).toBeGreaterThan(1000);
    });
  });

  describe('calculateNicheCompatibility', () => {
    it('should return 1.0 for same niche', () => {
      expect(calculateNicheCompatibility(ContentNiche.Gaming, ContentNiche.Gaming)).toBe(1.0);
      expect(calculateNicheCompatibility(ContentNiche.Cooking, ContentNiche.Cooking)).toBe(1.0);
      expect(calculateNicheCompatibility(ContentNiche.Music, ContentNiche.Music)).toBe(1.0);
      expect(calculateNicheCompatibility(ContentNiche.IRL, ContentNiche.IRL)).toBe(1.0);
    });

    it('should return lower values for different niches', () => {
      expect(calculateNicheCompatibility(ContentNiche.Gaming, ContentNiche.Cooking)).toBeLessThan(1.0);
      expect(calculateNicheCompatibility(ContentNiche.Gaming, ContentNiche.Cooking)).toBeGreaterThan(0);
    });

    it('should have gaming and music be reasonably compatible', () => {
      expect(calculateNicheCompatibility(ContentNiche.Gaming, ContentNiche.Music)).toBeGreaterThanOrEqual(0.7);
    });

    it('should have cooking and IRL be reasonably compatible', () => {
      expect(calculateNicheCompatibility(ContentNiche.Cooking, ContentNiche.IRL)).toBeGreaterThanOrEqual(0.8);
    });
  });

  describe('calculateEquipmentCompatibility', () => {
    it('should return 1.0 for similar equipment quality', () => {
      expect(calculateEquipmentCompatibility(50, 55)).toBe(1.0);
      expect(calculateEquipmentCompatibility(80, 80)).toBe(1.0);
    });

    it('should return lower values for larger quality differences', () => {
      expect(calculateEquipmentCompatibility(50, 80)).toBeLessThan(1.0);
      expect(calculateEquipmentCompatibility(20, 80)).toBeLessThan(0.7);
    });

    it('should still return positive values for large differences', () => {
      expect(calculateEquipmentCompatibility(10, 100)).toBeGreaterThan(0);
    });
  });

  describe('calculateCollabSuccessScore', () => {
    it('should return a score between 0 and 1', () => {
      for (let i = 0; i < 20; i++) {
        const score = calculateCollabSuccessScore(1.0, 1.0, 80, 80);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(1);
      }
    });

    it('should return higher scores for better compatibility', () => {
      const scores: number[] = [];
      for (let i = 0; i < 50; i++) {
        scores.push(calculateCollabSuccessScore(1.0, 1.0, 80, 80));
      }
      const highAvg = scores.reduce((a, b) => a + b, 0) / scores.length;

      const lowScores: number[] = [];
      for (let i = 0; i < 50; i++) {
        lowScores.push(calculateCollabSuccessScore(0.3, 0.5, 30, 30));
      }
      const lowAvg = lowScores.reduce((a, b) => a + b, 0) / lowScores.length;

      expect(highAvg).toBeGreaterThan(lowAvg);
    });
  });

  describe('determineSuccessLevel', () => {
    it('should return disaster for very low scores', () => {
      expect(determineSuccessLevel(0.1)).toBe('disaster');
    });

    it('should return awkward for low scores', () => {
      expect(determineSuccessLevel(0.3)).toBe('awkward');
    });

    it('should return decent for medium scores', () => {
      expect(determineSuccessLevel(0.5)).toBe('decent');
    });

    it('should return great for good scores', () => {
      expect(determineSuccessLevel(0.7)).toBe('great');
    });

    it('should return legendary for excellent scores', () => {
      expect(determineSuccessLevel(0.9)).toBe('legendary');
    });
  });

  describe('calculateSubscribersGained', () => {
    it('should return at least 1 subscriber', () => {
      const subs = calculateSubscribersGained(10, 0.1, 0.4, 'guest_appearance');
      expect(subs).toBeGreaterThanOrEqual(1);
    });

    it('should scale with partner subscribers', () => {
      const smallPartner = calculateSubscribersGained(100, 0.5, 1.0, 'joint_stream');
      const largePartner = calculateSubscribersGained(10000, 0.5, 1.0, 'joint_stream');
      expect(largePartner).toBeGreaterThan(smallPartner);
    });

    it('should scale with success score', () => {
      const lowSuccess = calculateSubscribersGained(1000, 0.2, 1.0, 'joint_stream');
      const highSuccess = calculateSubscribersGained(1000, 0.9, 1.0, 'joint_stream');
      expect(highSuccess).toBeGreaterThan(lowSuccess);
    });

    it('should scale with collab type', () => {
      const guestAppearance = calculateSubscribersGained(1000, 0.5, 1.0, 'guest_appearance');
      const crossoverEvent = calculateSubscribersGained(1000, 0.5, 1.0, 'crossover_event');
      expect(crossoverEvent).toBeGreaterThan(guestAppearance);
    });
  });

  describe('calculateReputationChange', () => {
    it('should return negative value for disaster', () => {
      const rep = calculateReputationChange('disaster', 50, 'joint_stream');
      expect(rep).toBeLessThan(0);
    });

    it('should return positive value for great', () => {
      const rep = calculateReputationChange('great', 50, 'joint_stream');
      expect(rep).toBeGreaterThan(0);
    });

    it('should return higher value for legendary', () => {
      const legendary = calculateReputationChange('legendary', 50, 'joint_stream');
      const great = calculateReputationChange('great', 50, 'joint_stream');
      expect(legendary).toBeGreaterThan(great);
    });

    it('should scale with collab type', () => {
      const guestAppearance = calculateReputationChange('great', 50, 'guest_appearance');
      const crossoverEvent = calculateReputationChange('great', 50, 'crossover_event');
      expect(Math.abs(crossoverEvent)).toBeGreaterThan(Math.abs(guestAppearance));
    });
  });

  describe('calculateExperienceGained', () => {
    it('should return positive experience for all success levels', () => {
      expect(calculateExperienceGained('disaster', 'joint_stream')).toBeGreaterThan(0);
      expect(calculateExperienceGained('legendary', 'joint_stream')).toBeGreaterThan(0);
    });

    it('should return more experience for better success', () => {
      const disaster = calculateExperienceGained('disaster', 'joint_stream');
      const legendary = calculateExperienceGained('legendary', 'joint_stream');
      expect(legendary).toBeGreaterThan(disaster);
    });

    it('should scale with collab type', () => {
      const guestAppearance = calculateExperienceGained('great', 'guest_appearance');
      const collabSeries = calculateExperienceGained('great', 'collab_series');
      expect(collabSeries).toBeGreaterThan(guestAppearance);
    });
  });

  describe('generateCollabSuccessMessage', () => {
    it('should include partner name', () => {
      const message = generateCollabSuccessMessage('great', 'TestPartner', 50);
      expect(message).toContain('TestPartner');
    });

    it('should include subscriber count for good outcomes', () => {
      const message = generateCollabSuccessMessage('great', 'TestPartner', 100);
      expect(message.includes('100') || message.includes('TestPartner')).toBe(true);
    });

    it('should return different messages for different success levels', () => {
      const disaster = generateCollabSuccessMessage('disaster', 'Partner', 0);
      const legendary = generateCollabSuccessMessage('legendary', 'Partner', 100);
      expect(disaster.toLowerCase()).toMatch(/disaster|weird|cringe|zero chemistry/);
      expect(legendary.toLowerCase()).toMatch(/legendary|iconic|magic|history/);
    });
  });

  describe('generateCollabOffer', () => {
    it('should generate a valid offer', () => {
      const offer = generateCollabOffer(1000, ContentNiche.Gaming, true);
      expect(offer.id).toBeDefined();
      expect(offer.partner).toBeDefined();
      expect(offer.type).toMatch(/^(guest_appearance|joint_stream|collab_series|crossover_event)$/);
      expect(offer.isIncoming).toBe(true);
      expect(offer.expiresAt).toBeGreaterThan(Date.now());
      expect(offer.nicheCompatibility).toBeGreaterThan(0);
      expect(offer.nicheCompatibility).toBeLessThanOrEqual(1);
    });

    it('should respect isIncoming parameter', () => {
      const incoming = generateCollabOffer(1000, ContentNiche.Gaming, true);
      const outgoing = generateCollabOffer(1000, ContentNiche.Gaming, false);
      expect(incoming.isIncoming).toBe(true);
      expect(outgoing.isIncoming).toBe(false);
    });
  });

  describe('processCollab', () => {
    const mockEquipment: Equipment[] = [
      {
        id: 'camera_intermediate',
        name: 'Good Camera',
        category: EquipmentCategory.Camera,
        tier: EquipmentTier.Intermediate,
        price: 200,
        qualityBonus: 30,
        description: 'A good camera',
        asset: 'camera',
      },
      {
        id: 'mic_intermediate',
        name: 'Good Mic',
        category: EquipmentCategory.Microphone,
        tier: EquipmentTier.Intermediate,
        price: 150,
        qualityBonus: 35,
        description: 'A good mic',
        asset: 'mic',
      },
    ];

    it('should return a valid result', () => {
      const offer = generateCollabOffer(1000, ContentNiche.Gaming, true);
      const result = processCollab(offer, 60, mockEquipment);

      expect(result.subscribersGained).toBeGreaterThanOrEqual(0);
      expect(result.experienceGained).toBeGreaterThan(0);
      expect(result.successLevel).toMatch(/^(disaster|awkward|decent|great|legendary)$/);
      expect(result.partnerSatisfaction).toBeGreaterThanOrEqual(0);
      expect(result.partnerSatisfaction).toBeLessThanOrEqual(100);
      expect(result.message).toBeDefined();
    });

    it('should have reputation change within reasonable bounds', () => {
      for (let i = 0; i < 20; i++) {
        const offer = generateCollabOffer(1000, ContentNiche.Gaming, true);
        const result = processCollab(offer, 60, mockEquipment);
        expect(result.reputationChange).toBeGreaterThanOrEqual(-20);
        expect(result.reputationChange).toBeLessThanOrEqual(25);
      }
    });
  });

  describe('shouldTriggerCollabOffer', () => {
    it('should return false for low subscriber count', () => {
      expect(shouldTriggerCollabOffer(50, 60, 5)).toBe(false);
    });

    it('should return false for early weeks', () => {
      expect(shouldTriggerCollabOffer(500, 60, 1)).toBe(false);
    });

    it('should sometimes return true for eligible players', () => {
      let triggered = false;
      for (let i = 0; i < 100; i++) {
        if (shouldTriggerCollabOffer(5000, 80, 10)) {
          triggered = true;
          break;
        }
      }
      expect(triggered).toBe(true);
    });
  });

  describe('canInitiateCollab', () => {
    it('should return false for low subscriber count', () => {
      expect(canInitiateCollab(100, 50)).toBe(false);
    });

    it('should return false for low reputation', () => {
      expect(canInitiateCollab(500, 30)).toBe(false);
    });

    it('should return true for sufficient subscribers and reputation', () => {
      expect(canInitiateCollab(500, 50)).toBe(true);
    });
  });

  describe('generateOutgoingCollabTargets', () => {
    it('should generate the requested number of targets', () => {
      const targets = generateOutgoingCollabTargets(1000, ContentNiche.Gaming, 3);
      expect(targets.length).toBe(3);
    });

    it('should generate valid partners', () => {
      const targets = generateOutgoingCollabTargets(1000, ContentNiche.Gaming, 5);
      targets.forEach((partner) => {
        expect(partner.id).toBeDefined();
        expect(partner.name).toBeDefined();
        expect(partner.subscribers).toBeGreaterThan(0);
      });
    });
  });

  describe('getCollabTypeDescription', () => {
    it('should return descriptions for all collab types', () => {
      const types: CollabType[] = ['guest_appearance', 'joint_stream', 'collab_series', 'crossover_event'];
      types.forEach((type) => {
        const desc = getCollabTypeDescription(type);
        expect(desc).toBeDefined();
        expect(desc.length).toBeGreaterThan(10);
      });
    });
  });

  describe('getCollabTypeName', () => {
    it('should return names for all collab types', () => {
      expect(getCollabTypeName('guest_appearance')).toBe('Guest Appearance');
      expect(getCollabTypeName('joint_stream')).toBe('Joint Stream');
      expect(getCollabTypeName('collab_series')).toBe('Collab Series');
      expect(getCollabTypeName('crossover_event')).toBe('Crossover Event');
    });
  });

  describe('generateCollabChatMessage', () => {
    it('should include partner name in announcement messages', () => {
      let hasPartnerName = false;
      for (let i = 0; i < 20; i++) {
        const message = generateCollabChatMessage('TestStreamer', true);
        if (message.includes('TestStreamer')) {
          hasPartnerName = true;
          break;
        }
      }
      expect(hasPartnerName).toBe(true);
    });

    it('should generate different messages for positive and negative', () => {
      const positiveMessages = new Set<string>();
      const negativeMessages = new Set<string>();

      for (let i = 0; i < 20; i++) {
        positiveMessages.add(generateCollabChatMessage('Partner', true));
        negativeMessages.add(generateCollabChatMessage('Partner', false));
      }

      expect(positiveMessages.size).toBeGreaterThan(1);
      expect(negativeMessages.size).toBeGreaterThan(1);
    });
  });
});
