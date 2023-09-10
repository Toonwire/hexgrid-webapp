import { useCallback, useEffect, useState } from 'react';
import '../styles/Game.css';
import WithSidebar from './Sidebar';

import { HexgridOrientation } from '../constants';
import { default as HexgridComponent } from './Hexgrid';
import Loader from './Loader';
import Modal from './Modal';
import Scoreboard from './Scoreboard';

import { SelectedPlayer } from './PlayerSelect';

import { HexOwner, PlayerColors } from '@toonwire/hexgrid-game-engine/constants';
import Game, { GameError, GameState } from '@toonwire/hexgrid-game-engine/game';
import Player from '@toonwire/hexgrid-game-engine/player';
import Transaction, { PlayerTransaction } from '@toonwire/hexgrid-game-engine/transaction';
import { useLocation } from 'react-router-dom';
import { getPlayerStats, playerStatColumns } from './PlayerStats';

let game: Game;

const GAME_INTERVAL_TIMEOUT_MILLIS = 50;

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
              <Scoreboard rows={getPlayerStats(Array.from(game.idToPlayer.values()))} columns={playerStatColumns} />
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
