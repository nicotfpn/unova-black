/* Item occurrences belong to the supplied edition; this module never renders or saves. */
(function(root){
  'use strict';
  const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\b(tm|hm)\s*0*(\d+)/g,'$1$2');
  function create(tables){
    const validIds=new Set(Object.values(tables).flat().filter(row=>!row.unavailable).map(row=>row.id));
    const legacyIds=new Map(Object.values(tables).flatMap(rows=>rows.flatMap(row=>(row.legacyIds||[]).map(id=>[id,row.id]))));
    const forArea=id=>tables[id]||[];
    const matches=(row,query)=>norm([row.name,row.code,row.move,...(row.aliases||[])].join(' ')).includes(norm(query).trim());
    const normalizeCollected=value=>Array.isArray(value)?[...new Set(value.map(id=>legacyIds.get(id)||id).filter(id=>validIds.has(id)))]:[];
    function counts(area,collected=[]){const rows=forArea(area).filter(r=>!r.unavailable);return {total:rows.length,obtained:rows.filter(r=>collected.includes(r.id)).length,machines:rows.filter(r=>r.kind!=='item').length};}
    const search=(area,query)=>forArea(area).filter(row=>matches(row,query));
    return Object.freeze({forArea,matches,counts,normalizeCollected,search,validIds});
  }
  root.createItemQueries=create;
  if(typeof module!=='undefined')module.exports={createItemQueries:create};
})(typeof window==='undefined'?globalThis:window);
