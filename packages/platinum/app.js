/* Platinum client; legacy Unova clients and journeys stay independent. */
(async function(){
 'use strict';
 const pack=GameRegistry.open('pokemon-platinum'),$=id=>document.getElementById(id);
 const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const norm=v=>String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\b(tm|hm)\s*0*(\d+)/g,'$1$2').trim();
 const byId=new Map(pack.areas.map(a=>[a[0],a])),names=new Set(pack.national.map(d=>d[2]));
 const steps=new Set(pack.chapters.flatMap(c=>c.steps.map(s=>s[0]))),resources=['old-rod','good-rod','super-rod','surf','rock-smash'];
 const speciesNames=new Set([...names].map(norm)),regional=new Set(pack.dex.map(d=>d[2])),mapped=pack.areas.filter(a=>pack.places[a[0]].mapped),totalSteps=steps.size;
 const searchIndex=new Map(pack.areas.map(a=>[a[0],norm([a[1],...(pack.encounters[a[0]]||[]).flatMap(t=>t.pokemon.map(r=>r[0])),...(pack.items[a[0]]||[]).map(r=>r.name+' '+(r.move||'')+' '+(r.code||''))].join(' '))]));
 const items=pack.queries.items;
 function normalize(p={}){
  return {edition:pack.edition.id,schemaVersion:1,caught:[...new Set((Array.isArray(p.caught)?p.caught:[]).filter(n=>names.has(n)))],
   collectedItems:items.normalizeCollected(p.collectedItems),steps:[...new Set((Array.isArray(p.steps)?p.steps:[]).filter(id=>steps.has(id)))],
   badges:Number.isInteger(p.badges)?Math.max(0,Math.min(8,p.badges)):0,
   time:['all','time-morning','time-day','time-night'].includes(p.time)?p.time:'all',
   starter:['Turtwig','Chimchar','Piplup'].includes(p.starter)?p.starter:'',
   league:!!p.league,nationalDex:!!p.nationalDex,events:!!p.events,galactic:!!p.galactic,radar:!!p.radar,swarmArea:typeof p.swarmArea==='string'&&byId.has(p.swarmArea)?p.swarmArea:'',gba:['slot2-ruby','slot2-sapphire','slot2-emerald','slot2-firered','slot2-leafgreen'].includes(p.gba)?p.gba:'slot2-none',
   resources:[...new Set((Array.isArray(p.resources)?p.resources:[]).filter(id=>resources.includes(id)))],note:typeof p.note==='string'?p.note.slice(0,1000):''};
 }
 let progress=normalize(),view='map',current='twinleaf',filter='all',zoom=1,opener=null,section='',tableMode='ordinary',groupLimit=8,itemLimit=8,dexScope='sinnoh';
 const store=createProgressStore({key:pack.edition.progress.key,normalize,onStatus:s=>{$('save-status').textContent=s.text;},onExternal:p=>{progress=p;refresh();}});
 progress=(await store.load())||progress;
 const queries=pack.queries.createEncounters({getProgress:()=>progress});
 const methodLabels={walk:'Caminhando','old-rod':'Old Rod','good-rod':'Good Rod','super-rod':'Super Rod',surf:'Surf',gift:'Presente','gift-egg':'Ovo recebido',static:'Encontro fixo','npc-trade':'Troca com personagem','pokemon-ranger':'Transferência de Pokémon Ranger','honey-tree':'Árvore de Honey','roaming-grass':'Errante · grama','roaming-water':'Errante · água','feebas-tile-fishing':'Feebas · quadrados especiais de pesca'};
 const timeLabels={'time-morning':'Manhã','time-day':'Dia','time-night':'Noite',any:'Todos os horários'};
 const caughtToggle=name=>{progress.caught=progress.caught.includes(name)?progress.caught.filter(n=>n!==name):[...progress.caught,name];save();};
 function save(){store.save(progress);refresh();}
 function closeSheet(){ $('detail').classList.remove('open');$('scrim').hidden=true;document.body.style.overflow='';opener?.focus({preventScroll:true});opener=null; }
 function select(id,button,table){
  if(!byId.has(id))return;
  if(current!==id){section='';groupLimit=8;itemLimit=8;}current=id;if(table){section=table.sections[0];tableMode=table.percentScope==='ordinary'?'ordinary':'all';const candidates=queries.forArea(id).filter(t=>t.sections.includes(section)&&(tableMode==='all'||t.percentScope==='ordinary'));groupLimit=Math.max(8,candidates.indexOf(table)+1);}switchView('map');renderMap();renderDetail();
  history.replaceState(null,'','#map/'+id);
  if(innerWidth<=900){opener=button||document.activeElement;$('detail').classList.add('open');$('scrim').hidden=false;document.body.style.overflow='hidden';$('detail').scrollTop=0;$('detail').querySelector('.detail-close').focus();}
 }
 function bindPlaces(container){container.querySelectorAll('[data-place]').forEach(b=>{b.onclick=()=>select(b.dataset.place,b);});}
 function renderDetail(){
  const a=byId.get(current),p=pack.places[current],all=queries.forArea(current),q=$('search').value.trim(),allItems=items.forArea(current),rows=q&&items.search(current,q).length?items.search(current,q):allItems;
  const sectors=[...new Set(all.flatMap(t=>t.sections))];if(!sectors.includes(section))section=sectors[0]||'';
  const tables=all.filter(t=>t.sections.includes(section)&&(tableMode==='all'||t.percentScope==='ordinary'));
  const neighbors=pack.map.paths.flatMap(([from,to])=>from===current?[to]:to===current?[from]:[]),chapters=pack.chapters.filter(c=>c.path.includes(current));
  $('detail').innerHTML=`<div class="detail-top"><span class="detail-overline">FICHA DE CAMPO / PLATINUM</span><button class="detail-close" aria-label="Fechar detalhes">×</button><h2>${esc(a[1])}</h2>${p.post?'<span class="pill gold">Pós-jogo / acesso especial</span>':''}</div><div class="detail-body"><section class="detail-section"><h3>O que fazer aqui</h3><p>${esc(p.description)}</p>${chapters.length?'<button type="button" id="pt-read-chapter">Ler o roteiro desta área →</button>':''}</section><section class="detail-section"><h3>Encontros</h3>${sectors.length?`<label class="pt-control">Setor <select id="pt-section">${sectors.map(s=>`<option ${s===section?'selected':''}>${esc(s)}</option>`).join('')}</select></label><label class="pt-control">Tabelas <select id="pt-table-mode"><option value="ordinary" ${tableMode==='ordinary'?'selected':''}>Comuns</option><option value="all" ${tableMode==='all'?'selected':''}>Comuns + condicionais e especiais</option></select></label><p class="pt-source">${tables.length} grupos neste setor. Abra um grupo para ver os Pokémon.</p>${tables.slice(0,groupLimit).map((t,i)=>{const lock=queries.lockReason(a,t);return `<details class="encounter-group" data-table="${i}" ${i===0?'open':''}><summary><span><b>${esc(methodLabels[t.method]||t.method)} · ${esc(timeLabels[t.time])}</b><small>${(t.conditions||[]).filter(c=>!['slot2-none','radar-off','swarm-no','backlot-not-mentioned'].includes(c)).map(c=>esc(PlatinumConditions.label(c))).join(' · ')}</small><small class="${lock?'availability-locked':'availability-ready'}">${lock?'Condição: '+esc(lock):'Horário e recursos compatíveis'}</small></span><span>+</span></summary><div class="encounter-content"></div></details>`;}).join('')}${tables.length>groupLimit?'<button type="button" id="pt-more-tables">Carregar mais grupos</button>':''}`:'<p>Sem tabela de encontro catalogada para este local.</p>'}<p class="pt-source">Comuns: chance dentro do método e horário. Condicionais: slots substituídos, espécies diárias ou grupos de Honey; não some alternativas. Presentes e encontros fixos não usam chance aleatória.</p></section><section class="detail-section"><h3>Itens, TMs e HMs</h3><p>TMs são consumidas ao usar; HMs podem ser reutilizadas. ${rows.length} registros nesta área.</p><div id="pt-items"></div></section>${neighbors.length?`<section class="detail-section"><h3>Perto daqui</h3><div class="nearby">${neighbors.map(id=>`<button data-place="${id}">${esc(byId.get(id)[1])}</button>`).join('')}</div></section>`:''}</div>`;
  $('detail').querySelector('.detail-close').onclick=closeSheet;bindPlaces($('detail'));
  $('pt-read-chapter')?.addEventListener('click',()=>{switchView('play');const el=$('story-chapters').querySelector('[data-chapter-id="'+chapters[0].id+'"]');el.open=true;el.scrollIntoView?.({block:'start'});});
  $('pt-section')?.addEventListener('change',e=>{section=e.target.value;groupLimit=8;renderDetail();});$('pt-table-mode')?.addEventListener('change',e=>{tableMode=e.target.value;groupLimit=8;renderDetail();});$('pt-more-tables')?.addEventListener('click',()=>{groupLimit+=8;renderDetail();});
  $('detail').querySelectorAll('[data-table]').forEach(el=>{
   function populate(){if(!el.open||el.querySelector('.encounter-content').children.length)return;const t=tables[Number(el.dataset.table)];el.querySelector('.encounter-content').innerHTML=`<div class="encounter-list">${t.pokemon.map(([n,rate,level])=>`<div class="encounter-row"><span class="encounter-mon"><strong>${esc(n)}</strong></span><span class="encounter-stats"><b>${rate==null?(t.percentScope==='fixed'?'Fixo / presente':'Não confirmada'):rate+'%'}</b><small>${/^\d/.test(level)?'Nv. ':''}${esc(level)}</small></span></div>`).join('')}</div><p class="pt-source">${t.percentScope==='conditional'?'Chances dentro do grupo ou da espécie selecionada; não incluem a probabilidade da seleção diária ou do grupo da árvore. ':''}<a href="${esc(t.source)}" target="_blank" rel="noopener">Referência dos encontros</a></p>`;}
   el.ontoggle=()=>{if(el.open)populate();else el.querySelector('.encounter-content').replaceChildren();};populate();
  });
  function renderItems(){
   $('pt-items').innerHTML=rows.length?rows.slice(0,itemLimit).map(r=>`<label class="pt-item"><input type="checkbox" data-item="${esc(r.id)}" ${progress.collectedItems.includes(r.id)?'checked':''}><span><b>${esc(r.name)}</b><small>${esc(r.where)}${r.requirements.length?' · '+esc(r.requirements.join(', ')):''}</small><a class="pt-source" href="${esc(r.source)}" target="_blank" rel="noopener">Referência</a></span></label>`).join('')+(rows.length>itemLimit?`<button type="button" id="pt-more-items">Carregar mais itens (${rows.length-itemLimit} restantes)</button>`:''):'<p>Sem ocorrência de item incluída neste local.</p>';
   $('pt-more-items')?.addEventListener('click',()=>{itemLimit+=8;renderItems();});$('pt-items').querySelectorAll('[data-item]').forEach(input=>input.onchange=()=>{const id=input.dataset.item;progress.collectedItems=input.checked?[...progress.collectedItems,id]:progress.collectedItems.filter(i=>i!==id);store.save(progress);renderProgress();});
  }
  renderItems();
 }
 function visibleAreas(){
  const q=norm($('search').value);
  return pack.areas.filter(a=>{
   const p=pack.places[a[0]],match=!q||searchIndex.get(a[0]).includes(q);
   if(filter==='post'&&!p.post)return false;if(filter==='story'&&p.post)return false;
   if(filter==='available'&&(!queries.isAvailable(a)||(q&&speciesNames.has(q)&&!queries.availableNames(a).some(n=>norm(n)===q))))return false;
   return match;
  });
 }
 function renderMap(){
  const visible=visibleAreas(),ids=new Set(visible.map(a=>a[0]));
  if(!$('map').children.length){
   $('map').innerHTML=`<image href="${pack.map.image}" width="1712" height="1500"/>`+mapped.map(a=>`<g class="node ${a[2]}" data-place="${a[0]}" role="button" tabindex="0" aria-label="${esc(a[1])}" transform="translate(${a[3]} ${a[4]})"><circle class="touch" r="20"/><circle class="${a[2]==='special'?'site-marker':'ring'}" r="${a[2]==='route'?20:12}"/><text class="${a[2]==='route'?'route-label':'label'+(a[2]==='special'?' site-label':'')}" y="${a[2]==='route'?5:-27}" text-anchor="middle">${esc(a[2]==='route'?a[1].replace('Route ',''):a[1].split(' / ')[0])}</text></g>`).join('');
   bindPlaces($('map'));
   $('map').querySelectorAll('[data-place]').forEach(n=>n.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(n.dataset.place,n);}});
  }
  $('map').querySelectorAll('[data-place]').forEach(n=>{n.classList.toggle('dimmed',!ids.has(n.dataset.place));n.classList.toggle('active',n.dataset.place===current);n.setAttribute('aria-pressed',String(n.dataset.place===current));});
  $('results-list').innerHTML=visible.map(a=>`<button class="pt-area" data-place="${a[0]}" aria-pressed="${a[0]===current}"><strong>${esc(a[1])}</strong><small>${queries.forArea(a[0]).length} tabelas · ${items.forArea(a[0]).length} itens documentados</small></button>`).join('')||'<p class="dex-empty">Nenhuma área no guia para a busca e os filtros escolhidos.</p>';
  bindPlaces($('results-list'));$('result-count').textContent=visible.length+' locais';$('map-count').textContent=pack.areas.length+' locais no guia';$('clear').hidden=!$('search').value;
 }
 function renderProgress(){
  $('badge-count').value=progress.badges;$('time-select').value=progress.time;$('starter-select').value=progress.starter;
  document.querySelectorAll('[data-resource]').forEach(i=>{i.checked=progress.resources.includes(i.dataset.resource);});
  $('progress-summary').textContent=progress.caught.filter(n=>regional.has(n)).length+'/210 Sinnoh · '+progress.caught.length+' capturas · '+progress.steps.length+'/'+totalSteps+' etapas';
  for(const id of ['league','nationalDex','events','galactic','radar'])$(id+'-toggle').checked=progress[id];$('gba-select').value=progress.gba;$('swarm-select').value=progress.swarmArea;
  if(document.activeElement!==$('play-note'))$('play-note').value=progress.note;
 }
 function showSpecies(name){
  switchView('map');$('search').value=name;filter='all';updateFilters();renderMap();
  // Gifts and later acquisition routes are intentionally not inferred from absent ordinary tables.

  const {options}=queries.forSpecies(pack.areas,name);
  if(options.length)select(options[0].area[0],null,options[0].table);
  else $('result-count').textContent='Sem encontro direto catalogado; confira evoluções, trocas e transferências.';
 }
 function renderDex(){
  const q=norm($('dex-search').value),found=(dexScope==='sinnoh'?pack.dex:pack.national).filter(([no,id,n])=>norm(n).includes(q)||String(no)===q||String(no).padStart(3,'0')===q);
  $('dex-content').innerHTML=found.length?`<div class="pt-dex-grid">${found.map(([no,id,n])=>`<article class="pt-dex-row"><span class="dex-no">${String(no).padStart(3,'0')}</span><strong>${esc(n)}</strong><button data-caught="${esc(n)}" aria-pressed="${progress.caught.includes(n)}">${progress.caught.includes(n)?'Registrado ✓':'Registrar'}</button><button data-species="${esc(n)}">Onde encontrar</button></article>`).join('')}</div>`:'<p class="dex-empty">Nenhuma entrada para esta busca.</p>';
  $('dex-content').querySelectorAll('[data-caught]').forEach(b=>b.onclick=()=>caughtToggle(b.dataset.caught));
  $('dex-content').querySelectorAll('[data-species]').forEach(b=>b.onclick=()=>showSpecies(b.dataset.species));
 }
 function renderPlay(){
  $('battle-guide').innerHTML='<details class="pt-battles"><summary>Times dos líderes, Galactic e Liga · primeiras batalhas e revanche</summary><div id="pt-battle-controls"></div></details>';
  const roster=$('battle-guide').querySelector('details');roster.ontoggle=()=>{
   if(!roster.isConnected)return;const container=roster.querySelector('#pt-battle-controls');if(!roster.open){container.replaceChildren();return;}
   container.innerHTML=`<label class="pt-control">Batalha <select id="pt-battle-select">${pack.battles.map(b=>`<option value="${b.id}">${esc(b.name)} · ${esc(b.context)}</option>`).join('')}</select></label><div id="pt-roster"></div>`;
   function show(){const battle=pack.battles.find(b=>b.id===$('pt-battle-select').value);$('pt-roster').innerHTML=`<div class="pt-dex-grid">${battle.party.map(mon=>`<article class="pt-dex-row"><strong>${esc(mon.species)} · Nv. ${mon.level}</strong>${mon.item?`<small>Item: ${esc(mon.item)}</small>`:''}<small>Golpes explícitos na fonte: ${esc(mon.moves.join(', '))}</small></article>`).join('')}</div><p class="pt-source"><a href="${esc(battle.source)}" target="_blank" rel="noopener">Time de Platinum · referência</a></p>`;}
   $('pt-battle-select').onchange=show;show();
  };
  $('story-chapters').innerHTML=pack.chapters.map((c,i)=>`<details class="story-chapter" data-chapter-id="${c.id}" ${i===0?'open':''}><summary><span class="story-number">${String(i+1).padStart(2,'0')}</span><b>${esc(c.title)}</b></summary><div class="story-chapter-body">${c.steps.map(([id,text])=>`<label class="pt-step"><input type="checkbox" data-step="${id}" ${progress.steps.includes(id)?'checked':''}><span>${esc(text)}</span></label>`).join('')}<div class="nearby">${c.path.map(id=>`<button data-place="${id}">${esc(byId.get(id)[1])}</button>`).join('')}</div><p class="pt-source"><a href="${esc(c.source)}" target="_blank" rel="noopener">Referência da etapa</a> · roteiro escrito para este guia</p></div></details>`).join('');
  bindPlaces($('story-chapters'));$('story-chapters').querySelectorAll('[data-step]').forEach(input=>input.onchange=()=>{progress.steps=input.checked?[...progress.steps,input.dataset.step]:progress.steps.filter(id=>id!==input.dataset.step);store.save(progress);renderProgress();});
 }
 function updateFilters(){document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',filter===b.dataset.filter);b.setAttribute('aria-pressed',String(filter===b.dataset.filter));});}
 function switchView(next){
  closeSheet();view=next;
  for(const id of ['map','dex','play'])$(id+'-view').hidden=id!==view;
  document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',view===b.dataset.view);b.setAttribute('aria-pressed',String(view===b.dataset.view));});
  $('page-title').textContent={map:'Mapa de Sinnoh',dex:'Pokédex de Platinum',play:'Sua jornada em Sinnoh'}[view];
  if(view==='dex')renderDex();else $('dex-content').replaceChildren();
  if(view==='play')renderPlay();else{$('story-chapters').replaceChildren();$('battle-guide').replaceChildren();}
 }
 function refresh(){renderProgress();renderMap();if(view==='dex')renderDex();if(view==='play')renderPlay();if($('detail').children.length)renderDetail();}
 document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>switchView(b.dataset.view));
 document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;updateFilters();renderMap();});
 $('search').oninput=renderMap;$('clear').onclick=()=>{$('search').value='';renderMap();$('search').focus();};$('dex-search').oninput=renderDex;
 for(const [id,key,convert] of [['badge-count','badges',Number],['time-select','time',String],['starter-select','starter',String]])$(id).onchange=()=>{progress[key]=convert($(id).value);save();};
 for(const id of ['league','nationalDex','events','galactic','radar'])$(id+'-toggle').onchange=()=>{progress[id]=$(id+'-toggle').checked;save();};
 $('gba-select').onchange=()=>{progress.gba=$('gba-select').value;save();};
 $('swarm-select').innerHTML='<option value="">Não informado</option>'+pack.areas.filter(a=>pack.encounters[a[0]]?.some(t=>t.conditions?.includes('swarm-yes'))).map(a=>`<option value="${a[0]}">${esc(a[1])}</option>`).join('');$('swarm-select').onchange=()=>{progress.swarmArea=$('swarm-select').value;save();};
 $('dex-scope').onchange=()=>{dexScope=$('dex-scope').value;renderDex();};
 document.querySelectorAll('[data-resource]').forEach(input=>input.onchange=()=>{const id=input.dataset.resource;progress.resources=input.checked?[...progress.resources,id]:progress.resources.filter(r=>r!==id);save();});
 $('play-note').oninput=()=>{progress.note=$('play-note').value;store.save(progress);};
 $('scrim').onclick=closeSheet;document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('detail').classList.contains('open'))closeSheet();});
 function applyZoom(){const svg=$('map');$('map-viewport').classList.toggle('overview',zoom===1);svg.style.width=zoom===1?'100%':1712*zoom+'px';svg.style.minWidth=zoom===1?'0':1712*zoom+'px';}
 $('zoom-in').onclick=()=>{zoom=Math.min(2,zoom+.25);applyZoom();};$('zoom-out').onclick=()=>{zoom=Math.max(1,zoom-.25);applyZoom();};$('fit-map').onclick=()=>{zoom=1;applyZoom();};
 let drag=null;const viewport=$('map-viewport');viewport.addEventListener('pointerdown',e=>{if(e.target.closest('[data-place]')||e.button!==0||e.pointerType==='touch')return;drag={x:e.clientX,y:e.clientY,left:viewport.scrollLeft,top:viewport.scrollTop};viewport.setPointerCapture(e.pointerId);});viewport.addEventListener('pointermove',e=>{if(drag){viewport.scrollLeft=drag.left+drag.x-e.clientX;viewport.scrollTop=drag.top+drag.y-e.clientY;}});viewport.addEventListener('pointerup',()=>{drag=null;});viewport.addEventListener('pointercancel',()=>{drag=null;});
 $('export-progress').onclick=()=>{const blob=new Blob([JSON.stringify({...progress,edition:pack.edition.id},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='platinum-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 $('import-progress').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>1000000)throw Error('Arquivo muito grande.');const p=JSON.parse(await file.text());if(p.edition!==pack.edition.id||p.schemaVersion!==1||!Array.isArray(p.caught))throw Error('Use uma cópia de progresso de Platinum deste guia.');progress=normalize(p);save();}catch(err){$('save-status').textContent=err.message||'Não foi possível ler a cópia.';}finally{e.target.value='';}};
 refresh();renderDetail();if(innerWidth<=900){zoom=1.25;applyZoom();viewport.scrollLeft=Math.max(0,byId.get(current)[3]*zoom-viewport.clientWidth/2);viewport.scrollTop=Math.max(0,byId.get(current)[4]*zoom-viewport.clientHeight/2);}
 const initial=location.hash.slice(1).split('/');if(initial[0]==='map'&&byId.has(initial[1]))select(initial[1]);else if(['dex','play'].includes(initial[0]))switchView(initial[0]);
})();
