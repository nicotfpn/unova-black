/* Editorial para Pokémon Black; fontes em docs/adventure-audit.md. */
const adventureData={
  "services": [
    {
      "area": "mis",
      "name": "Relembrar golpes",
      "text": "Na casa a leste do Pokémon Center, converse com a garota. Ela cobra uma Heart Scale por golpe. Os golpes disponíveis dependem da espécie e do nível.",
      "source": "https://bulbapedia.bulbagarden.net/wiki/Move_Reminder"
    },
    {
      "area": "mis",
      "name": "Apagar golpes e HMs",
      "text": "Na mesma casa do Move Reminder, o homem pode apagar golpes, inclusive HMs.",
      "source": "https://bulbapedia.bulbagarden.net/wiki/Move_Deleter"
    },
    {
      "area": "nac",
      "name": "Avaliar amizade",
      "text": "Converse com a avaliadora no prédio a leste do Pokémon Center. A fala indica uma faixa de amizade, não um número exato.",
      "source": "https://bulbapedia.bulbagarden.net/wiki/Friendship_rating"
    },
    {
      "area": "ici",
      "name": "Avaliar amizade",
      "text": "No Pokémon Fan Club, converse com a avaliadora para saber como seu Pokémon se sente.",
      "source": "https://bulbapedia.bulbagarden.net/wiki/Friendship_rating"
    },
    {
      "area": "r3",
      "name": "Creche e reprodução",
      "text": "Deixe Pokémon na creche da Rota 3. A opção de deixar dois e obter ovos é liberada mais adiante na história. Ao retirar, você paga pelos níveis ganhos.",
      "source": "https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_Day_Care"
    },
    {
      "area": "nac",
      "name": "Reviver fósseis",
      "text": "Leve seu fóssil ao museu de Nacrene. Cover Fossil vira Tirtouga e Plume Fossil vira Archen.",
      "source": "https://bulbapedia.bulbagarden.net/wiki/Nacrene_Museum"
    },
    {
      "area": "nim",
      "name": "Battle Subway e BP",
      "text": "A Gear Station abriga o Battle Subway. Ganhe Battle Points nas batalhas e use-os para comprar itens e TMs.",
      "source": "https://bulbapedia.bulbagarden.net/wiki/Battle_Subway"
    },
    {
      "area": "ope",
      "name": "Aprender Draco Meteor",
      "text": "Em Black, Iris ensina Draco Meteor em Opelucid a um Pokémon do tipo Dragão com amizade máxima.",
      "source": "https://bulbapedia.bulbagarden.net/wiki/Draco_Meteor_(move)"
    }
  ],
  "gyms": [
    {
      "area": "str",
      "leader": "Cilan / Chili / Cress",
      "type": "Depende do inicial",
      "ace": 14,
      "advice": "O líder usa o macaco forte contra seu inicial. O presente no Dreamyard ajuda a cobrir essa fraqueza. Work Up aumenta o poder dos ataques: evite deixar o adversário acumular turnos livres.",
      "picks": [
        "Panpour",
        "Pansage",
        "Pansear"
      ]
    },
    {
      "area": "nac",
      "leader": "Lenora",
      "type": "Normal",
      "ace": 20,
      "advice": "Retaliate fica mais forte no turno depois que um aliado do usuário é derrotado. Planeje quem enfrenta Watchog e tenha uma resposta para Hypnosis. Pokémon Lutadores são úteis, mas confira os golpes que realmente conhecem.",
      "picks": [
        "Timburr",
        "Sawk",
        "Throh"
      ]
    },
    {
      "area": "cas",
      "leader": "Burgh",
      "type": "Inseto",
      "ace": 23,
      "advice": "Leavanny também é do tipo Planta. Golpes de Fogo ou Voador ajudam; Dwebble tem Smack Down, então não dependa de um único Voador para toda a luta.",
      "picks": [
        "Darumaka",
        "Pidove",
        "Pansear"
      ]
    },
    {
      "area": "nim",
      "leader": "Elesa",
      "type": "Elétrico",
      "ace": 27,
      "advice": "Emolga é Elétrico/Voador: golpes de Terra não acertam normalmente. Volt Switch troca o adversário após atacar. Golpes de Pedra ajudam contra Emolga; Terra ajuda contra Zebstrika.",
      "picks": [
        "Roggenrola",
        "Sandile",
        "Drilbur"
      ]
    },
    {
      "area": "dri",
      "leader": "Clay",
      "type": "Terra",
      "ace": 31,
      "advice": "Palpitoad também é Água e é muito vulnerável a Planta. Excadrill pode usar Hone Claws e Rock Slide: preserve uma resposta para ele. Água, Planta e Lutador são opções, conforme o adversário.",
      "picks": [
        "Oshawott",
        "Tympole",
        "Cottonee",
        "Petilil",
        "Timburr"
      ]
    },
    {
      "area": "mis",
      "leader": "Skyla",
      "type": "Voador",
      "ace": 35,
      "advice": "Golpes Elétricos ajudam especialmente contra Swanna, que também é Água. Confira se seu Pokémon conhece um golpe ofensivo desse tipo; conhecer apenas movimentos de apoio não resolve a luta.",
      "picks": [
        "Joltik",
        "Blitzle",
        "Tynamo",
        "Roggenrola"
      ]
    },
    {
      "area": "ici",
      "leader": "Brycen",
      "type": "Gelo",
      "ace": 39,
      "advice": "Fogo, Lutador e Pedra podem ajudar. Beartic tem Brine, que exige cuidado com Pokémon de Fogo já enfraquecidos. Cryogonal tem Levitate, então golpes de Terra normalmente não o acertam.",
      "picks": [
        "Darumaka",
        "Litwick",
        "Timburr",
        "Sawk"
      ]
    },
    {
      "area": "ope",
      "leader": "Drayden",
      "type": "Dragão",
      "ace": 43,
      "advice": "Haxorus pode aumentar Ataque e Velocidade com Dragon Dance. Golpes de Gelo ou Dragão ajudam; Dragões próprios também sofrem dano superefetivo. Em Black não existe o tipo Fada.",
      "picks": [
        "Vanillite",
        "Cubchoo",
        "Axew"
      ]
    }
  ],
  "tasks": [
    [
      {
        "id": "chapter-0-0",
        "area": "nu",
        "text": "Escolher o inicial"
      },
      {
        "id": "chapter-0-1",
        "area": "dream",
        "text": "Receber o Pokémon de presente"
      },
      {
        "id": "chapter-0-2",
        "area": "str",
        "text": "Vencer o primeiro ginásio"
      }
    ],
    [
      {
        "id": "chapter-1-0",
        "area": "well",
        "text": "Resolver o acontecimento em Wellspring Cave"
      },
      {
        "id": "chapter-1-1",
        "area": "nac",
        "text": "Vencer Lenora"
      },
      {
        "id": "chapter-1-2",
        "area": "pin",
        "text": "Explorar a parte externa da floresta"
      }
    ],
    [
      {
        "id": "chapter-2-0",
        "area": "pin",
        "text": "Concluir os acontecimentos na floresta"
      },
      {
        "id": "chapter-2-1",
        "area": "cas",
        "text": "Resolver os acontecimentos com Burgh"
      },
      {
        "id": "chapter-2-2",
        "area": "cas",
        "text": "Vencer Burgh"
      }
    ],
    [
      {
        "id": "chapter-3-0",
        "area": "rel",
        "text": "Escolher um fóssil (opcional)"
      },
      {
        "id": "chapter-3-1",
        "area": "nac",
        "text": "Reviver o fóssil escolhido (opcional)"
      },
      {
        "id": "chapter-3-2",
        "area": "nim",
        "text": "Vencer Elesa"
      }
    ],
    [
      {
        "id": "chapter-4-0",
        "area": "draw",
        "text": "Atravessar a ponte"
      },
      {
        "id": "chapter-4-1",
        "area": "cold",
        "text": "Resolver os acontecimentos em Cold Storage"
      },
      {
        "id": "chapter-4-2",
        "area": "dri",
        "text": "Vencer Clay"
      }
    ],
    [
      {
        "id": "chapter-5-0",
        "area": "charge",
        "text": "Atravessar Chargestone Cave"
      },
      {
        "id": "chapter-5-1",
        "area": "ct",
        "text": "Visitar Skyla e tocar o sino"
      },
      {
        "id": "chapter-5-2",
        "area": "mis",
        "text": "Vencer Skyla"
      }
    ],
    [
      {
        "id": "chapter-6-0",
        "area": "tw",
        "text": "Atravessar Twist Mountain"
      },
      {
        "id": "chapter-6-1",
        "area": "ici",
        "text": "Vencer Brycen"
      },
      {
        "id": "chapter-6-2",
        "area": "dt",
        "text": "Continuar a história na torre"
      }
    ],
    [
      {
        "id": "chapter-7-0",
        "area": "rel",
        "text": "Voltar ao Relic Castle pela história"
      },
      {
        "id": "chapter-7-1",
        "area": "nac",
        "text": "Voltar ao museu pela história"
      },
      {
        "id": "chapter-7-2",
        "area": "ope",
        "text": "Vencer Drayden"
      }
    ],
    [
      {
        "id": "chapter-8-0",
        "area": "vr",
        "text": "Atravessar Victory Road"
      },
      {
        "id": "chapter-8-1",
        "area": "league",
        "text": "Enfrentar a Elite Four"
      },
      {
        "id": "chapter-8-2",
        "area": "castle",
        "text": "Concluir a história principal"
      }
    ],
    [
      {
        "id": "chapter-9-0",
        "area": "nu",
        "text": "Receber a Super Rod de Looker"
      },
      {
        "id": "chapter-9-1",
        "area": "und",
        "text": "Explorar o leste de Unova"
      },
      {
        "id": "chapter-9-2",
        "area": "chasm",
        "text": "Visitar Giant Chasm (opcional)"
      }
    ],
    [
      {
        "id": "chapter-10-0",
        "area": "r17",
        "text": "Explorar as correntes com Surf"
      },
      {
        "id": "chapter-10-1",
        "area": "r18",
        "text": "Receber o ovo de Larvesta (opcional)"
      },
      {
        "id": "chapter-10-2",
        "area": "p2",
        "text": "Visitar P2 Laboratory (opcional)"
      }
    ]
  ],
  "agenda": [
    {
      "area": "dream",
      "title": "Musharna no porão",
      "days": [
        5
      ],
      "post": true,
      "text": "Às sextas-feiras, após concluir a história. É um encontro fixo, diferente da grama que se mexe."
    },
    {
      "area": "cas",
      "title": "Comprar Casteliacone",
      "days": [
        2
      ],
      "seasons": [
        "Spring",
        "Summer",
        "Autumn"
      ],
      "text": "Às terças-feiras, fora do inverno, na barraca de Slim Street. Custa ₽100."
    },
    {
      "area": "anv",
      "title": "Trocas do fim de semana",
      "days": [
        0,
        6
      ],
      "text": "No sábado e domingo, visitantes oferecem trocas de itens, exceto nos dias em que o Worker fala sobre o Hyperspeed Train. Chegue pelo trem de Nimbasa."
    },
    {
      "area": "nac",
      "title": "Soda Pop no café",
      "days": [
        3
      ],
      "text": "Às quartas-feiras, converse com a garçonete para receber uma Soda Pop."
    },
    {
      "area": "r6",
      "title": "Formas sazonais de Deerling",
      "days": [
        0,
        1,
        2,
        3,
        4,
        5,
        6
      ],
      "text": "A forma selvagem de Deerling acompanha a estação do jogo. Consulte a estação antes de procurar."
    },
    {
      "area": "r1",
      "title": "Enxame do dia",
      "days": [
        0,
        1,
        2,
        3,
        4,
        5,
        6
      ],
      "post": true,
      "text": "Após a história, consulte o painel das passagens para saber qual rota tem enxame. A rota anunciada varia; este atalho abre a Rota 1 como exemplo."
    }
  ]
};
