const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const read=name=>fs.readFileSync(require('node:path').join(__dirname,'..',name),'utf8');
const ctx={};vm.createContext(ctx);vm.runInContext(read('data.js')+read('walkthrough.js')+';this.chapters=walkthroughChapters;this.steps=walkthroughSteps;this.ids=[...rawAreas.map(a=>a[0]),"anv","black","challenger"];',ctx);
test('story links and individual instructions point to guide locations',()=>{
 for(const c of ctx.chapters)for(const id of [...c.path,...c.optional])assert.ok(ctx.ids.includes(id),id);
 for(const id of Object.keys(ctx.steps))assert.ok(ctx.ids.includes(id),id);
 assert.equal(ctx.chapters.length,11);
});
test('story distinguishes returns and optional excursions from the main route',()=>{
 const tower=ctx.chapters.find(c=>c.path.includes('ct'));assert.ok(tower.path.indexOf('r7')<tower.path.indexOf('ct'));
 assert.match(ctx.steps.ct,/volte a Mistralton/);
 assert.match(ctx.chapters.find(c=>c.path.includes('ope')).text,/volta ao Relic Castle/);
 assert.match(ctx.chapters.find(c=>c.path.includes('r17')).text,/Não é necessário/);
 assert.match(ctx.steps.league,/Ghetsis/);
});
