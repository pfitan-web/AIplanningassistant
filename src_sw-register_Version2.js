if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service worker registered:', reg);
    } catch (err) {
      console.warn('Service worker registration failed:', err);
    }
  });
}

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Affiche ton bouton custom d'installation ici, par ex:
  // document.getElementById('install-btn').style.display = 'block';
});

async function promptInstall() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  console.log('User install choice:', choice);
  deferredPrompt = null;
}

window.addEventListener('appinstalled', () => {
  console.log('PWA installed');
});