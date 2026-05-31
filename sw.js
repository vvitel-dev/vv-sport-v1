const CACHE_NAME='vv-sport-exercises-profile-timer-v16';
const ASSETS=[
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './icon-192.svg',
  './icon-512.svg',
  './sound-start-premium-v3.wav',
  './sound-count-premium-v3.wav',
  './sound-rest-premium-v3.wav',
  './sound-done-premium-v3.wav'
];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('message',e=>{if(e.data&&e.data.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(
    caches.match(e.request).then(cached=>{
      if(cached)return cached;
      return fetch(e.request).catch(()=>{
        if(e.request.mode==='navigate')return caches.match('./index.html');
        return Response.error();
      });
    })
  );
});
