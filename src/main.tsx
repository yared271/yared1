import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register official PWA service worker immediately for Chrome installability and offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('CBE PWA Service Worker registered:', registration.scope);
      })
      .catch((err) => {
        console.warn('CBE PWA Service Worker registration error:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
