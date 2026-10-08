const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
function edition(page,id){
 const c=vm.createContext({console});c.window=c;
 for(const [,src]of read(page).matchAll(/<script src="([^"]+)"/g)){
  if(['app.js','black2-app.js','offline.js'].includes(src))continue;
  vm.runInContext(read(src),c,{filename:src});
 }
 return {c,package:c.GameRegistry.open(id)};
}
const black=edition('index.html','pokemon-black'),hack=edition('black2.html','pokemon-black2-complete-unova-1.12');
function queries(edition,initial={},specials={}){
 let progress={badges:8,league:false,surf:false,strength:false,cobalion:false,rod:false,season:'all',starter:'',fossil:'',trades:false,events:false,...initial};
 const q=edition.package.queries.createEncounters({specials,stage:{},getProgress:()=>progress,regionalSet:new Set(['Snivy','Tepig','Oshawott','Pansage','Pansear','Panpour','Archen','Tirtouga']),extraSpecies:['Litwick','Basculin','Eevee','Slakoth']});
 return {q,set:value=>{progress={...progress,...value};}};
}
const area=(id,phase='story')=>[id,id,'route',0,0,phase];
test('Black and the hack preserve their distinct fishing requirements with live progress',()=>{
 const b=queries(black),h=queries(hack),table={method:'Standard Fishing'};
 assert.match(b.q.lockReason(area('r1'),table),/Ghetsis/);assert.match(h.q.lockReason(area('r1'),table),/Aspertia/);
 b.set({rod:true});h.set({rod:true});
 assert.match(b.q.lockReason(area('r1'),table),/Ghetsis/);assert.equal(h.q.lockReason(area('r1'),table),'');
 b.set({league:true});assert.equal(b.q.lockReason(area('r1'),table),'');
});
test('season, Surf and swarm conditions remain explicit rather than becoming automatic availability',()=>{
 const {q,set}=queries(black);
 assert.equal(q.lockReason(area('r1'),{method:'Standard Surfing'}),'Você precisa de Surf');
 set({surf:true});assert.equal(q.lockReason(area('r1'),{method:'Standard Surfing'}),'');
 const seasonal={method:'Standard Walking',seasons:['Winter']};
 assert.match(q.lockReason(area('r1'),seasonal),/Informe a estação/);
 set({season:'Summer'});assert.match(q.lockReason(area('r1'),seasonal),/não está disponível/);
 set({season:'Winter'});assert.equal(q.lockReason(area('r1'),seasonal),'');
 assert.match(q.lockReason(area('r1'),{method:'Swarms'}),/depois da Liga/);
 set({league:true});assert.match(q.lockReason(area('r1'),{method:'Swarms'}),/enxame de hoje/);
});
test('Black starter, monkey and fossil choices preserve species-specific gift restrictions',()=>{
 const specials={nu:[['Snivy / Tepig / Oshawott','Presente','']],dream:[['Pansage / Pansear / Panpour','Presente','']],nac:[['Tirtouga / Archen','Fóssil','']]};
 const {q,set}=queries(black,{},specials);
 assert.equal(q.availableNames(area('nu')).length,0);
 set({starter:'Snivy',fossil:'Archen'});
 assert.ok(q.availableNames(area('nu')).includes('Snivy'));assert.ok(!q.availableNames(area('nu')).includes('Tepig'));
 assert.ok(q.availableNames(area('dream')).includes('Panpour'));assert.ok(!q.availableNames(area('dream')).includes('Pansage'));
 assert.ok(q.availableNames(area('nac')).includes('Archen'));assert.ok(!q.availableNames(area('nac')).includes('Tirtouga'));
 assert.match(q.specialLock(area('nu'),specials.nu[0],'Tepig'),/outro inicial/);
});
test('hack postgame additions and named story conditions do not inherit Black-only rules',()=>{
 const specials=vm.runInContext('Black2Bridge.specials',hack.c),{q,set}=queries(hack,{},specials);
 const table={method:'Standard Walking',conditions:['item-lunar-wing']};
 assert.equal(q.lockReason(area('r1'),table),'Tenha Lunar Wing');
 assert.equal(q.lockReason(area('r1'),{requires:{league:true}}),'Conclua a Liga');
 set({league:true});assert.equal(q.lockReason(area('r1'),{requires:{league:true}}),'');
 assert.equal(q.specialLock(area('r1'),['Eevee','Troca com personagem','']), 'Inclua trocas com personagens em Meu progresso');
 set({trades:true});assert.equal(q.specialLock(area('r1'),['Eevee','Troca com personagem','']),'');
 assert.equal(q.rateUncertain('r11','Standard Fishing'),false);
 assert.equal(queries(black).q.rateUncertain('r11','Standard Fishing'),true);
});
test('real hack encounters retain unknown probabilities and query results do not mutate the catalog',()=>{
 const {q}=queries(hack,{league:true,surf:true,rod:true,season:'Winter'});
 const before=JSON.stringify(hack.package.encounters),unknown=[];
 for(const a of hack.package.areas)for(const t of q.forArea(a[0]))for(const row of t.pokemon)if(row[1]===null)unknown.push(row[0]);
 assert.ok(unknown.length>0);
 const result=q.forSpecies(hack.package.areas,unknown[0]);
 assert.ok(result.options.some(o=>o.rate===null));
 assert.ok(!q.forSpecies(hack.package.areas,'not-a-species').options.length);
 assert.equal(JSON.stringify(hack.package.encounters),before);
});
test('species suggestions keep available verified tables ahead of disputed or locked encounters',()=>{
 const tables={r1:[{method:'Standard Fishing',pokemon:[['Basculin',10,'10']]}],r11:[{method:'Standard Fishing',pokemon:[['Basculin',90,'10']]}],future:[{method:'Standard Walking',pokemon:[['Basculin',100,'10']]}]};
 const q=black.c.createBlackEncounterQueries({tables,specials:{},stage:{future:8},getProgress:()=>({badges:0,league:true,rod:true}),regionalSet:new Set(['Basculin']),extraSpecies:[]});
 const result=q.forSpecies([area('future'),area('r11'),area('r1')],'Basculin');
 assert.equal(result.options.map(o=>o.area[0]).join(','),'r1,r11,future');
 assert.match(result.options[2].lock,/8 insígnias/);
 assert.equal(tables.r11[0].pokemon[0][1],90);
});
test('item queries remain edition-bound and accept old hack item IDs without changing capture records',()=>{
 const b=black.package.queries.items,h=hack.package.queries.items;
 assert.ok(h.search('r16','Dawn Stone').some(r=>r.id==='b2item-dawn-stone-r16'));
 assert.ok(!b.search('r16','Dawn Stone').some(r=>r.id==='b2item-dawn-stone-r16'));
 assert.equal(h.normalizeCollected(['Route 16|Dawn Stone']).join(','),'b2item-dawn-stone-r16');
 assert.equal(b.normalizeCollected(['b2item-dawn-stone-r16']).length,0);
 assert.ok(b.search('ct','TM 061').some(r=>r.code==='TM61'));
 assert.equal(b.normalizeCollected(['TM95']).length,0);
 assert.equal(b.forArea('missing').length,0);
});
