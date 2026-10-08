/* Generated atomically from local assets. Regenerate after changing app or cloud config. */
const CACHE="unova-guide-1d8c6a1d6956",ASSETS=["/", "/index.html", "/style.css", "/planner.css", "/black2.html", "/platinum.html", "/packages/platinum/style.css", "/packages/platinum/map.svg", "/black2-walkthrough.css", "/black2-base.svg", "/unova-base.svg", "/manifest.webmanifest", "/apple-touch-icon.png", "/adventure-data.js", "/adventure.js", "/app.js", "/battle-guide.js", "/black2-adventure.js", "/black2-app.js", "/black2-bridge.js", "/black2-chapters.js", "/black2-data.js", "/black2-extra.js", "/black2-hack-data.js", "/black2-hack.js", "/black2-playing.js", "/cloud-config.js", "/cloud-sync.js", "/combat-data.js", "/data.js", "/dex.js", "/encounters.js", "/item-guide.js", "/items.js", "/map-data.js", "/national.js", "/offline.js", "/pokedex.js", "/pokemon-guide-data.js", "/progress-store.js", "/team-plan.js", "/walkthrough.js", "/icons/favicon-32.png", "/icons/icon-192.png", "/icons/icon-512.png", "/icons/unova.svg", "/core/encounter-queries.js", "/core/game-picker.js", "/core/game-registry.js", "/core/item-queries.js", "/packages/black/adapter.js", "/packages/black/encounters.js", "/packages/black2-complete/adapter.js", "/packages/black2-complete/encounters.js", "/packages/platinum/adapter.js", "/packages/platinum/app.js", "/packages/platinum/data.js", "/packages/platinum/encounters.js"];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS.map(url=>new Request(url,{cache:'reload'}))))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('unova-guide-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin||!ASSETS.includes(url.pathname))return;
 event.respondWith(caches.open(CACHE).then(async cache=>{
  const saved=await cache.match(url.pathname);if(saved)return saved;
  return fetch(event.request);
 }));
});
