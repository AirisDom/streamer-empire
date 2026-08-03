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
import { StreamResults } from '../data/streamResults';
import {
  SubscriberMilestone,
  checkNewMilestone,
} from '../data/milestones';
import {
  EventChoice,
  EventCooldown,
  ActiveEvent,
  rollForEvents,
  applyEventOutcome,
  calculateCooldownExpiry,
  EVENT_DEFINITIONS,
} from '../data/events';

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
    achievedMilestoneIds: [],
    eventCooldowns: [],
    eventHistory: [],
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
  applyStreamResults: (results: StreamResults) => void;
  addExperience: (amount: number) => void;
  updateReputation: (amount: number) => void;
  claimMilestone: (milestone: SubscriberMilestone) => void;
  checkMilestoneReached: (previousSubs: number, currentSubs: number) => SubscriberMilestone | null;
  triggerRandomEvents: () => ActiveEvent[];
  addActiveEvent: (event: ActiveEvent) => void;
  resolveEvent: (eventId: string, choice: EventChoice) => { success: boolean; message: string };
  removeActiveEvent: (eventId: string) => void;
  getActiveEvents: () => ActiveEvent[];
  clearExpiredCooldowns: () => void;
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

  applyStreamResults: (results: StreamResults) =>
    set((state) => {
      const analytics = state.player.channel.analytics;
      const totalStreams = analytics.totalStreams + 1;
      const totalStreamTime = analytics.totalStreamTime + results.duration;
      const totalViewers = analytics.averageViewers * analytics.totalStreams + results.averageViewers;
      const newAverageViewers = Math.floor(totalViewers / totalStreams);

      const updatedAnalytics: Analytics = {
        ...analytics,
        totalStreams,
        totalStreamTime,
        averageViewers: newAverageViewers,
        peakViewers: Math.max(analytics.peakViewers, results.peakViewers),
        totalSubscribers: state.player.channel.subscribers + results.newSubscribers,
        subscriberGrowthRate: results.newSubscribers,
        totalRevenue: analytics.totalRevenue + results.totalRevenue,
        revenueBySource: {
          ...analytics.revenueBySource,
          donations: analytics.revenueBySource.donations + results.donationRevenue,
          adRevenue: analytics.revenueBySource.adRevenue + results.adRevenue,
        },
        viewersByNiche: {
          ...analytics.viewersByNiche,
          [results.niche]: analytics.viewersByNiche[results.niche] + results.averageViewers,
        },
      };

      return {
        player: {
          ...state.player,
          money: state.player.money + results.totalRevenue,
          channel: {
            ...state.player.channel,
            subscribers: state.player.channel.subscribers + results.newSubscribers,
            analytics: updatedAnalytics,
          },
        },
      };
    }),

  addExperience: (amount: number) =>
    set((state) => {
      const newExperience = state.player.experience + amount;
      const xpPerLevel = 100;
      const newLevel = Math.floor(newExperience / xpPerLevel) + 1;

      return {
        player: {
          ...state.player,
          experience: newExperience,
          level: newLevel,
        },
      };
    }),

  updateReputation: (amount: number) =>
    set((state) => ({
      player: {
        ...state.player,
        channel: {
          ...state.player.channel,
          reputation: Math.max(0, Math.min(100, state.player.channel.reputation + amount)),
        },
      },
    })),

  claimMilestone: (milestone: SubscriberMilestone) =>
    set((state) => {
      if (state.player.achievedMilestoneIds.includes(milestone.id)) {
        return state;
      }

      let money = state.player.money;
      let reputation = state.player.channel.reputation;
      let unlockedNiches = [...state.player.unlockedNiches];

      milestone.rewards.forEach((reward) => {
        if (reward.type === 'money' && typeof reward.value === 'number') {
          money += reward.value;
        }
        if (reward.type === 'reputation' && typeof reward.value === 'number') {
          reputation = Math.min(100, reputation + reward.value);
        }
        if (reward.type === 'niche_unlock' && reward.value === 'all') {
          unlockedNiches = [
            ContentNiche.Gaming,
            ContentNiche.Cooking,
            ContentNiche.Music,
            ContentNiche.IRL,
          ];
        }
      });

      return {
        player: {
          ...state.player,
          money,
          unlockedNiches,
          achievedMilestoneIds: [...state.player.achievedMilestoneIds, milestone.id],
          channel: {
            ...state.player.channel,
            reputation,
          },
        },
      };
    }),

  checkMilestoneReached: (previousSubs: number, currentSubs: number): SubscriberMilestone | null => {
    const state = useGameStore.getState();
    const newMilestone = checkNewMilestone(previousSubs, currentSubs);
    if (newMilestone && !state.player.achievedMilestoneIds.includes(newMilestone.id)) {
      return newMilestone;
    }
    return null;
  },

  triggerRandomEvents: (): ActiveEvent[] => {
    const state = useGameStore.getState();
    const { player } = state;
    const activeEventIds = player.activeEvents.map((e) => e.id);

    const cooldowns: EventCooldown[] = player.eventCooldowns.map((c) => ({
      eventId: c.eventId,
      expiresAtWeek: c.expiresAtWeek,
    }));

    const triggeredEvents = rollForEvents(
      player.channel.subscribers,
      player.currentWeek,
      player.channel.reputation,
      player.channel.niche,
      cooldowns,
      activeEventIds
    );

    const newActiveEvents: ActiveEvent[] = triggeredEvents.map((event) => ({
      event,
      triggeredAt: Date.now(),
      expiresAt: event.duration ? Date.now() + event.duration : undefined,
    }));

    if (newActiveEvents.length > 0) {
      useGameStore.setState({
        player: {
          ...player,
          activeEvents: [...player.activeEvents, ...newActiveEvents.map((ae) => ({
            id: ae.event.id,
            type: ae.event.type,
            severity: ae.event.severity,
            title: ae.event.title,
            description: ae.event.description,
            options: ae.event.choices.map((c) => ({
              id: c.id,
              label: c.label,
              description: c.description,
              effects: Object.entries(c.outcomes)
                .filter(([key]) => key !== 'description')
                .map(([stat, value]) => ({
                  stat,
                  value: typeof value === 'number' ? value : 0,
                  isPercentage: false,
                })),
            })),
            occurredAt: ae.triggeredAt,
            expiresAt: ae.expiresAt,
            resolved: false,
          }))],
        },
      });
    }

    return newActiveEvents;
  },

  addActiveEvent: (activeEvent: ActiveEvent) =>
    set((state) => ({
      player: {
        ...state.player,
        activeEvents: [...state.player.activeEvents, {
          id: activeEvent.event.id,
          type: activeEvent.event.type,
          severity: activeEvent.event.severity,
          title: activeEvent.event.title,
          description: activeEvent.event.description,
          options: activeEvent.event.choices.map((c) => ({
            id: c.id,
            label: c.label,
            description: c.description,
            effects: Object.entries(c.outcomes)
              .filter(([key]) => key !== 'description')
              .map(([stat, value]) => ({
                stat,
                value: typeof value === 'number' ? value : 0,
                isPercentage: false,
              })),
          })),
          occurredAt: activeEvent.triggeredAt,
          expiresAt: activeEvent.expiresAt,
          resolved: false,
        }],
      },
    })),

  resolveEvent: (eventId: string, choice: EventChoice): { success: boolean; message: string } => {
    const state = useGameStore.getState();
    const { player } = state;

    const result = applyEventOutcome(choice, player.money);
    if (!result.canApply) {
      return { success: false, message: result.outcome.description };
    }

    const { outcome } = result;
    let newMoney = player.money;
    let newSubscribers = player.channel.subscribers;
    let newReputation = player.channel.reputation;
    let newExperience = player.experience;

    if (outcome.money) newMoney += outcome.money;
    if (outcome.subscribers) newSubscribers = Math.max(0, newSubscribers + outcome.subscribers);
    if (outcome.reputation) newReputation = Math.max(0, Math.min(100, newReputation + outcome.reputation));
    if (outcome.experience) newExperience += outcome.experience;

    const eventFromDefinitions = EVENT_DEFINITIONS.find((e) => e.id === eventId);
    const cooldownWeeks = eventFromDefinitions?.cooldownWeeks ?? 0;

    const newCooldowns = cooldownWeeks > 0
      ? [...player.eventCooldowns, { eventId, expiresAtWeek: calculateCooldownExpiry(player.currentWeek, cooldownWeeks) }]
      : player.eventCooldowns;

    useGameStore.setState({
      player: {
        ...player,
        money: newMoney,
        experience: newExperience,
        activeEvents: player.activeEvents.map((e) =>
          e.id === eventId ? { ...e, resolved: true } : e
        ),
        completedEventIds: [...player.completedEventIds, eventId],
        eventCooldowns: newCooldowns,
        eventHistory: [...player.eventHistory, { eventId, choiceId: choice.id, week: player.currentWeek }],
        channel: {
          ...player.channel,
          subscribers: newSubscribers,
          reputation: newReputation,
        },
      },
    });

    return { success: true, message: outcome.description };
  },

  removeActiveEvent: (eventId: string) =>
    set((state) => ({
      player: {
        ...state.player,
        activeEvents: state.player.activeEvents.filter((e) => e.id !== eventId),
      },
    })),

  getActiveEvents: (): ActiveEvent[] => {
    const state = useGameStore.getState();
    return state.player.activeEvents
      .filter((e) => !e.resolved)
      .map((gameEvent) => {
        const eventDef = EVENT_DEFINITIONS.find((ed) => ed.id === gameEvent.id);
        if (!eventDef) {
          return {
            event: {
              id: gameEvent.id,
              type: gameEvent.type,
              severity: gameEvent.severity,
              category: 'neutral' as const,
              title: gameEvent.title,
              description: gameEvent.description,
              choices: gameEvent.options.map((o) => ({
                id: o.id,
                label: o.label,
                description: o.description,
                outcomes: {
                  description: o.description,
                  ...o.effects.reduce((acc, eff) => ({ ...acc, [eff.stat]: eff.value }), {}),
                },
              })),
              triggerConditions: { probability: 0 },
            },
            triggeredAt: gameEvent.occurredAt,
            expiresAt: gameEvent.expiresAt,
          };
        }
        return {
          event: eventDef,
          triggeredAt: gameEvent.occurredAt,
          expiresAt: gameEvent.expiresAt,
        };
      });
  },

  clearExpiredCooldowns: () =>
    set((state) => ({
      player: {
        ...state.player,
        eventCooldowns: state.player.eventCooldowns.filter(
          (c) => c.expiresAtWeek > state.player.currentWeek
        ),
      },
    })),
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
