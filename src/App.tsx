import './App.css';

import Editor from './components/Editor';
import DocsRules from './components/DocsRules';
import GameOffline from './components/GameOffline';
// import GameLive from './GameLive';
import PlayerSelect from './components/PlayerSelect';
import { Link, Navigate } from 'react-router-dom';

import { Route, Routes } from 'react-router-dom';

const navItems = [
  { path: '/editor', name: 'Editor' },
  { path: '/versus', name: 'Player Selection' },
  { path: '/game', name: 'Play Offline' },
  { path: '/live', name: 'Play Online' },
  { path: '/docs', name: 'Rules & Documentation' },
];

function App() {
  return (
    <>
      <nav>
        <div className="with-nav">
          <div className="navbar">
            {navItems.map((item, index) => (
              <Link to={item.path} key={index} className="nav-item">
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to={'editor'} />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/versus" element={<PlayerSelect />} />
        <Route path="/game" element={<GameOffline />} />
        {/* <Route path="/live" element={<GameLive />}/> */}
        <Route path="/docs" element={<DocsRules />} />
      </Routes>
    </>
  );
}

export default App;
