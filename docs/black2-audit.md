# Black 2 · Complete Unova Pokédex Edition v1.12

A edição selecionada é a hack, com Black 2 como jogo-base. O progresso usa uma chave independente do Black original, preservando seu registro anterior. A interface salva alterações imediatamente e reutiliza a recuperação por IndexedDB.

## Fontes e tratamento dos dados

- Regras v1.12 fornecidas pelo usuário: evoluções, itens equipados, equipes ampliadas e qualidade de vida.
- PokeAPI CSV: versão 21, grupo de versão 14, Pokédex regional 9. Tipos da geração V. Aprendizado por nível, reprodução, tutor e máquina.
- [Documentação pública de encontros v1.11](https://www.scribd.com/document/884651008/Wild-Encounter-Changes-B2W2-Complete-Unova-Pokedex): adições e remoções aplicadas ao catálogo.
- [Documentação pública de golpes v1.11](https://www.scribd.com/document/884650570/Moveset-Held-Item-Changes-B2W2-Complete-Unova-Pokedex): alterações factuais de aprendizado. O registro duvidoso “Freeze Dry” para Black Kyurem não foi incorporado.
- [Discussão do autor](https://www.reddit.com/r/PokemonROMhacks/comments/1kd47l4/pokemon_black_2_and_white_2_complete_unova/): versão e correção do tipo de Eevee.
- Bulbapedia, walkthrough Parts 1–22: referências de percurso por capítulo. Texto editorial próprio.
- Serebii Black 2 / White 2: máquinas e tutores. Equipes originais são mantidas somente na base técnica; não são apresentadas como times confirmados da hack.

## Limites conhecidos

Os documentos detalhados encontrados são v1.11. As mudanças v1.12 fornecidas pelo usuário prevalecem. Não há confirmação integral dos times alterados de treinadores. Taxas e níveis ausentes ficam sem valor; áreas alteradas não reutilizam as probabilidades originais. Os níveis preservados dos encontros não substituídos vêm do jogo-base e ainda precisam de auditoria contra a ROM.

Os exclusivos opostos usam os habitats de White 2 como referência e a regra geral da hack; suas taxas menores não são inventadas. O catálogo de itens contém todas as TMs/HMs do jogo-base e itens selecionados, não todos os itens comuns do chão. Registros de shards e Heart Scale explicam serviços, não afirmam que o recurso seja coletado ali.

O mapa é esquemático, com o terreno do atlas anterior e conexões novas. A lista de áreas inclui subáreas sem marcador próprio. O planejador mostra o primeiro capítulo registrado e os requisitos descritos; isso não é uma simulação de todas as flags internas do jogo. As estratégias de batalha são orientações de preparo e ainda não substituem rosters verificados da hack.

## Verificação

Testes de navegação, cadastro de equipe sem golpes obrigatórios, campos salvos durante digitação, retomada após reabrir, separação de progresso entre jogos, alterações de evolução, remoção de encontros e catálogo regional. O pacote offline inclui os arquivos de Black 2. O teste visual móvel deve complementar os testes de DOM.
