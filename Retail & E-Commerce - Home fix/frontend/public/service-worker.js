const CACHE_NAME = 'homefix-pro-v2';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/images/homefix-pro-icon.svg',
  '/images/homefix-pro-logo.svg',
  '/images/sector-tailoring.svg',
  '/images/sector-laundry.svg',
  '/images/sector-plumbing.svg',
  '/images/sector-electrical.svg',
  '/images/sector-carpentry.svg',
  '/images/sector-daily-labour.svg',
  '/images/sector-construction-labour.svg',
  '/images/sector-cleaning.svg',
  '/images/sector-ac-repair.svg',
  '/images/sector-painting.svg',
  '/images/sector-appliance-repair.svg',
  '/images/sector-pest-control.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then((cached) => cached || caches.match('/'))));
});
