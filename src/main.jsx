import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker for offline support
registerSW({
  immediate: true,
  onOfflineReady() {
    console.log('ElectionOps PWA ready to work offline');
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
