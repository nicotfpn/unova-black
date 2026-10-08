'use strict';
const PREFIX='unova-guide-pack-',STATE='unova-guide-offline-state-v1',READY='/__offline_ready__',PREFERRED='/__offline_preferred__';
const cacheName=id=>PREFIX+BUILD+'-'+id;
const knownPath=path=>Object.values(PACKS).some(p=>path in p.assets);
const legacyName=name=>/^unova-guide-[a-f0-9]{12}$/.test(name);
let operations=Promise.resolve();
function serialize(fn){const next=operations.then(fn);operations=next.catch(()=>{});return next;}
async function ready(name,id,complete=false){
 if(!(await caches.keys()).includes(name))return false;
 const cache=await caches.open(name),marker=await cache.match(READY);
 if(!marker)return false;
 try{const m=await marker.json();if(m.edition!==id||m.build!==BUILD)return false;}catch{return false;}
 if(complete)for(const path of Object.keys(PACKS[id].assets))if(!await cache.match(path))return false;
 return true;
}
async function digest(response){const buffer=await response.clone().arrayBuffer();return [...new Uint8Array(await crypto.subtle.digest('SHA-256',buffer))].map(b=>b.toString(16).padStart(2,'0')).join('');}
async function download(id,report=()=>{}){
 const pack=PACKS[id];if(!pack)throw Error('Edição desconhecida.');
 const name=cacheName(id);if(await ready(name,id,true))return;
 const previous=(await caches.keys()).filter(k=>k.startsWith(PREFIX)&&k.endsWith('-'+id)||legacyName(k));
 await caches.delete(name);const target=await caches.open(name);
 try{
  let done=0;const total=Object.keys(pack.assets).length;
  for(const [path,hash] of Object.entries(pack.assets)){
   let response;
   for(const old of previous.filter(k=>k!==name)){
    const candidate=await (await caches.open(old)).match(path);
    if(candidate&&candidate.ok&&await digest(candidate)===hash){response=candidate;break;}
   }
   if(!response){
    const abort=new AbortController(),timeout=setTimeout(()=>abort.abort(),30000);
    try{response=await fetch(new Request(new URL(path,self.location.origin),{cache:'no-store',signal:abort.signal}));}finally{clearTimeout(timeout);}
    if(!response.ok||await digest(response)!==hash)throw Error('O download foi interrompido ou há uma atualização em andamento. Tente novamente com conexão.');
   }
   await target.put(path,response);report({done:++done,total});
  }
  // This is the commit marker: partial downloads are never offered or served.
  await target.put(READY,new Response(JSON.stringify({edition:id,build:BUILD}),{headers:{'Content-Type':'application/json'}}));
 }catch(error){await caches.delete(name);if(error.name==='QuotaExceededError')throw Error('Sem espaço para este download. Remova outro jogo offline e tente novamente; seu progresso será mantido.');throw error;}
}
async function downloadedIds(){
 const keys=await caches.keys(),ids=new Set();
 for(const id of Object.keys(PACKS))for(const key of keys.filter(k=>k.startsWith(PREFIX)&&k.endsWith('-'+id))){
  const marker=await (await caches.open(key)).match(READY);if(marker){try{if((await marker.json()).edition===id)ids.add(id);}catch{}}
 }
 for(const key of keys.filter(legacyName)){const cache=await caches.open(key);for(const [id,pack] of Object.entries(PACKS))if(await cache.match(pack.entry))ids.add(id);}
 return [...ids];
}
async function status(){return {build:BUILD,editions:await Promise.all(Object.entries(PACKS).map(async([id,p])=>({id,bytes:p.bytes,installed:await ready(cacheName(id),id,true)})))};}
self.addEventListener('install',event=>event.waitUntil((async()=>{
 // Updates prepare only editions already downloaded. First install fetches no games.
 const ids=await downloadedIds();try{for(const id of ids)await download(id);}catch(error){for(const id of ids)await caches.delete(cacheName(id));throw error;}
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const keys=await caches.keys();
 for(const key of keys){
  if(legacyName(key)){const cache=await caches.open(key);let migrated=true;for(const [id,pack] of Object.entries(PACKS))if(await cache.match(pack.entry)&&!await ready(cacheName(id),id,true))migrated=false;if(migrated)await caches.delete(key);continue;}
  if(!key.startsWith(PREFIX)||key.startsWith(PREFIX+BUILD+'-'))continue;
  const id=Object.keys(PACKS).find(id=>key.endsWith('-'+id));
  if(id&&await ready(cacheName(id),id,true))await caches.delete(key);
 }
 // No forced takeover of open pages. Their old worker keeps its old files.
})()));
self.addEventListener('message',event=>{
 const port=event.ports?.[0],data=event.data;
 if(!port||!event.source?.url||new URL(event.source.url).origin!==self.location.origin)return;
 event.waitUntil(serialize(async()=>{
  try{
   if(!['STATUS','DOWNLOAD','REMOVE'].includes(data?.type))throw Error('Ação desconhecida.');
   if(data.type!=='STATUS'&&(self.registration.installing||self.registration.waiting))throw Error('Há uma atualização em preparação. Feche as abas do guia e abra novamente antes de alterar downloads.');
   if(data.type==='DOWNLOAD')await download(data.edition,p=>port.postMessage({progress:p}));
   if(data.type==='REMOVE'){
    if(!PACKS[data.edition])throw Error('Edição desconhecida.');
    for(const key of await caches.keys())if(key.startsWith(PREFIX)&&key.endsWith('-'+data.edition))await caches.delete(key);
   }
   if(PACKS[data.current])await (await caches.open(STATE)).put(PREFERRED,new Response(data.current));
   port.postMessage({ok:true,...await status()});
  }catch(error){port.postMessage({ok:false,error:error.message||'Não foi possível concluir o download. Tente novamente.'});}
 }));
});
const unavailable=()=>new Response('<!doctype html><html lang="pt-BR"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Guia offline</title><body><h1>Este jogo ainda não foi baixado</h1><p>Abra o guia com conexão e escolha Trocar jogo → Usar sem internet. Suas capturas e notas continuam salvas neste aparelho.</p><p><a href="/">Abrir um jogo baixado</a></p></body></html>',{status:503,headers:{'Content-Type':'text/html; charset=utf-8'}});
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin||(!knownPath(url.pathname)&&url.pathname!=='/'))return;
 event.respondWith((async()=>{
  const isRoot=url.pathname==='/'||url.pathname==='/index.html',explicitBlack=url.searchParams.get('game')==='black';
  let preferred='';
  // Explicit game links always preserve the edition, including while offline.
  let ids=Object.keys(PACKS).filter(id=>url.pathname===PACKS[id].entry||url.pathname in PACKS[id].assets);
  if(isRoot){
   if((await caches.keys()).includes(STATE))preferred=await (await (await caches.open(STATE)).match(PREFERRED))?.text()||'';
   ids=explicitBlack?['pokemon-black']:[preferred,...Object.keys(PACKS)].filter((id,i,a)=>PACKS[id]&&a.indexOf(id)===i);
  }
  if(isRoot&&!explicitBlack&&!await ready(cacheName(ids[0]),ids[0])&&PACKS['pokemon-black']){
   // The entry page reads last-game preference. Prefer it online when Black is
   // not downloaded; offline, open a complete saved edition instead.
   try{const response=await fetch(event.request);if(response.ok&&await digest(response)===PACKS['pokemon-black'].assets['/index.html'])return response;}catch{}
  }
  for(const id of ids)if(await ready(cacheName(id),id)){
   const cache=await caches.open(cacheName(id)),response=await cache.match(isRoot?PACKS[id].entry:url.pathname);
   if(response)return response;
   // Never fill a missing part of a committed pack from a different build.
   return isRoot||event.request.mode==='navigate'?unavailable():new Response('Download offline incompleto. Baixe este jogo novamente.',{status:503});
  }
  try{
   const response=await fetch(event.request),path=url.pathname==='/'?'/index.html':url.pathname;
   const hash=Object.values(PACKS).find(p=>path in p.assets)?.assets[path];
   if(response.ok&&hash&&await digest(response)===hash)return response;
   return isRoot||event.request.mode==='navigate'?unavailable():new Response('Atualização em andamento. Feche as abas do guia e abra novamente.',{status:503});
  }catch{return isRoot||event.request.mode==='navigate'?unavailable():new Response('Arquivo não disponível offline.',{status:503});}
 })());
});
