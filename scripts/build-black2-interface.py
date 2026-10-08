"""Reuse the Black 1 interface while supplying Black 2 facts and walkthrough."""
from pathlib import Path
import re
root=Path(__file__).resolve().parent.parent
s=(root/'app.js').read_text()
s=re.sub(r"  for \(const id of \['r17','r18'\]\) [^\n]+\n",'',s)
def block(start,end,new):
 global s
 a=s.index(start);b=s.index(end,a);s=s[:a]+new+'\n'+s[b:]
block("  areas.push(['black'",'  const coords', '')
s=s.replace('UnovaMap','Black2Bridge.map')
block('  const specialEncounters =','  for (const area of areas)', '  const specialEncounters=Black2Bridge.specials;\n  const areaNotes={};')
block('  const paths =','  const labelOffsets', '  const paths=Black2Bridge.paths;')
s=s.replace("let current = 'r1'", "let current = 'asp'")
s=s.replace('const labelOffsets = {','const labelOffsets = {asp:[0,-39],"b2-floccesy-town":[0,-39],"b2-virbank-city":[0,-39],"b2-humilau-city":[-15,-39],"b2-lentimas-town":[0,-39],')
block('  const journeyOrder =','  const orderedAreas', '  const journeyOrder=[...new Set(walkthroughChapters.flatMap(c=>c.path))];')
block('  const acquisition =','  const itemGuide', '  const acquisition=Black2Bridge.acquisition;')
s=s.replace("const storageKey='unova-black-field-guide-v2'", "const storageKey='unova-black2-complete-1.12-v1'")
s=s.replace('allSpecies.includes(name)','!!pokemonGuideData.pokemon[name]')
s=re.sub(r'    clean.teamPlan=normalizeTeamPlan\([^\n]+\n','',s)
s=s.replace('clean.collectedItems=itemGuide.normalizeCollected(value.collectedItems);','clean.collectedItems=itemGuide.normalizeCollected([...(Array.isArray(value.collectedItems)?value.collectedItems:[]),...(Array.isArray(value.items)?value.items:[])]);\n    clean.steps=Array.isArray(value.steps)?value.steps.filter(id=>black2Chapters.some(c=>c.steps.some(step=>step.id===id))):[];\n    clean.chapter=Number.isInteger(value.chapter)?Math.max(0,Math.min(21,value.chapter)):0;')
s=s.replace("clean.playNote=typeof value.playNote==='string'?value.playNote.slice(0,1000):'';", "clean.playNote=String(value.playNote||value.note||'').slice(0,1000);")
s=s.replace('renderStoryOutline();adventure?.refresh();teamPlanner?.refresh();playingGuide?.refresh();','renderStoryOutline();renderWalkthrough();adventure?.refresh();')
block('  const stage=','  function spoilerLocked', '  const stage=Black2Bridge.stage;')
s=s.replace("if((regionalLookup.get(name)??0)>=144&&!progress.league)return false;",'')
s=s.replace("if(['castle','torn','swords','events','lib'].includes(area[0])&&!progress.league)return true;",'')
block('  function lockReason(', '  const isAvailable=', '''  function lockReason(area,table={}) {
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
  }''')
s=s.replace("if(entry[0].includes('Tirtouga'))rank=3;",'').replace("if(entry[0]==='Petilil')rank=2;",'').replace("if(['Volcarona','Musharna'].includes(entry[0]))rank=100;",'').replace("if(['Cobalion','Virizion','Terrakion','Larvesta'].includes(entry[0]))rank=Math.max(rank,5);",'')
s=s.replace('`${registered}/156 Unova', '`${registered}/301 Unova')
s=s.replace('href="unova-base.svg"','href="black2-base.svg"')
s=s.replace('Black2Bridge.map.nearest(mappedAreas,position.x,position.y)', 'Black2Bridge.map.nearest(mappedAreas.filter(a=>!spoilerLocked(a)),position.x,position.y)')
s=s.replace("if (['well','charge','mc','tw','vr','chasm'].includes(id))", "if (['well','charge','mc','tw','vr','chasm'].includes(id)||/Cave|Passage|Tunnel|Mountain/.test(byId.get(id)?.[1]||''))")
s=s.replace("    return [method,'Encontro especial desta área.'];", "    if(method==='Dust Clouds')return ['Nuvem de poeira','Entre na nuvem de poeira que aparece no chão. Ela também pode dar um item.'];\n    if(method==='Bridge Shadows')return ['Sombra na ponte','Passe sobre a sombra no chão da ponte.'];\n    if(method==='Hidden Grotto')return ['Hidden Grotto','Entre na abertura escondida entre as árvores. O conteúdo do esconderijo pode precisar se renovar.'];\n    return [method,'Encontro especial desta área.'];")
block('  const rateUncertain=', '  function storyLinks', '''  const rateUncertain=()=>false;
  function encounterHTML(table,id,index) {
    const [title,help]=methodInfo(table.method,id),lock=lockReason(byId.get(id),table);
    const where=[...table.sections.map(sectionLabel),...table.seasons.map(s=>seasonsPT[s]||s)].join(' · ');
    return `<details class="encounter-group" ${index<2?'open':''}><summary><span><b>${esc(title)}</b>${where?`<small>${esc(where)}</small>`:''}<small class="${lock?'availability-locked':'availability-ready'}">${lock?'Condição: '+esc(lock):'Compatível com o avanço informado'}</small></span><span class="encounter-toggle" aria-hidden="true">+</span></summary><div class="encounter-content"><p>${esc(help)}</p><div class="encounter-list">${table.pokemon.map(([name,rate,level])=>`<div class="encounter-row"><span class="encounter-mon"><b class="dex-no${dex(name).scope==='Pokédex Nacional'?' national':''}">${esc(dex(name).number)}</b><strong>${esc(name)}</strong></span><span class="encounter-stats"><b title="${rate==null?'Taxa não documentada na hack':'Chance dentro deste método'}">${rate==null?'—':rate+'%'}</b><small>${level==='?'?'Nv. —':'Nv. '+esc(levelText(level))}</small></span></div>`).join('')}</div></div></details>`;
  }''')
block('  function renderStoryOutline()', '  function renderDetail()', '''  function renderStoryOutline() {
    $('story-chapters').innerHTML=black2Chapters.map((c,i)=>`<details class="story-chapter"><summary><span class="story-number">${String(i+1).padStart(2,'0')}</span><span><small>${c.post?'Pós-Liga':'História'}</small><b>${esc(c.title)}</b></span></summary><div class="story-chapter-body"><p>${esc(c.goal)}</p><button type="button" data-chapter="${i}" class="walkthrough-open">Ler o detonado desta etapa →</button>${storyLinks(walkthroughChapters[i].path,'Locais da etapa')}</div></details>`).join('');
    $('story-chapters').querySelectorAll('[data-story-place]').forEach(b=>b.onclick=()=>select(b.dataset.storyPlace));
    $('story-chapters').querySelectorAll('[data-chapter]').forEach(b=>b.onclick=()=>openChapter(+b.dataset.chapter));
  }
  function storyForArea(id) {
    const i=Black2Bridge.areaChapter[id];if(i<0||i==null)return '';
    const c=black2Chapters[i];return `<section class="story-context"><span class="story-eyebrow">NA JORNADA · CAPÍTULO ${i+1}</span><h3>O que fazer aqui</h3><p>${esc(c.goal)}</p><button type="button" data-chapter="${i}" class="walkthrough-open">Abrir detonado →</button></section>`;
  }''')
s=s.replace('Conferir tabelas de Black no Pokéarth ↗','Consultar referência dos encontros ↗')
s=s.replace('A Super Rod é recebida de Looker em Nuvema após vencer Ghetsis.', 'A Super Rod é recebida em Aspertia City após concluir a Liga.')
s=s.replace('Ela não mede a chance de surgir uma batalha a cada passo.', 'Ela não mede a chance de surgir uma batalha a cada passo. Um traço indica taxa ou nível não documentado na hack.')
s=s.replace("    detail.querySelectorAll('[data-story-place]').forEach", "    detail.querySelectorAll('[data-chapter]').forEach(b=>b.onclick=()=>openChapter(+b.dataset.chapter));\n    detail.querySelectorAll('[data-story-place]').forEach")
s=s.replace("item.rate+'%'", "item.rate==null?'taxa não documentada':item.rate+'%'")
s=s.replace("if(view==='play')playingGuide?.refresh();", "if(view==='play')renderWalkthrough();$('now-view').hidden=view!=='now';if(view==='now')playingGuide?.refresh();if(view==='tools')renderTools();")
s=s.replace("view==='team';", "view==='team';")
s=s.replace("clean.tasks=Array.isArray(value.tasks)?[...new Set(value.tasks.filter(id=>typeof id==='string'&&/^chapter-(?:[0-9]|10)-[0-2]$/.test(id)))]:[];", "clean.tasks=Array.isArray(value.tasks)?[...new Set(value.tasks.filter(id=>black2Chapters.some(c=>c.steps.some(s=>s.id===id))))]:[];")
s=s.replace("$('recenter').onclick=()=>centerOn('nu');", "$('recenter').onclick=()=>centerOn('asp');")
s=s.replace("a.download='unova-black-progresso.json'", "a.download='unova-black2-progresso.json'")
block('  adventure=createAdventureGuide(', '  renderStoryOutline();renderProgress();applyFilters();', '''  let readingChapter=progress.chapter||0;
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
  renderTools();renderWalkthrough();''')
s=s.replace("requestAnimationFrame(()=>centerOn('r1',false));", "requestAnimationFrame(()=>centerOn('asp',false));\n  const [initialView,initialArea]=location.hash.slice(1).split('/');\n  if(initialView==='play'){const i=black2Chapters.findIndex(c=>c.id===initialArea);if(i>=0)readingChapter=i;switchView('play');renderWalkthrough();}\n  if(initialView==='map'&&initialArea){let n='';try{n=decodeURIComponent(initialArea);}catch{}const id=Black2Bridge.nameToId[n]||n;if(byId.has(id))select(id,false);}\n  try{localStorage.setItem('unova-last-game','black2');}catch{}")
s=s.replace("else $('dex-list').replaceChildren();", "else $('dex-list').replaceChildren();if(view!=='play')$('play-view').replaceChildren();")
# Preserve first game's interface, including its sheet, filters, map and list controls.
(root/'black2-app.js').write_text('/* Generated from app.js; Black 1 UI with Black 2 data and walkthrough. */\n'+s)
h=(root/'index.html').read_text()
h=re.sub(r'  <script>try\{if\(new URLSearchParams.*?</script>\n','',h)
h=h.replace('  <a href="black2.html" style="display:block;text-align:center;padding:14px;background:#e8e5d7;color:#173c3c;font:600 14px system-ui">Nova jornada: Black 2 · Complete Unova v1.12 →</a>','')
h=h.replace(' / BLACK</span>',' / BLACK 2</span>').replace('BLACK · 2010','BLACK 2 · v1.12')
h=re.sub(r'<button type="button" class="view-tab" data-view="team".*?</button>','',h)
h=h.replace('>Jogar</button>','>Detonado</button>')
h=h.replace('<button type="button" class="view-tab" data-view="play"', '<button type="button" class="view-tab" data-view="now" aria-pressed="false"><svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m9 5 11 7-11 7Z"/></svg>Jogar</button><button type="button" class="view-tab" data-view="play"')
h=h.replace('<section id="play-view"', '<section id="now-view" class="play-view" hidden aria-label="Estou jogando agora"></section><section id="play-view"')
h=h.replace('id="play-view" class="play-view" hidden aria-label="Estou jogando agora"','id="play-view" class="play-view" hidden aria-label="Detonado"')
h=h.replace('0/156 Unova','0/301 Unova').replace('Pokédex de Unova · 156','Pokédex de Unova · 301')
h=h.replace('Concluí a história (N e Ghetsis)','Venci a Liga (Iris)').replace('Mostrar Pokémon obtidos por troca','Incluir trocas com personagens').replace('Mostrar Pokémon de eventos antigos','Conferir encontros especiais')
h=h.replace('Voltar a Nuvema','Voltar a Aspertia').replace('>Nuvema</button>','>Aspertia</button>').replace('src="unova-base.svg"','src="black2-base.svg"')
h=h.replace('A Pokédex de Unova vai de #000 a #155;','A Pokédex de Black 2 vai de #000 a #300;')
h=h.replace('Encontros de Pokémon Black consultados no','Encontros de Black 2 / Complete Unova: referências do jogo-base no')
h=h.replace('TMs, equipe planejada','TMs').replace('Unova Black','Unova Black 2').replace('de Pokémon Black</title>','de Pokémon Black 2</title>')
h=h.replace('Toque no mapa para ver o que fazer, quais Pokémon procurar e quais itens pegar. Se quiser seguir a história, abra o roteiro abaixo.','Toque no mapa para consultar Pokémon e itens. Para acompanhar a história, abra a aba Detonado.')
h=h.replace('Você recebe apenas um dos três iniciais. Para encontrar Landorus, precisa ter Tornadus e Thundurus na equipe; Thundurus vem de White por troca. Victini e outros Pokémon míticos dependem de eventos antigos.','Complete Unova v1.12 permite exclusivos das duas versões e adiciona míticos e lendários no pós-jogo. Consulte a ficha do local: taxas e níveis sem confirmação aparecem com um traço.')
h=h.replace('  <link rel="stylesheet" href="planner.css">','  <link rel="stylesheet" href="planner.css">\n  <link rel="stylesheet" href="black2-walkthrough.css">')
h=h.replace('<span class="edition">BLACK 2 · v1.12</span>','<span class="edition">BLACK 2 · v1.12 <a href="index.html?game=black" class="game-return">Black 1 ↗</a></span>')
start=h.index('  <script src="data.js">');end=h.index('\n</body>',start)
h=h[:start]+'''  <script src="black2-data.js"></script><script src="black2-chapters.js"></script><script src="black2-extra.js"></script><script src="black2-hack-data.js"></script><script src="black2-hack.js"></script><script src="map-data.js"></script><script src="black2-bridge.js"></script><script src="black2-adventure.js"></script><script src="black2-playing.js"></script><script src="item-guide.js"></script><script src="progress-store.js"></script><script src="offline.js"></script><script src="black2-app.js"></script>'''+h[end:]
(root/'black2.html').write_text(h)
