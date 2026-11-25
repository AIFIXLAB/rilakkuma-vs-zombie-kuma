// ===== Battle core: one engine for Story / Event / Challenge / Endless / CO-OP / VS =====
// args: { stageId, deck, deck2, mode, practice, boosters:[], vs:{ bear:'human'|'cpu', zombie:'human'|'cpu', zdeck:[] } }
(function () {
  const CFG = RK.Data.config, U = RK.util, UI = RK.UI, D = RK.Data;

  const Battle = RK.Battle = {
    enter(args) {
      RK.resetUid();
      this.args = args;
      const st = this.stage = D.stages[args.stageId];
      this.mode = st.mode; this.practice = !!args.practice;
      this.map = D.maps[st.map]; this.grid = new RK.Grid(this.map); this.cols = this.map.cols; this.boardMax = this.cols + 0.35;
      this.mirror = this.mode === 'vs';
      this.scale = Object.assign({ hp: 1, atk: 1 }, st.scale || {});
      this.rules = st.rules || {};
      this.t = 0; this.speed = RK.Save.data.settings.battleSpeed || 1; this.paused = false;
      const bst = args.boosters || [];
      this.donuts = (this.rules.startingDonut || st.startingDonut || 150) + (bst.includes('BST_DONUT50') ? 75 : 0);
      this.factoryStartLevel = bst.includes('BST_FACTORY2') ? 2 : 1;
      this.baseMax = (st.baseHP || CFG.baseHP) + (bst.includes('BST_BASE') ? 400 : 0); this.baseHp = this.baseMax; this.baseShake = 0;
      this.units = []; this.zombies = []; this.projectiles = []; this.donutItems = []; this.dmgNums = []; this.effects = []; this.traps = []; this.lines = [];
      this.state = 'intro'; this.introT = 2.2; this.banner = null; this.result = null; this.popup = null; this.skillTarget = null;
      this.stats = { killed: 0, donutsCollected: 0, donutValue: 0, unitsLost: 0, unitsPlaced: 0, damageDealt: {}, gold: 0, trapsUsed: 0, trapHits: 0, bosses: 0, eventDonuts: 0, sold: 0, rotated: 0 };
      this.skill = { gauge: bst.includes('BST_SKILL') ? 3 : 0.5, lastUse: [-99, -99] };
      this.boss = null;
      // ---- players & decks ----
      const mkCards = (deck) => {
        let ids = ['FACTORY'].concat((deck || RK.Save.deck).filter(id => id !== 'FACTORY' && RK.Save.isOwned(id) && D.characters[id]));
        if (this.rules.noFactory) ids = ids.filter(id => id !== 'FACTORY');
        if (this.rules.roles) ids = ids.filter(id => this.rules.roles.includes(D.characters[id].role));
        return ids.slice(0, D.maxDeck + 1).map(id => RK.Prog.stats(id));
      };
      this.players = [];
      if (this.mode === 'coop') {
        this.players.push({ id: 0, name: 'P1', cards: mkCards(args.deck).slice(0, 6), selected: null, cd: {}, bar: 'cards', side: 'left' });
        this.players.push({ id: 1, name: 'P2', cards: mkCards(args.deck2 || args.deck).slice(0, 6), selected: null, cd: {}, bar: 'cards', side: 'right' });
      } else if (this.mode === 'vs') {
        const v = args.vs || { bear: 'human', zombie: 'human' };
        this.vs = { bearCtl: v.bear, zombieCtl: v.zombie, brain: 100, brainT: 0, zBaseMax: st.baseHP, zBase: st.baseHP, timer: 240, bossUsed: false, unitLimit: 20, zLimit: 25,
          zcards: (v.zdeck || Object.keys(RK.Save.data.zombies.owned)).filter(id => D.vsZombies[id]).slice(0, 8), zcd: {}, zselected: null };
        this.players.push({ id: 0, name: 'หมี', cards: mkCards(args.deck), selected: null, cd: {}, bar: 'cards', side: 'right' });
      } else this.players.push({ id: 0, name: 'P1', cards: mkCards(args.deck), selected: null, cd: {}, bar: 'cards', side: 'full' });
      this.players.forEach(p => p.cards.forEach(c => p.cd[c.id] = 0));
      // free challenge traps (temporary, not from the bag)
      this.trapBag = {};
      for (const k in D.traps) this.trapBag[k] = this.rules.freeTraps ? this.rules.freeTraps : (RK.Save.data.traps[k] || 0);
      this.trapFromBag = !this.rules.freeTraps;
      // ---- terrain (doc 4.4) ----
      (st.terrain || []).forEach(t => { const c = this.grid.get(t.row, t.col); if (c) { c.terrainType = t.type; if (t.type === 'Water') c.waterOnly = true; } });
      // ---- waves ----
      if (this.mode === 'endless') this.initEndless(); else if (this.mode === 'vs') this.initVS(); else this.initWaves();
      this.tutorialStep = st.tutorial && !RK.Save.data.counters.tutorialDone ? 0 : -1;
      RK.Ev.ctx = { event: this.mode === 'event' && !this.practice && RK.EventsSys.isActive(st.event) ? st.event : null };
      if (bst.length) { const sd = RK.Save.data; bst.forEach(b => { if (sd.boosters[b] > 0) sd.boosters[b]--; }); }
      if (st.mode === 'story') RK.Save.data.lastStage = st.id;
      RK.Save.save('enter-stage');
      RK.Ev.emit('play', 1); if (this.mode === 'vs' || this.mode === 'coop') RK.Ev.emit('mpPlay', 1);
      RK.Audio.play('bgmBattle');
      if (RK.BattleView) RK.BattleView.layout(this);
    },
    exit() { RK.UI.closeModal(); RK.Ev.ctx = {}; },
    onHide() { if (this.state === 'play' && RK.Save.data.settings.autoPause && !RK.UI.modal) this.openPause(); },

    // ======================= Waves (doc PART 13) =======================
    initWaves() {
      this.waves = this.stage.waves.map((w, i) => Object.assign({ index: i, started: false, spawnedAll: false, members: [] }, JSON.parse(JSON.stringify(w))));
      this.waveIdx = -1; this.waveDelay = this.waves[0].delay; this.waveElapsed = 0; this.queue = [];
      this.totalZombies = this.waves.reduce((s, w) => s + w.spawns.reduce((a, g) => a + g.count, 0), 0);
      this.spawnedCount = 0;
    },
    initEndless() {
      this.endlessWave = 0; this.waves = []; this.totalZombies = 0;
      this.pushEndlessWave(); this.waveIdx = -1; this.waveDelay = 18; this.queue = []; this.spawnedCount = 0;
    },
    pushEndlessWave() {
      const k = this.waves.length + 1, d = 4 + k * 3, unlocked = RK.Save.data.towns.unlocked;
      const pool = [], ranged = [];
      D.towns.filter(t => unlocked.includes(t.id) || t.id <= 2).forEach(t => { pool.push(...t.basic, ...(k > 3 ? t.special : [])); ranged.push(...t.ranged); });
      pool.push('EV_CHICK', 'EV_PUPPY', 'EV_CAT', 'EV_BUNNY'); if (k > 8) pool.push('EV_WOLF');
      const n = 4 + Math.floor(k * 1.3), spawns = [];
      for (let i = 0; i < n; i++) spawns.push({ enemy: pool[Math.floor(RK.RNG.next() * pool.length)], count: 1, interval: 0, lanes: 'random', at: i * Math.max(1.2, 4 - k * 0.1) });
      if (k > 1) spawns.push({ enemy: ranged[Math.floor(RK.RNG.next() * ranged.length)], count: 1 + Math.floor(k / 5), interval: 4, lanes: 'random', at: 3 });
      if (k % 10 === 0) { const T = D.towns[Math.min(7, k / 10 - 1)]; spawns.push({ enemy: T.boss, count: 1, interval: 0, lanes: [3], at: 6, boss: true }); }
      else if (k % 5 === 0) spawns.push({ enemy: D.towns[Math.floor(RK.RNG.next() * 8)].mini, count: 1, interval: 0, lanes: [3], at: 6, mini: true });
      this.waves.push({ index: k - 1, started: false, spawnedAll: false, members: [], delay: 8, timeout: 50 + k * 2, spawns, d, final: false });
      this.totalZombies += spawns.reduce((a, g) => a + g.count, 0);
    },
    waveScale(w) { if (this.mode === 'endless') { const s = D.difficulty(w.d); return { hp: s.hp, atk: s.atk }; } return this.scale; },
    startWave(i) {
      const w = this.waves[i]; w.started = true; this.waveIdx = i; this.waveElapsed = 0;
      const q = [];
      w.spawns.forEach(g => { for (let k = 0; k < g.count; k++) q.push({ t: (g.at || 0) + k * g.interval, g, k }); });
      q.sort((a, b) => a.t - b.t); this.queue = q;
      const hasBoss = w.spawns.some(g => g.boss);
      this.banner = { text: this.mode === 'endless' ? `WAVE ${i + 1}` : w.final ? 'FINAL WAVE!' : `WAVE ${i + 1}`, sub: hasBoss ? 'บอสกำลังมา!' : w.final ? 'คลื่นสุดท้าย ซอมบี้บุกหนัก!' : 'ซอมบี้กำลังมา!', t: 2.4, final: !!w.final || hasBoss };
      RK.Audio.play(w.final || hasBoss ? 'bossWarning' : 'waveWarning');
      if (this.mode === 'endless') this.pushEndlessWave();
    },
    updateWaves(dt) {
      if (this.mode === 'vs') return;
      if (this.waveIdx < 0 || this.waves[this.waveIdx].spawnedAll) {
        const cur = this.waves[this.waveIdx], next = this.waveIdx + 1;
        if (next >= this.waves.length) return;
        if (cur) { const alive = cur.members.some(z => !z.dead && !z.dying); cur.sinceStart = (cur.sinceStart || 0) + dt; if (alive && cur.sinceStart < cur.timeout) return; }
        this.waveDelay -= dt;
        if (this.waveDelay <= 0) { this.startWave(next); this.waveDelay = (this.waves[next + 1] || {}).delay || 8; }
        return;
      }
      const w = this.waves[this.waveIdx];
      this.waveElapsed += dt; w.sinceStart = this.waveElapsed;
      const lanesAll = this.stage.lanes || this.rules.lanes || Array.from({ length: this.grid.rows }, (_, i) => i + 1);
      while (this.queue.length && this.queue[0].t <= this.waveElapsed) {
        const e = this.queue.shift();
        const random = e.g.lanes === 'random' || !e.g.lanes;
        let lane = random ? RK.RNG.pick(lanesAll) : e.g.lanes[e.k % e.g.lanes.length];
        if (lane > this.grid.rows) lane = Math.ceil(this.grid.rows / 2);
        if (e.g.boss || e.g.mini) lane = Math.ceil(this.grid.rows / 2);
        const id = e.g.mini ? (D.miniBoss(e.g.enemy) || {}).id : e.g.enemy;
        const z = this.spawnZombie(id, lane - 1, { scale: this.waveScale(w) });
        if (z) w.members.push(z);
      }
      if (!this.queue.length) w.spawnedAll = true;
    },
    spawnZombie(id, r, o) {
      o = o || {};
      const def = D.enemies[id]; if (!def) { console.warn('Unknown enemy', id); return null; }
      if (this.zombies.length >= CFG.limits.maxZombies && !def.isBoss) return null;
      const z = new RK.Zombie(this, def, r, o.scale || this.scale, o);
      if (o.minion) { this.totalZombies++; }
      this.zombies.push(z); this.spawnedCount++;
      RK.Save.data.zombies.seen[def.baseId || id] = true;
      if (def.isBoss || def.miniBoss) { this.boss = z; this.banner = { text: def.isBoss ? 'BOSS!' : 'MINI BOSS!', sub: def.nameTH, t: 2.8, final: true }; RK.Audio.play('bossWarning'); }
      return z;
    },
    get zombiesRemaining() { return Math.max(0, this.totalZombies - this.stats.killed); },

    // ======================= VS (doc PART 17) =======================
    initVS() { this.waves = [{ spawns: [], members: [], started: true, spawnedAll: true }]; this.waveIdx = 0; this.totalZombies = 0; this.queue = []; this.spawnedCount = 0; },
    vsDeploy(zid, row) {
      const v = this.vs, info = D.vsZombies[zid];
      if (!info) return false;
      if (v.zcd[zid] > 0) { UI.toast('ซอมบี้ยังไม่พร้อม'); return false; }
      if (v.brain < info.brain) { UI.toast('Brain Energy ไม่พอ'); return false; }
      if (this.zombies.filter(z => !z.dying).length >= v.zLimit) { UI.toast('ซอมบี้บนสนามเต็ม'); return false; }
      if (info.boss) { if (v.bossUsed) { UI.toast('เรียกบอสได้ครั้งเดียว'); return false; } if (this.t < 90) { UI.toast(`เรียกบอสได้หลัง 1:30 (อีก ${Math.ceil(90 - this.t)} วิ)`); return false; } v.bossUsed = true; }
      v.brain -= info.brain; v.zcd[zid] = info.cd; this.totalZombies++;
      const z = this.spawnZombie(zid, info.boss ? Math.floor(this.grid.rows / 2) : row, { scale: { hp: 1, atk: 1 } });
      RK.Audio.play('zombie'); return !!z;
    },
    updateVS(dt) {
      const v = this.vs;
      v.timer -= dt; v.brainT += dt;
      if (v.brainT >= 1) { v.brainT -= 1; v.brain = Math.min(999, v.brain + 7); }
      for (const k in v.zcd) v.zcd[k] = Math.max(0, v.zcd[k] - dt);
      if (v.timer <= 0) {
        const a = this.baseHp / this.baseMax, b = v.zBase / v.zBaseMax;
        if (Math.abs(a - b) >= 0.02) this.endVS(a > b ? 'bear' : 'zombie');
        else { const bk = this.stats.killed, zk = this.stats.unitsLost * 2; this.endVS(bk === zk ? 'draw' : bk > zk ? 'bear' : 'zombie'); }   // tiebreak: kill score
      }
    },
    damageZombieBase(n) {
      if (this.mode !== 'vs' || this.state !== 'play') return;
      this.vs.zBase = Math.max(0, this.vs.zBase - n); this.vs.zShake = 0.3;
      this.addDmgText(this.ux({ row: Math.floor(this.grid.rows / 2), x: this.cols + 0.6, side: 'zombie' }), 420, '-' + Math.round(n), '#FF4B4B', 32);
      if (this.vs.zBase <= 0) this.endVS('bear');
    },

    // ======================= Queries =======================
    zombiesInRow(r) { return this.zombies.filter(z => z.row === r && !z.dying && !z.dead); },
    unitsInRow(r) { return this.units.filter(u => u.row === r && !u.dying && !u.dead); },
    blockerFor(z) {
      let best = null;
      for (const u of this.units) {
        if (u.row !== z.row || u.dying || u.dead) continue;
        if (z.x - 0.32 <= u.col + 1 && z.x >= u.col + 0.2) { if (!best || u.col > best.col) best = u; }
      }
      return best;
    },
    rangedTargetFor(z) {
      let best = null;
      for (const u of this.units) {
        if (u.row !== z.row || u.dying || u.dead) continue;
        const d = z.x - (u.col + 0.5);
        if (d > 0 && d <= z.data.range && z.x <= this.boardMax) { if (!best || u.col > best.col) best = u; }
      }
      return best;
    },
    knock(z, dist) { if (z.isBoss || z.dying) return; z.x = U.clamp(z.x + dist, this.map.baseCol + 0.1, this.map.spawnCol); },
    // screen positions (mirrored in VS)
    ux(e) { const x = this.grid.colToX(e.row, e.side === 'bear' ? e.col + 0.5 : e.x); return this.mirror ? RK.Engine.W - x : x; },
    uy(e) { return this.grid.footY(e.row) - this.grid.cellH(e.row) * 0.6 - (e.flying ? 40 : 0); },

    // ======================= Spawning =======================
    spawnProjectile(o) {
      if (this.projectiles.length >= CFG.limits.maxProjectiles) return;
      this.projectiles.push(Object.assign({ projectileId: 'P' + (this._pid = (this._pid || 0) + 1), owner: o.source ? o.source.uid : null, direction: Math.sign(o.speed),
        alive: true, hit: new Set(), lifetime: 6, age: 0 }, o));
    },
    spawnDonut(f, i, type) {
      if (this.donutItems.filter(d => !d.collected).length >= CFG.donut.maxOnField) return;
      type = type || 'normal';
      const sx = this.grid.colToX(f.row, f.col + 0.5), cx = this.mirror ? RK.Engine.W - sx : sx, fy = this.grid.footY(f.row), h = this.grid.cellH(f.row);
      this.donutItems.push({ donutId: 'D' + (this._did = (this._did || 0) + 1), value: D.donutTypes[type].value, type, x: cx, y: fy - h * 0.9,
        vx: RK.RNG.range(-90, 90) + (i - 0.5) * 60, vy: -RK.RNG.range(380, 470), groundY: U.clamp(fy - h * 0.15 + RK.RNG.range(-10, 22), this.grid.y0 + 30, this.grid.y1 - 10),
        spawnTime: this.t, expireTime: this.t + CFG.donut.lifetime, landed: false, collected: false, fly: 0 });
    },

    // ======================= Player actions =======================
    countUnits() { return this.units.filter(u => !u.dying && !u.isFactory).length; },
    canPlace(card, r, c, p) {
      const cell = this.grid.cells[r] && this.grid.cells[r][c];
      if (!cell) return { ok: false, why: 'นอกสนาม' };
      if (cell.occupied) return { ok: false, why: 'ช่องนี้มีตัวละครอยู่แล้ว' };
      if (cell.terrainType === 'Water' && (card.role === 'Producer' || card.role === 'Defender')) return { ok: false, why: 'วางเครื่องผลิต/ตัวป้องกันบนน้ำไม่ได้' };
      if (this.mode === 'vs' && c > this.cols - 4) return { ok: false, why: 'ฝั่งหมีวางได้ถึงคอลัมน์ ' + (this.cols - 3) };
      if (this.rules.maxUnits && !card.isFactory && this.countUnits() >= this.rules.maxUnits) return { ok: false, why: `ด่านนี้วางได้ไม่เกิน ${this.rules.maxUnits} ตัว` };
      if (this.mode === 'vs' && this.countUnits() >= this.vs.unitLimit) return { ok: false, why: 'ถึงจำนวนตัวละครสูงสุดแล้ว' };
      if (this.donuts < card.cost) return { ok: false, why: 'โดนัทไม่พอ' };
      if (p.cd[card.id] > 0) return { ok: false, why: 'ยังติดคูลดาวน์' };
      return { ok: true };
    },
    // Placement flow doc 4.3: check cost -> show cells -> tap -> check empty -> check rules -> deduct -> create -> set row/col -> start AI -> HP bar
    place(card, r, c, pid) {
      const p = this.players[pid || 0];
      const chk = this.canPlace(card, r, c, p);
      if (!chk.ok) { UI.toast(chk.why); return null; }
      this.donuts -= card.cost;                       // single-threaded deduction: shared CO-OP pool can't be charged twice
      const u = new RK.Unit(this, card, r, c, p.id);
      this.units.push(u);
      const cell = this.grid.cells[r][c]; cell.occupied = true; cell.unitId = u.uid;
      p.cd[card.id] = card.cooldown;
      this.stats.unitsPlaced++; u.showHpT = 2;
      this.fx('place', u); RK.Audio.play('unitPlace');
      RK.Ev.emit('placeUnit', 1); if (card.role === 'Defender') RK.Ev.emit('placeDefender', 1);
      if (this.tutorialStep === 0 && card.isFactory) this.tutorialStep = 1;
      if (this.tutorialStep === 2 && card.role === 'Attacker') { this.tutorialStep = 3; RK.Save.data.counters.tutorialDone = 1; }
      return u;
    },
    sellValue(u) { let v = u.spent * 0.5; if (u.isFactory) for (let l = 2; l <= u.level; l++) v += CFG.factoryLevels[l].upgradeCost * 0.5; return Math.floor(v * Math.max(0.3, u.hp / u.maxHp) / 5) * 5; },
    // Sell a unit to free its cell (requested feature)
    sell(u) {
      if (!u || u.dying) return 0;
      const v = this.sellValue(u); this.donuts += v;
      u.dying = 0.3; u.sold = true; const cell = this.grid.cells[u.row][u.col]; cell.occupied = false; cell.unitId = null;
      this.addDmgText(this.ux(u), this.uy(u) - 40, '+' + v, '#FFE14D', 32); this.fx('collect', u);
      this.stats.sold++; RK.Ev.emit('sell', 1); RK.Audio.play('donutCollect');
      return v;
    },
    // Turn a unit left/right so it can hit zombies that slipped past (requested feature)
    rotate(u) {
      if (!u || u.dying || u.isFactory) return;
      u.facing *= -1; u.atkTimer = Math.min(u.atkTimer, 0.3); u.anim.spawn = 0.2; this.stats.rotated++;
      if (u.facing < 0 && this.zombies.some(z => z.row === u.row && z.x < u.x && !z.dying)) RK.Ev.emit('rotate', 1);
    },
    placeTrap(id, r, c) {
      const def = D.traps[id], cell = this.grid.cells[r] && this.grid.cells[r][c];
      if (!cell) return null;
      if (!(this.trapBag[id] > 0)) { UI.toast('ไม่มีกับดักนี้ในกระเป๋า — ซื้อได้ที่ร้านกับดัก'); return null; }
      if (cell.trapId) { UI.toast('ช่องนี้มีกับดักแล้ว'); return null; }
      if (this.traps.filter(t => t.alive && t.id === id).length >= def.maxPlacement) { UI.toast(`วาง ${def.nameTH} ได้สูงสุด ${def.maxPlacement} อัน`); return null; }
      if (this.donuts < def.cost) { UI.toast(`โดนัทไม่พอ (ต้องใช้ ${def.cost})`); return null; }
      this.donuts -= def.cost; this.trapBag[id]--;
      if (this.trapFromBag) RK.Save.data.traps[id] = Math.max(0, (RK.Save.data.traps[id] || 0) - 1);
      const t = new RK.Trap(this, def, r, c); this.traps.push(t); cell.trapId = t.uid;
      this.stats.trapsUsed++; RK.Ev.emit('trapUse', 1); this.fx('place', t); RK.Audio.play('unitPlace');
      return t;
    },
    collectDonut(d) {
      if (d.collected) return false;                 // guards double-tap
      d.collected = true; d.fly = 0.45; d.fromX = d.x; d.fromY = d.y;
      this.donuts += d.value; this.stats.donutsCollected++; this.stats.donutValue += d.value;
      if (d.type === 'rainbow') this.skill.gauge = Math.min(3, this.skill.gauge + 0.35);
      if (d.type === 'event') { this.stats.eventDonuts += 1; RK.Ev.emit('eventDonutPick', 1); }
      RK.Ev.emit('donut', 1); RK.Save.saveSoon('donut');
      this.addDmgText(d.x, d.y - 30, '+' + d.value, d.type === 'golden' ? '#FFD700' : d.type === 'rainbow' ? '#FF7FE0' : '#FFE14D', 34);
      this.fx('collect', null, d.x, d.y); RK.Audio.play('donutCollect');
      if (this.tutorialStep === 1) this.tutorialStep = 2;
      return true;
    },
    upgradeFactory(u) {
      const next = CFG.factoryLevels[u.level + 1];
      if (!next) return false;
      if (this.donuts < next.upgradeCost) { UI.toast('โดนัทไม่พอสำหรับอัปเกรด'); return false; }
      this.donuts -= next.upgradeCost; u.level++; u.spent += 0;
      u.prodTimer = Math.min(u.prodTimer, next.productionTime); u.maxHp += 80; u.hp += 80;
      this.fx('upgrade', u); RK.Audio.play('upgrade'); UI.toast(`อัปเกรดเครื่องเป็น Lv.${u.level}!`);
      return true;
    },
    // ---- team skills (doc 16 Skill Buttons) ----
    useSkill(key, row, pid) {
      if (this.skill.gauge < 1) { UI.toast('เกจสกิลยังไม่เต็ม'); return false; }
      const combo = this.mode === 'coop' && this.t - this.skill.lastUse[1 - (pid || 0)] < 3;
      this.skill.gauge -= 1; this.skill.lastUse[pid || 0] = this.t;
      const m = combo ? 1.6 : 1;
      if (combo) this.banner = { text: 'COMBO SKILL!', sub: 'สองคนใช้สกิลพร้อมกัน ×1.6', t: 2, final: false };
      if (key === 'STRIKE') { this.zombies.filter(z => z.row === row && !z.dying).forEach(z => RK.Combat.applyDamage(this, z, 220 * m * Math.max(1, this.scale.hp * 0.7), { type: 'heavy', ignoreDef: true })); for (let c = 0; c < this.cols; c++) this.fx('explode', { row, x: c + 0.5, side: 'zombie' }); }
      if (key === 'FREEZE') this.zombies.forEach(z => RK.Combat.addStatus(z, { type: 'freeze', strength: 1, duration: 4 * m }));
      if (key === 'HEAL') { this.units.forEach(u => { u.hp = Math.min(u.maxHp, u.hp + u.maxHp * 0.4 * m); this.fx('heal', u); }); this.baseHp = Math.min(this.baseMax, this.baseHp + 150 * m); }
      RK.Audio.play('skill'); RK.Ev.emit('skillUse', 1);
      return true;
    },
    damageBase(amount, src) {
      if (this.state !== 'play') return;
      this.baseHp = Math.max(0, this.baseHp - amount); this.baseShake = 0.3; this.baseHitT = this.t;
      const x = this.mirror ? RK.Engine.W - 210 : 210;
      this.addDmgText(x + RK.RNG.range(-30, 30), 420, '-' + Math.round(amount), '#FF4B4B', 34);
      if (navigator.vibrate && RK.Save.data.settings.vibration) try { navigator.vibrate(40); } catch (e) { }
      if (this.baseHp <= 0) { if (this.mode === 'vs') this.endVS('zombie'); else this.lose(); }
    },
    kill(e, src) {
      if (e.dying || e.dead) return;                  // prevents double death (doc 11.5)
      e.dying = 0.55; e.hp = 0;
      if (e.side === 'zombie') {
        this.stats.killed++; this.stats.gold += (e.data.reward && e.data.reward.gold) || 0;
        this.skill.gauge = Math.min(3, this.skill.gauge + (e.isBoss ? 1 : 0.04));
        RK.Ev.emit('kill', 1);
        if (e.isBoss) { RK.Ev.emit('killBoss', 1); this.stats.bosses++; }
        if (e === this.boss) this.boss = null;
        const d = e.data;
        if (d.explode) { this.units.filter(u => !u.dying && Math.abs(u.row - e.row) <= Math.floor(d.explode.radius) && Math.abs(u.x - e.x) <= d.explode.radius).forEach(u => RK.Combat.applyDamage(this, u, d.explode.dmg * this.scale.atk, { type: 'heavy', status: d.explode.status })); this.fx('explode', e); }
        if (d.split) for (let i = 0; i < d.split.count; i++) { const rr = U.clamp(e.row + (i % 3) - 1, 0, this.grid.rows - 1); this.spawnZombie(d.split.enemy, rr, { x: e.x + 0.2, minion: true, scale: this.scale }); }
        if (d.reward && d.reward.donut) this.spawnDonut({ row: e.row, col: Math.max(0, Math.min(this.cols - 1, Math.floor(e.x))) }, 0, 'normal');
        if (this.mode === 'vs') this.vs.brain += 0;
        RK.Save.saveSoon('kill');
      } else {
        this.stats.unitsLost++;
        const cell = this.grid.cells[e.row][e.col]; cell.occupied = false; cell.unitId = null;
        if (this.mode === 'vs') this.vs.brain = Math.min(999, this.vs.brain + 25);
        if (this.popup && this.popup.u === e) this.popup = null;
      }
      this.fx('death', e);
    },
    // ---- boss skills (doc 13.4) ----
    bossPhase(z, ph) { this.banner = { text: `PHASE ${ph + 1}`, sub: `${z.data.nameTH} โกรธจัด!`, t: 2, final: true }; z.speedBuff = 2; RK.Audio.play('bossWarning'); },
    bossSkill(z, sk) {
      const B = z.data.boss, rows = this.grid.rows; this.fx('roar', z); z.anim.attack = 0.5;
      switch (sk) {
        case 'stomp': this.units.filter(u => Math.abs(u.row - z.row) <= 1 && Math.abs(u.x - z.x) <= 2.5).forEach(u => { RK.Combat.addStatus(u, { type: 'stun', strength: 1, duration: 2 }); RK.Combat.applyDamage(this, u, z.atk * 0.4, { type: 'heavy' }); }); this.shake = 0.4; break;
        case 'summon': for (let i = 0; i < 2 + Math.floor(z.boss.phase); i++) this.spawnZombie(B.summon || 'ZOM_NORMAL', U.clamp(z.row + (i % 3) - 1, 0, rows - 1), { x: z.x + 0.4, minion: true, scale: this.scale }); break;
        case 'roar': this.zombies.forEach(o => o.speedBuff = 4); break;
        case 'slam': this.units.filter(u => Math.abs(u.row - z.row) <= 1 && u.x >= z.x - 3).forEach(u => RK.Combat.applyDamage(this, u, z.atk * 0.8, { type: 'heavy' })); this.shake = 0.4; break;
        case 'freeze': { const r = Math.floor(RK.RNG.next() * rows); this.units.filter(u => u.row === r).forEach(u => RK.Combat.addStatus(u, { type: 'freeze', strength: 1, duration: 3 })); this.fxRow(r, 'ice'); break; }
        case 'fireRain': for (let i = 0; i < 5; i++) { const r = Math.floor(RK.RNG.next() * rows), c = Math.floor(RK.RNG.next() * this.cols); this.fx('explode', { row: r, x: c + 0.5, side: 'zombie' }); this.units.filter(u => u.row === r && u.col === c).forEach(u => RK.Combat.applyDamage(this, u, z.atk * 0.6, { type: 'heavy', status: B.rainType === 'poison' ? { type: 'poison', strength: 6, duration: 4 } : { type: 'burn', strength: 6, duration: 3 } })); } break;
        case 'shield': z.shieldHp = Math.max(z.shieldHp, z.maxHp * 0.15); z.maxShield = Math.max(z.maxShield, z.shieldHp); z.shieldReduction = 0; this.fx('shield', z); break;
        case 'heal': z.hp = Math.min(z.maxHp, z.hp + z.maxHp * 0.08); this.fx('heal', z); break;
      }
    },

    // ======================= Update =======================
    update(dt) {
      this.updateMusic();
      if (this.banner) { this.banner.t -= dt; if (this.banner.t <= 0) this.banner = null; }
      if (this.result) { this.result.t += dt; return; }
      if (this.paused || RK.UI.modal) return;
      if (this.state === 'intro') { this.introT -= dt; if (this.introT <= 0) this.state = 'play'; return; }
      for (let i = 0; i < this.speed; i++) this.sim(dt);
    },
    updateMusic() {
      const M = RK.Music; if (!M) return;
      M.duck(!!RK.UI.modal || this.paused);
      if (this.result || this.state !== 'play') return;
      const w = this.waves[this.waveIdx];
      if (((w && w.final) || this.boss) && M.mood !== 'final') M.start('final');
      const alive = this.zombies.filter(z => !z.dying).length;
      M.setIntensity(this.waveIdx < 0 && this.mode !== 'vs' ? 0 : alive === 0 ? 1 : alive < 5 ? 2 : 3);
    },
    sim(dt) {
      if (this.state !== 'play') return;
      this.t += dt;
      this.players.forEach(p => { for (const k in p.cd) p.cd[k] = Math.max(0, p.cd[k] - dt); });
      this.skill.gauge = Math.min(3, this.skill.gauge + dt * 0.006);
      if (this.mode === 'vs') { this.updateVS(dt); RK.AI && RK.AI.tick(this, dt); }
      this.updateWaves(dt);
      // support auras (attack speed buff)
      this.units.forEach(u => u.buffAS = 0);
      this.units.forEach(s => { const sp = s.data.support; if (sp && sp.type === 'buffAS' && !s.dying) s.neighbors(this, sp.radius).forEach(u => u.buffAS = Math.max(u.buffAS, sp.amount)); });
      for (const u of this.units) if (!u.dying) { RK.Combat.tickStatus(this, u, dt); if (!u.dying) u.update(this, dt); if (u.shieldHp <= 0) u.maxShield = 0; }
      for (const z of this.zombies) if (!z.dying) { RK.Combat.tickStatus(this, z, dt); if (!z.dying) z.update(this, dt); }
      for (const t of this.traps) t.update(this, dt);
      this.traps = this.traps.filter(t => { if (!t.alive) { const c = this.grid.cells[t.row][t.col]; if (c.trapId === t.uid) c.trapId = null; } return t.alive || (t.fade = (t.fade || 0.5) - dt) > 0; });
      this.updateProjectiles(dt);
      this.updateDonuts(dt);
      for (const e of this.units.concat(this.zombies)) if (e.dying) { e.dying -= dt; if (e.dying <= 0) e.dead = true; }
      this.units = this.units.filter(e => !e.dead); this.zombies = this.zombies.filter(e => !e.dead);
      this.baseShake = Math.max(0, this.baseShake - dt); this.shake = Math.max(0, (this.shake || 0) - dt);
      if (this.vs) this.vs.zShake = Math.max(0, (this.vs.zShake || 0) - dt);
      for (const n of this.dmgNums) n.t += dt; this.dmgNums = this.dmgNums.filter(n => n.t < n.max);
      for (const f of this.effects) f.t += dt; this.effects = this.effects.filter(f => f.t < f.max);
      for (const l of this.lines) l.t += dt; this.lines = this.lines.filter(l => l.t < 0.2);
      if (this.mode !== 'vs' && this.mode !== 'endless') {
        const last = this.waves[this.waves.length - 1];
        if (last.started && last.spawnedAll && this.zombies.length === 0) this.win();
        // anti-stalemate: 75 s after the final wave is out, leftover zombies grow stronger every 20 s
        if (last.started && last.spawnedAll && this.zombies.length) {
          this.enrageT = (this.enrageT || 0) + dt;
          if (this.enrageT > 75 && Math.floor((this.enrageT - 75) / 20) + 1 > (this.enrage || 0)) {
            this.enrage = (this.enrage || 0) + 1;
            this.zombies.forEach(z => { z.atk *= 1.5; z.speedBuff = 99; z.status = {}; });
            this.banner = { text: 'ซอมบี้คลั่ง!', sub: 'ซอมบี้ที่เหลือแรงขึ้นเรื่อย ๆ — รีบจัดการ!', t: 2, final: true };
          }
        }
      }
    },
    updateProjectiles(dt) {
      for (const p of this.projectiles) {
        if (!p.alive) continue;
        p.age += dt; p.x += p.speed * dt;
        if (p.age > p.lifetime) { p.alive = false; continue; }
        if (p.side === 'bear') {
          if (Math.abs(p.x - p.startX) > p.range || p.x > this.cols + 1 || p.x < -1) {
            if (this.mode === 'vs' && p.x > this.cols + 0.3 && p.speed > 0) this.damageZombieBase(p.damage * 0.5);
            p.alive = false; continue;
          }
          if (p.lob) { if ((p.targetX != null && (p.x - p.targetX) * Math.sign(p.speed) >= 0)) { this.lobLand(p); p.alive = false; } continue; }
          for (const z of this.zombiesInRow(p.row)) {
            if (p.hit.has(z.uid) || !z.targetable) continue;
            if (z.flying && !p.hitsAir) continue;
            if (p.x >= z.x - 0.3 && p.x <= z.x + 0.6) {
              p.hit.add(z.uid);
              if (p.splash) { this.splash(p, z); }
              else { RK.Combat.applyDamage(this, z, p.damage, { type: p.type, canCrit: true, crit: p.crit, status: p.status, ignoreDef: p.ignoreDef, projectile: true, source: p.source, antiAir: p.antiAir }); if (p.knock) this.knock(z, p.knock * Math.sign(p.speed)); this.fx('hit', z); }
              if (p.pattern !== 'piercing') { p.alive = false; break; }
            }
          }
        } else {
          if (p.toBase && p.x <= this.map.baseCol + 0.2) { this.damageBase(p.damage, p.source); this.fx('hit', null, this.mirror ? RK.Engine.W - 230 : 230, 430); p.alive = false; continue; }
          for (const u of this.unitsInRow(p.row)) {
            if (p.x <= u.col + 0.75 && p.x >= u.col + 0.05) {
              RK.Combat.applyDamage(this, u, p.damage, { type: p.type, status: p.status, projectile: true, source: p.source, ignoreDef: p.ignoreDef });
              this.fx('hit', u); p.alive = false; break;
            }
          }
          if (p.x < this.map.baseCol - 1) p.alive = false;
        }
      }
      this.projectiles = this.projectiles.filter(p => p.alive);
    },
    splash(p, z) {
      const R = p.splash;
      this.zombies.filter(o => !o.dying && !o.burrowed && (o.row === p.row && Math.abs(o.x - z.x) <= R || Math.abs(o.row - p.row) === 1 && Math.abs(o.x - z.x) <= R * 0.5))
        .forEach(o => RK.Combat.applyDamage(this, o, o === z ? p.damage : p.damage * 0.6, { type: p.type, canCrit: true, crit: p.crit, status: p.status, ignoreDef: p.ignoreDef, projectile: true, source: p.source }));
      this.fx('explode', z);
    },
    lobLand(p) {
      const near = this.zombiesInRow(p.row).filter(z => !z.flying && !z.burrowed && Math.abs(z.x - p.x) <= Math.max(0.6, p.splash)).sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x))[0];
      if (near) this.splash(p, near); else this.fx('explode', { row: p.row, x: p.x, side: 'zombie' });
    },
    updateDonuts(dt) {
      for (const d of this.donutItems) {
        if (d.collected) { d.fly -= dt; continue; }
        if (!d.landed) { d.vy += 1500 * dt; d.x += d.vx * dt; d.y += d.vy * dt; if (d.vy > 0 && d.y >= d.groundY) { d.y = d.groundY; if (d.vy > 260) { d.vy = -d.vy * 0.32; d.vx *= 0.5; } else d.landed = true; } }
        if (this.t >= d.expireTime) d.expired = true;
      }
      this.donutItems = this.donutItems.filter(d => !(d.expired && !d.collected) && !(d.collected && d.fly <= 0));
    },

    // ======================= Win / Lose / Rewards (doc PART 20) =======================
    evalStars() {
      return this.stage.stars.map(s => {
        switch (s.type) {
          case 'clear': return true;
          case 'baseHpAbove': return this.baseHp / this.baseMax >= s.value;
          case 'collectDonuts': return this.stats.donutsCollected >= s.value;
          case 'maxUnitsLost': return this.stats.unitsLost <= s.value;
          case 'noUnitLost': return this.stats.unitsLost === 0;
          case 'maxUnits': return this.stats.unitsPlaced <= s.value;
          case 'timeUnder': return this.t <= s.value;
          case 'noTrap': return this.stats.trapsUsed === 0;
          default: return false;
        }
      });
    },
    win() {
      if (this.state !== 'play') return;
      this.state = 'won';
      const sd = RK.Save.data, st = this.stage, stars = this.evalStars(), reward = st.reward || {};
      const key = st.id, rec = sd.stages[key] || (sd.stages[key] = { cleared: false, stars: [false, false, false], plays: 0, bestTime: null });
      const firstClear = !rec.cleared, had3 = rec.stars.every(Boolean);
      rec.cleared = true; rec.plays++; rec.stars = rec.stars.map((v, i) => v || stars[i]);
      rec.bestTime = rec.bestTime == null ? Math.round(this.t) : Math.min(rec.bestTime, Math.round(this.t));
      const g = {}, practice = this.practice;
      g.gold = Math.round((firstClear ? reward.gold : reward.gold * 0.3) + this.stats.gold);
      g.exp = firstClear ? reward.exp : Math.round(reward.exp * 0.5);
      if (firstClear && reward.gems) g.gems = reward.gems;
      if (!had3 && rec.stars.every(Boolean)) g.gems = (g.gems || 0) + 30;
      if (reward.fragments) g.fragments = firstClear ? reward.fragments : Math.ceil(reward.fragments / 2);
      if (reward.materials) Object.assign(g, reward.materials);
      if (firstClear && reward.unlock) g.unlock = reward.unlock;
      if (st.mode === 'event' && !practice && RK.EventsSys.isActive(st.event)) { g.eventDonut = reward.eventDonut + this.stats.eventDonuts * 5; RK.EventsSys.state(st.event).stages[st.id] = true; }
      if (practice) { for (const k in g) if (k !== 'exp') delete g[k]; g.gold = 50; }
      const got = RK.Eco.grant(g, { event: st.event });
      sd.stats.wins++; if (firstClear && st.mode === 'story') sd.stats.stagesCompleted++;
      RK.Ev.emit('clear', 1);
      if (st.mode === 'challenge') RK.Ev.emit('challengeClear', firstClear ? 1 : 0);
      if (st.mode === 'coop') RK.Ev.emit('coopWin', 1);
      // unlock next stage / town
      let nextId = null, story = null;
      if (st.mode === 'story') {
        nextId = st.number < D.stagesPerTown ? `T${st.town}-S${st.number + 1}` : (st.town < 8 ? `T${st.town + 1}-S1` : null);
        if (nextId && !sd.unlockedStages.includes(nextId)) sd.unlockedStages.push(nextId);
        if (st.number === D.stagesPerTown && st.town < 8 && !sd.towns.unlocked.includes(st.town + 1)) sd.towns.unlocked.push(st.town + 1);
        if (st.number === D.stagesPerTown && !sd.seenStory['c' + st.town + 'o']) story = { chapter: st.town, part: 'outro' };
      }
      if (st.mode === 'event') { const ev = D.events.find(e => e.id === st.event); const i = ev.stages.indexOf(st.id); nextId = ev.stages[i + 1] || null; }
      if (st.mode === 'challenge') { const i = D.challenges.indexOf(st.id); nextId = D.challenges[i + 1] || null; }
      const ok = RK.Save.save('stage-clear');
      this.result = { win: true, stars, got, t: 0, saved: ok, nextId, time: this.t, surviving: this.units.filter(u => !u.dying).length, firstClear, story };
      RK.Audio.play('victory');
    },
    lose() {
      if (this.state !== 'play') return;
      this.state = 'lost';
      const sd = RK.Save.data;
      let got = [];
      if (this.mode === 'endless') {
        const wave = Math.max(0, this.waveIdx + 1);
        sd.endless.best = Math.max(sd.endless.best, wave);
        sd.endless.scores.push({ wave, kills: this.stats.killed, date: RK.Time.dayKey(), name: sd.profile.name }); sd.endless.scores.sort((a, b) => b.wave - a.wave || b.kills - a.kills); sd.endless.scores = sd.endless.scores.slice(0, 10);
        got = RK.Eco.grant({ gold: wave * 80 + this.stats.gold, exp: wave * 6, gems: Math.floor(wave / 5) * 10 });
        RK.Ev.emit('endlessWave', wave);
      } else sd.stats.losses++;
      RK.Save.save('stage-lose');
      this.result = { win: false, endless: this.mode === 'endless', wave: this.waveIdx + 1, got, t: 0, time: this.t };
      RK.Audio.play('defeat');
    },
    endVS(winner) {
      if (this.state !== 'play') return;
      this.state = 'ended';
      const v = this.vs, human = v.bearCtl === 'human' && v.zombieCtl === 'cpu' ? 'bear' : v.zombieCtl === 'human' && v.bearCtl === 'cpu' ? 'zombie' : null;
      let got = [];
      if (human && winner === human) { got = RK.Eco.grant({ gold: 300, exp: 40, zticket: 1 }); RK.Ev.emit('vsWin', 1); RK.Save.data.stats.wins++; }
      else if (!human && winner !== 'draw') { got = RK.Eco.grant({ gold: 150, exp: 20 }); RK.Ev.emit('vsWin', 1); }
      RK.Save.save('vs-end');
      this.result = { win: winner !== 'draw' && (!human || winner === human), vs: true, winner, got, t: 0, time: this.t };
      RK.Audio.play(winner === 'draw' ? 'defeat' : 'victory');
    },

    // ======================= Effects =======================
    fx(type, e, x, y) {
      if (e) { x = this.ux(e); y = this.uy(e); }
      const max = { death: 0.6, place: 0.5, collect: 0.5, hit: 0.3, slash: 0.25, spray: 0.45, wind: 0.5, explode: 0.45, upgrade: 0.9, break: 0.5, heal: 0.6, shield: 0.6, beam: 0.2, trap: 0.5, roll: 0.8, roar: 0.8, summon: 0.6, jump: 0.5, dirt: 0.6 }[type] || 0.4;
      if (this.effects.length > 160) this.effects.shift();
      this.effects.push({ type, x, y, t: 0, max, row: e ? e.row : null, dir: e && e.facing ? e.facing * (this.mirror ? -1 : 1) : 1 });
    },
    fxRow(r, type) { for (let c = 0; c < this.cols; c++) this.fx(type === 'ice' ? 'shield' : 'explode', { row: r, x: c + 0.5, side: 'zombie' }); },
    fxLine(a, b) { this.lines.push({ x1: this.ux(a), y1: this.uy(a), x2: this.ux(b), y2: this.uy(b), t: 0 }); },
    damageNumber(target, dmg, type) {
      if (!RK.Save.data.settings.damageNumbers) return;
      const x = this.ux(target) + RK.RNG.range(-18, 18), y = this.uy(target) - this.grid.cellH(target.row) * 0.55;
      this.addDmgText(x, y, String(Math.round(dmg)), RK.Combat.COLORS[type] || '#fff', type === 'crit' || type === 'heavy' ? 36 : 28);
    },
    addDmgText(x, y, text, color, size) {
      if (this.dmgNums.length >= CFG.limits.maxDamageNumbers) this.dmgNums.shift();
      this.dmgNums.push({ x, y, text, color, size: size || 28, t: 0, max: 0.9 });
    },
    restart() { RK.Engine.setScene(Battle, this.args); },
    openPause() {
      if (this.result || RK.UI.modal) return;
      RK.Audio.play('buttonClick');
      const back = this.mode === 'story' ? () => RK.Engine.setScene(RK.Scenes.stageSelect, { town: this.stage.town }) : () => RK.Engine.setScene(RK.Scenes.lobby);
      const items = [['เล่นต่อ (Resume)', 'green', null], ['เริ่มใหม่ (Restart)', 'yellow', () => this.restart()],
        ['ตั้งค่า (Settings)', 'blue', () => RK.Scenes.openSettings(() => this.openPause())], ['ออก (Exit)', 'red', back]];
      UI.openModal({ title: 'หยุดเกม', w: 640, h: 560, lines: [`${this.stage.name}`], customButtons: true,
        draw: (ctx, b) => { UI.modal._btns = items.map((it, i) => ({ label: it[0], color: it[1], action: it[2], forcePill: true, x: b.x + (b.w - 400) / 2, y: b.y + 130 + i * 96, w: 400, h: 80, size: 30 })); } });
    }
  };
})();
