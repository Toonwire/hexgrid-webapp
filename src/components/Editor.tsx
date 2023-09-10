import { useEffect, useState } from 'react';
import AceEditor from 'react-ace';
import { Navigate } from 'react-router-dom';

import '../styles/Editor.css';
import WithSidebar from './Sidebar';

import { Ace } from 'ace-builds';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-twilight';

import {
  DEFAULT_EDITOR_CODE,
  DEFAULT_PLAYER_NAME,
  LOCAL_STORAGE_EDITOR_CODE,
  LOCAL_STORAGE_PLAYER_NAME,
} from '../constants';

function Editor() {
  const [playerName, setPlayerName] = useState('');
  const [redirect, setRedirect] = useState('');
  const [editorCode, setEditorCode] = useState(DEFAULT_EDITOR_CODE);

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
    <span key={4} className="sidebar-item interactable" onClick={() => setEditorCode(DEFAULT_EDITOR_CODE)}>
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
      setPlayerName(DEFAULT_PLAYER_NAME);
    }

    if (!editorCode.trim()) {
      setEditorCode(DEFAULT_EDITOR_CODE);
    }

    // save editor code and player name to local storage
    localStorage.setItem(LOCAL_STORAGE_PLAYER_NAME, playerName);
    localStorage.setItem(LOCAL_STORAGE_EDITOR_CODE, editorCode);
  }

  return <>{Content()}</>;
}

export default Editor;
