const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=path.join(__dirname,'..');
test('interface and offline generators reproduce committed outputs including package scripts',()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'unova-generators-'));
 try{
  fs.cpSync(root,temp,{recursive:true,filter:p=>!['.git','node_modules'].includes(path.basename(p))});
  for(const script of ['build-black2-interface.py','build-service-worker.py'])execFileSync('python',['scripts/'+script],{cwd:temp});
  for(const file of ['black2.html','black2-app.js','sw.js'])assert.equal(fs.readFileSync(path.join(temp,file),'utf8'),fs.readFileSync(path.join(root,file),'utf8'),file+' is stale');
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
});
