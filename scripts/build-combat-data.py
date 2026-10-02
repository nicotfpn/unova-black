"""Rebuild the type consultation from PokeAPI CSV files (no network at runtime)."""
from pathlib import Path
import csv,json,re,sys
root=Path(__file__).resolve().parent.parent
csv_root=Path(sys.argv[1])
source=(root/'pokemon-guide-data.js').read_text()
guide=json.loads(source[source.index('=')+1:].strip().rstrip(';'))
used={m[0] for p in guide['pokemon'].values() for m in p['moves']}
types={1:'Normal',2:'Fighting',3:'Flying',4:'Poison',5:'Ground',6:'Rock',7:'Bug',8:'Ghost',9:'Steel',10:'Fire',11:'Water',12:'Grass',13:'Electric',14:'Psychic',15:'Ice',16:'Dragon',17:'Dark'}
key=lambda n:re.sub('[^a-z0-9]','',n.lower())
names={key(n):n for n in used}
names['vicegrip']='Vise Grip'
moves={}
for r in csv.DictReader((csv_root/'moves.csv').open()):
    name=names.get(key(r['identifier']))
    if name:
        moves[name]={'type':types.get(int(r['type_id']),'Normal'),'damage':int(r['damage_class_id'])!=1}
missing=used-set(moves)
if missing:raise ValueError(f'Missing moves: {sorted(missing)}')
chart={}
for r in csv.DictReader((csv_root/'type_efficacy.csv').open()):
    attack,target=int(r['damage_type_id']),int(r['target_type_id'])
    factor=int(r['damage_factor'])/100
    if attack in types and target in types and factor!=1:
        chart.setdefault(types[attack],{})[types[target]]=factor
# Fairy did not exist in Gen V; pre-Fairy moves above keep Normal typing.
chart.setdefault('Ghost',{})['Steel']=.5
chart.setdefault('Dark',{})['Steel']=.5
(root/'combat-data.js').write_text('/* Type-only consultation for generation V; not a damage calculator. Source: PokeAPI CSV, with Gen V Steel resistance and pre-Fairy move types. */\nconst combatData='+json.dumps({'moves':moves,'chart':chart},separators=(',',':'))+';\n')
