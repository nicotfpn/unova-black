"""Build documented C.U.P.E. additions; never infer missing rates/levels.
Run after build-black2-data.py. User supplied v1.12 rules; public detail docs v1.11.
"""
import json,re,csv
from pathlib import Path
root=Path(__file__).resolve().parent.parent
text=Path('/tmp/b2sources/hackmoves.txt').read_text();text=text[text.index(';;;;;Movepool'):text.index('Common questions')]
moves={};current=[]
for line in text.splitlines():
 if line.startswith('-'):
  current=line.strip('-: ').replace('Cincino','Cinccino').split('/')
 m=re.search(r'(?:Learns|Now learns) (.+?) (?:at )?level (\d+)\.',line)
 if m:
  for n in current:moves.setdefault(n,[]).append([m[1].replace('Matural Gift','Natural Gift').replace('Double Edge','Double-Edge'),int(m[2])])
# Do not turn a documented typo into a Gen VI move: Black Kyurem's Freeze Dry needs validation.
if 'Black Kyurem' in moves:moves['Black Kyurem']=[m for m in moves['Black Kyurem'] if m[0]!='Freeze Dry']
adds=[]
def A(n,a,m,r,z='Área principal',post=False):adds.append(dict(name=n,area=a,method=m,chance=r,zone=z,post=post,min=None,max=None,conditions=[],origin='hack-doc'))
for n,a,m,r,z,post in [
('Servine','Dreamyard','grass-spots',20,'Área externa',True),('Dewott','Route 17','surf-spots',30,'Água',True),('Pignite','Pinwheel Forest','grass-spots',20,'Exterior',True),
('Slakoth','Route 16','walk',10,'Grama',False),('Jigglypuff','Route 16','walk',5,'Grama',False),('Munna','Route 5','walk',10,'Grama',False),('Lickitung','Route 5','walk',5,'Grama',False),
('Corphish','Route 6','surf',10,'Água',False),('Crawdaunt','Route 6','surf-spots',5,'Água',False),('Yanma','Route 6','walk',5,'Grama',False),('Larvitar','Mistralton Cave','walk',10,'Caverna; andar não detalhado',False),('Cryogonal','Guidance Chamber','walk',5,'Andar superior',False),
('Palpitoad','Relic Passage','surf',10,'Água; trecho não detalhado',False),('Seismitoad','Relic Passage','surf-spots',5,'Água; trecho não detalhado',False),('Stunfisk','Seaside Cave','surf',10,'1F',False),('Druddigon','Reversal Mountain','walk',10,'Interior',False),('Tropius','Route 14','walk',10,'Grama',True),('Carnivine','Route 13','walk',5,'Grama',False),('Croagunk','Route 13','walk',10,'Grama',False),('Heatmor','Village Bridge','walk',10,'Grama',False),('Durant','Village Bridge','walk',10,'Grama',False),('Zoroark','Abundant Shrine','walk',10,'Grama',True),
('Tornadus','Abundant Shrine','grass-spots',20,'Forma Therian',True),('Thundurus','Abundant Shrine','grass-spots',20,'Forma Therian',True),('Landorus','Abundant Shrine','grass-spots',20,'Forma Therian',True),('Victini','Wellspring Cave','cave-spots',20,'2º piso da documentação (subsolo)',True),('Keldeo','Moor of Icirrus','surf-spots',20,'Água',True),('Meloetta','Route 1','grass-spots',20,'Grama',True),('Genesect','Route 15','grass-spots',20,'Grama',True),('Reshiram','Nature Sanctuary','grass-spots',20,'Reserva',True),
('Ursaring','Twist Mountain','walk',10,'Interior',True),('Donphan','Twist Mountain','walk',10,'Interior',True),('Machoke','Twist Mountain','walk',20,'Interior',True),('Graveler','Twist Mountain','walk',20,'Interior',True),('Graveler','Clay Tunnel','walk',20,'Interior',True),('Graveler','Wellspring Cave','walk',30,'Interior',True),('Gabite','Clay Tunnel','walk',10,'Interior',True),('Pidgeot','Marvelous Bridge','bridge-spots',20,'Sombras',True),('Marowak','Route 15','walk',10,'Grama',True),('Kangaskhan','Route 15','walk',5,'Grama',True),('Smeargle','Route 15','walk',5,'Grama',True),('Gloom','Pinwheel Forest','walk',20,'Interior',True),('Weepinbell','Pinwheel Forest','walk',20,'Interior',True),('Victreebel','Pinwheel Forest','grass-spots',5,'Interior',True),('Parasect','Pinwheel Forest','walk',5,'Interior',True),('Ledian','Pinwheel Forest','walk',5,'Exterior',True),('Dustox','Pinwheel Forest','walk',10,'Exterior',True),
('Loudred','Wellspring Cave','walk',30,'1F e subsolo',True),('Chimecho','Wellspring Cave','walk',10,'1F e subsolo',True),('Tyrogue','Wellspring Cave','walk',10,'1F',True),('Jynx','Wellspring Cave','walk',10,'Subsolo',True),('Stantler','Route 3','walk',10,'Grama',True),('Cherrim','Route 3','walk',9,'Grama',True),('Kricketune','Dreamyard','walk',20,'1º piso da documentação',True),('Misdreavus','Dreamyard','walk',10,'1º piso da documentação',True),('Haunter','Dreamyard','walk',10,'2º piso da documentação',True),('Purugly','Route 2','walk',10,'Grama',True),('Primeape','Route 2','walk',10,'Grama',True),('Persian','Route 2','walk',10,'Grama',True),('Houndoom','Route 1','walk',20,'Grama',True),('Mightyena','Route 1','walk',20,'Grama',True),('Rapidash','Route 1','walk',10,'Grama',True),('Luxio','Route 1','walk',5,'Grama',True),('Luxray','Route 1','grass-spots',5,'Grama',True),('Mr. Mime','Route 1','walk',10,'Grama',True),('Exeggcute','Route 18','walk',10,'Grama',True),('Exeggutor','Route 18','grass-spots',5,'Grama',True),('Staravia','Route 18','walk',10,'Grama',True),('Staraptor','Route 18','grass-spots',5,'Grama',True),('Porygon','P2 Laboratory','walk',5,'Grama',True),('Latias','Nature Sanctuary','surf-spots',30,'Água',True)]:A(n,a,m,r,z,post)
# Mawile/Sableye sentence is ambiguous about rate-to-floor mapping: record presence, no invented percentage.
for n in ['Mawile','Sableye']:A(n,'Wellspring Cave','walk',None,'1F e subsolo; taxa por piso não esclarecida',True)
# Opposite-version wild species: use known W2 habitats, never W2 percentages for the hack.
p=Path('/tmp/b2csv');R=lambda n:list(csv.DictReader((p/(n+'.csv')).open()))
ns={r['pokemon_species_id']:r['name'] for r in R('pokemon_species_names') if r['local_language_id']=='9'};ln={r['location_id']:r['name'] for r in R('location_names') if r['local_language_id']=='9'};la={r['id']:r for r in R('location_areas')};slots={r['id']:r for r in R('encounter_slots')};methods={r['id']:r['identifier'] for r in R('encounter_methods')}
base=json.loads((root/'black2-data.js').read_text().split('const black2Data=')[1].rsplit(';',1)[0]);existing={(e['name'],e['area'],e['method']) for e in base['encounters']+adds};opposite=[]
for r in R('encounters'):
 if r['version_id']!='22' or int(r['pokemon_id'])>649:continue
 n=ns[r['pokemon_id']]
 if n not in ['Skitty','Delcatty','Numel','Camerupt','Solosis','Duosion','Reuniclus','Rufflet','Braviary','Petilil','Lilligant','Elekid','Electabuzz','Pinsir','Throh']:continue
 a=ln[la[r['location_area_id']]['location_id']];m=methods[slots[r['encounter_slot_id']]['encounter_method_id']]
 if m not in ['walk','dark-grass','grass-spots','surf','surf-spots','super-rod','super-rod-spots'] or n in ['Reshiram','Zekrom','Latias','Latios','Regice','Registeel','Regirock','Regigigas']:continue
 key=(n,a,m)
 if key not in existing:opposite.append(dict(name=n,area=a,method=m,zone='Habitat da outra versão',chance=None,min=None,max=None,conditions=[],origin='opposite'));existing.add(key)
result=dict(id='complete-unova-1.12',title='Complete Unova Pokédex Edition',version='1.12',detailVersion='1.11',moves=moves,additions=adds,opposite=opposite,sources=['https://www.reddit.com/r/PokemonROMhacks/comments/1kd47l4/pokemon_black_2_and_white_2_complete_unova/','https://www.scribd.com/document/884651008/Wild-Encounter-Changes-B2W2-Complete-Unova-Pokedex','https://www.scribd.com/document/884650570/Moveset-Held-Item-Changes-B2W2-Complete-Unova-Pokedex'])
(root/'black2-hack-data.js').write_text('/* Factual hack deltas. v1.12 user rules + public v1.11 detail docs. */\nconst black2Hack='+json.dumps(result,ensure_ascii=False,separators=(',',':'))+';\n')
print(len(adds),'documented entries;',len(opposite),'opposite habitats;',len(moves),'move lists')
