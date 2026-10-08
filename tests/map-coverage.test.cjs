const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
const map=require('../map-data.js');
const context={UnovaMap:map};vm.createContext(context);
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const setup=read('app.js').split('  const specialEncounters')[0].replace('(async () => {','');
vm.runInContext(['data.js','encounters.js','items.js','walkthrough.js','core/game-registry.js','packages/black/adapter.js'].map(read).join('\n')+'\n{'+setup+';globalThis.areas=areas;globalThis.tables=encounterTables;}',context);
const areas=context.areas,physical=areas.filter(map.onMap);
test('every physical guide area has a distinct, in-bounds map point',()=>{
 assert.equal(physical.length,60);
 assert.equal(new Set(areas.map(a=>a[0])).size,areas.length);
 for(const a of physical){assert.ok(map.coordinates[a[0]],a[1]);assert.ok(a[3]>=37&&a[3]<=1712-37&&a[4]>=37&&a[4]<=1080-37,a[1]);}
 for(const a of physical) for(const b of physical) if(a!==b) assert.ok(Math.hypot(a[3]-b[3],a[4]-b[4])>30,`${a[1]} overlaps ${b[1]}`);
});
test('every wild encounter table belongs to a selectable physical point',()=>{
 for(const id of Object.keys(context.tables))assert.ok(physical.some(a=>a[0]===id),id);
 for(const id of ['ct','dream','well','cold','tw','moor','dt','lost','p2','lib','castle','ab','anv','bay','ruins'])assert.ok(physical.some(a=>a[0]===id),id);
});
test('overlapping touch targets always resolve to their own marker at its center',()=>{
 for(const a of physical)assert.equal(map.nearest(physical,a[3],a[4])[0],a[0]);
});
test('encounter groups use nearby anchors while physical areas center on themselves',()=>{
 assert.deepEqual(Object.keys(map.anchors).sort(),['events','swords','torn']);
 for(const id of Object.values(map.anchors))assert.ok(physical.some(a=>a[0]===id));
});
test('Undella town and bay have separate BW encounter tables',()=>{
 const town=context.tables.und,bay=context.tables.bay;
 assert.notEqual(town,bay);
 assert.ok(town.some(t=>t.pokemon.some(p=>p[0]==='Corsola')));
 assert.ok(!town.some(t=>t.pokemon.some(p=>p[0]==='Spheal')));
 assert.ok(bay.some(t=>t.pokemon.some(p=>p[0]==='Spheal')&&t.seasons.includes('Winter')));
});

test('P2 lies north of Route 17 and east of Route 18, and map controls are exposed',()=>{
 assert.ok(map.coordinates.p2[1]<map.coordinates.r17[1]);
 assert.ok(map.coordinates.p2[0]>map.coordinates.r18[0]);
 assert.match(read('index.html'),/id="map"[^>]+role="group"/);
 assert.match(read('app.js'),/r7:5,ct:5/);
});
