import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global automatic cache-clearing to prevent old service workers or cached pages from intercepting API calls
if (typeof window !== 'undefined') {
  const CURRENT_VERSION = 'v5'; // Bump version to force clear old caches

  const storedVersion = localStorage.getItem('app_cache_version');
  if (storedVersion !== CURRENT_VERSION) {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        let unregistered = false;
        for (const registration of registrations) {
          registration.unregister();
          unregistered = true;
        }
        if (typeof caches !== 'undefined') {
          caches.keys().then((names) => {
            for (const name of names) {
              caches.delete(name);
            }
          });
        }
        localStorage.setItem('app_cache_version', CURRENT_VERSION);
        if (unregistered) {
          window.location.reload();
        }
      });
    } else {
      localStorage.setItem('app_cache_version', CURRENT_VERSION);
    }
  }
}

// Register Service Worker for PWA installation support
if ('serviceWorker' in navigator) {
  // If visiting a policyholder portal route, force unregister any service worker and clear caches to prevent old cached agent routes from intercepting
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/portal')) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      let activeRegistration = false;
      for (const registration of registrations) {
        registration.unregister();
        activeRegistration = true;
      }
      if (typeof caches !== 'undefined') {
        caches.keys().then((names) => {
          for (const name of names) {
            caches.delete(name);
          }
        });
      }
      // If we unregistered an active service worker, reload to get fresh network assets
      if (activeRegistration) {
        window.location.reload();
      }
    });
  } else {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('🟢 PWA Service Worker Registered Successfully:', reg.scope);
        })
        .catch((err) => console.warn('⚠️ PWA Service Worker Registration Failed:', err));
    });
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
