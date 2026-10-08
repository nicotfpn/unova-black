"""Original SVG region map, with road/city blocks positioned from Platinum town-map facts.
No game artwork is embedded. Node anchors come from editorial.json.
"""
from pathlib import Path
import json,html
root=Path(__file__).resolve().parent.parent;p=root/'packages/platinum';w=json.loads((p/'world.json').read_text())
parts=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1712 1500">','<rect width="1712" height="1500" fill="#b9dadd"/>',
'<path d="M90 695 215 630 350 520 490 420 645 375 850 555 1170 720 1470 640 1580 875 1470 1110 1230 1210 1030 1435 420 1435 220 1340 110 1105Z" fill="#d4d5af" stroke="#8cab9f" stroke-width="10"/>',
'<path d="M1050 345 1145 255 1320 285 1485 400 1530 690 1280 755 1080 640Z" fill="#d5cd9b" stroke="#8cab9f" stroke-width="9"/>',
'<path d="M420 635 455 360 550 285 690 315 750 600 630 760Z" fill="#eff1e8" stroke="#a6bcaf" stroke-width="6"/>',
'<path d="M638 590 690 660 658 745 696 830 639 970 674 1100 642 1210 602 1115 619 980 577 860 615 720Z" fill="#a4b19e" stroke="#788e86" stroke-width="5"/>',
'<path d="m620 720 24-75 20 76m-53 220 26-89 17 67m-15 245 27-78 22 45" fill="none" stroke="#edf0e5" stroke-width="15"/>',
'<g fill="#9ebba0" opacity=".6"><path d="M330 740h155v100H330Z"/><path d="M850 820h260v190H850Z"/><path d="M710 1100h150v115H710Z"/></g>',
'<g fill="#95c4ca" stroke="#6f999e" stroke-width="5"><ellipse cx="164" cy="1185" rx="70" ry="45"/><ellipse cx="1202" cy="1114" rx="48" ry="40"/><ellipse cx="578" cy="361" rx="52" ry="40"/><ellipse cx="1300" cy="1035" rx="43" ry="30"/></g>']
for x,y in [(1,8),(4,8),(3,15)]:
 px=80+x*52;py=60+y*45;parts.append(f'<ellipse cx="{px}" cy="{py}" rx="50" ry="37" fill="#d4d5af" stroke="#8cab9f" stroke-width="7"/>')
# Draw facts on the same grid as the game town map. Water routes are dashed.
for b in w['mapBlocks']:
 area=b.get('area') or '';x=80+b['x']*52;y=60+b['z']*45
 if area.startswith('route_') or area=='seabreak_path':
  water=area in ['route_219','route_220','route_223','route_226','route_230'];color='#8eb7c6' if water else '#efddb0'
  parts.append(f'<rect x="{x-25}" y="{y-22}" width="50" height="44" rx="10" fill="{color}" stroke="#879d90" stroke-width="2"/>')
 elif area.endswith(('_town','_city')) or area in ['fight_area','survival_area','resort_area','pokemon_league','battle_frontier']:
  parts.append(f'<rect x="{x-23}" y="{y-20}" width="46" height="40" rx="7" fill="#faf1d2" stroke="#afad8b" stroke-width="3"/>')
parts+=['<g fill="#587079" font-family="system-ui,sans-serif"><text x="45" y="65" font-size="31" font-weight="850">SINNOH · PLATINUM</text><text x="1130" y="240" font-size="24">BATTLE ZONE</text><text x="45" y="1475" font-size="20">Mapa regional original · setores e pisos na ficha de cada local</text></g></svg>']
(p/'map.svg').write_text('\n'.join(parts)+'\n');print('Full Sinnoh SVG:',len(w['mapBlocks']),'verified map cells')
