import csv,json
from pathlib import Path
import argparse
parser=argparse.ArgumentParser();parser.add_argument('--csv-root',type=Path,required=True);args=parser.parse_args()
p=args.csv_root;dest=Path(__file__).resolve().parent.parent
def rows(n):return list(csv.DictReader((p/(n+'.csv')).open()))
def names(n,key):return {int(r[key]):r['name'] for r in rows(n) if r['local_language_id']=='9'}
sp={int(r['id']):r for r in rows('pokemon_species') if int(r['id'])<=649}
ns=names('pokemon_species_names','pokemon_species_id');items=names('item_names','item_id');moves=names('move_names','move_id');locations=names('location_names','location_id');types=names('type_names','type_id')
# The current default type data needs its historical pre-Fairy overrides for generation V.
pt={}
for r in rows('pokemon_types'):
 if int(r['pokemon_id'])<=649:pt.setdefault(int(r['pokemon_id']),[]).append(int(r['type_id']))
old={}
for r in rows('pokemon_types_past'):
 if int(r['generation_id'])==5:old.setdefault(int(r['pokemon_id']),[]).append(int(r['type_id']))
pt.update(old)
mons={ns[i]:dict(id=i,types=[types[t] for t in pt[i]],parent=ns.get(int(r['evolves_from_species_id'] or 0)),captureRate=int(r['capture_rate'])) for i,r in sp.items()}
moveData={};learn={}
for r in rows('pokemon_moves'):
 i=int(r['pokemon_id']);m=int(r['move_id']);method=int(r['pokemon_move_method_id'])
 if i<=649 and r['version_group_id']=='11' and method in [1,2,3,4]:
  learn.setdefault(ns[i],[]).append([moves[m],method,int(r['level'])]);moveData[moves[m]]=m
for name,l in learn.items():mons[name]['moves']=sorted([list(v) for v in set(tuple(v) for v in l)],key=lambda x:(x[1],x[2],x[0]))
evo=[]
for r in rows('pokemon_evolution'):
 i=int(r['evolved_species_id']);vg=int(r['version_group_id'] or 1)
 if i>649 or vg>11 or r['required_pokemon_form_id'] or r['region_id']:continue
 parent=mons[ns[i]]['parent']
 if not parent:continue
 cond=[];trigger=int(r['evolution_trigger_id'])
 item=items.get(int(r['trigger_item_id'] or 0));held=items.get(int(r['held_item_id'] or 0))
 if trigger==2:cond.append('Troque com outro jogador')
 elif trigger==3:cond.append('Use '+(item or 'o item indicado'))
 elif trigger==4:cond.append('Suba ao nível 20 com uma vaga na equipe e uma Poké Ball comum na bolsa')
 else:cond.append('Suba um nível'+(' a partir do Nv. '+r['minimum_level'] if r['minimum_level'] else ''))
 if held:cond.append('segurando '+held)
 if r['minimum_happiness']:cond.append('com amizade de pelo menos 220')
 if r['minimum_beauty']:cond.append('com condição Beauty de pelo menos '+r['minimum_beauty']+' (condição herdada de jogos anteriores)')
 if r['gender_id']:cond.append('sendo '+('fêmea' if r['gender_id']=='1' else 'macho'))
 if r['time_of_day']:cond.append('durante '+('o dia' if r['time_of_day']=='day' else 'a noite'))
 if r['known_move_id']:cond.append('conhecendo '+moves[int(r['known_move_id'])])
 if r['location_id']:
  loc=locations.get(int(r['location_id']),'local especial');cond.append('em '+loc)
 if r['trade_species_id']:cond.append('em troca de '+ns[int(r['trade_species_id'])])
 if r['party_species_id']:cond.append('com '+ns[int(r['party_species_id'])]+' na equipe')
 if r['relative_physical_stats']:cond.append({'1':'com Ataque maior que Defesa','0':'com Ataque igual a Defesa','-1':'com Ataque menor que Defesa'}[r['relative_physical_stats']])
 if r['condition_expression']:cond.append('a forma depende do valor de personalidade oculto desse Wurmple; não muda ao repetir a evolução')
 entry=dict(fromSpecies=parent,toSpecies=ns[i],condition='; '.join(cond)+'.',item=item or held)
 if entry not in evo:evo.append(entry)
# BW location-based evolutions: exclude locations from older games and supply Unova counterparts.
evo=[e for e in evo if not (' em ' in e['condition'] and e['toSpecies'] in ['Leafeon','Glaceon','Magnezone','Probopass'])]
for a,b,c in [('Eevee','Leafeon','Suba um nível perto da pedra coberta de musgo em Pinwheel Forest.'),('Eevee','Glaceon','Suba um nível perto da pedra de gelo no subsolo de Twist Mountain.'),('Magneton','Magnezone','Suba um nível em Chargestone Cave.'),('Nosepass','Probopass','Suba um nível em Chargestone Cave.')]:evo.append(dict(fromSpecies=a,toSpecies=b,condition=c,item=None))
# Store only the BW default species; regional forms, Gen VI evolutions and new moves are excluded.
data=dict(pokemon=mons,evolutions=evo,source='https://github.com/PokeAPI/pokeapi/tree/master/data/v2/csv',versionGroup='black-white',methods={'1':'Por nível','2':'Por reprodução','3':'Tutor','4':'TM/HM'})
(dest/'pokemon-guide-data.js').write_text('/* PokéAPI CSV; version group 11, generation V types. See docs/adventure-audit.md. */\nconst pokemonGuideData='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n')
print('species',len(mons),'evolutions',len(evo),'learnsets',len(learn))
