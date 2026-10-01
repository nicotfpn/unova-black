(async () => {
  const areas = rawAreas.filter((area, i) => rawAreas.findIndex(other => other[0] === area[0]) === i);
  areas.push(['black','Black City','city',1268,570,'post','Pós-Liga','Cidade exclusiva de Pokémon Black; não há Pokémon selvagens comuns. Treinadores e lojas mudam conforme sua atividade.','Vença a Liga e siga pela Rota 15 ou pela Rota 16.','']);
  areas.push(['anv','Anville Town','city',40,156,'story','Nimbasa','Cidade ligada ao Battle Subway; sem encontros selvagens comuns.','Use o trem de Nimbasa City.','']);
  areas.push(['challenger',"Challenger’s Cave",'special',755,274,'post','Pós-Liga','Caverna de treino com encontros em pisos diferentes.','Entrada na Rota 9 após vencer a Liga. Flash ajuda a explorar.','',"challenger'scave"]);
  const coords = UnovaMap.coordinates;
  areas.forEach(area => { if (coords[area[0]]) [area[3],area[4]]=coords[area[0]]; });
  const byId = new Map(areas.map(area => [area[0], area]));
  for (const id of ['r17','r18']) { byId.get(id)[5]='story'; byId.get(id)[6]='Opcional com Surf'; }
  const specialEncounters = {
    nu:[['Snivy / Tepig / Oshawott','Presente','Escolha apenas um inicial com a Prof. Juniper; os outros dependem de troca.']],
    dream:[['Pansage / Pansear / Panpour','Presente','Antes do primeiro ginásio, converse com a personagem no Dreamyard para receber um Pokémon que ajuda contra o líder: Panpour se escolheu Snivy, Pansage se escolheu Tepig ou Pansear se escolheu Oshawott.'],['Musharna','Encontro fixo','Depois de vencer Ghetsis, vá ao porão do Dreamyard em uma sexta-feira para encontrar Musharna. Essa batalha é diferente dos encontros na grama que se mexe.']],
    cas:[['Zorua','Evento antigo','Em Castelia, leve o Celebi de um evento antigo, transferido pelo Relocator, para receber Zorua. Um Celebi comum não ativa esse evento.']],
    des:[['Darmanitan','Encontro fixo','Interaja com uma das estátuas usando RageCandyBar.']],
    pin:[['Virizion','Lendário','Rumination Field, depois do encontro com Cobalion.']],
    mc:[['Cobalion','Lendário','Guidance Chamber. Use Surf para chegar à caverna e Strength no interior.']],
    vr:[['Terrakion','Lendário','Trial Chamber, após encontrar Cobalion.']],
    castle:[['Reshiram','Lendário de Black','Encontro da história no Castelo de N; Zekrom é da versão White.']],
    chasm:[['Kyurem','Lendário','Na cratera, depois de atravessar a caverna e a clareira de Giant Chasm.']],
    ab:[['Landorus','Lendário condicional','Tenha Tornadus e Thundurus na equipe ao visitar o santuário. Thundurus só é obtido em White e precisa ser recebido por troca.']],
    lost:[['Zoroark','Evento antigo','Leve um Raikou, Entei ou Suicune shiny (de cor diferente) distribuído em um evento antigo para ativar a batalha no trailer.']],
    r18:[['Larvesta','Ovo','Receba o ovo de um NPC na ilha; chegue com Surf e deixe uma vaga na equipe.']],
    rel:[['Volcarona','Encontro fixo','Nv. 70 no fundo do Relic Castle após obter a Pokédex Nacional. Não é encontro aleatório.']],
    nac:[['Tirtouga / Archen','Fóssil','Escolha Cover Fossil ou Plume Fossil no Relic Castle e reviva no museu. Um fóssil por partida.'],['Petilil','Troca interna de Black','Entregue Cottonee ao NPC em Nacrene para receber Petilil.']],
    marv:[['Magikarp','Compra','Compre Magikarp do vendedor na Marvelous Bridge; não é obtido pescando na ponte.']],
    lib:[['Victini','Evento antigo','Liberty Pass abre a ilha; desça ao porão do farol para a batalha.']],
    torn:[['Tornadus','Errante de Black','Após o evento da tempestade na Rota 7, vagueia por Unova; consulte a localização na Pokédex.']],
    swords:[['Cobalion','Mistralton Cave','Guidance Chamber, com Surf e Strength.'],['Terrakion','Victory Road','Trial Chamber, após Cobalion.'],['Virizion','Pinwheel Forest','Rumination Field, após Cobalion.']],
    events:[['Keldeo / Meloetta / Genesect','Distribuição','Não aparecem na natureza em Pokémon Black; dependiam de distribuições de evento.']]
  };
  const areaNotes = {
    str:'Você recebe Pansage, Pansear ou Panpour de uma personagem no Dreamyard, antes do primeiro ginásio. O Pokémon recebido depende do inicial escolhido.',
    dream:'Use Cut para cortar a árvore e entrar na área interna. O Musharna que aparece às sextas-feiras no porão é um encontro separado dos Pokémon da grama que se mexe.',
    rel:'Os fósseis são itens revividos em Nacrene. Volcarona é um encontro fixo pós-Liga no fundo das ruínas.',
    lost:'Para ativar o encontro de Zoroark, leve um Raikou, Entei ou Suicune shiny distribuído em um evento antigo. Apenas visitar o trailer não inicia a batalha.',
    r17:'Pode ser explorada com Surf a partir da Rota 1, inclusive antes da Liga. As correntes levam à Rota 18.',
    r18:'A ilha é opcional e exige Surf. O Larvesta é recebido como ovo, não aparece na grama.',
    p2:'A ilha tem grama, água e pesca. Genesect não aparece selvagem; era obtido por distribuição de evento.',
    dt:'Reshiram não é capturado aqui em Black: o encontro acontece no Castelo de N.',
    draw:'Atravesse observando as sombras no chão da ponte: Ducklett pode aparecer; outras sombras dão penas.',
    marv:'As sombras da ponte podem trazer Swanna ou penas; Magikarp é comprado de um vendedor, não pescado.',
    black:'Black City é exclusiva de Black e não tem encontros selvagens comuns.'
  };
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
  const onMap = UnovaMap.onMap;
  const mappedAreas = areas.filter(onMap);
  const mapAnchor = UnovaMap.anchors;
  const paths = [
    ['nu','r1','acc','r2','str','r3','nac','pin','sky','cas','r4','nim','r5','draw','dri','r6','charge','mis','r7','ici','r8','tube','r9','ope','r10','vr','league'],
    ['ope','r11','vb','r12','lac','r13','und','r14','black','r15','marv','r16','nim'],
    ['r1','r17','r18','p2'],['r4','des','rel'],['str','dream'],['r3','well'],['r6','mc'],['r7','ct'],['r7','tw','ici'],
    ['ici','dt'],['r8','moor'],['dri','cold'],['r13','chasm'],['r14','ab'],['r16','lost'],['nim','anv'],['cas','lib'],['league','castle'],['und','bay','ruins'],['r7','torn'],['r9','challenger']
  ];
  const labelOffsets = {nu:[-40,-39],acc:[-40,-39],str:[-40,-41],nac:[-37,-40],cas:[18,53],nim:[-20,-43],dri:[-25,-43],mis:[-25,-43],ici:[-25,-43],ope:[-25,-43],league:[30,-17],lac:[-25,-43],und:[26,-25],black:[-18,-43],anv:[0,-38]};
  let current = 'r1', phase = 'all', zoom = 1, visible = areas;
  const journeyOrder = ['nu','r1','acc','r2','str','dream','r3','well','nac','pin','sky','cas','r4','des','rel','nim','r16','lost','r5','draw','dri','cold','r6','charge','mis','mc','r7','ct','tw','ici','dt','moor','r8','tube','r9','ope','r10','vr','league','castle','r17','r18','r11','vb','r12','lac','chasm','und','bay','ruins','r13','r14','ab','black','r15','marv','p2','challenger','lib','anv','torn','swords','events'];
  const orderedAreas = [...journeyOrder.map(id => byId.get(id)).filter(Boolean), ...areas.filter(area => !journeyOrder.includes(area[0]))];
  const firstPlace = new Map();
  for (const area of orderedAreas) for (const name of (area[9] || '').split(',').filter(Boolean)) if (!firstPlace.has(name)) firstPlace.set(name, area);
  const fieldSpecies = [...firstPlace.keys()].filter(name => regionalSet.has(name) || nationalNumbers[name] || dexNumbers[name]);
  const extraSpecies = fieldSpecies.filter(name => !regionalSet.has(name)).sort((a,b)=>(nationalNumbers[a]||dexNumbers[a])-(nationalNumbers[b]||dexNumbers[b]));
  const allSpecies = [...unovaDex.map(row=>row[1]),...extraSpecies];
  const acquisition = {
    Servine:'Evolua Snivy no Nv. 17',Serperior:'Evolua Servine no Nv. 36',Pignite:'Evolua Tepig no Nv. 17',Emboar:'Evolua Pignite no Nv. 36',Dewott:'Evolua Oshawott no Nv. 17',Samurott:'Evolua Dewott no Nv. 36',
    Simisage:'Use Leaf Stone em Pansage',Simisear:'Use Fire Stone em Pansear',Simipour:'Use Water Stone em Panpour',
    Gigalith:'Troque Boldore com outro jogador',Swoobat:'Evolua Woobat com amizade alta',Conkeldurr:'Troque Gurdurr com outro jogador',Scolipede:'Evolua Whirlipede no Nv. 30',
    Petilil:'Troca interna em Nacrene: entregue Cottonee',Lilligant:'Use Sun Stone em Petilil',Krookodile:'Evolua Krokorok no Nv. 40',Scrafty:'Evolua Scraggy no Nv. 39',
    Carracosta:'Evolua Tirtouga no Nv. 37',Archeops:'Evolua Archen no Nv. 37',Solosis:'Só aparece selvagem em White. Receba por troca com outro jogador',Duosion:'Evolua Solosis no Nv. 32 (a primeira evolução vem de White)',Reuniclus:'Evolua Duosion no Nv. 41 (a primeira evolução vem de White)',
    Vanilluxe:'Evolua Vanillish no Nv. 47',Escavalier:'Troque Karrablast por Shelmet',Galvantula:'Evolua Joltik no Nv. 36',Ferrothorn:'Evolua Ferroseed no Nv. 40',
    Klang:'Evolua Klink no Nv. 38',Klinklang:'Evolua Klang no Nv. 49',Eelektrik:'Evolua Tynamo no Nv. 39',Eelektross:'Use Thunder Stone em Eelektrik',
    Lampent:'Evolua Litwick no Nv. 41',Chandelure:'Use Dusk Stone em Lampent',Haxorus:'Evolua Fraxure no Nv. 48',Accelgor:'Troque Shelmet por Karrablast',Golurk:'Evolua Golett no Nv. 43',
    Rufflet:'Só aparece selvagem em White. Receba por troca com outro jogador',Braviary:'Evolua Rufflet no Nv. 54 (a primeira evolução vem de White)',Zweilous:'Evolua Deino no Nv. 50',Hydreigon:'Evolua Zweilous no Nv. 64',
    Volcarona:'Encontro fixo Nv. 70 no Relic Castle após a Pokédex Nacional',Thundurus:'Lendário errante de White: troque com outro jogador',Zekrom:'Lendário da história de White: troque com outro jogador'
  };
  const storageKey='unova-black-field-guide-v2';
  const defaults={badges:0,league:false,surf:false,strength:false,cobalion:false,rod:false,season:'all',trades:false,events:false,starter:'',fossil:'',caught:[]};
  function normalizeProgress(value) {
    const clean={...defaults,caught:[]};
    if(!value||typeof value!=='object')return clean;
    clean.caught=Array.isArray(value.caught)?[...new Set(value.caught.filter(name=>allSpecies.includes(name)))]:[];
    if(Number.isInteger(value.badges)&&value.badges>=0&&value.badges<=8)clean.badges=value.badges;
    for(const key of ['league','surf','strength','cobalion','rod','trades','events'])clean[key]=value[key]===true;
    if(['all','Spring','Summer','Autumn','Winter'].includes(value.season))clean.season=value.season;
    if(['Snivy','Tepig','Oshawott'].includes(value.starter))clean.starter=value.starter;
    if(['Tirtouga','Archen'].includes(value.fossil))clean.fossil=value.fossil;
    return clean;
  }
  let progress=normalizeProgress(null), progressReady=false;
  const progressStore=createProgressStore({
    key:storageKey,normalize:normalizeProgress,
    onStatus:({state,text})=>{const status=document.getElementById('save-status');status.dataset.state=state;status.textContent=text;},
    onExternal:value=>{progress=value;if(progressReady){renderProgress();renderDexList();applyFilters();renderDetail();}}
  });
  progress=(await progressStore.load())||progress;
  const save=()=>progressStore.save(progress);
  const caught=()=>new Set(progress.caught);
  const stage={nu:0,r1:0,acc:0,r2:0,str:0,dream:0,r3:1,well:1,nac:1,pin:1,sky:2,cas:2,r4:3,des:3,rel:3,nim:3,r5:4,draw:4,dri:4,cold:4,r6:5,charge:5,mis:5,mc:5,r7:6,ct:6,tw:6,ici:6,dt:7,moor:6,r8:7,tube:7,r9:7,ope:7,r10:8,vr:8,league:8,castle:8,r16:3,lost:3,r17:0,r18:0,p2:0,torn:7,swords:5,lib:0,events:0};
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
      if(entry[0].includes('Tirtouga'))rank=3;
      if(entry[0]==='Petilil')rank=2;
      if(['Volcarona','Musharna'].includes(entry[0]))rank=100;
      if(['Cobalion','Virizion','Terrakion','Larvesta'].includes(entry[0]))rank=Math.max(rank,5);
      for(const name of entry[0].split(' / '))recordFirst(name,area,rank);
    }
  }
  function lockReason(area, table={}) {
    const method=table.method||'',seasons=table.seasons||[],req=table.requires||{};
    if ((area[5]==='post'||['chasm','challenger','ab','marv','black','r11','r12','r13','r14','r15','lac','und','vb'].includes(area[0])||req.league)&&!progress.league) return 'Conclua a história principal para acessar o local';
    const badges=req.badges??stage[area[0]]??0;
    if (badges>progress.badges) return `Avance até ${badges} insígnias para acessar o local (estimativa)`;
    if (method==='Swarms') return progress.league?'Confira se o enxame de hoje está neste local':'Os enxames só ficam disponíveis depois da Liga';
    if ((req.surf||['r17','r18','p2','mc'].includes(area[0])||/Surfing/.test(method))&&!progress.surf) return 'Você precisa de Surf';
    if (req.strength&&!progress.strength) return 'Você precisa de Strength para mover as pedras';
    if (req.cobalion&&!progress.cobalion) return 'Encontre Cobalion para liberar este setor';
    if (/Fishing/.test(method)&&(!progress.rod||!progress.league)) return 'Você precisa da Super Rod, recebida após vencer Ghetsis';
    if (seasons.length&&progress.season==='all') return 'Informe a estação do jogo em Meu progresso';
    if (seasons.length&&!seasons.includes(progress.season)) return 'Este encontro não está disponível na estação selecionada';
    return '';
  }
  function specialLock(area,entry,species=''){
    const base=lockReason(area);if(base)return base;
    const [name,method]=entry;
    const monkey={Snivy:'Panpour',Tepig:'Pansage',Oshawott:'Pansear'};
    if(species&&name==='Snivy / Tepig / Oshawott'&&progress.starter&&species!==progress.starter)return 'Você escolheu outro inicial; este precisa ser recebido por troca';
    if(species&&name==='Pansage / Pansear / Panpour'&&progress.starter&&species!==monkey[progress.starter])return 'O Pokémon recebido depende do inicial que você escolheu';
    if(species&&name==='Tirtouga / Archen'&&progress.fossil&&species!==progress.fossil)return 'Você escolheu o outro fóssil; esta espécie precisa ser recebida por troca';
    if (/Evento|Distribuição/.test(method)&&!progress.events)return 'Exige um Pokémon ou item de um evento antigo';
    if (name==='Petilil'&&progress.badges<2)return 'Capture Cottonee em Pinwheel Forest após 2 insígnias';
    if (/Troca/.test(method)&&method!=='Troca interna de Black'&&!progress.trades)return 'Ative “Mostrar Pokémon obtidos por troca” em Meu progresso';
    if (name.includes('Tirtouga')&&progress.badges<3)return 'Escolha um fóssil no Relic Castle após 3 insígnias';
    if (name==='Musharna')return progress.league?'Vá ao porão do Dreamyard em uma sexta-feira':'Porão do Dreamyard após a Liga';
    if (name==='Volcarona'&&!progress.league)return 'Após a Pokédex Nacional';
    if (name==='Darmanitan')return 'Use uma RageCandyBar na estátua';
    if (name==='Landorus'&&!progress.trades)return 'Receba Thundurus de White por troca';
    if (name==='Landorus')return 'Tenha Tornadus e Thundurus na equipe';
    if (['Virizion','Terrakion'].includes(name)&&!progress.cobalion)return 'Encontre Cobalion primeiro';
    if (name==='Cobalion'&&!progress.strength)return 'Você precisa de Strength para mover as pedras';
    if (['Larvesta','Cobalion'].includes(name)&&!progress.surf)return 'Você precisa de Surf';
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
    $('progress-summary').textContent=`${registered}/156 Unova · ${progress.caught.length}/${unovaDex.length+extraSpecies.length} no guia`;
  }
  let listOrder = 'dex', listScope = 'unova';
  function matches(area) {
    const q = norm(search.value.trim());
    const exact=allSpecies.find(name=>norm(name)===q||norm(dex(name).number)===q);
    const p = phase === 'all' || (phase === 'available' ? exact ? availableNames(area).includes(exact) : isAvailable(area) : phase === 'legend' ? area[11] === 'legend' || area[5] === 'legend' : area[5] === phase);
    const nums = (area[9] || '').split(',').filter(Boolean).map(name => dex(name).number).join(' ');
    const hay = norm([area[1],area[6],area[9],nums].join(' '));
    return p && (!q || hay.includes(q));
  }
  function drawMap() {
    let s = `<image href="unova-base.svg" x="0" y="0" width="1712" height="1080"/>`;
    for (const d of mappedAreas) {
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
    map.querySelectorAll('.node').forEach(node => {
      node.addEventListener('click', event => {
        const point = map.createSVGPoint(); point.x=event.clientX; point.y=event.clientY;
        const position = point.matrixTransform(map.getScreenCTM().inverse());
        select(UnovaMap.nearest(mappedAreas,position.x,position.y)[0]);
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
      if (['well','charge','mc','tw','vr','chasm'].includes(id)) return ['Chão da caverna','Caminhe pelo chão da caverna, no andar indicado abaixo.'];
      if (['r8','moor'].includes(id)) return ['Pântano','Caminhe na vegetação do pântano; no inverno algumas partes congelam.'];
      if (['ct','dt'].includes(id)) return ['Torre','Ande no andar ou na área indicada.'];
      return ['Grama comum','Caminhe pela grama normal da área.'];
    }
    if (method==='Doubles Grass'||method==='Double Grass') return ['Grama escura','Caminhe na grama de cor mais escura. Nela, podem aparecer dois Pokémon na mesma batalha.'];
    if (method==='Ground Shaking Spots') {
      if (['draw','marv'].includes(id)) return ['Sombra na ponte','Passe por cima das sombras que aparecem no chão da ponte. Você pode encontrar um Pokémon ou receber uma pena.'];
      if (['well','charge','mc','tw','vr','chasm'].includes(id)) return ['Nuvem de poeira','Caminhe até uma nuvem de poeira na caverna. Ela pode iniciar um encontro ou dar um item.'];
      return ['Grama que se mexe','Espere até um trecho de grama começar a se mexer e caminhe até ele para iniciar o encontro.'];
    }
    if (method==='Standard Surfing') return ['Surf','Use Surf e se mova pela água, fora dos pontos de ondulação.'];
    if (method==='Surfing Spots') return ['Água ondulante','Use Surf para alcançar o círculo de ondulação que aparece na água e passe por ele.'];
    if (method==='Standard Fishing') return ['Pesca','Fique na margem e use a Super Rod para pescar fora dos círculos de ondulação.'];
    if (method==='Fishing Spots') return ['Pesca na ondulação','Fique na margem e use a Super Rod apontando para o círculo de ondulação na água.'];
    if (method==='Swarms') return ['Enxame','Depois da Liga, os painéis das passagens entre rotas anunciam um enxame por dia. Este Pokémon só aparece aqui quando este local é o anunciado.'];
    return [method,'Encontro especial desta área.'];
  }
  const levelText = value => {const [from,to]=String(value).split(' - ');return from===to?from:`${from}–${to}`;};
  const rateUncertain=(id,method)=>((id==='r11'||id==='ab')&&method==='Standard Fishing')||(id==='chasm'&&method==='Fishing Spots');
  function encounterHTML(table,id,index) {
    const [title,help]=methodInfo(table.method,id);
    const where=[...table.sections.map(sectionLabel),...table.seasons.map(s=>seasonsPT[s]||s)].join(' · ');
    const lock=lockReason(byId.get(id),table);
    const total=table.pokemon.reduce((n,entry)=>n+entry[1],0);
    const disputed=rateUncertain(id,table.method);
    return `<details class="encounter-group" ${index<2?'open':''}><summary><span><b>${esc(title)}</b>${where?`<small>${esc(where)}</small>`:''}<small class="${lock?'availability-locked':'availability-ready'}">${lock?'Falta: '+esc(lock):'Requisitos atendidos pelo progresso informado'}</small></span><span class="encounter-toggle" aria-hidden="true">+</span></summary><div class="encounter-content"><p>${esc(help)}</p>${disputed?'<p class="data-caution">A fonte tem porcentagens que somam mais de 100%. Os Pokémon e níveis estão listados; a chance exata permanece sem confirmação.</p>':total!==100&&table.method!=='Swarms'?`<p class="data-caution">A fonte soma ${total}%. Porcentagens desta tabela precisam de confirmação independente.</p>`:''}<div class="encounter-list">${table.pokemon.map(([name,rate,level])=>`<div class="encounter-row"><span class="encounter-mon"><b class="dex-no${dex(name).scope==='Pokédex Nacional'?' national':''}">${esc(dex(name).number)}</b><strong>${esc(name)}</strong></span><span class="encounter-stats"><b>${disputed?'?':rate+'%'}</b><small>Nv. ${esc(levelText(level))}</small></span></div>`).join('')}</div></div></details>`;
  }
  function renderDetail() {
    const d = byId.get(current); if (!d) return;
    const tables=encounterTables[current]||[], specials=specialEncounters[current]||[];
    const wildCount=new Set(tables.flatMap(t=>t.pokemon.map(mon=>mon[0]))).size;
    const checklist=availableNames(d);
    const place = d[5] === 'post' ? 'Pós-Liga' : d[5] === 'legend' ? 'Evento / lendário' : d[6];
    const near = nearby(current);
    const source=d[10]&&tables.length ? `<a class="source-link" href="https://www.serebii.net/pokearth/unova/${encodeURIComponent(d[10])}.shtml" target="_blank" rel="noopener noreferrer">Conferir tabelas de Black no Pokéarth ↗</a>` : '';
    const fish=tables.some(t=>t.method.includes('Fishing')) ? '<p class="method-note">A Super Rod é recebida de Looker em Nuvema após vencer Ghetsis. As porcentagens comparam as espécies que podem aparecer pelo mesmo método, no mesmo setor e estação.</p>' : '<p class="method-note">A porcentagem mostra qual espécie pode aparecer quando um encontro acontece pelo método indicado. Ela não mede a chance de surgir uma batalha a cada passo.</p>';
    detail.innerHTML = `<div class="detail-top"><span class="detail-overline">FICHA DE CAMPO / ${esc(place)}</span><button class="detail-close" type="button" aria-label="Fechar detalhes">×</button><h2>${esc(d[1])}</h2><div class="detail-meta"><span class="pill">${esc(typeLabel(d))}</span>${d[5] === 'post' ? '<span class="pill gold">Após a Liga</span>' : ''}${d[11] === 'legend' ? '<span class="pill gold">Lendário / evento</span>' : ''}</div></div><div class="detail-body">${tables.length?`<section class="detail-section"><h3>Encontros selvagens em Black</h3><p class="encounter-intro">${wildCount} espécies · ${tables.length} listas por método, setor ou estação</p><div class="encounter-groups">${tables.map((t,i)=>encounterHTML(t,current,i)).join('')}</div>${fish}</section>`:''}${specials.length?`<section class="detail-section"><h3>Pokémon recebidos e encontros especiais</h3><div class="special-list">${specials.map(entry=>`<div class="special-entry"><b>${esc(entry[0])}</b><small>${esc(entry[1])} · ${specialLock(d,entry)?'Falta: '+esc(specialLock(d,entry)):'Requisitos atendidos pelo progresso informado'}</small><p>${esc(entry[2])}</p></div>`).join('')}</div></section>`:''}${!tables.length&&!specials.length?`<section class="detail-section"><h3>Neste local</h3><p>${esc(areaNotes[current]||d[7]||'Sem encontro selvagem comum neste local.')}</p></section>`:''}${areaNotes[current]&&(tables.length||specials.length)?`<section class="detail-section"><h3>Atenção</h3><p>${esc(areaNotes[current])}</p></section>`:''}<section class="detail-section"><h3>Acesso e requisitos</h3><p>${esc(d[8])}</p></section>${near.length?`<section class="detail-section"><h3>Perto daqui</h3><div class="nearby">${near.map(id=>`<button type="button" data-near="${esc(id)}">${esc(byId.get(id)[1])}</button>`).join('')}</div></section>`:''}${source}</div>`;
    if(checklist.length) detail.querySelector('.detail-body').insertAdjacentHTML('afterbegin',`<section class="detail-section area-checklist"><h3>Pokémon que você já pode obter</h3><p>${checklist.filter(name=>caught().has(name)).length}/${checklist.length} já obtidos entre os Pokémon disponíveis neste local</p><div class="checklist-items">${checklist.map(name=>`<button type="button" data-caught="${esc(name)}" aria-pressed="${caught().has(name)}"><b>${esc(dex(name).number)}</b> ${esc(name)} <span>${caught().has(name)?'✓':'+'}</span></button>`).join('')}</div></section>`);
    detail.querySelector('.detail-close').onclick = closeSheet;
    detail.querySelectorAll('[data-near]').forEach(button => button.onclick = () => select(button.dataset.near));
    detail.querySelectorAll('[data-caught]').forEach(button=>button.onclick=()=>toggleCaught(button.dataset.caught));
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
    if (!byId.has(id)) return;
    current=id; drawMap(); renderDetail(); renderResults(); centerOn(id);
    if (mobile() && open) { detail.classList.add('open'); scrim.hidden=false; document.body.style.overflow='hidden'; detail.scrollTop=0; detail.querySelector('.detail-close').focus(); }
  }
  function closeSheet() { detail.classList.remove('open'); scrim.hidden=true; document.body.style.overflow=''; }
  function renderResults() {
    const q=search.value.trim(); $('results-title').textContent = q ? 'Resultados da busca' : phase === 'all' ? 'Todas as áreas' : phase === 'available' ? 'Pokémon que posso capturar' : phase === 'story' ? 'Durante a história' : phase === 'post' ? 'Após a Liga' : 'Lendários e eventos';
    $('result-count').textContent = `${visible.length} ${visible.length === 1 ? 'local' : 'locais'}`;
    list.innerHTML=visible.length ? visible.map(d => {const names=phase==='available'?availableNames(d):(d[9]||'').split(',').filter(Boolean);return `<button class="result-item${d[0]===current?' active':''}" type="button" data-id="${esc(d[0])}"><span class="result-dot ${category(d)}"></span><span class="result-copy"><strong>${esc(d[1])}</strong><small>${esc(names.length ? names.slice(0,4).map(name => `${dex(name).number} ${name}`).join(' · ') : d[7])}</small></span></button>`;}).join('') : '<div class="no-results">Nenhum local encontrado. Tente outro nome ou filtro.</div>';
    list.querySelectorAll('[data-id]').forEach(button => button.onclick = () => select(button.dataset.id));
    const species=allSpecies.find(name=>norm(name)===norm(q)||norm(dex(name).number)===norm(q));
    const finder=$('pokemon-finder');finder.hidden=!species;
    if(species){
      const options=orderedAreas.flatMap(area=>(encounterTables[area[0]]||[]).flatMap(table=>table.pokemon.filter(row=>row[0]===species).map(([name,rate,level])=>({area,table,rate,level,lock:lockReason(area,table)}))));
      const specialOptions=orderedAreas.flatMap(area=>(specialEncounters[area[0]]||[]).filter(entry=>entry[0].split(' / ').includes(species)).map(entry=>({area,entry,lock:specialLock(area,entry,species)})));
      options.sort((a,b)=>Number(!!a.lock)-Number(!!b.lock)||Number(rateUncertain(a.area[0],a.table.method))-Number(rateUncertain(b.area[0],b.table.method))||b.rate-a.rate);
      finder.innerHTML=`<div class="finder-title"><span class="section-index">COMO ENCONTRAR</span><strong>${esc(dex(species).number)} ${esc(species)}</strong></div>${options.length||specialOptions.length?`<div class="finder-options">${[...options.slice(0,4).map(item=>`<button type="button" data-find="${esc(item.area[0])}"><b>${esc(item.area[1])}</b><span>${esc(methodInfo(item.table.method,item.area[0])[0])} · ${rateUncertain(item.area[0],item.table.method)?'chance a confirmar':item.rate+'%'} · Nv. ${esc(levelText(item.level))}</span><small>${item.lock?'Falta: '+esc(item.lock):'Requisitos atendidos pelo progresso informado'}</small></button>`),...specialOptions.slice(0,2).map(item=>`<button type="button" data-find="${esc(item.area[0])}"><b>${esc(item.area[1])}</b><span>${esc(item.entry[1])}</span><small>${item.lock?'Condição: '+esc(item.lock):'Ver detalhes do encontro'}</small></button>`)].join('')}</div>`:`<p>${esc(acquisition[species]||'Consulte a lista de Pokémon para saber como obter esta espécie.')}</p>`}`;
      finder.querySelectorAll('[data-find]').forEach(button=>button.onclick=()=>select(button.dataset.find));
    }
  }
  function applyFilters() { visible=areas.filter(matches); clear.hidden=!search.value; drawMap(); renderResults(); }
  const regionalNumber = n => '#'+String(n).padStart(3,'0');
  function toggleCaught(name) {
    const set=caught();set.has(name)?set.delete(name):set.add(name);
    progress.caught=[...set];save();renderProgress();renderDexList();renderDetail();
  }
  function renderDexList() {
    const q = norm($('dex-search').value.trim());
    const container = $('dex-list');
    const entries=listScope==='unova'?unovaDex:[...unovaDex,...extraSpecies.map(name=>[nationalNumbers[name]||dexNumbers[name],name])];
    if (listOrder === 'dex') {
      const found = entries.filter(([n,name]) => !q || norm(`${dex(name).number} ${n} ${name} ${firstPlace.get(name)?.[1] || ''} ${acquisition[name]||''}`).includes(q));
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
        if(listScope==='unova'&&!regionalSet.has(name))continue;
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
      const withoutPlace=entries.map(([,name])=>name).filter(name=>!firstPlace.has(name)&&(!q||norm(`${name} ${dex(name).number} ${acquisition[name]||''}`).includes(q)));
      if(withoutPlace.length){count+=withoutPlace.length;groups.push(`<section class="journey-group"><div class="journey-place"><span class="step">OBTENÇÃO</span><h3>Evolução ou troca</h3><small>Obtido por evolução, troca ou outra condição</small></div><div class="journey-species">${withoutPlace.map(name=>`<span title="${esc(acquisition[name]||'')}"><b>${esc(dex(name).number)}</b>${esc(name)}<button type="button" data-caught="${esc(name)}" aria-label="${caught().has(name)?'Desmarcar':'Marcar como obtido'} ${esc(name)}" aria-pressed="${caught().has(name)}">${caught().has(name)?'✓':'+'}</button></span>`).join('')}</div></section>`);}
      $('dex-count').textContent = `${count} Pokémon · ${groups.length} locais`;
      container.innerHTML = groups.length ? groups.join('') : '<p class="dex-empty">Nenhum Pokémon encontrado nessa ordem de obtenção. Tente outro nome, número ou local.</p>';
    }
    container.querySelectorAll('[data-place]').forEach(button => button.onclick = () => { switchView('map'); select(button.dataset.place); });
    container.querySelectorAll('[data-caught]').forEach(button => button.onclick = () => toggleCaught(button.dataset.caught));
  }
  function switchView(view) {
    const showMap = view === 'map';
    $('map-view').hidden = !showMap; $('dex-view').hidden = showMap;
    document.querySelectorAll('.view-tab').forEach(button => { const active = button.dataset.view === view; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); });
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
  $('export-progress').onclick=()=>{const blob=new Blob([JSON.stringify(progress,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='unova-black-progresso.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
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
  viewport.addEventListener('scroll',updateMinimap,{passive:true});
  $('recenter').onclick=()=>centerOn('nu');
  window.addEventListener('resize',()=>{if(!mobile())closeSheet()});
  progressReady=true;
  renderProgress();applyFilters(); renderDetail(); renderDexList(); requestAnimationFrame(()=>centerOn('r1',false));
})();
