import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';

import DocsRules from './components/DocsRules';
import GameOffline from './components/GameOffline';
// import GameLive from './GameLive';
import Editor from './components/Editor';
import PlayerSelect from './components/PlayerSelect';

import { useEffect } from 'react';
import './App.css';

const navItems = [
  { path: '/editor', name: 'Editor' },
  { path: '/versus', name: 'Player Selection' },
  { path: '/game', name: 'Play Offline' },
  { path: '/live', name: 'Play Online' },
  { path: '/docs', name: 'Rules & Documentation' },
];

function App() {
  const location = useLocation();

  useEffect(() => {
    const subTitle = navItems.find((item) => item.path === location.pathname)?.name;
    if (subTitle) {
      document.title = `${import.meta.env.VITE_DOCUMENT_TITLE} - ${subTitle}`;
    }
  }, [location]);

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
