const {JSDOM}=require('jsdom'),fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),key='unova-black2-complete-1.12-v1';
async function boot(saved){
 const dom=new JSDOM(read('black2.html'),{url:'https://unova-black.vercel.app/black2.html',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window,errors=[];
 w.matchMedia=()=>({matches:true});w.scrollTo=()=>{};w.HTMLElement.prototype.scrollTo=()=>{};w.SVGElement.prototype.getBoundingClientRect=()=>({width:1120,height:706,left:0,top:0});
 w.addEventListener('error',e=>errors.push(e.message));if(saved)w.localStorage.setItem(key,saved);
 for(const el of w.document.querySelectorAll('script[src]'))vm.runInContext(read(el.getAttribute('src')),dom.getInternalVMContext());
 await new Promise(r=>setTimeout(r,60));return {dom,w,d:w.document,errors};
}
(async()=>{
 const old={caught:['Eevee'],steps:['c01-s1'],items:['Route 16|Dawn Stone'],chapter:5,note:'Meu lembrete antigo'};
 let {dom,w,d,errors}=await boot(JSON.stringify(old));
 assert.equal(d.querySelectorAll('.view-tab').length,4);assert.ok(!d.querySelector('[data-view=team]'));
 assert.ok(d.querySelector('#map .node[data-id=asp]'));assert.ok(d.querySelector('#map-viewport'));assert.ok(d.querySelector('#mini-map'));
 const change=el=>el.dispatchEvent(new w.Event('change',{bubbles:true}));
 d.querySelector('#badge-count').value='8';change(d.querySelector('#badge-count'));
 d.querySelector('#league-toggle').checked=true;change(d.querySelector('#league-toggle'));
 d.querySelector('#results-list [data-id=r16]').click();assert.ok(d.querySelector('#detail').classList.contains('open'));
 assert.ok(d.querySelector('#detail .encounter-group'));assert.ok(d.querySelector('#detail .encounter-row'));
 assert.ok(!d.querySelector('#detail').textContent.includes('null%'));assert.match(d.querySelector('#detail').textContent,/Slakoth/);
 assert.equal(d.querySelector('[data-item-id=b2item-dawn-stone-r16]').getAttribute('aria-pressed'),'true');
 d.querySelector('.detail-close').click();assert.ok(!d.querySelector('#detail').classList.contains('open'));
 d.querySelector('[data-view=play]').click();assert.equal(d.querySelector('#play-view').hidden,false);
 assert.equal(d.querySelector('#walkthrough-chapter').value,'5');
 d.querySelector('#walkthrough-chapter').value='0';change(d.querySelector('#walkthrough-chapter'));
 assert.equal(d.querySelector('[data-step="c01-s1"]').checked,true);
 const check=d.querySelector('[data-step="c01-s2"]');check.checked=true;change(check);
 assert.match(d.querySelector('#walkthrough-count').textContent,/2\/4/);
 const note=d.querySelector('#walkthrough-note');assert.equal(note.value,'Meu lembrete antigo');note.value='Continua salvo';note.dispatchEvent(new w.Event('input',{bubbles:true}));
 d.querySelector('[data-view=tools]').click();d.querySelector('#b2-evolution').value='Eevee';change(d.querySelector('#b2-evolution'));assert.match(d.querySelector('#b2-evolution-result').textContent,/Dawn Stone/);
 d.querySelector('[data-view=dex]').click();assert.match(d.querySelector('#progress-summary').textContent,/301 Unova/);
 assert.deepEqual(errors,[]);const saved=w.localStorage.getItem(key);assert.ok(JSON.parse(saved).caught.includes('Eevee'));assert.ok(JSON.parse(saved).steps.includes('c01-s2'));assert.equal(w.localStorage.getItem('unova-black-field-guide-v2'),null);dom.window.close();
 const again=await boot(saved);again.d.querySelector('[data-view=play]').click();assert.equal(again.d.querySelector('#walkthrough-note').value,'Continua salvo');assert.equal(again.d.querySelectorAll('.view-tab').length,4);again.dom.window.close();
 console.log('Black 2 original UI: map sheet, encounter rows, items, walkthrough, hack evolution and migration passed');
})().catch(e=>{console.error(e);process.exit(1)});
