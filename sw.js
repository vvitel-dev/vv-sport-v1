const CACHE_NAME='vv-sport-exercises-profile-timer-v69-plan-added-count';
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
  const url=new URL(e.request.url);
  const freshAsset=url.pathname.endsWith('/app.js') || url.pathname.endsWith('/styles.css') || url.pathname.endsWith('/index.html') || e.request.mode==='navigate';
  if(freshAsset){
    e.respondWith(
      fetch(e.request).then(response=>{
        const copy=response.clone();
        caches.open(CACHE_NAME).then(cache=>cache.put(e.request,copy));
        return response;
      }).catch(()=>caches.match(e.request).then(cached=>cached||caches.match('./index.html')))
    );
    return;
  }
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
