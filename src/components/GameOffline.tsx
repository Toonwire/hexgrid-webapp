import { useState, useEffect, useCallback } from 'react';
import '../styles/Game.css';
import WithSidebar from './Sidebar';

import { HexgridOrientation } from '../constants';
import Scoreboard, { PlayerData } from './Scoreboard';
import { default as HexgridComponent } from './Hexgrid';
import Loader from './Loader';
// import utils from '../game_stuff/utils';
// import Game from '../game_stuff/game';
import Modal from './Modal';

import { SelectedPlayer } from './PlayerSelect';

// import { TooManyPlayersException } from '../game_stuff/exceptions';

import Game, { GameError, GameState } from '@toonwire/hexgrid-game-engine/game';
import Player from '@toonwire/hexgrid-game-engine/player';
import { useLocation } from 'react-router-dom';
import Transaction, { PlayerTransaction } from '@toonwire/hexgrid-game-engine/transaction';
import { HexOwner, PlayerColors } from '@toonwire/hexgrid-game-engine/constants';

let game: Game;

const GAME_INTERVAL_TIMEOUT_MILLIS = 50;

const playerStatColumns = [
  { key: 'name', label: 'Name' },
  { key: 'hexagonCount', label: 'Hexagons' },
  { key: 'resources', label: 'Resources' },
  { key: 'isAlive', label: 'Alive' },
  { key: 'roundsSurvived', label: 'Rounds' },
  { key: 'exceptions', label: 'Exceptions' },
];

function getPlayerStats(playerIdMap: Map<string, Player>): PlayerData[] {
  const playerData = Array.from(playerIdMap.values()).map((player) => ({
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

  // add labels to player data as header

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

function GameOffline() {
  const [hexgridOrientation, setHexgridOrientation] = useState(HexgridOrientation.POINTY);
  const [gameInterval, setGameInterval] = useState<number>();
  const [gameState, setGameState] = useState<GameState>();
  const [winner, setWinner] = useState<Player | null>();
  const [gameSteps, setGameSteps] = useState<number>(0);

  const location = useLocation();

  const newGame = useCallback(() => {
    if (!location.state || !location.state.players) {
      console.error('No players selected');
      return;
    }

    game = new Game();
    const selectedPlayers: SelectedPlayer[] = location.state.players;

    selectedPlayers.forEach((player, idx) => {
      let turnFunction = null;

      // compile player code into function with the HexOwner in scope
      try {
        turnFunction = new Function('HexOwner', 'return (' + player.codeString + ')')(HexOwner);
      } catch (e) {
        throw new Error('Could not compile turn function');
      }

      try {
        game.addPlayer(new Player(player.name, PlayerColors[idx], turnFunction));
      } catch (e) {
        if (e === GameError.ADD_PLAYER_BEYOND_MAX) {
          console.log('Too many players - cannot add more players to game');
        } else {
          console.error(e);
        }
      }
    });
    game.setup();
    setGameState(game.getCurrentState());
    console.log(game);
  }, [location.state]);

  useEffect(() => {
    newGame();
  }, [newGame]);

  useEffect(() => {
    return () => clearInterval(gameInterval);
  }, [gameInterval]);

  const gameSidebarElements = [
    <span key={0} className="sidebar-item interactable" onClick={onPlay}>
      Play
    </span>,
    <span key={1} className="sidebar-item interactable" onClick={onStop}>
      Stop
    </span>,
    <span key={2} className="sidebar-item interactable" onClick={onNextStep}>
      Next step
    </span>,
    // <span key={3} className="sidebar-item interactable" onClick={onPrevStep}>Prev step</span>,
    // <span key={4} className="sidebar-item interactable" onClick={onSpeedUp}>Speed up</span>,
    // <span key={5} className="sidebar-item interactable" onClick={onSpeedDown}>Speed down</span>,
    <span key={6} className="sidebar-item interactable" onClick={onRestart}>
      Restart
    </span>,
    <span key={7} className="sidebar-item interactable" onClick={onSwitchHexgridOrientation}>
      Switch orientation
    </span>,
  ];

  function onNextStep() {
    if (game && !game.isGameOver()) {
      game.idToPlayer.forEach((player, playerId) => {
        if (player.isAlive()) {
          let playerTransaction: PlayerTransaction;
          try {
            playerTransaction = player.turn(game.getPlayerCells(playerId));
          } catch (e) {
            console.error(e);
            player.exceptions++;
            return;
          }
          const transaction = Transaction.fromPlayerTransaction(player.id, playerTransaction);
          player.setTransaction(transaction);
        }
      });

      game.update();
      setGameState(game.getCurrentState());
      setGameSteps((prevSteps) => prevSteps + 1);
    }
  }

  function onPlay() {
    if (!gameInterval) {
      const interval = setInterval(() => {
        onNextStep();
        if (game && game.isGameOver()) {
          clearInterval(interval);
          setGameInterval(undefined);
          setWinner(game.getWinner());
        }
      }, GAME_INTERVAL_TIMEOUT_MILLIS);

      setGameInterval(interval);
    }
  }

  function onStop() {
    clearInterval(gameInterval);
    setGameInterval(undefined);
  }

  function onRestart() {
    newGame();
  }

  function onSwitchHexgridOrientation() {
    setHexgridOrientation(
      hexgridOrientation === HexgridOrientation.FLAT ? HexgridOrientation.POINTY : HexgridOrientation.FLAT,
    );
  }

  return (
    <WithSidebar
      sidebarElements={gameSidebarElements}
      content={
        gameState ? (
          <div className="game" onClick={winner ? () => setWinner(null) : () => {}}>
            {game && game.idToPlayer && (
              <Scoreboard rows={getPlayerStats(game.idToPlayer)} columns={playerStatColumns} />
            )}
            <HexgridComponent
              hexagons={gameState.hexagons}
              playerIdMap={gameState.players}
              orientation={hexgridOrientation}
              drawIteration={gameSteps}
            />
            {winner ? <Modal headerText="Winner" bodyText={winner.name} footerText="Congratulations" /> : null}
          </div>
        ) : (
          <Loader>Loading game...</Loader>
        )
      }
    />
  );
}

export default GameOffline;