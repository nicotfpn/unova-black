const {JSDOM}=require('jsdom'),fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
(async()=>{
 const black='unova-black-field-guide-v2',hack='unova-black2-complete-1.12-v1';
 const shared={
  [black]:JSON.stringify({caught:['Litwick'],badges:2,notes:{nu:'Nota de Black'},playNote:'Continuar Black'}),
  [hack]:JSON.stringify({caught:['Eevee'],badges:3,steps:['c01-s1'],items:['Route 16|Dawn Stone'],note:'Continuar a hack',chapter:5})
 };
 for(const [page,key,other,species]of [['index.html',black,hack,'Litwick'],['black2.html',hack,black,'Eevee'],['index.html',black,hack,'Litwick'],['black2.html',hack,black,'Eevee']]){
  const untouched=shared[other],dom=new JSDOM(fs.readFileSync(path.join(root,page),'utf8'),{url:'https://unova-black.vercel.app/'+page,runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window,d=w.document,errors=[];
  w.matchMedia=()=>({matches:true});w.scrollTo=()=>{};w.HTMLElement.prototype.scrollTo=()=>{};
  w.addEventListener('error',e=>errors.push(e.message));
  for(const [k,v]of Object.entries(shared))w.localStorage.setItem(k,v);
  for(const el of d.querySelectorAll('script[src]'))vm.runInContext(fs.readFileSync(path.join(root,el.getAttribute('src')),'utf8'),dom.getInternalVMContext());
  await new Promise(r=>setTimeout(r,80));
  assert.ok(JSON.parse(w.localStorage.getItem(key)).caught.includes(species));
  const control=d.querySelector('#badge-count');control.value='4';control.dispatchEvent(new w.Event('change',{bubbles:true}));
  assert.equal(w.localStorage.getItem(other),untouched,'other edition was overwritten');
  shared[key]=w.localStorage.getItem(key);
  assert.equal(JSON.parse(shared[key]).badges,4);
  assert.equal(d.querySelector('#dex-list').childElementCount,0);
  d.querySelector('[data-view=dex]').click();assert.ok(d.querySelectorAll('.dex-entry').length>100);
  d.querySelector('[data-view=map]').click();assert.equal(d.querySelector('#dex-list').childElementCount,0);
  if(page==='black2.html')assert.equal(d.querySelector('[data-view=team]'),null);
  assert.deepEqual(errors,[]);dom.window.close();
 }
 assert.equal(JSON.parse(shared[black]).notes.nu,'Nota de Black');
 assert.equal(JSON.parse(shared[hack]).playNote,'Continuar a hack');
 assert.ok(JSON.parse(shared[hack]).steps.includes('c01-s1'));
 console.log('Game packages: shared-origin switching, legacy hack record, automatic saves and reopening preserve both journeys');
})().catch(e=>{console.error(e);process.exit(1)});
