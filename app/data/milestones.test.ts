import { describe, it, expect } from 'vitest';
import {
  SUBSCRIBER_MILESTONES,
  getNextMilestone,
  getMilestoneProgress,
  getAchievedMilestones,
  checkNewMilestone,
  formatSubscriberCount,
} from './milestones';

describe('milestones', () => {
  describe('SUBSCRIBER_MILESTONES', () => {
    it('should have 5 milestone thresholds', () => {
      expect(SUBSCRIBER_MILESTONES).toHaveLength(5);
    });

    it('should have thresholds in ascending order', () => {
      const thresholds = SUBSCRIBER_MILESTONES.map((m) => m.threshold);
      expect(thresholds).toEqual([100, 1000, 10000, 100000, 1000000]);
    });

    it('should have unique IDs', () => {
      const ids = SUBSCRIBER_MILESTONES.map((m) => m.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have rewards for each milestone', () => {
      SUBSCRIBER_MILESTONES.forEach((m) => {
        expect(m.rewards.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getNextMilestone', () => {
    it('should return first milestone for 0 subscribers', () => {
      const next = getNextMilestone(0);
      expect(next?.threshold).toBe(100);
    });

    it('should return 1K milestone for 100 subscribers', () => {
      const next = getNextMilestone(100);
      expect(next?.threshold).toBe(1000);
    });

    it('should return null when all milestones achieved', () => {
      const next = getNextMilestone(1000000);
      expect(next).toBeNull();
    });

    it('should return correct milestone when between thresholds', () => {
      const next = getNextMilestone(5000);
      expect(next?.threshold).toBe(10000);
    });
  });

  describe('getMilestoneProgress', () => {
    it('should calculate progress for new player', () => {
      const progress = getMilestoneProgress(50);
      expect(progress.current).toBe(50);
      expect(progress.target).toBe(100);
      expect(progress.percentage).toBe(50);
      expect(progress.previousThreshold).toBe(0);
    });

    it('should calculate progress between milestones', () => {
      const progress = getMilestoneProgress(550);
      expect(progress.current).toBe(550);
      expect(progress.target).toBe(1000);
      expect(progress.previousThreshold).toBe(100);
      expect(progress.percentage).toBe(50);
    });

    it('should show 100% when all milestones complete', () => {
      const progress = getMilestoneProgress(2000000);
      expect(progress.percentage).toBe(100);
      expect(progress.milestone).toBeNull();
    });
  });

  describe('getAchievedMilestones', () => {
    it('should return empty array for new player', () => {
      const achieved = getAchievedMilestones(50);
      expect(achieved).toHaveLength(0);
    });

    it('should return first milestone when at 100 subs', () => {
      const achieved = getAchievedMilestones(100);
      expect(achieved).toHaveLength(1);
      expect(achieved[0].threshold).toBe(100);
    });

    it('should return multiple milestones', () => {
      const achieved = getAchievedMilestones(15000);
      expect(achieved).toHaveLength(3);
    });

    it('should return all milestones for 1M+ subs', () => {
      const achieved = getAchievedMilestones(1500000);
      expect(achieved).toHaveLength(5);
    });
  });

  describe('checkNewMilestone', () => {
    it('should return milestone when crossing threshold', () => {
      const milestone = checkNewMilestone(90, 110);
      expect(milestone?.threshold).toBe(100);
    });

    it('should return null when not crossing threshold', () => {
      const milestone = checkNewMilestone(50, 80);
      expect(milestone).toBeNull();
    });

    it('should return null when going backwards', () => {
      const milestone = checkNewMilestone(150, 100);
      expect(milestone).toBeNull();
    });

    it('should detect 1K milestone', () => {
      const milestone = checkNewMilestone(990, 1010);
      expect(milestone?.threshold).toBe(1000);
    });
  });

  describe('formatSubscriberCount', () => {
    it('should format small numbers as-is', () => {
      expect(formatSubscriberCount(50)).toBe('50');
      expect(formatSubscriberCount(999)).toBe('999');
    });

    it('should format thousands with K', () => {
      expect(formatSubscriberCount(1000)).toBe('1.0K');
      expect(formatSubscriberCount(5500)).toBe('5.5K');
      expect(formatSubscriberCount(999999)).toBe('1000.0K');
    });

    it('should format millions with M', () => {
      expect(formatSubscriberCount(1000000)).toBe('1.0M');
      expect(formatSubscriberCount(2500000)).toBe('2.5M');
    });
  });
});
