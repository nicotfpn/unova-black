const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
function context(){const c=vm.createContext({});vm.runInContext(read('core/game-registry.js'),c);return c;}
test('metadata distinguishes official Black from the exact hack edition and preserves storage identities',()=>{
 const c=context(),list=c.GameRegistry.list();
 assert.equal(new Set(list.map(e=>e.id)).size,list.length);
 assert.equal(new Set(list.map(e=>e.progress.key)).size,list.length);
 assert.equal(c.GameRegistry.get('pokemon-black').progress.key,'unova-black-field-guide-v2');
 const hack=c.GameRegistry.get('pokemon-black2-complete-unova-1.12');
 assert.equal(hack.progress.key,'unova-black2-complete-1.12-v1');assert.equal(hack.kind,'hack');
 assert.equal(hack.hack.version,'1.12');assert.equal(hack.hack.baseGameId,'black-2');
 assert.equal(hack.coverage.battles,'advice-only');assert.equal(hack.audit.contentVerification,'partial');
 assert.equal(c.GameRegistry.get('pokemon-black').kind,'official');
 for(const e of list){assert.ok(fs.existsSync(path.join(root,e.entry.split('?')[0])));assert.ok(fs.existsSync(path.join(root,e.adapter)));assert.ok(Object.isFrozen(e.coverage));}
 assert.throws(()=>c.GameRegistry.open(hack.id),/não carregado/);
 assert.throws(()=>c.GameRegistry.get('black-2'),/desconhecida/);
});
test('each legacy page exposes only its own adapter and opening a package never reapplies the hack',()=>{
 for(const [page,id,other] of [['index.html','pokemon-black','pokemon-black2-complete-unova-1.12'],['black2.html','pokemon-black2-complete-unova-1.12','pokemon-black']]){
  const c=vm.createContext({console});c.window=c;
  // Only data and compatibility scripts: the app/UI is tested by DOM suites.
  for(const [,src]of read(page).matchAll(/<script src="([^"]+)"/g)){
   if(['app.js','black2-app.js','offline.js','core/game-picker.js'].includes(src))continue;
   vm.runInContext(read(src),c,{filename:src});
   if(src==='core/game-registry.js')c.GameRegistry=c.window.GameRegistry;
  }
  const registry=c.window.GameRegistry,a=registry.open(id),b=registry.open(id);
  assert.equal(a.areas,b.areas);assert.equal(a.encounters,b.encounters);assert.equal(a.items,b.items);
  assert.ok(Object.isFrozen(a));assert.throws(()=>registry.open(other),/não carregado/);
  assert.ok(vm.runInContext('rawAreas',c)===a.areas);
  if(page==='black2.html'){
   const before=vm.runInContext('JSON.stringify(black2Data)',c);
   registry.open(id);assert.equal(vm.runInContext('JSON.stringify(black2Data)',c),before);
   assert.equal(vm.runInContext('Black2Bridge.map',c),a.map);
  }
 }
});
test('registry rejects duplicate and malformed adapters without touching persistent storage',()=>{
 const c=context(),r=c.GameRegistry,id='pokemon-black';
 r.register(id,()=>({}));assert.throws(()=>r.open(id),/incompatível/);
 assert.throws(()=>r.register(id,()=>({})),/duplicado/);
 assert.throws(()=>r.register('missing',()=>({})),/desconhecida/);
 assert.throws(()=>r.register('pokemon-black2-complete-unova-1.12',null),/inválido/);
});
