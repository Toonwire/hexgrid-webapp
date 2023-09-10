import { useEffect, useState } from 'react';

import { HexgridOrientation, LOCAL_STORAGE_PLAYER_NAME } from '../constants';
import socketAPI from '../socketAPI';
import { default as HexgridComponent } from './Hexgrid';
import Loader from './Loader';
import Modal from './Modal';
import { getPlayerStats, playerStatColumns } from './PlayerStats';
import Scoreboard from './Scoreboard';
import WithSidebar from './Sidebar';

import { GameState } from '@toonwire/hexgrid-game-engine/game';
import { generateGUID } from '@toonwire/hexgrid-game-engine/guid';
import Player, { PlayerCell } from '@toonwire/hexgrid-game-engine/player';

import '../styles/Game.css';
import '../styles/Sidebar.css';

function GameLive() {
  const [hexgridOrientation, setHexgridOrientation] = useState(HexgridOrientation.POINTY);
  const [gameState, setGameState] = useState<GameState>();
  const [socketId, setSocketId] = useState<string>();
  const [winner, setWinner] = useState<Player>();
  const [gameSteps, setGameSteps] = useState<number>(0);

  useEffect(() => {
    socketAPI.subscribeToGameState((currentState) => {
      setGameState(currentState);
      setGameSteps((prevSteps) => prevSteps + 1);
    });

    socketAPI.subscribeToGameOver((winner) => {
      setWinner(winner);
    });

    // TODO: only do this once (despite many join game, only 1-1 relation between game and turn data sub)
    console.log('Subscribing to turn data');
    socketAPI.subscribeToTurn((playerCells) => {
      const transaction = calculateTransaction(playerCells);
      // console.log(playerCells)
      // console.log(transaction)
      socketAPI.takeTurn(transaction);
    });

    return () => {
      // TODO: need to unsub from all socket events in addition to disconnecting?
      // socketAPI.unsubscribeFromGameState();
      // socketAPI.unsubscribeFromGameOver();
      // socketAPI.unsubscribeFromTurn();
      disconnect();
    };
  }, []);

  function connect() {
    socketAPI.connect((socketId) => {
      console.log('Connected to server on socket', socketId);
      setSocketId(socketId);
    });
  }

  function disconnect() {
    socketAPI.disconnect(() => {
      console.log('Disconnected from server');
      setSocketId(undefined);
    });
  }

  function joinGame() {
    const playerName = localStorage.getItem(LOCAL_STORAGE_PLAYER_NAME) || 'Anon-' + generateGUID().slice(0, 6);
    socketAPI.joinGame(playerName);
  }

  const connected = socketId !== undefined;

  const gameSidebarElements = [
    <span key={0} className={'sidebar-item interactable' + (connected ? 'disabled' : '')} onClick={connect}>
      Connect to server (temp)
    </span>,
    <span key={2} className={'sidebar-item interactable' + (connected ? '' : 'disabled')} onClick={joinGame}>
      Join game
    </span>,
    <span key={1} className={'sidebar-item interactable' + (connected ? '' : 'disabled')} onClick={disconnect}>
      Disconnect from server (temp)
    </span>,
    <span key={7} className="sidebar-item interactable" onClick={onSwitchHexgridOrientation}>
      Switch orientation
    </span>,
  ];

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
          <div className="game" onClick={winner ? () => setWinner(undefined) : () => {}}>
            <Scoreboard rows={getPlayerStats(Array.from(gameState.players.values()))} columns={playerStatColumns} />
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

function calculateTransaction(playerCells: PlayerCell[]) {
  const codeString = localStorage.getItem('editorCode');
  const turnFunction = eval('(' + codeString + ')'); // TODO: change to Function constructor
  const transaction = turnFunction(playerCells);
  return transaction;
}

export default GameLive;
