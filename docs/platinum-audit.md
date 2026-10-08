# Pokémon Platinum · Sinnoh e Battle Zone

Platinum foi escolhido pelo usuário como primeiro jogo novo. Esta expansão sucede o recorte do PR #26 e cobre o mapa regional e o roteiro da história até o pós-jogo. São **84 locais**, dos quais **82 pontos físicos** no mapa; errantes e transferências/eventos têm fichas próprias na lista. O mapa SVG é original, posicionado a partir da grade regional de Platinum, com pequenos deslocamentos de entradas próximas para separar os alvos de toque. Pisos e estados ficam no seletor de setores, sem inventar plantas de interiores.

## Conteúdo e procedência

- PokeAPI, revisão `2fe95532d27a9bf340575253aff50868319d8182`: versão 14, grupo 9, geração IV. Pokédex regional extended-sinnoh com **210** entradas; lista Nacional da geração IV com **493**. Os CSVs têm SHA-256 fixados em `sources.json` e verificados pelo gerador.
- As **163 áreas de origem** dos encontros de Platinum estão associadas a setores do guia. **612 tabelas comuns** separam método e horário, validam slots únicos e total de 100%. **915 tabelas condicionais**, mais três encontros editoriais dos Regis, permanecem separadas. Não se somam radar, enxame, GBA, espécies diárias ou grupos de Honey às chances comuns.
- Presentes, ovos, trocas e encontros fixos usam chance nula, apresentada como fixo/presente. O nível de trocas depende do Pokémon oferecido. Feebas não recebe o falso 100% da ramificação da fonte: seus quadrados especiais e a chance não confirmada são explícitos. Requisitos de eventos, missões, grupos de Honey e seleções diárias permanecem visíveis; a interface não afirma tê-los deduzido automaticamente.
- pret/pokeplatinum, revisão `c248fb3f8cc9934ded800e489567c5c0eeee92eb`: **182 células do mapa**, itens de eventos ativos, itens ocultos, presentes concretos, inventários selecionados e **40 times** de líderes, Galactic, Liga e revanches. `world.json` conserva hashes e referências dos insumos usados. Não são distribuídos textos do jogo, arte ou código executável da fonte.
- **732 registros de itens**, incluindo todos os **92 TMs e 8 HMs**, itens no chão, ocultos, presentes e compras. TMs são consumidas; HMs são reutilizáveis. Não é uma declaração de inventário exaustivo: presentes com seleção dinâmica, condições de scripts e todos os estoques de lojas não são extraídos automaticamente. Presentes têm aviso de condição local. Os preços do Game Corner vêm do script primário; TM74 custa 15.000 moedas. Quatro TMs por BP e TM64 têm referências suplementares no editorial.
- **27 capítulos e 93 etapas**, com redação própria, do início à Liga, exploração de Sinnoh e Battle Zone. Referências factuais por capítulo: [Bulbapedia, partes 1–26](https://bulbapedia.bulbagarden.net/wiki/Appendix:Platinum_walkthrough). Os capítulos não reproduzem o texto do detonado nem suas imagens. Os eventos antigos permanecem distinguíveis, incluindo Azure Flute não distribuída oficialmente para Platinum.
- Times mostram níveis, itens e somente os golpes explicitamente definidos na fonte, sem deduzir golpes automáticos ausentes. Não há dados de tipos ou movimentos de gerações posteriores nem adaptação automática de times da hack.

## Geração reproduzível

`editorial.json` contém locais, setores, conexões, capítulos e complementos referenciados. O extrator exige o checkout pret na revisão fixada. A saída `data.js` é local e não consulta APIs durante uso do guia.

```sh
python scripts/build-platinum-world.py /path/to/pokeplatinum
python scripts/build-platinum-data.py /path/to/pinned-pokeapi-csv
# Alternativa para os CSVs: python scripts/build-platinum-data.py --download
python scripts/build-platinum-map.py
python scripts/build-black2-interface.py
python scripts/build-service-worker.py
```

O checkout pret deve conter `res/field`, `res/items`, `res/trainers`, `res/town_map`, `include/data` e `src/scrcmd_game_corner_prize.c`. A reextração e geração foram conferidas contra os insumos fixados. O teste de geradores reproduz o SVG e o service worker a partir dos arquivos versionados.

## Progresso e carregamento

A chave **`sinnoh-platinum-field-guide-v1`** e o esquema v1 são preservados. Os onze IDs de itens, locais, etapas, capturas e notas do piloto continuam válidos; IDs brutos substituídos têm aliases. Capturas nacionais coexistem com o contador regional de 210. Black e a hack mantêm suas chaves, clientes e dados próprios. Cópias estrangeiras são rejeitadas sem substituir o save atual.

Pokédex, roteiro e times montam conteúdo ao abrir e removem ao sair. Uma ficha começa com no máximo oito grupos e oito itens; os Pokémon de cada grupo são montados ao expandir. Os 82 marcadores permanecem no DOM durante buscas e filtros. A busca aceita nomes e números de TM/HM com ou sem zero. Nenhuma dependência nova em produção. O catálogo descreve história e pós-jogo; cobertura de encontros/itens continua parcial como auditoria, apesar da abrangência regional.

O cache permanece compartilhado e inclui as três edições. Cache seletivo por edição e múltiplas jornadas continuam pendentes. Este PR não faz merge nem deploy.

## Validação e limites

Passaram **72 testes Node e seis suítes DOM**. Os testes verificam cobertura dos setores, chances comuns, condicionais, todos os TMs/HMs, preservação dos onze IDs, caminhos do roteiro, times e separação dos pontos físicos. O teste DOM cobre consultas, capturas regionais/nacionais, itens, etapas, notas, save antigo, telas sob demanda, seletor, ficha móvel por teclado e rejeição de backup estrangeiro. A inicialização tem 883 elementos no ambiente DOM e não monta as listas da Pokédex ou do roteiro.

As suítes legadas continuam cobrindo Black/hack, persistência, alternância e cache simulado. DOM não mede RAM nem valida pixels, toque/zoom ou offline real em Safari/iPhone. Essas verificações em dispositivos reais permanecem pendentes; não há promessa de desempenho medido em um Positivo de 4 GB.
