import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { ContentNiche, EquipmentCategory } from '../types';
import { getEquipmentById, EQUIPMENT_CATALOG } from '../data/equipment';

describe('EquipmentShop Purchase Flow', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('should allow purchase when player has enough money', () => {
    useGameStore.getState().initializeGame('TestChannel', ContentNiche.Gaming);

    const initialMoney = useGameStore.getState().player.money;
    expect(initialMoney).toBe(500);

    const usbWebcam = getEquipmentById('camera_basic');
    expect(usbWebcam).toBeDefined();
    expect(usbWebcam!.price).toBe(75);

    useGameStore.getState().updateCurrency(-usbWebcam!.price);
    useGameStore.getState().addEquipment(usbWebcam!);

    const state = useGameStore.getState();
    expect(state.player.money).toBe(425);
    expect(state.player.channel.equipment).toHaveLength(1);
    expect(state.player.channel.equipment[0].id).toBe('camera_basic');
  });

  it('should not allow purchase when player lacks money', () => {
    useGameStore.getState().initializeGame('TestChannel', ContentNiche.Gaming);
    useGameStore.getState().updateCurrency(-450);

    const state = useGameStore.getState();
    expect(state.player.money).toBe(50);

    const usbWebcam = getEquipmentById('camera_basic')!;
    const canAfford = state.player.money >= usbWebcam.price;
    expect(canAfford).toBe(false);
  });

  it('should track owned equipment correctly', () => {
    useGameStore.getState().initializeGame('TestChannel', ContentNiche.Gaming);

    const ringLight = getEquipmentById('light_basic')!;
    const headset = getEquipmentById('mic_basic')!;

    useGameStore.getState().addEquipment(ringLight);
    useGameStore.getState().addEquipment(headset);

    const state = useGameStore.getState();
    const ownedIds = new Set(state.player.channel.equipment.map((e) => e.id));
    expect(ownedIds.has('light_basic')).toBe(true);
    expect(ownedIds.has('mic_basic')).toBe(true);
    expect(ownedIds.has('camera_basic')).toBe(false);
  });

  it('should respect unlock level requirements', () => {
    useGameStore.getState().initializeGame('TestChannel', ContentNiche.Gaming);

    const state = useGameStore.getState();
    expect(state.player.level).toBe(1);

    const mirrorlessCamera = getEquipmentById('camera_professional')!;
    expect(mirrorlessCamera.unlockLevel).toBe(7);

    const isLocked = mirrorlessCamera.unlockLevel! > state.player.level;
    expect(isLocked).toBe(true);
  });

  it('should respect upgrade path requirements', () => {
    useGameStore.getState().initializeGame('TestChannel', ContentNiche.Gaming);

    const c920 = getEquipmentById('camera_intermediate')!;
    expect(c920.upgradesFrom).toBe('camera_basic');

    let state = useGameStore.getState();
    let ownedIds = new Set(state.player.channel.equipment.map((e) => e.id));
    let hasPrerequisite = ownedIds.has(c920.upgradesFrom!);
    expect(hasPrerequisite).toBe(false);

    const usbWebcam = getEquipmentById('camera_basic')!;
    useGameStore.getState().addEquipment(usbWebcam);

    state = useGameStore.getState();
    ownedIds = new Set(state.player.channel.equipment.map((e) => e.id));
    hasPrerequisite = ownedIds.has(c920.upgradesFrom!);
    expect(hasPrerequisite).toBe(true);
  });

  it('should categorize equipment correctly', () => {
    const cameras = EQUIPMENT_CATALOG.filter((e) => e.category === EquipmentCategory.Camera);
    const microphones = EQUIPMENT_CATALOG.filter((e) => e.category === EquipmentCategory.Microphone);
    const lighting = EQUIPMENT_CATALOG.filter((e) => e.category === EquipmentCategory.Lighting);

    expect(cameras.length).toBeGreaterThan(0);
    expect(microphones.length).toBeGreaterThan(0);
    expect(lighting.length).toBeGreaterThan(0);

    cameras.forEach((camera) => {
      expect(camera.category).toBe(EquipmentCategory.Camera);
    });
  });

  it('should deduct exact price amount on purchase', () => {
    useGameStore.getState().initializeGame('TestChannel', ContentNiche.Gaming);

    const initialMoney = useGameStore.getState().player.money;
    const officeChair = getEquipmentById('chair_basic')!;

    useGameStore.getState().updateCurrency(-officeChair.price);
    useGameStore.getState().addEquipment(officeChair);

    const state = useGameStore.getState();
    expect(state.player.money).toBe(initialMoney - officeChair.price);
  });

  it('should prevent money from going negative', () => {
    useGameStore.getState().initializeGame('TestChannel', ContentNiche.Gaming);
    useGameStore.getState().updateCurrency(-1000);

    const state = useGameStore.getState();
    expect(state.player.money).toBe(0);
  });

  it('should identify available upgrades based on owned equipment', () => {
    useGameStore.getState().initializeGame('TestChannel', ContentNiche.Gaming);

    const starterMic = getEquipmentById('mic_starter')!;
    useGameStore.getState().addEquipment(starterMic);

    const state = useGameStore.getState();
    const ownedIds = new Set(state.player.channel.equipment.map((e) => e.id));

    const headset = getEquipmentById('mic_basic')!;
    const canUpgrade = headset.upgradesFrom ? ownedIds.has(headset.upgradesFrom) : true;
    expect(canUpgrade).toBe(true);
  });

  it('should handle multiple purchases correctly', () => {
    useGameStore.getState().initializeGame('TestChannel', ContentNiche.Gaming);

    const ringLight = getEquipmentById('light_basic')!;
    const headset = getEquipmentById('mic_basic')!;
    const ledStrips = getEquipmentById('decor_basic')!;

    const totalCost = ringLight.price + headset.price + ledStrips.price;
    const initialMoney = useGameStore.getState().player.money;

    useGameStore.getState().updateCurrency(-ringLight.price);
    useGameStore.getState().addEquipment(ringLight);

    useGameStore.getState().updateCurrency(-headset.price);
    useGameStore.getState().addEquipment(headset);

    useGameStore.getState().updateCurrency(-ledStrips.price);
    useGameStore.getState().addEquipment(ledStrips);

    const state = useGameStore.getState();
    expect(state.player.channel.equipment).toHaveLength(3);
    expect(state.player.money).toBe(initialMoney - totalCost);
  });
});
