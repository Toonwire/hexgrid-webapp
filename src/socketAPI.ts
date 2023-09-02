import { GameState } from '@toonwire/hexgrid-game-engine/game';
import { PlayerCell } from '@toonwire/hexgrid-game-engine/player';
import { PlayerTransaction } from '@toonwire/hexgrid-game-engine/transaction';
import io from 'socket.io-client';
const ENDPOINT = 'http://127.0.0.1:4001';
const socket = io(ENDPOINT, {
  autoConnect: false,
});

function connect(callback: (socketId: string) => void) {
  socket.on('connect', () => callback(socket.id));
  socket.connect();
}

function disconnect(callback: () => void) {
  socket.on('disconnect', () => callback());
  socket.disconnect();
}

//---------------------

function joinGame(username: string) {
  socket.emit('join_game', username);
}

function subscribeToGameState(callback: (gameState: GameState) => void) {
  socket.on('game_state', (newGameState: GameState) => callback(newGameState));
}

function subscribeToGameOver(callback: (winner: string | null) => void) {
  socket.on('game_over', (_winner: string | null) => callback(_winner));
}

function subscribeToTurn(callback: (myCells: PlayerCell[]) => void) {
  socket.on('your_turn', (_myCells: PlayerCell[]) => callback(_myCells));
}

function takeTurn(playerTransaction: PlayerTransaction) {
  socket.emit('turn', playerTransaction);
}

export default {
  connect,
  disconnect,
  joinGame,
  subscribeToTurn,
  takeTurn,
  subscribeToGameState,
  subscribeToGameOver,
};
