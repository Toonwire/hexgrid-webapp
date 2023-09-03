import Player from '@toonwire/hexgrid-game-engine/player';
import { PlayerColor } from '@toonwire/hexgrid-game-engine/constants';

export type PlayerData = {
  color: PlayerColor;
  data: {
    [key: string]: string | number | boolean;
  };
};

export const playerStatColumns = [
  { key: 'name', label: 'Name' },
  { key: 'hexagonCount', label: 'Hexagons' },
  { key: 'resources', label: 'Resources' },
  { key: 'isAlive', label: 'Alive' },
  { key: 'roundsSurvived', label: 'Rounds' },
  { key: 'exceptions', label: 'Exceptions' },
];

export function getPlayerStats(players: Player[]): PlayerData[] {
  const playerData = players.map((player) => ({
    color: player.isAlive() ? player.color : { bg: 'grey', fg: '#404040' },
    data: {
      name: player.name,
      hexagonCount: player.ownedHexagonCount,
      resources: player.totalResources,
      isAlive: player.isAlive(),
      roundsSurvived: player.roundsSurvived,
      exceptions: player.exceptions,
    },
  }));

  playerData.sort(function (p1, p2) {
    if (p1.data.hexagonCount === p2.data.hexagonCount) {
      if (p1.data.resources === p2.data.resources) {
        if (p1.data.roundsSurvived === p2.data.roundsSurvived) return p1.data.exceptions - p2.data.exceptions; // sort by number of exceptions (lower = better)
        return p2.data.roundsSurvived - p1.data.roundsSurvived; // sort by rounds survived if equal resources
      } else return p2.data.resources - p1.data.resources; // sort by resouces if controlling equal hexagons
    } else return p2.data.hexagonCount - p1.data.hexagonCount; // sort by hexagon count predominantly
  });

  return playerData;
}
