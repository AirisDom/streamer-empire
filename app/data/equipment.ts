import { Equipment, EquipmentCategory, EquipmentTier } from '../types';

export const EQUIPMENT_CATALOG: Equipment[] = [
  // === CAMERAS ===
  {
    id: 'camera_starter',
    name: 'Laptop Webcam',
    category: EquipmentCategory.Camera,
    tier: EquipmentTier.Starter,
    price: 0,
    qualityBonus: 5,
    description: 'The built-in webcam that came with your laptop. Grainy but functional.',
    asset: 'camera_laptop',
  },
  {
    id: 'camera_basic',
    name: 'USB Webcam',
    category: EquipmentCategory.Camera,
    tier: EquipmentTier.Basic,
    price: 75,
    qualityBonus: 15,
    description: 'A basic 1080p USB webcam. Much better than the laptop cam.',
    asset: 'camera_usb',
    upgradesFrom: 'camera_starter',
  },
  {
    id: 'camera_intermediate',
    name: 'Logitech C920',
    category: EquipmentCategory.Camera,
    tier: EquipmentTier.Intermediate,
    price: 200,
    qualityBonus: 30,
    description: 'The industry standard streaming webcam with great autofocus.',
    asset: 'camera_c920',
    unlockLevel: 3,
    upgradesFrom: 'camera_basic',
  },
  {
    id: 'camera_professional',
    name: 'Mirrorless Camera',
    category: EquipmentCategory.Camera,
    tier: EquipmentTier.Professional,
    price: 800,
    qualityBonus: 50,
    description: 'A Sony mirrorless camera with capture card. Cinema-quality video.',
    asset: 'camera_mirrorless',
    unlockLevel: 7,
    upgradesFrom: 'camera_intermediate',
  },
  {
    id: 'camera_elite',
    name: 'Pro Cinema Rig',
    category: EquipmentCategory.Camera,
    tier: EquipmentTier.Elite,
    price: 3000,
    qualityBonus: 75,
    description: 'Full cinema camera setup with multiple angles and motorized tracking.',
    asset: 'camera_cinema',
    unlockLevel: 12,
    upgradesFrom: 'camera_professional',
  },

  // === MICROPHONES ===
  {
    id: 'mic_starter',
    name: 'Laptop Mic',
    category: EquipmentCategory.Microphone,
    tier: EquipmentTier.Starter,
    price: 0,
    qualityBonus: 5,
    description: 'Your laptop\'s built-in microphone. Picks up everything including your keyboard.',
    asset: 'mic_laptop',
  },
  {
    id: 'mic_basic',
    name: 'USB Headset',
    category: EquipmentCategory.Microphone,
    tier: EquipmentTier.Basic,
    price: 50,
    qualityBonus: 15,
    description: 'A gaming headset with a boom mic. Clear voice, minimal echo.',
    asset: 'mic_headset',
    upgradesFrom: 'mic_starter',
  },
  {
    id: 'mic_intermediate',
    name: 'Blue Yeti',
    category: EquipmentCategory.Microphone,
    tier: EquipmentTier.Intermediate,
    price: 150,
    qualityBonus: 35,
    description: 'Popular USB condenser mic with multiple pickup patterns.',
    asset: 'mic_yeti',
    unlockLevel: 3,
    upgradesFrom: 'mic_basic',
  },
  {
    id: 'mic_professional',
    name: 'Shure SM7B',
    category: EquipmentCategory.Microphone,
    tier: EquipmentTier.Professional,
    price: 500,
    qualityBonus: 55,
    description: 'Broadcast-quality dynamic mic used by top podcasters and streamers.',
    asset: 'mic_sm7b',
    unlockLevel: 7,
    upgradesFrom: 'mic_intermediate',
  },
  {
    id: 'mic_elite',
    name: 'Studio Vocal Chain',
    category: EquipmentCategory.Microphone,
    tier: EquipmentTier.Elite,
    price: 2000,
    qualityBonus: 80,
    description: 'Neumann mic with tube preamp and hardware compressor. Radio-ready audio.',
    asset: 'mic_studio',
    unlockLevel: 12,
    upgradesFrom: 'mic_professional',
  },

  // === LIGHTING ===
  {
    id: 'light_starter',
    name: 'Room Lamp',
    category: EquipmentCategory.Lighting,
    tier: EquipmentTier.Starter,
    price: 0,
    qualityBonus: 5,
    description: 'Just the regular ceiling light in your room. Creates harsh shadows.',
    asset: 'light_room',
  },
  {
    id: 'light_basic',
    name: 'Desk Ring Light',
    category: EquipmentCategory.Lighting,
    tier: EquipmentTier.Basic,
    price: 40,
    qualityBonus: 15,
    description: 'A small ring light that clips to your desk. Even, flattering light.',
    asset: 'light_ring_small',
    upgradesFrom: 'light_starter',
  },
  {
    id: 'light_intermediate',
    name: 'Key Light Set',
    category: EquipmentCategory.Lighting,
    tier: EquipmentTier.Intermediate,
    price: 200,
    qualityBonus: 35,
    description: 'Two-point LED panel lighting with adjustable color temperature.',
    asset: 'light_panels',
    unlockLevel: 3,
    upgradesFrom: 'light_basic',
  },
  {
    id: 'light_professional',
    name: 'Elgato Key Light Air',
    category: EquipmentCategory.Lighting,
    tier: EquipmentTier.Professional,
    price: 400,
    qualityBonus: 55,
    description: 'Professional streaming lights with app control and perfect diffusion.',
    asset: 'light_elgato',
    unlockLevel: 7,
    upgradesFrom: 'light_intermediate',
  },
  {
    id: 'light_elite',
    name: 'Studio Lighting Rig',
    category: EquipmentCategory.Lighting,
    tier: EquipmentTier.Elite,
    price: 1500,
    qualityBonus: 80,
    description: 'Full three-point lighting with RGB accents and automated scene modes.',
    asset: 'light_studio',
    unlockLevel: 12,
    upgradesFrom: 'light_professional',
  },

  // === PC ===
  {
    id: 'pc_starter',
    name: 'Old Laptop',
    category: EquipmentCategory.PC,
    tier: EquipmentTier.Starter,
    price: 0,
    qualityBonus: 5,
    description: 'Your trusty 5-year-old laptop. Struggles with 720p encoding.',
    asset: 'pc_laptop_old',
  },
  {
    id: 'pc_basic',
    name: 'Budget Desktop',
    category: EquipmentCategory.PC,
    tier: EquipmentTier.Basic,
    price: 600,
    qualityBonus: 20,
    description: 'Entry-level gaming PC. Can handle 1080p streaming without drops.',
    asset: 'pc_budget',
    upgradesFrom: 'pc_starter',
  },
  {
    id: 'pc_intermediate',
    name: 'Gaming PC',
    category: EquipmentCategory.PC,
    tier: EquipmentTier.Intermediate,
    price: 1200,
    qualityBonus: 40,
    description: 'Mid-range gaming rig with RTX graphics. Smooth gameplay and encoding.',
    asset: 'pc_gaming',
    unlockLevel: 5,
    upgradesFrom: 'pc_basic',
  },
  {
    id: 'pc_professional',
    name: 'High-End Workstation',
    category: EquipmentCategory.PC,
    tier: EquipmentTier.Professional,
    price: 3000,
    qualityBonus: 60,
    description: 'Powerful workstation with dual GPUs. 4K streaming capability.',
    asset: 'pc_workstation',
    unlockLevel: 10,
    upgradesFrom: 'pc_intermediate',
  },
  {
    id: 'pc_elite',
    name: 'Streaming Battlestation',
    category: EquipmentCategory.PC,
    tier: EquipmentTier.Elite,
    price: 8000,
    qualityBonus: 85,
    description: 'Dedicated streaming PC + gaming PC setup with NDI capture.',
    asset: 'pc_battlestation',
    unlockLevel: 15,
    upgradesFrom: 'pc_professional',
  },

  // === CHAIRS ===
  {
    id: 'chair_starter',
    name: 'Kitchen Chair',
    category: EquipmentCategory.Chair,
    tier: EquipmentTier.Starter,
    price: 0,
    qualityBonus: 0,
    description: 'A wooden chair borrowed from the kitchen. Your back already hurts.',
    asset: 'chair_kitchen',
  },
  {
    id: 'chair_basic',
    name: 'Office Chair',
    category: EquipmentCategory.Chair,
    tier: EquipmentTier.Basic,
    price: 100,
    qualityBonus: 5,
    description: 'Basic mesh office chair with adjustable height. Adequate comfort.',
    asset: 'chair_office',
    upgradesFrom: 'chair_starter',
  },
  {
    id: 'chair_intermediate',
    name: 'Gaming Chair',
    category: EquipmentCategory.Chair,
    tier: EquipmentTier.Intermediate,
    price: 300,
    qualityBonus: 10,
    description: 'Racing-style gaming chair with lumbar support. Looks great on camera.',
    asset: 'chair_gaming',
    unlockLevel: 3,
    upgradesFrom: 'chair_basic',
  },
  {
    id: 'chair_professional',
    name: 'Ergonomic Chair',
    category: EquipmentCategory.Chair,
    tier: EquipmentTier.Professional,
    price: 800,
    qualityBonus: 15,
    description: 'Herman Miller style ergonomic chair. Stream longer without fatigue.',
    asset: 'chair_ergonomic',
    unlockLevel: 7,
    upgradesFrom: 'chair_intermediate',
  },
  {
    id: 'chair_elite',
    name: 'Secretlab Titan',
    category: EquipmentCategory.Chair,
    tier: EquipmentTier.Elite,
    price: 1500,
    qualityBonus: 20,
    description: 'Premium gaming throne with magnetic accessories. Peak comfort.',
    asset: 'chair_secretlab',
    unlockLevel: 10,
    upgradesFrom: 'chair_professional',
  },

  // === DECOR ===
  {
    id: 'decor_starter',
    name: 'Blank Wall',
    category: EquipmentCategory.Decor,
    tier: EquipmentTier.Starter,
    price: 0,
    qualityBonus: 0,
    description: 'Just a plain wall behind you. Professional but boring.',
    asset: 'decor_blank',
  },
  {
    id: 'decor_basic',
    name: 'LED Strip Lights',
    category: EquipmentCategory.Decor,
    tier: EquipmentTier.Basic,
    price: 30,
    qualityBonus: 5,
    description: 'RGB LED strips along your desk. Adds color and vibe.',
    asset: 'decor_led_strips',
    upgradesFrom: 'decor_starter',
  },
  {
    id: 'decor_intermediate',
    name: 'Nanoleaf Panels',
    category: EquipmentCategory.Decor,
    tier: EquipmentTier.Intermediate,
    price: 200,
    qualityBonus: 15,
    description: 'Hexagonal LED panels that react to your stream. Eye-catching background.',
    asset: 'decor_nanoleaf',
    unlockLevel: 3,
    upgradesFrom: 'decor_basic',
  },
  {
    id: 'decor_professional',
    name: 'Custom Backdrop',
    category: EquipmentCategory.Decor,
    tier: EquipmentTier.Professional,
    price: 500,
    qualityBonus: 25,
    description: 'Branded backdrop with shelves for collectibles and neon sign.',
    asset: 'decor_backdrop',
    unlockLevel: 7,
    upgradesFrom: 'decor_intermediate',
  },
  {
    id: 'decor_elite',
    name: 'Pro Studio Set',
    category: EquipmentCategory.Decor,
    tier: EquipmentTier.Elite,
    price: 2500,
    qualityBonus: 40,
    description: 'Full studio makeover with acoustic panels, custom furniture, and ambient lighting.',
    asset: 'decor_studio',
    unlockLevel: 12,
    upgradesFrom: 'decor_professional',
  },
];

export function getEquipmentById(id: string): Equipment | undefined {
  return EQUIPMENT_CATALOG.find((e) => e.id === id);
}

export function getEquipmentByCategory(category: EquipmentCategory): Equipment[] {
  return EQUIPMENT_CATALOG.filter((e) => e.category === category);
}

export function getEquipmentByTier(tier: EquipmentTier): Equipment[] {
  return EQUIPMENT_CATALOG.filter((e) => e.tier === tier);
}

export function getStarterEquipment(): Equipment[] {
  return EQUIPMENT_CATALOG.filter((e) => e.tier === EquipmentTier.Starter);
}

export function getUpgradePath(equipmentId: string): Equipment[] {
  const path: Equipment[] = [];
  let current = getEquipmentById(equipmentId);

  while (current) {
    path.push(current);
    const next = EQUIPMENT_CATALOG.find((e) => e.upgradesFrom === current!.id);
    current = next;
  }

  return path;
}

export function getAvailableUpgrades(
  currentEquipment: Equipment[],
  playerLevel: number
): Equipment[] {
  const currentIds = new Set(currentEquipment.map((e) => e.id));

  return EQUIPMENT_CATALOG.filter((e) => {
    if (currentIds.has(e.id)) return false;
    if (e.unlockLevel && playerLevel < e.unlockLevel) return false;
    if (e.upgradesFrom && !currentIds.has(e.upgradesFrom)) return false;
    if (!e.upgradesFrom && e.tier !== EquipmentTier.Starter) {
      const hasLowerTierInCategory = currentEquipment.some(
        (owned) => owned.category === e.category && owned.tier < e.tier
      );
      if (!hasLowerTierInCategory) return false;
    }
    return true;
  });
}

export function calculateTotalQualityBonus(equipment: Equipment[]): number {
  return equipment.reduce((total, e) => total + e.qualityBonus, 0);
}

export function getCategoryQualityBonus(
  equipment: Equipment[],
  category: EquipmentCategory
): number {
  const categoryEquipment = equipment.filter((e) => e.category === category);
  if (categoryEquipment.length === 0) return 0;
  return Math.max(...categoryEquipment.map((e) => e.qualityBonus));
}
