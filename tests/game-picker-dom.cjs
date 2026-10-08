const {JSDOM}=require('jsdom'),fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
function boot(page,native=false,blocked=false){
 const dom=new JSDOM(read(page),{url:'https://unova-black.vercel.app/'+page,runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window,d=w.document;
 const black='unova-black-field-guide-v2',hack='unova-black2-complete-1.12-v1';
 w.localStorage.setItem(black,JSON.stringify({caught:['Litwick'],badges:5,notes:{nu:'Black'},_savedAt:123}));
 w.localStorage.setItem(hack,JSON.stringify({caught:['Eevee'],steps:['c01-s1'],items:['Route 16|Dawn Stone'],note:'Hack',_savedAt:456}));
 const saved=[w.localStorage.getItem(black),w.localStorage.getItem(hack)];
 vm.runInContext(read('core/game-registry.js'),dom.getInternalVMContext());
 const registry=w.GameRegistry;
 // A planned entry must never become a link merely because it has metadata.
 w.GameRegistry={...registry,list:()=>[...registry.list(),{id:'future',status:'planned',title:'Not ready',entry:'empty.html'}]};
 if(native){w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');this.dispatchEvent(new w.Event('close'));};}
 if(blocked){Object.defineProperty(w,'localStorage',{get:()=>{throw new Error('Storage denied');}});}
 vm.runInContext(read('core/game-picker.js'),dom.getInternalVMContext());
 return {dom,w,d,saved,black,hack};
}
for(const page of ['index.html','black2.html','platinum.html'])for(const native of [false,true]){
 const {dom,w,d,saved,black,hack}=boot(page,native),trigger=d.querySelector('.game-switch-mobile');
 assert.equal(d.querySelector('#game-picker'),null,'chooser must not be mounted on startup');
 const marker=d.createElement('span');marker.id='view-state-sentinel';d.querySelector('#dex-view').append(marker);
 trigger.focus();trigger.click();const dialog=d.querySelector('#game-picker');
 assert.ok(dialog.open);assert.equal(dialog.querySelectorAll('.game-option').length,3);
 assert.ok(!dialog.textContent.includes('Not ready'));assert.match(dialog.textContent,/ROM hack/);assert.match(dialog.textContent,/Versão oficial/);assert.match(dialog.textContent,/parciais/);
 const close=dialog.querySelector('[data-game-close]'),links=[...dialog.querySelectorAll('a')];
 assert.equal(d.activeElement,close);
 close.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Tab',shiftKey:true,bubbles:true,cancelable:true}));assert.equal(d.activeElement,links[links.length-1]);
 links[links.length-1].dispatchEvent(new w.KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true}));assert.equal(d.activeElement,close);
 dialog.querySelector('[aria-current=page]').click();assert.equal(d.querySelector('#game-picker'),null);assert.equal(d.activeElement,trigger);assert.equal(marker.isConnected,true);
 for(let i=0;i<3;i++){trigger.click();d.querySelector('#game-picker').dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));assert.equal(d.querySelector('#game-picker'),null);assert.equal(trigger.getAttribute('aria-expanded'),'false');}
 trigger.click();const other=[...d.querySelectorAll('.game-option')].find(link=>!link.hasAttribute('aria-current'));
 other.addEventListener('click',event=>event.preventDefault());other.click();
 assert.equal(w.localStorage.getItem('unova-last-game'),page==='index.html'?'black2':'black');
 assert.equal(other.getAttribute('href'),page==='index.html'?'black2.html':'index.html?game=black');
 d.querySelector('[data-game-close]').click();assert.equal(d.querySelector('#game-picker'),null);
 assert.equal(w.localStorage.getItem(black),saved[0]);assert.equal(w.localStorage.getItem(hack),saved[1]);
 dom.window.close();
}
const blocked=boot('black2.html',false,true);blocked.d.querySelector('.game-switch-mobile').click();assert.equal(blocked.d.querySelectorAll('.game-option').length,3);blocked.d.querySelector('[data-game-close]').click();blocked.dom.window.close();
console.log('Game chooser: on-demand mounting, editions/coverage, focus loop, dismissal, preference and untouched journeys passed');
