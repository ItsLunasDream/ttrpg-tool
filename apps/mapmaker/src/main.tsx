import { createRoot } from 'react-dom/client';
import { App } from './ui/App';
import { ErrorBoundary } from './ui/ErrorBoundary';
import './styles.css';

const root = document.getElementById('root');
if (!root) throw new Error('#root fehlt in index.html');

// Ohne StrictMode: dessen doppelter Mount-Zyklus würde die Pixi-Bühne zweimal
// aufbauen und wieder zerstören, was den WebGL-Kontext unnötig neu anlegt.
createRoot(root).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);

if (import.meta.env.DEV) {
  void import('./devHarness').then((m) => m.installDevHarness());
}
