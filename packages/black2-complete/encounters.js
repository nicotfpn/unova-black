/* Availability rules extracted unchanged from the existing edition. */
(function(root){
  'use strict';
  root.createBlack2CompleteEncounterQueries = function({tables,specials,stage,getProgress,regionalSet,extraSpecies,conditionLabel}) {
  function lockReason(area,table={}) {
    const progress=getProgress();
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
    if(conditions.length)return conditions.map(conditionLabel).join(' · ');
    return '';
  }
  function specialLock(area,entry,species='') {
    const progress=getProgress();
    const base=lockReason(area,{requires:{league:entry[3]?.post},conditions:entry[3]?.conditions||[]});
    if(base)return base;
    if(entry[1]==='Presente'&&['Snivy','Tepig','Oshawott'].includes(entry[0])&&progress.starter&&entry[0]!==progress.starter)return 'Você escolheu outro inicial';
    if(entry[1]==='Troca com personagem'&&!progress.trades)return 'Inclua trocas com personagens em Meu progresso';
    return '';
  }
  const rateUncertain=()=>false;
  function specialNames(entry) {
    const progress=getProgress(),monkey={Snivy:'Panpour',Tepig:'Pansage',Oshawott:'Pansear'};
    if(entry[0]==='Snivy / Tepig / Oshawott')return progress.starter?[progress.starter]:[];
    if(entry[0]==='Pansage / Pansear / Panpour')return monkey[progress.starter]?[monkey[progress.starter]]:[];
    if(entry[0]==='Tirtouga / Archen')return progress.fossil?[progress.fossil]:[];
    return entry[0].split(' / ');
  }
  const acquisitionLock=(area,entry)=>entry[1]==='Presente'&&['Snivy','Tepig','Oshawott'].includes(entry[0])&&getProgress().starter!==entry[0]?'Confirme o inicial escolhido':'';
  return root.createEncounterQueries({tables,specials,acquisitionLock,lockReason,specialLock,rateUncertain,specialNames,
    acceptSpecies:name=>regionalSet.has(name)||extraSpecies.includes(name)});
  };
})(typeof window==='undefined'?globalThis:window);
