import '@fontsource-variable/inter';
import '@fontsource-variable/bricolage-grotesque';
import 'maplibre-gl/dist/maplibre-gl.css';
import './styles/app.css';
import './styles/screens.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { registerSW } from 'virtual:pwa-register';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Service worker: offline app shell + map tile cache. Auto-updates in the background.
if ('serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onRegisteredSW(_url, reg) {
      if (reg) setInterval(() => reg.update().catch(() => {}), 30 * 60_000);
    },
  });
}
