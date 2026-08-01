'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { ChatMessage } from '../types';

interface PixiChatPanelProps {
  width?: number;
  height?: number;
  messages: ChatMessage[];
  messagesPerMinute: number;
}

interface ChatMessageSprite {
  container: Container;
  createdAt: number;
  startY: number;
}

const COLORS = {
  regular: 0xaaaaaa,
  subscriber: 0xfbbf24,
  moderator: 0x22c55e,
  donation: 0xff6b6b,
  background: 0x18181b,
  panelBorder: 0x3f3f46,
};

const MESSAGE_VISIBLE_DURATION = 8000;
const FADE_IN_DURATION = 300;
const FADE_OUT_DURATION = 500;
const MESSAGE_SPACING = 28;
const MAX_VISIBLE_MESSAGES = 15;

function getUsernameColor(message: ChatMessage): number {
  if (message.donationAmount) return COLORS.donation;
  if (message.username.toLowerCase().includes('mod')) return COLORS.moderator;
  if (message.isSubscriber) return COLORS.subscriber;
  return COLORS.regular;
}

function getBadge(message: ChatMessage): string {
  if (message.donationAmount) return '💎';
  if (message.username.toLowerCase().includes('mod')) return '⚔️';
  if (message.isSubscriber) return '⭐';
  return '';
}

function getVelocityLabel(messagesPerMinute: number): { text: string; color: number } {
  if (messagesPerMinute < 5) return { text: 'SLOW', color: 0x6b7280 };
  if (messagesPerMinute < 15) return { text: 'NORMAL', color: 0x22c55e };
  if (messagesPerMinute < 30) return { text: 'ACTIVE', color: 0xfbbf24 };
  if (messagesPerMinute < 60) return { text: 'FAST', color: 0xf97316 };
  return { text: 'HYPE!', color: 0xef4444 };
}

export default function PixiChatPanel({
  width = 320,
  height = 400,
  messages,
  messagesPerMinute,
}: PixiChatPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const chatContainerRef = useRef<Container | null>(null);
  const messageSpritesRef = useRef<Map<string, ChatMessageSprite>>(new Map());
  const velocityTextRef = useRef<Text | null>(null);
  const velocityBarRef = useRef<Graphics | null>(null);
  const processedMessagesRef = useRef<Set<string>>(new Set());

  const createMessageSprite = useCallback((
    message: ChatMessage,
    panelWidth: number,
    yPosition: number
  ): ChatMessageSprite => {
    const container = new Container();
    container.alpha = 0;

    const usernameColor = getUsernameColor(message);
    const badge = getBadge(message);

    const usernameStyle = new TextStyle({
      fontFamily: 'sans-serif',
      fontSize: 13,
      fontWeight: 'bold',
      fill: usernameColor,
    });

    const messageStyle = new TextStyle({
      fontFamily: 'sans-serif',
      fontSize: 13,
      fill: 0xd4d4d8,
      wordWrap: true,
      wordWrapWidth: panelWidth - 30,
    });

    let xOffset = 8;

    if (badge) {
      const badgeText = new Text({ text: badge, style: { fontSize: 12 } });
      badgeText.x = xOffset;
      badgeText.y = 0;
      container.addChild(badgeText);
      xOffset += 18;
    }

    const usernameText = new Text({
      text: message.username + ':',
      style: usernameStyle,
    });
    usernameText.x = xOffset;
    usernameText.y = 0;
    container.addChild(usernameText);
    xOffset += usernameText.width + 6;

    const msgText = new Text({
      text: message.message,
      style: messageStyle,
    });
    msgText.x = xOffset;
    msgText.y = 0;
    container.addChild(msgText);

    if (message.donationAmount) {
      const bg = new Graphics();
      bg.roundRect(-4, -2, panelWidth - 16, container.height + 4, 4);
      bg.fill({ color: 0xff6b6b, alpha: 0.15 });
      container.addChildAt(bg, 0);
    }

    container.y = yPosition;

    return {
      container,
      createdAt: Date.now(),
      startY: yPosition,
    };
  }, []);

  const updateVelocityIndicator = useCallback((mpm: number) => {
    if (!velocityTextRef.current || !velocityBarRef.current) return;

    const { text, color } = getVelocityLabel(mpm);
    velocityTextRef.current.text = text;
    velocityTextRef.current.style.fill = color;

    const barWidth = Math.min(100, (mpm / 60) * 100);
    velocityBarRef.current.clear();
    velocityBarRef.current.roundRect(0, 0, barWidth, 4, 2);
    velocityBarRef.current.fill(color);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const sprites = messageSpritesRef.current;
    const processed = processedMessagesRef.current;

    const app = new Application();
    appRef.current = app;

    let mounted = true;

    const initApp = async () => {
      await app.init({
        width,
        height,
        backgroundColor: COLORS.background,
        antialias: true,
      });

      if (!mounted || !containerRef.current) return;
      containerRef.current.appendChild(app.canvas);

      const border = new Graphics();
      border.roundRect(0, 0, width, height, 8);
      border.stroke({ width: 1, color: COLORS.panelBorder });
      app.stage.addChild(border);

      const header = new Graphics();
      header.roundRect(0, 0, width, 36, 8);
      header.fill({ color: 0x27272a });
      app.stage.addChild(header);

      const headerTitle = new Text({
        text: '💬 CHAT',
        style: {
          fontFamily: 'sans-serif',
          fontSize: 12,
          fontWeight: 'bold',
          fill: 0xffffff,
        },
      });
      headerTitle.x = 10;
      headerTitle.y = 10;
      app.stage.addChild(headerTitle);

      const velocityContainer = new Container();
      velocityContainer.x = width - 80;
      velocityContainer.y = 8;
      app.stage.addChild(velocityContainer);

      const velocityText = new Text({
        text: 'SLOW',
        style: {
          fontFamily: 'sans-serif',
          fontSize: 10,
          fontWeight: 'bold',
          fill: 0x6b7280,
        },
      });
      velocityText.y = 0;
      velocityContainer.addChild(velocityText);
      velocityTextRef.current = velocityText;

      const velocityBarBg = new Graphics();
      velocityBarBg.roundRect(0, 0, 60, 4, 2);
      velocityBarBg.fill(0x3f3f46);
      velocityBarBg.y = 14;
      velocityContainer.addChild(velocityBarBg);

      const velocityBar = new Graphics();
      velocityBar.y = 14;
      velocityContainer.addChild(velocityBar);
      velocityBarRef.current = velocityBar;

      const chatMask = new Graphics();
      chatMask.rect(0, 40, width, height - 44);
      chatMask.fill(0xffffff);
      app.stage.addChild(chatMask);

      const chatContainer = new Container();
      chatContainer.mask = chatMask;
      chatContainer.y = 40;
      app.stage.addChild(chatContainer);
      chatContainerRef.current = chatContainer;

      app.ticker.add(() => {
        const now = Date.now();
        const sprites = messageSpritesRef.current;

        sprites.forEach((sprite, id) => {
          const age = now - sprite.createdAt;

          if (age < FADE_IN_DURATION) {
            sprite.container.alpha = age / FADE_IN_DURATION;
          } else if (age > MESSAGE_VISIBLE_DURATION - FADE_OUT_DURATION) {
            const fadeProgress = (age - (MESSAGE_VISIBLE_DURATION - FADE_OUT_DURATION)) / FADE_OUT_DURATION;
            sprite.container.alpha = 1 - fadeProgress;
          } else {
            sprite.container.alpha = 1;
          }

          if (age > MESSAGE_VISIBLE_DURATION) {
            chatContainer.removeChild(sprite.container);
            sprite.container.destroy({ children: true });
            sprites.delete(id);
            processedMessagesRef.current.delete(id);
          }
        });
      });
    };

    initApp();

    return () => {
      mounted = false;
      sprites.forEach((sprite) => {
        sprite.container.destroy({ children: true });
      });
      sprites.clear();
      processed.clear();
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
    };
  }, [width, height]);

  useEffect(() => {
    if (!chatContainerRef.current) return;

    const chatContainer = chatContainerRef.current;
    const sprites = messageSpritesRef.current;

    messages.slice(-MAX_VISIBLE_MESSAGES).forEach((message) => {
      if (processedMessagesRef.current.has(message.id)) return;

      processedMessagesRef.current.add(message.id);

      sprites.forEach((sprite) => {
        sprite.container.y -= MESSAGE_SPACING;
      });

      const chatHeight = height - 44;
      const newY = chatHeight - MESSAGE_SPACING;
      const sprite = createMessageSprite(message, width, newY);
      chatContainer.addChild(sprite.container);
      sprites.set(message.id, sprite);

      const toRemove: string[] = [];
      sprites.forEach((s, id) => {
        if (s.container.y < -MESSAGE_SPACING * 2) {
          chatContainer.removeChild(s.container);
          s.container.destroy({ children: true });
          toRemove.push(id);
        }
      });
      toRemove.forEach((id) => {
        sprites.delete(id);
        processedMessagesRef.current.delete(id);
      });
    });
  }, [messages, width, height, createMessageSprite]);

  useEffect(() => {
    updateVelocityIndicator(messagesPerMinute);
  }, [messagesPerMinute, updateVelocityIndicator]);

  return (
    <div ref={containerRef} className="rounded-lg overflow-hidden shadow-lg" />
  );
}
