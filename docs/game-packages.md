# Pacotes de jogos · primeira etapa

O app continua sendo um guia de campo com mapa, fichas, Pokédex e jornada local. Esta etapa cria uma fronteira de acesso aos dados existentes; não acrescenta um jogo, uma tela ou um formato novo de salvamento.

## Diagnóstico confirmado

Base inspecionada: `c7cea1bc162be9e4e33a00e0c2f76515cc5400cd`, em 08/10/2026. Checkout limpo, sem AGENTS.md no repositório. O histórico recente preservou geometria, aliases de itens e renderização sob demanda.

| Responsabilidade | Comportamento atual e limite |
| --- | --- |
| Carregamento | Scripts clássicos em ordem no HTML. Cada página carrega apenas seus dados, mas todos os recursos dessa edição entram antes de abrir as funcionalidades. Dados iniciais somam aproximadamente 1–1,2 MB de JavaScript sem compressão. |
| Mapas | SVG local, coordenadas em `map-data.js`; marcadores reutilizados na seleção. Caminhos de Black estão no app; Black 2 usa `Black2Bridge`. Fichas reutilizam o mesmo aside/scrim e eventos de teclado. |
| Abas | Pokédex montada ao abrir e desmontada ao sair; ferramentas escondidas não renderizam; detonado Black 2 liberado fora da aba. Preservado. |
| Persistência | `progress-store.js`: localStorage, recuperação em IndexedDB e revisão `_savedAt`; eventos storage, pageshow e visibilitychange. Normalização específica por edição dentro do app. Não há múltiplas jornadas por edição. |
| Offline | Gerador cria cache único com os dois jogos, instalação por `addAll`, sem `skipWaiting`; cache-first de arquivos locais. Não é download seletivo nem protocolo completo de recuperação de instalação interrompida. |
| Geração | `build-black2-interface.py` transforma app e HTML do Black 1. Outros scripts geram dados de CSVs e fontes baixadas; `build-black2-hack.py` depende de `/tmp/b2sources/hackmoves.txt`. Sem essas entradas externas não há reprodução integral dos dados. |
| Acoplamento | Globais de dados, fábricas de interface e transformações por substituição de texto. App concentra busca, mapa, fichas e persistência. Registro/adaptadores isolam parte desse acesso; não eliminam os demais globais. |
| Hack | Bridge aplica deltas antes de adaptar dados. Documentação v1.11 e regras v1.12, com precedência documentada na auditoria existente. Times completos da hack e itens comuns continuam parciais. |
| Testes | Testes Node de dados, mapa, itens, evolução, persistência e offline; suítes jsdom de fluxos. Não equivalem a Safari ou uso offline em navegador real. |

Hipóteses não medidas: consumo real de RAM, desempenho no Positivo, custos de rede em produção e layout no Safari. Reduzir nós de DOM não comprova redução de RAM. O README mencionava quatro abas em Black 2; o HTML e os testes confirmam cinco, corrigido no texto.

## Contrato mínimo

`core/game-registry.js` publica `GameRegistry.list()`, `get(editionId)`, `register(editionId, factory)` e `open(editionId)`. Metadados são imutáveis, sem DOM, rede, armazenamento ou carregamento automático. `open` rejeita edição sem adaptador, sem tentar abrir outro jogo.

Cada `packages/<edição>/adapter.js` registra uma fábrica que devolve `areas`, `map`, `encounters`, `items`, `chapters` e `queries`. Os objetos legados são reutilizados, sem clone dos dados nem reaplicação dos deltas. Essa interface é uma ponte; ainda não é um esquema universal de encontros. Somente o adaptador e as regras da edição atual entram no HTML.

JavaScript simples resolve este recorte, sem framework, build de frontend ou dependência de produção. Módulos ES poderão entrar ao extrair funcionalidades, com ordem de inicialização e testes; TypeScript só se erros de contrato justificarem custo de compilação e migração.

| Identidade | Região | Tipo | URL | Chave de progresso mantida |
| --- | --- | --- | --- | --- |
| `pokemon-black` | `unova` | Oficial · Black | `index.html?game=black` | `unova-black-field-guide-v2` |
| `pokemon-black2-complete-unova-1.12` | `unova` | Hack · base Black 2 | `black2.html` | `unova-black2-complete-1.12-v1` |

Black 2 oficial e White 2 não são pacotes disponíveis. `gameId` identifica o título base; `id` identifica a edição. `regionIds` não implica intercambiabilidade de mapa, dados ou progressão. `legacyGame` documenta os valores existentes de `unova-last-game`; redirecionamento e links não mudaram.

`coverage` separa mapa, encontros, itens, Pokédex, detonado, batalhas e offline. `available` significa recurso utilizável, não auditoria integral. `partial`, `outline` e `advice-only` explicitam limites. `audit.inspectedOn` é revisão do código, não confirmação factual contra ROM. As fontes detalhadas estão nas auditorias vinculadas.

## Adicionar e verificar um pacote

1. Registrar uma edição com ID estável, jogo-base, regiões, tipo, URL, cobertura, limites e fontes. Uma hack precisa de nome e versão próprios.
2. Criar adaptador independente. Manter dados oficiais intactos ou aplicar deltas documentados uma única vez antes de abrir a interface. Não preencher chance/nível desconhecido com zero ou valores da base.
3. Carregar dados e adaptador somente na página dessa edição. Não habilitar na seleção sem conteúdo utilizável. Jogos futuros pertencem ao plano, não ao registro disponível.
4. Validar IDs, referências, coordenadas, espécies/formas, numeração e mecânicas específicas da edição. Testes atuais cobrem regras de Gen V; não são um validador de todas as gerações. Revisar fontes e licença antes de redistribuir novos dados.
5. Atualizar geradores, regenerar saídas e executar testes. O gerador offline inclui scripts de `core/` e `packages/`; ainda baixa ambos os pacotes atuais.

Novos dados devem usar IDs independentes do nome mostrado: edição + local, espécie + forma, item + ocorrência, capítulo + tarefa. Número nacional, regional e forma são campos distintos. Coordenadas, conexões, requisitos e ordem narrativa serão dados separados. Evitar uma cadeia profunda de herança entre versões.

Os IDs antigos (`r1`, `nu`, nomes de espécies e IDs de itens) continuam com o significado atual **dentro da edição**. Não renomear ou usar esses IDs como chaves globais. Uma futura migração precisa de aliases explícitos, cópia recuperável do registro original e testes com progresso realista de ambas as páginas. Remover cache nunca deve remover jornada. Não trocar domínio: o armazenamento é vinculado à origem.

## Verificação desta etapa

```sh
node --test tests/*.test.cjs
node tests/dom-smoke.cjs
node tests/black2-dom.cjs
node tests/performance-dom.cjs
node tests/game-packages-dom.cjs
```

As quatro últimas rotinas precisam de `jsdom` como ferramenta de desenvolvimento (`npm install --no-save jsdom@26`); não é carregado pelo app. A suíte de geração exige Python e compara os arquivos em cópia temporária.

Resultado: 54 testes Node, smoke DOM Black e Black 2, alternância/reabertura de ambas as edições na mesma origem sem sobrescrever a outra jornada, migração legada Black 2, retomada, itens, notas, ferramentas e atalhos de teclado aprovados. O teste de registro confere isolamento, chaves distintas, erro de edição não carregada e ausência de reaplicação da hack. O teste offline inclui scripts e CSS de ambas as páginas e simula resposta de cache sem rede.

Comparação com jsdom: corpo renderizado idêntico, removendo scripts, em mapa, Pokédex, retorno ao mapa e busca por Litwick nos dois jogos. HTML fora da inclusão de scripts e CSS permanecem iguais. Isso é evidência estrutural, não comparação de pixels.

| Medida | Black antes → depois | Black 2 antes → depois |
| --- | --- | --- |
| Nós iniciais, incluindo scripts | 1574 → 1576 | 1863 → 1865 |
| Nós na Pokédex escondida | 0 → 0 | 0 → 0 |
| Sets / escritas innerHTML iniciais | 71 / 8 → 71 / 8 | 343 / 7 → 343 / 7 |
| Bytes de scripts sem compressão | 1.081.585 → 1.085.328 | 1.248.873 → 1.252.629 |
| Inicialização simulada (ms) | 290,6 → 297,5 | 251,7 → 284,4 |
| Abrir Pokédex simulada (ms) | 109,1 → 103,7 | 135,5 → 131,0 |
| Busca simulada (ms) | 35,6 → 29,2 | 59,3 → 64,9 |

Tempos de uma amostra jsdom, sem layout, rede ou hardware do usuário; inicialização inclui espera fixa de 80 ms. Não sustentam alegação de ganho ou regressão de desempenho. Marcadores mantiveram identidade. Não houve medição confiável de memória. O download de Chromium falhou (arquivo recebido inválido); capturas antes/depois, Safari/iPhone real, instalação offline real e atualização com aba aberta continuam pendentes.

## Segunda etapa · consultas por edição

Base: branch do PR #23, commit `1d762588354941281a5598b9de0e5b3089e07720`. Enquanto ele estiver aberto, o PR desta etapa aponta para essa branch; não inclui nem publica novamente a primeira etapa.

| Módulo | Responsabilidade |
| --- | --- |
| `core/encounter-queries.js` | Consultar tabelas por área, disponibilidade e sugestões por espécie; mantém a ordem anterior, sem alterar chances, níveis ou registros. |
| `packages/black/encounters.js` | Regras de Black: acesso, pesca, enxames, estações, eventos, escolhas de inicial/fóssil e taxas contestadas. |
| `packages/black2-complete/encounters.js` | Regras da hack: Liga, itens/acontecimentos documentados, presentes e trocas; recebe a tradução das condições da bridge. |
| `core/item-queries.js` | Busca por nome/aliases/TM/HM, contagens, IDs válidos e normalização dos IDs legados, vinculados ao catálogo da edição. |
| `item-guide.js` | Renderiza o inventário com as consultas recebidas. A assinatura antiga com tabelas continua disponível para compatibilidade. |

O adaptador oferece `queries.items` e `queries.createEncounters({specials, stage, getProgress, regionalSet, extraSpecies})`. O app usa os serviços para consultas de mapa, filtros, busca e fichas; as ferramentas existentes recebem as mesmas regras e função de busca. `getProgress` lê a jornada atual em cada consulta, inclusive depois de importação, troca de aba ou alteração externa. Não captura uma cópia antiga do progresso.

Gerador de Black 2 deixa de reescrever `lockReason`, `specialLock` e `rateUncertain`; essas regras têm fonte própria no pacote da hack. Renderização diferente das tabelas e demais transformações do gerador permanecem. Novos scripts entram no cache pelo gerador existente, sem alterar o protocolo offline.

Não houve mudança de dados, textos visíveis, estilos, URLs, chaves, normalização dos campos da jornada ou seleção de jogos. A migração de IDs de itens preserva exatamente os aliases existentes; nenhum registro local é convertido para novo formato. Ainda existem globais e consultas editoriais internas nas ferramentas, além da ordem narrativa no app; esta etapa não extrai Pokédex, detonado, renderizadores ou todo o motor de ferramentas.

Verificação adicional: 61 testes Node, incluindo diferenças entre edições, atualização de progresso, escolhas de presentes, condições da hack, chances desconhecidas, ordem das sugestões e aliases antigos. Suítes DOM e alternância/reabertura da mesma origem verificam o salvamento e as funções existentes. Comparação estrutural com o PR #23 cobre 64 estados: oito buscas, dois filtros, duas etapas de progresso e duas páginas, incluindo a primeira ficha correspondente quando há resultados. Não é comparação de pixels nem teste em aparelho real.

Medições estruturais desta etapa: nós iniciais 1576 → 1579 em Black e 1865 → 1868 na hack (três scripts novos por página); Pokédex escondida 0 → 0; Sets/escritas de innerHTML permaneceram 71/8 e 343/7. JavaScript sem compressão: 1.085.328 → 1.087.937 bytes e 1.252.629 → 1.255.304 bytes. Não houve medição de RAM ou teste adicional em Safari/navegador real.

As regras extraídas descrevem o comportamento atual; os testes não comprovam que todas as condições equivalem às flags da ROM. Por exemplo, condições textuais da hack continuam orientações explícitas, sem afirmar que o usuário já as cumpriu. Revisar conteúdo será uma etapa separada da refatoração.
