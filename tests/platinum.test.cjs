const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
function context(){const c=vm.createContext({});c.window=c;for(const p of ['core/game-registry.js','core/item-queries.js','core/encounter-queries.js','packages/platinum/data.js','packages/platinum/encounters.js','packages/platinum/adapter.js'])vm.runInContext(read(p),c);return c;}
test('Platinum has its own Gen IV package and extended regional dex, with no Unova adapters loaded',()=>{
 const c=context(),p=c.GameRegistry.open('pokemon-platinum');assert.equal(p.edition.generation,4);assert.equal(c.PlatinumData.version,14);assert.equal(c.PlatinumData.pokedexId,6);
 assert.equal(p.dex.length,210);assert.equal(new Set(p.dex.map(d=>d[1])).size,210);assert.equal(p.dex[0][2],'Turtwig');assert.ok(!p.dex.some(d=>d[2]==='Snivy'));
 assert.throws(()=>c.GameRegistry.open('pokemon-black'),/não carregado/);assert.equal(c.rawAreas,undefined);assert.equal(p.edition.progress.key,'sinnoh-platinum-field-guide-v1');
 assert.equal(p.areas.length,84);for(const c of p.chapters)for(const id of c.path)assert.ok(p.places[id]);
});
test('ordinary encounter groups preserve Platinum time slots and never mix radar, GBA or swarm percentages',()=>{
 const c=context(),d=c.PlatinumData;assert.equal(d.audit.sourceAreas,163);assert.equal(d.audit.ordinaryTables,612);assert.equal(d.audit.conditionalTables,915);
 for(const [id,tables] of Object.entries(d.encounters))for(const t of tables.filter(t=>t.percentScope==='ordinary')){assert.ok(d.places[id]);assert.equal(t.pokemon.reduce((sum,row)=>sum+row[1],0),100);assert.ok(t.pokemon.every(row=>row[2]));assert.ok(['walk','surf','old-rod','good-rod','super-rod'].includes(t.method));}
 const route=d.encounters.r201,table=time=>route.find(t=>t.time===time);
 assert.equal(table('time-day').pokemon.find(r=>r[0]==='Bidoof')[1],50);
 assert.ok(!table('time-day').pokemon.some(r=>r[0]==='Kricketot'));
 assert.equal(table('time-night').pokemon.find(r=>r[0]==='Kricketot')[1],10);
 assert.ok(!route.filter(t=>t.percentScope==='ordinary').some(t=>t.pokemon.some(r=>['Doduo','Growlithe','Nidoran♀'].includes(r[0]))));
 assert.ok(route.some(t=>t.conditions.includes('swarm-yes')));
});
test('Platinum uses live time and rods, Surf requires the Fen Badge rather than Black rules',()=>{
 const c=context(),p=c.GameRegistry.open('pokemon-platinum');let progress={time:'time-day',resources:[],badges:0};const q=p.queries.createEncounters({getProgress:()=>progress});
 const route=p.areas.find(a=>a[0]==='r201');assert.ok(!q.availableNames(route).includes('Kricketot'));progress.time='time-night';assert.ok(q.availableNames(route).includes('Kricketot'));
 const twin=p.areas.find(a=>a[0]==='twinleaf');assert.equal(q.isAvailable(twin),false);progress.resources=['old-rod'];assert.ok(q.availableNames(twin).includes('Magikarp'));
 const surf=q.forArea('twinleaf').find(t=>t.method==='surf');progress.resources=['surf'];progress.badges=3;assert.match(q.lockReason(twin,surf),/Fen Badge/);progress.badges=5;assert.equal(q.lockReason(twin,surf),'');
});
test('item occurrences use separate IDs and padded machine search; invalid foreign progress is rejected',()=>{
 const p=context().GameRegistry.open('pokemon-platinum'),q=p.queries.items,rows=Object.values(p.items).flat();assert.equal(rows.length,732);assert.equal(new Set(rows.map(r=>r.id)).size,732);
 assert.equal(q.search('oreburgh','tm76').length,1);assert.equal(q.search('gate','HM6').length,1);
 assert.equal(q.normalizeCollected(['Route 16|Dawn Stone']).length,0);for(const row of rows){assert.match(row.id,/^pt:/);assert.match(row.source,/^https:\/\//);assert.ok(row.where);}
});

test('full Platinum covers all machines, retained pilot marks and complete story paths',()=>{
 const p=context().GameRegistry.open('pokemon-platinum'),rows=Object.values(p.items).flat();
 for(let n=1;n<=92;n++)assert.ok(rows.some(r=>r.code==='TM'+String(n).padStart(2,'0')));
 for(let n=1;n<=8;n++)assert.ok(rows.some(r=>r.code==='HM'+String(n).padStart(2,'0')));
 const old=JSON.parse(read('packages/platinum/editorial.json')).items;
 const ids=Object.values(old).flat().map(r=>r.id);assert.equal(ids.length,11);assert.deepEqual(Array.from(p.queries.items.normalizeCollected(ids)),ids);
 assert.equal(p.chapters.length,27);assert.equal(p.chapters.flatMap(c=>c.steps).length,93);assert.equal(p.national.length,493);assert.equal(p.battles.length,40);
 for(const id of ['r224','r230','stark','frontier','distortion','temple'])assert.ok(p.places[id],id);
 for(const battle of p.battles){assert.ok(battle.context);assert.ok(battle.party.length);assert.ok(battle.party.every(m=>m.level>0&&m.level<=100));}
 const cynthia=p.battles.find(b=>b.id==='champion_cynthia'),again=p.battles.find(b=>b.id==='champion_cynthia_rematch');assert.ok(again.party[0].level>cynthia.party[0].level);
 // Primary Game Corner script, rather than the conflicting secondary TM74 price.
 assert.ok(rows.some(r=>r.code==='TM74'&&r.where.includes('15000 moedas')));
});
test('conditional overlays stay separate and event/fixed encounters never imply random certainty',()=>{
 const c=context(),p=c.GameRegistry.open('pokemon-platinum');let progress={time:'all',resources:['surf','old-rod','good-rod','super-rod','rock-smash'],badges:8,league:true,nationalDex:true,events:true,galactic:true,gba:'slot2-none',radar:false};
 const q=p.queries.createEncounters({getProgress:()=>progress});const radar=Object.entries(p.encounters).flatMap(([id,ts])=>ts.filter(t=>t.conditions.includes('radar-on')).map(t=>[id,t]))[0];
 assert.match(q.lockReason(p.areas.find(a=>a[0]===radar[0]),radar[1]),/Radar/);progress.radar=true;assert.equal(q.lockReason(p.areas.find(a=>a[0]===radar[0]),radar[1]),'');
 for(const ts of Object.values(p.encounters))for(const t of ts){if(t.percentScope==='fixed'||t.method==='feebas-tile-fishing')assert.ok(t.pokemon.every(r=>r[1]===null));}
 const feebas=Object.values(p.encounters).flat().find(t=>t.method==='feebas-tile-fishing');assert.ok(feebas);assert.match(q.lockReason(p.areas.find(a=>p.encounters[a[0]]?.includes(feebas)),feebas),/Quadrados/);
 assert.ok(p.encounters.origin.some(t=>t.conditions.includes('item-azure-flute-unreleased')));
});
test('physical map entrances do not overlap touch circles and source areas are represented once',()=>{
 const p=context().GameRegistry.open('pokemon-platinum'),mapped=p.areas.filter(a=>p.places[a[0]].mapped),sections=Object.values(p.places).flatMap(a=>a.sections);
 assert.equal(mapped.length,82);assert.equal(new Set(sections.map(s=>s.sourceArea)).size,163);assert.equal(sections.length,163);
 for(let i=0;i<mapped.length;i++)for(let j=i+1;j<mapped.length;j++)assert.ok(Math.hypot(mapped[i][3]-mapped[j][3],mapped[i][4]-mapped[j][4])>=40, mapped[i][0]+' overlaps '+mapped[j][0]);
});
