console.log('Service Worker script est en cours d\'analyse.'); // Ajout d'un log au début

const CACHE_NAME = 'sleep-tracker-cache-v1';
const urlsToCache = [
    '/index.html',
    '/manifest.json',
    '/service-worker.js'
    // Les icônes ont été retirées de la mise en cache initiale pour éviter les erreurs de chargement.
    // Elles seront chargées via le réseau si nécessaire.
    // '/icons/icon-192x192.png',
    // '/icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
    console.log('Service Worker: Événement "install" déclenché.'); // Log pour l'événement install
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Cache ouvert');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('Échec de la mise en cache lors de l\'installation:', error);
                // Tentative de journalisation plus détaillée de l'erreur
                console.error('Détails de l\'erreur (stringifié):', JSON.stringify(error, Object.getOwnPropertyNames(error)));
                if (error.name === 'NetworkError' || error.name === 'SecurityError') {
                    console.error('Vérifiez que tous les fichiers dans urlsToCache sont accessibles:', urlsToCache);
                }
            })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                // No cache hit - fetch from network
                return fetch(event.request);
            })
    );
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker: Événement "activate" déclenché.'); // Log pour l'événement activate
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        // Delete old caches
                        console.log('Service Worker: Suppression de l\'ancien cache:', cacheName); // Log pour la suppression
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
