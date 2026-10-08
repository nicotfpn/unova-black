const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {createItemGuide}=require('../item-guide.js');
const root=path.join(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const context={};vm.createContext(context);vm.runInContext(read('items.js')+';this.tables=itemTables;',context);
const tables=context.tables,rows=Object.values(tables).flat(),guide=createItemGuide(tables);
test('all 95 TM numbers and all six HMs are covered, with TM95 unavailable',()=>{
 for(let n=1;n<=95;n++)assert.ok(rows.some(r=>r.code==='TM'+String(n).padStart(2,'0')),`TM${n}`);
 for(let n=1;n<=6;n++)assert.ok(rows.some(r=>r.code==='HM'+String(n).padStart(2,'0')),`HM${n}`);
 assert.ok(rows.filter(r=>r.code==='TM95').every(r=>r.unavailable));
 assert.equal(guide.validIds.has('TM95'),false);
 const obtainable=new Set(rows.filter(r=>r.kind==='tm'&&!r.unavailable).map(r=>r.code));assert.equal(obtainable.size,94);
});
test('each item has a physical guide location, method, instruction and source',()=>{
 const map=require('../map-data.js');
 for(const [area,list] of Object.entries(tables)){
  assert.ok(map.coordinates[area],area);
  for(const row of list){assert.ok(row.id&&row.name&&row.where.length>15,area);assert.ok(['ground','hidden','gift','shop','bp','event','phenomenon'].includes(row.method),row.name);assert.match(row.source,/^https:\/\/(www\.)?(serebii\.net|smogon\.com|bulbapedia\.bulbagarden\.net)\//);assert.ok(!/Black 2|White 2|Dark Stone|Reveal Glass/.test(row.name));}
 }
});
test('Celestial Tower items are correctly attributed to their floors',()=>{
 assert.ok(tables.ct.some(r=>r.code==='TM61'&&r.where.includes('2º andar')));
 assert.ok(tables.ct.some(r=>r.code==='TM65'&&r.where.includes('4º andar')));
});
test('search accepts padded and plain machine numbers and item names',()=>{
 const tm=tables.ct.find(r=>r.code==='TM61');
 assert.ok(guide.matches(tm,'TM61'));assert.ok(guide.matches(tm,'tm061'));assert.ok(guide.matches(tm,'TM 061'));assert.ok(guide.matches(tm,'Will-o-wisp'));
 assert.ok(guide.matches(rows.find(r=>r.name==='Fire Stone'),'fire stone'));
});
test('normalization preserves old Pokémon progress and only accepts known item ids',()=>{
 const d={};vm.createContext(d);vm.runInContext(read('pokemon-guide-data.js')+';this.data=pokemonGuideData;',d);const c={normalizeTeamPlan:require('../team-plan.js').normalizeTeamPlan,pokemonGuideData:d.data,itemTables:tables,byId:new Map(),itemQueries:guide,allSpecies:['Patrat','Litwick']};vm.createContext(c);
 const app=read('app.js'),chunk=app.slice(app.indexOf('  const defaults='),app.indexOf('  let progress=normalizeProgress'));
 vm.runInContext(chunk+';this.normalize=normalizeProgress;',c);
 const old=c.normalize({caught:['Patrat'],badges:5});assert.deepEqual([...old.caught],['Patrat']);assert.deepEqual([...old.collectedItems],[]);
 const current=c.normalize({caught:['Litwick'],collectedItems:['TM61','TM61','made-up','TM95'],badges:5});assert.deepEqual([...current.caught],['Litwick']);assert.deepEqual([...current.collectedItems],['TM61']);
});
test('inventory starts collapsed, filters machines, and only expands eight initial rows',()=>{
 assert.ok(!/^<details[^>]*\sopen/.test(guide.render('ct')));
 assert.match(guide.render('ct',[],'TM61'),/^<details[^>]*\sopen/);
 const filtered=guide.render('ct',[],'','machines',true);assert.match(filtered,/TM61/);assert.ok(!filtered.includes('<strong>Hyper Potion'));
 const large=guide.render('nim');assert.match(large,/Ver mais \d+ itens/);
 const disabled=guide.render('cas',[],'TM95');assert.match(disabled,/disabled/);assert.match(disabled,/Indisponível na partida normal/);
});
test('collected machine status updates independently from other items',()=>{
 const count=guide.counts('ct',['TM61']);assert.equal(count.obtained,1);
 assert.match(guide.render('ct',['TM61']),/data-item-id="TM61" aria-pressed="true"/);
});

test('NPC machines are gifts and updated feather names preserve collection ids',()=>{
 for(const code of ['TM31','TM43','TM44','TM45','TM57'])assert.equal(rows.find(r=>r.code===code).method,'gift');
 assert.equal(rows.find(r=>r.code==='TM09').method,'ground');
 assert.match(rows.find(r=>r.code==='TM10').where,/115/);
 assert.equal(tables.draw.length,7);
 const wing=tables.draw.find(r=>r.name==='Health Wing');
 assert.deepEqual(guide.normalizeCollected(wing.legacyIds),[wing.id]);
 assert.ok(guide.matches(wing,'Health Feather'));
 assert.ok(guide.matches(rows.find(r=>r.name==='Fire Stone'),'pedra de fogo'));
});
