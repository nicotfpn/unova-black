const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),bootstrap=html.match(/<script>(.*?)<\/script>/s)[1];
function resume(lastGame,search='',blocked=false){
 let preference=lastGame,redirect=null;
 const c={URLSearchParams,location:{search,replace:url=>{redirect=url;}},localStorage:{getItem:()=>{if(blocked)throw Error('Storage denied');return preference;},setItem:(key,value)=>{if(blocked)throw Error('Storage denied');assert.equal(key,'unova-last-game');preference=value;}}};
 vm.runInNewContext(bootstrap,c);return {preference,redirect};
}
test('opening the app continues the selected hack without a catalog screen',()=>{assert.equal(resume('black2').redirect,'black2.html');assert.equal(resume('black').redirect,null);assert.equal(resume(null).redirect,null);});
test('explicit Black URL overrides last-game preference rather than bouncing back to the hack',()=>{assert.deepEqual(resume('black2','?game=black'),{preference:'black',redirect:null});});
test('blocked preference storage leaves the existing Black entry usable',()=>{assert.equal(resume('black2','',true).redirect,null);});
