import { ContentNiche, ChatMessage } from '../types';

export interface ChatMessageTemplate {
  type: 'greeting' | 'reaction' | 'meme' | 'question' | 'toxic' | 'hype' | 'sub';
  messages: string[];
  weight: number;
}

const GENERIC_GREETINGS = [
  'Hey everyone!',
  'hi chat',
  'hello!',
  'Heyyyy',
  'sup',
  'wassup',
  'yo',
  'hiii',
  'Hey {channel}!',
  'Finally made it!',
  'Just got here',
  'lets gooo',
  'ayyyy',
  'waddup',
  'heyo',
  'greetings',
  'hihi',
  'o/',
  'hewwo',
  ':wave:',
];

const GENERIC_REACTIONS = [
  'lol',
  'lmao',
  'haha',
  'nice',
  'pog',
  'POGGERS',
  'kekw',
  'true',
  'real',
  'based',
  'W',
  'Ws in chat',
  'lets goooo',
  'no way',
  'bruh',
  'oof',
  'F',
  'rip',
  'sadge',
  'copium',
  'hopium',
  'same',
  'mood',
  'facts',
  'so true',
  'big W',
  'massive',
  'insane',
  'crazy',
  'what',
  '???',
  'bro',
  'dude',
  'yooo',
];

const GENERIC_MEMES = [
  'monkaS',
  'Kappa',
  'PogChamp',
  'LULW',
  'OMEGALUL',
  'FeelsGoodMan',
  'FeelsBadMan',
  'PepeHands',
  'Pepega',
  'EZ Clap',
  'AYAYA',
  'widepeepoHappy',
  'catJAM',
  '5Head',
  '3Head',
  'forsenCD',
  'gachiHYPER',
  'D:',
  ':O',
  'ICANT',
  'CLASSIC',
  'AWARE',
  'Clueless',
  'Chatting',
  'PauseChamp',
  'modCheck',
  'GIGACHAD',
  'Copege',
  'WAYTOODANK',
  'BOOBA',
];

const GENERIC_QUESTIONS = [
  'how long have you been streaming?',
  'whats ur setup?',
  'what mic do you use?',
  'song name?',
  'can you shout me out?',
  'do you have discord?',
  'what time do you usually stream?',
  'are you full time?',
  'when did you start?',
  'do you have youtube?',
  'play with viewers?',
  'are you gonna do a subathon?',
  'hydration check?',
  'whats your schedule?',
];

const GENERIC_HYPE = [
  'LETS GOOOO',
  'HYPEEEE',
  'POGGIES',
  '!hype',
  'WE IN HERE',
  'STREAM HYPE',
  'POGGERS',
  'THIS IS IT',
  'CHAT SPAM POG',
  'spam W',
  'W W W W',
  '7777777',
  'GOOOO',
  'YESSSS',
  'IM SO HYPED',
  'BEST STREAM',
  'CONTENT',
  'PEAK CONTENT',
  'THIS IS WHY I SUB',
  'SO GOOD',
];

const GENERIC_TOXIC = [
  'ur trash',
  'this is boring',
  'dead chat',
  'ResidentSleeper',
  'zzzz',
  'yawn',
  'mid stream',
  'mid',
  'L',
  'ratio',
  'who asked',
  'nobody cares',
  'cringe',
  'dogwater',
  'touch grass',
  '-1 viewer',
  'bye',
  'im out',
  'this aint it',
  'washed',
];

const SUB_MESSAGES = [
  'just subbed! been watching for months',
  'GG ez sub',
  'take my money',
  'finally subbing',
  'gifting 5 subs lets go',
  'prime sub secured',
  'resub x12 baby',
  'love this channel',
  'deserved sub',
  'best streamer',
  'support the homie',
  'tier 3 incoming',
];

const NICHE_MESSAGES: Record<ContentNiche, { reactions: string[]; questions: string[] }> = {
  [ContentNiche.Gaming]: {
    reactions: [
      'nice play!',
      'GG',
      'CLUTCH',
      'cracked',
      'ur insane',
      'pro gamer move',
      'aimbot?',
      'HACKERMAN',
      'ez',
      'how did you do that',
      'teach me',
      'so clean',
      'one more game!',
      'rank?',
      'whats your sens?',
      'broken character',
      'nerf this',
      'balanced gameplay',
      'SKILL DIFF',
      'diff',
      'outplayed',
      'THEY MAD',
      'trolling',
      'throw?',
      'we go agane',
      'run it back',
      'next game?',
    ],
    questions: [
      'what rank are you?',
      'whats your sens?',
      'do you play ranked?',
      'favorite game?',
      'PC specs?',
      'can you play [game]?',
      'controller or mnk?',
      'which character?',
      'how many hours?',
      'tips for beginners?',
    ],
  },
  [ContentNiche.Cooking]: {
    reactions: [
      'looks delicious!',
      'im hungry now',
      'recipe please!',
      'chef kiss',
      'gordon would be proud',
      'that looks amazing',
      'save me some',
      'yummy',
      'drooling rn',
      'teach me',
      'professional chef vibes',
      'where do I order',
      'michelin star',
      'comfort food',
      'my stomach is growling',
      'food ASMR',
      'the sizzle',
      'perfect',
      'master chef',
    ],
    questions: [
      'can you share the recipe?',
      'what temp is the oven?',
      'how long to cook?',
      'substitute for [ingredient]?',
      'is it spicy?',
      'where do you buy ingredients?',
      'can you make it vegan?',
      'leftover tips?',
      'favorite cuisine?',
      'cookware recommendations?',
    ],
  },
  [ContentNiche.Music]: {
    reactions: [
      'FIRE',
      'this slaps',
      'vibes',
      'goosebumps',
      'so talented',
      'beautiful',
      'encore!',
      'spotify when',
      'album when?',
      'put this on streaming',
      'catJAM',
      'banger',
      'absolute banger',
      'this hits different',
      'crying rn',
      'masterpiece',
      'eargasm',
      'on repeat',
      'radio worthy',
      'chart topper',
    ],
    questions: [
      'can you play [song]?',
      'original or cover?',
      'how long have you been playing?',
      'what instrument is that?',
      'are you on spotify?',
      'do you have a band?',
      'genre?',
      'influences?',
      'do you take requests?',
      'tabs?',
    ],
  },
  [ContentNiche.IRL]: {
    reactions: [
      'content',
      'LORE',
      'story time!',
      'IRL content hits different',
      'living the life',
      'jealous',
      'goals',
      'where is this?',
      'beautiful view',
      'take me with you',
      'adventure time',
      'wholesome',
      'real life simulator',
      'outside stream pog',
      'touching grass',
      'nature',
      'nice weather',
    ],
    questions: [
      'where are you?',
      'what city is this?',
      'is it safe there?',
      'how long are you staying?',
      'travel tips?',
      'how do you afford this?',
      'whats the wifi like?',
      'camera setup?',
      'best food there?',
      'locals friendly?',
    ],
  },
};

const VIEWER_USERNAMES = [
  'xXgamer420Xx',
  'Ninja_wannabe',
  'pogchamp_pete',
  'lurker_andy',
  'chat_spammer',
  'subgifter9000',
  'emote_only',
  'first_time_chatter',
  'silent_viewer',
  'backseat_gamer',
  'tryhard_tim',
  'casual_carl',
  'hype_train_henry',
  'meme_lord_mike',
  'wholesome_wendy',
  'toxic_tommy',
  'donator_dan',
  'mod_simp',
  'stream_clipper',
  'vod_watcher',
  'parasocial_paul',
  'touch_grass_gary',
  'chronically_online',
  'pepega_pete',
  'based_brian',
  'ratio_rick',
  'copium_carl',
  'GIGACHAD_greg',
  'viewer_123',
  'twitch_user_2024',
  'just_a_chatter',
  'longtime_fan',
  'new_here_hi',
  'night_owl_99',
  'early_bird_ed',
  'prime_sub_pete',
  'tier3_sub',
  'founder_badge',
  'vip_viewer',
  'lurk_mode',
  'active_chatter',
  'emote_spammer',
  'question_asker',
  'hype_man',
  'backseat_bob',
  'random_user_42',
  'username_taken',
  'default_avatar',
  'no_profile_pic',
  'anon_viewer',
];

function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function pickRandomUsername(): string {
  const base = pickRandom(VIEWER_USERNAMES);
  if (Math.random() > 0.7) {
    return base + Math.floor(Math.random() * 100);
  }
  return base;
}

function getMessageTypeWeight(
  type: ChatMessageTemplate['type'],
  viewerCount: number
): number {
  const baseWeights: Record<ChatMessageTemplate['type'], number> = {
    greeting: viewerCount < 50 ? 15 : 8,
    reaction: 35,
    meme: 25,
    question: 10,
    toxic: viewerCount > 100 ? 8 : 3,
    hype: 15,
    sub: viewerCount > 50 ? 5 : 2,
  };
  return baseWeights[type];
}

function selectMessageType(viewerCount: number): ChatMessageTemplate['type'] {
  const types: ChatMessageTemplate['type'][] = [
    'greeting',
    'reaction',
    'meme',
    'question',
    'toxic',
    'hype',
    'sub',
  ];

  const weights = types.map((t) => getMessageTypeWeight(t, viewerCount));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < types.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return types[i];
    }
  }

  return 'reaction';
}

function getMessagePool(
  type: ChatMessageTemplate['type'],
  niche: ContentNiche
): string[] {
  switch (type) {
    case 'greeting':
      return GENERIC_GREETINGS;
    case 'reaction':
      return [...GENERIC_REACTIONS, ...NICHE_MESSAGES[niche].reactions];
    case 'meme':
      return GENERIC_MEMES;
    case 'question':
      return [...GENERIC_QUESTIONS, ...NICHE_MESSAGES[niche].questions];
    case 'toxic':
      return GENERIC_TOXIC;
    case 'hype':
      return GENERIC_HYPE;
    case 'sub':
      return SUB_MESSAGES;
    default:
      return GENERIC_REACTIONS;
  }
}

export function generateChatMessage(
  niche: ContentNiche,
  viewerCount: number,
  channelName: string
): ChatMessage {
  const type = selectMessageType(viewerCount);
  const pool = getMessagePool(type, niche);
  let message = pickRandom(pool);

  message = message.replace('{channel}', channelName);

  const isSubscriber = type === 'sub' || Math.random() < 0.3;
  const hasDonation = type === 'sub' && Math.random() < 0.1;

  return {
    id: crypto.randomUUID(),
    username: pickRandomUsername(),
    message,
    timestamp: Date.now(),
    isSubscriber,
    donationAmount: hasDonation
      ? pickRandom([1, 2, 5, 10, 20, 50, 100])
      : undefined,
  };
}

export function calculateMessageInterval(viewerCount: number): number {
  const baseInterval = 3000;
  const minInterval = 200;
  const maxInterval = 8000;

  if (viewerCount <= 0) {
    return maxInterval;
  }

  const scaleFactor = Math.log10(viewerCount + 1);
  const interval = baseInterval / scaleFactor;

  return Math.max(minInterval, Math.min(maxInterval, interval));
}

export function generateInitialChatBurst(
  niche: ContentNiche,
  viewerCount: number,
  channelName: string,
  count: number = 5
): ChatMessage[] {
  const messages: ChatMessage[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const msg = generateChatMessage(niche, viewerCount, channelName);
    msg.timestamp = now - (count - i) * 500;
    messages.push(msg);
  }

  return messages;
}

export interface ChatGeneratorConfig {
  niche: ContentNiche;
  channelName: string;
  getViewerCount: () => number;
  onMessage: (message: ChatMessage) => void;
}

export function createChatGenerator(config: ChatGeneratorConfig): {
  start: () => void;
  stop: () => void;
  triggerHypeEvent: () => void;
} {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let isRunning = false;

  const scheduleNext = () => {
    if (!isRunning) return;

    const viewerCount = config.getViewerCount();
    const interval = calculateMessageInterval(viewerCount);
    const jitter = interval * 0.5 * (Math.random() - 0.5);

    timeoutId = setTimeout(() => {
      if (!isRunning) return;

      const message = generateChatMessage(
        config.niche,
        viewerCount,
        config.channelName
      );
      config.onMessage(message);
      scheduleNext();
    }, interval + jitter);
  };

  const start = () => {
    if (isRunning) return;
    isRunning = true;

    const initialBurst = generateInitialChatBurst(
      config.niche,
      config.getViewerCount(),
      config.channelName,
      3
    );
    initialBurst.forEach((msg) => config.onMessage(msg));

    scheduleNext();
  };

  const stop = () => {
    isRunning = false;
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  const triggerHypeEvent = () => {
    if (!isRunning) return;

    const viewerCount = config.getViewerCount();
    const hypeCount = Math.min(10, Math.max(3, Math.floor(viewerCount / 20)));

    for (let i = 0; i < hypeCount; i++) {
      setTimeout(() => {
        const pool = GENERIC_HYPE;
        const message: ChatMessage = {
          id: crypto.randomUUID(),
          username: pickRandomUsername(),
          message: pickRandom(pool),
          timestamp: Date.now(),
          isSubscriber: Math.random() < 0.4,
        };
        config.onMessage(message);
      }, i * 100);
    }
  };

  return { start, stop, triggerHypeEvent };
}
