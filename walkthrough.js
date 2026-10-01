/* Roteiro editorial para Pokémon Black original. */
const walkthroughChapters = [
  {
    "title": "Primeiros passos",
    "when": "Até a 1ª insígnia",
    "path": [
      "nu",
      "r1",
      "acc",
      "r2",
      "str"
    ],
    "text": "Escolha seu inicial e aprenda a capturar na Rota 1. Em Striaton, visite o Dreamyard antes de enfrentar o ginásio.",
    "optional": [
      "dream"
    ]
  },
  {
    "title": "A caminho de Nacrene",
    "when": "Até a 2ª insígnia",
    "path": [
      "r3",
      "well",
      "nac"
    ],
    "text": "Siga pela Rota 3 e acompanhe os acontecimentos em Wellspring Cave. Em Nacrene, o ginásio fica no museu.",
    "optional": [
      "pin"
    ]
  },
  {
    "title": "Atravessando a floresta",
    "when": "Até a 3ª insígnia",
    "path": [
      "pin",
      "sky",
      "cas"
    ],
    "text": "Depois do ginásio de Nacrene, explore o interior de Pinwheel Forest. Atravesse Skyarrow Bridge para chegar a Castelia e ao ginásio de Burgh.",
    "optional": []
  },
  {
    "title": "Do deserto a Nimbasa",
    "when": "Até a 4ª insígnia",
    "path": [
      "r4",
      "nim"
    ],
    "text": "A Rota 4 leva a Nimbasa. Antes de seguir, você pode explorar o deserto e escolher um fóssil no Relic Castle.",
    "optional": [
      "des",
      "rel",
      "r16",
      "lost",
      "anv"
    ]
  },
  {
    "title": "Pela ponte até Driftveil",
    "when": "Até a 5ª insígnia",
    "path": [
      "r5",
      "draw",
      "dri",
      "cold"
    ],
    "text": "Após vencer Elesa, siga pela Rota 5 e atravesse a ponte. Em Driftveil, resolva os acontecimentos em Cold Storage antes do ginásio de Clay.",
    "optional": []
  },
  {
    "title": "A torre antes do ginásio",
    "when": "Até a 6ª insígnia",
    "path": [
      "r6",
      "charge",
      "mis",
      "r7",
      "ct"
    ],
    "text": "Atravesse Chargestone Cave até Mistralton. Siga pela Rota 7, visite Celestial Tower e depois volte para enfrentar Skyla.",
    "optional": [
      "mc"
    ]
  },
  {
    "title": "Entre montanhas e torres",
    "when": "Até a 7ª insígnia",
    "path": [
      "tw",
      "ici",
      "dt"
    ],
    "text": "Twist Mountain leva a Icirrus. Após o ginásio de Brycen, a história continua em Dragonspiral Tower.",
    "optional": [
      "moor"
    ]
  },
  {
    "title": "A última insígnia",
    "when": "Até a 8ª insígnia",
    "path": [
      "r8",
      "tube",
      "r9",
      "ope"
    ],
    "text": "Depois de Dragonspiral Tower, a história pede uma volta ao Relic Castle e ao museu de Nacrene. Em seguida, continue até Opelucid pela Rota 8, Tubeline Bridge e Rota 9.",
    "optional": []
  },
  {
    "title": "Rumo à Liga",
    "when": "Com 8 insígnias",
    "path": [
      "r10",
      "vr",
      "league",
      "castle"
    ],
    "text": "Prepare sua equipe, atravesse Victory Road e enfrente a Elite Four. O desfecho da história continua no Castelo de N.",
    "optional": []
  },
  {
    "title": "Explore o que ficou para depois",
    "when": "Após concluir a história",
    "path": [
      "r11",
      "vb",
      "r12",
      "lac",
      "r13",
      "und",
      "bay",
      "r14",
      "black",
      "r15",
      "marv"
    ],
    "text": "Volte a Nuvema para receber a Super Rod de Looker. O leste de Unova reúne novos encontros e caminhos para explorar no seu ritmo.",
    "optional": [
      "chasm",
      "ruins",
      "ab",
      "challenger"
    ]
  },
  {
    "title": "Desvio pelas ilhas",
    "when": "Quando tiver Surf",
    "path": [
      "r17",
      "r18",
      "p2"
    ],
    "text": "Volte à Rota 1 e use Surf para alcançar a Rota 17. As correntes levam à Rota 18; confira a ficha de cada local antes de explorar. Não é necessário para concluir a história.",
    "optional": []
  }
];

const walkthroughSteps = {
  "nu": "Escolha Snivy, Tepig ou Oshawott e visite o laboratório de Juniper. Depois, siga com seus amigos para a Rota 1. Você só recebe um inicial nesta partida.",
  "r1": "Caminhe pela grama para encontrar seus primeiros Pokémon. Patrat e Lillipup são opções para começar a equipe. Os encontros na água ficam para uma visita futura, quando você tiver Surf ou a vara de pesca.",
  "acc": "Acompanhe os acontecimentos na praça e explore a cidade. Depois, continue pela Rota 2 em direção a Striaton.",
  "r2": "Procure Pokémon na grama enquanto avança para Striaton. Confira os itens ao longo do caminho; alguns trechos só podem ser explorados quando você voltar com novos recursos.",
  "str": "Visite o Dreamyard antes do ginásio: uma personagem oferece um Pokémon que ajuda contra o líder. Depois da primeira insígnia, volte ao Dreamyard para continuar a história.",
  "dream": "Converse com a personagem que oferece Pansage, Pansear ou Panpour. Após o primeiro ginásio, use Cut para entrar na parte bloqueada. Confira os requisitos dos encontros: parte do local só abre depois da história principal.",
  "r3": "Siga pela rota e acompanhe Cheren quando a história levar você a Wellspring Cave. Depois, continue para Nacrene. A creche também fica nesta rota.",
  "well": "Entre com Cheren para resolver o acontecimento da história. No piso da caverna aparecem Pokémon; as nuvens de poeira têm outra lista e também podem dar itens. Explore os trechos com água quando tiver Surf.",
  "nac": "O museu abriga o ginásio de Lenora. Depois de vencer, siga os acontecimentos que levam a Pinwheel Forest. Mais adiante, volte ao museu para reviver o fóssil escolhido no Relic Castle.",
  "pin": "A parte externa e o interior da floresta têm encontros diferentes. Depois do ginásio de Nacrene, acompanhe a história no interior e siga para Skyarrow Bridge. Virizion exige uma visita posterior, após encontrar Cobalion.",
  "sky": "Atravesse a ponte para chegar a Castelia. Aqui, a visita faz parte do caminho entre cidades; não há uma lista de encontros selvagens comuns.",
  "cas": "Explore as ruas e acompanhe os acontecimentos com Burgh antes de enfrentar seu ginásio. Depois da terceira insígnia, a viagem continua pela Rota 4.",
  "r4": "Os encontros do deserto acontecem na areia. Siga para Nimbasa ou faça um desvio até Desert Resort. Os encontros aquáticos da ficha exigem voltar com Surf ou Super Rod.",
  "des": "Explore a areia e a entrada do Relic Castle. Os Darmanitan em forma de estátua não são encontros aleatórios: confira o item necessário na seção de encontros especiais.",
  "rel": "Na primeira visita, escolha um dos fósseis e leve-o ao museu de Nacrene para reviver. A história traz você de volta mais tarde. As salas profundas e Volcarona têm requisitos próprios; não tente completar tudo agora.",
  "nim": "Explore a cidade e enfrente o ginásio de Elesa. Depois da quarta insígnia, siga pela Rota 5. Rota 16 e Lostlorn Forest são visitas extras próximas.",
  "r5": "Continue os acontecimentos da história e siga para Driftveil Drawbridge. Antes de atravessar, procure Pokémon na grama e confira os itens da rota.",
  "draw": "Atravesse até Driftveil. Se aparecer uma sombra no chão, caminhe sobre ela: você pode encontrar Ducklett ou receber uma Wing. Confira a lista de encontros para não confundir o método com grama comum.",
  "dri": "Visite Cold Storage e resolva os acontecimentos com a Equipe Plasma antes do ginásio de Clay. Depois da quinta insígnia, siga pela Rota 6.",
  "cold": "Explore a área e entre no armazém para continuar a história. Há encontros na grama externa; o interior do armazém não usa a mesma lista.",
  "r6": "Siga em direção a Chargestone Cave. Para explorar Mistralton Cave, volte com Surf e Strength: a entrada desse desvio fica na Rota 6, não em Mistralton City.",
  "charge": "Atravesse a caverna para chegar a Mistralton. Os encontros no chão e nas nuvens de poeira são separados. Confira cada grupo para saber onde procurar a espécie que você quer.",
  "mis": "Antes do ginásio de Skyla, saia pela Rota 7 e visite Celestial Tower. Depois da visita à torre, volte à cidade para enfrentar o ginásio.",
  "r7": "Siga até Celestial Tower antes de enfrentar Skyla. Os encontros ficam na grama; confira também os itens recebidos de personagens ao longo do caminho.",
  "ct": "Suba até o topo para encontrar Skyla e tocar o sino. Aproveite os andares a partir do 2º para procurar Litwick e confira em quais andares Elgyem aparece. Pegue as TMs indicadas na ficha e volte a Mistralton para o ginásio.",
  "mc": "Este é um desvio opcional a partir da Rota 6. Use Surf para chegar à entrada e Strength no interior. Confira os encontros de Axew e as condições para encontrar Cobalion.",
  "tw": "Atravesse a montanha para chegar a Icirrus. A neve altera os caminhos no inverno; confira a estação indicada nos grupos de encontros antes de procurar Pokémon.",
  "ici": "Explore a cidade e enfrente Brycen. Depois da sétima insígnia, siga os acontecimentos em Dragonspiral Tower. Algumas áreas de água e gelo mudam com a estação.",
  "dt": "Continue a história na torre após o ginásio de Icirrus. Depois dessa visita, a jornada leva de volta ao Relic Castle e ao museu de Nacrene antes de continuar rumo a Opelucid.",
  "r8": "Depois das visitas pedidas pela história ao Relic Castle e a Nacrene, siga pela Rota 8 até Tubeline Bridge. Confira a estação: o inverno muda os trechos alagados.",
  "tube": "Atravesse a ponte até a Rota 9 e converse com os personagens para conferir os presentes. É uma passagem da história, sem encontros selvagens comuns.",
  "r9": "Siga até Opelucid. Você pode explorar a grama e o Shopping Mall Nine no caminho; a ficha de itens separa o que é encontrado do que precisa ser comprado.",
  "ope": "Em Black, enfrente Drayden para conquistar a oitava insígnia. Depois, siga para a Rota 10 e prepare sua equipe para Victory Road.",
  "r10": "Avance até os portões de acesso a Victory Road. Confira Pokémon e itens antes de seguir; esta rota faz parte do caminho da história principal.",
  "vr": "Atravesse a caverna rumo à Liga. Confira o setor de cada encontro: o interior, a área externa e os fenômenos têm listas distintas. Terrakion é um encontro especial com requisito próprio.",
  "league": "Prepare a equipe e os itens antes de enfrentar a Elite Four. A primeira passagem pela Liga leva ao Castelo de N; vencer Ghetsis conclui a história principal.",
  "castle": "Continue o desfecho da história. Reshiram é o lendário encontrado em Pokémon Black; confira sua entrada em encontros especiais. Após concluir a história, marque esse avanço em “Minha jornada”."
};
