/* Platinum conditions stay independent of Gen V: no automatic inference of daily selections. */
(function(root){
 'use strict';
 const labels={'time-morning':'Manhã','time-day':'Dia','time-night':'Noite','old-rod':'Old Rod','good-rod':'Good Rod','super-rod':'Super Rod',surf:'Surf',
  'radar-on':'Poké Radar ativado','swarm-yes':'Enxame desta rota no dia','story-progress-national-dex':'Pokédex Nacional','story-progress-before-national-dex':'Antes da Pokédex Nacional',
  'backlot-mentioned':'Espécie anunciada por Backlot hoje ou ontem','story-progress-oak-eterna-city':'Conversa com Oak em Eterna',
  'story-progress-beat-galactic-coronet':'Missão de Spear Pillar concluída','story-progress-cure-eldritch-nightmares':'Missão da Lunar Wing concluída',
  'other-talk-to-cynthias-grandmother':'Conversa com a avó de Cynthia sobre as orbes','story-progress-hall-of-fame':'Hall of Fame',
  'story-progress-defeat-jupiter':'Jupiter derrotada em Eterna','story-progress-beat-team-galactic-iron-island':'Grunts derrotados com Riley',
  'other-regirock-regice-registeel-in-party':'Regirock, Regice e Registeel no time','story-progress-defeat-mars':'Mars derrotada em Valley Windworks',
  'item-odd-keystone':'Odd Keystone inserida na Hallowed Tower','other-talked-to-32-people-underground':'Conversar com 32 pessoas no Underground',
  'other-giratina-not-caught-in-distortion-world':'Giratina ainda não capturado em Distortion World','weekday-friday':'Sexta-feira; Drifloon após libertar Windworks',
  'story-heatran-ready':'Missão de Stark Mountain e conversa com Buck e seu avô concluídas','item-member-card':'Member Card de distribuição antiga',
  'item-oaks-letter':'Oak’s Letter de distribuição antiga','item-azure-flute-unreleased':'Azure Flute não distribuída oficialmente para Platinum',
  'event-regigigas':'Regigigas de evento no time'};
 function conditionLabel(id){
  if(labels[id])return labels[id];
  if(id.startsWith('slot2-'))return 'Cartucho GBA '+({ruby:'Ruby',sapphire:'Sapphire',emerald:'Emerald',firered:'FireRed',leafgreen:'LeafGreen'})[id.slice(6)]+' no slot 2 (DS/DS Lite)';
  if(id.startsWith('honey-tree-group-'))return 'Honey · grupo '+id.slice(-1).toUpperCase()+' da árvore; chance dentro desse grupo';
  if(id.startsWith('great-marsh-daily-'))return 'Espécie escolhida para os encontros diários deste setor do Great Marsh';
  if(id.startsWith('trade-'))return 'Troca por '+id.slice(6).replace(/^./,c=>c.toUpperCase());
  if(id.startsWith('item-'))return id.slice(5).split('-').map(w=>w[0].toUpperCase()+w.slice(1)).join(' ');
  return id;
 }
 root.PlatinumConditions={label:conditionLabel};
 root.createPlatinumEncounterQueries=function({tables,getProgress}){
  function lockReason(area,table){
   const p=getProgress(),req=table.requires||{};
   if(req.league&&!p.league)return 'Hall of Fame';if(req.national&&!p.nationalDex)return 'Pokédex Nacional';
   if(req.events&&!p.events)return 'Evento antigo ou transferência especial; confira os requisitos';
   if(table.time!=='any'&&p.time!=='all'&&p.time!==table.time)return 'Horário: '+conditionLabel(table.time);
   if(['surf','old-rod','good-rod','super-rod'].includes(table.method)&&!p.resources.includes(table.method))return labels[table.method];
   if(table.method==='surf'&&p.badges<5)return 'Fen Badge para usar Surf';
   if(req.rockSmash&&(!p.resources.includes('rock-smash')||p.badges<1))return 'Rock Smash e Coal Badge';
   if(table.method==='feebas-tile-fishing')return 'Quadrados especiais de Feebas e vara de pesca; posições mudam diariamente';
   for(const c of table.conditions||[]){
    if(c.startsWith('time-')||['slot2-none','radar-off','swarm-no','backlot-not-mentioned'].includes(c))continue;
    if(c==='radar-on'&&p.radar)continue;if(c==='swarm-yes'&&p.swarmArea===area[0])continue;
    if(c==='story-progress-national-dex'&&p.nationalDex)continue;if(c==='story-progress-hall-of-fame'&&p.league)continue;
    if(c==='story-progress-before-national-dex'&&!p.nationalDex)continue;
    if(c==='story-progress-beat-galactic-coronet'&&p.galactic)continue;
    if(c.startsWith('slot2-')&&p.gba===c)continue;
    // Daily, Honey-group, trade, quest, fossil and party requirements remain explicit.
    return conditionLabel(c);
   }
   if(table.method==='gift'&&area[0]==='r201'&&p.starter!==table.pokemon[0][0])return 'Inicial escolhido: '+table.pokemon[0][0];
   return '';
  }
  return root.createEncounterQueries({tables,specials:{},lockReason,specialLock:()=>'',rateUncertain:()=>false,specialNames:()=>[],acceptSpecies:()=>true});
 };
})(window);
