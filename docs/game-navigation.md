# Continuar a jornada e trocar de jogo

Escolha aprovada pelo usuário: abrir diretamente a última jornada, com **Trocar jogo** no topo. O catálogo não aparece automaticamente. O usuário escolheu Pokémon Platinum oficial como primeiro jogo novo.

`core/game-picker.js` consulta somente os metadados do registro. Monta a janela ao abrir e remove seu DOM ao fechar. Não carrega dados de outro jogo. Cada página carrega seu próprio adaptador, como antes.

O catálogo mostra apenas edições com `status: 'usable'`, indicação de oficial ou ROM hack e cobertura dos recursos. Hoje são Black, Black 2 · Complete Unova v1.12 e Platinum (Sinnoh e Battle Zone, história e pós-jogo). O status permite oferecer conteúdo parcial utilizável; não é um selo de conteúdo completo. Entradas planejadas não geram links nem páginas vazias.

Escolher a edição atual fecha a janela e mantém a aba e a ficha abertas. Escolher a outra edição segue a URL existente. O seletor usa links normais, preservando abertura em outra aba com teclas modificadoras. O botão de fechar, Escape e o clique no fundo fecham a janela; o foco retorna ao botão que a abriu. Tab e Shift+Tab permanecem nos controles da janela.

## Preferência e progresso

Somente `unova-last-game` é lido/escrito como preferência de edição. Ao carregar uma página ou escolher outra edição, o valor legado continua sendo `black`, `black2` ou `platinum`.

A entrada principal já respeitava essa preferência, e mantém seu comportamento. `index.html?game=black` é uma escolha explícita e impede redirecionamento de volta à hack. Sem acesso a localStorage, a página atual e os links continuam utilizáveis, embora a preferência não seja garantida na próxima abertura.

O seletor não lê nem escreve as chaves de jornada, não migra os dados e não cria uma partida nova. As notas, capturas, passos e aliases antigos pertencem aos módulos já existentes. O domínio não mudou.

## Validação

- 64 testes Node: dados, consultas, persistência, geração, cache simulado e retomada pela URL/preferência.
- Smoke DOM de Black/Black 2 e alternância/reabertura das duas jornadas continuam aprovados.
- `tests/game-picker-dom.cjs`: montagem sob demanda, oficial/hack e cobertura, exclusão de entrada planejada, foco, Escape, reabertura, preferência, URLs e registros de jornada intactos. Exercita o caminho nativo com API simulada e o fallback sem showModal; não equivale a testar um diálogo nativo real.
- Pokédex escondida permanece com zero nós; marcadores mantêm identidade. Nós iniciais: Black 1579 → 1582, hack 1868 → 1871; três elementos adicionais por página (dois acionadores responsivos e um script). Sets/escritas innerHTML continuam 71/8 e 343/7.

```sh
node --test tests/*.test.cjs
node tests/game-picker-dom.cjs
```

O teste DOM exige jsdom como ferramenta de desenvolvimento, sem dependência de produção. Não houve medição de RAM nem conferência de pixels, largura real ou foco nativo em Safari/iPhone. O CSS segue as cores e os controles existentes; o botão tem área mínima de 44 px, e a janela tem largura e altura limitadas ao viewport. A revisão visual em navegador real continua pendente antes de publicar.

Este PR depende do #24 enquanto ele estiver aberto. Nenhum merge ou deploy foi realizado. Seleção do piloto, jornadas múltiplas, carregamento das funcionalidades sob demanda e cache seletivo permanecem etapas próprias.

Platinum usa `platinum.html` e `sinnoh-platinum-field-guide-v1`. A entrada principal retoma Platinum quando escolhido; a URL explícita de Black continua prevalecendo. Ver detalhes e limites em [platinum-audit.md](platinum-audit.md).
