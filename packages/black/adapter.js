/* Compatibility boundary: keep legacy IDs, data and script order unchanged. */
GameRegistry.register('pokemon-black', () => ({
  areas: rawAreas,
  map: UnovaMap,
  encounters: encounterTables,
  items: itemTables,
  chapters: walkthroughChapters
}));
