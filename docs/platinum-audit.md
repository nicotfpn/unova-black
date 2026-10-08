# Pokémon Platinum · piloto oficial de Sinnoh

Escolhido pelo usuário como primeiro jogo novo. Depende da arquitetura e do seletor dos PRs #23–#25. Conteúdo parcial utilizável: **Twinleaf até a Coal Badge**, com dez pontos selecionáveis e um mapa original esquemático de conexões do sudoeste. Não representa uma planta exata, o mapa inteiro nem interiores.

## Conteúdo e procedência

- PokeAPI: revisão `2fe95532d27a9bf340575253aff50868319d8182`, versão **14**, grupo **9** (geração IV), Pokédex **6** (`extended-sinnoh`). **210** entradas, na ordem regional de Platinum. Nenhum dado de tipos, movimentos ou evoluções de gerações futuras é carregado.
- **33 tabelas comuns**: horário e método separados; grama, cavernas, Old Rod, Good Rod, Super Rod e Surf. Os slots ativos são agrupados por espécie, somando chances e mantendo níveis mínimos/máximos. A geração rejeita slots ativos duplicados e totais incompatíveis nestas tabelas comuns. Não impõe essa regra a encontros especiais de outras edições.
- **70 linhas condicionais excluídas**: radar, enxames e inserção GBA não são misturados aos encontros comuns. Não são exibidos como ausência da espécie no jogo inteiro.
- **11 ocorrências de itens**, com IDs próprios, método, localização, condição e referência por ocorrência. Lojas, itens ocultos e o inventário completo ainda não estão cobertos. TMs são consumíveis na geração IV; HMs são reutilizáveis.
- **Três capítulos, nove etapas** com redação própria: início, Jubilife e primeira insígnia. Referências factuais: [Bulbapedia partes 1](https://bulbapedia.bulbagarden.net/wiki/Appendix:Platinum_walkthrough/Section_1), [2](https://bulbapedia.bulbagarden.net/wiki/Appendix:Platinum_walkthrough/Section_2) e [3](https://bulbapedia.bulbagarden.net/wiki/Appendix:Platinum_walkthrough/Section_3), [Serebii Route 201](https://www.serebii.net/pokearth/sinnoh/4th/route201.shtml) e [Oreburgh Gate](https://www.serebii.net/pokearth/sinnoh/4th/oreburghgate.shtml). Não são reproduzidos o texto do detonado nem imagens dessas fontes.
- Uso de Surf: requer **Fen Badge**, quinta em Platinum, além do recurso informado; não herda a Relic Badge de Diamond/Pearl ou regras de Black. Referências: [Surf](https://bulbapedia.bulbagarden.net/wiki/Surf_(move)) e [sequência das insígnias](https://bulbapedia.bulbagarden.net/wiki/Badge_sequence).

A área Verity combina a margem e o lago antes da intervenção da Team Galactic; o estado posterior está fora do recorte. Oreburgh Gate inclui apenas 1F; a entrada no subsolo é explicada, mas suas tabelas/itens ainda não são publicados. Rotas 204, 207 e 218 e ramificações próximas ainda não estão no mapa. O presente dos iniciais na Route 201 é explicado sem chance aleatória; a escolha não registra automaticamente captura. A Pokédex permite marcação manual, e ausência de encontro no recorte não significa exclusividade ou impossibilidade de obter a espécie.

## Estrutura e geração

`packages/platinum/editorial.json` contém locais, conexões, itens e capítulos. `sources.json` fixa a revisão dos CSVs PokeAPI e SHA-256 de cada insumo; o gerador verifica os hashes. `data.js` é saída gerada, sem chamadas à API em produção. Os dez hashes foram também conferidos contra os arquivos baixados da revisão fixa.

```sh
python scripts/build-platinum-data.py --download
# Ou use uma pasta com os CSVs da revisão fixa:
python scripts/build-platinum-data.py /path/to/csv
python scripts/build-black2-interface.py
python scripts/build-service-worker.py
```

A interface pequena do piloto usa o CSS do guia, o registro, as consultas compartilhadas e `progress-store.js`. Evita carregar os catálogos e as regras de Unova numa página de Sinnoh. A Pokédex e o roteiro montam o conteúdo ao abrir e removem ao sair. Marcadores são criados uma vez, sem reconstrução por busca/filtro. Não há dependências novas em produção.

## Progresso e navegação

Chave **`sinnoh-platinum-field-guide-v1`**, esquema v1: capturas regionais, itens, passos, insígnias, horário, inicial, recursos e nota. Usa localStorage e recuperação IndexedDB existentes. Cópias exportadas incluem identidade da edição; a importação rejeita outra edição ou esquema, sem alterar o progresso atual. IDs desconhecidos são filtrados.

A retomada usa `unova-last-game=platinum`; as URLs, preferências legadas e chaves de Black/hack são preservadas. O seletor mostra Sinnoh, cobertura parcial e o limite do piloto. O cache continua **compartilhado**, com os arquivos do piloto incluídos pelo gerador. Offline seletivo por edição ainda não foi implementado.

## Validação e limites

- 69 testes Node aprovados. Verificam edição/região/geração, 210 entradas únicas, escopo dos encontros, probabilidades e condições por horário, rods/Surf, IDs de itens e retomada.
- Teste DOM de Platinum verifica busca de TM, captura, item, etapa, nota, reabertura, jornada isolada, seletor, teclado na ficha móvel, rejeição de backup estrangeiro e armazenamento indisponível. Pokédex/roteiro ocultos ficam sem linhas montadas; inicialização tem menos de 800 elementos no ambiente DOM.
- Suítes legadas verificam Black e a hack, migrações, alternância e geração reproduzível. Dados e clientes dessas duas edições permanecem independentes.
- DOM e cache simulados não equivalem a medir RAM, toque/zoom real, pixels ou Safari/iPhone. Revisão visual e offline real continuam pendentes antes de publicar. Este PR não faz merge nem deploy.
