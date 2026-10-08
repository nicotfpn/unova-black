/* Platinum ordinary encounters only: time and equipment never inherit Gen V rules. */
(function(root){
 'use strict';
 root.createPlatinumEncounterQueries=function({tables,getProgress}){
  const labels={'time-morning':'Manhã','time-day':'Dia','time-night':'Noite','old-rod':'Old Rod','good-rod':'Good Rod','super-rod':'Super Rod',surf:'Surf'};
  function lockReason(area,table){
   const p=getProgress();
   if(table.time!=='any'&&p.time!=='all'&&p.time!==table.time)return 'Horário: '+labels[table.time];
   if(table.method!=='walk'&&!p.resources.includes(table.method))return labels[table.method];
   if(table.method==='surf'&&p.badges<5)return 'Fen Badge para usar Surf';
   if(table.requires?.rockSmash&&(!p.resources.includes('rock-smash')||p.badges<1))return 'Rock Smash e Coal Badge';
   return '';
  }
  return root.createEncounterQueries({tables,specials:{},lockReason,specialLock:()=>'',rateUncertain:()=>false,specialNames:()=>[],acceptSpecies:()=>true});
 };
})(window);
