(function(root){
'use strict';
root.initOffline=async function(element){
 if(!('serviceWorker' in root.navigator)){element.textContent='Este navegador não oferece consulta offline. As marcações locais continuam disponíveis.';return;}
 try{const reg=await root.navigator.serviceWorker.register('/sw.js');
  const report=async()=>{const keys=await caches.keys();element.textContent=keys.some(k=>k.startsWith('unova-guide-'))?'Arquivos baixados. O guia está pronto para usar sem internet.':'Baixando os arquivos para consulta sem internet…';};
  await Promise.race([root.navigator.serviceWorker.ready,new Promise((_,reject)=>setTimeout(()=>reject(new Error('Offline preparation timeout')),15000))]);await report();
  if(reg.waiting)element.textContent='Há uma versão nova pronta. Feche as abas do guia e abra novamente para atualizar.';
  reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed')report();});});
 }catch{element.textContent='Não foi possível preparar a consulta offline. Abra o guia com conexão e tente novamente.';}
};
})(window);
