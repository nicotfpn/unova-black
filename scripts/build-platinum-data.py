"""Build the complete Platinum catalog from fixed PokeAPI CSVs, extracted world facts and editorial inputs.
Usage: python scripts/build-platinum-data.py /path/to/csv (or --download)
"""
import csv,hashlib,json,sys,urllib.request,tempfile,re
from pathlib import Path
from collections import defaultdict
root=Path(__file__).resolve().parent.parent;package=root/'packages/platinum'
lock=json.loads((package/'sources.json').read_text())
if sys.argv[1:]==['--download']:
 folder=Path(tempfile.mkdtemp(prefix='platinum-csv-'))
 from concurrent.futures import ThreadPoolExecutor
 def download(name):
  url=f"https://raw.githubusercontent.com/PokeAPI/pokeapi/{lock['revision']}/data/v2/csv/{name}.csv"
  (folder/(name+'.csv')).write_bytes(urllib.request.urlopen(url,timeout=60).read())
 with ThreadPoolExecutor(max_workers=4) as pool:list(pool.map(download,lock['csv']))
else:folder=Path(sys.argv[1])
def rows(name):
 p=folder/(name+'.csv')
 if hashlib.sha256(p.read_bytes()).hexdigest()!=lock['csv'][name]:raise ValueError('Source checksum mismatch: '+name)
 return list(csv.DictReader(p.open(encoding='utf-8')))
versions={r['id']:r for r in rows('versions')}
assert versions['14']['identifier']=='platinum' and versions['14']['version_group_id']=='9'
assert any(r['id']=='9' and r['generation_id']=='4' for r in rows('version_groups'))
assert any(r['id']=='6' and r['identifier']=='extended-sinnoh' for r in rows('pokedexes'))
names={r['pokemon_species_id']:r['name'] for r in rows('pokemon_species_names') if r['local_language_id']=='9'}
pokemon={r['id']:r['species_id'] for r in rows('pokemon')}
dex=sorted([[int(r['pokedex_number']),int(r['species_id']),names[r['species_id']]] for r in rows('pokemon_dex_numbers') if r['pokedex_id']=='6']);assert len(dex)==210
national=[[i,i,names[str(i)]] for i in range(1,494)]
slots={r['id']:r for r in rows('encounter_slots')};conditions={r['id']:r for r in rows('encounter_condition_values')}
condition_map=defaultdict(list)
for r in rows('encounter_condition_value_map'):condition_map[r['encounter_id']].append(conditions[r['encounter_condition_value_id']])
editorial=json.loads((package/'editorial.json').read_text());world=json.loads((package/'world.json').read_text())
area_map={str(s['sourceArea']):(a['id'],s) for a in editorial['areas'] for s in a.get('sections',[])}
methods={r['id']:r['identifier'] for r in rows('encounter_methods')};allrows=[r for r in rows('encounters') if r['version_id']=='14']
assert set(r['location_area_id'] for r in allrows)<=set(area_map)
groups=defaultdict(list);special_groups=defaultdict(list)
for row in allrows:
 area,section=area_map[row['location_area_id']];slot=slots[row['encounter_slot_id']];method=methods[slot['encounter_method_id']];cs=condition_map[row['id']]
 nondefault=[c for c in cs if c['encounter_condition_id']!='2' and c['is_default']!='1']
 ordinary=method in ['walk','surf','old-rod','good-rod','super-rod'] and not nondefault
 if ordinary:
  times=[c['identifier'] for c in cs if c['encounter_condition_id']=='2'] or ['time-morning','time-day','time-night']
  for time in times if method=='walk' else ['any']:groups[(area,section['name'],method,time)].append((row,slot))
 else:
  # Separate alternative species in shared daily slots. Their rarity is conditional,
  # never the probability of that daily species being selected in the first place.
  key=(area,section['name'],method,tuple(sorted(c['identifier'] for c in cs)),row['pokemon_id'])
  special_groups[key].append((row,slot))
def mons(entries):
 result={}
 for row,slot in entries:
  name=names[pokemon[row['pokemon_id']]];v=result.setdefault(name,[0,int(row['min_level']),int(row['max_level'])]);v[0]+=int(slot['rarity'] or 0);v[1]=min(v[1],int(row['min_level']));v[2]=max(v[2],int(row['max_level']))
 return [[n,v[0],str(v[1]) if v[1]==v[2] else f'{v[1]} - {v[2]}'] for n,v in result.items()]
def requirements(area,section,method,cs):
 req={}
 if area in ['temple','stark','roamers','fullmoon','newmoon','flower','origin'] or area.startswith('r') and area[1:].isdigit() and int(area[1:])>=224:req['league']=True
 if area=='gate' and section=='B1F':req['rockSmash']=True
 if area=='victory' and 'inside' in section:req.update(league=True,national=True)
 if 'story-progress-national-dex' in cs or 'radar-on' in cs or 'swarm-yes' in cs or area=='temple':req['national']=True
 if area in ['newmoon','flower','origin'] or method=='pokemon-ranger':req['events']=True
 return req
encounters=defaultdict(list)
for (area,section,method,time),entries in groups.items():
 seen=set()
 for row,slot in entries:assert slot['id'] not in seen,(area,section,method,time);seen.add(slot['id'])
 pokemon_rows=mons(entries);assert sum(v[1] for v in pokemon_rows)==100,(area,section,method,time,pokemon_rows)
 encounters[area].append({'method':method,'time':time,'sections':[section],'seasons':[],'conditions':[],'requires':requirements(area,section,method,[]),'percentScope':'ordinary','source':lock['encountersUrl'],'pokemon':pokemon_rows})
for (area,section,method,cs,pk),entries in special_groups.items():
 times=[c for c in cs if c.startswith('time-')];time=times[0] if times else 'any';pr=mons(entries)
 fixed=method in ['gift','gift-egg','static','npc-trade','pokemon-ranger']
 if fixed:
  for row in pr:row[1]=None
 if method=='feebas-tile-fishing':
  for row in pr:row[1]=None
 if method=='npc-trade':
  for row in pr:row[2]='Depende do Pokémon oferecido'
 req=requirements(area,section,method,cs)
 extra_conditions=list(cs)
 if area=='windworks' and method=='static':extra_conditions+=['weekday-friday']
 if area=='stark' and method=='static':extra_conditions+=['story-heatran-ready']
 if area in ['acuity','valor'] and method=='static':extra_conditions+=['story-progress-beat-galactic-coronet']
 if area=='newmoon':extra_conditions+=['item-member-card']
 if area=='flower':extra_conditions+=['item-oaks-letter']
 if area=='origin':extra_conditions+=['item-azure-flute-unreleased']
 encounters[area].append({'method':method,'time':time,'sections':[section],'seasons':[],'conditions':extra_conditions,'requires':req,'percentScope':'fixed' if fixed else 'unknown' if method=='feebas-tile-fishing' else 'conditional','source':lock['encountersUrl'],'pokemon':pr})
for row in editorial.get('extraEncounters',[]):
 row=dict(row);area=row.pop('area');row['seasons']=[];encounters[area].append(row)
# Inventory facts, linked to explicit map-area prefixes. Do not guess unidentified locations.
items=defaultdict(list);unmapped=[];seen_gifts=set();prefixes=sorted(editorial['itemPrefixes'],key=len,reverse=True)
for raw in world['items']:
 section=raw['section'];prefix=next((p for p in prefixes if section==p or section.startswith(p+'_')),None)
 if prefix is None:unmapped.append(section);continue
 area=editorial['itemPrefixes'][prefix]
 if raw['method']=='gift':
  k=(section,raw['token'])
  if k in seen_gifts:continue
  seen_gifts.add(k)
 code=raw['name'] if re.fullmatch(r'(?:TM|HM)\d+',raw['name']) else None
 where=section.replace('_',' ').replace('b1f','B1F').replace('b2f','B2F').replace('1f','1F').replace('2f','2F').replace('3f','3F').replace('4f','4F')
 if section.startswith('oreburgh_mine'):where=where.replace('B1F','1F').replace('B2F','B1F')
 label={'ground':'No chão','hidden':'Item oculto','gift':'Presente ou recompensa','shop':'Compra'}[raw['method']]
 note=' · pode depender de acontecimentos ou condições locais' if raw['method']=='gift' else ''
 row={'id':raw['id'],'name':raw['name']+((' · '+raw['move']) if code and raw['move'] else ''),'kind':'hm' if code and code.startswith('HM') else 'tm' if code else 'item','method':raw['method'],'where':label+' · '+where+(f" · {raw['coins']} moedas" if raw.get('coins') else '')+note,'requirements':[],'source':raw['source'],'section':section}
 if code:row.update(code=code,move=raw['move'])
 if raw.get('coordinates'):row['coordinates']=raw['coordinates']
 items[area].append(row)
assert not unmapped,sorted(set(unmapped))
# Keep all eleven pilot IDs and their marks; replace duplicate fact rows with the original IDs.
for area,oldrows in editorial['items'].items():
 for old in oldrows:
  name=old['name'].split(' · ')[0].replace(' ×5','')
  existing=next((r for r in items[area] if r['name'].split(' · ')[0]==name and r['method']==old['method']),None)
  if existing:
   existing['legacyIds']=[existing['id']];existing['id']=old['id'];existing['where']=old['where'];existing['requirements']=old['requirements']
  else:items[area].append(old)
for extra in editorial.get('extraItems',[]):
 area=extra['area'];token=extra['token'];definition=world['itemDefinitions'][token];code=definition['name'];items[area].append({'id':'pt:'+extra['method']+':'+area+':'+code,'name':code+' · '+definition['move'],'code':code,'move':definition['move'],'kind':'tm','method':extra['method'],'where':extra['where'],'requirements':extra['requirements'],'source':extra['source']})
assert {r['code'] for rs in items.values() for r in rs if r.get('kind')=='tm'}=={f'TM{i:02}' for i in range(1,93)}
assert {r['code'] for rs in items.values() for r in rs if r.get('kind')=='hm'}=={f'HM{i:02}' for i in range(1,9)}
areas=[[a['id'],a['name'],a['type'],a['x'],a['y']] for a in editorial['areas']]
# Canonical spelling for roster species, without generation-V type/move data.
canon={re.sub(r'[^a-z0-9]','',n.lower()):n for n in names.values()}
battles=world['battles']
battle_contexts={'spear_pillar':'Spear Pillar','stark_mountain':'Stark Mountain','team_galactic_eterna_building':'Galactic · Eterna','lake_verity':'Lake Verity','valley_windworks':'Valley Windworks','galactic_hq':'Quartel Galactic','valor_cavern':'Valor Cavern','fight_area':'Fight Area','celestic_town_ruins':'Ruínas de Celestic','distortion_world':'Distortion World'}
for battle in battles:
 battle['context']='Revanche' if battle['id'].endswith('_rematch') else next((label for suffix,label in battle_contexts.items() if battle['id'].endswith('_'+suffix)), 'Ginásio' if battle['id'].startswith('leader_') else 'Primeira Liga')
 for mon in battle['party']:mon['species']=canon.get(re.sub(r'[^a-z0-9]','',mon['species'].lower()),mon['species'])
data={'version':14,'generation':4,'pokedexId':6,'dex':dex,'national':national,'areas':areas,'places':{a['id']:a for a in editorial['areas']},'paths':editorial['paths'],'chapters':editorial['chapters'],'items':items,'encounters':encounters,'battles':battles,'audit':{'revision':lock['revision'],'worldRevision':world['revision'],'sourceAreas':len(area_map),'ordinaryTables':len(groups),'conditionalTables':len(special_groups),'itemOccurrences':sum(map(len,items.values()))}}
(package/'data.js').write_text('/* Generated by scripts/build-platinum-data.py; edit editorial.json and pinned world/source inputs, then regenerate. */\nwindow.PlatinumData='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n')
print(len(areas),'places;',len(area_map),'source areas;',len(groups),'ordinary tables;',len(special_groups),'conditional tables;',sum(map(len,items.values())),'items')
