(function(root){
 'use strict';
 root.GameRegistry.register('pokemon-platinum',()=>{
  const data=root.PlatinumData;
  return {areas:data.areas,map:{paths:data.paths,image:'packages/platinum/map.svg'},encounters:data.encounters,items:data.items,chapters:data.chapters,dex:data.dex,places:data.places,
   queries:{items:root.createItemQueries(data.items),createEncounters:options=>root.createPlatinumEncounterQueries({...options,tables:data.encounters})}};
 });
})(window);
