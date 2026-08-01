import { create } from 'zustand';
import {
  ContentNiche,
  Equipment,
  Staff,
  GameState,
  GamePhase,
  Player,
  Channel,
  Analytics,
  StreamScheduleSlot,
  StreamSession,
} from '../types';
import { calculateTotalSalaries } from '../data/staff';

function createInitialAnalytics(): Analytics {
  return {
    totalStreams: 0,
    totalStreamTime: 0,
    averageViewers: 0,
    peakViewers: 0,
    totalSubscribers: 0,
    subscriberGrowthRate: 0,
    totalRevenue: 0,
    revenueBySource: {
      subscriptions: 0,
      donations: 0,
      brandDeals: 0,
      adRevenue: 0,
    },
    viewersByNiche: {
      [ContentNiche.Gaming]: 0,
      [ContentNiche.Cooking]: 0,
      [ContentNiche.Music]: 0,
      [ContentNiche.IRL]: 0,
    },
    bestStreamDay: 0,
    bestStreamHour: 0,
  };
}

function createInitialChannel(name: string, niche: ContentNiche): Channel {
  return {
    id: crypto.randomUUID(),
    name,
    niche,
    subscribers: 0,
    followers: 0,
    reputation: 50,
    createdAt: Date.now(),
    schedule: [],
    equipment: [],
    staff: [],
    analytics: createInitialAnalytics(),
    streamHistory: [],
  };
}

function createInitialPlayer(
  channelName: string,
  niche: ContentNiche
): Player {
  return {
    id: crypto.randomUUID(),
    username: channelName,
    money: 500,
    energy: 100,
    maxEnergy: 100,
    experience: 0,
    level: 1,
    channel: createInitialChannel(channelName, niche),
    currentWeek: 1,
    currentDay: 1,
    currentPhase: GamePhase.Planning,
    unlockedNiches: [niche],
    activeEvents: [],
    completedEventIds: [],
  };
}

export interface GameActions {
  initializeGame: (channelName: string, niche: ContentNiche) => void;
  updateCurrency: (amount: number) => void;
  updateSubscribers: (amount: number) => void;
  addEquipment: (equipment: Equipment) => void;
  removeEquipment: (equipmentId: string) => void;
  hireStaff: (staff: Staff) => void;
  fireStaff: (staffId: string) => void;
  advanceWeek: () => void;
  advancePhase: () => void;
  setGamePaused: (paused: boolean) => void;
  resetGame: () => void;
  processWeeklyPayroll: () => number;
  getWeeklyPayroll: () => number;
  setSchedule: (schedule: StreamScheduleSlot[]) => void;
  clearSchedule: () => void;
  startStream: (slot: StreamScheduleSlot) => void;
  endStream: () => void;
  updateStreamDuration: (elapsed: number) => void;
}

export type GameStore = GameState & GameActions;

const initialState: GameState = {
  player: createInitialPlayer('NewStreamer', ContentNiche.Gaming),
  isPaused: false,
  gameSpeed: 1,
  lastSaveTime: Date.now(),
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,

  initializeGame: (channelName: string, niche: ContentNiche) =>
    set({
      player: createInitialPlayer(channelName, niche),
      isPaused: false,
      gameSpeed: 1,
      lastSaveTime: Date.now(),
    }),

  updateCurrency: (amount: number) =>
    set((state) => ({
      player: {
        ...state.player,
        money: Math.max(0, state.player.money + amount),
      },
    })),

  updateSubscribers: (amount: number) =>
    set((state) => ({
      player: {
        ...state.player,
        channel: {
          ...state.player.channel,
          subscribers: Math.max(0, state.player.channel.subscribers + amount),
        },
      },
    })),

  addEquipment: (equipment: Equipment) =>
    set((state) => ({
      player: {
        ...state.player,
        channel: {
          ...state.player.channel,
          equipment: [...state.player.channel.equipment, equipment],
        },
      },
    })),

  removeEquipment: (equipmentId: string) =>
    set((state) => ({
      player: {
        ...state.player,
        channel: {
          ...state.player.channel,
          equipment: state.player.channel.equipment.filter(
            (e) => e.id !== equipmentId
          ),
        },
      },
    })),

  hireStaff: (staff: Staff) =>
    set((state) => ({
      player: {
        ...state.player,
        channel: {
          ...state.player.channel,
          staff: [
            ...state.player.channel.staff,
            { ...staff, hiredAt: Date.now() },
          ],
        },
      },
    })),

  fireStaff: (staffId: string) =>
    set((state) => ({
      player: {
        ...state.player,
        channel: {
          ...state.player.channel,
          staff: state.player.channel.staff.filter((s) => s.id !== staffId),
        },
      },
    })),

  advanceWeek: () =>
    set((state) => ({
      player: {
        ...state.player,
        currentWeek: state.player.currentWeek + 1,
        currentDay: 1,
        currentPhase: GamePhase.Planning,
      },
    })),

  advancePhase: () =>
    set((state) => {
      const phaseOrder = [GamePhase.Planning, GamePhase.Streaming, GamePhase.Review];
      const currentIndex = phaseOrder.indexOf(state.player.currentPhase);
      const isLastPhase = currentIndex === phaseOrder.length - 1;

      if (isLastPhase) {
        return {
          player: {
            ...state.player,
            currentWeek: state.player.currentWeek + 1,
            currentPhase: GamePhase.Planning,
          },
        };
      }

      return {
        player: {
          ...state.player,
          currentPhase: phaseOrder[currentIndex + 1],
        },
      };
    }),

  setGamePaused: (paused: boolean) =>
    set({ isPaused: paused }),

  resetGame: () =>
    set({
      ...initialState,
      player: createInitialPlayer('NewStreamer', ContentNiche.Gaming),
      lastSaveTime: Date.now(),
    }),

  getWeeklyPayroll: (): number => 0,

  processWeeklyPayroll: (): number => 0,

  setSchedule: (schedule: StreamScheduleSlot[]) =>
    set((state) => ({
      player: {
        ...state.player,
        channel: {
          ...state.player.channel,
          schedule,
        },
      },
    })),

  clearSchedule: () =>
    set((state) => ({
      player: {
        ...state.player,
        channel: {
          ...state.player.channel,
          schedule: [],
        },
      },
    })),

  startStream: (slot: StreamScheduleSlot) =>
    set((state) => {
      const session: StreamSession = {
        id: crypto.randomUUID(),
        title: `${slot.niche} Stream`,
        niche: slot.niche,
        startTime: Date.now(),
        peakViewers: 0,
        averageViewers: 0,
        newSubscribers: 0,
        donations: 0,
        chatMessages: [],
        events: [],
      };
      return {
        player: {
          ...state.player,
          channel: {
            ...state.player.channel,
            activeStream: session,
          },
        },
      };
    }),

  endStream: () =>
    set((state) => {
      const activeStream = state.player.channel.activeStream;
      if (!activeStream) return state;

      const completedStream: StreamSession = {
        ...activeStream,
        endTime: Date.now(),
      };

      return {
        player: {
          ...state.player,
          channel: {
            ...state.player.channel,
            activeStream: undefined,
            streamHistory: [...state.player.channel.streamHistory, completedStream],
          },
        },
      };
    }),

  updateStreamDuration: (elapsed: number) =>
    set((state) => {
      const activeStream = state.player.channel.activeStream;
      if (!activeStream) return state;

      return {
        player: {
          ...state.player,
          channel: {
            ...state.player.channel,
            activeStream: {
              ...activeStream,
              startTime: Date.now() - elapsed,
            },
          },
        },
      };
    }),
}));

useGameStore.setState({
  getWeeklyPayroll: () => {
    const state = useGameStore.getState();
    return calculateTotalSalaries(state.player.channel.staff);
  },
  processWeeklyPayroll: () => {
    const state = useGameStore.getState();
    const payroll = calculateTotalSalaries(state.player.channel.staff);
    if (payroll > 0) {
      useGameStore.setState({
        player: {
          ...state.player,
          money: Math.max(0, state.player.money - payroll),
        },
      });
    }
    return payroll;
  },
});
