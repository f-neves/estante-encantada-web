import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Fredoka local (sem CDN): peso 500 para rótulos, 700 para títulos. Só os
// subconjuntos latinos, senão viriam também hebraico e cirílico sem uso.
import '@fontsource/fredoka/latin-500.css';
import '@fontsource/fredoka/latin-700.css';
import '@fontsource/fredoka/latin-ext-500.css';
import '@fontsource/fredoka/latin-ext-700.css';

import './styles/reset.css';
import './styles/tokens.css';
import './styles/ui.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Elemento #root não encontrado no index.html');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
