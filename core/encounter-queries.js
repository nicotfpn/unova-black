/* Data traversal only; edition modules supply availability and uncertainty rules. */
(function(root){
  'use strict';
  function create({tables,specials,lockReason,specialLock,rateUncertain,specialNames,acceptSpecies,acquisitionLock=()=>''}){
    const forArea=id=>tables[id]||[];
    const specialsForArea=id=>specials[id]||[];
    const isAvailable=area=>forArea(area[0]).some(t=>!lockReason(area,t))||specialsForArea(area[0]).some(entry=>!specialLock(area,entry));
    function availableNames(area){
      const wild=forArea(area[0]).filter(t=>!lockReason(area,t)).flatMap(t=>t.pokemon.map(row=>row[0]));
      const special=specialsForArea(area[0]).filter(entry=>!specialLock(area,entry)).flatMap(specialNames);
      return [...new Set([...wild,...special])].filter(acceptSpecies);
    }
    // Traverse the story order; a locked earlier encounter must not hide a
    // later, currently usable acquisition route for the same species.
    function firstAvailable(areas){
      const first=new Map();
      for(const area of areas){
        for(const table of forArea(area[0]))if(!lockReason(area,table))for(const [name] of table.pokemon){
          if(acceptSpecies(name)&&!first.has(name))first.set(name,{area,table});
        }
        for(const entry of specialsForArea(area[0]))for(const name of specialNames(entry)){
          if(acceptSpecies(name)&&!first.has(name)&&!specialLock(area,entry,name)&&!acquisitionLock(area,entry,name))first.set(name,{area,entry});
        }
      }
      return first;
    }
    function forSpecies(areas,species){
      const options=areas.flatMap(area=>forArea(area[0]).flatMap(table=>table.pokemon.filter(row=>row[0]===species).map(([name,rate,level])=>({area,table,rate,level,lock:lockReason(area,table)}))));
      const specialOptions=areas.flatMap(area=>specialsForArea(area[0]).filter(entry=>entry[0].split(' / ').includes(species)).map(entry=>({area,entry,lock:specialLock(area,entry,species)})));
      options.sort((a,b)=>Number(!!a.lock)-Number(!!b.lock)||Number(rateUncertain(a.area[0],a.table.method))-Number(rateUncertain(b.area[0],b.table.method))||b.rate-a.rate);
      return {options,specialOptions};
    }
    return Object.freeze({forArea,specialsForArea,isAvailable,availableNames,firstAvailable,forSpecies,lockReason,specialLock,rateUncertain});
  }
  root.createEncounterQueries=create;
  if(typeof module!=='undefined')module.exports={createEncounterQueries:create};
})(typeof window==='undefined'?globalThis:window);
