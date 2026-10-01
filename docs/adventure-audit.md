# Ferramentas da jornada — Pokémon Black original

## Conteúdo e limites

O guia combina as tabelas já auditadas de encontros/itens com objetivos por etapa, tarefas manuais, seis vagas de equipe, notas por local, serviços, agenda, preparação para ginásios e consultas de evolução/golpes. As sugestões não leem o save do Nintendo DS: insígnias e recursos informados são referências. Tarefas não alteram insígnias. Pendências de itens incluem compras e requisitos futuros; não são uma promessa de acesso imediato.

O modo sem spoilers oculta lugares e espécies de etapas futuras nas listas, nas buscas das ferramentas e no mapa; não é uma análise de todas as falas narrativas. A agenda usa dia/estação escolhidos pelo jogador, pois o relógio do DS ou emulador pode divergir do aparelho.

## Dados de Pokémon

- [PokéAPI — CSV](https://github.com/PokeAPI/pokeapi/tree/master/data/v2/csv) e [documentação](https://pokeapi.co/docs/v2): 649 espécies, movimentos do grupo de versões **11 (Black/White)**, tipos históricos da geração V e regras de evolução introduzidas até BW. A consulta é local; não depende de chamadas à API durante o uso.
- O CSV atual usa limites de amizade modernos; o gerador substitui o requisito de amizade por **220**, conforme geração V. Também usa as pedras de Pinwheel Forest/Twist Mountain e Chargestone Cave para evoluções por local, elimina formas regionais e evoluções posteriores, e explica a personalidade oculta de Wurmple.
- [Evoluções de BW](https://www.serebii.net/blackwhite/evolution.shtml), [amizade](https://bulbapedia.bulbagarden.net/wiki/Friendship) e [Wurmple](https://bulbapedia.bulbagarden.net/wiki/Wurmple).
- `scripts/build-pokemon-guide.py --csv-root <diretório>` recompila os CSVs oficiais. Os nomes ingleses podem refletir a grafia atual; métodos e níveis são filtrados para BW. Tutores e reprodução exigem condições adicionais, indicadas na interface; não há promessa de que todo golpe possa ser ensinado imediatamente.

## Referências editoriais

- [Ginásios de BW](https://www.serebii.net/blackwhite/gyms.shtml): níveis de referência e golpes perigosos; as recomendações de preparação são escolhas editoriais, não garantia de vitória.
- [Eventos diários/semanais](https://www.serebii.net/blackwhite/dailyevent.shtml), [estações](https://www.serebii.net/blackwhite/seasons.shtml), [Anville](https://bulbapedia.bulbagarden.net/wiki/Anville_Town) e [Nacrene](https://bulbapedia.bulbagarden.net/wiki/Nacrene_City).
- Serviços têm a fonte na própria ficha: Move Reminder/Deleter, avaliadores de amizade, creche, museu, Battle Subway e Draco Meteor.
- [Opelucid](https://bulbapedia.bulbagarden.net/wiki/Opelucid_City) e [Driftveil](https://bulbapedia.bulbagarden.net/wiki/Driftveil_City): compras de Poké Balls acrescentadas ao catálogo. Agora há 703 registros de itens em 53 locais.

## Persistência e uso offline

A chave `unova-black-field-guide-v2` continua igual. Campos `tasks`, `team`, `notes` e `spoilerFree` são normalizados sem apagar capturas/itens existentes; notas são texto escapado, limitadas a 1.000 caracteres e atribuídas somente a locais válidos. Equipe tem no máximo seis espécies distintas.

O service worker baixa um conjunto fechado de arquivos locais. A instalação só é concluída após todo o conjunto entrar no cache. Uma atualização aguarda as abas antigas fecharem, evitando misturar versões de scripts. Não armazena pedidos de autenticação, progresso remoto nem páginas externas. A primeira abertura com conexão é necessária. O navegador ainda pode apagar dados locais, principalmente em modo privado ou ao limpar dados do site.

## Sincronização preparada, ainda não ativada

`cloud-config.js` fica vazio até existir um projeto Supabase do proprietário. O app não envia e-mails nem dados para nuvem nessa condição. A integração usa código recebido por e-mail, RLS por `auth.uid()`, e gravação por revisão: conflitos entre aparelhos são apresentados antes de substituir qualquer jornada. O progresso local funciona independentemente do login.

O SQL e o cliente foram conferidos por testes com respostas simuladas. A autenticação real e as políticas do banco ainda precisam ser verificadas após configurar o projeto. Ver `docs/cloud-setup.md`.
