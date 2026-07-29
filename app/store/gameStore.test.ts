import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './gameStore';
import { ContentNiche, EquipmentCategory, EquipmentTier, Equipment } from '../types';

describe('gameStore', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  describe('initial state', () => {
    it('should have default channel name', () => {
      const state = useGameStore.getState();
      expect(state.player.channel.name).toBe('NewStreamer');
    });

    it('should have default niche as Gaming', () => {
      const state = useGameStore.getState();
      expect(state.player.channel.niche).toBe(ContentNiche.Gaming);
    });

    it('should start with 0 subscribers', () => {
      const state = useGameStore.getState();
      expect(state.player.channel.subscribers).toBe(0);
    });

    it('should start with 500 currency', () => {
      const state = useGameStore.getState();
      expect(state.player.money).toBe(500);
    });

    it('should start at week 1', () => {
      const state = useGameStore.getState();
      expect(state.player.currentWeek).toBe(1);
    });

    it('should start with empty equipment inventory', () => {
      const state = useGameStore.getState();
      expect(state.player.channel.equipment).toEqual([]);
    });
  });

  describe('initializeGame', () => {
    it('should set custom channel name', () => {
      useGameStore.getState().initializeGame('MyChannel', ContentNiche.Music);
      const state = useGameStore.getState();
      expect(state.player.channel.name).toBe('MyChannel');
    });

    it('should set custom niche', () => {
      useGameStore.getState().initializeGame('MyChannel', ContentNiche.Cooking);
      const state = useGameStore.getState();
      expect(state.player.channel.niche).toBe(ContentNiche.Cooking);
    });

    it('should unlock the selected niche', () => {
      useGameStore.getState().initializeGame('MyChannel', ContentNiche.IRL);
      const state = useGameStore.getState();
      expect(state.player.unlockedNiches).toContain(ContentNiche.IRL);
    });
  });

  describe('updateCurrency', () => {
    it('should add currency when positive amount', () => {
      useGameStore.getState().updateCurrency(100);
      const state = useGameStore.getState();
      expect(state.player.money).toBe(600);
    });

    it('should subtract currency when negative amount', () => {
      useGameStore.getState().updateCurrency(-200);
      const state = useGameStore.getState();
      expect(state.player.money).toBe(300);
    });

    it('should not go below zero', () => {
      useGameStore.getState().updateCurrency(-1000);
      const state = useGameStore.getState();
      expect(state.player.money).toBe(0);
    });

    it('should handle multiple updates', () => {
      useGameStore.getState().updateCurrency(100);
      useGameStore.getState().updateCurrency(50);
      useGameStore.getState().updateCurrency(-25);
      const state = useGameStore.getState();
      expect(state.player.money).toBe(625);
    });
  });

  describe('updateSubscribers', () => {
    it('should add subscribers when positive amount', () => {
      useGameStore.getState().updateSubscribers(50);
      const state = useGameStore.getState();
      expect(state.player.channel.subscribers).toBe(50);
    });

    it('should subtract subscribers when negative amount', () => {
      useGameStore.getState().updateSubscribers(100);
      useGameStore.getState().updateSubscribers(-30);
      const state = useGameStore.getState();
      expect(state.player.channel.subscribers).toBe(70);
    });

    it('should not go below zero', () => {
      useGameStore.getState().updateSubscribers(-1000);
      const state = useGameStore.getState();
      expect(state.player.channel.subscribers).toBe(0);
    });

    it('should handle large subscriber counts', () => {
      useGameStore.getState().updateSubscribers(1000000);
      const state = useGameStore.getState();
      expect(state.player.channel.subscribers).toBe(1000000);
    });
  });

  describe('addEquipment', () => {
    const testEquipment: Equipment = {
      id: 'test-camera-1',
      name: 'Basic Webcam',
      category: EquipmentCategory.Camera,
      tier: EquipmentTier.Starter,
      price: 100,
      qualityBonus: 5,
      description: 'A basic webcam for streaming',
    };

    it('should add equipment to inventory', () => {
      useGameStore.getState().addEquipment(testEquipment);
      const state = useGameStore.getState();
      expect(state.player.channel.equipment).toHaveLength(1);
      expect(state.player.channel.equipment[0]).toEqual(testEquipment);
    });

    it('should allow multiple equipment items', () => {
      const secondEquipment: Equipment = {
        id: 'test-mic-1',
        name: 'USB Microphone',
        category: EquipmentCategory.Microphone,
        tier: EquipmentTier.Basic,
        price: 150,
        qualityBonus: 10,
        description: 'A decent USB microphone',
      };

      useGameStore.getState().addEquipment(testEquipment);
      useGameStore.getState().addEquipment(secondEquipment);
      const state = useGameStore.getState();
      expect(state.player.channel.equipment).toHaveLength(2);
    });
  });

  describe('removeEquipment', () => {
    const testEquipment: Equipment = {
      id: 'test-camera-1',
      name: 'Basic Webcam',
      category: EquipmentCategory.Camera,
      tier: EquipmentTier.Starter,
      price: 100,
      qualityBonus: 5,
      description: 'A basic webcam for streaming',
    };

    it('should remove equipment by id', () => {
      useGameStore.getState().addEquipment(testEquipment);
      useGameStore.getState().removeEquipment('test-camera-1');
      const state = useGameStore.getState();
      expect(state.player.channel.equipment).toHaveLength(0);
    });

    it('should not affect other equipment', () => {
      const secondEquipment: Equipment = {
        id: 'test-mic-1',
        name: 'USB Microphone',
        category: EquipmentCategory.Microphone,
        tier: EquipmentTier.Basic,
        price: 150,
        qualityBonus: 10,
        description: 'A decent USB microphone',
      };

      useGameStore.getState().addEquipment(testEquipment);
      useGameStore.getState().addEquipment(secondEquipment);
      useGameStore.getState().removeEquipment('test-camera-1');
      const state = useGameStore.getState();
      expect(state.player.channel.equipment).toHaveLength(1);
      expect(state.player.channel.equipment[0].id).toBe('test-mic-1');
    });
  });

  describe('advanceWeek', () => {
    it('should increment week by 1', () => {
      useGameStore.getState().advanceWeek();
      const state = useGameStore.getState();
      expect(state.player.currentWeek).toBe(2);
    });

    it('should reset day to 1', () => {
      const store = useGameStore.getState();
      store.advanceWeek();
      const state = useGameStore.getState();
      expect(state.player.currentDay).toBe(1);
    });
  });

  describe('setGamePaused', () => {
    it('should pause the game', () => {
      useGameStore.getState().setGamePaused(true);
      const state = useGameStore.getState();
      expect(state.isPaused).toBe(true);
    });

    it('should unpause the game', () => {
      useGameStore.getState().setGamePaused(true);
      useGameStore.getState().setGamePaused(false);
      const state = useGameStore.getState();
      expect(state.isPaused).toBe(false);
    });
  });

  describe('resetGame', () => {
    it('should reset all state to initial values', () => {
      useGameStore.getState().updateCurrency(1000);
      useGameStore.getState().updateSubscribers(500);
      useGameStore.getState().advanceWeek();
      useGameStore.getState().resetGame();

      const state = useGameStore.getState();
      expect(state.player.money).toBe(500);
      expect(state.player.channel.subscribers).toBe(0);
      expect(state.player.currentWeek).toBe(1);
    });
  });
});
