/* A small chooser, mounted only while open. Journey records are never read or written. */
(function(root){
  'use strict';
  const document=root.document,registry=root.GameRegistry;
  const current=registry.get(document.body.dataset.edition);
  const triggers=[...document.querySelectorAll('[data-game-picker]')];
  let active=null,opener=null;
  try{root.localStorage.setItem('unova-last-game',current.progress.legacyGame);}catch{}
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function dismiss(){
    if(!active)return;
    const dialog=active;active=null;
    if(dialog.open&&typeof dialog.close==='function')dialog.close();
    dialog.remove();
    triggers.forEach(button=>button.setAttribute('aria-expanded','false'));
    opener?.focus({preventScroll:true});opener=null;
  }
  function open(button){
    if(active)return;
    opener=button;
    const dialog=document.createElement('dialog');
    dialog.id='game-picker';dialog.className='game-picker';
    dialog.setAttribute('aria-labelledby','game-picker-title');
    const editions=registry.list().filter(edition=>edition.status==='usable');
    const coverage=edition=>[['map','Mapa disponível','Mapa parcial'],['encounters','Encontros disponíveis','Encontros parciais'],['items','Itens disponíveis','Itens parciais']].map(([key,available,partial])=>edition.coverage[key]==='available'?available:partial).join(' · ');
    dialog.innerHTML=`<div class="game-picker-body"><div class="game-picker-heading"><h2 id="game-picker-title">Trocar jogo</h2><button type="button" data-game-close aria-label="Fechar escolha de jogos">×</button></div><div class="game-picker-list">${editions.map(edition=>`<a class="game-option" href="${esc(edition.entry)}" data-edition-id="${esc(edition.id)}" ${edition.id===current.id?'aria-current="page"':''}><strong>${esc(edition.title)}${edition.id===current.id?'<span class="game-current-label">Atual</span>':''}</strong><small>${edition.kind==='hack'?'ROM hack':'Versão oficial'} · ${esc(edition.regionIds.map(id=>({unova:'Unova',sinnoh:'Sinnoh'})[id]||id).join(', '))}</small><small>${esc(coverage(edition))}</small>${edition.id==='pokemon-platinum'?'<small>Piloto · Twinleaf até a Coal Badge</small>':''}<small>${edition.coverage.walkthrough==='outline'?'Roteiro por etapas':'Detonado disponível · cobertura parcial'}</small></a>`).join('')}</div><p>O progresso de cada edição fica separado e salvo neste aparelho.</p></div>`;
    active=dialog;document.body.append(dialog);
    triggers.forEach(trigger=>trigger.setAttribute('aria-expanded','true'));
    dialog.querySelector('[data-game-close]').onclick=dismiss;
    dialog.addEventListener('cancel',event=>{event.preventDefault();dismiss();});
    dialog.addEventListener('close',dismiss);
    dialog.addEventListener('click',event=>{if(event.target===dialog)dismiss();});
    dialog.addEventListener('keydown',event=>{
      if(event.key==='Escape'){event.preventDefault();dismiss();return;}
      if(event.key!=='Tab')return;
      const controls=[...dialog.querySelectorAll('button,a[href]')],first=controls[0],last=controls[controls.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    });
    dialog.querySelectorAll('[data-edition-id]').forEach(link=>link.addEventListener('click',event=>{
      if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button!==0)return;
      const edition=registry.get(link.dataset.editionId);
      if(edition.id===current.id){event.preventDefault();dismiss();return;}
      try{root.localStorage.setItem('unova-last-game',edition.progress.legacyGame);}catch{}
    }));
    if(typeof dialog.showModal==='function')dialog.showModal();
    else{dialog.setAttribute('open','');dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');}
    dialog.querySelector('[data-game-close]').focus();
  }
  triggers.forEach(button=>button.addEventListener('click',()=>open(button)));
})(window);
