// Routing Page

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
// stylesheet
import './index.css';
// components
import NewGame from './components/Game/NewGame.js';
import Home from './components/Home/Home';
import HowTo from './components/Home/HowTo';
import GameOver from './components/Game/GameOver.js';
  
const root = createRoot(document.getElementById('root'));
root.render(
  <div>
    <Router>
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route exact path="/how_to" element={<HowTo />} />
        <Route exact path="/game" element={<NewGame />} />
        <Route exact path="/game_over" element={ <GameOver />} />
      </Routes>
    </Router>
  </div>
);