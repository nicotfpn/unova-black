"""Extract Platinum item occurrences, battle rosters and map blocks from a pinned pret checkout.
Usage: python scripts/build-platinum-world.py /path/to/pokeplatinum
Facts only: no game text, artwork or executable code is copied into the package.
"""
from pathlib import Path
import json,re,sys,subprocess,hashlib
root=Path(__file__).resolve().parent.parent;pkg=root/'packages/platinum';src=Path(sys.argv[1])
revision='c248fb3f8cc9934ded800e489567c5c0eeee92eb'
assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=src,text=True).strip()==revision
used={}
def read(path):
 p=src/path;s=p.read_text();used[path]=hashlib.sha256(p.read_bytes()).hexdigest();return s
base=f'https://github.com/pret/pokeplatinum/blob/{revision}/'
world=json.loads(read('res/town_map/town_map_data.json'))
headers=read('include/data/map_headers.h')
active=set(re.findall(r'\.eventsArchiveID = (events_\w+)',headers))
visible=read('res/field/scripts/scripts_visible_items.s');entries=re.findall(r'    ScriptEntry (\w+)',visible)
visible_items={7000+i:(label,re.search(re.escape(label)+r':\s*SetVar VAR_0x8008, (ITEM_\w+)',visible).group(1)) for i,label in enumerate(entries) if re.search(re.escape(label)+r':\s*SetVar VAR_0x8008, (ITEM_\w+)',visible)}
hidden_entries=re.findall(r'HIDDEN_ITEM_ENTRY\((ITEM_\w+),\s*(\d+),\s*\d+,\s*(FLAG_\w+)\)',read('include/data/field/hidden_items.h'))
hidden_items={8000+i:(item,int(qty),flag) for i,(item,qty,flag) in enumerate(hidden_entries)}
def name(token):return token.removeprefix('ITEM_').removeprefix('SPECIES_').removeprefix('MOVE_').replace('_',' ').title()
cache={}
def item_data(token):
 if token not in cache:
  path='res/items/data/'+token.removeprefix('ITEM_').lower()+'.json'
  if (src/path).exists():
   d=json.loads(read(path));cache[token]={'name':d['name'],'price':d['price'],'move':name(d['teachesMove']) if d.get('teachesMove') else None}
  else:cache[token]={'name':name(token),'price':None,'move':None}
 return cache[token]
items=[]
for p in sorted((src/'res/field/events').glob('*.json')):
 if p.stem not in active or any(w in p.stem for w in ['unused','unk_','dummy']):continue
 rel=str(p.relative_to(src));d=json.loads(read(rel));section=p.stem.removeprefix('events_')
 for o in d['object_events']:
  script=o['script']
  if isinstance(script,int) and script in visible_items:
   label,token=visible_items[script];items.append({'id':'pt:ground:'+o['hidden_flag'],'token':token,**item_data(token),'method':'ground','section':section,'coordinates':{k:o[k] for k in ['x','z','y']},'source':base+rel})
 for o in d['bg_events']:
  script=o['script']
  if o['type']==2 and isinstance(script,int) and script in hidden_items:
   token,qty,flag=hidden_items[script];items.append({'id':'pt:hidden:'+flag,'token':token,**item_data(token),'method':'hidden','section':section,'quantity':qty,'coordinates':{k:o[k] for k in ['x','z','y']},'source':base+rel})
# Direct gifts only: a concrete item assignment and a give-item command in the same basic block.
# Quest conditions are intentionally not inferred from control flow.
for p in sorted((src/'res/field/scripts').glob('scripts_*.s')):
 if any(v in p.stem for v in ['init_','unused','unk_','common','items','empty','_dp_']):continue
 rel=str(p.relative_to(src));s=read(rel);section=p.stem.removeprefix('scripts_')
 for m in re.finditer(r'^(\w+):\n(.*?)(?=^\w+:|\Z)',s,re.M|re.S):
  label,block=m.groups()
  item=re.search(r'SetVar VAR_0x8004, (ITEM_\w+)',block)
  if item and re.search(r'Common_GiveItem(?:Quantity|Single)',block):
   token=item.group(1);items.append({'id':'pt:gift:'+section+':'+label,'token':token,**item_data(token),'method':'gift','section':section,'source':base+rel})
prizes=read('src/scrcmd_game_corner_prize.c')
for token,cost in re.findall(r'\{ (ITEM_\w+), (\d+) \}',prizes):items.append({'id':'pt:shop:game-corner:'+token,'token':token,**item_data(token),'method':'shop','section':'game_corner','coins':int(cost),'source':base+'src/scrcmd_game_corner_prize.c'})
mart=read('include/data/mart_items.h');stocks={m.group(1):re.findall(r'ITEM_\w+',m.group(2)) for m in re.finditer(r'const u16 (\w+)\[\] = \{(.*?)\};',mart,re.S)}
for stock,tokens in stocks.items():
 if any(x in stock for x in ['Veilstone','EternaHerb','Frontier']):
  for token in tokens:items.append({'id':'pt:shop:'+stock+':'+token,'token':token,**item_data(token),'method':'bp' if 'Frontier' in stock else 'shop','section':'battle_frontier' if 'Frontier' in stock else 'eterna_city_herb_shop' if 'EternaHerb' in stock else 'veilstone_store','stock':stock,'source':base+'include/data/mart_items.h'})
# Game Corner TMs are prizes, not gifts from the prize-giving script.
for p in sorted((src/'res/field/scripts').glob('*game_corner*prize*.s')):
 rel=str(p.relative_to(src));s=read(rel)
 for token in sorted(set(re.findall(r'ITEM_TM\d+',s))):items.append({'id':'pt:shop:game-corner:'+token,'token':token,**item_data(token),'method':'shop','section':'veilstone_game_corner','source':base+rel})
battles=[]
for p in sorted((src/'res/trainers/data').glob('*.json')):
 if p.stem.startswith(('leader_','elite_four_','champion_','galactic_boss_','commander_')):
  rel=str(p.relative_to(src));d=json.loads(read(rel));battles.append({'id':p.stem,'name':d['name'],'rematch':'rematch' in p.stem,'party':[{'species':name(x['species']),'level':x['level'],'moves':[name(v) for v in x.get('moves',[])],'item':None if not x.get('item') or x['item']=='ITEM_NONE' else item_data(x['item'])['name']} for x in d['party']],'source':base+rel})
# Deduplicate the same pickup flag referenced by alternative map states.
unique={}
for item in items:
 if item['id'] in unique:
  assert unique[item['id']]['token']==item['token']
 else:unique[item['id']]=item
for n in range(1,93):item_data(f'ITEM_TM{n:02}')
for n in range(1,9):item_data(f'ITEM_HM{n:02}')
out={'itemDefinitions':cache,'revision':revision,'mapBlocks':[{k:v for k,v in b.items() if k in ['x','z','area','landmark','hidden_location']} for b in world['blocks']],'items':list(unique.values()),'battles':battles,'audit':{'sourceHashes':used}}
(pkg/'world.json').write_text(json.dumps(out,ensure_ascii=False,separators=(',',':'))+'\n')
print(len(unique),'item occurrences,',len(battles),'battle rosters,',len(world['blocks']),'map blocks')
