const {JSDOM}=require('jsdom'),fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),key='sinnoh-platinum-field-guide-v1';
const black=JSON.stringify({caught:['Litwick'],badges:5,notes:{nu:'keep'},_savedAt:123}),hack=JSON.stringify({caught:['Eevee'],steps:['c01-s1'],items:['Route 16|Dawn Stone'],note:'keep',_savedAt:456});
async function boot(saved,mobile=false,blocked=false){
 const dom=new JSDOM(read('platinum.html'),{url:'https://example.test/platinum.html',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window,d=w.document;
 w.localStorage.setItem('unova-black-field-guide-v2',black);w.localStorage.setItem('unova-black2-complete-1.12-v1',hack);if(saved)w.localStorage.setItem(key,saved);
 if(mobile)w.innerWidth=390;
 if(blocked)Object.defineProperty(w,'localStorage',{get(){throw Error('denied');}});
 for(const [,src] of read('platinum.html').matchAll(/<script src="([^"]+)"/g)){if(src==='offline.js')continue;const result=vm.runInContext(read(src),dom.getInternalVMContext(),{filename:src});if(src==='packages/platinum/app.js')await result;}
 return {dom,w,d};
}
(async()=>{
 let {dom,w,d}=await boot();const click=(selector)=>{const b=d.querySelector(selector);assert.ok(b,selector);b.click();};
 assert.equal(d.querySelectorAll('#map .node').length,82);assert.equal(d.querySelectorAll('#dex-content article').length,0);assert.equal(d.querySelectorAll('#story-chapters input').length,0);assert.ok(d.querySelectorAll('*').length<1000);
 const firstNode=d.querySelector('#map .node');d.querySelector('#search').value='TM76';d.querySelector('#search').dispatchEvent(new w.Event('input'));assert.equal(d.querySelectorAll('.pt-area').length,1);assert.equal(d.querySelector('.pt-area').dataset.place,'oreburgh');click('.pt-area');click('[data-item="pt:oreburgh:tm76"]');
 click('[data-view="dex"]');assert.equal(d.querySelectorAll('#dex-content article').length,210);click('[data-caught="Turtwig"]');assert.match(d.querySelector('#progress-summary').textContent,/1\/210/);
 click('[data-view="play"]');assert.equal(d.querySelectorAll('#story-chapters input').length,93);assert.equal(d.querySelectorAll('#dex-content article').length,0);click('[data-step="pt-starter"]');d.querySelector('#play-note').value='Voltar à mina';d.querySelector('#play-note').dispatchEvent(new w.Event('input'));
 click('[data-view="map"]');assert.equal(d.querySelectorAll('#story-chapters input').length,0);assert.equal(d.querySelector('#map .node'),firstNode);
 const time=d.querySelector('#time-select');time.value='time-day';time.dispatchEvent(new w.Event('change'));click('[data-filter="available"]');d.querySelector('#search').value='Kricketot';d.querySelector('#search').dispatchEvent(new w.Event('input'));assert.ok(![...d.querySelectorAll('.pt-area')].some(b=>b.dataset.place==='r201'));
 time.value='time-night';time.dispatchEvent(new w.Event('change'));assert.ok(d.querySelectorAll('.pt-area').length>0);
 click('.game-switch-mobile');assert.equal(d.querySelectorAll('.game-option').length,3);assert.match(d.querySelector('.game-picker').textContent,/Sinnoh/);assert.match(d.querySelector('.game-picker').textContent,/Battle Zone/);click('[data-game-close]');
 assert.equal(w.localStorage.getItem('unova-black-field-guide-v2'),black);assert.equal(w.localStorage.getItem('unova-black2-complete-1.12-v1'),hack);assert.equal(w.localStorage.getItem('unova-last-game'),'platinum');
 // National records coexist with the unchanged 210-entry regional count.
 click('[data-view="dex"]');const scope=d.querySelector('#dex-scope');scope.value='national';scope.dispatchEvent(new w.Event('change'));assert.equal(d.querySelectorAll('#dex-content article').length,493);click('[data-caught="Bulbasaur"]');assert.match(d.querySelector('#progress-summary').textContent,/1\/210 Sinnoh · 2 capturas/);
 click('[data-view="map"]');assert.equal(d.querySelectorAll('#dex-content article').length,0);
 const saved=w.localStorage.getItem(key);dom.window.close();({dom,w,d}=await boot(saved,true));
 const p=JSON.parse(w.localStorage.getItem(key));assert.ok(p.caught.includes('Turtwig'));assert.ok(p.collectedItems.includes('pt:oreburgh:tm76'));assert.ok(p.steps.includes('pt-starter'));assert.equal(p.note,'Voltar à mina');assert.equal(p.time,'time-night');
 const marker=d.querySelector('[data-place="r201"]');marker.focus();marker.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));assert.ok(d.querySelector('#detail').classList.contains('open'));assert.equal(d.querySelector('#scrim').hidden,false);d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape'}));assert.equal(d.querySelector('#scrim').hidden,true);assert.equal(d.activeElement,marker);
 // A foreign backup must fail without replacing this edition's progress.
 const before=w.localStorage.getItem(key),file={size:60,text:async()=>JSON.stringify({edition:'pokemon-black',schemaVersion:1,caught:['Snivy']})};
 await d.querySelector('#import-progress').onchange({target:{files:[file],value:'x'}});assert.equal(w.localStorage.getItem(key),before);assert.match(d.querySelector('#save-status').textContent,/Platinum/);
 dom.window.close();
 const legacyItems=Object.values(JSON.parse(read('packages/platinum/editorial.json')).items).flat().map(r=>r.id);
 ({dom,w,d}=await boot(JSON.stringify({caught:['Turtwig'],collectedItems:legacyItems,steps:['pt-starter'],note:'Save do piloto',badges:1,time:'time-day',resources:[]})));
 const legacy=JSON.parse(w.localStorage.getItem(key));assert.deepEqual(legacy.collectedItems,legacyItems);assert.ok(legacy.steps.includes('pt-starter'));assert.equal(d.querySelector('#play-note').value,'Save do piloto');
 // Full area sheets mount one encounter body and eight items at most.
 d.querySelector('button[data-place="coronet"]').click();assert.ok(d.querySelector('#pt-section').options.length>1);assert.ok(d.querySelectorAll('.encounter-content .encounter-list').length<=1);assert.ok(d.querySelectorAll('[data-item]').length<=8);
 const more=d.querySelector('#pt-more-items');assert.ok(more);more.click();assert.equal(d.querySelectorAll('[data-item]').length,16);
 d.querySelector('[data-view="play"]').click();assert.equal(d.querySelector('#pt-battle-controls').children.length,0);const roster=d.querySelector('.pt-battles');roster.open=true;roster.dispatchEvent(new w.Event('toggle'));assert.equal(d.querySelector('#pt-battle-select').options.length,40);assert.ok(!d.querySelector('#pt-battle-select').textContent.includes('leader_'));roster.open=false;roster.dispatchEvent(new w.Event('toggle'));assert.equal(d.querySelector('#pt-battle-controls').children.length,0);
 dom.window.close();({dom,w,d}=await boot(null,false,true));assert.match(d.querySelector('#save-status').textContent,/indisponível/);assert.equal(d.querySelectorAll('#map .node').length,82);dom.window.close();
 console.log('Platinum DOM: queries, lazy views, capture/item/step/note recovery, isolated journeys, chooser, mobile keyboard and foreign-backup rejection passed');
})().catch(e=>{console.error(e);process.exitCode=1;});
