from pathlib import Path
import hashlib,json
root=Path(__file__).resolve().parent.parent
assets=['/','/index.html','/style.css','/planner.css','/black2.html','/platinum.html','/packages/platinum/style.css','/packages/platinum/map.svg','/black2-walkthrough.css','/black2-base.svg','/unova-base.svg','/manifest.webmanifest','/apple-touch-icon.png']+['/'+p.name for p in sorted(root.glob('*.js')) if p.name!='sw.js']+['/'+str(p.relative_to(root)) for p in sorted((root/'icons').glob('*'))]
assets += ['/'+str(p.relative_to(root)) for folder in ['core','packages'] for p in sorted((root/folder).rglob('*.js'))]
h=hashlib.sha256()
for url in assets:
 if url!='/':h.update((root/url.lstrip('/')).read_bytes())
cache='unova-guide-'+h.hexdigest()[:12]
(root/'sw.js').write_text('''/* Generated atomically from local assets. Regenerate after changing app or cloud config. */
const CACHE='''+json.dumps(cache)+''',ASSETS='''+json.dumps(assets)+''';
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
''')
print(cache,len(assets),'files')
