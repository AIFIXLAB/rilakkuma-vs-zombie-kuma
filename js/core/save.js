// ===== Save System (doc PART 25, 21.5): localStorage + backup + version/migration + error handling + export/import =====
(function () {
  const KEY = 'rkz_save_v', BACKUP = 'rkz_save_backup';
  const VERSION = 2;

  function freshChar() { return { level: 1, star: 1, skill: 1, branch: -1, awakened: false, equip: null, costume: 'CS_DEFAULT' }; }
  function fresh() {
    const owned = {};
    RK.Data.startingCharacters.forEach(id => owned[id] = freshChar());
    const zOwned = {}; RK.Data.vsStartingZombies.forEach(id => zOwned[id] = true);
    const deck = RK.Data.startingCharacters.filter(id => id !== 'FACTORY');
    const names = ['Balanced Team', 'Attack Team', 'Defense Team', 'Boss Team', 'Fast Team'];
    return {
      version: VERSION, createdAt: Date.now(), updatedAt: Date.now(),
      profile: { playerId: 'P' + Math.floor(Math.random() * 1e8).toString().padStart(8, '0'), name: 'Player', level: 1, exp: 0, avatar: 'ATK_DONUT_KUMA' },
      cur: { gold: 1000, gems: 500, tickets: 5, zticket: 2, passPts: 0, eventDonut: {} },
      mats: { cookie: 20, honey: 0, recipe: 0, iron: 0, crystal: 0, rainbow: 0 },
      boosters: {}, traps: { TRAP_BANANA_PEEL: 3, TRAP_FRYING_PAN: 3 }, equipInv: {}, costumes: { CS_DEFAULT: true },
      characters: { owned, fragments: {} },
      zombies: { owned: zOwned, seen: {} },
      teams: { presets: names.map((n, i) => ({ name: n, members: i === 0 ? deck.slice() : [] })), active: 0 },
      towns: { unlocked: [1] }, stages: {}, unlockedStages: ['T1-S1'], lastStage: null, seenStory: {},
      missions: { dayKey: '', weekKey: '', daily: { p: {}, c: {} }, weekly: { p: {}, c: {} }, claimed: {} },
      achievements: {}, login: { lastDate: '', day: 0, total: 0 },
      pass: { free: [], prem: [], premium: false, season: 1 },
      gacha: { pity: {}, history: [] }, shop: { dayKey: '', daily: [], bought: {} },
      events: {}, mail: [{ id: 'welcome', title: 'ยินดีต้อนรับ!', body: 'ของขวัญเริ่มต้นจากร้านโดนัท', reward: { gems: 300, tickets: 5, gold: 2000 }, claimed: false, date: Date.now() }],
      redeemed: {}, newsRead: 0, endless: { best: 0, scores: [] }, freeGiftDay: '',
      stats: { zombiesKilled: 0, donutsCollected: 0, wins: 0, losses: 0, playTime: 0, stagesCompleted: 0 },
      counters: {},
      settings: { musicOn: true, music: 0.8, sfx: 0.8, hpBarAlways: false, damageNumbers: true, battleSpeed: 1, autoPause: true, language: 'th', graphics: 'high', vibration: true, notifications: false }
    };
  }

  // Migration table: MIGRATIONS[n] migrates version n -> n+1
  const MIGRATIONS = {
    1: d => {   // Phase 1 save -> v2: keep progress, move gold, convert deck into team preset 1
      const f = fresh();
      f.profile = Object.assign(f.profile, d.profile || {});
      f.cur.gold += d.gold || 0; f.cur.gems += d.gems || 0;
      f.towns = d.towns || f.towns; f.stages = d.stages || {}; f.unlockedStages = d.unlockedStages || f.unlockedStages; f.lastStage = d.lastStage || null;
      for (const id in ((d.characters || {}).owned || {})) if (RK.Data.characters[id]) f.characters.owned[id] = Object.assign(freshChar(), d.characters.owned[id]);
      if (d.deck) f.teams.presets[0].members = d.deck.filter(id => f.characters.owned[id]);
      f.stats = Object.assign(f.stats, d.stats || {}); f.settings = Object.assign(f.settings, d.settings || {});
      if (d.seenIntro) f.seenStory.c1i = true;
      return f;
    }
  };

  function migrate(d) {
    if (!d || typeof d !== 'object') throw new Error('bad save');
    let v = d.version || 1;
    while (v < VERSION) { if (MIGRATIONS[v]) d = MIGRATIONS[v](d); v++; d.version = v; }
    d.version = VERSION;
    const f = fresh();
    const fill = (a, b) => { for (const k in b) if (a[k] === undefined) a[k] = b[k]; else if (a[k] && b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && typeof a[k] === 'object') fill(a[k], b[k]); };
    const keepOwned = d.characters && d.characters.owned;
    fill(d, f);
    if (keepOwned) for (const id in d.characters.owned) d.characters.owned[id] = Object.assign(freshChar(), d.characters.owned[id]);
    return d;
  }

  const Save = RK.Save = {
    data: null, hasSave: false, lastError: null, VERSION,
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
        this.hasSave = true; this.lastError = null; this.lastReason = reason;
        return true;
      } catch (e) {
        this.lastError = e; console.error('Save failed', e);
        RK.UI && RK.UI.toast('บันทึกไม่สำเร็จ — ข้อมูลเดิมยังอยู่ครบ', 3);
        return false;
      }
    },
    saveSoon(reason) { if (this._t) return; this._t = setTimeout(() => { this._t = null; this.save(reason); }, 1000); },
    reset() {
      try { localStorage.removeItem(KEY); localStorage.removeItem(BACKUP); } catch (e) { }
      this.data = fresh(); this.hasSave = false; this.save('reset');
    },
    // Save code for moving progress between devices / browsers (no server needed)
    exportCode() { return btoa(unescape(encodeURIComponent(JSON.stringify(this.data)))); },
    importCode(code) {
      try { const d = migrate(JSON.parse(decodeURIComponent(escape(atob(code.trim()))))); this.data = d; this.save('import'); return true; }
      catch (e) { return false; }
    },
    isOwned(id) { return !!this.data.characters.owned[id]; },
    char(id) { return this.data.characters.owned[id]; },
    unlockCharacter(id) { if (!RK.Data.characters[id]) return false; if (!this.data.characters.owned[id]) { this.data.characters.owned[id] = freshChar(); return true; } return false; },
    get deck() { const t = this.data.teams; return t.presets[t.active].members.filter(id => this.isOwned(id)); },
    totalStars(town) {
      let s = 0; for (const k in this.data.stages) if (!town || k.startsWith('T' + town + '-')) s += (this.data.stages[k].stars || []).filter(Boolean).length;
      return s;
    },
    clearedCount(town) { let n = 0; for (const k in this.data.stages) if (k.startsWith('T' + town + '-') && this.data.stages[k].cleared) n++; return n; },
    _fresh: fresh, _migrate: migrate, _freshChar: freshChar
  };
})();
