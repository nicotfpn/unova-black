const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),{webcrypto,createHash}=require('node:crypto');
const root=path.join(__dirname,'..'),read=n=>fs.readFileSync(path.join(root,n),'utf8'),origin='https://unova-black.vercel.app',black='pokemon-black',hack='pokemon-black2-complete-unova-1.12',platinum='pokemon-platinum';
function storage(){
 const data=new Map();let failPut=null;
 const key=r=>new URL(typeof r==='string'?r:r.url,origin).pathname;
 return {data,set failPut(fn){failPut=fn;},async keys(){return [...data.keys()];},async delete(n){return data.delete(n);},async open(n){if(!data.has(n))data.set(n,new Map());const map=data.get(n);return {async match(r){return map.get(key(r))?.clone();},async put(r,response){if(failPut?.(n,key(r)))throw Object.assign(Error('quota'),{name:'QuotaExceededError'});map.set(key(r),response.clone());},async delete(r){return map.delete(key(r));}};}};
}
function boot({caches=storage(),build,overrides={}}={}){
 const handlers={},requests=[],registration={installing:null,waiting:null};let disconnected=false,failPath='';
 const source=build?read('sw.js').replace(/BUILD="[^"]+"/,'BUILD="'+build+'"'):read('sw.js');
 const c=vm.createContext({self:{addEventListener:(name,fn)=>handlers[name]=fn,location:{origin},registration},caches,crypto:webcrypto,URL,Request,Response,AbortController,setTimeout,clearTimeout,fetch:async r=>{
  const p=new URL(typeof r==='string'?r:r.url,origin).pathname;requests.push(p);if(disconnected||p===failPath)throw Error('offline');const file=p==='/'?'index.html':p.slice(1);return new Response(overrides[p]??fs.readFileSync(path.join(root,file)));}});
 vm.runInContext(source+';this.packs=PACKS;this.build=BUILD;this.name=cacheName;',c);
 async function lifecycle(name){let promise;handlers[name]({waitUntil:p=>{promise=p;}});return await promise;}
 async function message(type,edition,current=black){let promise,result,progress=[];handlers.message({data:{type,edition,current},source:{url:origin+'/index.html'},ports:[{postMessage:r=>{if(r.progress)progress.push(r.progress);else result=r;}}],waitUntil:p=>{promise=p;}});await promise;return {result,progress};}
 async function get(p,mode='navigate'){let promise;handlers.fetch({request:{url:p.startsWith('http')?p:origin+p,method:'GET',mode},respondWith:p=>{promise=p;}});return promise?await promise:null;}
 return {c,caches,requests,registration,lifecycle,message,get,set disconnected(v){disconnected=v;},set failPath(v){failPath=v;}};
}
test('each edition manifest includes its full page dependencies and excludes other game payloads',()=>{
 const {c}=boot();for(const [id,p] of Object.entries(c.packs)){
  const html=read(p.entry.slice(1));for(const [,url] of html.matchAll(/(?:<script src|<link rel="stylesheet" href)="([^"]+)"/g))assert.ok(p.assets['/'+url],id+': '+url);
  for(const [url,hash] of Object.entries(p.assets)){assert.ok(fs.existsSync(path.join(root,url)));assert.equal(createHash('sha256').update(fs.readFileSync(path.join(root,url))).digest('hex'),hash);}
  assert.ok(p.bytes>0);
 }
 assert.equal(c.packs[black].assets['/packages/platinum/data.js'],undefined);assert.equal(c.packs[platinum].assets['/data.js'],undefined);assert.equal(c.packs[hack].assets['/combat-data.js'],undefined);
});
test('fresh worker downloads nothing until selected, then a complete edition works offline',async()=>{
 const w=boot();await w.lifecycle('install');await w.lifecycle('activate');assert.equal(w.requests.length,0);
 const {result,progress}=await w.message('DOWNLOAD',platinum,platinum);assert.equal(result.ok,true);assert.equal(result.editions.find(e=>e.id===platinum).installed,true);assert.equal(result.editions.find(e=>e.id===black).installed,false);assert.equal(progress.length,Object.keys(w.c.packs[platinum].assets).length);
 w.disconnected=true;assert.equal((await w.get('/platinum.html')).status,200);assert.match(await (await w.get('/')).text(),/data-edition="pokemon-platinum"/);
 assert.equal((await w.get('/index.html?game=black')).status,503);assert.equal(await w.get('/private/unknown'),null);
 assert.equal(await w.get('https://example.supabase.co/rest/v1/journeys','cors'),null);
});
test('interrupted and changed-content downloads roll back, report failure and can be retried',async()=>{
 const w=boot();await w.message('DOWNLOAD',black);w.failPath='/packages/platinum/data.js';const bad=await w.message('DOWNLOAD',platinum);assert.equal(bad.result.ok,false);assert.equal(w.caches.data.has(w.c.name(platinum)),false);assert.equal((await w.message('STATUS')).result.editions.find(e=>e.id===black).installed,true);
 w.failPath='';assert.equal((await w.message('DOWNLOAD',platinum)).result.ok,true);
 const changed=boot({overrides:{'/packages/platinum/data.js':'wrong revision'}});assert.equal((await changed.message('DOWNLOAD',platinum)).result.ok,false);assert.equal(changed.caches.data.has(changed.c.name(platinum)),false);
});
test('storage exhaustion leaves downloaded editions intact and a retry can complete',async()=>{
 const w=boot();await w.message('DOWNLOAD',black);w.caches.failPut=(name,p)=>name===w.c.name(platinum)&&p==='/packages/platinum/data.js';const r=await w.message('DOWNLOAD',platinum);assert.equal(r.result.ok,false);assert.match(r.result.error,/Sem espaço/);assert.equal((await w.message('STATUS')).result.editions.find(e=>e.id===black).installed,true);
 w.caches.failPut=null;assert.equal((await w.message('DOWNLOAD',platinum)).result.ok,true);
});
test('removing one edition preserves other downloads and unrelated caches',async()=>{
 const w=boot();await w.message('DOWNLOAD',black);await w.message('DOWNLOAD',platinum);await (await w.caches.open('other-app')).put('/keep',new Response('keep'));
 assert.equal((await w.message('REMOVE',platinum)).result.ok,true);assert.equal(w.caches.data.has(w.c.name(platinum)),false);assert.equal((await w.message('STATUS')).result.editions.find(e=>e.id===black).installed,true);assert.ok(w.caches.data.has('other-app'));
 assert.equal((await w.message('DOWNLOAD','future')).result.ok,false);assert.equal((await w.message('REMOVE','future')).result.ok,false);
});
test('an update stages selected editions, keeps the old worker coherent and rolls back on failure',async()=>{
 const old=boot();await old.message('DOWNLOAD',black);await old.message('DOWNLOAD',platinum);const newBody='new app revision',hash=createHash('sha256').update(newBody).digest('hex');
 const next=boot({caches:old.caches,build:'test-next',overrides:{'/app.js':newBody}});next.c.packs[black].assets['/app.js']=hash;next.failPath='/packages/platinum/data.js';
 // Force one new Platinum asset, so that it cannot be reused from the old cache.
 next.c.packs[platinum].assets['/packages/platinum/data.js']='changed';
 await assert.rejects(next.lifecycle('install'));assert.equal(old.caches.data.has(old.c.name(black)),true);assert.equal(old.caches.data.has(next.c.name(black)),false);old.disconnected=true;assert.equal(await (await old.get('/app.js','cors')).text(),read('app.js'));
 next.failPath='';next.c.packs[platinum].assets['/packages/platinum/data.js']=old.c.packs[platinum].assets['/packages/platinum/data.js'];await next.lifecycle('install');assert.ok(old.caches.data.has(old.c.name(black)));assert.equal((await next.message('STATUS')).result.editions.filter(e=>e.installed).length,2);assert.ok(!next.requests.includes('/black2.html'));
 await next.lifecycle('activate');assert.equal(old.caches.data.has(old.c.name(black)),false);assert.equal(await (await next.get('/app.js','cors')).text(),newBody);
});
test('waiting updates prevent racing changes and legacy caches migrate before removal',async()=>{
 const old=boot();old.registration.waiting={};assert.equal((await old.message('DOWNLOAD',black)).result.ok,false);assert.equal((await old.message('REMOVE',black)).result.ok,false);
 const legacy=await old.caches.open('unova-guide-123456abcdef');for(const url of Object.keys(old.c.packs[black].assets))await legacy.put(url,new Response(fs.readFileSync(path.join(root,url))));
 await old.caches.open('unova-guide-abcdef123456');await old.caches.open('unrelated');
 old.registration.waiting=null;await old.lifecycle('install');assert.equal((await old.message('STATUS')).result.editions.filter(e=>e.installed).length,1);assert.ok(old.caches.data.has('unova-guide-123456abcdef'));await old.lifecycle('activate');assert.equal(old.caches.data.has('unova-guide-123456abcdef'),false);assert.ok(old.caches.data.has('unrelated'));
 assert.doesNotMatch(read('sw.js'),/skipWaiting\s*\(|clients\.claim\s*\(/);
});
test('missing assets never silently combine a saved pack with new network files',async()=>{
 const w=boot();await w.message('DOWNLOAD',platinum);const cache=await w.caches.open(w.c.name(platinum));await cache.delete('/packages/platinum/data.js');const result=(await w.message('STATUS')).result;assert.equal(result.editions.find(e=>e.id===platinum).installed,false);
 assert.equal((await w.get('/packages/platinum/data.js','cors')).status,503);assert.equal((await w.message('DOWNLOAD',platinum)).result.ok,true);
});
