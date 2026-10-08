/* Availability and acquisition rules for Pokémon Black. */
(function(root){
  'use strict';
  root.createBlackEncounterQueries = function({tables,specials,stage,getProgress,regionalSet,extraSpecies}) {
  function lockReason(area, table={}) {
    const progress=getProgress();
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
    const progress=getProgress();
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
  const rateUncertain=(id,method)=>((id==='r11'||id==='ab')&&method==='Standard Fishing')||(id==='chasm'&&method==='Fishing Spots');
  function specialNames(entry) {
    const progress=getProgress(),monkey={Snivy:'Panpour',Tepig:'Pansage',Oshawott:'Pansear'};
    if(entry[0]==='Snivy / Tepig / Oshawott')return progress.starter?[progress.starter]:[];
    if(entry[0]==='Pansage / Pansear / Panpour')return monkey[progress.starter]?[monkey[progress.starter]]:[];
    if(entry[0]==='Tirtouga / Archen')return progress.fossil?[progress.fossil]:[];
    return entry[0].split(' / ');
  }
  function acquisitionLock(area,entry){
    const p=getProgress();
    // "Show events" is a browsing preference, not proof of the required
    // distributed Pokémon or event item. Keep these in the full catalog.
    if(/Evento|Distribuição/.test(entry[1]))return 'Evento com requisito próprio';
    if(entry[0]==='Petilil'&&entry[1]==='Troca interna de Black'&&!p.caught?.includes('Cottonee'))return 'Tenha Cottonee para oferecer';
    return '';
  }
  return root.createEncounterQueries({tables,specials,acquisitionLock,lockReason,specialLock,rateUncertain,specialNames,
    acceptSpecies:name=>regionalSet.has(name)||extraSpecies.includes(name)});
  };
})(typeof window==='undefined'?globalThis:window);
