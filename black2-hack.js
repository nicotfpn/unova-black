/* Apply explicit edition deltas before rendering; original data never masquerades as verified hack data. */
(function(root){
function applyHack(data,hack,chapters,extra){
 const evo=(from,to,condition,item=null,replace=false)=>{if(replace)data.evolutions=data.evolutions.filter(e=>!(e.fromSpecies===from&&e.toSpecies===to));data.evolutions.unshift({fromSpecies:from,toSpecies:to,condition,item,hack:true});};
 for(const [a,b] of [['Machoke','Machamp'],['Graveler','Golem'],['Kadabra','Alakazam'],['Haunter','Gengar']])evo(a,b,'Suba um nível a partir do Nv. 40.');
 for(const [a,b,item] of [['Poliwhirl','Politoed',"King’s Rock"],['Slowpoke','Slowking',"King’s Rock"],['Onix','Steelix','Metal Coat'],['Scyther','Scizor','Metal Coat'],['Seadra','Kingdra','Dragon Scale'],['Porygon','Porygon2','Upgrade'],['Porygon2','Porygon-Z','Dubious Disc'],['Electabuzz','Electivire','Electirizer'],['Magmar','Magmortar','Magmarizer'],['Rhydon','Rhyperior','Protector'],['Feebas','Milotic','Prism Scale'],['Dusclops','Dusknoir','Reaper Cloth'],['Clamperl','Huntail','Deep Sea Tooth'],['Clamperl','Gorebyss','Deep Sea Scale']])evo(a,b,'Suba um nível segurando '+item+'.',item);
 evo('Eevee','Leafeon','Use Leaf Stone. O método por local foi substituído nesta edição.','Leaf Stone',true);evo('Eevee','Glaceon','Use Dawn Stone. Há uma Dawn Stone adicionada na Route 16.','Dawn Stone',true);
 evo('Magneton','Magnezone','Use Thunder Stone. Subir de nível em Chargestone Cave também funciona.','Thunder Stone');evo('Nosepass','Probopass','Use Thunder Stone. Subir de nível em Chargestone Cave também funciona.','Thunder Stone');
 evo('Boldore','Gigalith','Suba um nível a partir do Nv. 42.');evo('Gurdurr','Conkeldurr','Suba um nível a partir do Nv. 45.');evo('Karrablast','Escavalier','Suba de nível com amizade alta.');evo('Shelmet','Accelgor','Suba de nível com amizade alta.');
 for(const [name,list] of Object.entries(hack.moves)){
  const mon=data.pokemon[name];if(!mon)continue;
  const norm=s=>s.toLowerCase().replace(/[^a-z]/g,'');
  const changed=new Set(list.map(x=>norm(x[0])));
  mon.moves=mon.moves.filter(x=>x[1]!==1||!changed.has(norm(x[0])));
  for(const [move,level]of list)mon.moves.push([move,1,level,'hack']);
 }
 const removed={'Route 13':['Golduck'],'Guidance Chamber':['Axew'],'Twist Mountain':['Boldore','Gurdurr','Woobat'],'Clay Tunnel':['Boldore'],'Wellspring Cave':['Boldore','Woobat'],'Dreamyard':['Watchog'],'Route 18':['Watchog'],'Route 3':['Purrloin'],'Pinwheel Forest':['Cottonee','Petilil','Whimsicott','Lilligant']};
 const replacements={Mienfoo:'Mienshao',Pawniard:'Bisharp',Rufflet:'Braviary',Vullaby:'Mandibuzz'};
 const additions=[...hack.additions,...hack.opposite];const changedAreas=new Set(additions.map(x=>x.area));
 data.encounters=data.encounters.filter(e=>!removed[e.area]?.includes(e.name)).filter(e=>!hack.additions.some(h=>h.name===e.name&&h.area===e.area&&h.method===e.method));
 for(const e of data.encounters){e.origin='base';if(replacements[e.name]&&!['gift','gift-egg','npc-trade'].includes(e.method)){e.name=replacements[e.name];e.chance=null;e.min=null;e.max=null;e.origin='replacement';}if(changedAreas.has(e.area)&&!['static','gift','gift-egg','npc-trade'].includes(e.method))e.chance=null;
  e.conditions=e.conditions.filter(c=>!['item-ice-key','item-iron-key'].includes(c));
 }
 for(const e of additions){if(removed[e.area]?.includes(e.name))continue;data.encounters.push({...e,name:replacements[e.name]||e.name});}
 extra.items.push(['Dawn Stone','Route 16','Adicionada pela hack. Use em Eevee para obter Glaceon; o resumo não informa a posição exata do item.',6],['Cover Fossil','Nacrene City','Segundo vendedor: 7.000 ₽ na hack. Reviva o fóssil no museu.',20],['Plume Fossil','Nacrene City','Segundo vendedor: 7.000 ₽ na hack. Reviva o fóssil no museu.',20],['Electirizer','Virbank Complex','Elekid selvagem tem 5% de chance de carregar. Confira o item após capturar. Na hack, Electabuzz evolui ao subir um nível segurando-o.',3],['Magmarizer','Virbank Complex','Magby selvagem tem 5% de chance de carregar. Confira o item após capturar. Na hack, Magmar evolui ao subir um nível segurando-o.',3]);
 const c=chapters;
 c[8].optional=c[8].optional.replace('Mistralton Cave oferece Axew;','Axew foi removido da Guidance Chamber; confira os demais andares de Mistralton Cave.');
 c[16].steps[2].text='Nesta hack, as chaves de área estão liberadas desde o início. Além disso, capturar Registeel em Black 2 libera a câmara de Regice. Confira o Key System no Unova Link. Para Regigigas, mantenha os três Regis na equipe.';
 c[16].lost='Confira a câmara selecionada no Key System e a captura do outro Regi; esta hack permite completar a dupla sem outra versão.';
 c[17].optional='Na hack, o Reveal Glass não exige que Landorus-Therian venha do Dream Radar. No pós-jogo, leve essa forma ao santuário. O trio Therian foi adicionado à grama que se mexe do local.';
 c[19].steps[4].text='O encontro fixo de Latios continua no Dreamyard de Black 2. A hack também adiciona Latias às ondulações de Surf em Nature Preserve. Prepare-se antes de concluir a perseguição nas ruínas.';
 c[19].lost='Latios está no encontro fixo do Dreamyard. Para Latias nesta hack, procure as ondulações de Surf em Nature Preserve no pós-jogo.';
 for(const l of extra.legends){if(l[0]==='Regice')l[3]='Nesta hack, capturar Registeel em Black 2 libera a câmara de Regice; as chaves de área também começam liberadas. Confira a seleção no Unova Link.';if(l[0]==='Latios')l[3]='Encontro fixo no Dreamyard de Black 2. A hack também permite capturar Latias em Nature Preserve.';}
 data.edition=hack.id;return data;
}
root.applyBlack2Hack=applyHack;
if(typeof module!=='undefined')module.exports=applyHack;
})(typeof window==='undefined'?globalThis:window);
