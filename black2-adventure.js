/* Same tool engine as Black 1, adapted for Complete Unova. */
/* Pure journey helpers and a progressively disclosed tools interface. */
(function(root){
'use strict';
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,'');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const typePT={Normal:'Normal',Fighting:'Lutador',Flying:'Voador',Poison:'Veneno',Ground:'Terra',Rock:'Pedra',Bug:'Inseto',Ghost:'Fantasma',Steel:'Aço',Fire:'Fogo',Water:'Água',Grass:'Planta',Electric:'Elétrico',Psychic:'Psíquico',Ice:'Gelo',Dragon:'Dragão',Dark:'Sombrio'};
function createAdventureGuide(ctx){
 const {areas,encounters,specials,stage,editorial,data,chapters,allSpecies,items}=ctx;
 const areaById=new Map(areas.map(a=>[a[0],a]));
 const monName=new Map(Object.keys(data.pokemon).map(n=>[norm(n),n]));
 const mon=n=>data.pokemon[monName.get(norm(n))];
 const get=ctx.getProgress;
 const allowed=id=>{const a=areaById.get(id);return a&&!ctx.spoilerLocked(a);};
 const link=(id,label)=>`<button type="button" data-guide-place="${esc(id)}">${esc(label||areaById.get(id)?.[1]||id)} ↗</button>`;
 const limited=(rows,fn)=>rows.length?rows.slice(0,8).map(fn).join('')+(rows.length>8?`<details class="guide-more"><summary>Ver mais ${rows.length-8}</summary>${rows.slice(8).map(fn).join('')}</details>`:''):'<p class="guide-empty">Nenhum resultado com estas condições.</p>';
 const chapterIndex=()=>ctx.chapterIndex?ctx.chapterIndex():get().league?9:Math.min(8,get().badges);
 const remaining=id=>({pokemon:ctx.availableNames(areaById.get(id)).filter(n=>!get().caught.includes(n)),items:(items[id]||[]).filter(r=>!r.unavailable&&!get().collectedItems.includes(r.id))});
 function returns(){
  const p=get();return areas.filter(a=>allowed(a[0])&&(stage[a[0]]??99)<=p.badges).map(a=>{
   const tables=(encounters[a[0]]||[]).filter(t=>!ctx.lockReason(a,t)&&(p.surf&&(/Surfing/.test(t.method)||t.requires?.surf)||p.rod&&/Fishing/.test(t.method)||p.strength&&t.requires?.strength||p.cobalion&&t.requires?.cobalion));
   const names=[...new Set(tables.flatMap(t=>t.pokemon.map(r=>r[0])))].filter(n=>!p.caught.includes(n));
   const recovered=(items[a[0]]||[]).filter(r=>!r.unavailable&&!p.collectedItems.includes(r.id)&&((p.surf&&/Surf/i.test([r.where,...(r.requirements||[])].join(' ')))||(p.strength&&/Strength/i.test([r.where,...(r.requirements||[])].join(' ')))));
   return {area:a,names,items:recovered,methods:[...new Set(tables.map(t=>ctx.methodInfo(t.method,a[0])[0]))]};
  }).filter(r=>r.names.length||r.items.length);
 }
 function evolution(name){return data.evolutions.filter(e=>norm(e.fromSpecies)===norm(name)||norm(e.toSpecies)===norm(name));}
 function ancestors(name){let list=[],n=monName.get(norm(name)),seen=new Set();while(n&&!seen.has(n)){seen.add(n);list.unshift(n);n=data.pokemon[n]?.parent;}return list;}
 const routeIndex=new Map();
 const record=(name,row)=>{const key=norm(name);if(!routeIndex.has(key))routeIndex.set(key,[]);routeIndex.get(key).push(row);};
 for(const a of areas){
  for(const t of encounters[a[0]]||[])for(const [n,rate,level] of t.pokemon)record(n,{area:a,table:t,rate,level});
  for(const e of specials[a[0]]||[])for(const n of e[0].split(' / '))record(n,{area:a,special:e});
 }
 function routes(name){return (routeIndex.get(norm(name))||[]).filter(r=>allowed(r.area[0])).map(r=>({...r,lock:r.special?ctx.specialLock(r.area,r.special,name):ctx.lockReason(r.area,r.table)})).sort((a,b)=>Number(!!a.lock)-Number(!!b.lock));}
 function evolutionHTML(name){
  const rules=evolution(name);if(!rules.length)return '<p>Esta espécie não tem uma evolução cadastrada em Black 2.</p>';
  return rules.map(e=>`<article class="guide-row"><strong>${esc(e.fromSpecies)} → ${esc(e.toSpecies)}</strong><p>${esc(e.condition)}</p>${e.item?`<button type="button" data-guide-item="${esc(e.item)}">Onde conseguir ${esc(e.item)}?</button>`:''}</article>`).join('');
 }
 function routeHTML(r){return `<article class="guide-row">${link(r.area[0])}<p>${r.special?esc(r.special[2]):`${esc(ctx.methodInfo(r.table.method,r.area[0])[0])} · ${esc(r.table.sections.map(ctx.sectionLabel).join(', ')||'Área indicada')} · ${esc(r.table.seasons.map(s=>ctx.seasonLabel(s)).join(', ')||'Todas as estações')} · ${r.rate==null?"taxa não documentada":r.rate+"%"} · Nv. ${r.level==='?'?'—':esc(r.level)}`}</p><small>${esc(r.lock||'Compatível com o progresso informado. Confira os acontecimentos da história.')}</small></article>`;}
 function itemSearch(q){return areas.filter(a=>allowed(a[0])).flatMap(a=>(items[a[0]]||[]).filter(r=>ctx.itemMatches(r,q)).map(row=>({area:a,row})));}
 function diagnose(name,id=''){
  const exact=allSpecies.find(n=>norm(n)===norm(name));if(!exact)return '<p>Escolha um Pokémon do guia para conferir suas condições.</p>';
  const all=routes(exact),rows=id?all.filter(r=>r.area[0]===id):all;
  const alternatives=ancestors(exact).filter(n=>n!==exact&&routes(n).length);
  let result=`<p><strong>${esc(exact)}</strong>: confira primeiro o método e o setor. A porcentagem indica a distribuição entre espécies, não uma garantia após certo número de passos.</p>`;
  if(rows.length)result+=limited(rows,routeHTML);
  else result+=`<p>${id?'Não há encontro desta espécie cadastrado neste local nesta edição.':'Não há encontro direto cadastrado para esta espécie com os filtros atuais.'} ${esc(ctx.acquisition[exact]||'Confira evolução, troca e as espécies anteriores da família.')}</p>`;
  if(id&&all.length&&!rows.length)result+='<h4>Locais com registros</h4>'+limited(all,routeHTML);
  if(alternatives.length)result+='<h4>Você também pode começar pela família</h4>'+alternatives.map(n=>`<article class="guide-row"><strong>${esc(n)}</strong>${limited(routes(n).slice(0,2),routeHTML)}</article>`).join('');
  result+='<details class="guide-help"><summary>Ainda não apareceu?</summary><p>Confira a edição Complete Unova v1.12, o andar, a estação do jogo e o terreno. Grama comum, grama que se mexe, poeira, água e pesca têm listas diferentes. Repel pode impedir encontros com Pokémon abaixo do nível do primeiro da equipe. Um encontro raro pode demorar; repetir passos não garante a espécie.</p></details>';
  return result;
 }
 function summaryHTML(id){const r=remaining(id);return `<p><b>${r.pokemon.length}</b> Pokémon disponíveis ainda não marcados · <b>${r.items.length}</b> registros de itens ainda não marcados.</p><small>Os itens incluem lojas e requisitos futuros: abra a ficha para conferir. A contagem depende das suas marcações.</small>`;}
 function gymHTML(g){
  const picks=g.picks.filter(n=>areas.some(a=>allowed(a[0])&&ctx.availableNames(a).includes(n))||get().caught.includes(n));
  return `<article class="guide-row"><h4>${esc(g.leader)} · ${esc(g.type)}</h4><p>Os times completos alterados pela hack ainda precisam de confirmação. Confira o modo de dificuldade antes de se preparar.</p><p>${esc(g.advice)}</p><small>Opções compatíveis com seu progresso: ${esc(picks.join(', ')||'informe suas insígnias e seu inicial em Minha jornada')}.</small><p>Confira também níveis, golpes e habilidades da sua equipe. A espécie sozinha não garante vantagem.</p>${link(g.area,'Abrir cidade do ginásio')}</article>`;
 }
 let host=null;
 function dashboard(){if(!host)return;
  const p=get(),index=chapterIndex(),c=chapters[index],tasks=editorial.tasks[index];
  host.querySelector('#guide-now').innerHTML=`<span class="guide-eyebrow">${esc(c.when)}</span><h3>${esc(c.title)}</h3><p>${esc(p.spoilerFree?'Siga os locais desta etapa e marque as tarefas concluídas. Os detalhes futuros ficam escondidos.':c.text)}</p><small>Etapa escolhida no detonado. Marcar uma tarefa não altera suas insígnias automaticamente.</small><div class="guide-tasks">${tasks.map(t=>`<div><label><input type="checkbox" data-guide-task="${t.id}" ${p.tasks.includes(t.id)?'checked':''}>${esc(p.spoilerFree&&ctx.spoilerLocked(areaById.get(t.area))?'Continuar a história nesta etapa':t.text)}</label>${allowed(t.area)?link(t.area,'Ver local'):''}</div>`).join('')}</div>${p.starter?'':'<p class="guide-choice">Escolha do inicial: você recebe apenas um dos três. A hack também adiciona as formas intermediárias em encontros selvagens.</p>'}${false?'<p class="guide-choice">Antes de escolher um fóssil: Cover Fossil → Tirtouga; Plume Fossil → Archen. Você escolhe um por partida.</p>':''}`;
  const ret=returns();if(host.querySelector('#guide-returns').closest('.guide-tool').open)host.querySelector('#guide-returns').innerHTML=ret.length?limited(ret,r=>`<article class="guide-row">${link(r.area[0])}${r.names.length?`<p>${esc(r.methods.join(', '))}: ${esc(r.names.join(', '))}</p>`:''}${r.items.length?`<p>Itens para conferir: ${esc(r.items.map(i=>i.name).join(', '))}.</p>`:''}<small>Disponíveis conforme os recursos que você marcou. Confira o setor na ficha.</small></article>`):'<p>Marque Surf, Strength, Cobalion ou Super Rod em Minha jornada. Aqui aparecem encontros liberados por esses recursos que você ainda não marcou como obtidos.</p>';
  if(host.querySelector('#guide-pending').closest('.guide-tool').open)host.querySelector('#guide-pending').innerHTML=limited(areas.filter(a=>allowed(a[0])).map(a=>({area:a,...remaining(a[0])})).filter(r=>r.pokemon.length||r.items.length),r=>`<article class="guide-row">${link(r.area[0])}${summaryHTML(r.area[0])}</article>`);
  if(host.querySelector('#guide-gyms').closest('.guide-tool').open)host.querySelector('#guide-gyms').innerHTML=editorial.gyms.filter((g,i)=>!p.spoilerFree||i<=p.badges).map(gymHTML).join('');
  if(host.querySelector('#guide-team-list').closest('.guide-tool').open)host.querySelector('#guide-team-list').innerHTML=p.team.length?p.team.map(n=>{const m=mon(n),r=routes(n),base=ancestors(n).find(s=>routes(s).length);return `<article class="guide-row"><div class="guide-row-head"><strong>${esc(n)}</strong><button type="button" data-remove-team="${esc(n)}" aria-label="Tirar ${esc(n)} da equipe">Tirar</button></div><small>${esc(m?.types.map(t=>typePT[t]||t).join(' / ')||'')}</small>${r.length?routeHTML(r[0]):`<p>${esc(ctx.acquisition[n]||'Comece por uma espécie anterior e evolua.')}</p>${base?limited(routes(base).slice(0,1),routeHTML):''}`}${evolutionHTML(n)}</article>`}).join(''):'<p>Escolha até seis Pokémon. O planejamento não marca capturas automaticamente.</p>';
  host.querySelector('#team-size').textContent=`${p.team.length}/6`;
  if(host.querySelector('#guide-dex-plan').closest('.guide-tool').open)host.querySelector('#guide-dex-plan').innerHTML=['Captura / presente','Evolução','Troca com personagem','Encontro especial'].map(group=>{
   const names=allSpecies.filter(n=>!p.caught.includes(n)&&ctx.isSpeciesVisible(n)).filter(n=>{
    const ac=ctx.acquisition[n]||'',rs=routes(n);let kind=/evento|Distribuição/i.test(ac)||rs.some(r=>r.special&&/Evento|Distribuição/.test(r.special[1]))?'Encontro especial':/White|outro jogador/.test(ac)?'Troca com personagem':rs.some(r=>!r.special||!/Troca/.test(r.special[1]))?'Captura / presente':evolution(n).some(e=>e.toSpecies===n)?'Evolução':rs.some(r=>r.special)?'Troca com personagem':'Evolução';return kind===group;
   });return `<details class="guide-category"><summary>${group} · ${names.length} pendentes</summary>${limited(names,n=>`<article class="guide-row"><strong>${esc(n)}</strong><p>${esc(ctx.acquisition[n]|| (group==='Evolução'?evolution(n).filter(e=>e.toSpecies===n).map(e=>e.condition).join(' / '):'Consulte os métodos e requisitos na busca de Pokémon.'))}</p>${routes(n)[0]?link(routes(n)[0].area[0]):''}<button type="button" data-guide-mon="${esc(n)}">Como obter?</button></article>`)}</details>`;
  }).join('');
  const species=allSpecies.filter(ctx.isSpeciesVisible);for(const id of ['team-choice','evolution-choice','diagnostic-choice']){
   const sel=host.querySelector('#'+id),old=sel.value;sel.innerHTML='<option value="">Escolha um Pokémon</option>'+species.map(n=>`<option>${esc(n)}</option>`).join('');if(species.includes(old))sel.value=old;
  }
  const ds=host.querySelector('#diagnostic-area'),old=ds.value;ds.innerHTML='<option value="">Todos os locais</option>'+areas.filter(a=>allowed(a[0])).map(a=>`<option value="${a[0]}">${esc(a[1])}</option>`).join('');if(allowed(old))ds.value=old;
  const servicesQ=host.querySelector('#service-query').value;if(host.querySelector('#services-output').closest('.guide-tool').open)renderServices(servicesQ);if(host.querySelector('#agenda-output').closest('.guide-tool').open)renderAgenda();
  const output=host.querySelector('#diagnostic-output');if(host.querySelector('#diagnostic-choice').value)output.innerHTML=diagnose(host.querySelector('#diagnostic-choice').value,ds.value);
  if(host.querySelector('#evolution-choice').value)host.querySelector('#evolution-output').innerHTML=evolutionHTML(host.querySelector('#evolution-choice').value);
  if(host.querySelector('#item-query').value)renderItems(host.querySelector('#item-query').value);
  if(host.querySelector('#move-query').value)renderMoves(host.querySelector('#move-query').value);
 }
 function renderServices(q=''){host.querySelector('#services-output').innerHTML=limited(editorial.services.filter(r=>allowed(r.area)&&norm(r.name+' '+r.text+' '+areaById.get(r.area)[1]).includes(norm(q))),r=>`<article class="guide-row"><h4>${esc(r.name)}</h4><p>${esc(r.text)}</p>${link(r.area)}<a href="${esc(r.source)}" target="_blank" rel="noopener noreferrer">Fonte ↗</a></article>`);}
 function renderAgenda(){
  const d=Number(host.querySelector('#game-day').value),season=host.querySelector('#game-season').value;
  host.querySelector('#agenda-output').innerHTML=limited(editorial.agenda.filter(r=>allowed(r.area)&&r.days.includes(d)&&(!r.seasons||r.seasons.includes(season))&&(!r.post||get().league)),r=>`<article class="guide-row"><h4>${esc(r.title)}</h4><p>${esc(r.text)}</p>${link(r.area)}</article>`);
 }
 function renderItems(q){host.querySelector('#item-output').innerHTML=q.trim()?limited(itemSearch(q),r=>`<article class="guide-row"><strong>${esc(r.row.name)}</strong><p>${esc(r.row.where)}</p><small>${r.row.unavailable?'Indisponível':get().collectedItems.includes(r.row.id)?'Já marcado como obtido':'Ainda não marcado'}${r.row.price?' · '+esc(r.row.price):''}</small>${r.row.requirements?.length?`<p>Requisitos: ${esc(r.row.requirements.join(' · '))}</p>`:''}${link(r.area[0])}</article>`):'<p>Busque um item, uma pedra de evolução, um golpe de TM ou um código.</p>';}
 function renderMoves(q){
  if(!q.trim()){host.querySelector('#move-output').innerHTML='<p>Digite o nome de um golpe, como Thunderbolt ou False Swipe.</p>';return;}
  const rows=allSpecies.filter(ctx.isSpeciesVisible).flatMap(n=>(mon(n)?.moves||[]).filter(([m])=>norm(m).includes(norm(q))).map(([move,method,level])=>({name:n,move,method,level})));
  host.querySelector('#move-output').innerHTML='<p>Dados de Black 2 / Complete Unova v1.12. Golpes por reprodução exigem planejar os pais; golpes de tutor dependem do tutor e de seus requisitos.</p>'+limited(rows,r=>`<article class="guide-row"><strong>${esc(r.name)} · ${esc(r.move)}</strong><p>${esc(data.methods[r.method])}${r.method===1?' · Nv. '+r.level:''}</p>${r.method===4?itemSearch(r.move).slice(0,2).map(x=>link(x.area[0],x.row.code+' — '+x.area[1])).join(''):r.method===3?'<p>Consulte os tutores em Serviços úteis.</p>':''}<button type="button" data-guide-mon="${esc(r.name)}">Como obter ${esc(r.name)}?</button></article>`);
 }
 function renderArea(id){
  const a=areaById.get(id);if(!a||!allowed(id))return '';
  const services=editorial.services.filter(r=>r.area===id),gym=editorial.gyms.find(r=>r.area===id);
  return `<details class="area-tools"><summary>Meu planejamento neste local</summary><div class="guide-area-content"><h4>O que falta</h4>${summaryHTML(id)}${services.length?'<h4>Serviços úteis</h4>'+services.map(r=>`<p><b>${esc(r.name)}:</b> ${esc(r.text)}</p>`).join(''):''}${gym?`<details><summary>Preparar para o ginásio</summary>${gymHTML(gym)}</details>`:''}<label for="area-note">Meu lembrete para ${esc(a[1])}</label><textarea id="area-note" data-area-note="${id}" maxlength="1000" rows="3" placeholder="Ex.: voltar com Surf; procurar Axew">${esc(get().notes[id]||'')}</textarea><small data-note-status>O lembrete fica salvo neste aparelho.</small></div></details>`;
 }
 function mount(element){
  host=element;host.innerHTML=`<div class="guide-intro"><span class="section-index">03 / PLANEJAR</span><h1>Ferramentas da jornada</h1><p>Escolha uma ferramenta e abra só o que você precisa. As sugestões usam seu avanço em “Minha jornada”.</p><label class="guide-spoilers"><input type="checkbox" id="spoiler-free" ${get().spoilerFree?'checked':''}> Esconder lugares e Pokémon de etapas futuras</label></div><section class="guide-now-card" aria-label="Próximo objetivo"><h2>O que fazer agora?</h2><div id="guide-now"></div></section><div class="guide-tools-grid">${[
 ['Vale voltar aqui','Encontros e itens para conferir com seus recursos','<div id="guide-returns"></div>'],
 ['Pendências por área','Pokémon e itens que você ainda não marcou','<div id="guide-pending"></div>'],
 ['Preparação para os ginásios','Níveis de referência, perigos e opções','<div id="guide-gyms"></div>'],
 ['Minha equipe','Planeje seis Pokémon e veja como obtê-los','<label for="team-choice">Adicionar à equipe</label><div class="guide-inline"><select id="team-choice"></select><button id="add-team" type="button">Adicionar</button><b id="team-size"></b></div><p id="team-message" role="status"></p><div id="guide-team-list"></div>'],
 ['Evolução','Condições de evolução em Black 2','<label for="evolution-choice">Pokémon</label><select id="evolution-choice"></select><div id="evolution-output"><p>Escolha uma espécie para ver suas evoluções e requisitos.</p></div><details class="guide-help"><summary>Como conferir amizade?</summary><p>Confira o avaliador de amizade disponível nesta edição. As falas indicam faixas, não um número exato. Para evoluir por amizade, a condição precisa estar atendida ao subir de nível. Andar, ganhar níveis e evitar desmaios ajudam.</p></details>'],
 ['Por que não encontro esse Pokémon?','Confira local, método, estação e requisitos','<label for="diagnostic-choice">Pokémon</label><select id="diagnostic-choice"></select><label for="diagnostic-area">Onde você está procurando?</label><select id="diagnostic-area"></select><div id="diagnostic-output"></div>'],
 ['Onde conseguir um item?','Busca por nome, pedra de evolução, TM ou HM','<label for="item-query">Item ou máquina</label><input id="item-query" type="search" placeholder="Ex.: Dusk Stone, pedra de fogo, TM61"><div id="item-output"></div>'],
 ['Busca de golpes','Quem aprende e por qual método','<label for="move-query">Nome do golpe no jogo</label><input id="move-query" type="search" placeholder="Ex.: Thunderbolt"><div id="move-output"></div>'],
 ['Serviços úteis','Relembrar golpes, amizade, creche e mais','<label for="service-query">Qual serviço você procura?</label><input id="service-query" type="search" placeholder="Ex.: amizade, golpes, fósseis"><div id="services-output"></div>'],
 ['Agenda do jogo','Use a data e a estação do seu DS ou emulador','<p>O relógio do jogo pode ser diferente do celular. Cada estação dura um mês: primavera em jan/mai/set; verão em fev/jun/out; outono em mar/jul/nov; inverno em abr/ago/dez.</p><label for="game-day">Dia da semana no jogo</label><select id="game-day">'+['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'].map((s,i)=>`<option value="${i}">${s}</option>`).join('')+'</select><label for="game-season">Estação no jogo</label><select id="game-season">'+[['Spring','Primavera'],['Summer','Verão'],['Autumn','Outono'],['Winter','Inverno']].map(([v,n])=>`<option value="${v}">${n}</option>`).join('')+'</select><div id="agenda-output"></div>'],
 ['Completar a Pokédex','Separe o que precisa capturar, evoluir ou trocar','<p>Esta lista usa as espécies do guia. Eventos antigos e Pokémon de White têm condições próprias; não aparecem todos na natureza nesta edição.</p><div id="guide-dex-plan"></div>'],
 ['Preparar uma captura especial','Uma lista para conferir antes da batalha','<ol class="capture-prep"><li>Salve antes de interagir com um Pokémon fixo, para poder tentar de novo se algo der errado.</li><li>Leve Poké Balls, itens de cura e uma equipe que aguente a batalha.</li><li>Reduza o HP com cuidado. False Swipe deixa pelo menos 1 HP, mas não acerta Fantasmas normalmente.</li><li>Sono e paralisia ajudam; veneno e queimadura podem derrotar o alvo.</li><li>Quick Ball ajuda no primeiro turno; Dusk Ball em cavernas ou à noite; Timer Ball em batalhas longas. Nenhuma dessas garante a captura.</li><li>Na hack, os encontros adicionais podem ter condições próprias. Confira a ficha antes de procurar.</li></ol><div class="guide-inline"><button data-guide-item="Quick Ball" type="button">Onde conseguir Poké Balls?</button><button data-guide-move="False Swipe" type="button">Quem aprende False Swipe?</button></div>'],
 ['Meu progresso em outros aparelhos','Continuar no celular e no PC','<div id="cloud-tools"></div>'],
 ['Usar sem internet','Abra o guia uma vez antes de ficar offline','<p id="offline-state" role="status">Preparando a consulta sem internet…</p><p>Depois de baixar os arquivos, mapa, buscas e marcações funcionam sem conexão. Links de fontes e sincronização precisam de internet.</p>']
 ].map(([title,sub,content])=>`<details class="guide-tool"><summary><b>${title}</b><small>${sub}</small></summary><div class="guide-tool-body">${content}</div></details>`).join('')}</div>`;
  host.querySelector('#game-day').value=String(new Date().getDay());host.querySelector('#game-season').value=get().season==='all'?['Winter','Spring','Summer','Autumn'][((new Date().getMonth()+1)%4)]:get().season;
  host.addEventListener('click',e=>{
   const place=e.target.closest('[data-guide-place]');if(place){ctx.openArea(place.dataset.guidePlace);return;}
   const item=e.target.closest('[data-guide-item]');if(item){const input=host.querySelector('#item-query');input.value=item.dataset.guideItem;input.closest('details.guide-tool').open=true;renderItems(input.value);input.focus();return;}
   const move=e.target.closest('[data-guide-move]');if(move){const input=host.querySelector('#move-query');input.value=move.dataset.guideMove;input.closest('details.guide-tool').open=true;renderMoves(input.value);input.focus();return;}
   const target=e.target.closest('[data-guide-mon]');if(target){const sel=host.querySelector('#diagnostic-choice');sel.value=target.dataset.guideMon;sel.closest('details.guide-tool').open=true;host.querySelector('#diagnostic-area').value='';host.querySelector('#diagnostic-output').innerHTML=diagnose(sel.value);sel.focus();return;}
   const remove=e.target.closest('[data-remove-team]');if(remove)ctx.update({team:get().team.filter(n=>n!==remove.dataset.removeTeam)});
  });
  host.addEventListener('change',e=>{
   if(e.target.dataset.guideTask){const set=new Set(get().tasks);e.target.checked?set.add(e.target.dataset.guideTask):set.delete(e.target.dataset.guideTask);ctx.update({tasks:[...set]});}
   if(e.target.id==='spoiler-free'){ctx.update({spoilerFree:e.target.checked});ctx.refresh();}
   if(e.target.id==='evolution-choice')host.querySelector('#evolution-output').innerHTML=evolutionHTML(e.target.value);
   if(['diagnostic-choice','diagnostic-area'].includes(e.target.id))host.querySelector('#diagnostic-output').innerHTML=diagnose(host.querySelector('#diagnostic-choice').value,host.querySelector('#diagnostic-area').value);
   if(['game-day','game-season'].includes(e.target.id))renderAgenda();
  });
  host.querySelector('#add-team').onclick=()=>{const name=host.querySelector('#team-choice').value,msg=host.querySelector('#team-message');if(!name){msg.textContent='Escolha um Pokémon primeiro.';return;}if(get().team.includes(name)){msg.textContent='Esse Pokémon já está na equipe.';return;}if(get().team.length>=6){msg.textContent='A equipe já tem seis Pokémon. Tire um antes de adicionar outro.';return;}ctx.update({team:[...get().team,name]});msg.textContent=name+' adicionado.';};
  for(const [id,fn] of [['item-query',renderItems],['move-query',renderMoves],['service-query',renderServices]])host.querySelector('#'+id).addEventListener('input',e=>fn(e.target.value));
  host.querySelectorAll('.guide-tool').forEach(panel=>panel.addEventListener('toggle',()=>{if(panel.open)dashboard();}));
  dashboard();renderItems('');renderMoves('');
 }
 return {mount,refresh:dashboard,renderArea,remaining,returns,evolution,ancestors,diagnose,itemSearch,routes,chapterIndex};
}
root.createAdventureGuide=createAdventureGuide;if(typeof module!=='undefined')module.exports={createAdventureGuide};
})(typeof window!=='undefined'?window:globalThis);
