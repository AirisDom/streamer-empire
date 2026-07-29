import { describe, it, expect } from 'vitest';
import {
  EQUIPMENT_CATALOG,
  getEquipmentById,
  getEquipmentByCategory,
  getEquipmentByTier,
  getStarterEquipment,
  getUpgradePath,
  getAvailableUpgrades,
  calculateTotalQualityBonus,
  getCategoryQualityBonus,
} from './equipment';
import { EquipmentCategory, EquipmentTier } from '../types';

describe('Equipment Catalog', () => {
  it('has equipment for all categories', () => {
    const categories = Object.values(EquipmentCategory);
    for (const category of categories) {
      const items = getEquipmentByCategory(category);
      expect(items.length).toBeGreaterThan(0);
    }
  });

  it('has equipment for all tiers', () => {
    const tiers = Object.values(EquipmentTier).filter(
      (t) => typeof t === 'number'
    ) as EquipmentTier[];
    for (const tier of tiers) {
      const items = getEquipmentByTier(tier);
      expect(items.length).toBeGreaterThan(0);
    }
  });

  it('has exactly 5 tiers per category', () => {
    const categories = Object.values(EquipmentCategory);
    for (const category of categories) {
      const items = getEquipmentByCategory(category);
      expect(items.length).toBe(5);
    }
  });

  it('has unique IDs for all equipment', () => {
    const ids = EQUIPMENT_CATALOG.map((e) => e.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('starter equipment has price 0', () => {
    const starters = getStarterEquipment();
    for (const item of starters) {
      expect(item.price).toBe(0);
    }
  });

  it('higher tiers have higher prices within category', () => {
    const categories = Object.values(EquipmentCategory);
    for (const category of categories) {
      const items = getEquipmentByCategory(category).sort(
        (a, b) => a.tier - b.tier
      );
      for (let i = 1; i < items.length; i++) {
        expect(items[i].price).toBeGreaterThanOrEqual(items[i - 1].price);
      }
    }
  });

  it('higher tiers have higher quality bonus within category', () => {
    const categories = Object.values(EquipmentCategory);
    for (const category of categories) {
      const items = getEquipmentByCategory(category).sort(
        (a, b) => a.tier - b.tier
      );
      for (let i = 1; i < items.length; i++) {
        expect(items[i].qualityBonus).toBeGreaterThanOrEqual(
          items[i - 1].qualityBonus
        );
      }
    }
  });

  it('all equipment has valid asset references', () => {
    for (const item of EQUIPMENT_CATALOG) {
      expect(item.asset).toBeTruthy();
      expect(item.asset.length).toBeGreaterThan(0);
    }
  });
});

describe('getEquipmentById', () => {
  it('returns equipment by ID', () => {
    const camera = getEquipmentById('camera_starter');
    expect(camera).toBeDefined();
    expect(camera?.name).toBe('Laptop Webcam');
  });

  it('returns undefined for invalid ID', () => {
    const invalid = getEquipmentById('nonexistent');
    expect(invalid).toBeUndefined();
  });
});

describe('getUpgradePath', () => {
  it('returns full upgrade path for starter camera', () => {
    const path = getUpgradePath('camera_starter');
    expect(path.length).toBe(5);
    expect(path[0].id).toBe('camera_starter');
    expect(path[4].id).toBe('camera_elite');
  });

  it('returns remaining path for mid-tier item', () => {
    const path = getUpgradePath('mic_intermediate');
    expect(path.length).toBe(3);
    expect(path[0].id).toBe('mic_intermediate');
    expect(path[2].id).toBe('mic_elite');
  });

  it('returns single item for elite equipment', () => {
    const path = getUpgradePath('light_elite');
    expect(path.length).toBe(1);
  });
});

describe('getAvailableUpgrades', () => {
  it('returns starter equipment when player has nothing', () => {
    const upgrades = getAvailableUpgrades([], 1);
    const starterIds = getStarterEquipment().map((e) => e.id);
    for (const starter of starterIds) {
      expect(upgrades.some((u) => u.id === starter)).toBe(true);
    }
  });

  it('returns next tier when owning starter', () => {
    const starter = getEquipmentById('camera_starter')!;
    const upgrades = getAvailableUpgrades([starter], 1);
    expect(upgrades.some((u) => u.id === 'camera_basic')).toBe(true);
  });

  it('respects unlock level requirements', () => {
    const basic = getEquipmentById('camera_basic')!;
    const upgradesLevel1 = getAvailableUpgrades([basic], 1);
    const upgradesLevel5 = getAvailableUpgrades([basic], 5);
    expect(upgradesLevel1.some((u) => u.id === 'camera_intermediate')).toBe(
      false
    );
    expect(upgradesLevel5.some((u) => u.id === 'camera_intermediate')).toBe(
      true
    );
  });
});

describe('calculateTotalQualityBonus', () => {
  it('returns 0 for empty equipment', () => {
    expect(calculateTotalQualityBonus([])).toBe(0);
  });

  it('sums quality bonuses correctly', () => {
    const camera = getEquipmentById('camera_starter')!;
    const mic = getEquipmentById('mic_basic')!;
    const total = calculateTotalQualityBonus([camera, mic]);
    expect(total).toBe(camera.qualityBonus + mic.qualityBonus);
  });
});

describe('getCategoryQualityBonus', () => {
  it('returns 0 for empty equipment', () => {
    expect(getCategoryQualityBonus([], EquipmentCategory.Camera)).toBe(0);
  });

  it('returns max bonus when multiple items in category', () => {
    const starter = getEquipmentById('camera_starter')!;
    const basic = getEquipmentById('camera_basic')!;
    const bonus = getCategoryQualityBonus([starter, basic], EquipmentCategory.Camera);
    expect(bonus).toBe(basic.qualityBonus);
  });
});
