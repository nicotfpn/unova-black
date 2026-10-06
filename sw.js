/* Generated atomically from local assets. Regenerate after changing app or cloud config. */
const CACHE="unova-guide-b309b076ab8e",ASSETS=["/", "/index.html", "/style.css", "/planner.css", "/black2.html", "/black2.css", "/black2-base.svg", "/unova-base.svg", "/manifest.webmanifest", "/apple-touch-icon.png", "/adventure-data.js", "/adventure.js", "/app.js", "/battle-guide.js", "/black2-chapters.js", "/black2-data.js", "/black2-extra.js", "/black2-hack-data.js", "/black2-hack.js", "/black2.js", "/cloud-config.js", "/cloud-sync.js", "/combat-data.js", "/data.js", "/dex.js", "/encounters.js", "/item-guide.js", "/items.js", "/map-data.js", "/national.js", "/offline.js", "/pokedex.js", "/pokemon-guide-data.js", "/progress-store.js", "/team-plan.js", "/walkthrough.js", "/icons/favicon-32.png", "/icons/icon-192.png", "/icons/icon-512.png", "/icons/unova.svg"];
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
