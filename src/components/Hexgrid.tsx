import { useCallback, useEffect, useRef, useState } from 'react';
import drawHexagons from './HexgridDrawer';

import Hexagon from '@toonwire/hexgrid-game-engine/hexagon';
import Player from '@toonwire/hexgrid-game-engine/player';

import { HexgridOrientation, IHexgridLayout } from '../constants.ts';

import '../styles/Hexgrid.css';

function HexgridLayout(
  width: number,
  height: number,
  orientation: HexgridOrientation,
  hexRadius: number,
): IHexgridLayout {
  return {
    width: width,
    height: height,
    center: { x: width / 2, y: height / 2 },
    orientation: orientation,
    hexRadius: hexRadius,
  };
}

type HexgridProps = {
  hexagons: Hexagon[];
  playerIdMap: Map<string, Player>;
  orientation: HexgridOrientation;
  drawIteration: number;
};

function Hexgrid({ hexagons, playerIdMap, orientation, drawIteration }: HexgridProps) {
  const hexgridRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hexgridRect, setHexgridRect] = useState<DOMRect | null>(null);

  const updateHexgridSize = useCallback(() => {
    setHexgridRect(hexgridRef.current ? hexgridRef.current.getBoundingClientRect() : null);
  }, []);

  // update hexgrid dimensions whenever the reference changes (attach/detach)
  useEffect(() => {
    updateHexgridSize();
  }, [hexgridRef, updateHexgridSize]);

  // re-calculate layout and re-draw hexagons
  // happens whenever:
  // - the size of the hexgrid dimensions change
  // - the hexagon data changes
  // - the grid orientation changes
  useEffect(() => {
    if (!hexgridRect || !canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = hexgridRect.width;
    canvas.height = hexgridRect.height;

    const minDimen = Math.min(canvas.width, canvas.height);
    const cubeOnOuterRing = hexagons[hexagons.length - 1].cube;
    const numRings = Math.max(Math.abs(cubeOnOuterRing.x), Math.abs(cubeOnOuterRing.y), Math.abs(cubeOnOuterRing.z));
    const numHexagonsWide = numRings * 2 + 1;
    const hexgridLayout = HexgridLayout(
      canvas.width,
      canvas.height,
      orientation,
      minDimen / numHexagonsWide / 3 ** 0.5,
    );

    drawHexagons(canvasRef.current, hexagons, playerIdMap, hexgridLayout);
  }, [hexgridRect, hexagons, orientation, playerIdMap, drawIteration]);

  useEffect(() => {
    window.addEventListener('resize', updateHexgridSize);
    return () => window.removeEventListener('resize', updateHexgridSize);
  }, [updateHexgridSize]);

  return (
    <div id="hexgrid" ref={hexgridRef}>
      <canvas ref={canvasRef} />
    </div>
  );
}

export default Hexgrid;
