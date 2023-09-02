import { useState, useEffect } from 'react';
import '../styles/Editor.css';
import WithSidebar from './Sidebar';
import { Navigate } from 'react-router-dom';

import AceEditor from 'react-ace';
import { Ace } from 'ace-builds';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-twilight';

const LOCAL_STORAGE_PLAYER_NAME = 'playerName';
const LOCAL_STORAGE_EDITOR_CODE = 'editorCode';

const defaultPlayerName = 'Anonymous';
const defaultEditorCode = `
/**
* id            string (unique identifier for a hexagon cell)
* resources     int (amount displayed in hexagon)
* maxGrowth     int (normal cells: 100, super cells: 300)
* owner         enum HexOwner {NONE: 0, OWN: 1, OTHER: 2}
*                   HexOwner.NONE 	Unoccupied hexagon
*                   HexOwner.OWN 	Hexagon controlled by this player (you)
*                   HexOwner.OTHER 	Hexagon controlled by another player (opponent)
*
* playerCell    {id:string, resources:int, maxGrowth:int, neighborCells:neighborCell[]}
* neighborCell  {id:string, resources:int, owner:HexOwner, maxGrowth:int}
* myCells       playerCell[]
*/

function turn(myCells) {
  // get all cells with enemy neighbors and sort by resources to get strongest attacker
  const attackerCells = myCells
    .filter(cell => cell.neighbors.some(n => n.owner !== HexOwner.OWN))
    .sort((a, b) => b.resources - a.resources);
  const strongestAttacker = attackerCells[0];
  
  // find and sort neighbors of the most resourceful attacker
  const targetCells = strongestAttacker.neighbors
    .filter(n => n.owner !== HexOwner.OWN)
    .sort((a, b) => a.resources - b.resources);
  const weakestTarget = targetCells[0];
  
  // transfer all but one resource from the strongest attacker to the weakest target
  const transaction = {
    fromId: strongestAttacker.id, 
    toId: weakestTarget.id, 
    transferAmount: strongestAttacker.resources - 1
  };
  return transaction;
}`;

function Editor() {
  const [playerName, setPlayerName] = useState('');
  const [redirect, setRedirect] = useState('');
  const [editorCode, setEditorCode] = useState(defaultEditorCode);

  const JsAceEditor = (
    <AceEditor
      className="editor"
      width="800"
      height="1000"
      placeholder=""
      mode="javascript"
      theme="twilight"
      name="transaction_editor"
      onLoad={onEditorLoad}
      onChange={onEditorChange}
      fontSize={14}
      showPrintMargin={false}
      showGutter={true}
      highlightActiveLine={true}
      value={editorCode}
      setOptions={{
        showLineNumbers: true,
        tabSize: 2,
        useWorker: false,
      }}
    />
  );

  useEffect(() => {
    // load player name from local storage
    const savedPlayerName = localStorage.getItem(LOCAL_STORAGE_PLAYER_NAME);
    setPlayerName(savedPlayerName || '');
    const playerNameInput = document.getElementById('input-player-name');
    if (playerNameInput && savedPlayerName) {
      playerNameInput.textContent = savedPlayerName;
    }
  }, []);

  function onCompile() {
    onSave();
    setRedirect('/versus');
  }

  const editorSidebarElements = [
    <span
      key={0}
      id="input-player-name"
      className="sidebar-item interactable single-line"
      contentEditable
      suppressContentEditableWarning={true}
      placeholder="Enter algorithm name.."
      spellCheck={false}
      onInput={(e) => setPlayerName(e.currentTarget.textContent?.trim() || '')}
    />,
    <hr key={1} />,
    <span key={2} className="sidebar-item interactable" onClick={onSave}>
      Save
    </span>,
    <span key={3} className="sidebar-item interactable" onClick={onCompile}>
      Compile
    </span>,
    <span key={4} className="sidebar-item interactable" onClick={() => setEditorCode(defaultEditorCode)}>
      Reset to default code
    </span>,
  ];

  const Content = () => {
    if (redirect) {
      return (
        <Navigate
          to={redirect}
          state={{
            playerName: playerName,
            playerCode: editorCode,
          }}
        />
      );
    }

    return <WithSidebar sidebarElements={editorSidebarElements} content={JsAceEditor} />;
  };

  function onEditorLoad(editorInstance: Ace.Editor) {
    editorInstance.resize();

    const savedCode = localStorage.getItem(LOCAL_STORAGE_EDITOR_CODE);
    if (savedCode) {
      editorInstance.setValue(savedCode, 1);
    }
  }

  function onEditorChange(value: string) {
    setEditorCode(value);
  }

  function onSave() {
    if (!playerName?.trim()) {
      setPlayerName(defaultPlayerName);
    }

    if (!editorCode.trim()) {
      setEditorCode(defaultEditorCode);
    }

    // save editor code and player name to local storage
    localStorage.setItem(LOCAL_STORAGE_PLAYER_NAME, playerName);
    localStorage.setItem(LOCAL_STORAGE_EDITOR_CODE, editorCode);
  }

  return <>{Content()}</>;
}

export default Editor;
