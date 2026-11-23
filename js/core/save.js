// ===== Save System (doc PART 25, 21.5): localStorage + backup + version/migration + error handling =====
(function () {
  const KEY = 'rkz_save_v', BACKUP = 'rkz_save_backup';
  const VERSION = RK.Data.config.saveVersion;

  function fresh() {
    const owned = {};
    RK.Data.startingCharacters.forEach(id => owned[id] = { level: 1, star: 1 });
    return {
      version: VERSION,
      createdAt: Date.now(), updatedAt: Date.now(),
      profile: { playerId: 'P' + Math.floor(Math.random() * 1e8).toString().padStart(8, '0'), name: 'Player', level: 1, exp: 0 },
      gold: 0, gems: 0, materials: {},
      towns: { unlocked: [1] },
      stages: {},                       // 'T1-S1': { cleared, stars:[b,b,b], bestTime, plays }
      unlockedStages: ['T1-S1'],
      characters: { owned },
      deck: RK.Data.startingCharacters.filter(id => id !== 'FACTORY'),
      stats: { zombiesKilled: 0, donutsCollected: 0, wins: 0, losses: 0, playTime: 0, stagesCompleted: 0 },
      settings: { musicOn: true, music: 0.8, sfx: 0.8, hpBarAlways: false, damageNumbers: true, battleSpeed: 1, autoPause: true, language: 'th' },
      lastStage: null
    };
  }

  // Migration table: index n migrates version n -> n+1
  const MIGRATIONS = {
    // 1: d => { d.newField = ...; return d; }
  };

  function migrate(d) {
    if (!d || typeof d !== 'object') throw new Error('bad save');
    let v = d.version || 0;
    if (v === 0) { d = Object.assign(fresh(), d); v = 1; }
    while (v < VERSION) { if (MIGRATIONS[v]) d = MIGRATIONS[v](d); v++; }
    d.version = VERSION;
    // fill any new default fields
    const f = fresh();
    for (const k in f) if (d[k] === undefined) d[k] = f[k];
    for (const k in f.settings) if (d.settings[k] === undefined) d.settings[k] = f.settings[k];
    for (const k in f.stats) if (d.stats[k] === undefined) d.stats[k] = f.stats[k];
    return d;
  }

  const Save = RK.Save = {
    data: null, hasSave: false, lastError: null,
    load() {
      let raw = null;
      try { raw = localStorage.getItem(KEY); } catch (e) { this.lastError = e; }
      if (raw) {
        try { this.data = migrate(JSON.parse(raw)); this.hasSave = true; return this.data; }
        catch (e) {
          console.warn('Main save corrupt, trying backup', e);
          try { const b = localStorage.getItem(BACKUP); if (b) { this.data = migrate(JSON.parse(b)); this.hasSave = true; RK.UI && RK.UI.toast('โหลดข้อมูลสำรองแทน (ไฟล์หลักเสียหาย)'); return this.data; } } catch (e2) { }
        }
      }
      this.data = fresh(); this.hasSave = false;
      return this.data;
    },
    // Writes immediately. Keeps previous good save as backup. Never deletes old data on failure.
    save(reason) {
      if (!this.data) return false;
      try {
        this.data.updatedAt = Date.now();
        const json = JSON.stringify(this.data);
        const prev = localStorage.getItem(KEY);
        if (prev) localStorage.setItem(BACKUP, prev);
        localStorage.setItem(KEY, json);
        this.hasSave = true; this.lastError = null;
        this.lastReason = reason;
        return true;
      } catch (e) {
        this.lastError = e;
        console.error('Save failed', e);
        RK.UI && RK.UI.toast('บันทึกไม่สำเร็จ — ข้อมูลเดิมยังอยู่ครบ', 3);
        return false;
      }
    },
    // throttled save for frequent events (e.g. donut pickup)
    saveSoon(reason) {
      if (this._t) return;
      this._t = setTimeout(() => { this._t = null; this.save(reason); }, 1000);
    },
    reset() {
      try { localStorage.removeItem(KEY); localStorage.removeItem(BACKUP); } catch (e) { }
      this.data = fresh(); this.hasSave = false; this.save('reset');
    },
    isOwned(id) { return !!this.data.characters.owned[id]; },
    unlockCharacter(id) { if (!this.data.characters.owned[id]) { this.data.characters.owned[id] = { level: 1, star: 1 }; return true; } return false; },
    totalStars(town) {
      let s = 0; for (const k in this.data.stages) if (!town || k.startsWith('T' + town + '-')) s += (this.data.stages[k].stars || []).filter(Boolean).length;
      return s;
    },
    clearedCount(town) { let n = 0; for (const k in this.data.stages) if (k.startsWith('T' + town + '-') && this.data.stages[k].cleared) n++; return n; },
    _fresh: fresh, _migrate: migrate
  };
})();
