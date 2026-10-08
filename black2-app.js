/* Generated from app.js; Black 1 UI with Black 2 data and walkthrough. */
(async () => {
  const gamePackage = GameRegistry.open('pokemon-black2-complete-unova-1.12');
  const { encounters: encounterTables, items: itemTables, chapters: walkthroughChapters, map: gameMap } = gamePackage;
  const areas = gamePackage.areas.filter((area, i) => gamePackage.areas.findIndex(other => other[0] === area[0]) === i);

  const coords = gameMap.coordinates;
  areas.forEach(area => { if (coords[area[0]]) [area[3],area[4]]=coords[area[0]]; });
  const byId = new Map(areas.map(area => [area[0], area]));
  const specialEncounters=Black2Bridge.specials;
  const areaNotes={};
  for (const area of areas) {
    const wild=(encounterTables[area[0]]||[]).flatMap(table=>table.pokemon.map(mon=>mon[0]));
    const special=(specialEncounters[area[0]]||[]).flatMap(entry=>entry[0].split(' / '));
    area[9]=[...new Set([...wild,...special])].join(',');
  }
  const $ = id => document.getElementById(id);
  const map = $('map'), viewport = $('map-viewport'), detail = $('detail'), scrim = $('scrim'), list = $('results-list');
  const search = $('search'), clear = $('clear');
  const mobile = () => matchMedia('(max-width: 900px)').matches;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const norm = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const category = area => area[5] === 'post' ? 'post' : area[2];
  const typeLabel = area => area[2] === 'city' ? 'Cidade' : area[2] === 'route' ? 'Rota' : 'Área especial';
  const regionalLookup = new Map(unovaDex.map(([number,name]) => [name,number]));
  const regionalSet = new Set(regionalLookup.keys());
  const dex = name => {
    if (regionalLookup.has(name)) return {number:'#'+String(regionalLookup.get(name)).padStart(3,'0'),scope:'Pokédex de Unova'};
    const nat = nationalNumbers[name] || dexNumbers[name];
    if (!nat) return {number:'—',scope:'Sem número'};
    return {number:'Nat. #'+String(nat).padStart(3,'0'),scope:'Pokédex Nacional'};
  };
  const speciesHTML = name => { const n=dex(name); return `<span class="pokemon-chip"><b class="dex-no${n.scope==='Pokédex Nacional'?' national':''}" title="${n.scope}">${esc(n.number)}</b>${esc(name)}</span>`; };
  const onMap = gameMap.onMap;
  const mappedAreas = areas.filter(onMap);
  const mapAnchor = gameMap.anchors;
  const paths=Black2Bridge.paths;
  const labelOffsets = {asp:[0,-39],"b2-floccesy-town":[0,-39],"b2-virbank-city":[0,-39],"b2-humilau-city":[-15,-39],"b2-lentimas-town":[0,-39],nu:[-40,-39],acc:[-40,-39],str:[-40,-41],nac:[-37,-40],cas:[18,53],nim:[-20,-43],dri:[-25,-43],mis:[-25,-43],ici:[-25,-43],ope:[-25,-43],league:[30,-17],lac:[-25,-43],und:[26,-25],black:[-18,-43],anv:[0,-38]};
  let current = 'asp', phase = 'all', zoom = 1, visible = areas;
  const journeyOrder=[...new Set(walkthroughChapters.flatMap(c=>c.path))];
  const orderedAreas = [...journeyOrder.map(id => byId.get(id)).filter(Boolean), ...areas.filter(area => !journeyOrder.includes(area[0]))];
  const firstPlace = new Map();
  for (const area of orderedAreas) for (const name of (area[9] || '').split(',').filter(Boolean)) if (!firstPlace.has(name)) firstPlace.set(name, area);
  const fieldSpecies = [...firstPlace.keys()].filter(name => regionalSet.has(name) || nationalNumbers[name] || dexNumbers[name]);
  const extraSpecies = fieldSpecies.filter(name => !regionalSet.has(name)).sort((a,b)=>(nationalNumbers[a]||dexNumbers[a])-(nationalNumbers[b]||dexNumbers[b]));
  const allSpecies = [...unovaDex.map(row=>row[1]),...extraSpecies];
  const acquisition=Black2Bridge.acquisition;
  const itemGuide=createItemGuide(itemTables);
  let itemFilter='all';
  let adventure=null, cloudSync=null, teamPlanner=null, playingGuide=null;
  const storageKey=gamePackage.edition.progress.key;
  const defaults={badges:0,league:false,surf:false,strength:false,cobalion:false,rod:false,season:'all',trades:false,events:false,starter:'',fossil:'',caught:[],collectedItems:[],tasks:[],team:[],notes:{},teamPlan:{},playArea:'',playNote:'',spoilerFree:false};
  function normalizeProgress(value) {
    const clean={...defaults,caught:[],collectedItems:[],tasks:[],team:[],notes:{},teamPlan:{}};
    if(!value||typeof value!=='object')return clean;
    clean.caught=Array.isArray(value.caught)?[...new Set(value.caught.filter(name=>!!pokemonGuideData.pokemon[name]))]:[];
    clean.collectedItems=itemGuide.normalizeCollected([...(Array.isArray(value.collectedItems)?value.collectedItems:[]),...(Array.isArray(value.items)?value.items:[])]);
    clean.steps=Array.isArray(value.steps)?value.steps.filter(id=>black2Chapters.some(c=>c.steps.some(step=>step.id===id))):[];
    clean.chapter=Number.isInteger(value.chapter)?Math.max(0,Math.min(21,value.chapter)):0;
    if(Number.isInteger(value.badges)&&value.badges>=0&&value.badges<=8)clean.badges=value.badges;
    for(const key of ['league','surf','strength','cobalion','rod','trades','events'])clean[key]=value[key]===true;
    if(['all','Spring','Summer','Autumn','Winter'].includes(value.season))clean.season=value.season;
    if(['Snivy','Tepig','Oshawott'].includes(value.starter))clean.starter=value.starter;
    if(['Tirtouga','Archen'].includes(value.fossil))clean.fossil=value.fossil;
    clean.spoilerFree=value.spoilerFree===true;
    clean.team=Array.isArray(value.team)?[...new Set(value.team.filter(n=>allSpecies.includes(n)))].slice(0,6):[];
    clean.playArea=byId.has(value.playArea)?value.playArea:'';
    clean.playNote=String(value.playNote||value.note||'').slice(0,1000);
    clean.tasks=Array.isArray(value.tasks)?[...new Set(value.tasks.filter(id=>black2Chapters.some(c=>c.steps.some(s=>s.id===id))))]:[];
    if(value.notes&&typeof value.notes==='object'&&!Array.isArray(value.notes))for(const [id,note] of Object.entries(value.notes))if(byId.has(id)&&typeof note==='string')clean.notes[id]=note.slice(0,1000);
    return clean;
  }
  let progress=normalizeProgress(null), progressReady=false;
  const progressStore=createProgressStore({
    key:storageKey,normalize:normalizeProgress,
    onStatus:({state,text})=>{const status=document.getElementById('save-status');status.dataset.state=state;status.textContent=text;},
    onExternal:value=>{progress=value;if(progressReady){renderProgress();renderDexList();applyFilters();renderDetail();renderStoryOutline();renderWalkthrough();adventure?.refresh();}}
  });
  progress=(await progressStore.load())||progress;
  const save=()=>{const saved=progressStore.save(progress);adventure?.refresh();cloudSync?.schedule();return saved;};
  let caughtSource, caughtCache;
  const caught=()=>{if(caughtSource!==progress.caught){caughtSource=progress.caught;caughtCache=new Set(caughtSource);}return caughtCache;};
  const stage=Black2Bridge.stage;
  function spoilerLocked(area){
    if(!progress.spoilerFree)return false;
    if(!area)return true;
    
    if(area[5]==='post'&&!progress.league)return true;
    return (stage[area[0]]??0)>progress.badges;
  }
  function isSpeciesVisible(name){
    if(!progress.spoilerFree)return true;
    
    const rank=firstRank.get(name);
    if(rank!==undefined)return rank>=100?progress.league:rank<=progress.badges;
    const parent=pokemonGuideData.pokemon[name]?.parent;
    return parent?isSpeciesVisible(parent):progress.league;
  }
  const firstRank=new Map();
  function recordFirst(name,area,rank) {
    if(!firstRank.has(name)||rank<firstRank.get(name)){firstRank.set(name,rank);firstPlace.set(name,area);}
  }
  for(const area of orderedAreas){
    for(const table of encounterTables[area[0]]||[]){
      const req=table.requires||{};
      let rank=req.league||area[5]==='post'||/Fishing|Swarms/.test(table.method)?100:Math.max(stage[area[0]]??0,req.badges??0);
      if(req.surf||/Surfing/.test(table.method)||['r17','r18','p2','mc'].includes(area[0]))rank=Math.max(rank,5);
      if(req.cobalion)rank=Math.max(rank,6);
      for(const [name] of table.pokemon)recordFirst(name,area,rank);
    }
    for(const entry of specialEncounters[area[0]]||[]){
      let rank=area[5]==='post'?100:stage[area[0]]??0;
      if(/Evento|Distribuição/.test(entry[1]))rank=200;
      
      
      
      
      for(const name of entry[0].split(' / '))recordFirst(name,area,rank);
    }
  }
  function lockReason(area,table={}) {
    if(!area)return 'Local não cadastrado';
    const req=table.requires||{},method=table.method||'',seasons=table.seasons||[];
    if((area[5]==='post'||req.league)&&!progress.league)return 'Conclua a Liga';
    const badges=req.badges??stage[area[0]]??0;
    if(badges>progress.badges)return `Avance até ${badges} insígnias (referência de acesso)`;
    if((req.surf||['r17','r18','p2','mc'].includes(area[0])||/Surfing/.test(method))&&!progress.surf)return 'Você precisa de Surf';
    if(req.strength&&!progress.strength)return 'Você precisa de Strength';
    if(/Fishing/.test(method)&&!progress.rod)return 'Você precisa da Super Rod, recebida em Aspertia no pós-jogo';
    if(seasons.length&&progress.season==='all')return 'Informe a estação em Meu progresso';
    if(seasons.length&&!seasons.includes(progress.season))return 'Outra estação';
    const conditions=table.conditions||[];
    if(conditions.length)return conditions.map(Black2Bridge.conditionLabel).join(' · ');
    return '';
  }
  function specialLock(area,entry,species='') {
    const base=lockReason(area,{requires:{league:entry[3]?.post},conditions:entry[3]?.conditions||[]});
    if(base)return base;
    if(entry[1]==='Presente'&&['Snivy','Tepig','Oshawott'].includes(entry[0])&&progress.starter&&entry[0]!==progress.starter)return 'Você escolheu outro inicial';
    if(entry[1]==='Troca com personagem'&&!progress.trades)return 'Inclua trocas com personagens em Meu progresso';
    return '';
  }
  const isAvailable=area => (encounterTables[area[0]]||[]).some(t=>!lockReason(area,t)) || (specialEncounters[area[0]]||[]).some(entry=>!specialLock(area,entry));
  function availableNames(area) {
    const wild=(encounterTables[area[0]]||[]).filter(t=>!lockReason(area,t)).flatMap(t=>t.pokemon.map(row=>row[0]));
    const monkey={Snivy:'Panpour',Tepig:'Pansage',Oshawott:'Pansear'};
    const special=(specialEncounters[area[0]]||[]).filter(entry=>!specialLock(area,entry)).flatMap(entry=>{
      if(entry[0]==='Snivy / Tepig / Oshawott')return progress.starter?[progress.starter]:[];
      if(entry[0]==='Pansage / Pansear / Panpour')return monkey[progress.starter]?[monkey[progress.starter]]:[];
      if(entry[0]==='Tirtouga / Archen')return progress.fossil?[progress.fossil]:[];
      return entry[0].split(' / ');
    });
    return [...new Set([...wild,...special])].filter(name=>regionalSet.has(name)||extraSpecies.includes(name));
  }
  function renderProgress() {
    $('badge-count').value=String(progress.badges);
    $('league-toggle').checked=!!progress.league;$('surf-toggle').checked=!!progress.surf;$('strength-toggle').checked=!!progress.strength;$('cobalion-toggle').checked=!!progress.cobalion;$('rod-toggle').checked=!!progress.rod;
    $('season-select').value=progress.season;$('trade-toggle').checked=!!progress.trades;$('event-toggle').checked=!!progress.events;
    $('starter-select').value=progress.starter;$('fossil-select').value=progress.fossil;
    const registered=progress.caught.filter(name=>regionalSet.has(name)).length;
    adventure?.refresh();
    $('progress-summary').textContent=`${registered}/301 Unova · ${progress.caught.length}/${unovaDex.length+extraSpecies.length} no guia`;
  }
  let listOrder = 'dex', listScope = 'unova';
  const speciesSearchIndex=new Map();
  for(const name of allSpecies)for(const key of [norm(name),norm(dex(name).number)])if(!speciesSearchIndex.has(key))speciesSearchIndex.set(key,name);
  const areaSearchIndex=new Map(areas.map(area=>[area[0],norm([area[1],area[6],area[9],(area[9]||'').split(',').filter(Boolean).map(name=>dex(name).number).join(' ')].join(' '))]));
  function matches(area) {
    const q = norm(search.value.trim());
    const exact=speciesSearchIndex.get(q);
    const p = phase === 'all' || (phase === 'available' ? exact ? availableNames(area).includes(exact) : isAvailable(area) : phase === 'legend' ? area[11] === 'legend' || area[5] === 'legend' : area[5] === phase);
    const hay = areaSearchIndex.get(area[0]);
    return !spoilerLocked(area) && p && (!q || hay.includes(q) || itemGuide.forArea(area[0]).some(row=>itemGuide.matches(row,q)));
  }
  let mapTopology='',mapNodes=new Map();
  function drawMap() {
    const shown=mappedAreas.filter(a=>!spoilerLocked(a)),topology=shown.map(a=>a[0]).join('|');
    if(mapTopology===topology&&mapNodes.size){
      for(const d of shown){const node=mapNodes.get(d[0]),cls=`node ${category(d)}${d[0]===current?' active':''}${visible.includes(d)?'':' dimmed'}${(d[9]?!isAvailable(d):!!lockReason(d))?' locked':''}`;if(node.getAttribute('class')!==cls)node.setAttribute('class',cls);}
      return;
    }
    let s = `<image href="black2-base.svg" x="0" y="0" width="1712" height="1080"/>`;
    for (const d of mappedAreas.filter(a=>!spoilerLocked(a))) {
      const [id,name,kind,x,y] = d;
      const cls = category(d), active = id === current ? ' active' : '', dim = visible.includes(d) ? '' : ' dimmed', locked = (d[9] ? !isAvailable(d) : !!lockReason(d)) ? ' locked' : '';
      const isRoute = kind === 'route';
      const [dx,dy] = labelOffsets[id] || [0,0];
      const label = id === 'black' ? 'Black City' : id === 'und' ? 'Undella' : name.replace(/ (Town|City)$/,'').replace('Pokémon League','Liga Pokémon');
      const labelMarkup = kind === 'city' ? `<text class="label" x="${x+dx}" y="${y+dy}" text-anchor="middle">${esc(label)}</text>` : kind === 'special' ? `<text class="label site-label" x="${Math.max(160,Math.min(1550,x))}" y="${y-31}" text-anchor="middle">${esc(name)}</text>` : '';
      const marker = isRoute ? `<circle class="ring" cx="${x}" cy="${y}" r="22"/><text class="route-label" x="${x}" y="${y+7}">${esc(id.slice(1))}</text>` : kind === 'city' ? `<circle class="ring" cx="${x}" cy="${y}" r="17"/>` : `<rect class="site-marker" x="${x-11}" y="${y-11}" width="22" height="22" rx="4"/>`;
      s += `<g class="node ${cls}${active}${dim}${locked}" data-id="${esc(id)}" tabindex="0" role="button" aria-label="Abrir ${esc(name)}"><title>${esc(name)}</title>${marker}${labelMarkup}<circle class="touch" cx="${x}" cy="${y}" r="37"/></g>`;
    }
    map.innerHTML = s;
    mapTopology=topology;mapNodes=new Map([...map.querySelectorAll('.node')].map(node=>[node.dataset.id,node]));
    map.querySelectorAll('.node').forEach(node => {
      node.addEventListener('click', event => {
        const point = map.createSVGPoint(); point.x=event.clientX; point.y=event.clientY;
        const position = point.matrixTransform(map.getScreenCTM().inverse());
        select(gameMap.nearest(mappedAreas.filter(a=>!spoilerLocked(a)),position.x,position.y)[0]);
      });
      node.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(node.dataset.id); } });
    });
    $('map-count').textContent = `${mappedAreas.length} pontos no mapa`;
  }
  function nearby(id) {
    const found = new Set();
    for (const chain of paths) for (let i=0;i<chain.length;i++) if (chain[i] === id) {
      if (chain[i-1]) found.add(chain[i-1]);
      if (chain[i+1]) found.add(chain[i+1]);
    }
    found.delete(id);
    return [...found].filter(v => byId.has(v)).slice(0,5);
  }
  const seasonsPT={Spring:'primavera (jan/mai/set)',Summer:'verão (fev/jun/out)',Autumn:'outono (mar/jul/nov)',Winter:'inverno (abr/ago/dez)'};
  const sectionsPT={'Main Area':'Área principal',Outside:'Exterior',Inside:'Interior',Entrance:'Entrada',Desert:'Deserto',Main:'Área principal',Basement:'Subsolo',Cave:'Caverna',Plains:'Clareira',Maze:'Labirinto','Maze End':'Fim do labirinto','Guidance Chamber':'Sala Guidance Chamber','Trial Chamber':'Sala Trial Chamber'};
  function sectionLabel(section) {
    const underground=/^B(\d+)F$/.exec(section),floor=/^(\d+)F$/.exec(section);
    if(underground)return `${underground[1]}º subsolo (${section})`;
    if(floor)return `${floor[1]}º andar (${section})`;
    return sectionsPT[section]||section;
  }
  function methodInfo(method,id) {
    if (method==='Standard Walking') {
      if (['r4','des'].includes(id)) return ['Areia profunda','Caminhe na areia mais funda, onde os Pokémon selvagens podem aparecer.'];
      if (id==='rel') return ['Ruínas','Ande pelos pisos das salas indicadas.'];
      if (['well','charge','mc','tw','vr','chasm'].includes(id)||/Cave|Passage|Tunnel|Mountain/.test(byId.get(id)?.[1]||'')) return ['Chão da caverna','Caminhe pelo chão da caverna, no andar indicado abaixo.'];
      if (['r8','moor'].includes(id)) return ['Pântano','Caminhe na vegetação do pântano; no inverno algumas partes congelam.'];
      if (['ct','dt'].includes(id)) return ['Torre','Ande no andar ou na área indicada.'];
      return ['Grama comum','Caminhe pela grama normal da área.'];
    }
    if (method==='Doubles Grass'||method==='Double Grass') return ['Grama escura','Caminhe na grama de cor mais escura. Nela, podem aparecer dois Pokémon na mesma batalha.'];
    if (method==='Ground Shaking Spots') {
      if (['draw','marv'].includes(id)) return ['Sombra na ponte','Passe por cima das sombras que aparecem no chão da ponte. Você pode encontrar um Pokémon ou receber uma pena.'];
      if (['well','charge','mc','tw','vr','chasm'].includes(id)||/Cave|Passage|Tunnel|Mountain/.test(byId.get(id)?.[1]||'')) return ['Nuvem de poeira','Caminhe até uma nuvem de poeira na caverna. Ela pode iniciar um encontro ou dar um item.'];
      return ['Grama que se mexe','Espere até um trecho de grama começar a se mexer e caminhe até ele para iniciar o encontro.'];
    }
    if (method==='Standard Surfing') return ['Surf','Use Surf e se mova pela água, fora dos pontos de ondulação.'];
    if (method==='Surfing Spots') return ['Água ondulante','Use Surf para alcançar o círculo de ondulação que aparece na água e passe por ele.'];
    if (method==='Standard Fishing') return ['Pesca','Fique na margem e use a Super Rod para pescar fora dos círculos de ondulação.'];
    if (method==='Fishing Spots') return ['Pesca na ondulação','Fique na margem e use a Super Rod apontando para o círculo de ondulação na água.'];
    if (method==='Swarms') return ['Enxame','Depois da Liga, os painéis das passagens entre rotas anunciam um enxame por dia. Este Pokémon só aparece aqui quando este local é o anunciado.'];
    if(method==='Dust Clouds')return ['Nuvem de poeira','Entre na nuvem de poeira que aparece no chão. Ela também pode dar um item.'];
    if(method==='Bridge Shadows')return ['Sombra na ponte','Passe sobre a sombra no chão da ponte.'];
    if(method==='Hidden Grotto')return ['Hidden Grotto','Entre na abertura escondida entre as árvores. O conteúdo do esconderijo pode precisar se renovar.'];
    return [method,'Encontro especial desta área.'];
  }
  const levelText = value => {const [from,to]=String(value).split(' - ');return from===to?from:`${from}–${to}`;};
  const rateUncertain=()=>false;
  function encounterHTML(table,id,index) {
    const [title,help]=methodInfo(table.method,id),lock=lockReason(byId.get(id),table);
    const where=[...table.sections.map(sectionLabel),...table.seasons.map(s=>seasonsPT[s]||s)].join(' · ');
    return `<details class="encounter-group" ${index<2?'open':''}><summary><span><b>${esc(title)}</b>${where?`<small>${esc(where)}</small>`:''}<small class="${lock?'availability-locked':'availability-ready'}">${lock?'Condição: '+esc(lock):'Compatível com o avanço informado'}</small></span><span class="encounter-toggle" aria-hidden="true">+</span></summary><div class="encounter-content"><p>${esc(help)}</p><div class="encounter-list">${table.pokemon.map(([name,rate,level])=>`<div class="encounter-row"><span class="encounter-mon"><b class="dex-no${dex(name).scope==='Pokédex Nacional'?' national':''}">${esc(dex(name).number)}</b><strong>${esc(name)}</strong></span><span class="encounter-stats"><b title="${rate==null?'Taxa não documentada na hack':'Chance dentro deste método'}">${rate==null?'—':rate+'%'}</b><small>${level==='?'?'Nv. —':'Nv. '+esc(levelText(level))}</small></span></div>`).join('')}</div></div></details>`;
  }
  function storyLinks(ids,label) {
    return `<div class="story-links" aria-label="${esc(label)}">${ids.filter(id=>byId.has(id)&&!spoilerLocked(byId.get(id))).map(id=>`<button type="button" data-story-place="${esc(id)}">${esc(byId.get(id)[1])}<span aria-hidden="true"> ↗</span></button>`).join('')}</div>`;
  }
  function renderStoryOutline() {
    $('story-chapters').innerHTML=black2Chapters.map((c,i)=>`<details class="story-chapter"><summary><span class="story-number">${String(i+1).padStart(2,'0')}</span><span><small>${c.post?'Pós-Liga':'História'}</small><b>${esc(c.title)}</b></span></summary><div class="story-chapter-body"><p>${esc(c.goal)}</p><button type="button" data-chapter="${i}" class="walkthrough-open">Ler o detonado desta etapa →</button>${storyLinks(walkthroughChapters[i].path,'Locais da etapa')}</div></details>`).join('');
    $('story-chapters').querySelectorAll('[data-story-place]').forEach(b=>b.onclick=()=>select(b.dataset.storyPlace));
    $('story-chapters').querySelectorAll('[data-chapter]').forEach(b=>b.onclick=()=>openChapter(+b.dataset.chapter));
  }
  function storyForArea(id) {
    const i=Black2Bridge.areaChapter[id];if(i<0||i==null)return '';
    const c=black2Chapters[i];return `<section class="story-context"><span class="story-eyebrow">NA JORNADA · CAPÍTULO ${i+1}</span><h3>O que fazer aqui</h3><p>${esc(c.goal)}</p><button type="button" data-chapter="${i}" class="walkthrough-open">Abrir detonado →</button></section>`;
  }
  function renderDetail() {
    const itemsWereOpen=detail.querySelector('.area-items')?.open||false;
    const moreItemsWereOpen=detail.querySelector('.item-more')?.open||false;
    const d = byId.get(current); if (!d) return;
    const tables=encounterTables[current]||[], specials=(specialEncounters[current]||[]).filter(e=>e[0].split(' / ').some(isSpeciesVisible));
    const wildCount=new Set(tables.flatMap(t=>t.pokemon.map(mon=>mon[0]))).size;
    const checklist=availableNames(d);
    const place = d[5] === 'post' ? 'Pós-Liga' : d[5] === 'legend' ? 'Evento / lendário' : d[6];
    const near = nearby(current).filter(id=>!spoilerLocked(byId.get(id)));
    const source=d[10]&&tables.length ? `<a class="source-link" href="https://www.serebii.net/pokearth/unova/${encodeURIComponent(d[10])}.shtml" target="_blank" rel="noopener noreferrer">Consultar referência dos encontros ↗</a>` : '';
    const fish=tables.some(t=>t.method.includes('Fishing')) ? '<p class="method-note">A Super Rod é recebida em Aspertia City após concluir a Liga. As porcentagens comparam as espécies que podem aparecer pelo mesmo método, no mesmo setor e estação.</p>' : '<p class="method-note">A porcentagem mostra qual espécie pode aparecer quando um encontro acontece pelo método indicado. Ela não mede a chance de surgir uma batalha a cada passo. Um traço indica taxa ou nível não documentado na hack.</p>';
    detail.innerHTML = `<div class="detail-top"><span class="detail-overline">FICHA DE CAMPO / ${esc(place)}</span><button class="detail-close" type="button" aria-label="Fechar detalhes">×</button><h2>${esc(d[1])}</h2><div class="detail-meta"><span class="pill">${esc(typeLabel(d))}</span>${d[5] === 'post' ? '<span class="pill gold">Após a Liga</span>' : ''}${d[11] === 'legend' ? '<span class="pill gold">Lendário / evento</span>' : ''}</div></div><div class="detail-body">${tables.length?`<section class="detail-section"><h3>Onde procurar Pokémon</h3><p class="encounter-intro">${wildCount} espécies · ${tables.length} grupos de encontros: confira o terreno, o setor e a estação</p><div class="encounter-groups">${tables.map((t,i)=>encounterHTML(t,current,i)).join('')}</div>${fish}</section>`:''}${specials.length?`<section class="detail-section"><h3>Presentes e encontros especiais</h3><div class="special-list">${specials.map(entry=>`<div class="special-entry"><b>${esc(entry[0])}</b><small>${esc(entry[1])} · ${specialLock(d,entry)?'Falta: '+esc(specialLock(d,entry)):'Disponível conforme seu progresso'}</small><p>${esc(entry[2])}</p></div>`).join('')}</div></section>`:''}${!tables.length&&!specials.length?`<section class="detail-section"><h3>Neste local</h3><p>${esc(areaNotes[current]||d[7]||'Sem encontro selvagem comum neste local.')}</p></section>`:''}${areaNotes[current]&&(tables.length||specials.length)?`<section class="detail-section"><h3>Atenção</h3><p>${esc(areaNotes[current])}</p></section>`:''}<section class="detail-section"><h3>Antes de explorar</h3><p>${esc(d[8])}</p></section>${near.length?`<section class="detail-section"><h3>Perto daqui</h3><div class="nearby">${near.map(id=>`<button type="button" data-near="${esc(id)}">${esc(byId.get(id)[1])}</button>`).join('')}</div></section>`:''}${source}</div>`;
    detail.querySelector('.detail-body').insertAdjacentHTML('afterbegin',itemGuide.render(current,progress.collectedItems,search.value,itemFilter,itemsWereOpen));
    if(moreItemsWereOpen&&detail.querySelector('.item-more'))detail.querySelector('.item-more').open=true;
    if(adventure)detail.querySelector('.detail-body').insertAdjacentHTML('beforeend',adventure.renderArea(current));
    const note=detail.querySelector('[data-area-note]');if(note)note.addEventListener('input',()=>{progress.notes[current]=note.value.slice(0,1000);const status=note.parentElement.querySelector('[data-note-status]');status.textContent='Salvando lembrete…';progressStore.save(progress).then(ok=>{if(note.isConnected)status.textContent=ok?'Lembrete salvo neste aparelho.':'Não foi possível salvar. Mantenha esta aba aberta e confira o aviso de progresso.';});cloudSync?.schedule();});
    bindItemControls();
    if(checklist.length) detail.querySelector('.detail-body').insertAdjacentHTML('afterbegin',`<section class="detail-section area-checklist"><h3>Pokémon que você já pode obter</h3><p>${checklist.filter(name=>caught().has(name)).length}/${checklist.length} já obtidos entre os Pokémon disponíveis neste local</p><div class="checklist-items">${checklist.map(name=>`<button type="button" data-caught="${esc(name)}" aria-pressed="${caught().has(name)}"><b>${esc(dex(name).number)}</b> ${esc(name)} <span>${caught().has(name)?'✓':'+'}</span></button>`).join('')}</div></section>`);
    detail.querySelector('.detail-close').onclick = closeSheet;
    detail.querySelector('.detail-body').insertAdjacentHTML('afterbegin',storyForArea(current));
    detail.querySelectorAll('[data-chapter]').forEach(b=>b.onclick=()=>openChapter(+b.dataset.chapter));
    detail.querySelectorAll('[data-story-place]').forEach(button=>button.onclick=()=>select(button.dataset.storyPlace));
    detail.querySelectorAll('[data-near]').forEach(button => button.onclick = () => select(button.dataset.near));
    detail.querySelectorAll('[data-caught]').forEach(button=>button.onclick=()=>toggleCaught(button.dataset.caught));
  }
  function bindItemControls(){
    detail.querySelectorAll('[data-item-id]').forEach(button=>button.onclick=()=>{
      const id=button.dataset.itemId;
      if(!itemGuide.validIds.has(id))return;
      const collected=new Set(progress.collectedItems);
      collected.has(id)?collected.delete(id):collected.add(id);
      progress.collectedItems=[...collected];save();
      const section=detail.querySelector('.area-items'),more=section.querySelector('.item-more')?.open||false;
      section.outerHTML=itemGuide.render(current,progress.collectedItems,search.value,itemFilter,true);
      if(more&&detail.querySelector('.item-more'))detail.querySelector('.item-more').open=true;
      bindItemControls();renderResults();
      detail.querySelector('[data-item-id="'+id+'"]')?.focus({preventScroll:true});
    });
    detail.querySelectorAll('[data-item-filter]').forEach(button=>button.onclick=()=>{
      itemFilter=button.dataset.itemFilter;
      detail.querySelector('.area-items').outerHTML=itemGuide.render(current,progress.collectedItems,search.value,itemFilter,true);
      bindItemControls();
      detail.querySelector('[data-item-filter="'+itemFilter+'"]')?.focus({preventScroll:true});
    });
  }
  function centerOn(id, smooth = true) {
    const d = byId.get(mapAnchor[id] || id); if (!d || !onMap(d)) return;
    const width = map.getBoundingClientRect().width;
    const factor = width / 1712;
    viewport.scrollTo({left: Math.max(0,d[3]*factor-viewport.clientWidth/2),top:Math.max(0,d[4]*factor-viewport.clientHeight/2),behavior:smooth?'smooth':'instant'});
    updateMinimap();
  }
  function updateMinimap(){
    const focus=$('mini-focus'), w=map.getBoundingClientRect().width||1,h=map.getBoundingClientRect().height||1;
    focus.style.left=`${100*viewport.scrollLeft/w}%`;focus.style.top=`${100*viewport.scrollTop/h}%`;
    focus.style.width=`${Math.min(100,100*viewport.clientWidth/w)}%`;focus.style.height=`${Math.min(100,100*viewport.clientHeight/h)}%`;
  }
  function select(id, open = true) {
    if (!byId.has(id)||spoilerLocked(byId.get(id))) return;
    if(current!==id){itemFilter='all';detail.querySelector('.area-items')?.remove();}
    current=id; drawMap(); renderDetail(); renderResults(); centerOn(id);
    if (mobile() && open) { detail.classList.add('open'); scrim.hidden=false; document.body.style.overflow='hidden'; detail.scrollTop=0; detail.querySelector('.detail-close').focus(); }
  }
  function closeSheet() { detail.classList.remove('open'); scrim.hidden=true; document.body.style.overflow=''; }
  function renderResults() {
    const q=search.value.trim(); $('results-title').textContent = q ? 'Resultados da busca' : phase === 'all' ? 'Todas as áreas' : phase === 'available' ? 'Pokémon que posso capturar' : phase === 'story' ? 'Durante a história' : phase === 'post' ? 'Após a Liga' : 'Lendários e eventos';
    $('result-count').textContent = `${visible.length} ${visible.length === 1 ? 'local' : 'locais'}`;
    list.innerHTML=visible.length ? visible.map(d => {const names=(phase==='available'?availableNames(d):(d[9]||'').split(',').filter(Boolean)).filter(isSpeciesVisible);return `<button class="result-item${d[0]===current?' active':''}" type="button" data-id="${esc(d[0])}"><span class="result-dot ${category(d)}"></span><span class="result-copy"><strong>${esc(d[1])}</strong><small>${esc(names.length ? names.slice(0,4).map(name => `${dex(name).number} ${name}`).join(' · ') : (progress.spoilerFree?'Consulte a ficha deste local.':d[7]))}</small>${itemGuide.forArea(d[0]).length?`<small class="result-items">${esc(q&&itemGuide.forArea(d[0]).some(row=>itemGuide.matches(row,q))?itemGuide.forArea(d[0]).filter(row=>itemGuide.matches(row,q)).slice(0,3).map(row=>row.name).join(' · '):itemGuide.counts(d[0],progress.collectedItems).obtained+'/'+itemGuide.counts(d[0]).total+' itens obtidos')}</small>`:''}</span></button>`;}).join('') : '<div class="no-results">Nenhum local encontrado. Tente outro nome ou filtro.</div>';
    list.querySelectorAll('[data-id]').forEach(button => button.onclick = () => select(button.dataset.id));
    const species=allSpecies.find(name=>norm(name)===norm(q)||norm(dex(name).number)===norm(q));
    const finder=$('pokemon-finder');finder.hidden=!species;
    if(species){
      const options=orderedAreas.flatMap(area=>(encounterTables[area[0]]||[]).flatMap(table=>table.pokemon.filter(row=>row[0]===species).map(([name,rate,level])=>({area,table,rate,level,lock:lockReason(area,table)}))));
      const specialOptions=orderedAreas.flatMap(area=>(specialEncounters[area[0]]||[]).filter(entry=>entry[0].split(' / ').includes(species)).map(entry=>({area,entry,lock:specialLock(area,entry,species)})));
      options.sort((a,b)=>Number(!!a.lock)-Number(!!b.lock)||Number(rateUncertain(a.area[0],a.table.method))-Number(rateUncertain(b.area[0],b.table.method))||b.rate-a.rate);
      finder.innerHTML=`<div class="finder-title"><span class="section-index">COMO ENCONTRAR</span><strong>${esc(dex(species).number)} ${esc(species)}</strong></div>${options.length||specialOptions.length?`<div class="finder-options">${[...options.slice(0,4).map(item=>`<button type="button" data-find="${esc(item.area[0])}"><b>${esc(item.area[1])}</b><span>${esc(methodInfo(item.table.method,item.area[0])[0])} · ${rateUncertain(item.area[0],item.table.method)?'chance a confirmar':item.rate==null?'taxa não documentada':item.rate+'%'} · Nv. ${esc(levelText(item.level))}</span><small>${item.lock?'Falta: '+esc(item.lock):'Disponível conforme seu progresso'}</small></button>`),...specialOptions.slice(0,2).map(item=>`<button type="button" data-find="${esc(item.area[0])}"><b>${esc(item.area[1])}</b><span>${esc(item.entry[1])}</span><small>${item.lock?'Condição: '+esc(item.lock):'Ver detalhes do encontro'}</small></button>`)].join('')}</div>`:`<p>${esc(acquisition[species]||'Consulte a lista de Pokémon para saber como obter esta espécie.')}</p>`}`;
      finder.querySelectorAll('[data-find]').forEach(button=>button.onclick=()=>select(button.dataset.find));
    }
  }
  function applyFilters() { visible=areas.filter(matches); clear.hidden=!search.value; drawMap(); renderResults(); if(detail.querySelector('.detail-body'))renderDetail(); }
  const regionalNumber = n => '#'+String(n).padStart(3,'0');
  function toggleCaught(name) {
    const set=caught();set.has(name)?set.delete(name):set.add(name);
    progress.caught=[...set];save();renderProgress();renderDexList();renderDetail();
  }
  function renderDexList() {
    if($('dex-view').hidden)return;
    const q = norm($('dex-search').value.trim());
    const container = $('dex-list');
    const entries=listScope==='unova'?unovaDex:[...unovaDex,...extraSpecies.map(name=>[nationalNumbers[name]||dexNumbers[name],name])];
    if (listOrder === 'dex') {
      const found = entries.filter(([n,name]) => isSpeciesVisible(name)&&(!q || norm(`${dex(name).number} ${n} ${name} ${firstPlace.get(name)?.[1] || ''} ${acquisition[name]||''}`).includes(q)));
      $('dex-count').textContent = `${found.length} / ${entries.length} espécies · ${entries.filter(([,name])=>caught().has(name)).length} já obtidas`;
      container.innerHTML = found.length ? `<div class="dex-grid">${found.map(([n,name]) => {
        const place = firstPlace.get(name);
        const guide=acquisition[name] || (place ? `Primeira ocorrência: ${place[1]}` : 'Consulte métodos de obtenção');
        return `<article class="dex-entry ${caught().has(name)?'obtained':''}"><span class="number">${esc(dex(name).number)}</span><span class="dex-main"><strong>${esc(name)}</strong><small title="${esc(guide)}">${esc(guide)}</small></span><button type="button" class="dex-track" data-caught="${esc(name)}" aria-pressed="${caught().has(name)}">${caught().has(name)?'✓ Já tenho':'Já obtive'}</button>${place ? `<button type="button" data-place="${esc(place[0])}" aria-label="Ver ${esc(name)} em ${esc(place[1])}">Mapa</button>` : ''}</article>`;
      }).join('')}</div>` : '<p class="dex-empty">Nenhum Pokémon encontrado. Tente outro nome ou número.</p>';
    } else {
      let count = 0, index = 0;
      const buckets=new Map();
      for(const [name,area] of firstPlace){
        if(!isSpeciesVisible(name)||(listScope==='unova'&&!regionalSet.has(name)))continue;
        const rank=firstRank.get(name)??100,key=`${rank}:${area[0]}`;
        if(!buckets.has(key))buckets.set(key,{rank,area,names:[]});
        buckets.get(key).names.push(name);
      }
      const groups = [...buckets.values()].sort((a,b)=>a.rank-b.rank||journeyOrder.indexOf(a.area[0])-journeyOrder.indexOf(b.area[0])).map(({rank,area,names:allNames}) => {
        const names = allNames.filter(name => !q || norm(`${name} ${dex(name).number} ${area[1]}`).includes(q));
        if (!names.length) return '';
        count += names.length; index++;
        return `<section class="journey-group"><div class="journey-place"><span class="step">ETAPA ${String(index).padStart(2,'0')} · ${rank>=200?'EVENTO / TROCA':rank>=100?'PÓS-LIGA':rank===0?'INÍCIO':`A PARTIR DE ${rank} INSÍGNIAS`}</span><h3>${esc(area[1])}</h3><small>Primeira oportunidade indicada no guia</small><button type="button" data-place="${esc(area[0])}">Abrir no mapa ↗</button></div><div class="journey-species">${names.map(name => `<span><b>${esc(dex(name).number)}</b>${esc(name)}<button type="button" data-caught="${esc(name)}" aria-label="${caught().has(name)?'Desmarcar':'Marcar como obtido'} ${esc(name)}" aria-pressed="${caught().has(name)}">${caught().has(name)?'✓':'+'}</button></span>`).join('')}</div></section>`;
      }).filter(Boolean);
      const withoutPlace=entries.map(([,name])=>name).filter(name=>isSpeciesVisible(name)&&!firstPlace.has(name)&&(!q||norm(`${name} ${dex(name).number} ${acquisition[name]||''}`).includes(q)));
      if(withoutPlace.length){count+=withoutPlace.length;groups.push(`<section class="journey-group"><div class="journey-place"><span class="step">OBTENÇÃO</span><h3>Evolução ou troca</h3><small>Obtido por evolução, troca ou outra condição</small></div><div class="journey-species">${withoutPlace.map(name=>`<span title="${esc(acquisition[name]||'')}"><b>${esc(dex(name).number)}</b>${esc(name)}<button type="button" data-caught="${esc(name)}" aria-label="${caught().has(name)?'Desmarcar':'Marcar como obtido'} ${esc(name)}" aria-pressed="${caught().has(name)}">${caught().has(name)?'✓':'+'}</button></span>`).join('')}</div></section>`);}
      $('dex-count').textContent = `${count} Pokémon · ${groups.length} locais`;
      container.innerHTML = groups.length ? groups.join('') : '<p class="dex-empty">Nenhum Pokémon encontrado nessa ordem de obtenção. Tente outro nome, número ou local.</p>';
    }
    container.querySelectorAll('[data-place]').forEach(button => button.onclick = () => { switchView('map'); select(button.dataset.place); });
    container.querySelectorAll('[data-caught]').forEach(button => button.onclick = () => toggleCaught(button.dataset.caught));
  }
  function switchView(view) {
    const showMap = view === 'map';
    $('map-view').hidden = !showMap; $('dex-view').hidden = view!=='dex'; $('tools-view').hidden=view!=='tools';$('team-view').hidden=view!=='team';$('play-view').hidden=view!=='play';if(view==='tools')adventure?.refresh();if(view==='team')teamPlanner?.refresh();if(view==='play')renderWalkthrough();$('now-view').hidden=view!=='now';if(view==='now')playingGuide?.refresh();if(view==='tools')renderTools();
    document.querySelectorAll('.view-tab').forEach(button => { const active = button.dataset.view === view; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); });
    if(view==='dex')renderDexList();else $('dex-list').replaceChildren();if(view!=='play')$('play-view').replaceChildren();
    closeSheet(); window.scrollTo({top:0,behavior:'instant'});
    if (showMap) requestAnimationFrame(() => centerOn(current,false));
  }
  document.querySelectorAll('.view-tab').forEach(button => button.onclick = () => switchView(button.dataset.view));
  document.querySelectorAll('.order-button').forEach(button => button.onclick = () => {
    listOrder = button.dataset.order;
    document.querySelectorAll('.order-button').forEach(other => {const active = other === button; other.classList.toggle('active',active); other.setAttribute('aria-pressed',String(active));});
    renderDexList();
  });
  document.querySelectorAll('.scope-button').forEach(button=>button.onclick=()=>{
    listScope=button.dataset.scope;
    document.querySelectorAll('.scope-button').forEach(other=>{const active=other===button;other.classList.toggle('active',active);other.setAttribute('aria-pressed',String(active))});
    renderDexList();
  });
  $('dex-search').addEventListener('input',renderDexList);
  for(const id of ['badge-count','season-select','starter-select','fossil-select','league-toggle','surf-toggle','strength-toggle','cobalion-toggle','rod-toggle','trade-toggle','event-toggle']) $(id).addEventListener('change',()=>{
    progress.badges=Number($('badge-count').value);progress.season=$('season-select').value;
    progress.starter=$('starter-select').value;progress.fossil=$('fossil-select').value;
    progress.league=$('league-toggle').checked;progress.surf=$('surf-toggle').checked;progress.strength=$('strength-toggle').checked;progress.cobalion=$('cobalion-toggle').checked;progress.rod=$('rod-toggle').checked;
    progress.trades=$('trade-toggle').checked;progress.events=$('event-toggle').checked;
    save();renderProgress();applyFilters();renderDetail();
  });
  $('export-progress').onclick=()=>{const blob=new Blob([JSON.stringify(progress,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='unova-black2-progresso.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  $('import-progress').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{const incoming=JSON.parse(await file.text());if(!Array.isArray(incoming.caught)||!Number.isInteger(incoming.badges)||incoming.badges<0||incoming.badges>8)throw Error('Formato inválido');progress=normalizeProgress(incoming);save();renderProgress();renderDexList();applyFilters();renderDetail();}catch{alert('Não foi possível restaurar o progresso. Selecione um arquivo JSON baixado pelo guia.')}e.target.value='';};
  document.querySelectorAll('.filter').forEach(button => button.onclick = () => { phase=button.dataset.phase; document.querySelectorAll('.filter').forEach(other => {const on=other===button; other.classList.toggle('active',on); other.setAttribute('aria-pressed',String(on));}); applyFilters(); });
  search.addEventListener('input',applyFilters);
  search.addEventListener('keydown',e=>{if(e.key==='Enter'&&visible.length){e.preventDefault();select(visible[0][0]);search.blur();}});
  clear.onclick=()=>{search.value='';applyFilters();search.focus()};
  scrim.onclick=closeSheet;
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSheet()});
  function setZoom(value) {viewport.classList.remove('overview');zoom=Math.max(.25,Math.min(1.65,value));map.style.width=`${Math.round(1120*zoom)}px`;map.style.minWidth=`${Math.round(1120*zoom)}px`;centerOn(current,false);}
  $('zoom-in').onclick=()=>setZoom(zoom+.2); $('zoom-out').onclick=()=>setZoom(zoom-.2);
  $('fit-map').onclick=()=>{setZoom(Math.max(.25,viewport.clientWidth/1120));viewport.classList.add('overview');viewport.scrollTo({left:0,top:0});updateMinimap();};
  map.addEventListener('click',e=>{if(!viewport.classList.contains('overview')||e.target.closest('.node'))return;const rect=map.getBoundingClientRect(),x=(e.clientX-rect.left)/rect.width,y=(e.clientY-rect.top)/rect.height;setZoom(1);viewport.scrollTo({left:x*map.getBoundingClientRect().width-viewport.clientWidth/2,top:y*map.getBoundingClientRect().height-viewport.clientHeight/2,behavior:'instant'});updateMinimap()});
  $('mini-map').onclick=e=>{const rect=$('mini-map').getBoundingClientRect(), x=(e.clientX-rect.left)/rect.width,y=(e.clientY-rect.top)/rect.height;viewport.scrollTo({left:x*map.getBoundingClientRect().width-viewport.clientWidth/2,top:y*map.getBoundingClientRect().height-viewport.clientHeight/2,behavior:'smooth'});};
  $('mini-map').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('fit-map').click()}};
  let minimapFrame=0;
  viewport.addEventListener('scroll',()=>{if(!minimapFrame)minimapFrame=requestAnimationFrame(()=>{minimapFrame=0;updateMinimap();});},{passive:true});
  $('recenter').onclick=()=>centerOn('asp');
  window.addEventListener('resize',()=>{if(!mobile())closeSheet()});
  progressReady=true;
  let readingChapter=progress.chapter||0;
  function openChapter(i){readingChapter=i;switchView('play');renderWalkthrough();}
  function renderWalkthrough(){
    if($('play-view').hidden)return;
    const c=black2Chapters[readingChapter],complete=c.steps.filter(step=>(progress.steps||[]).includes(step.id)).length;
    $('play-view').innerHTML=`<div class="plan-intro"><span class="section-index">DETONADO / BLACK 2</span><h1>${esc(c.title)}</h1><p>${esc(c.goal)}</p></div><div class="walkthrough-controls"><label>Capítulo<select id="walkthrough-chapter">${black2Chapters.map((chapter,i)=>`<option value="${i}" ${i===readingChapter?'selected':''}>${String(i+1).padStart(2,'0')} · ${esc(chapter.title)}</option>`).join('')}</select></label><button type="button" id="walkthrough-current">Estou nesta etapa</button></div><p id="walkthrough-count" class="save-status">${complete}/${c.steps.length} passos concluídos</p><div class="walkthrough-reader">${c.steps.map((step,i)=>`<section class="walkthrough-step"><label><input type="checkbox" data-step="${esc(step.id)}" ${(progress.steps||[]).includes(step.id)?'checked':''}><span><small>PASSO ${i+1}</small><b>${esc(step.title)}</b></span></label><p>${esc(step.text)}</p></section>`).join('')}</div>${[['prep','Antes de continuar'],['optional','Exploração opcional'],['lost','Me perdi. Para onde vou?']].map(([key,title])=>`<details class="story-chapter walkthrough-extra"><summary><b>${title}</b></summary><div class="story-chapter-body"><p>${esc(c[key])}</p></div></details>`).join('')}<details class="story-chapter walkthrough-extra"><summary><b>Áreas deste capítulo</b></summary><div class="story-chapter-body">${storyLinks(walkthroughChapters[readingChapter].path,'Locais do capítulo')}</div></details><label class="walkthrough-note">Lembrete para a próxima sessão<textarea id="walkthrough-note" placeholder="Onde parei, o que quero capturar…">${esc(progress.playNote)}</textarea></label><div class="walkthrough-footer">${readingChapter>0?`<button type="button" data-next-chapter="${readingChapter-1}">← Anterior</button>`:'<span></span>'}${readingChapter<21?`<button type="button" data-next-chapter="${readingChapter+1}">Próximo →</button>`:''}</div><p class="source-note">Texto próprio · <a href="${esc(c.source)}" target="_blank" rel="noopener">Referência do percurso</a> · Consulte os ajustes da hack em Ferramentas.</p>`;
    $('walkthrough-chapter').onchange=e=>openChapter(+e.target.value);
    $('walkthrough-current').onclick=()=>{progress.chapter=readingChapter;save();$('walkthrough-current').textContent='Etapa salva ✓';};
    $('play-view').querySelectorAll('[data-step]').forEach(box=>box.onchange=()=>{const set=new Set(progress.steps||[]);box.checked?set.add(box.dataset.step):set.delete(box.dataset.step);progress.steps=[...set];save();$('walkthrough-count').textContent=c.steps.filter(step=>set.has(step.id)).length+'/'+c.steps.length+' passos concluídos';});
    $('walkthrough-note').oninput=e=>{progress.playNote=e.target.value.slice(0,1000);save();};
    $('play-view').querySelectorAll('[data-next-chapter]').forEach(b=>b.onclick=()=>openChapter(+b.dataset.nextChapter));
    $('play-view').querySelectorAll('[data-story-place]').forEach(b=>b.onclick=()=>{switchView('map');select(b.dataset.storyPlace);});
  }
  function renderTools(){adventure?.refresh();}
  adventure=createAdventureGuide({areas,encounters:encounterTables,specials:specialEncounters,stage,editorial:black2AdventureData,data:pokemonGuideData,chapters:walkthroughChapters,allSpecies,items:itemTables,acquisition,
    getProgress:()=>({...progress,tasks:progress.steps||[]}),chapterIndex:()=>progress.chapter||0,availableNames,lockReason,specialLock,methodInfo,sectionLabel,seasonLabel:s=>seasonsPT[s]||s,itemMatches:itemGuide.matches,spoilerLocked,isSpeciesVisible,
    openArea:id=>{search.value='';phase='all';switchView('map');applyFilters();select(id);},
    update:patch=>{if(patch.tasks)patch.steps=patch.tasks;progress=normalizeProgress({...progress,...patch});save();renderProgress();renderDexList();renderStoryOutline();renderWalkthrough();},
    refresh:()=>{if(spoilerLocked(byId.get(current)))current='asp';renderStoryOutline();applyFilters();renderDetail();renderDexList();}
  });
  adventure.mount($('tools-view'));
  $('team-choice').closest('.guide-tool').hidden=true;
  $('cloud-tools').closest('.guide-tool').hidden=true;
  $('agenda-output').closest('.guide-tool').hidden=true;
  playingGuide=createPlayingGuide({areas,chapters:walkthroughChapters,editorial:black2AdventureData,spoilerLocked,getProgress:()=>({...progress,tasks:progress.steps||[]}),
    update:(patch,refresh=true)=>{if(patch.tasks)patch.steps=patch.tasks;progress=normalizeProgress({...progress,...patch});save();if(refresh){renderProgress();playingGuide?.refresh();renderWalkthrough();}return true;},
    openArea:id=>{search.value='';phase='all';switchView('map');applyFilters();select(id);},saveStatus:()=>$('save-status').textContent
  });playingGuide.mount($('now-view'));
  initOffline($('offline-state'));
  renderTools();renderWalkthrough();
  renderStoryOutline();renderProgress();applyFilters(); renderDetail(); renderDexList(); requestAnimationFrame(()=>centerOn('asp',false));
  const [initialView,initialArea]=location.hash.slice(1).split('/');
  if(initialView==='play'){const i=black2Chapters.findIndex(c=>c.id===initialArea);if(i>=0)readingChapter=i;switchView('play');renderWalkthrough();}
  if(initialView==='map'&&initialArea){let n='';try{n=decodeURIComponent(initialArea);}catch{}const id=Black2Bridge.nameToId[n]||n;if(byId.has(id))select(id,false);}
  try{localStorage.setItem('unova-last-game','black2');}catch{}
})();
