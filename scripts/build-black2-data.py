"""Build a version-specific Black 2 catalogue from PokeAPI CSV and factual TM tables.
Usage: python scripts/build-black2-data.py /tmp/b2csv /tmp/b2sources
PokeAPI version 21, version group 14, regional dex 9. No BW encounter fallback.
"""
import csv,json,sys,re
from pathlib import Path
from collections import defaultdict
from bs4 import BeautifulSoup
root=Path(__file__).resolve().parent.parent;p=Path(sys.argv[1]);sources=Path(sys.argv[2])
def rows(n):return list(csv.DictReader((p/(n+'.csv')).open()))
def names(n,key):return {r[key]:r['name'] for r in rows(n) if r['local_language_id']=='9'}
ns=names('pokemon_species_names','pokemon_species_id');ln=names('location_names','location_id');an=names('location_area_prose','location_area_id');mn=names('move_names','move_id');it=names('item_names','item_id')
base=json.loads((root/'pokemon-guide-data.js').read_text().split('const pokemonGuideData=',1)[1].rsplit(';',1)[0])
dex={ns[r['species_id']]:int(r['pokedex_number']) for r in rows('pokemon_dex_numbers') if r['pokedex_id']=='9'}
learn=defaultdict(set)
for r in rows('pokemon_moves'):
 if r['version_group_id']=='14' and int(r['pokemon_id'])<=649 and r['pokemon_move_method_id'] in ['1','2','3','4']:
  learn[ns[r['pokemon_id']]].add((mn[r['move_id']],int(r['pokemon_move_method_id']),int(r['level'])))
for n,v in base['pokemon'].items():v['moves']=sorted(learn[n],key=lambda x:(x[1],x[2],x[0]));v['dex']=dex.get(n)
la={r['id']:r for r in rows('location_areas')};slots={r['id']:r for r in rows('encounter_slots')};methods={r['id']:r['identifier'] for r in rows('encounter_methods')};conditions={r['id']:r['identifier'] for r in rows('encounter_condition_values')};emap=defaultdict(list)
for r in rows('encounter_condition_value_map'):emap[r['encounter_id']].append(conditions[r['encounter_condition_value_id']])
group={}
for r in rows('encounters'):
 if r['version_id']!='21' or int(r['pokemon_id'])>649:continue
 area=la[r['location_area_id']];slot=slots[r['encounter_slot_id']];cond=tuple(sorted(emap[r['id']]))
 key=(area['location_id'],r['location_area_id'],r['pokemon_id'],slot['encounter_method_id'],cond)
 if key not in group:group[key]={'name':ns[r['pokemon_id']],'area':ln[area['location_id']],'zone':an.get(r['location_area_id']) or area['identifier'] or 'Área principal','method':methods[slot['encounter_method_id']],'conditions':list(cond),'min':int(r['min_level']),'max':int(r['max_level']),'chance':0}
 x=group[key];x['chance']+=int(slot['rarity'] or 0);x['min']=min(x['min'],int(r['min_level']));x['max']=max(x['max'],int(r['max_level']))
# Factual TM/HM locations. Descriptions/effect prose from the source are not copied.
s=BeautifulSoup((sources/'tmhm.html').read_bytes(),'html.parser');machines=[]
areas={'Pokťmon World Tournament':'Pokémon World Tournament','Mistralton PokťMart':'Mistralton City','Lacunosa PokťMart':'Lacunosa Town','Moor of Iccirus':'Moor of Icirrus','Team Plasma Frigate':'Plasma Frigate'}
for tr in s.find_all('tr'):
 cells=tr.find_all('td',recursive=False)
 if len(cells)!=9 or not re.fullmatch(r'(TM|HM)\d{2}',cells[0].get_text(strip=True)):continue
 code=cells[0].get_text(strip=True);raw=cells[-1].get_text(' ',strip=True)
 loc=raw.split(' - ')[0]
 for a,b in areas.items():loc=loc.replace(a,b)
 loc=re.sub(r' PokťMart.*','',loc).replace(' Department Store','').replace(' Runway','').replace(' Market','').replace(' Mode Street','')
 loc=loc.replace('Mistralton','Mistralton City') if loc=='Mistralton' else loc
 if loc=='Lacunosa':loc='Lacunosa Town'
 if loc=='Pokémon World Tournament':note='Troque BP no balcão de TMs do PWT. Confira o custo antes de comprar.'
 elif 'PokťMart' in raw or 'Department Store' in raw:note='À venda na loja desta área.'+((' Preço: '+re.search(r'[\d,]+(?= (?:PokťDollars|Yen))',raw).group().replace(',','.')+' ₽.') if re.search(r'[\d,]+(?= (?:PokťDollars|Yen))',raw) else '')
 elif 'Defeat ' in raw:note='Receba após vencer '+raw.split('Defeat ')[1]+'.'
 elif 'From ' in raw:note='Converse com '+raw.split('From ')[1].replace('Rival','Hugh')+' durante o avanço da história.'
 else:note='Item encontrado nesta área. Consulte o capítulo e a referência do local para a posição exata.'
 overrides={'TM01':'Perto do Centro Pokémon, na área externa de Victory Road.','TM21':'Receba do membro da Plasma ao encontrar o Herdier desaparecido.','TM27':'Bianca entrega depois da primeira insígnia.','TM40':'Converse com o menino da casa ao norte do Centro após vencer Skyla; procure a ponta sudoeste da pista.','TM44':'Converse com a guitarrista no 11º andar do prédio da rua oeste de Castelia.','TM54':'Mostre ao pesquisador a Habitat List completa de capturas de Reversal Mountain.','TM94':'Derrote os três operários do complexo e volte a falar com o encarregado.','HM01':'Roxie entrega após a batalha contra a Plasma no porto, depois do primeiro filme.','HM02':'Bianca entrega na primeira visita à Route 5.','HM03':'Cheren entrega na Route 6, depois dos acontecimentos do PWT.','HM04':'Hugh entrega após derrotar a Plasma nos esgotos de Castelia.','HM05':'N entrega ao chegar à entrada de Victory Road, após a crise da Plasma.','HM06':'Hugh entrega em Undella no pós-jogo.'}
 note=overrides.get(code,note)
 move=next((mn[r['move_id']] for r in rows('machines') if r['version_group_id']=='14' and int(r['machine_number'])==(int(code[2:])+(100 if code.startswith('HM') else 0))),cells[1].get_text(strip=True))
 machines.append(dict(code=code,name=move,area=loc,note=note))
# Shard tutor factual availability and cost, from source tables.
s=BeautifulSoup((sources/'movetutor.html').read_bytes(),'html.parser');tutors=[];section='';color=''
for table in s.find_all('table'):
 direct=table.find_all('tr',recursive=False)
 if not direct:direct=table.select(':scope > tbody > tr')
 heading=table.find_previous(string=re.compile(r'(Red|Blue|Yellow|Green) Shards'));title=str(heading).strip() if heading else ''
 match=re.match(r'(Driftveil City|Lentimas Town|Humilau City|Nacrene City)\s*-\s*(Red|Blue|Yellow|Green) Shards',title)
 if not match:continue
 for tr in table.find_all('tr'):
  c=tr.find_all('td',recursive=False)
  if len(c)==8 and c[0].find('a') and c[-1].get_text(strip=True).isdigit():
   name=c[0].get_text(strip=True).replace('Thunderpunch','Thunder Punch')
   tutors.append(dict(name=name,area=match[1],color={'Red':'vermelhos','Blue':'azuis','Yellow':'amarelos','Green':'verdes'}[match[2]],cost=int(c[-1].get_text(strip=True))))
# Full factual rosters, keeping Normal/Challenge and first visit/rematch separate.
battles=[]
for source in ['gyms','elitefour']:
 soup=BeautifulSoup((sources/(source+'.html')).read_bytes(),'html.parser')
 for index,table in enumerate(soup.select('table.trainer')):
  links=[a for a in table.find_all('a',href=re.compile(r'/pokedex-bw/\d+\.shtml')) if a.get_text(strip=True)]
  names=[a.get_text(strip=True) for a in links]
  levels=[int(re.search(r'\d+',c.get_text()).group()) for c in table.select('td.level')]
  attacks=[[a.get_text(strip=True) for a in c.find_all('a')] for c in table.select('td.bor') if 'Attacks' in c.get_text()]
  held=[c.get_text(' ',strip=True).split(':',1)[-1].strip().replace('No Item','Sem item') for c in table.select('td.bor') if 'Hold Item' in c.get_text()]
  abilities=[a.get_text(strip=True) for a in table.find_all('a',href=re.compile('/abilitydex/'))]
  who=(['Cheren','Roxie','Burgh','Elesa','Clay','Skyla','Drayden','Marlon'][index//2] if source=='gyms' else ['Shauntal','Grimsley','Caitlin','Marshal','Iris'][(index//2)%5])
  chapter=([2,3,4,6,7,10,13,13][index//2] if source=='gyms' else 22 if index>=10 else 15)
  battles.append(dict(name=who,chapter=chapter,mode='challenge' if index%2 else 'normal',rematch=source=='elitefour' and index>=10,team=[dict(name=n,level=levels[j],moves=attacks[j] if j<len(attacks) else [],item=held[j] if j<len(held) else '',ability=abilities[j] if j<len(abilities) else '') for j,n in enumerate(names)],source='https://www.serebii.net/black2white2/'+source+'.shtml'))
result={'pokemon':base['pokemon'],'evolutions':base['evolutions'],'encounters':list(group.values()),'machines':machines,'tutors':tutors,'battles':battles,'version':'black-2','versionGroup':14,'source':'https://github.com/PokeAPI/pokeapi/tree/master/data/v2/csv'}
(root/'black2-data.js').write_text('/* Generated Black 2-only catalogue. See scripts/build-black2-data.py. */\nconst black2Data='+json.dumps(result,ensure_ascii=False,separators=(',',':'))+';\n')
print(len(dex),'dex;',len(group),'encounter groups;',len(machines),'machines;',len(tutors),'tutors')
