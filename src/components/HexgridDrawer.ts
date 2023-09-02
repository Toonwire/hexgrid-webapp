import { HexOwner } from '@toonwire/hexgrid-game-engine/constants.ts';
import { IHexgridLayout, HexgridOrientation, Point2d } from '../constants.ts';

import Hexagon from '@toonwire/hexgrid-game-engine/hexagon';
import Player from '@toonwire/hexgrid-game-engine/player';

const CANVAS_BACKGROUND_COLOR = '#242424'; //'#183b4e';
const FONT_FAMILY = 'Consolas';

function clearCanvas(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
  if (!canvas) return;
  context.fillStyle = CANVAS_BACKGROUND_COLOR;
  context.fillRect(0, 0, canvas.width, canvas.width);
}

function drawHexagons(
  canvas: HTMLCanvasElement,
  baseHexagons: Hexagon[],
  playerIdMap: Map<string, Player>,
  layout: IHexgridLayout,
) {
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) return;

  context.fillStyle = CANVAS_BACKGROUND_COLOR;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = 30 / 2 + 'px ' + FONT_FAMILY;

  clearCanvas(canvas, context);

  const hexagonDrawables = hexDrawables(baseHexagons, layout);

  // draw the hexagons on the canvas
  for (let i = 0; i < hexagonDrawables.length; i++) {
    const hexDrawable = hexagonDrawables[i];

    context.beginPath();
    context.moveTo(hexDrawable.corners[0].x, hexDrawable.corners[0].y);
    for (let j = 1; j < hexDrawable.corners.length; j++) {
      context.lineTo(hexDrawable.corners[j].x, hexDrawable.corners[j].y);
    }
    context.closePath();

    const hexOwnerId = String(hexDrawable.hexagon.ownerId);
    const hexOwner = hexDrawable.hexagon.getHexOwnerPerspective(hexOwnerId);

    // fill hexagon
    context.fillStyle = '#9e9e9e';

    const ownerPlayer = playerIdMap.get(hexOwnerId);
    if (hexOwner !== HexOwner.NONE && ownerPlayer) {
      context.fillStyle = ownerPlayer.color.bg;
    }
    context.fill();

    // super cell lines
    if (hexDrawable.hexagon.maxGrowth === 300) {
      drawSuperCell(context, hexDrawable);
    }

    // color hexagon white if player transaction target hexagon
    // and color hexagon black if player transaction source hexagon
    // if (ownerPlayer && ownerPlayer.transaction) {
    //   if (ownerPlayer.transaction.toHexId === hexDrawable.hexagon.id) {
    //     context.fillStyle = 'white';
    //     context.fill();
    //   } else if (ownerPlayer.transaction.fromHexId === hexDrawable.hexagon.id) {
    //     context.fillStyle = 'black';
    //     context.fill();
    //   }
    // }

    // hexagon border
    context.lineWidth = 1;
    context.strokeStyle = CANVAS_BACKGROUND_COLOR;
    context.stroke();

    // text inside hexagon
    context.font = 'bold ' + hexDrawable.radius / 2 + 'px ' + FONT_FAMILY;
    context.fillStyle = 'black';

    if (hexOwner !== HexOwner.NONE && ownerPlayer) {
      context.fillStyle = ownerPlayer.color.fg;
    }

    context.fillText(
      String(hexDrawable.hexagon.resources),
      hexDrawable.center.x,
      hexDrawable.center.y,
      hexDrawable.radius,
    );
  }
}

function drawSuperCell(context: CanvasRenderingContext2D, hexDrawable: HexagonDrawable) {
  // context.strokeStyle = "#878787";
  context.beginPath();

  // 3 lines above middle
  context.moveTo(
    (hexDrawable.corners[0].x + hexDrawable.corners[5].x) / 2,
    (hexDrawable.corners[0].y + hexDrawable.corners[5].y) / 2,
  );
  context.lineTo(
    (hexDrawable.corners[3].x + hexDrawable.corners[4].x) / 2,
    (hexDrawable.corners[3].y + hexDrawable.corners[4].y) / 2,
  );

  context.moveTo(
    ((hexDrawable.corners[0].x + hexDrawable.corners[5].x) / 2 + hexDrawable.corners[5].x) / 2,
    ((hexDrawable.corners[0].y + hexDrawable.corners[5].y) / 2 + hexDrawable.corners[5].y) / 2,
  );
  context.lineTo(
    ((hexDrawable.corners[3].x + hexDrawable.corners[4].x) / 2 + hexDrawable.corners[4].x) / 2,
    ((hexDrawable.corners[3].y + hexDrawable.corners[4].y) / 2 + hexDrawable.corners[4].y) / 2,
  );

  context.moveTo(
    ((hexDrawable.corners[0].x + hexDrawable.corners[5].x) / 2 + hexDrawable.corners[0].x) / 2,
    ((hexDrawable.corners[0].y + hexDrawable.corners[5].y) / 2 + hexDrawable.corners[0].y) / 2,
  );
  context.lineTo(
    ((hexDrawable.corners[3].x + hexDrawable.corners[4].x) / 2 + hexDrawable.corners[3].x) / 2,
    ((hexDrawable.corners[3].y + hexDrawable.corners[4].y) / 2 + hexDrawable.corners[3].y) / 2,
  );

  // middle
  context.moveTo(hexDrawable.corners[0].x, hexDrawable.corners[0].y);
  context.lineTo(hexDrawable.corners[3].x, hexDrawable.corners[3].y);

  // 3 lines below middle
  context.moveTo(
    (hexDrawable.corners[0].x + hexDrawable.corners[1].x) / 2,
    (hexDrawable.corners[0].y + hexDrawable.corners[1].y) / 2,
  );
  context.lineTo(
    (hexDrawable.corners[2].x + hexDrawable.corners[3].x) / 2,
    (hexDrawable.corners[2].y + hexDrawable.corners[3].y) / 2,
  );

  context.moveTo(
    ((hexDrawable.corners[0].x + hexDrawable.corners[1].x) / 2 + hexDrawable.corners[0].x) / 2,
    ((hexDrawable.corners[0].y + hexDrawable.corners[1].y) / 2 + hexDrawable.corners[0].y) / 2,
  );
  context.lineTo(
    ((hexDrawable.corners[2].x + hexDrawable.corners[3].x) / 2 + hexDrawable.corners[3].x) / 2,
    ((hexDrawable.corners[2].y + hexDrawable.corners[3].y) / 2 + hexDrawable.corners[3].y) / 2,
  );

  context.moveTo(
    ((hexDrawable.corners[0].x + hexDrawable.corners[1].x) / 2 + hexDrawable.corners[1].x) / 2,
    ((hexDrawable.corners[0].y + hexDrawable.corners[1].y) / 2 + hexDrawable.corners[1].y) / 2,
  );
  context.lineTo(
    ((hexDrawable.corners[2].x + hexDrawable.corners[3].x) / 2 + hexDrawable.corners[2].x) / 2,
    ((hexDrawable.corners[2].y + hexDrawable.corners[3].y) / 2 + hexDrawable.corners[2].y) / 2,
  );

  // draw
  context.stroke();
}

export type HexagonDrawable = {
  hexagon: Hexagon;
  center: Point2d;
  corners: Point2d[];
  radius: number;
};

function hexDrawables(hexagons: Hexagon[], layout: IHexgridLayout): HexagonDrawable[] {
  function hexCenter(hexagon: Hexagon, layout: IHexgridLayout): Point2d {
    const y = hexagon.cube.y;
    const z = hexagon.cube.z;
    const hexCenter: Point2d = { x: 0, y: 0 };

    if (layout.orientation === HexgridOrientation.FLAT) {
      hexCenter.x = layout.center.x + (3 / 2) * layout.hexRadius * -z;
      hexCenter.y = layout.center.y + 3 ** 0.5 * layout.hexRadius * (-z / 2 + -y);
    } else if (layout.orientation === HexgridOrientation.POINTY) {
      hexCenter.x = layout.center.x + 3 ** 0.5 * layout.hexRadius * (-z / 2 + -y);
      hexCenter.y = layout.center.y + (3 / 2) * layout.hexRadius * -z;
    } else throw Error('Invalid orientation: Must be either FLAT or POINTY, was ' + layout.orientation);

    return hexCenter;
  }

  function hexCorners(center: Point2d, layout: IHexgridLayout): Point2d[] {
    function hexCorner(orientation: HexgridOrientation, center: Point2d, radius: number, i: number) {
      const angle_deg = orientation === HexgridOrientation.FLAT ? 60 * i : 60 * i - 30;
      const angle_rad = (Math.PI / 180) * angle_deg;
      return {
        x: center.x + radius * Math.cos(angle_rad),
        y: center.y + radius * Math.sin(angle_rad),
      };
    }

    const corners: Point2d[] = [];
    for (let i = 0; i < 6; i++) {
      corners.push(hexCorner(layout.orientation, center, layout.hexRadius, i));
    }
    return corners;
  }

  const hexagonDrawables = hexagons.map(function (hexagon) {
    const center = hexCenter(hexagon, layout);
    return {
      hexagon: hexagon,
      center: center,
      corners: hexCorners(center, layout),
      radius: layout.hexRadius,
    };
  });

  return hexagonDrawables;
}

export default drawHexagons;
