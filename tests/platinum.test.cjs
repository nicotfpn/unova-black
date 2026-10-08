const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
function context(){const c=vm.createContext({});c.window=c;for(const p of ['core/game-registry.js','core/item-queries.js','core/encounter-queries.js','packages/platinum/data.js','packages/platinum/encounters.js','packages/platinum/adapter.js'])vm.runInContext(read(p),c);return c;}
test('Platinum has its own Gen IV package and extended regional dex, with no Unova adapters loaded',()=>{
 const c=context(),p=c.GameRegistry.open('pokemon-platinum');assert.equal(p.edition.generation,4);assert.equal(c.PlatinumData.version,14);assert.equal(c.PlatinumData.pokedexId,6);
 assert.equal(p.dex.length,210);assert.equal(new Set(p.dex.map(d=>d[1])).size,210);assert.equal(p.dex[0][2],'Turtwig');assert.ok(!p.dex.some(d=>d[2]==='Snivy'));
 assert.throws(()=>c.GameRegistry.open('pokemon-black'),/não carregado/);assert.equal(c.rawAreas,undefined);assert.equal(p.edition.progress.key,'sinnoh-platinum-field-guide-v1');
 assert.equal(p.areas.length,10);for(const c of p.chapters)for(const id of c.path)assert.ok(p.places[id]);
});
test('ordinary encounter groups preserve Platinum time slots and never mix radar, GBA or swarm percentages',()=>{
 const c=context(),d=c.PlatinumData;assert.equal(Object.values(d.encounters).flat().length,33);
 for(const [id,tables] of Object.entries(d.encounters))for(const t of tables){assert.ok(d.places[id]);assert.equal(t.pokemon.reduce((sum,row)=>sum+row[1],0),100);assert.ok(t.pokemon.every(row=>row[2]));assert.ok(['walk','surf','old-rod','good-rod','super-rod'].includes(t.method));}
 const route=d.encounters.r201,table=time=>route.find(t=>t.time===time);
 assert.equal(table('time-day').pokemon.find(r=>r[0]==='Bidoof')[1],50);
 assert.ok(!table('time-day').pokemon.some(r=>r[0]==='Kricketot'));
 assert.equal(table('time-night').pokemon.find(r=>r[0]==='Kricketot')[1],10);
 assert.ok(!route.some(t=>t.pokemon.some(r=>['Doduo','Growlithe','Nidoran♀'].includes(r[0]))));
 assert.ok(d.audit.omittedConditionalRows>0);
});
test('Platinum uses live time and rods, Surf requires the Fen Badge rather than Black rules',()=>{
 const c=context(),p=c.GameRegistry.open('pokemon-platinum');let progress={time:'time-day',resources:[],badges:0};const q=p.queries.createEncounters({getProgress:()=>progress});
 const route=p.areas.find(a=>a[0]==='r201');assert.ok(!q.availableNames(route).includes('Kricketot'));progress.time='time-night';assert.ok(q.availableNames(route).includes('Kricketot'));
 const twin=p.areas.find(a=>a[0]==='twinleaf');assert.equal(q.isAvailable(twin),false);progress.resources=['old-rod'];assert.ok(q.availableNames(twin).includes('Magikarp'));
 const surf=q.forArea('twinleaf').find(t=>t.method==='surf');progress.resources=['surf'];progress.badges=3;assert.match(q.lockReason(twin,surf),/Fen Badge/);progress.badges=5;assert.equal(q.lockReason(twin,surf),'');
});
test('item occurrences use separate IDs and padded machine search; invalid foreign progress is rejected',()=>{
 const p=context().GameRegistry.open('pokemon-platinum'),q=p.queries.items,rows=Object.values(p.items).flat();assert.equal(rows.length,11);assert.equal(new Set(rows.map(r=>r.id)).size,11);
 assert.equal(q.search('oreburgh','tm76').length,1);assert.equal(q.search('gate','HM6').length,1);
 assert.equal(q.normalizeCollected(['Route 16|Dawn Stone']).length,0);for(const row of rows){assert.match(row.id,/^pt:/);assert.match(row.source,/^https:\/\//);assert.ok(row.where);}
});
