const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const source=fs.readFileSync(require('node:path').join(__dirname,'../progress-store.js'),'utf8');
const key='unova-black-field-guide-v2';
function browser({local=new Map(),records=new Map(),blockLocal=false,blockDB=false}={}) {
  const events={},statuses=[];
  const window={
    localStorage:{getItem(k){if(blockLocal)throw Error('blocked');return local.get(k)||null;},setItem(k,v){if(blockLocal)throw Error('blocked');local.set(k,v);},removeItem(k){local.delete(k);}},
    indexedDB:{open(){const request={};setImmediate(()=>{
      if(blockDB){request.onerror();return;}
      request.result={objectStoreNames:{contains:()=>true},close(){},transaction(){
        const tx={};
        tx.objectStore=()=>({get(k){const req={};setImmediate(()=>{req.result=records.get(k);tx.oncomplete();});return req;},put(value,k){const req={};setImmediate(()=>{records.set(k,structuredClone(value));tx.oncomplete();});return req;}});
        return tx;
      }};request.onsuccess();
    });return request;}},
    navigator:{storage:{persist:async()=>true}},
    document:{visibilityState:'visible',addEventListener(name,fn){events[name]=fn;}},
    addEventListener(name,fn){events[name]=fn;}
  };
  vm.runInNewContext(source,{window,setTimeout,clearTimeout,Date});
  const normalize=v=>({caught:[...(v.caught||[])],badges:v.badges||0,...(Array.isArray(v.collectedItems)?{collectedItems:[...v.collectedItems]}:{})});
  const store=window.createProgressStore({key,normalize,onStatus:v=>statuses.push(v),onExternal:v=>events.external=v});
  return {store,local,records,statuses,events,window};
}
test('capture and badges survive closing and reopening the page',async()=>{
  const first=browser();await first.store.load();await first.store.save({caught:['Patrat'],badges:3});
  const second=browser(first);assert.deepEqual(await second.store.load(),{caught:['Patrat'],badges:3});
});
test('existing progress is migrated without resetting it',async()=>{
  const local=new Map([[key,JSON.stringify({caught:['Snivy'],badges:2})]]);
  const b=browser({local});assert.deepEqual(await b.store.load(),{caught:['Snivy'],badges:2});assert.equal(b.records.get(key).caught[0],'Snivy');
});
test('IndexedDB restores the journey if the localStorage record disappears',async()=>{
  const b=browser();await b.store.load();await b.store.save({caught:['Audino'],badges:4});b.local.clear();
  const reopened=browser(b);assert.deepEqual(await reopened.store.load(),{caught:['Audino'],badges:4});assert.ok(reopened.local.has(key));
});
test('localStorage failure still saves and restores with IndexedDB',async()=>{
  const b=browser({blockLocal:true});await b.store.load();assert.equal(await b.store.save({caught:['Lillipup'],badges:1}),true);
  const reopened=browser({records:b.records,blockLocal:true});assert.deepEqual(await reopened.store.load(),{caught:['Lillipup'],badges:1});
});
test('IndexedDB failure still saves with localStorage',async()=>{
  const b=browser({blockDB:true});await b.store.load();assert.equal(await b.store.save({caught:['Patrat'],badges:1}),true);
  const reopened=browser({local:b.local,blockDB:true});assert.deepEqual(await reopened.store.load(),{caught:['Patrat'],badges:1});
});
test('both stores failing shows an error instead of claiming success',async()=>{
  const b=browser({blockDB:true,blockLocal:true});await b.store.load();assert.equal(await b.store.save({caught:['Patrat']}),false);assert.equal(b.statuses.at(-1).state,'error');
});
test('newest recovery copy wins and rapid changes remain ordered',async()=>{
  const b=browser();await b.store.load();await Promise.all([b.store.save({caught:['Patrat']}),b.store.save({caught:['Patrat','Audino']})]);
  b.local.set(key,JSON.stringify({caught:[],_savedAt:1}));
  const reopened=browser(b);assert.deepEqual((await reopened.store.load()).caught,['Patrat','Audino']);
});
test('corrupt local record is recovered from the second store',async()=>{
  const b=browser();await b.store.load();await b.store.save({caught:['Patrat']});b.local.set(key,'invalid json');
  assert.deepEqual((await browser(b).store.load()).caught,['Patrat']);
});
test('backgrounding an old tab does not overwrite newer captures',async()=>{
  const b=browser();await b.store.load();await b.store.save({caught:['Patrat']});
  const newer={caught:['Patrat','Audino'],badges:2,_savedAt:Date.now()+1000};
  b.local.set(key,JSON.stringify(newer));
  b.window.document.visibilityState='hidden';b.events.visibilitychange();
  assert.deepEqual(JSON.parse(b.local.get(key)).caught,['Patrat','Audino']);
});
test('startup reads changes made while opening the recovery database',async()=>{
  const local=new Map([[key,JSON.stringify({caught:['Patrat'],_savedAt:1})]]);
  const b=browser({local});const pending=b.store.load();
  local.set(key,JSON.stringify({caught:['Patrat','Audino'],badges:2,_savedAt:2}));
  assert.deepEqual((await pending).caught,['Patrat','Audino']);
});
test('resuming a suspended tab refreshes its journey before the next edit',async()=>{
  const b=browser();await b.store.load();await b.store.save({caught:['Patrat']});
  b.local.set(key,JSON.stringify({caught:['Patrat','Audino'],badges:2,_savedAt:Date.now()+1000}));
  b.window.document.visibilityState='visible';b.events.visibilitychange();
  assert.deepEqual(b.events.external.caught,['Patrat','Audino']);
});

test('item checkmarks and Pokemon captures survive reopening together',async()=>{
  const first=browser();
  await first.store.load();
  await first.store.save({caught:['Litwick'],badges:5,collectedItems:['TM61','HM01']});
  const next=browser({local:first.local,records:first.records});
  const restored=await next.store.load();
  assert.deepEqual([...restored.caught],['Litwick']);
  assert.deepEqual([...restored.collectedItems],['TM61','HM01']);
});
