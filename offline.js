/* Edition downloads never read or write journey records. */
(function(root){
 'use strict';
 let registration=null,starting=null;
 const current=()=>root.document.body.dataset.edition;
 const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const notify=()=>root.dispatchEvent(new root.Event('offline-change'));
 const unsupported='Este navegador não oferece consulta offline. Suas marcações locais continuam disponíveis.';
 async function ensure(){
  if(!('serviceWorker' in root.navigator))throw Error(unsupported);
  if(starting)return starting;
  starting=(async()=>{
   registration=await root.navigator.serviceWorker.register('/sw.js');
   registration.addEventListener('updatefound',()=>{notify();registration.installing?.addEventListener('statechange',notify);});
   const sw=root.navigator.serviceWorker;
   let timer;
   try{await Promise.race([sw.ready,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Abra o guia com conexão e tente preparar o offline novamente.')),15000);})]);}finally{clearTimeout(timer);}
   sw.addEventListener('controllerchange',notify);
   return registration;
  })();
  try{return await starting;}catch(error){starting=null;throw error;}
 }
 async function request(type,edition,onProgress){
  const reg=await ensure();if(type!=='STATUS'&&(reg.waiting||reg.installing))throw Error('Há uma atualização em preparação. Feche as abas do guia e abra novamente antes de alterar downloads.');
  if(!reg.active)throw Error('Preparando o offline. Tente novamente em alguns instantes.');
  return new Promise((resolve,reject)=>{
   const channel=new root.MessageChannel();let timer;
   function close(){clearTimeout(timer);channel.port1.close();}
   function schedule(){clearTimeout(timer);timer=setTimeout(()=>{close();reject(Error('Não foi possível concluir. Verifique a conexão e tente novamente.'));},type==='STATUS'?10000:45000);}
   schedule();channel.port1.onmessage=({data})=>{
    if(data.progress){schedule();onProgress?.(data.progress);return;}
    close();if(data.ok)resolve({...data,updating:!!(reg.waiting||reg.installing)});else reject(Error(data.error));
   };
   try{reg.active.postMessage({type,edition,current:current()},[channel.port2]);}catch(error){close();reject(error);}
  });
 }
 async function mount(container){
  if(container.dataset.offlineMounted)return;container.dataset.offlineMounted='true';
  let busy=false;
  container.innerHTML='<p class="offline-status" role="status" aria-live="polite">Consultando downloads…</p><div class="offline-editions"></div><p>Remover o download mantém capturas, itens, etapas e notas. Fontes externas precisam de internet.</p>';
  const message=container.querySelector('.offline-status'),list=container.querySelector('.offline-editions');
  async function render(){
   try{
    const state=await request('STATUS');if(!container.isConnected)return;
    message.textContent=state.updating?'Há uma atualização em preparação. Feche as abas do guia e abra novamente.':'Escolha os jogos para consultar sem internet neste aparelho.';
    list.innerHTML=state.editions.map(row=>{const edition=root.GameRegistry.get(row.id);return `<div class="offline-edition"><strong>${esc(edition.title)}</strong><small>${row.installed?'Disponível sem internet':'Ainda não baixado'} · aproximadamente ${(row.bytes/1024/1024).toLocaleString('pt-BR',{maximumFractionDigits:1,minimumFractionDigits:1})} MB</small><button type="button" data-offline-edition="${esc(row.id)}" data-offline-action="${row.installed?'REMOVE':'DOWNLOAD'}" ${state.updating?'disabled':''}>${row.installed?'Remover download':'Baixar para usar offline'}</button></div>`;}).join('');
    list.querySelectorAll('button').forEach(button=>button.onclick=async()=>{
     if(busy)return;busy=true;let changed=false;list.querySelectorAll('button').forEach(b=>b.disabled=true);
     try{
      await request(button.dataset.offlineAction,button.dataset.offlineEdition,({done,total})=>{if(container.isConnected)message.textContent=`Baixando arquivos: ${done}/${total}…`;});
      changed=true;if(container.isConnected){await render();message.textContent=button.dataset.offlineAction==='REMOVE'?'Download removido. Seu progresso foi mantido.':'Download concluído. Este jogo está disponível sem internet.';}
     }catch(error){if(container.isConnected){message.textContent=error.message;list.querySelectorAll('button').forEach(b=>b.disabled=false);}}
     finally{if(changed)notify();busy=false;}
    });
   }catch(error){if(container.isConnected){message.textContent=error.message;list.innerHTML='';if('serviceWorker' in root.navigator){const retry=root.document.createElement('button');retry.type='button';retry.textContent='Tentar novamente';retry.onclick=render;list.append(retry);}}}
  }
  const change=()=>{if(!container.isConnected){root.removeEventListener('offline-change',change);return;}if(!busy)render();};
  container.offlineCleanup=()=>root.removeEventListener('offline-change',change);root.addEventListener('offline-change',change);await render();
 }
 root.OfflineManager={mount,unmount:container=>container?.offlineCleanup?.(),status:()=>request('STATUS'),download:(id,report)=>request('DOWNLOAD',id,report),remove:id=>request('REMOVE',id)};
 root.initOffline=async function(element){
  if(!element)return;
  try{const s=await request('STATUS'),installed=s.editions.find(e=>e.id===current())?.installed;element.textContent=s.updating?'Há uma versão nova em preparação. Feche as abas do guia e abra novamente.':installed?'Este jogo está pronto para usar sem internet. Gerencie os downloads em Trocar jogo.':'Escolha Trocar jogo → Usar sem internet para baixar este jogo.';}
  catch(error){element.textContent=error.message;}
 };
 // Register on all three pages, including Platinum; downloads are always explicit.
 ensure().catch(()=>{});
})(window);
