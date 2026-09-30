/* Local progress: compatible localStorage record plus an IndexedDB recovery copy. */
(function (root) {
  'use strict';
  root.createProgressStore = function ({ key, normalize, onStatus, onExternal }) {
    let db = null, revision = 0, queue = Promise.resolve(), latest = null, persistRequested = false;
    const emit = (state, text) => onStatus?.({ state, text });
    const parse = value => {
      try {
        const record = typeof value === 'string' ? JSON.parse(value) : value;
        if (!record || !Array.isArray(record.caught)) return null;
        return { data: normalize(record), revision: Number.isFinite(record._savedAt) ? record._savedAt : 0 };
      } catch { return null; }
    };
    const readLocal = () => {
      try { return parse(root.localStorage.getItem(key)); } catch { return null; }
    };
    const writeLocal = record => {
      try {
        const value = JSON.stringify(record);
        root.localStorage.setItem(key, value);
        return root.localStorage.getItem(key) === value;
      } catch { return false; }
    };
    function openDatabase() {
      return new Promise(resolve => {
        if (!root.indexedDB) return resolve(null);
        let settled = false;
        const finish = value => { if (!settled) { settled = true; clearTimeout(timer); resolve(value); } else value?.close(); };
        const timer = setTimeout(() => finish(null), 1500);
        try {
          const request = root.indexedDB.open('unova-black-progress', 1);
          request.onupgradeneeded = () => {
            if (!request.result.objectStoreNames.contains('journeys')) request.result.createObjectStore('journeys');
          };
          request.onsuccess = () => finish(request.result);
          request.onerror = request.onblocked = () => finish(null);
        } catch { finish(null); }
      });
    }
    function databaseRequest(mode, record) {
      return new Promise((resolve, reject) => {
        if (!db) return reject(new Error('Storage unavailable'));
        try {
          const tx = db.transaction('journeys', mode), store = tx.objectStore('journeys');
          const request = mode === 'readonly' ? store.get(key) : store.put(record, key);
          tx.oncomplete = () => resolve(request.result);
          tx.onerror = tx.onabort = () => reject(tx.error || new Error('Storage failed'));
        } catch (error) { reject(error); }
      });
    }
    function protectStorage() {
      if (persistRequested) return;
      persistRequested = true;
      try { root.navigator?.storage?.persist?.().catch(() => {}); } catch {}
    }
    async function load() {
      const local = readLocal();
      db = await openDatabase();
      if (db) db.onversionchange = () => { db.close(); db = null; };
      let backup = null;
      try { backup = parse(await databaseRequest('readonly')); } catch {}
      const selected = backup && (!local || backup.revision > local.revision) ? backup : local;
      if (selected) {
        revision = selected.revision;
        latest = { ...selected.data, _savedAt: revision };
        const localOK = writeLocal(latest);
        let backupOK = false;
        try { await databaseRequest('readwrite', latest); backupOK = true; } catch {}
        emit(localOK || backupOK ? 'saved' : 'error', localOK || backupOK ? 'Jornada restaurada · salvamento automático' : 'Não foi possível salvar neste navegador. Seus próximos registros podem se perder ao fechar.');
        return selected.data;
      }
      // Check write access without creating or overwriting a journey.
      let localOK = false;
      try {
        const probe = key + '-check';
        root.localStorage.setItem(probe, '1');
        localOK = root.localStorage.getItem(probe) === '1';
        root.localStorage.removeItem(probe);
      } catch {}
      emit(localOK || db ? 'ready' : 'error', localOK || db ? 'Salvamento automático neste aparelho' : 'Salvamento indisponível. Use uma aba normal e permita os dados deste site.');
      return null;
    }
    function save(data) {
      revision = Math.max(Date.now(), revision + 1);
      const record = { ...normalize(data), _savedAt: revision };
      latest = record;
      const localOK = writeLocal(record);
      emit('saving', 'Salvando sua jornada…');
      protectStorage();
      const pending = queue.then(async () => {
        let backupOK = false;
        try { await databaseRequest('readwrite', record); backupOK = true; } catch {}
        if (revision === record._savedAt) {
          emit(localOK || backupOK ? 'saved' : 'error', localOK || backupOK ? 'Salvo neste aparelho · automaticamente' : 'Não foi possível salvar. Seus registros estão só nesta aba e podem se perder ao fechar.');
        }
        return localOK || backupOK;
      });
      queue = pending.catch(() => false);
      return pending;
    }
    root.addEventListener?.('storage', event => {
      if (event.key !== key || !event.newValue) return;
      const record = parse(event.newValue);
      if (!record || record.revision <= revision) return;
      revision = record.revision;
      latest = { ...record.data, _savedAt: revision };
      onExternal?.(record.data);
      emit('saved', 'Jornada atualizada por outra aba');
    });
    // Flush the synchronous copy again when the app goes into the background.
    root.document?.addEventListener('visibilitychange', () => {
      if (root.document.visibilityState === 'hidden' && latest) writeLocal(latest);
    });
    return { load, save };
  };
})(typeof window === 'undefined' ? globalThis : window);
