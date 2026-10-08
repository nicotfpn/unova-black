/* Compact area inventory. Machine progress is shared between acquisition locations. */
(function(root){
  'use strict';
  const methodLabels={ground:'No chão',hidden:'Item escondido',gift:'Recebido de um personagem',shop:'À venda',bp:'Compra com Battle Points (BP)',event:'Distribuição antiga',phenomenon:'Poeira ou sombra no cenário'};
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function create(tables){
    const createQueries=root.createItemQueries||(typeof module!=='undefined'?require('./core/item-queries.js').createItemQueries:null);
    const queries=typeof tables.forArea==='function'?tables:createQueries(tables);
    const {validIds,forArea,matches,normalizeCollected,counts}=queries;
    function render(area,collected=[],query='',filter='all',open=false){
      const rows=forArea(area),count=counts(area,collected),found=queries.search(area,query);
      if(!rows.length)return `<details class="area-items"><summary><span><b>Itens, TMs e HMs</b><small>Sem itens cadastrados para este local</small></span><span aria-hidden="true">+</span></summary><p class="items-note">Consulte a fonte do local para conferir lojas e outros serviços.</p></details>`;
      const matchQuery=query.trim()&&found.length;
      const showing=(matchQuery?found:rows).filter(r=>filter==='all'||filter==='machines'&&r.kind!=='item'||filter==='other'&&r.kind==='item');
      const rowHTML=row=>`<article class="item-row${collected.includes(row.id)?' obtained':''}${row.unavailable?' unavailable':''}"><div class="item-row-top"><button type="button" class="item-check" data-item-id="${esc(row.id)}" aria-pressed="${collected.includes(row.id)}" aria-label="${collected.includes(row.id)?'Desmarcar':'Marcar como obtido'} ${esc(row.name)}" ${row.unavailable?'disabled':''}>${row.unavailable?'—':collected.includes(row.id)?'✓':'+'}</button><div><strong>${row.code?`<span class="item-code ${row.kind}">${esc(row.code)}</span> ${esc(row.move)}`:esc(row.name)}</strong><small>${row.unavailable?'Indisponível na partida normal':esc(methodLabels[row.method])}${row.price?' · '+esc(row.price):''}</small></div></div><p>${esc(row.where)}</p>${row.requirements?.length?`<small class="item-requirements">Você precisa de: ${esc(row.requirements.join(' · '))}</small>`:''}<a class="item-source" href="${esc(row.source)}" target="_blank" rel="noopener noreferrer" aria-label="Conferir fonte de ${esc(row.name)}">Fonte ↗</a></article>`;
      const first=showing.slice(0,8),rest=showing.slice(8);
      return `<details class="area-items" ${open||matchQuery?'open':''}><summary><span><b>Itens, TMs e HMs</b><small>${count.obtained}/${count.total} obtidos${count.machines?' · '+count.machines+' TMs/HMs':''}</small></span><span class="items-toggle" aria-hidden="true">+</span></summary><div class="items-content"><p class="items-note">Marque o que você já pegou. O progresso fica salvo neste aparelho. TMs e HMs são reutilizáveis em Black.</p><div class="item-filters" role="group" aria-label="Filtrar itens deste local">${[['all','Todos'],['machines','TMs / HMs'],['other','Outros itens']].map(([key,label])=>`<button type="button" data-item-filter="${key}" aria-pressed="${filter===key}">${label}</button>`).join('')}</div>${matchQuery?`<p class="items-query">Itens que correspondem a “${esc(query)}”</p>`:''}<div class="item-list">${first.map(rowHTML).join('')}${rest.length?`<details class="item-more"><summary>Ver mais ${rest.length} ${rest.length===1?'item':'itens'}</summary>${rest.map(rowHTML).join('')}</details>`:''}${!showing.length?'<p class="items-note">Nenhum item nesta categoria.</p>':''}</div></div></details>`;
    }
    return Object.freeze({forArea,matches,counts,normalizeCollected,render,validIds});
  }
  root.createItemGuide=create;
  if(typeof module!=='undefined')module.exports={createItemGuide:create};
})(typeof window!=='undefined'?window:globalThis);
