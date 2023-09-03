import { useState, WheelEvent } from 'react';
import '../styles/PlayerSelect.css';
import WithSidebar from './Sidebar.js';
import { Navigate } from 'react-router-dom';

import DefaultBot from '@toonwire/hexgrid-game-engine/algorithms/DefaultBot';
import EasyBot from '@toonwire/hexgrid-game-engine/algorithms/EasyBot';
import MediumBot from '@toonwire/hexgrid-game-engine/algorithms/MediumBot';
import CarefulBot from '@toonwire/hexgrid-game-engine/algorithms/CarefulBot';
import twSupply from '@toonwire/hexgrid-game-engine/algorithms/twSupply';
import MakeItSafe from '@toonwire/hexgrid-game-engine/algorithms/MakeItSafe';
import {
  DEFAULT_EDITOR_CODE,
  DEFAULT_PLAYER_NAME,
  LOCAL_STORAGE_EDITOR_CODE,
  LOCAL_STORAGE_PLAYER_NAME,
  PLAYER_COLORS,
} from '../constants.js';

type SelectablePlayer = {
  name: string;
  codeString: string;
  count: number;
};

export type SelectedPlayer = {
  name: string;
  codeString: string;
};

function getActivePlayers(availablePlayers: SelectablePlayer[]): SelectedPlayer[] {
  const players: SelectedPlayer[] = [];
  availablePlayers.forEach((player) => {
    for (let i = 0; i < player.count; i++) {
      players.push({
        name: player.name,
        codeString: player.codeString,
      });
    }
  });
  return players;
}

function Versus() {
  const playerName = localStorage.getItem(LOCAL_STORAGE_PLAYER_NAME) || DEFAULT_PLAYER_NAME;
  const playerCode = localStorage.getItem(LOCAL_STORAGE_EDITOR_CODE) || DEFAULT_EDITOR_CODE;

  const players = [
    { name: playerName, codeString: playerCode, count: 1 },
    { name: DefaultBot.name, codeString: DefaultBot.turn.toString(), count: 0 },
    { name: MediumBot.name, codeString: MediumBot.turn.toString(), count: 0 },
    {
      name: CarefulBot.name,
      codeString: CarefulBot.turn.toString(),
      count: 0,
    },
    { name: EasyBot.name, codeString: EasyBot.turn.toString(), count: 0 },
    { name: twSupply.name, codeString: twSupply.turn.toString(), count: 0 },
    { name: MakeItSafe.name, codeString: MakeItSafe.turn.toString(), count: 0 },
  ];

  const [availablePlayers, setAvailablePlayers] = useState(players);
  const [redirect, setRedirect] = useState('');

  function redirectGame() {
    // minimum of 1 player needed to start a game
    const selectedPlayerCount = availablePlayers.reduce((acc, player) => acc + player.count, 0);
    if (selectedPlayerCount >= 1 || selectedPlayerCount > PLAYER_COLORS.length) {
      setRedirect('/game');
      // could also set local storage players here
    } else {
      console.log('Minimum 1 player required to start a game');
    }
  }

  function updatePlayerCount(idx: number, newCount: number) {
    if (newCount >= 0) {
      availablePlayers[idx].count = newCount;
      const updatedPlayers = [...availablePlayers];
      setAvailablePlayers(updatedPlayers);
    }
  }

  function resetPlayerCounts() {
    setAvailablePlayers(players);
  }

  if (redirect) {
    return (
      <Navigate
        to={redirect}
        state={{
          players: getActivePlayers(availablePlayers),
        }}
      />
    );
  }

  return (
    <WithSidebar
      sidebarElements={[
        <span key={0} className="sidebar-item interactable" onClick={redirectGame}>
          Start game
        </span>,
      ]}
      content={
        <div className="content padding-border">
          <Header
            numUniquePlayers={availablePlayers.filter((player) => player.count > 0).length}
            numTotalPlayers={availablePlayers.reduce((acc, player) => acc + player.count, 0)}
            onResetCount={() => resetPlayerCounts()}
          />
          <div className="players">
            {availablePlayers.map((player, idx) => (
              <Player
                key={player.name}
                name={player.name}
                count={player.count}
                onCountChange={(newCount: number) => updatePlayerCount(idx, newCount)}
                onResetCount={() => updatePlayerCount(idx, 0)}
              />
            ))}
          </div>
        </div>
      }
    />
  );
}

type PlayerProps = {
  name: string;
  count: number;
  onCountChange: (newCount: number) => void;
  onResetCount: () => void;
};

const Player = ({ name, count, onCountChange, onResetCount }: PlayerProps) => {
  return (
    <div className="player">
      <div className="player-name">
        <a className="remove-player" onClick={onResetCount}>
          ✖
        </a>
        {name}
      </div>
      <div className="player-counter">
        <Counter onChange={onCountChange} count={count} />
      </div>
    </div>
  );
};

type CounterProps = {
  onChange: (newCount: number) => void;
  count: number;
};

const Counter = ({ onChange, count }: CounterProps) => {
  function handleWheelUpdate(event: WheelEvent<HTMLDivElement>) {
    if (event.deltaY < 0) {
      onChange(count + 1); // scroll up = increment count
    } else if (event.deltaY > 0) {
      onChange(count - 1); // scroll down = decrement count
    }
  }

  return (
    <div className="counter">
      <button className="counter-action decrement" onClick={() => onChange(count - 1)}>
        &#8722; {/* minus sign */}
      </button>
      <div className="counter-count" onWheel={handleWheelUpdate}>
        {count}
      </div>
      <button className="counter-action increment" onClick={() => onChange(count + 1)}>
        &#43; {/* plus sign */}
      </button>
    </div>
  );
};

type HeaderProps = {
  numUniquePlayers: number;
  numTotalPlayers: number;
  onResetCount: () => void;
};

const Header = ({ numUniquePlayers, numTotalPlayers, onResetCount }: HeaderProps) => {
  return (
    <div className="header">
      <h1>Player selection</h1>
      <PlayerCount numUniquePlayers={numUniquePlayers} numTotalPlayers={numTotalPlayers} onResetCount={onResetCount} />
    </div>
  );
};

type PlayerCountProps = {
  numUniquePlayers: number;
  numTotalPlayers: number;
  onResetCount: () => void;
};

const PlayerCount = ({ numUniquePlayers, numTotalPlayers, onResetCount }: PlayerCountProps) => {
  return (
    <div className="player-counter">
      <table className="counts">
        <tbody>
          <tr>
            <td>Unique Players:</td>
            <td>{numUniquePlayers}</td>
          </tr>
          <tr>
            <td>Total players:</td>
            <td>{numTotalPlayers}</td>
          </tr>
        </tbody>
      </table>
      <div className="reset">
        <button onClick={onResetCount}>Reset</button>
      </div>
    </div>
  );
};

export default Versus;
