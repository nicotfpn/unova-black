/* Edition metadata only. Registering an adapter never loads another game's data. */
(function (root) {
  'use strict';
  const freeze = value => {
    if (value && typeof value === 'object') {
      Object.values(value).forEach(freeze);
      Object.freeze(value);
    }
    return value;
  };
  const editions = freeze([
    {
      id: 'pokemon-black', gameId: 'black', regionIds: ['unova'], generation: 5,
      kind: 'official', status: 'usable', title: 'Pokémon Black', entry: 'index.html?game=black',
      adapter: 'packages/black/adapter.js',
      progress: { key: 'unova-black-field-guide-v2', legacyGame: 'black' },
      coverage: {
        map: 'available', encounters: 'partial', items: 'partial', pokedex: 'available',
        walkthrough: 'outline', battles: 'partial', offline: 'shared-bundle',
        notes: ['Roteiro de etapas, sem detonado detalhado.', 'Eventos antigos e exclusivos têm condições próprias; nenhuma auditoria integral contra a ROM.']
      },
      sources: ['docs/map-audit.md', 'docs/items-audit.md', 'docs/adventure-audit.md'],
      audit: { codeRevision: 'c7cea1bc162be9e4e33a00e0c2f76515cc5400cd', inspectedOn: '2026-10-08', contentVerification: 'partial' }
    },
    {
      id: 'pokemon-black2-complete-unova-1.12', gameId: 'black-2', regionIds: ['unova'], generation: 5,
      kind: 'hack', status: 'usable', title: 'Pokémon Black 2 · Complete Unova Pokédex Edition v1.12',
      hack: { id: 'complete-unova', version: '1.12', detailedSourcesVersion: '1.11', baseGameId: 'black-2' },
      entry: 'black2.html', adapter: 'packages/black2-complete/adapter.js',
      progress: { key: 'unova-black2-complete-1.12-v1', legacyGame: 'black2' },
      coverage: {
        map: 'available', encounters: 'partial', items: 'partial', pokedex: 'available',
        walkthrough: 'partial', battles: 'advice-only', offline: 'shared-bundle',
        notes: ['22 capítulos; itens comuns e times da hack sem auditoria integral.', 'Documentação detalhada v1.11 com regras v1.12; valores desconhecidos continuam ausentes.']
      },
      sources: ['docs/black2-audit.md'],
      audit: { codeRevision: 'c7cea1bc162be9e4e33a00e0c2f76515cc5400cd', inspectedOn: '2026-10-08', contentVerification: 'partial' }
    }
  ]);
  const byId = new Map(editions.map(edition => [edition.id, edition]));
  const adapters = new Map();
  function get(id) {
    const edition = byId.get(id);
    if (!edition) throw new Error('Edição desconhecida: ' + id);
    return edition;
  }
  function register(id, factory) {
    get(id);
    if (typeof factory !== 'function' || adapters.has(id)) throw new Error('Adaptador inválido ou duplicado: ' + id);
    adapters.set(id, factory);
  }
  function open(id) {
    const edition = get(id), factory = adapters.get(id);
    if (!factory) throw new Error('Pacote não carregado: ' + id);
    const data = factory();
    if (!Array.isArray(data.areas) || !data.map || !data.encounters || !data.items || !Array.isArray(data.chapters) || typeof data.queries?.items?.forArea !== 'function' || typeof data.queries?.createEncounters !== 'function') {
      throw new Error('Pacote incompatível: ' + id);
    }
    // Legacy data remains mutable for the existing UI and hack pipeline.
    return Object.freeze({ ...data, edition });
  }
  root.GameRegistry = Object.freeze({ list: () => editions, get, register, open });
})(typeof window === 'undefined' ? globalThis : window);
