import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './styles/app.css';
import App from './App.tsx';

// HashRouter: no server-side rewrites needed, so deep links (and the
// QR share links) resolve on static hosts like GitHub Pages.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
