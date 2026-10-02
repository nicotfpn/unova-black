# Equipe, modo de jogo e batalhas

Atualização para Pokémon Black original, com uso no iPhone como prioridade.

## Comportamento

- Equipe e Jogar são destinos próprios. No celular, cinco abas fixas respeitam a área segura inferior; o mapa continua independente.
- Um integrante aberto por vez. Formulários usam texto de 16 px para evitar zoom automático do Safari. Sem blur, parallax, imagens novas ou bibliotecas de interface.
- A equipe ideal reaproveita o campo team. Os campos novos teamPlan, playArea e playNote ficam no mesmo salvamento local/IndexedDB e no arquivo de exportação. Não alteram capturas, itens ou insígnias.
- São aceitos zero a quatro golpes distintos, item e função opcionais, integrante atual e nível informado. Importações inválidas são normalizadas.
- A linha do tempo estima acesso por insígnias e lista requisitos reais separadamente. Não transforma nível de evolução em insígnia e não garante que um plano já esteja pronto.
- Golpes vêm de Black/White (grupo de versão 11), incluindo as pré-evoluções. O aviso de evolução diferencia exclusividade da pré-evolução de aprendizado mais cedo; TM disponível na forma final impede um falso aviso de impossibilidade.
- Itens usam o catálogo do guia, incluindo consumíveis e itens de evolução. A interface explica que escolher um item não certifica que ele possa ser equipado.
- Alternativas temporárias compartilham tipos e têm obtenção compatível com o avanço informado. Não são recomendações otimizadas por atributos, habilidade ou dano.
- A consulta de tipos considera a tabela da geração V, inclusive resistências de Aço a Fantasma e Sombrio. Não calcula dano. Golpes de tipo variável não entram no resumo ofensivo fixo.
- O filtro de spoilers também vale para rotas, itens e confrontos novos. As metas explícitas do usuário permanecem editáveis.

## Dados de batalha

As equipes cadastradas são as duas batalhas de N em Nimbasa/Chargestone, os quatro membros da primeira Liga, N no final de Black (Zekrom) e Ghetsis (Hydreigon nível 54). Ginásios reaproveitam o aconselhamento existente. Revanche possui um link para as equipes próprias; não reutiliza a equipe da primeira visita. Este não é um catálogo de todos os treinadores.

Fontes: [Liga](https://www.serebii.net/blackwhite/elitefour.shtml), [N e Ghetsis](https://www.serebii.net/blackwhite/plasma.shtml), [capturas lendárias](https://www.smogon.com/ingame/guides/capturing_bw_legendaries), [dados CSV](https://github.com/PokeAPI/pokeapi/tree/master/data/v2/csv).

Tornadus requer oito insígnias e o evento de tempestade; o indicador antigo de sete insígnias foi corrigido. As sete fichas lendárias dão condições e riscos próprios; não prometem captura nem um reencontro genérico depois de nocaute.

## Limites de validação

Testes locais cobrem migração, campos opcionais, golpes exclusivos, tipos da geração V, navegação e persistência. A revisão visual em navegador com quadro de 390 px verifica responsividade; não substitui um teste em Safari físico nem prova o desempenho de todos os modelos de iPhone. Supabase permanece desativado por escolha do usuário.
