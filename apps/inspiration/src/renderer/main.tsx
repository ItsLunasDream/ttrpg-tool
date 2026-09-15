import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import '@suite/motion/motion.css';
import './styles.css';

const wurzel = document.getElementById('root');
if (!wurzel) throw new Error('#root fehlt in index.html');

createRoot(wurzel).render(
  <StrictMode>
    <App />
  </StrictMode>
);

