# Expansão por etapas

Esta execução termina no registro e nos adaptadores. Tela de jogos, múltiplas jornadas, navegação, detalhes do detonado e escolha do piloto exigem participação do usuário antes de implementar.

## Inventário de escopo · 08/10/2026

Cada título abaixo exige cobertura independente. Nenhum grupo futuro está cadastrado como disponível.

| Grupo | Títulos e conteúdo a avaliar |
| --- | --- |
| Kanto original | Red/Green japoneses, Red/Blue internacionais, Blue japonês e Yellow; diferenças de edição/localização precisam de fontes próprias |
| Johto original | Gold, Silver, Crystal; Kanto adicional em cada edição |
| Hoenn original | Ruby, Sapphire, Emerald |
| Remakes de Kanto | FireRed, LeafGreen e Sevii; Let's Go Pikachu, Let's Go Eevee |
| Sinnoh original | Diamond, Pearl, Platinum |
| Remakes de Johto | HeartGold, SoulSilver; Kanto adicional |
| Unova | Black utilizável; White, Black 2 oficial e White 2 pendentes; Complete Unova v1.12 utilizável com limites documentados |
| Kalos | X, Y; Legends: Z-A e Mega Dimension em pacote próprio para Lumiose |
| Remakes de Hoenn | Omega Ruby, Alpha Sapphire |
| Alola | Sun, Moon, Ultra Sun, Ultra Moon |
| Galar | Sword, Shield; Isle of Armor e Crown Tundra separados da história principal |
| Sinnoh/Hisui | Brilliant Diamond, Shining Pearl; Legends: Arceus, com atualização Daybreak distinguida |
| Paldea | Scarlet, Violet; The Teal Mask e The Indigo Disk, incluindo epílogo |
| Anunciados | Winds/Ventos e Waves/Ondas: lançamento anunciado para 2027; aguardar mapas e dados verificáveis |

Relançamentos e edições de console não significam automaticamente outro pacote de dados: confirmar diferenças reais primeiro. Conteúdo de evento deve ser identificado à parte. Spinoffs, incluindo Colosseum/XD, GO, Mystery Dungeon, Champions e Pokopia, ficam fora do escopo inicial; classificação e eventual inclusão ficam para avaliação própria.

Fontes oficiais consultadas apenas para atualizar o escopo recente: [Z-A](https://www.pokemon.com/br/videogames-pokemon/pokemon-legends-z-a), [Mega Dimension disponível](https://legends.pokemon.com/pt-br/dlc), [Ventos e Ondas anunciados para 2027](https://windswaves.pokemon.com/pt-br/). Este inventário não constitui pesquisa completa dos dados de cada jogo.

## Sequência executável

| Fase / dependência | Entrega e critério de conclusão | Riscos, pesquisa e testes / limite |
| --- | --- | --- |
| 1 · atual | Registro de edições, cobertura e adaptadores com páginas e progressos preservados | Testes de contrato, geração, DOM e persistência. Globais e carregamento antecipado continuam. |
| 2 · fase 1 | Extrair consultas e regras de Black/Black 2 para módulos por edição; contratos de IDs e fontes com validação de referências | Pesquisar procedência das adições da hack; testar precedência, remoções e valores desconhecidos. Não unificar dados oficiais e hack. |
| 3 · fase 2 | Carregar dados de funcionalidades ao abrir e liberar conteúdo ao sair; manter resposta e aparência | Ordem de scripts/globais é risco. Comparar pixels e fluxos em navegador, recursos carregados, tempo e DOM; sem promessa de RAM sem medir. |
| 4 · contrato da fase 2 e decisão de jornadas | Persistência versionada com recuperação e migrações; registros por edição/jornada | Perguntar se haverá uma ou várias partidas por jogo. Testar backups, duas abas, suspensão, edição antiga e importação; nenhuma migração destrutiva sem cópia. |
| 5 · fases 3–4 | Offline selecionável por edição, instalação íntegra, retentativa e remoção independente do progresso | Pesquisar limites Safari/storage e atualização coerente. Testar download interrompido, offline real, quota, update com aba aberta; cache atual ainda é compartilhado. |
| 6 · registro + fases 4–5 + decisão de tela | Continuar jornada e escolher jogo; cobertura e hack legíveis; só conteúdo utilizável | Apresentar 2–3 opções de tela antes de implementar. Testar teclado, toque, troca de jogo e retomada; sem mudanças cosméticas gratuitas. |
| 7 · contratos + decisão do piloto | Um novo jogo com mapa, encontros, itens e percurso revisados em recorte definido | Candidato técnico inicial: White oficial, pela proximidade da estrutura Gen V e diferenças verificáveis; não copiar Black indiscriminadamente. Alternativa: FireRed para provar outra região. Confirmar fontes/licenças e amostra antes de escolher com o usuário. |
| 8 · piloto aprovado | Expandir por grupos, sempre revisar versão por versão e publicar cobertura honesta | Numerações, exclusivos e remakes exigem auditoria própria. Testes de integridade por pacote e navegação; não declarar grupo completo por contagem de espécies. |
| 9 · contratos amadurecidos | Adaptar áreas abertas, spawns, clima e sistemas de Legends/Let's Go | Pesquisar mecânicas e referências antes de modelar. Testes específicos sem somas universais de chances; mapas internos só com planta verificada. |
| 10 · contínua | Revisão de fontes, lacunas, licenças, acessibilidade e cobertura; conteúdo editorial original | Validar detonado, batalhas, DLC e eventos separados. Critério de conclusão por recurso/edição; nenhum selo de completo sem auditoria. |

Cada fase deve terminar em PR próprio e pequeno, mantendo produção utilizável. Para novos dados: conservar insumo/revisão/licença, extrair de forma reproduzível, validar automaticamente, revisar amostras por local e registrar lacunas. Tabelas da hack precisam de origem e operações adicionadas/alteradas/removidas explícitas; times oficiais não substituem rosters desconhecidos da hack.

Consultas por edição e seleção de jogos foram implementadas nos PRs #24 e #25. Próxima expansão: ampliar Sinnoh a partir do recorte de Platinum, com fontes verificadas e cobertura explícita. Múltiplas jornadas por edição ainda dependem de decisão do usuário.

## Piloto escolhido e primeiro recorte

Decisão do usuário: **Pokémon Platinum oficial**. Substitui a candidatura técnica de White/FireRed. Primeiro recorte: dez locais de Twinleaf até Oreburgh, 210 entradas regionais, encontros comuns por horário/método, seleção de itens e roteiro até a Coal Badge. Veja [platinum-audit.md](platinum-audit.md). Seleção de jogo já implementada na etapa anterior; múltiplas jornadas por edição, offline selecionável e o restante de Sinnoh continuam pendentes.
