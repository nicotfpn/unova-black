const {JSDOM}=require('jsdom'),fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),read=n=>fs.readFileSync(path.join(root,n),'utf8');
const tick=()=>new Promise(r=>setTimeout(r,10));
async function boot({unsupported=false,waiting=false,blocked=false}={}){
 const dom=new JSDOM(read('index.html'),{url:'https://example.test/index.html?game=black',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window,d=w.document,calls=[];
 const saves={'unova-black-field-guide-v2':JSON.stringify({caught:['Litwick'],badges:5}),'unova-black2-complete-1.12-v1':JSON.stringify({caught:['Eevee'],note:'keep'}),'sinnoh-platinum-field-guide-v1':JSON.stringify({caught:['Turtwig'],steps:['pt-starter']})};for(const [k,v]of Object.entries(saves))w.localStorage.setItem(k,v);
 const ids=['pokemon-black','pokemon-black2-complete-unova-1.12','pokemon-platinum'],installed=new Set();let fail=false;
 w.MessageChannel=class{constructor(){const port1={onmessage:null,close(){this.closed=true;}};this.port1=port1;this.port2={postMessage:data=>{if(!port1.closed)port1.onmessage?.({data});}};}};
 const registration={active:{postMessage(data,[port]){calls.push(data);queueMicrotask(()=>{
  if(data.type==='DOWNLOAD'){if(fail){port.postMessage({ok:false,error:'Sem espaço para este download.'});return;}port.postMessage({progress:{done:1,total:2}});installed.add(data.edition);}
  if(data.type==='REMOVE')installed.delete(data.edition);
  port.postMessage({ok:true,editions:ids.map(id=>({id,bytes:1000000,installed:installed.has(id)}))});
 });}},waiting:waiting?{}:null,installing:null,addEventListener(){}};
 if(!unsupported)Object.defineProperty(w.navigator,'serviceWorker',{value:{register:async()=>registration,ready:Promise.resolve(registration),addEventListener(){}}});
 if(blocked)Object.defineProperty(w,'localStorage',{get(){throw Error('denied');}});
 for(const file of ['core/game-registry.js','core/game-picker.js','offline.js'])vm.runInContext(read(file),dom.getInternalVMContext());
 await tick();return {dom,w,d,calls,saves,installed,set fail(v){fail=v;}};
}
(async()=>{
 const t=await boot(),{dom,w,d}=t;assert.ok(!t.calls.some(c=>c.type==='DOWNLOAD'));d.querySelector('.game-switch-mobile').click();const summary=d.querySelector('.game-offline'),content=d.querySelector('.game-offline-content');assert.equal(content.children.length,0);summary.open=true;summary.dispatchEvent(new w.Event('toggle'));await tick();assert.equal(d.querySelectorAll('[data-offline-action="DOWNLOAD"]').length,3);
 d.querySelector('[data-offline-edition="pokemon-platinum"]').click();await tick();assert.ok(t.installed.has('pokemon-platinum'));assert.equal(d.querySelector('[data-offline-edition="pokemon-platinum"]').dataset.offlineAction,'REMOVE');assert.match(d.querySelector('.offline-status').textContent,/Download concluído/);
 // Failure stays visible and permits retry instead of falsely reporting success.
 t.fail=true;d.querySelector('[data-offline-edition="pokemon-black"]').click();await tick();assert.match(d.querySelector('.offline-status').textContent,/Sem espaço/);assert.equal(d.querySelector('[data-offline-edition="pokemon-black"]').disabled,false);assert.ok(!t.installed.has('pokemon-black'));
 t.fail=false;d.querySelector('[data-offline-edition="pokemon-black"]').click();await tick();assert.ok(t.installed.has('pokemon-black'));d.querySelector('[data-offline-edition="pokemon-platinum"]').click();await tick();assert.ok(!t.installed.has('pokemon-platinum'));assert.ok(t.installed.has('pokemon-black'));assert.match(d.querySelector('.offline-status').textContent,/progresso foi mantido/);
 for(const [key,value] of Object.entries(t.saves))assert.equal(w.localStorage.getItem(key),value);
 d.querySelector('[data-game-close]').click();assert.equal(d.querySelector('.game-offline-content'),null);assert.equal(d.activeElement,d.querySelector('.game-switch-mobile'));await tick();dom.window.close();
 for(const options of [{unsupported:true},{waiting:true},{unsupported:true,blocked:true}]){
  const b=await boot(options);b.d.querySelector('.game-switch-mobile').click();const details=b.d.querySelector('.game-offline');details.open=true;details.dispatchEvent(new b.w.Event('toggle'));await tick();
  if(options.unsupported){assert.match(b.d.querySelector('.offline-status').textContent,/não oferece/);assert.equal(b.d.querySelectorAll('[data-offline-edition]').length,0);}else{assert.match(b.d.querySelector('.offline-status').textContent,/atualização/);assert.ok([...b.d.querySelectorAll('[data-offline-edition]')].every(e=>e.disabled));}
  b.d.querySelector('[data-game-close]').click();await tick();b.dom.window.close();
 }
 console.log('Edition offline UI: explicit downloads, retry, removal, preserved saves, pending update, unsupported/blocked storage and focus passed');
})().catch(e=>{console.error(e);process.exitCode=1;});
