'use client';

import { useState } from 'react';
import { useGameStore, GameStore } from '../store/gameStore';
import { Equipment, EquipmentCategory, EquipmentTier } from '../types';
import {
  EQUIPMENT_CATALOG,
  getEquipmentByCategory,
} from '../data/equipment';

interface EquipmentShopProps {
  onClose: () => void;
}

const CATEGORY_INFO: Record<EquipmentCategory, { name: string; icon: string }> = {
  [EquipmentCategory.Camera]: { name: 'Cameras', icon: '📷' },
  [EquipmentCategory.Microphone]: { name: 'Microphones', icon: '🎤' },
  [EquipmentCategory.Lighting]: { name: 'Lighting', icon: '💡' },
  [EquipmentCategory.PC]: { name: 'Computers', icon: '🖥️' },
  [EquipmentCategory.Chair]: { name: 'Chairs', icon: '🪑' },
  [EquipmentCategory.Decor]: { name: 'Decor', icon: '🎨' },
};

const TIER_COLORS: Record<EquipmentTier, string> = {
  [EquipmentTier.Starter]: 'text-zinc-400',
  [EquipmentTier.Basic]: 'text-green-400',
  [EquipmentTier.Intermediate]: 'text-blue-400',
  [EquipmentTier.Professional]: 'text-purple-400',
  [EquipmentTier.Elite]: 'text-amber-400',
};

const TIER_NAMES: Record<EquipmentTier, string> = {
  [EquipmentTier.Starter]: 'Starter',
  [EquipmentTier.Basic]: 'Basic',
  [EquipmentTier.Intermediate]: 'Intermediate',
  [EquipmentTier.Professional]: 'Professional',
  [EquipmentTier.Elite]: 'Elite',
};

export default function EquipmentShop({ onClose }: EquipmentShopProps) {
  const [activeCategory, setActiveCategory] = useState<EquipmentCategory>(EquipmentCategory.Camera);
  const [purchaseMessage, setPurchaseMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const player = useGameStore((state: GameStore) => state.player);
  const updateCurrency = useGameStore((state: GameStore) => state.updateCurrency);
  const addEquipment = useGameStore((state: GameStore) => state.addEquipment);

  const ownedIds = new Set(player.channel.equipment.map((e: Equipment) => e.id));
  const categoryItems = getEquipmentByCategory(activeCategory);

  const getItemStatus = (item: Equipment): 'owned' | 'available' | 'locked' | 'too_expensive' => {
    if (ownedIds.has(item.id)) return 'owned';
    if (item.unlockLevel && player.level < item.unlockLevel) return 'locked';
    if (item.upgradesFrom && !ownedIds.has(item.upgradesFrom)) return 'locked';
    if (item.price > player.money) return 'too_expensive';
    return 'available';
  };

  const handlePurchase = (item: Equipment) => {
    const status = getItemStatus(item);
    if (status !== 'available') return;

    updateCurrency(-item.price);
    addEquipment(item);
    setPurchaseMessage({ text: `Purchased ${item.name}!`, isError: false });
    setTimeout(() => setPurchaseMessage(null), 2000);
  };

  const categories = Object.values(EquipmentCategory);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-zinc-700 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Equipment Shop</h2>
              <p className="text-zinc-400 mt-1">
                Balance: <span className="text-green-400 font-semibold">${player.money.toLocaleString()}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {purchaseMessage && (
            <div
              className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium ${
                purchaseMessage.isError ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
              }`}
            >
              {purchaseMessage.text}
            </div>
          )}
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-48 border-r border-zinc-700 p-4 shrink-0">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Categories
            </h3>
            <div className="space-y-1">
              {categories.map((category) => {
                const info = CATEGORY_INFO[category];
                const isActive = category === activeCategory;
                const ownedCount = player.channel.equipment.filter((e: Equipment) => e.category === category).length;
                const totalCount = getEquipmentByCategory(category).length;

                return (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                      isActive
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'text-zinc-300 hover:bg-zinc-700/50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{info.icon}</span>
                      <span className="text-sm">{info.name}</span>
                    </span>
                    <span className="text-xs text-zinc-500">{ownedCount}/{totalCount}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryItems.map((item) => {
                const status = getItemStatus(item);
                return (
                  <EquipmentCard
                    key={item.id}
                    item={item}
                    status={status}
                    playerLevel={player.level}
                    onPurchase={() => handlePurchase(item)}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-zinc-700 shrink-0">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Owned
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Available
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-zinc-600"></span>
                Locked
              </span>
            </div>
            <span>Player Level: {player.level}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface EquipmentCardProps {
  item: Equipment;
  status: 'owned' | 'available' | 'locked' | 'too_expensive';
  playerLevel: number;
  onPurchase: () => void;
}

function EquipmentCard({ item, status, playerLevel, onPurchase }: EquipmentCardProps) {
  const tierColor = TIER_COLORS[item.tier];
  const tierName = TIER_NAMES[item.tier];

  const borderColor = {
    owned: 'border-green-500/50 bg-green-500/5',
    available: 'border-blue-500/50 bg-blue-500/5 hover:border-blue-400',
    locked: 'border-zinc-700 bg-zinc-800/50 opacity-60',
    too_expensive: 'border-zinc-700 bg-zinc-800/50',
  }[status];

  const getLockedReason = () => {
    if (item.unlockLevel && playerLevel < item.unlockLevel) {
      return `Requires Level ${item.unlockLevel}`;
    }
    if (item.upgradesFrom) {
      const prerequisite = EQUIPMENT_CATALOG.find((e) => e.id === item.upgradesFrom);
      return `Requires ${prerequisite?.name || 'previous tier'}`;
    }
    return 'Locked';
  };

  return (
    <div className={`p-4 rounded-xl border-2 transition-all ${borderColor}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-semibold text-white">{item.name}</h4>
          <span className={`text-xs ${tierColor}`}>{tierName}</span>
        </div>
        {status === 'owned' && (
          <span className="px-2 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded">
            Owned
          </span>
        )}
      </div>

      <p className="text-sm text-zinc-400 mb-3">{item.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500">
            +{item.qualityBonus} Quality
          </span>
          {item.price > 0 && (
            <span className={`text-sm font-semibold ${status === 'too_expensive' ? 'text-red-400' : 'text-zinc-300'}`}>
              ${item.price.toLocaleString()}
            </span>
          )}
          {item.price === 0 && (
            <span className="text-sm text-zinc-500">Free</span>
          )}
        </div>

        {status === 'available' && (
          <button
            onClick={onPurchase}
            className="px-4 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
          >
            Buy
          </button>
        )}
        {status === 'locked' && (
          <span className="text-xs text-zinc-500">{getLockedReason()}</span>
        )}
        {status === 'too_expensive' && (
          <span className="text-xs text-red-400">Not enough money</span>
        )}
      </div>
    </div>
  );
}
