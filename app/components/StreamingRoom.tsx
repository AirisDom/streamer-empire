'use client';

import { useEffect, useRef } from 'react';
import { Application, Container, Graphics } from 'pixi.js';

interface StreamingRoomProps {
  width?: number;
  height?: number;
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

function drawIsometricDesk(container: Container, x: number, y: number) {
  const desk = new Graphics();

  const deskWidth = 120;
  const deskHeight = 30;
  const deskDepth = 60;

  desk.moveTo(0, 0);
  desk.lineTo(deskWidth / 2, deskDepth / 4);
  desk.lineTo(0, deskDepth / 2);
  desk.lineTo(-deskWidth / 2, deskDepth / 4);
  desk.closePath();
  desk.fill(0x5c4033);
  desk.stroke({ width: 1, color: 0x3a2a1a });

  desk.moveTo(-deskWidth / 2, deskDepth / 4);
  desk.lineTo(-deskWidth / 2, deskDepth / 4 + deskHeight);
  desk.lineTo(0, deskDepth / 2 + deskHeight);
  desk.lineTo(0, deskDepth / 2);
  desk.closePath();
  desk.fill(0x4a3528);
  desk.stroke({ width: 1, color: 0x3a2a1a });

  desk.moveTo(0, deskDepth / 2);
  desk.lineTo(deskWidth / 2, deskDepth / 4);
  desk.lineTo(deskWidth / 2, deskDepth / 4 + deskHeight);
  desk.lineTo(0, deskDepth / 2 + deskHeight);
  desk.closePath();
  desk.fill(0x3d2b1f);
  desk.stroke({ width: 1, color: 0x3a2a1a });

  desk.x = x;
  desk.y = y;
  container.addChild(desk);
}

function drawIsometricChair(container: Container, x: number, y: number) {
  const chair = new Graphics();

  const seatWidth = 50;
  const seatDepth = 30;

  chair.moveTo(0, 0);
  chair.lineTo(seatWidth / 2, seatDepth / 4);
  chair.lineTo(0, seatDepth / 2);
  chair.lineTo(-seatWidth / 2, seatDepth / 4);
  chair.closePath();
  chair.fill(0x1a1a2e);
  chair.stroke({ width: 1, color: 0x0a0a1e });

  chair.moveTo(-seatWidth / 2, seatDepth / 4);
  chair.lineTo(-seatWidth / 2, seatDepth / 4 - 40);
  chair.lineTo(0, seatDepth / 2 - 40);
  chair.lineTo(seatWidth / 2, seatDepth / 4 - 40);
  chair.lineTo(seatWidth / 2, seatDepth / 4 - 35);
  chair.lineTo(0, seatDepth / 2 - 35);
  chair.lineTo(-seatWidth / 2 + 5, seatDepth / 4 - 35);
  chair.lineTo(-seatWidth / 2 + 5, seatDepth / 4);
  chair.closePath();
  chair.fill(0x2d2d4d);
  chair.stroke({ width: 1, color: 0x1a1a2e });

  chair.x = x;
  chair.y = y;
  container.addChild(chair);
}

function drawIsometricComputer(container: Container, x: number, y: number) {
  const computer = new Graphics();

  const monitorWidth = 70;
  const monitorHeight = 45;
  const standHeight = 15;

  computer.rect(-8, -standHeight, 16, standHeight);
  computer.fill(0x2a2a2a);

  computer.moveTo(-monitorWidth / 2, -standHeight - monitorHeight);
  computer.lineTo(monitorWidth / 2, -standHeight - monitorHeight);
  computer.lineTo(monitorWidth / 2, -standHeight);
  computer.lineTo(-monitorWidth / 2, -standHeight);
  computer.closePath();
  computer.fill(0x1a1a1a);
  computer.stroke({ width: 2, color: 0x3a3a3a });

  computer.rect(-monitorWidth / 2 + 4, -standHeight - monitorHeight + 4, monitorWidth - 8, monitorHeight - 8);
  computer.fill(0x6366f1);

  computer.circle(0, -standHeight - 5, 2);
  computer.fill(0x22c55e);

  computer.x = x;
  computer.y = y;
  container.addChild(computer);
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

  const posterX = width * 0.25;
  const posterY = floorTop - wallHeight * 0.6;
  graphics.rect(posterX, posterY, 60, 80);
  graphics.fill(0x6366f1);
  graphics.stroke({ width: 2, color: 0x4f46e5 });

  const shelfX = width * 0.65;
  const shelfY = floorTop - wallHeight * 0.4;
  graphics.rect(shelfX, shelfY, 80, 8);
  graphics.fill(0x5c4033);
}

export default function StreamingRoom({ width = 800, height = 500 }: StreamingRoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const app = new Application();
    appRef.current = app;

    const initApp = async () => {
      await app.init({
        width,
        height,
        backgroundColor: 0x0f0f1a,
        antialias: true,
      });

      if (!containerRef.current) return;
      containerRef.current.appendChild(app.canvas);

      const room = new Container();
      app.stage.addChild(room);

      const walls = new Graphics();
      drawWall(walls, width, height);
      room.addChild(walls);

      const floor = new Graphics();
      drawIsometricFloor(floor, width, height);
      room.addChild(floor);

      const centerX = width / 2;
      const centerY = height * 0.55;

      drawIsometricDesk(room, centerX, centerY);
      drawIsometricComputer(room, centerX, centerY - 30);
      drawIsometricChair(room, centerX, centerY + 50);
    };

    initApp();

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
    };
  }, [width, height]);

  return <div ref={containerRef} className="rounded-lg overflow-hidden" />;
}
