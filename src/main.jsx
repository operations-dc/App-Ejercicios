import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Fuentes locales (subconjunto latino: incluye tildes y ñ). Sin CDN.
import '@fontsource/black-ops-one/latin-400.css';
import '@fontsource/barlow-condensed/latin-400.css';
import '@fontsource/barlow-condensed/latin-500.css';
import '@fontsource/barlow-condensed/latin-600.css';
import '@fontsource/barlow-condensed/latin-700.css';
import './index.css';
import App from './App.jsx';
import { music } from './lib/music.js';

// Sonda de QA (solo con ?qa=1): estado de liberación de la música. No expone datos.
if (new URLSearchParams(location.search).has('qa')) window.__O28_QA__ = { music: () => ({ ...music.stats(), rolls: music.rolls || 0 }) };
window.addEventListener('pagehide', () => music.flush());

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
