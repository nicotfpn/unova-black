/* Black2Bridge has already applied Complete Unova overrides exactly once. */
GameRegistry.register('pokemon-black2-complete-unova-1.12', () => ({
  areas: rawAreas,
  map: Black2Bridge.map,
  encounters: encounterTables,
  items: itemTables,
  chapters: walkthroughChapters,
  queries: {
    items: createItemQueries(itemTables),
    createEncounters: options => createBlack2CompleteEncounterQueries({ ...options, tables: encounterTables, conditionLabel: Black2Bridge.conditionLabel })
  }
}));
