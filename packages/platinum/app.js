/* Small pilot client; legacy Unova clients and journeys stay independent. */
(async function(){
 'use strict';
 const pack=GameRegistry.open('pokemon-platinum'),$=id=>document.getElementById(id);
 const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const norm=v=>String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
 const byId=new Map(pack.areas.map(a=>[a[0],a])),names=new Set(pack.dex.map(d=>d[2]));
 const steps=new Set(pack.chapters.flatMap(c=>c.steps.map(s=>s[0]))),resources=['old-rod','good-rod','super-rod','surf'];
 const items=pack.queries.items;
 function normalize(p={}){
  return {edition:pack.edition.id,schemaVersion:1,caught:[...new Set((Array.isArray(p.caught)?p.caught:[]).filter(n=>names.has(n)))],
   collectedItems:items.normalizeCollected(p.collectedItems),steps:[...new Set((Array.isArray(p.steps)?p.steps:[]).filter(id=>steps.has(id)))],
   badges:Number.isInteger(p.badges)?Math.max(0,Math.min(8,p.badges)):0,
   time:['all','time-morning','time-day','time-night'].includes(p.time)?p.time:'all',
   starter:['Turtwig','Chimchar','Piplup'].includes(p.starter)?p.starter:'',
   resources:[...new Set((Array.isArray(p.resources)?p.resources:[]).filter(id=>resources.includes(id)))],note:typeof p.note==='string'?p.note.slice(0,1000):''};
 }
 let progress=normalize(),view='map',current='twinleaf',filter='all',zoom=1,opener=null;
 const store=createProgressStore({key:pack.edition.progress.key,normalize,onStatus:s=>{$('save-status').textContent=s.text;},onExternal:p=>{progress=p;refresh();}});
 progress=(await store.load())||progress;
 const queries=pack.queries.createEncounters({getProgress:()=>progress});
 const methodLabels={walk:'Caminhando','old-rod':'Old Rod','good-rod':'Good Rod','super-rod':'Super Rod',surf:'Surf'};
 const timeLabels={'time-morning':'Manhã','time-day':'Dia','time-night':'Noite',any:'Todos os horários'};
 const caughtToggle=name=>{progress.caught=progress.caught.includes(name)?progress.caught.filter(n=>n!==name):[...progress.caught,name];save();};
 function save(){store.save(progress);refresh();}
 function closeSheet(){ $('detail').classList.remove('open');$('scrim').hidden=true;document.body.style.overflow='';opener?.focus({preventScroll:true});opener=null; }
 function select(id,button){
  if(!byId.has(id))return;
  current=id;switchView('map');renderMap();renderDetail();
  history.replaceState(null,'','#map/'+id);
  if(innerWidth<=900){opener=button||document.activeElement;$('detail').classList.add('open');$('scrim').hidden=false;document.body.style.overflow='hidden';$('detail').scrollTop=0;$('detail').querySelector('.detail-close').focus();}
 }
 function bindPlaces(container){container.querySelectorAll('[data-place]').forEach(b=>{b.onclick=()=>select(b.dataset.place,b);});}
 function renderDetail(){
  const a=byId.get(current),p=pack.places[current],tables=queries.forArea(current),rows=items.forArea(current);
  const neighbors=pack.map.paths.flatMap(([from,to])=>from===current?[to]:to===current?[from]:[]);
  $('detail').innerHTML=`<div class="detail-top"><span class="detail-overline">FICHA DE CAMPO / PLATINUM</span><button class="detail-close" aria-label="Fechar detalhes">×</button><h2>${esc(a[1])}</h2></div><div class="detail-body"><section class="detail-section"><h3>O que fazer aqui</h3><p>${esc(p.description)}</p></section>${current==='r201'?`<section class="detail-section"><h3>Seu inicial</h3><p>Rowan oferece um Pokémon no nível 5. Escolha Turtwig, Chimchar ou Piplup em “Minha jornada”. A escolha não marca automaticamente uma captura.</p></section>`:''}<section class="detail-section"><h3>Encontros comuns</h3>${tables.length?tables.map((t,i)=>{const lock=queries.lockReason(a,t);return `<details class="encounter-group" ${i===0?'open':''}><summary><span><b>${esc(methodLabels[t.method])} · ${esc(timeLabels[t.time])}</b><small>${esc(t.sections.join(' · '))}</small><small class="${lock?'availability-locked':'availability-ready'}">${lock?'Requisito: '+esc(lock):'Horário e recursos compatíveis'}</small></span><span>+</span></summary><div class="encounter-content"><div class="encounter-list">${t.pokemon.map(([n,rate,level])=>`<div class="encounter-row"><span class="encounter-mon"><strong>${esc(n)}</strong></span><span class="encounter-stats"><b>${rate}%</b><small>Nv. ${esc(level)}</small></span></div>`).join('')}</div></div></details>`;}).join(''):'<p>Nenhuma tabela de encontro comum incluída aqui no piloto.</p>'}<p class="pt-source">Percentuais dentro de cada método e horário. <a href="${esc(tables[0]?.source||'https://github.com/PokeAPI/pokeapi')}" target="_blank" rel="noopener">Fonte dos dados</a>.</p></section><section class="detail-section"><h3>Itens · seleção verificada</h3><p>Em Platinum, TMs são consumidas ao usar; HMs podem ser reutilizadas.</p>${rows.length?rows.map(r=>`<label class="pt-item"><input type="checkbox" data-item="${esc(r.id)}" ${progress.collectedItems.includes(r.id)?'checked':''}><span><b>${esc(r.name)}</b><small>${esc(r.where)}${r.requirements.length?' · '+esc(r.requirements.join(', ')):''}</small><a class="pt-source" href="${esc(r.source)}" target="_blank" rel="noopener">Referência</a></span></label>`).join(''):'<p>Itens desta área ainda não incluídos no recorte.</p>'}</section><section class="detail-section"><h3>Perto daqui</h3><div class="nearby">${neighbors.map(id=>`<button data-place="${id}">${esc(byId.get(id)[1])}</button>`).join('')}</div></section></div>`;
  $('detail').querySelector('.detail-close').onclick=closeSheet;bindPlaces($('detail'));
  $('detail').querySelectorAll('[data-item]').forEach(input=>input.onchange=()=>{const id=input.dataset.item;progress.collectedItems=input.checked?[...progress.collectedItems,id]:progress.collectedItems.filter(i=>i!==id);store.save(progress);renderProgress();});
 }
 function visibleAreas(){
  const q=norm($('search').value);
  return pack.areas.filter(a=>{
   const encounters=filter==='available'?queries.availableNames(a):queries.forArea(a[0]).flatMap(t=>t.pokemon.map(r=>r[0]));
   const starter=a[0]==='r201'?['Turtwig','Chimchar','Piplup']:[];
   const hay=norm([a[1],...encounters,...starter].join(' '));
   const match=!q||hay.includes(q)||items.search(a[0],q).length;
   return match&&(filter!=='available'||queries.isAvailable(a)||starter.length>0);
  });
 }
 function renderMap(){
  const visible=visibleAreas(),ids=new Set(visible.map(a=>a[0]));
  if(!$('map').children.length){
   $('map').innerHTML=`<image href="${pack.map.image}" width="1712" height="1080"/>`+pack.map.paths.map(([from,to])=>{const a=byId.get(from),b=byId.get(to);return `<path d="M${a[3]} ${a[4]}L${b[3]} ${b[4]}" fill="none" stroke="#eee3af" stroke-width="24"/><path d="M${a[3]} ${a[4]}L${b[3]} ${b[4]}" fill="none" stroke="#7a8478" stroke-width="5"/>`;}).join('')+pack.areas.map(a=>`<g class="node ${a[2]}" data-place="${a[0]}" role="button" tabindex="0" aria-label="${esc(a[1])}" transform="translate(${a[3]} ${a[4]})"><circle class="touch" r="48"/><circle class="${a[2]==='special'?'site-marker':'ring'}" r="19"/><text class="label" y="-39" text-anchor="middle">${esc(a[1].split(' / ')[0])}</text></g>`).join('');
   bindPlaces($('map'));
   $('map').querySelectorAll('[data-place]').forEach(n=>n.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(n.dataset.place,n);}});
  }
  $('map').querySelectorAll('[data-place]').forEach(n=>{n.classList.toggle('dimmed',!ids.has(n.dataset.place));n.classList.toggle('active',n.dataset.place===current);n.setAttribute('aria-pressed',String(n.dataset.place===current));});
  $('results-list').innerHTML=visible.map(a=>`<button class="pt-area" data-place="${a[0]}" aria-pressed="${a[0]===current}"><strong>${esc(a[1])}</strong><small>${queries.forArea(a[0]).length} tabelas comuns · ${items.forArea(a[0]).length} itens documentados</small></button>`).join('')||'<p class="dex-empty">Nenhuma área neste recorte para a busca e os filtros escolhidos.</p>';
  bindPlaces($('results-list'));$('result-count').textContent=visible.length+' locais';$('map-count').textContent=pack.areas.length+' locais no piloto';$('clear').hidden=!$('search').value;
 }
 function renderProgress(){
  $('badge-count').value=progress.badges;$('time-select').value=progress.time;$('starter-select').value=progress.starter;
  document.querySelectorAll('[data-resource]').forEach(i=>{i.checked=progress.resources.includes(i.dataset.resource);});
  $('progress-summary').textContent=progress.caught.length+'/210 Sinnoh · '+progress.steps.length+'/9 etapas';
  if(document.activeElement!==$('play-note'))$('play-note').value=progress.note;
 }
 function showSpecies(name){
  switchView('map');$('search').value=name;filter='all';updateFilters();renderMap();
  // Gifts and later acquisition routes are intentionally not inferred from absent ordinary tables.
  if(name===progress.starter||['Turtwig','Chimchar','Piplup'].includes(name)){select('r201');return;}
  const {options}=queries.forSpecies(pack.areas,name);
  if(options.length)select(options[0].area[0]);
  else $('result-count').textContent='Sem fonte incluída neste recorte';
 }
 function renderDex(){
  const q=norm($('dex-search').value),found=pack.dex.filter(([no,id,n])=>norm(n).includes(q)||String(no)===q||String(no).padStart(3,'0')===q);
  $('dex-content').innerHTML=found.length?`<div class="pt-dex-grid">${found.map(([no,id,n])=>`<article class="pt-dex-row"><span class="dex-no">${String(no).padStart(3,'0')}</span><strong>${esc(n)}</strong><button data-caught="${esc(n)}" aria-pressed="${progress.caught.includes(n)}">${progress.caught.includes(n)?'Registrado ✓':'Registrar'}</button><button data-species="${esc(n)}">Onde encontrar</button></article>`).join('')}</div>`:'<p class="dex-empty">Nenhuma entrada para esta busca.</p>';
  $('dex-content').querySelectorAll('[data-caught]').forEach(b=>b.onclick=()=>caughtToggle(b.dataset.caught));
  $('dex-content').querySelectorAll('[data-species]').forEach(b=>b.onclick=()=>showSpecies(b.dataset.species));
 }
 function renderPlay(){
  $('story-chapters').innerHTML=pack.chapters.map((c,i)=>`<details class="story-chapter" open><summary><span class="story-number">0${i+1}</span><b>${esc(c.title)}</b></summary><div class="story-chapter-body">${c.steps.map(([id,text])=>`<label class="pt-step"><input type="checkbox" data-step="${id}" ${progress.steps.includes(id)?'checked':''}><span>${esc(text)}</span></label>`).join('')}<div class="nearby">${c.path.map(id=>`<button data-place="${id}">${esc(byId.get(id)[1])}</button>`).join('')}</div><p class="pt-source"><a href="${esc(c.source)}" target="_blank" rel="noopener">Referência da etapa</a> · roteiro escrito para este guia</p></div></details>`).join('');
  bindPlaces($('story-chapters'));$('story-chapters').querySelectorAll('[data-step]').forEach(input=>input.onchange=()=>{progress.steps=input.checked?[...progress.steps,input.dataset.step]:progress.steps.filter(id=>id!==input.dataset.step);store.save(progress);renderProgress();});
 }
 function updateFilters(){document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',filter===b.dataset.filter);b.setAttribute('aria-pressed',String(filter===b.dataset.filter));});}
 function switchView(next){
  closeSheet();view=next;
  for(const id of ['map','dex','play'])$(id+'-view').hidden=id!==view;
  document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',view===b.dataset.view);b.setAttribute('aria-pressed',String(view===b.dataset.view));});
  $('page-title').textContent={map:'Mapa de Sinnoh',dex:'Pokédex de Platinum',play:'Sua jornada em Sinnoh'}[view];
  if(view==='dex')renderDex();else $('dex-content').replaceChildren();
  if(view==='play')renderPlay();else $('story-chapters').replaceChildren();
 }
 function refresh(){renderProgress();renderMap();if(view==='dex')renderDex();if(view==='play')renderPlay();if($('detail').children.length)renderDetail();}
 document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>switchView(b.dataset.view));
 document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;updateFilters();renderMap();});
 $('search').oninput=renderMap;$('clear').onclick=()=>{$('search').value='';renderMap();$('search').focus();};$('dex-search').oninput=renderDex;
 for(const [id,key,convert] of [['badge-count','badges',Number],['time-select','time',String],['starter-select','starter',String]])$(id).onchange=()=>{progress[key]=convert($(id).value);save();};
 document.querySelectorAll('[data-resource]').forEach(input=>input.onchange=()=>{const id=input.dataset.resource;progress.resources=input.checked?[...progress.resources,id]:progress.resources.filter(r=>r!==id);save();});
 $('play-note').oninput=()=>{progress.note=$('play-note').value;store.save(progress);};
 $('scrim').onclick=closeSheet;document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('detail').classList.contains('open'))closeSheet();});
 function applyZoom(){const svg=$('map');$('map-viewport').classList.toggle('overview',zoom===1);svg.style.width=zoom===1?'100%':1712*zoom+'px';svg.style.minWidth=zoom===1?'0':1712*zoom+'px';}
 $('zoom-in').onclick=()=>{zoom=Math.min(2,zoom+.25);applyZoom();};$('zoom-out').onclick=()=>{zoom=Math.max(1,zoom-.25);applyZoom();};$('fit-map').onclick=()=>{zoom=1;applyZoom();};
 let drag=null;const viewport=$('map-viewport');viewport.addEventListener('pointerdown',e=>{if(e.target.closest('[data-place]')||e.button!==0||e.pointerType==='touch')return;drag={x:e.clientX,y:e.clientY,left:viewport.scrollLeft,top:viewport.scrollTop};viewport.setPointerCapture(e.pointerId);});viewport.addEventListener('pointermove',e=>{if(drag){viewport.scrollLeft=drag.left+drag.x-e.clientX;viewport.scrollTop=drag.top+drag.y-e.clientY;}});viewport.addEventListener('pointerup',()=>{drag=null;});viewport.addEventListener('pointercancel',()=>{drag=null;});
 $('export-progress').onclick=()=>{const blob=new Blob([JSON.stringify({...progress,edition:pack.edition.id},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='platinum-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 $('import-progress').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>1000000)throw Error('Arquivo muito grande.');const p=JSON.parse(await file.text());if(p.edition!==pack.edition.id||p.schemaVersion!==1||!Array.isArray(p.caught))throw Error('Use uma cópia de progresso de Platinum deste guia.');progress=normalize(p);save();}catch(err){$('save-status').textContent=err.message||'Não foi possível ler a cópia.';}finally{e.target.value='';}};
 refresh();renderDetail();const initial=location.hash.slice(1).split('/');if(initial[0]==='map'&&byId.has(initial[1]))select(initial[1]);else if(['dex','play'].includes(initial[0]))switchView(initial[0]);
})();
