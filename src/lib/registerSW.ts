export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        if (reg.active) {
          reg.active.postMessage({ type: 'CHECK_VERSION' });
        }
        reg.addEventListener('updatefound', () => {
          const installingWorker = reg.installing;
          if (installingWorker) {
            installingWorker.postMessage({ type: 'CHECK_VERSION' });
          }
        });
      }).catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
    });
  }
}
