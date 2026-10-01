/* Opt-in cloud sync. Storage and CAS writes are protected by Supabase Auth + RLS. */
(function(root){
'use strict';
function createCloudSync({getProgress,setProgress,element,config=root.UNOVA_CLOUD,request=root.fetch?.bind(root)}){
 const key='unova-black-cloud-session-v1',metaKey='unova-black-cloud-version-v1';let session=null,revision=0,connected=false,conflict=false,busy=false,timer=null,pending=false;
 const enabled=!!(config?.url&&config?.key&&/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(config.url));
 const safeKey=()=>{if(config.key.startsWith('sb_secret_'))return false;try{const payload=JSON.parse(atob(config.key.split('.')[1]));return payload.role!=='service_role';}catch{return !config.key.startsWith('sb_secret_');}};
 const available=enabled&&safeKey();
 const status=(text)=>{element.querySelector('[data-cloud-status]').textContent=text;};
 async function api(path,body,token=session?.access_token,method=body?'POST':'GET'){
  const res=await request(config.url.replace(/\/$/,'')+path,{method,headers:{apikey:config.key,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})});
  const data=await res.json();if(!res.ok)throw Error(data.msg||data.message||'Falha na sincronização');return data;
 }
 function persist(){try{session?root.localStorage.setItem(key,JSON.stringify(session)):root.localStorage.removeItem(key);}catch{}}
 async function freshToken(){if(!session)return;if((session.expires_at||0)*1000>Date.now()+60000)return;session=await api('/auth/v1/token?grant_type=refresh_token',{refresh_token:session.refresh_token},null);session.expires_at=Math.floor(Date.now()/1000)+(session.expires_in||3600);persist();}
 async function remote(){await freshToken();const rows=await api('/rest/v1/journeys?select=data,revision');return rows[0]||null;}
 function controls(){element.querySelector('[data-cloud-account]').hidden=!session;element.querySelector('[data-cloud-auth]').hidden=!!session;element.querySelector('[data-cloud-conflict]').hidden=!conflict;}
 function remember(snapshot){try{root.localStorage.setItem(metaKey,JSON.stringify({uid:session?.user?.id,revision,local:JSON.stringify(snapshot)}));}catch{}}
 async function connect(){
  try{status('Conferindo o progresso salvo na conta…');const row=await remote();revision=row?.revision||0;
   if(row){
    let meta=null;try{meta=JSON.parse(root.localStorage.getItem(metaKey)||'null');}catch{}
    const uid=session.user?.id;
    if(meta&&meta.uid===uid&&meta.local===JSON.stringify(getProgress())){setProgress(row.data);remember(row.data);connected=true;conflict=false;status('Progresso da conta carregado. Sincronização ativa.');}
    else if(meta&&meta.uid===uid&&meta.revision===revision){connected=true;conflict=false;pending=true;await flush();}
    else{conflict=true;connected=false;status('Existe um progresso nesta conta. Escolha qual deseja continuar antes de sincronizar.');}
   }
   else{connected=true;conflict=false;status('Conta conectada. Salvando sua jornada…');pending=true;await flush();}controls();
  }catch{connected=false;status('Não foi possível conectar. Seu progresso continua salvo neste aparelho.');}
 }
 async function flush(){
  if(!available||!session||!connected||conflict||busy||!pending)return;
  busy=true;pending=false;const snapshot=JSON.parse(JSON.stringify(getProgress()));
  try{await freshToken();const result=await api('/rest/v1/rpc/save_journey',{p_data:snapshot,p_expected:revision});
   if(!result.ok){conflict=true;connected=false;pending=true;status('O progresso mudou em outro aparelho. Escolha qual versão continuar.');controls();}
   else{revision=result.revision;remember(snapshot);status('Progresso sincronizado com sua conta.');}
  }catch{pending=true;status('Sem sincronização agora. O progresso está salvo neste aparelho; tentaremos novamente quando houver conexão.');}
  finally{busy=false;if(pending&&connected&&!conflict&&root.navigator?.onLine!==false)scheduleRetry();}
 }
 function scheduleRetry(){clearTimeout(timer);timer=setTimeout(flush,15000);}
 function schedule(){if(!available||!connected)return;pending=true;clearTimeout(timer);timer=setTimeout(flush,900);}
 async function pull(){try{const row=await remote();if(!row){status('Não há progresso nesta conta ainda.');return;}revision=row.revision;setProgress(row.data);remember(row.data);conflict=false;connected=true;pending=false;controls();status('Progresso da conta carregado. Novas alterações serão sincronizadas.');}catch{status('Não foi possível carregar a conta. Seu progresso local foi preservado.');}}
 async function push(){try{const row=await remote();revision=row?.revision||0;conflict=false;connected=true;pending=true;controls();await flush();}catch{status('Não foi possível enviar agora. Seu progresso local foi preservado.');}}
 if(!available){element.innerHTML='<p class="cloud-message">A sincronização entre aparelhos ainda não está ativada. Seu progresso continua salvo automaticamente neste aparelho.</p>';return {schedule:()=>{},enabled:false};}
 element.innerHTML='<p>Entre com o mesmo e-mail no celular e no PC. A conta guarda sua jornada; jogar sem internet continua funcionando neste aparelho.</p><div data-cloud-auth><label>E-mail <input type="email" data-cloud-email autocomplete="email"></label><button type="button" data-cloud-send>Enviar código de acesso</button><label>Código recebido por e-mail <input type="text" data-cloud-code inputmode="numeric" autocomplete="one-time-code"></label><button type="button" data-cloud-verify>Entrar com o código</button></div><div data-cloud-account hidden><button type="button" data-cloud-pull>Carregar progresso da conta</button><button type="button" data-cloud-logout>Sair desta conta</button></div><div data-cloud-conflict hidden><p>Carregar a conta substitui a jornada neste aparelho. Usar este aparelho substitui a jornada da conta. Você pode baixar uma cópia antes em Minha jornada.</p><button type="button" data-cloud-use-remote>Continuar com a conta</button><button type="button" data-cloud-use-local>Continuar com este aparelho</button></div><p data-cloud-status role="status">Entre para ativar a sincronização.</p>';
 element.querySelector('[data-cloud-send]').onclick=async()=>{const email=element.querySelector('[data-cloud-email]').value.trim();if(!email||!element.querySelector('[data-cloud-email]').checkValidity()){status('Digite um e-mail válido.');return;}try{await api('/auth/v1/otp',{email,create_user:true},null);status('Código enviado. Confira seu e-mail.');}catch{status('Não foi possível enviar o código. Tente novamente depois.');}};
 element.querySelector('[data-cloud-verify]').onclick=async()=>{const email=element.querySelector('[data-cloud-email]').value.trim(),token=element.querySelector('[data-cloud-code]').value.trim();if(!email||!token){status('Informe o e-mail e o código recebido.');return;}try{session=await api('/auth/v1/verify',{email,token,type:'email'},null);session.expires_at=Math.floor(Date.now()/1000)+(session.expires_in||3600);persist();element.querySelector('[data-cloud-code]').value='';controls();await connect();}catch{status('Código inválido ou expirado. Solicite um novo.');}};
 element.querySelector('[data-cloud-pull]').onclick=async()=>{conflict=true;connected=false;controls();status('Escolha a versão para continuar.');};
 element.querySelector('[data-cloud-use-remote]').onclick=pull;element.querySelector('[data-cloud-use-local]').onclick=push;
 element.querySelector('[data-cloud-logout]').onclick=async()=>{clearTimeout(timer);connected=false;pending=false;try{await api('/auth/v1/logout',{},session?.access_token);}catch{}session=null;persist();conflict=false;controls();status('Conta desconectada. Seu progresso neste aparelho foi mantido.');};
 try{session=JSON.parse(root.localStorage.getItem(key)||'null');if(session?.access_token&&session?.refresh_token)connect();else session=null;}catch{}controls();
 root.addEventListener?.('online',()=>{if(pending)flush();});
 return {schedule,enabled:true,flush,pull,push};
}
root.createCloudSync=createCloudSync;if(typeof module!=='undefined')module.exports={createCloudSync};
})(typeof window!=='undefined'?window:globalThis);
