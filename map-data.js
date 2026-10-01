// Coordinates follow the existing stylized BW map. Side areas have their own markers.
const UnovaMap = (() => {
  const coordinates = {
    nu:[1550,1018],r1:[1549,948],acc:[1550,883],r2:[1533,819],str:[1521,750],dream:[1598,749],r3:[1436,750],well:[1439,699],nac:[1352,750],pin:[1294,812],sky:[1135,767],cas:[878,832],r4:[877,685],des:[766,651],rel:[776,613],nim:[878,570],r5:[689,568],draw:[625,568],dri:[489,568],cold:[492,649],r6:[367,489],charge:[275,492],mis:[259,410],mc:[417,442],r7:[365,328],ct:[365,256],tw:[433,287],ici:[488,246],moor:[593,183],tube:[702,246],dt:[435,157],r8:[593,246],r9:[787,246],ope:[878,246],r10:[980,166],vr:[1085,116],league:[1134,57],castle:[1192,86],r11:[1027,246],vb:[1112,246],r12:[1188,246],lac:[1268,246],und:[1498,410],bay:[1618,410],ruins:[1618,484],r13:[1386,327],chasm:[1323,157],r14:[1377,489],ab:[1360,410],r15:[1207,570],r16:[1016,570],lost:[973,516],marv:[1115,570],r17:[1380,949],r18:[1240,1007],p2:[1130,1010],lib:[488,930],black:[1268,570],anv:[100,156],challenger:[755,274]
  };
  // These entries describe encounters across multiple places, rather than physical areas.
  const anchors = Object.freeze({torn:'r7',swords:'mc',events:'lib'});
  const onMap = area => !Object.hasOwn(anchors, area[0]);
  function nearest(areas, x, y) {
    return areas.reduce((best, area) => Math.hypot(area[3]-x,area[4]-y) < Math.hypot(best[3]-x,best[4]-y) ? area : best);
  }
  return Object.freeze({coordinates, anchors, onMap, nearest});
})();
if (typeof module !== 'undefined') module.exports = UnovaMap;
