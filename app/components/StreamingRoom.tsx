'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Application, Container, Graphics } from 'pixi.js';
import { useGameStore } from '../store/gameStore';
import { Equipment, EquipmentCategory, EquipmentTier } from '../types';

interface StreamingRoomProps {
  width?: number;
  height?: number;
}

interface EquipmentVisual {
  container: Container;
  graphics: Graphics;
  glowGraphics?: Graphics;
  update: (time: number) => void;
}

function drawIsometricFloor(graphics: Graphics, width: number, height: number) {
  const floorWidth = width * 0.7;
  const floorHeight = height * 0.5;
  const centerX = width / 2;
  const centerY = height * 0.65;

  graphics.moveTo(centerX, centerY - floorHeight / 2);
  graphics.lineTo(centerX + floorWidth / 2, centerY);
  graphics.lineTo(centerX, centerY + floorHeight / 2);
  graphics.lineTo(centerX - floorWidth / 2, centerY);
  graphics.closePath();
  graphics.fill(0x2a2a3a);
  graphics.stroke({ width: 2, color: 0x3a3a4a });
}

function drawWall(graphics: Graphics, width: number, height: number) {
  const wallHeight = height * 0.45;
  const floorTop = height * 0.65 - height * 0.5 / 2;

  graphics.rect(0, 0, width, floorTop);
  graphics.fill(0x1e1e2e);

  const leftWallWidth = width * 0.15;
  graphics.moveTo(0, floorTop);
  graphics.lineTo(leftWallWidth, floorTop - wallHeight * 0.2);
  graphics.lineTo(leftWallWidth, 0);
  graphics.lineTo(0, 0);
  graphics.closePath();
  graphics.fill(0x252535);

  const rightWallStart = width - width * 0.15;
  graphics.moveTo(width, floorTop);
  graphics.lineTo(rightWallStart, floorTop - wallHeight * 0.2);
  graphics.lineTo(rightWallStart, 0);
  graphics.lineTo(width, 0);
  graphics.closePath();
  graphics.fill(0x252535);
}

function createDesk(tier: EquipmentTier): EquipmentVisual {
  const container = new Container();
  const graphics = new Graphics();

  const deskColor = tier >= EquipmentTier.Intermediate ? 0x1a1a2e : 0x5c4033;
  const sideColor = tier >= EquipmentTier.Intermediate ? 0x15152a : 0x4a3528;

  const deskWidth = 120;
  const deskDepth = 60;
  const deskHeight = 30;

  graphics.moveTo(0, 0);
  graphics.lineTo(deskWidth / 2, deskDepth / 4);
  graphics.lineTo(0, deskDepth / 2);
  graphics.lineTo(-deskWidth / 2, deskDepth / 4);
  graphics.closePath();
  graphics.fill(deskColor);
  graphics.stroke({ width: 1, color: 0x3a2a1a });

  graphics.moveTo(-deskWidth / 2, deskDepth / 4);
  graphics.lineTo(-deskWidth / 2, deskDepth / 4 + deskHeight);
  graphics.lineTo(0, deskDepth / 2 + deskHeight);
  graphics.lineTo(0, deskDepth / 2);
  graphics.closePath();
  graphics.fill(sideColor);
  graphics.stroke({ width: 1, color: 0x3a2a1a });

  graphics.moveTo(0, deskDepth / 2);
  graphics.lineTo(deskWidth / 2, deskDepth / 4);
  graphics.lineTo(deskWidth / 2, deskDepth / 4 + deskHeight);
  graphics.lineTo(0, deskDepth / 2 + deskHeight);
  graphics.closePath();
  graphics.fill(sideColor);
  graphics.stroke({ width: 1, color: 0x3a2a1a });

  container.addChild(graphics);

  return {
    container,
    graphics,
    update: () => {},
  };
}

function createChair(tier: EquipmentTier): EquipmentVisual {
  const container = new Container();
  const graphics = new Graphics();
  const glowGraphics = new Graphics();

  const hasRGB = tier >= EquipmentTier.Intermediate;
  const seatWidth = 50;
  const seatDepth = 30;

  const drawChair = (rgbColor?: number) => {
    graphics.clear();

    const seatColor = tier >= EquipmentTier.Professional ? 0x2a2a4e : 0x1a1a2e;
    const backColor = tier >= EquipmentTier.Professional ? 0x3d3d6d : 0x2d2d4d;

    graphics.moveTo(0, 0);
    graphics.lineTo(seatWidth / 2, seatDepth / 4);
    graphics.lineTo(0, seatDepth / 2);
    graphics.lineTo(-seatWidth / 2, seatDepth / 4);
    graphics.closePath();
    graphics.fill(seatColor);
    graphics.stroke({ width: 1, color: 0x0a0a1e });

    graphics.moveTo(-seatWidth / 2, seatDepth / 4);
    graphics.lineTo(-seatWidth / 2, seatDepth / 4 - 40);
    graphics.lineTo(0, seatDepth / 2 - 40);
    graphics.lineTo(seatWidth / 2, seatDepth / 4 - 40);
    graphics.lineTo(seatWidth / 2, seatDepth / 4 - 35);
    graphics.lineTo(0, seatDepth / 2 - 35);
    graphics.lineTo(-seatWidth / 2 + 5, seatDepth / 4 - 35);
    graphics.lineTo(-seatWidth / 2 + 5, seatDepth / 4);
    graphics.closePath();
    graphics.fill(backColor);
    graphics.stroke({ width: 1, color: 0x1a1a2e });

    if (hasRGB && rgbColor) {
      graphics.moveTo(-seatWidth / 2 - 2, seatDepth / 4 - 38);
      graphics.lineTo(0, seatDepth / 2 - 38);
      graphics.lineTo(seatWidth / 2 + 2, seatDepth / 4 - 38);
      graphics.stroke({ width: 2, color: rgbColor });
    }
  };

  drawChair();
  container.addChild(glowGraphics);
  container.addChild(graphics);

  return {
    container,
    graphics,
    glowGraphics,
    update: (time: number) => {
      if (hasRGB) {
        const hue = (time * 0.0005) % 1;
        const rgbColor = hslToHex(hue, 1, 0.5);
        drawChair(rgbColor);
      }
    },
  };
}

function createMonitor(tier: EquipmentTier): EquipmentVisual {
  const container = new Container();
  const graphics = new Graphics();
  const glowGraphics = new Graphics();

  const monitorWidth = 50 + tier * 8;
  const monitorHeight = 35 + tier * 4;
  const standHeight = 15;
  const screenColor = tier >= EquipmentTier.Professional ? 0x4f46e5 : 0x6366f1;

  glowGraphics.alpha = 0.3;

  const drawMonitor = (glowIntensity: number) => {
    graphics.clear();
    glowGraphics.clear();

    graphics.rect(-8, -standHeight, 16, standHeight);
    graphics.fill(0x2a2a2a);

    graphics.moveTo(-monitorWidth / 2, -standHeight - monitorHeight);
    graphics.lineTo(monitorWidth / 2, -standHeight - monitorHeight);
    graphics.lineTo(monitorWidth / 2, -standHeight);
    graphics.lineTo(-monitorWidth / 2, -standHeight);
    graphics.closePath();
    graphics.fill(0x1a1a1a);
    graphics.stroke({ width: 2, color: 0x3a3a3a });

    graphics.rect(
      -monitorWidth / 2 + 4,
      -standHeight - monitorHeight + 4,
      monitorWidth - 8,
      monitorHeight - 8
    );
    graphics.fill(screenColor);

    glowGraphics.rect(
      -monitorWidth / 2 - 5,
      -standHeight - monitorHeight - 5,
      monitorWidth + 10,
      monitorHeight + 10
    );
    glowGraphics.fill(screenColor);
    glowGraphics.alpha = 0.15 + glowIntensity * 0.1;

    graphics.circle(0, -standHeight - 5, 2);
    graphics.fill(0x22c55e);
  };

  drawMonitor(0);
  container.addChild(glowGraphics);
  container.addChild(graphics);

  return {
    container,
    graphics,
    glowGraphics,
    update: (time: number) => {
      const pulse = Math.sin(time * 0.003) * 0.5 + 0.5;
      drawMonitor(pulse);
    },
  };
}

function createMicrophone(tier: EquipmentTier): EquipmentVisual {
  const container = new Container();
  const graphics = new Graphics();
  const glowGraphics = new Graphics();

  const hasIndicator = tier >= EquipmentTier.Basic;
  const isStudioMic = tier >= EquipmentTier.Intermediate;

  const drawMic = (indicatorOn: boolean) => {
    graphics.clear();
    glowGraphics.clear();

    if (isStudioMic) {
      graphics.rect(-3, 0, 6, 40);
      graphics.fill(0x3a3a3a);

      graphics.circle(0, -10, 12);
      graphics.fill(0x2a2a2a);
      graphics.stroke({ width: 2, color: 0x4a4a4a });

      if (tier >= EquipmentTier.Professional) {
        graphics.rect(-15, -18, 30, 16);
        graphics.fill(0x1a1a1a);
        graphics.stroke({ width: 1, color: 0x3a3a3a });
      }
    } else {
      graphics.moveTo(-8, 0);
      graphics.lineTo(-4, -20);
      graphics.lineTo(4, -20);
      graphics.lineTo(8, 0);
      graphics.closePath();
      graphics.fill(0x2a2a2a);

      graphics.circle(0, -25, 8);
      graphics.fill(0x1a1a1a);
      graphics.stroke({ width: 1, color: 0x3a3a3a });
    }

    if (hasIndicator) {
      const indicatorColor = indicatorOn ? 0x22c55e : 0x1a4a1a;
      graphics.circle(isStudioMic ? 8 : 0, isStudioMic ? -5 : -35, 3);
      graphics.fill(indicatorColor);

      if (indicatorOn) {
        glowGraphics.circle(isStudioMic ? 8 : 0, isStudioMic ? -5 : -35, 6);
        glowGraphics.fill(0x22c55e);
        glowGraphics.alpha = 0.4;
      }
    }
  };

  drawMic(false);
  container.addChild(glowGraphics);
  container.addChild(graphics);

  return {
    container,
    graphics,
    glowGraphics,
    update: (time: number) => {
      if (hasIndicator) {
        const blink = Math.sin(time * 0.002) > 0.3;
        drawMic(blink);
      }
    },
  };
}

function createLighting(tier: EquipmentTier, width: number, height: number): EquipmentVisual {
  const container = new Container();
  const graphics = new Graphics();
  const glowGraphics = new Graphics();

  const hasRingLight = tier >= EquipmentTier.Basic;
  const hasPanels = tier >= EquipmentTier.Intermediate;
  const hasStudioLighting = tier >= EquipmentTier.Elite;

  const drawLighting = (intensity: number, hue?: number) => {
    graphics.clear();
    glowGraphics.clear();

    if (hasRingLight && !hasPanels) {
      const ringX = width * 0.7;
      const ringY = height * 0.35;
      graphics.circle(ringX, ringY, 25);
      graphics.stroke({ width: 3, color: 0xffffff });
      graphics.circle(ringX, ringY, 22);
      graphics.stroke({ width: 2, color: 0xcccccc });

      glowGraphics.circle(ringX, ringY, 35);
      glowGraphics.fill(0xffffff);
      glowGraphics.alpha = 0.1 + intensity * 0.15;
    }

    if (hasPanels) {
      const panelColor = hasStudioLighting && hue !== undefined
        ? hslToHex(hue, 0.8, 0.6)
        : 0xffffff;

      const leftPanelX = width * 0.18;
      const leftPanelY = height * 0.25;
      graphics.rect(leftPanelX - 15, leftPanelY - 25, 30, 50);
      graphics.fill(0x1a1a1a);
      graphics.stroke({ width: 1, color: 0x3a3a3a });
      graphics.rect(leftPanelX - 12, leftPanelY - 22, 24, 44);
      graphics.fill(panelColor);

      glowGraphics.rect(leftPanelX - 20, leftPanelY - 30, 40, 60);
      glowGraphics.fill(panelColor);
      glowGraphics.alpha = 0.08 + intensity * 0.12;

      const rightPanelX = width * 0.82;
      const rightPanelY = height * 0.25;
      graphics.rect(rightPanelX - 15, rightPanelY - 25, 30, 50);
      graphics.fill(0x1a1a1a);
      graphics.stroke({ width: 1, color: 0x3a3a3a });
      graphics.rect(rightPanelX - 12, rightPanelY - 22, 24, 44);
      graphics.fill(panelColor);

      glowGraphics.rect(rightPanelX - 20, rightPanelY - 30, 40, 60);
      glowGraphics.fill(panelColor);
    }
  };

  drawLighting(0);
  container.addChild(glowGraphics);
  container.addChild(graphics);

  return {
    container,
    graphics,
    glowGraphics,
    update: (time: number) => {
      const intensity = Math.sin(time * 0.001) * 0.5 + 0.5;
      const hue = hasStudioLighting ? (time * 0.0002) % 1 : undefined;
      drawLighting(intensity, hue);
    },
  };
}

function createDecor(tier: EquipmentTier, width: number, height: number): EquipmentVisual {
  const container = new Container();
  const graphics = new Graphics();
  const glowGraphics = new Graphics();

  const hasLEDs = tier >= EquipmentTier.Basic;
  const hasNanoleaf = tier >= EquipmentTier.Intermediate;
  const hasFullSetup = tier >= EquipmentTier.Elite;

  const drawDecor = (hue: number, pulse: number) => {
    graphics.clear();
    glowGraphics.clear();

    const floorTop = height * 0.65 - height * 0.5 / 2;
    const wallHeight = height * 0.45;

    const posterX = width * 0.25;
    const posterY = floorTop - wallHeight * 0.6;
    const posterColor = hasFullSetup ? hslToHex(hue, 0.7, 0.5) : 0x6366f1;
    graphics.rect(posterX, posterY, 60, 80);
    graphics.fill(posterColor);
    graphics.stroke({ width: 2, color: 0x4f46e5 });

    const shelfX = width * 0.65;
    const shelfY = floorTop - wallHeight * 0.4;
    graphics.rect(shelfX, shelfY, 80, 8);
    graphics.fill(0x5c4033);

    if (hasLEDs) {
      const ledColor = hslToHex(hue, 1, 0.5);

      graphics.moveTo(width * 0.2, floorTop - 2);
      graphics.lineTo(width * 0.8, floorTop - 2);
      graphics.stroke({ width: 3, color: ledColor });

      glowGraphics.moveTo(width * 0.2, floorTop - 2);
      glowGraphics.lineTo(width * 0.8, floorTop - 2);
      glowGraphics.stroke({ width: 8, color: ledColor });
      glowGraphics.alpha = 0.3 + pulse * 0.2;
    }

    if (hasNanoleaf) {
      const hexSize = 18;
      const hexCenterX = width * 0.75;
      const hexCenterY = floorTop - wallHeight * 0.7;

      const hexPositions = [
        { x: 0, y: 0 },
        { x: hexSize * 1.5, y: -hexSize * 0.5 },
        { x: hexSize * 1.5, y: hexSize * 0.5 },
        { x: 0, y: hexSize },
        { x: -hexSize * 1.5, y: hexSize * 0.5 },
      ];

      hexPositions.forEach((pos, i) => {
        const hexHue = (hue + i * 0.15) % 1;
        const hexColor = hslToHex(hexHue, 0.8, 0.5);
        drawHexagon(graphics, hexCenterX + pos.x, hexCenterY + pos.y, hexSize, hexColor);

        glowGraphics.circle(hexCenterX + pos.x, hexCenterY + pos.y, hexSize);
        glowGraphics.fill(hexColor);
      });
      glowGraphics.alpha = 0.15 + pulse * 0.1;
    }
  };

  drawDecor(0, 0);
  container.addChild(glowGraphics);
  container.addChild(graphics);

  return {
    container,
    graphics,
    glowGraphics,
    update: (time: number) => {
      if (hasLEDs) {
        const hue = (time * 0.0003) % 1;
        const pulse = Math.sin(time * 0.002) * 0.5 + 0.5;
        drawDecor(hue, pulse);
      }
    },
  };
}

function createPC(tier: EquipmentTier): EquipmentVisual {
  const container = new Container();
  const graphics = new Graphics();
  const glowGraphics = new Graphics();

  const hasRGB = tier >= EquipmentTier.Intermediate;
  const caseWidth = 30 + tier * 5;
  const caseHeight = 50 + tier * 8;

  const drawPC = (rgbColor?: number, fanRotation?: number) => {
    graphics.clear();
    glowGraphics.clear();

    graphics.rect(-caseWidth / 2, -caseHeight, caseWidth, caseHeight);
    graphics.fill(0x1a1a1a);
    graphics.stroke({ width: 2, color: 0x3a3a3a });

    if (tier >= EquipmentTier.Professional) {
      graphics.rect(-caseWidth / 2 + 4, -caseHeight + 5, caseWidth - 8, caseHeight * 0.4);
      graphics.fill(0x0a0a0a);
    }

    graphics.circle(0, -15, 3);
    graphics.fill(0x22c55e);

    if (hasRGB && rgbColor) {
      graphics.rect(-caseWidth / 2 + 2, -caseHeight + 2, 3, caseHeight - 4);
      graphics.fill(rgbColor);
      graphics.rect(caseWidth / 2 - 5, -caseHeight + 2, 3, caseHeight - 4);
      graphics.fill(rgbColor);

      glowGraphics.rect(-caseWidth / 2 - 5, -caseHeight - 5, caseWidth + 10, caseHeight + 10);
      glowGraphics.fill(rgbColor);
      glowGraphics.alpha = 0.1;

      if (fanRotation !== undefined && tier >= EquipmentTier.Professional) {
        const fanX = 0;
        const fanY = -caseHeight + caseHeight * 0.25;
        const fanRadius = 12;
        for (let i = 0; i < 3; i++) {
          const angle = fanRotation + (i * Math.PI * 2) / 3;
          const x1 = fanX + Math.cos(angle) * fanRadius;
          const y1 = fanY + Math.sin(angle) * fanRadius;
          graphics.moveTo(fanX, fanY);
          graphics.lineTo(x1, y1);
          graphics.stroke({ width: 2, color: rgbColor });
        }
      }
    }
  };

  drawPC();
  container.addChild(glowGraphics);
  container.addChild(graphics);

  return {
    container,
    graphics,
    glowGraphics,
    update: (time: number) => {
      if (hasRGB) {
        const hue = (time * 0.0004) % 1;
        const rgbColor = hslToHex(hue, 1, 0.5);
        const fanRotation = time * 0.01;
        drawPC(rgbColor, fanRotation);
      }
    },
  };
}

function createCamera(tier: EquipmentTier): EquipmentVisual {
  const container = new Container();
  const graphics = new Graphics();
  const glowGraphics = new Graphics();

  const isWebcam = tier <= EquipmentTier.Intermediate;
  const hasRecordingLight = tier >= EquipmentTier.Basic;

  const drawCamera = (recording: boolean) => {
    graphics.clear();
    glowGraphics.clear();

    if (isWebcam) {
      graphics.circle(0, 0, 12 + tier * 2);
      graphics.fill(0x1a1a1a);
      graphics.stroke({ width: 2, color: 0x3a3a3a });

      graphics.circle(0, 0, 8 + tier);
      graphics.fill(0x0a0a15);
      graphics.circle(0, 0, 4);
      graphics.fill(0x2a2a3a);
    } else {
      graphics.rect(-25, -15, 50, 30);
      graphics.fill(0x1a1a1a);
      graphics.stroke({ width: 2, color: 0x3a3a3a });

      graphics.circle(-35, 0, 12);
      graphics.fill(0x0a0a0a);
      graphics.stroke({ width: 2, color: 0x2a2a2a });
      graphics.circle(-35, 0, 8);
      graphics.fill(0x1a1a2a);
    }

    if (hasRecordingLight) {
      const lightX = isWebcam ? 8 : 20;
      const lightY = isWebcam ? -8 : -10;
      const lightColor = recording ? 0xff0000 : 0x4a0000;
      graphics.circle(lightX, lightY, 3);
      graphics.fill(lightColor);

      if (recording) {
        glowGraphics.circle(lightX, lightY, 8);
        glowGraphics.fill(0xff0000);
        glowGraphics.alpha = 0.4;
      }
    }
  };

  drawCamera(false);
  container.addChild(glowGraphics);
  container.addChild(graphics);

  return {
    container,
    graphics,
    glowGraphics,
    update: (time: number) => {
      if (hasRecordingLight) {
        const recording = Math.sin(time * 0.002) > 0;
        drawCamera(recording);
      }
    },
  };
}

function drawHexagon(graphics: Graphics, cx: number, cy: number, size: number, color: number) {
  const points: number[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    points.push(cx + size * Math.cos(angle), cy + size * Math.sin(angle));
  }
  graphics.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2) {
    graphics.lineTo(points[i], points[i + 1]);
  }
  graphics.closePath();
  graphics.fill(color);
  graphics.stroke({ width: 1, color: 0xffffff });
}

function hslToHex(h: number, s: number, l: number): number {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (h < 1/6) { r = c; g = x; b = 0; }
  else if (h < 2/6) { r = x; g = c; b = 0; }
  else if (h < 3/6) { r = 0; g = c; b = x; }
  else if (h < 4/6) { r = 0; g = x; b = c; }
  else if (h < 5/6) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  const ri = Math.round((r + m) * 255);
  const gi = Math.round((g + m) * 255);
  const bi = Math.round((b + m) * 255);

  return (ri << 16) | (gi << 8) | bi;
}

function getEquipmentTierByCategory(equipment: Equipment[], category: EquipmentCategory): EquipmentTier {
  const categoryEquipment = equipment.filter((e) => e.category === category);
  if (categoryEquipment.length === 0) return EquipmentTier.Starter;
  return Math.max(...categoryEquipment.map((e) => e.tier)) as EquipmentTier;
}

export default function StreamingRoom({ width = 800, height = 500 }: StreamingRoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const visualsRef = useRef<EquipmentVisual[]>([]);
  const equipment = useGameStore((state) => state.player.channel.equipment);

  const createRoom = useCallback((app: Application, currentEquipment: Equipment[]) => {
    app.stage.removeChildren();
    visualsRef.current = [];

    const room = new Container();
    app.stage.addChild(room);

    const walls = new Graphics();
    drawWall(walls, width, height);
    room.addChild(walls);

    const chairTier = getEquipmentTierByCategory(currentEquipment, EquipmentCategory.Chair);
    const pcTier = getEquipmentTierByCategory(currentEquipment, EquipmentCategory.PC);
    const monitorTier = getEquipmentTierByCategory(currentEquipment, EquipmentCategory.PC);
    const micTier = getEquipmentTierByCategory(currentEquipment, EquipmentCategory.Microphone);
    const lightTier = getEquipmentTierByCategory(currentEquipment, EquipmentCategory.Lighting);
    const decorTier = getEquipmentTierByCategory(currentEquipment, EquipmentCategory.Decor);
    const cameraTier = getEquipmentTierByCategory(currentEquipment, EquipmentCategory.Camera);

    const decorVisual = createDecor(decorTier, width, height);
    room.addChild(decorVisual.container);
    visualsRef.current.push(decorVisual);

    const lightVisual = createLighting(lightTier, width, height);
    room.addChild(lightVisual.container);
    visualsRef.current.push(lightVisual);

    const floor = new Graphics();
    drawIsometricFloor(floor, width, height);
    room.addChild(floor);

    const centerX = width / 2;
    const centerY = height * 0.55;

    const deskVisual = createDesk(pcTier);
    deskVisual.container.x = centerX;
    deskVisual.container.y = centerY;
    room.addChild(deskVisual.container);
    visualsRef.current.push(deskVisual);

    const pcVisual = createPC(pcTier);
    pcVisual.container.x = centerX + 80;
    pcVisual.container.y = centerY + 10;
    room.addChild(pcVisual.container);
    visualsRef.current.push(pcVisual);

    const monitorVisual = createMonitor(monitorTier);
    monitorVisual.container.x = centerX;
    monitorVisual.container.y = centerY - 30;
    room.addChild(monitorVisual.container);
    visualsRef.current.push(monitorVisual);

    const micVisual = createMicrophone(micTier);
    micVisual.container.x = centerX - 50;
    micVisual.container.y = centerY - 10;
    room.addChild(micVisual.container);
    visualsRef.current.push(micVisual);

    const cameraVisual = createCamera(cameraTier);
    cameraVisual.container.x = centerX;
    cameraVisual.container.y = centerY - 75;
    room.addChild(cameraVisual.container);
    visualsRef.current.push(cameraVisual);

    const chairVisual = createChair(chairTier);
    chairVisual.container.x = centerX;
    chairVisual.container.y = centerY + 50;
    room.addChild(chairVisual.container);
    visualsRef.current.push(chairVisual);
  }, [width, height]);

  useEffect(() => {
    if (!containerRef.current) return;

    const app = new Application();
    appRef.current = app;

    let mounted = true;

    const initApp = async () => {
      await app.init({
        width,
        height,
        backgroundColor: 0x0f0f1a,
        antialias: true,
      });

      if (!mounted || !containerRef.current) return;
      containerRef.current.appendChild(app.canvas);

      createRoom(app, equipment);

      app.ticker.add(() => {
        const time = performance.now();
        visualsRef.current.forEach((visual) => visual.update(time));
      });
    };

    initApp();

    return () => {
      mounted = false;
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, createRoom]);

  useEffect(() => {
    if (appRef.current && appRef.current.stage) {
      createRoom(appRef.current, equipment);
    }
  }, [equipment, createRoom]);

  return <div ref={containerRef} className="rounded-lg overflow-hidden" />;
}
