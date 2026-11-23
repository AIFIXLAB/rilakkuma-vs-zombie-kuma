// ===== Battle Scene (Story Mode) =====
(function () {
  const CFG = RK.Data.config, U = RK.util, UI = RK.UI, A = RK.Assets;

  const HUD = {
    donut: { x: 14, y: 12, w: 262, h: 92 }, base: { x: 288, y: 12, w: 340, h: 92 }, wave: { x: 640, y: 12, w: 470, h: 92 },
    speed: { x: 1440, y: 14, w: 100, h: 86 }, pause: { x: 1556, y: 14, w: 100, h: 86 }, cardY: 776, cardW: 140, cardH: 154, cardGap: 10
  };

  const Battle = RK.Battle = {
    HUD,
    enter(args) {
      RK.resetUid();
      const st = this.stage = RK.Data.stages[args.stageId];
      this.map = RK.Data.maps[st.map];
      this.grid = new RK.Grid(this.map);
      this.t = 0; this.speed = RK.Save.data.settings.battleSpeed || 1; this.paused = false;
      this.donuts = st.startingDonut != null ? st.startingDonut : 100;
      this.baseMax = st.baseHP || CFG.baseHP; this.baseHp = this.baseMax; this.baseShake = 0;
      this.units = []; this.zombies = []; this.projectiles = []; this.donutItems = []; this.dmgNums = []; this.effects = [];
      this.cooldowns = {}; this.selected = null; this.state = 'intro'; this.introT = 2.2; this.banner = null; this.result = null;
      this.stats = { killed: 0, donutsCollected: 0, donutValue: 0, unitsLost: 0, unitsPlaced: 0, damageDealt: {}, gold: 0 };
      const deck = (args.deck || RK.Save.data.deck).filter(id => RK.Save.isOwned(id) && RK.Data.characters[id]);
      this.cards = ['FACTORY'].concat(deck.filter(id => id !== 'FACTORY').slice(0, RK.Data.maxDeck)).map(id => RK.Data.characters[id]);
      this.cards.forEach(c => this.cooldowns[c.id] = 0);
      this.initWaves();
      this.tutorialStep = st.tutorial ? 0 : -1;
      this.donutPlaced = 0;
      RK.Save.data.lastStage = st.id; RK.Save.save('enter-stage');
      RK.Audio.play('bgmBattle');
    },
    exit() { RK.UI.closeModal(); },
    onHide() { if (this.state === 'play' && RK.Save.data.settings.autoPause && !RK.UI.modal) this.openPause(); },

    // ---------------- Waves (doc PART 13) ----------------
    initWaves() {
      this.waves = this.stage.waves.map((w, i) => Object.assign({ index: i, started: false, spawnedAll: false, members: [] }, w));
      this.waveIdx = -1; this.waveDelay = this.waves[0].delay; this.waveElapsed = 0; this.queue = [];
      this.totalZombies = this.waves.reduce((s, w) => s + w.spawns.reduce((a, g) => a + g.count, 0), 0);
      this.spawnedCount = 0;
    },
    startWave(i) {
      const w = this.waves[i]; w.started = true; this.waveIdx = i; this.waveElapsed = 0;
      const q = [];
      w.spawns.forEach(g => { for (let k = 0; k < g.count; k++) q.push({ t: (g.at || 0) + k * g.interval, g, k }); });
      q.sort((a, b) => a.t - b.t); this.queue = q;
      this.banner = { text: w.final ? 'FINAL WAVE!' : `WAVE ${i + 1}`, sub: w.final ? 'คลื่นสุดท้าย ซอมบี้บุกหนัก!' : 'ซอมบี้กำลังมา!', t: 2.4, final: !!w.final };
      RK.Audio.play(w.final ? 'bossWarning' : 'waveWarning');
    },
    updateWaves(dt) {
      if (this.waveIdx < 0 || this.waves[this.waveIdx].spawnedAll) {
        const cur = this.waves[this.waveIdx];
        const next = this.waveIdx + 1;
        if (next >= this.waves.length) return;
        // next wave countdown starts once current wave cleared or timed out
        if (cur) { const alive = cur.members.some(z => !z.dead && !z.dying); cur.sinceStart = (cur.sinceStart || 0) + dt; if (alive && cur.sinceStart < cur.timeout) return; }
        this.waveDelay -= dt;
        if (this.waveDelay <= 0) { this.startWave(next); this.waveDelay = (this.waves[next + 1] || {}).delay || 0; }
        return;
      }
      const w = this.waves[this.waveIdx];
      this.waveElapsed += dt; w.sinceStart = this.waveElapsed;
      while (this.queue.length && this.queue[0].t <= this.waveElapsed) {
        const e = this.queue.shift();
        const lanes = e.g.lanes === 'random' || !e.g.lanes ? [1, 2, 3, 4, 5] : e.g.lanes;
        const lane = e.g.lanes === 'random' || !e.g.lanes ? RK.RNG.pick(lanes) : lanes[e.k % lanes.length];
        const z = this.spawnZombie(e.g.enemy, lane - 1, (e.g.hpMult || 1) * (w.difficultyMultiplier || 1));
        if (z) w.members.push(z);
      }
      if (!this.queue.length) w.spawnedAll = true;
    },
    spawnZombie(id, r, hpMult) {
      const def = RK.Data.enemies[id]; if (!def) { console.warn('Unknown enemy', id); return null; }
      if (this.zombies.length >= CFG.limits.maxZombies) return null;
      const z = new RK.Zombie(this, def, r, hpMult); this.zombies.push(z); this.spawnedCount++;
      return z;
    },
    get zombiesRemaining() { return this.totalZombies - this.stats.killed; },

    // ---------------- Queries ----------------
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
        if (d > 0 && d <= z.data.range && z.x <= 9.3) { if (!best || u.col > best.col) best = u; }
      }
      return best;
    },

    // ---------------- Spawning helpers ----------------
    spawnProjectile(o) {
      if (this.projectiles.length >= CFG.limits.maxProjectiles) return;
      const p = Object.assign({ projectileId: 'P' + (this._pid = (this._pid || 0) + 1), owner: o.source ? o.source.uid : null, direction: Math.sign(o.speed),
        alive: true, hit: new Set(), lifetime: 6, age: 0, position: null }, o);
      this.projectiles.push(p);
    },
    spawnDonut(f, i) {
      if (this.donutItems.filter(d => !d.collected).length >= CFG.donut.maxOnField) return;
      const cx = this.grid.colToX(f.row, f.col + 0.5), fy = this.grid.footY(f.row), h = this.grid.cellH(f.row);
      const id = 'D' + (this._did = (this._did || 0) + 1);
      this.donutItems.push({ donutId: id, value: CFG.donut.normalValue, type: 'normal', x: cx, y: fy - h * 0.9, vx: RK.RNG.range(-90, 90) + (i - 0.5) * 60, vy: -RK.RNG.range(380, 470),
        groundY: U.clamp(fy - h * 0.15 + RK.RNG.range(-10, 22), this.grid.y0 + 30, this.grid.y1 - 10), spawnTime: this.t, expireTime: this.t + CFG.donut.lifetime,
        landed: false, collected: false, fly: 0 });
    },

    // ---------------- Actions ----------------
    canPlace(card, r, c) {
      const cell = this.grid.cells[r] && this.grid.cells[r][c];
      if (!cell) return { ok: false, why: 'นอกสนาม' };
      if (cell.occupied) return { ok: false, why: 'ช่องนี้มีตัวละครอยู่แล้ว' };
      if (!cell.isBuildable) return { ok: false, why: 'วางช่องนี้ไม่ได้' };
      if (this.donuts < card.cost) return { ok: false, why: 'โดนัทไม่พอ' };
      if (this.cooldowns[card.id] > 0) return { ok: false, why: 'ยังติดคูลดาวน์' };
      return { ok: true };
    },
    // Placement flow doc 4.3: check cost -> show cells -> tap -> check empty -> check rules -> deduct -> create -> set row/col -> start AI -> HP bar
    place(card, r, c) {
      const chk = this.canPlace(card, r, c);
      if (!chk.ok) { UI.toast(chk.why); return null; }
      this.donuts -= card.cost;
      const u = new RK.Unit(this, card, r, c);
      this.units.push(u);
      const cell = this.grid.cells[r][c]; cell.occupied = true; cell.unitId = u.uid;
      this.cooldowns[card.id] = card.cooldown;
      this.stats.unitsPlaced++;
      u.showHpT = 2;
      this.fx('place', u); RK.Audio.play('unitPlace');
      if (this.tutorialStep === 0 && card.isFactory) this.tutorialStep = 1;
      if (this.tutorialStep === 2 && card.role === 'Attacker') this.tutorialStep = 3;
      return u;
    },
    collectDonut(d) {
      if (d.collected) return false;          // already collected (guards double-tap)
      d.collected = true; d.fly = 0.45; d.fromX = d.x; d.fromY = d.y;
      this.donuts += d.value; this.stats.donutsCollected++; this.stats.donutValue += d.value;
      RK.Save.data.stats.donutsCollected++; RK.Save.saveSoon('donut');
      this.addDmgText(d.x, d.y - 30, '+' + d.value, '#FFE14D', 34);
      this.fx('collect', null, d.x, d.y); RK.Audio.play('donutCollect');
      if (this.tutorialStep === 1) this.tutorialStep = 2;
      return true;
    },
    upgradeFactory(u) {
      const next = CFG.factoryLevels[u.level + 1];
      if (!next) return false;
      if (this.donuts < next.upgradeCost) { UI.toast('โดนัทไม่พอสำหรับอัปเกรด'); return false; }
      this.donuts -= next.upgradeCost; u.level++;
      u.prodTimer = Math.min(u.prodTimer, next.productionTime);
      u.maxHp += 80; u.hp += 80;
      this.fx('upgrade', u); RK.Audio.play('upgrade'); UI.toast(`อัปเกรดเครื่องเป็น Lv.${u.level}!`);
      return true;
    },
    damageBase(amount, src) {
      if (this.state !== 'play') return;
      this.baseHp = Math.max(0, this.baseHp - amount); this.baseShake = 0.3; this.baseHitT = this.t;
      const p = { x: 210, y: 420 };
      this.addDmgText(p.x + RK.RNG.range(-30, 30), p.y, '-' + Math.round(amount), '#FF4B4B', 34);
      if (this.baseHp <= 0) this.lose();
    },
    kill(e, src) {
      if (e.dying || e.dead) return;           // prevents double death from the same event (doc 11.5)
      e.dying = 0.55; e.hp = 0;
      if (e.side === 'zombie') {
        this.stats.killed++; RK.Save.data.stats.zombiesKilled++; this.stats.gold += (e.data.reward && e.data.reward.gold) || 0;
        RK.Save.saveSoon('kill');
      } else {
        this.stats.unitsLost++;
        const cell = this.grid.cells[e.row][e.col]; cell.occupied = false; cell.unitId = null;
      }
      this.fx('death', e);
    },

    // ---------------- Update ----------------
    update(dt) {
      this.updateMusic();
      if (this.banner) { this.banner.t -= dt; if (this.banner.t <= 0) this.banner = null; }
      if (this.result) { this.result.t += dt; return; }
      if (this.paused || RK.UI.modal) return;
      if (this.state === 'intro') { this.introT -= dt; if (this.introT <= 0) this.state = 'play'; return; }
      for (let i = 0; i < this.speed; i++) this.sim(dt);
    },
    // Music follows the fight: calm before wave 1, busier as zombies pile up, own song for the final wave
    updateMusic() {
      const M = RK.Music; if (!M) return;
      M.duck(!!RK.UI.modal || this.paused);
      if (this.result || this.state !== 'play') return;
      const w = this.waves[this.waveIdx];
      if (w && w.final && M.mood !== 'final') M.start('final');
      const alive = this.zombies.filter(z => !z.dying).length;
      M.setIntensity(this.waveIdx < 0 ? 0 : alive === 0 ? 1 : alive < 5 ? 2 : 3);
    },
    sim(dt) {
      if (this.state !== 'play') return;
      this.t += dt;
      for (const k in this.cooldowns) this.cooldowns[k] = Math.max(0, this.cooldowns[k] - dt);
      this.updateWaves(dt);
      for (const u of this.units) if (!u.dying) { RK.Combat.tickStatus(this, u, dt); if (!u.dying) u.update(this, dt); }
      for (const z of this.zombies) if (!z.dying) { RK.Combat.tickStatus(this, z, dt); if (!z.dying) z.update(this, dt); }
      this.updateProjectiles(dt);
      this.updateDonuts(dt);
      // death animations then removal (doc 11.5)
      for (const e of this.units.concat(this.zombies)) if (e.dying) { e.dying -= dt; if (e.dying <= 0) e.dead = true; }
      this.units = this.units.filter(e => !e.dead); this.zombies = this.zombies.filter(e => !e.dead);
      this.baseShake = Math.max(0, this.baseShake - dt);
      for (const n of this.dmgNums) n.t += dt; this.dmgNums = this.dmgNums.filter(n => n.t < n.max);
      for (const f of this.effects) f.t += dt; this.effects = this.effects.filter(f => f.t < f.max);
      // victory check
      const last = this.waves[this.waves.length - 1];
      if (last.started && last.spawnedAll && this.zombies.length === 0) this.win();
    },
    updateProjectiles(dt) {
      for (const p of this.projectiles) {
        if (!p.alive) continue;
        p.age += dt; p.x += p.speed * dt;
        if (p.age > p.lifetime) { p.alive = false; continue; }
        if (p.side === 'bear') {
          if (p.x > p.maxX || p.x > 10) { p.alive = false; continue; }
          for (const z of this.zombiesInRow(p.row)) {
            if (p.hit.has(z.uid)) continue;
            if (p.x >= z.x - 0.3 && p.x <= z.x + 0.6) {
              p.hit.add(z.uid);
              if (p.splash) {
                this.zombies.filter(o => !o.dying && !o.dead && ((o.row === p.row && Math.abs(o.x - z.x) <= p.splash) || (Math.abs(o.row - p.row) === 1 && Math.abs(o.x - z.x) <= p.splash * 0.5)))
                  .forEach(o => RK.Combat.applyDamage(this, o, o === z ? p.damage : p.damage * 0.6, { type: p.type, canCrit: true, status: p.status, ignoreDef: p.ignoreDef, projectile: true, source: p.source }));
                this.fx('explode', null, this.grid.colToX(p.row, p.x), this.grid.footY(p.row) - 50);
              } else {
                RK.Combat.applyDamage(this, z, p.damage, { type: p.type, canCrit: true, status: p.status, ignoreDef: p.ignoreDef, projectile: true, source: p.source });
                this.fx('hit', z);
              }
              if (p.pattern !== 'piercing') { p.alive = false; break; }
            }
          }
        } else {
          // zombie projectile travelling left (doc 10.7/10.8)
          if (p.toBase && p.x <= this.map.baseCol + 0.2) { this.damageBase(p.damage, p.source); this.fx('hit', null, 230, 430); p.alive = false; continue; }
          for (const u of this.unitsInRow(p.row)) {
            if (p.x <= u.col + 0.75 && p.x >= u.col + 0.05) {
              RK.Combat.applyDamage(this, u, p.damage, { type: p.type, status: p.status, projectile: true, source: p.source });
              this.fx('hit', u); p.alive = false; break;
            }
          }
          if (p.x < this.map.baseCol - 1) p.alive = false;
        }
      }
      this.projectiles = this.projectiles.filter(p => p.alive);
    },
    updateDonuts(dt) {
      for (const d of this.donutItems) {
        if (d.collected) { d.fly -= dt; continue; }
        if (!d.landed) { d.vy += 1500 * dt; d.x += d.vx * dt; d.y += d.vy * dt; if (d.vy > 0 && d.y >= d.groundY) { d.y = d.groundY; if (d.vy > 260) { d.vy = -d.vy * 0.32; d.vx *= 0.5; } else d.landed = true; } }
        if (this.t >= d.expireTime) { d.expired = true; }
      }
      this.donutItems = this.donutItems.filter(d => !(d.expired && !d.collected) && !(d.collected && d.fly <= 0));
    },

    // ---------------- Win / Lose / Rewards (doc PART 20) ----------------
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
          default: return false;
        }
      });
    },
    win() {
      if (this.state !== 'play') return;
      this.state = 'won';
      const sd = RK.Save.data, st = this.stage, stars = this.evalStars();
      const rec = sd.stages[st.id] || (sd.stages[st.id] = { cleared: false, stars: [false, false, false], plays: 0, bestTime: null });
      const firstClear = !rec.cleared;
      rec.cleared = true; rec.plays++; rec.stars = rec.stars.map((v, i) => v || stars[i]);
      rec.bestTime = rec.bestTime == null ? Math.round(this.t) : Math.min(rec.bestTime, Math.round(this.t));
      const gold = (firstClear ? st.reward.gold : Math.round(st.reward.gold * 0.3)) + this.stats.gold;
      const exp = firstClear ? st.reward.exp : Math.round(st.reward.exp * 0.5);
      sd.gold += gold; sd.stats.wins++; if (firstClear) sd.stats.stagesCompleted++;
      this.addExp(exp);
      const unlocked = [];
      if (st.reward.unlock) st.reward.unlock.forEach(id => { if (RK.Save.unlockCharacter(id)) { unlocked.push(id); if (!sd.deck.includes(id) && sd.deck.length < RK.Data.maxDeck) sd.deck.push(id); } });
      const nextId = `T${st.town}-S${st.number + 1}`;
      if (st.number < RK.Data.stagesPerTown && !sd.unlockedStages.includes(nextId)) sd.unlockedStages.push(nextId);
      if (st.number === RK.Data.stagesPerTown && !sd.towns.unlocked.includes(st.town + 1)) sd.towns.unlocked.push(st.town + 1);
      const ok = RK.Save.save('stage-clear');
      this.result = { win: true, stars, gold, exp, unlocked, t: 0, saved: ok, nextId, time: this.t, surviving: this.units.filter(u => !u.dying).length };
      RK.Audio.play('victory');
    },
    lose() {
      if (this.state !== 'play') return;
      this.state = 'lost';
      RK.Save.data.stats.losses++; RK.Save.save('stage-lose');
      this.result = { win: false, t: 0, time: this.t };
      RK.Audio.play('defeat');
    },
    addExp(n) {
      const p = RK.Save.data.profile; p.exp += n;
      while (p.exp >= p.level * 100) { p.exp -= p.level * 100; p.level++; UI.toast('Player Level Up! Lv.' + p.level); }
    },

    // ---------------- Effects ----------------
    fx(type, e, x, y) {
      if (e) { x = this.grid.colToX(e.row, e.x !== undefined ? e.x : e.col + 0.5); y = this.grid.footY(e.row) - this.grid.cellH(e.row) * 0.6; }
      const max = { death: 0.6, place: 0.5, collect: 0.5, hit: 0.3, slash: 0.25, spray: 0.45, wind: 0.5, explode: 0.45, upgrade: 0.9, break: 0.5 }[type] || 0.4;
      if (this.effects.length > 120) this.effects.shift();
      this.effects.push({ type, x, y, t: 0, max, row: e ? e.row : null });
    },
    damageNumber(target, dmg, type) {
      if (!RK.Save.data.settings.damageNumbers) return;
      const x = this.grid.colToX(target.row, target.x) + RK.RNG.range(-18, 18), y = this.grid.footY(target.row) - this.grid.cellH(target.row) * 1.15;
      this.addDmgText(x, y, String(dmg), RK.Combat.COLORS[type] || '#fff', type === 'crit' || type === 'heavy' ? 36 : 28);
    },
    addDmgText(x, y, text, color, size) {
      if (this.dmgNums.length >= CFG.limits.maxDamageNumbers) this.dmgNums.shift();
      this.dmgNums.push({ x, y, text, color, size: size || 28, t: 0, max: 0.9 });
    },

    // ---------------- Input ----------------
    cardRects() {
      const n = this.cards.length, w = HUD.cardW, g = HUD.cardGap, tot = n * w + (n - 1) * g, x0 = (RK.Engine.W - tot) / 2;
      return this.cards.map((c, i) => ({ x: x0 + i * (w + g), y: HUD.cardY, w, h: HUD.cardH, card: c }));
    },
    onTap(x, y) {
      if (this.result) return this.tapResult(x, y);
      if (U.inRect(x, y, HUD.pause)) return this.openPause();
      if (U.inRect(x, y, HUD.speed)) { this.speed = this.speed === 1 ? 2 : 1; RK.Save.data.settings.battleSpeed = this.speed; RK.Save.saveSoon('speed'); return; }
      if (this.state !== 'play' && this.state !== 'intro') return;
      // 1) donuts are always on top
      const R = CFG.donut.tapRadius;
      let best = null, bd = 1e9;
      for (const d of this.donutItems) { if (d.collected) continue; const dd = Math.hypot(d.x - x, d.y - y); if (dd < R && dd < bd) { bd = dd; best = d; } }
      if (best) return this.collectDonut(best);
      // 2) cards
      for (const r of this.cardRects()) if (U.inRect(x, y, r)) {
        const c = r.card;
        if (this.selected === c) { this.selected = null; return; }
        if (this.cooldowns[c.id] > 0) { UI.toast(`${c.nameTH} ยังไม่พร้อม (${Math.ceil(this.cooldowns[c.id])} วิ)`); return; }
        if (this.donuts < c.cost) { UI.toast(`โดนัทไม่พอ (ต้องใช้ ${c.cost})`); return; }
        this.selected = c; RK.Audio.play('buttonClick'); return;
      }
      // 3) grid
      const cell = this.grid.cellAt(x, y);
      if (cell) {
        if (this.selected) {
          const u = this.place(this.selected, cell.r, cell.c);
          if (u) this.selected = null;
          return;
        }
        const u = this.units.find(u => u.row === cell.r && u.col === cell.c && !u.dying);
        if (u) { u.showHpT = 3; if (u.isFactory) this.openFactoryUpgrade(u); }
        return;
      }
      this.selected = null;
    },
    openPause() {
      if (this.result || RK.UI.modal) return;
      RK.Audio.play('buttonClick');
      const items = [['เล่นต่อ (Resume)', 'green', null], ['เริ่มใหม่ (Restart)', 'yellow', () => this.restart()],
        ['ตั้งค่า (Settings)', 'blue', () => RK.Scenes.openSettings(() => this.openPause())],
        ['ออกไปเลือกด่าน', 'red', () => RK.Engine.setScene(RK.Scenes.stageSelect, { town: this.stage.town })]];
      UI.openModal({ title: 'หยุดเกม', w: 640, h: 560, lines: [`${this.stage.id} · ${this.stage.name}`], customButtons: true,
        draw: (ctx, b) => { UI.modal._btns = items.map((it, i) => ({ label: it[0], color: it[1], action: it[2], forcePill: true, x: b.x + (b.w - 400) / 2, y: b.y + 130 + i * 96, w: 400, h: 80, size: 30 })); } });
    },
    restart() { RK.Engine.setScene(Battle, { stageId: this.stage.id, deck: this.cards.map(c => c.id) }); },
    openFactoryUpgrade(u) {
      const cur = u.lvl, next = CFG.factoryLevels[u.level + 1];
      if (!next) { UI.toast('เครื่องผลิตระดับสูงสุดแล้ว (Lv.5)'); return; }
      UI.openModal({ title: 'อัปเกรดเครื่องผลิตโดนัท', w: 860, h: 520,
        draw: (ctx, b) => {
          A.drawFit(ctx, cur.asset, b.x + 40, b.y + 80, 210, 210);
          A.drawFit(ctx, 'UI_ICON_ARROW_RIGHT', b.x + 262, b.y + 150, 64, 64);
          A.drawFit(ctx, next.asset, b.x + 338, b.y + 80, 210, 210);
          const tx = b.x + 700, rows = [['ระดับ', `Lv.${cur.level} → Lv.${next.level}`], ['เวลาผลิต', `${cur.productionTime} → ${next.productionTime} วิ`], ['โดนัท/รอบ', `${cur.donutsPerCycle} → ${next.donutsPerCycle}`], ['ค่าอัปเกรด', `${next.upgradeCost} โดนัท`]];
          rows.forEach((r, i) => { UI.text(ctx, r[0], tx, b.y + 95 + i * 62, { size: 24, color: '#9A6A3A', outline: false }); UI.text(ctx, r[1], tx, b.y + 124 + i * 62, { size: 28, color: i === 3 && this.donuts < next.upgradeCost ? '#D33' : '#6B3F1C', outline: false }); });
        },
        buttons: [{ label: 'ยกเลิก' }, { label: 'อัปเกรด', disabled: this.donuts < next.upgradeCost, action: () => this.upgradeFactory(u) }] });
    },
    tapResult(x, y) {
      if (this.result.t < 0.6) return;
      for (const b of (this.result.btns || [])) if (UI.hit(b, x, y)) { RK.Audio.play('buttonClick'); b.action(); return; }
    },

    // ---------------- Render ----------------
    render(ctx) {
      const g = this.grid;
      A.drawFit(ctx, this.map.asset, 0, 0, RK.Engine.W, RK.Engine.H);
      // base damage flash
      if (this.baseShake > 0) { ctx.fillStyle = `rgba(255,40,40,${this.baseShake})`; ctx.fillRect(0, 150, 300, 600); }
      // placement highlights
      if (this.selected) {
        for (let r = 0; r < g.rows; r++) for (let c = 0; c < g.cols; c++) {
          const ok = !g.cells[r][c].occupied;
          this.poly(ctx, g.cellPoly(r, c), ok ? 'rgba(120,255,120,0.28)' : 'rgba(255,80,80,0.22)', ok ? 'rgba(255,255,255,0.75)' : null);
        }
      }
      // wet floor tint
      for (const u of this.units) if (u.data.aura && !u.dying) for (let k = 1; k <= u.data.aura.cellsAhead; k++) if (u.col + k < g.cols) this.poly(ctx, g.cellPoly(u.row, u.col + k), 'rgba(120,200,255,0.22)');
      // entities sorted by row (back to front)
      const ents = this.units.concat(this.zombies).sort((a, b) => a.row - b.row || (a.side === 'zombie') - (b.side === 'zombie'));
      for (const e of ents) this.drawEntity(ctx, e);
      for (const p of this.projectiles) this.drawProjectile(ctx, p);
      for (const f of this.effects) this.drawFx(ctx, f);
      for (const d of this.donutItems) this.drawDonut(ctx, d);
      for (const e of ents) this.drawHpBar(ctx, e);
      for (const n of this.dmgNums) { ctx.save(); ctx.globalAlpha = 1 - Math.max(0, (n.t / n.max - 0.6) / 0.4); UI.text(ctx, n.text, n.x, n.y - n.t * 60, { size: n.size, color: n.color, outlineColor: '#3a1a08' }); ctx.restore(); }
      this.drawHUD(ctx);
      if (this.state === 'intro') this.drawIntro(ctx);
      if (this.banner) this.drawBanner(ctx);
      if (this.tutorialStep >= 0 && this.tutorialStep < 3 && this.state === 'play') this.drawTutorial(ctx);
      if (this.result) this.drawResult(ctx);
    },
    poly(ctx, pts, fill, stroke) {
      ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
    },
    entityPos(e) { return { x: this.grid.colToX(e.row, e.side === 'bear' ? e.col + 0.5 : e.x), y: this.grid.footY(e.row), h: this.grid.cellH(e.row) }; },
    // Static sprites animated with transforms (bob / lunge / flash / fall). No invented frames (doc 23).
    drawEntity(ctx, e) {
      const p = this.entityPos(e);
      let id = e.side === 'bear' ? e.assetId : e.data.asset;
      let h = e.side === 'bear' ? p.h * (e.isFactory ? 1.42 : 1.28) : p.h * (e.data.scale || 1.25);
      if (e.isFactory && e.level === 1 && e.prodTimer < 1.6) { const fr = e.prodTimer > 1.0 ? 'FACTORY_ANIM_HEATING' : e.prodTimer > 0.4 ? 'FACTORY_ANIM_BAKING' : 'FACTORY_ANIM_EJECT'; id = fr; h = p.h * 1.12; }
      const img = A.get(id); if (!img) return;
      const w = img.width * h / img.height;
      ctx.save();
      ctx.translate(p.x, p.y);
      // shadow
      ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.beginPath(); ctx.ellipse(0, -4, w * 0.36, h * 0.07, 0, 0, Math.PI * 2); ctx.fill();
      let sx = 1, sy = 1, rot = 0, dx = 0, alpha = 1;
      if (e.side === 'bear') {
        const ph = this.t * 2.2 + e.anim.idlePhase; sy = 1 + Math.sin(ph) * 0.025; sx = 1 - Math.sin(ph) * 0.015;
        if (e.anim.attack > 0) { const k = e.anim.attack / 0.22; dx = Math.sin(k * Math.PI) * 14; sx *= 1 + k * 0.06; }
        if (e.anim.spawn > 0) { const k = 1 - e.anim.spawn / 0.35; sx *= 0.6 + 0.4 * k; sy *= 0.6 + 0.4 * k + Math.sin(k * Math.PI) * 0.15; }
        if (e.isFactory && e.ejectAnim > 0) { const k = e.ejectAnim / 0.6; sy *= 1 + Math.sin(k * Math.PI) * 0.08; }
        if (e.status.stun) rot = Math.sin(this.t * 20) * 0.05;
      } else {
        if (e.state === 'walk' && RK.Combat.speedMult(e) > 0) { rot = Math.sin(e.anim.phase) * 0.06; sy = 1 + Math.abs(Math.sin(e.anim.phase)) * 0.03; }
        if (e.anim.attack > 0) { const k = e.anim.attack / 0.3; dx = -Math.sin(k * Math.PI) * 16; rot = -Math.sin(k * Math.PI) * 0.08; }
        if (e.anim.spawn > 0) alpha = 1 - e.anim.spawn / 0.5;
      }
      if (e.dying) { const k = 1 - Math.max(0, e.dying) / 0.55; alpha = 1 - k; rot = (e.side === 'bear' ? -1 : 1) * k * 0.9; sy *= 1 - k * 0.3; }
      ctx.globalAlpha = alpha;
      ctx.translate(dx, 0); ctx.rotate(rot); ctx.scale(sx, sy);
      ctx.drawImage(img, -w / 2, -h, w, h);
      if (e.hitFlash > 0 || e.status.poison || e.status.slow || e.status.wet || e.status.stun) {
        // tint overlay drawn through the sprite alpha using an offscreen buffer
        const tint = e.hitFlash > 0 ? 'rgba(255,60,60,0.55)' : e.status.poison ? 'rgba(120,255,90,0.35)' : e.status.stun ? 'rgba(255,240,120,0.35)' : 'rgba(110,190,255,0.38)';
        this.drawTint(ctx, img, -w / 2, -h, w, h, tint);
      }
      ctx.restore();
      if (e.status.stun && !e.dying) { const ang = this.t * 6; for (let i = 0; i < 3; i++) A.drawFit(ctx, 'UI_FX_TWINKLE', p.x + Math.cos(ang + i * 2.1) * 26 - 12, p.y - h - 10 + Math.sin(ang + i * 2.1) * 6, 24, 24); }
      if (e.isFactory && !e.dying) { // production progress ring
        const k = 1 - e.prodTimer / (e.level === 1 && this.t < CFG.firstProductionDelay ? CFG.firstProductionDelay : e.lvl.productionTime);
        ctx.beginPath(); ctx.arc(p.x + w * 0.38, p.y - h * 0.9, 16, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * U.clamp(k, 0, 1)); ctx.strokeStyle = '#FFD93B'; ctx.lineWidth = 7; ctx.stroke();
      }
    },
    drawTint(ctx, img, x, y, w, h, color) {
      const c = this._tint || (this._tint = document.createElement('canvas'));
      const cw = Math.ceil(w), ch = Math.ceil(h); if (c.width < cw) c.width = cw; if (c.height < ch) c.height = ch;
      const t = c.getContext('2d'); t.clearRect(0, 0, c.width, c.height); t.globalCompositeOperation = 'source-over';
      t.drawImage(img, 0, 0, w, h); t.globalCompositeOperation = 'source-in'; t.fillStyle = color; t.fillRect(0, 0, w, h);
      ctx.drawImage(c, 0, 0, cw, ch, x, y, cw, ch);
    },
    drawHpBar(ctx, e) {
      if (e.dying) return;
      const show = RK.Save.data.settings.hpBarAlways || e.showHpT > 0 || this.t - e.lastHitT < 3 || (e.side === 'zombie' && e.state !== 'walk');
      if (!show) return;
      const p = this.entityPos(e), h = e.side === 'bear' ? p.h * 1.32 : p.h * (e.data.scale || 1.25);
      const bw = 92, bh = 13, x = p.x - bw / 2, y = p.y - h - 16;
      ctx.fillStyle = 'rgba(40,20,8,0.75)'; UI.roundRect(ctx, x - 3, y - 3, bw + 6, bh + 6, 8); ctx.fill();
      const k = U.clamp(e.hp / e.maxHp, 0, 1);
      ctx.fillStyle = e.side === 'bear' ? (k > 0.5 ? '#6EE04A' : k > 0.25 ? '#FFD93B' : '#FF5A5A') : '#FF5A5A';
      UI.roundRect(ctx, x, y, Math.max(4, bw * k), bh, 6); ctx.fill();
      const extra = (e.armorHp || 0) + (e.shieldHp || 0), extraMax = (e.maxArmor || 0) + (e.maxShield || 0);
      if (extraMax > 0 && extra > 0) { ctx.fillStyle = '#C8D2DC'; UI.roundRect(ctx, x, y - 9, Math.max(4, bw * extra / extraMax), 7, 4); ctx.fill(); }
    },
    drawProjectile(ctx, p) {
      const g = this.grid, x = g.colToX(p.row, p.x);
      let y = g.footY(p.row) - g.cellH(p.row) * 0.62;
      if (p.arc) { const span = Math.max(0.5, p.startX - p.endX), k = U.clamp((p.startX - p.x) / span, 0, 1); y -= Math.sin(k * Math.PI) * 70; }
      const img = A.get(p.img); if (!img) return;
      const size = (p.side === 'bear' ? 44 : 58) * (p.scale || 1);
      ctx.save(); ctx.translate(x, y); ctx.rotate(p.side === 'bear' ? p.age * 9 : 0);
      if (p.tint === 'choco') ctx.filter = 'sepia(1) saturate(2.5) hue-rotate(-25deg) brightness(0.65)';
      const s = size / Math.max(img.width, img.height); ctx.drawImage(img, -img.width * s / 2, -img.height * s / 2, img.width * s, img.height * s);
      ctx.restore();
    },
    drawDonut(ctx, d) {
      const img = A.get('DONUT_NORMAL'); if (!img) return;
      let x = d.x, y = d.y, s = 56, a = 1;
      if (d.collected) { const k = 1 - d.fly / 0.45; x = U.lerp(d.fromX, 80, k * k); y = U.lerp(d.fromY, 58, k * k); s = 56 * (1 - k * 0.5); }
      else {
        const left = d.expireTime - this.t;
        if (left < CFG.donut.blinkBefore) a = 0.35 + 0.65 * Math.abs(Math.sin(this.t * 10));
        if (d.landed) { s += Math.sin(this.t * 5 + d.spawnTime) * 3; A.drawFit(ctx, 'UI_FX_STAR_GLOW', x - 40, y - 40, 80, 80); }
      }
      ctx.save(); ctx.globalAlpha = a; ctx.drawImage(img, x - s / 2, y - s * img.height / img.width / 2, s, s * img.height / img.width); ctx.restore();
    },
    drawFx(ctx, f) {
      const k = f.t / f.max; ctx.save(); ctx.globalAlpha = 1 - k;
      switch (f.type) {
        case 'hit': A.drawFit(ctx, 'UI_FX_HIT_SPLAT', f.x - 30, f.y - 30, 60 + k * 20, 60 + k * 20); break;
        case 'slash': ctx.strokeStyle = '#fff'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(f.x - 30, f.y, 50, -1 + k, 0.6 + k); ctx.stroke(); break;
        case 'explode': A.drawFit(ctx, 'UI_FX_CLOUD', f.x - 60 - k * 30, f.y - 60 - k * 30, 120 + k * 60, 120 + k * 60); A.drawFit(ctx, 'FX_SPARKLE', f.x - 40, f.y - 50, 80, 80); break;
        case 'spray': case 'wind': {
          ctx.fillStyle = f.type === 'spray' ? 'rgba(170,225,255,0.8)' : 'rgba(235,250,255,0.8)';
          for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.arc(f.x + 40 + k * 190 + i * 14, f.y + Math.sin(i * 1.7) * 26, 10 + i * 1.5, 0, Math.PI * 2); ctx.fill(); }
          break; }
        case 'death': A.drawFit(ctx, 'UI_FX_CLOUD', f.x - 50, f.y - 20 - k * 30, 100, 100); break;
        case 'place': case 'collect': A.drawFit(ctx, 'UI_FX_BURST_LINES', f.x - 55 - k * 20, f.y - 55 - k * 20, 110 + k * 40, 110 + k * 40); break;
        case 'upgrade': A.drawFit(ctx, 'UI_ICON_UPGRADE', f.x - 40, f.y - 80 - k * 60, 80, 80); A.drawFit(ctx, 'FX_SPARKLE', f.x - 60, f.y - 40, 120, 120); break;
        case 'break': A.drawFit(ctx, 'UI_FX_BURST_LINES', f.x - 50, f.y - 90, 100, 100); break;
      }
      ctx.restore();
    },
    drawHUD(ctx) {
      // donut counter
      const d = HUD.donut; UI.panel(ctx, d.x, d.y, d.w, d.h, { r: 24 });
      A.drawFit(ctx, 'DONUT_NORMAL', d.x + 14, d.y + 12, 68, 68);
      UI.text(ctx, String(this.donuts), d.x + 165, d.y + d.h / 2 + 2, { size: 46, color: '#FFE14D' });
      // base hp
      const b = HUD.base; UI.panel(ctx, b.x, b.y, b.w, b.h, { r: 24 });
      A.drawFit(ctx, 'UI_ICON_HEART', b.x + 14, b.y + 14, 64, 64);
      const k = this.baseHp / this.baseMax, bx = b.x + 88, bw = b.w - 110;
      ctx.fillStyle = '#5a3212'; UI.roundRect(ctx, bx, b.y + 30, bw, 34, 17); ctx.fill();
      ctx.fillStyle = k > 0.5 ? '#6EE04A' : k > 0.25 ? '#FFD93B' : '#FF5A5A'; UI.roundRect(ctx, bx + 3, b.y + 33, Math.max(10, (bw - 6) * k), 28, 14); ctx.fill();
      UI.text(ctx, `${Math.ceil(this.baseHp)} / ${this.baseMax}`, bx + bw / 2, b.y + 48, { size: 22 });
      UI.text(ctx, 'ฐาน', bx + bw / 2, b.y + 17, { size: 16, color: '#8B5A2B', outline: false });
      // waves
      const w = HUD.wave; UI.panel(ctx, w.x, w.y, w.w, w.h, { r: 24 });
      const cur = Math.max(0, this.waveIdx) + (this.waveIdx < 0 ? 0 : 1), tot = this.waves.length;
      UI.text(ctx, this.waveIdx < 0 ? `เตรียมตัว ${Math.ceil(Math.max(0, this.waveDelay))} วิ` : `WAVE ${cur}/${tot}`, w.x + 120, w.y + 34, { size: 30, color: this.waveIdx >= 0 && this.waves[this.waveIdx].final ? '#FF6B6B' : '#FFE14D' });
      UI.text(ctx, `ซอมบี้เหลือ ${this.zombiesRemaining}`, w.x + 340, w.y + 34, { size: 24 });
      const pk = this.stats.killed / Math.max(1, this.totalZombies);
      ctx.fillStyle = '#5a3212'; UI.roundRect(ctx, w.x + 24, w.y + 58, w.w - 48, 18, 9); ctx.fill();
      ctx.fillStyle = '#FF7FB0'; UI.roundRect(ctx, w.x + 26, w.y + 60, Math.max(8, (w.w - 52) * pk), 14, 7); ctx.fill();
      for (let i = 1; i < tot; i++) { const mx = w.x + 26 + (w.w - 52) * this.waveMark(i); ctx.fillStyle = '#fff'; ctx.fillRect(mx - 1, w.y + 56, 3, 22); }
      // speed & pause
      UI.button(ctx, Object.assign({ label: this.speed === 2 ? '×2' : '×1', color: this.speed === 2 ? 'pink' : 'blue', size: 36, forcePill: true }, HUD.speed));
      UI.button(ctx, Object.assign({ label: 'II', color: 'yellow', size: 38, forcePill: true }, HUD.pause));
      // cards
      for (const r of this.cardRects()) this.drawCard(ctx, r);
    },
    waveMark(i) { let s = 0, t = 0; this.waves.forEach((w, j) => { const n = w.spawns.reduce((a, g) => a + g.count, 0); if (j < i) s += n; t += n; }); return s / t; },
    drawCard(ctx, r) {
      const c = r.card, sel = this.selected === c, cd = this.cooldowns[c.id], afford = this.donuts >= c.cost;
      ctx.save();
      const lift = sel ? -14 : 0;
      A.drawFit(ctx, 'UI_CARD_FRAME_EMPTY', r.x, r.y + lift, r.w, r.h - 30);
      if (c.isFactory) A.drawFit(ctx, 'FACTORY_LV1', r.x + 16, r.y + 10 + lift, r.w - 32, r.h - 58, true);
      else A.drawFit(ctx, c.asset, r.x + 12, r.y + 8 + lift, r.w - 24, r.h - 52, true);
      // cost pill
      ctx.fillStyle = afford ? '#FFF4DE' : '#F5C6C6'; UI.roundRect(ctx, r.x + 14, r.y + r.h - 40 + lift, r.w - 28, 36, 18); ctx.fill();
      ctx.strokeStyle = '#8B5A2B'; ctx.lineWidth = 3; ctx.stroke();
      A.drawFit(ctx, 'DONUT_NORMAL', r.x + 20, r.y + r.h - 37 + lift, 30, 30);
      UI.text(ctx, String(c.cost), r.x + r.w / 2 + 14, r.y + r.h - 22 + lift, { size: 24, color: afford ? '#FFE14D' : '#FF6B6B' });
      UI.text(ctx, c.nameTH.length > 9 ? c.nameTH.slice(0, 9) + '…' : c.nameTH, r.x + r.w / 2, r.y + 14 + lift, { size: 16 });
      UI.text(ctx, 'Lv.' + ((RK.Save.data.characters.owned[c.id] || {}).level || 1), r.x + 28, r.y + r.h - 54 + lift, { size: 16, color: '#7FD7FF' });
      if (afford && cd <= 0) UI.text(ctx, '×' + Math.floor(this.donuts / c.cost), r.x + r.w - 24, r.y + r.h - 54 + lift, { size: 16, color: '#B6FF9B' });
      // disabled / cooldown overlay (doc 16.1)
      if (!afford || cd > 0) {
        ctx.fillStyle = 'rgba(30,20,20,0.45)'; UI.roundRect(ctx, r.x + 4, r.y + 4 + lift, r.w - 8, r.h - 8, 20); ctx.fill();
        if (cd > 0) {
          const k = cd / c.cooldown; ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(r.x + 6, r.y + 6 + lift, r.w - 12, (r.h - 12) * k);
          A.drawFit(ctx, 'UI_ICON_HOURGLASS', r.x + r.w / 2 - 20, r.y + 40 + lift, 40, 40);
          UI.text(ctx, Math.ceil(cd) + 's', r.x + r.w / 2, r.y + 98 + lift, { size: 28 });
        }
      }
      if (sel) { ctx.strokeStyle = '#FFE14D'; ctx.lineWidth = 7; UI.roundRect(ctx, r.x - 2, r.y - 2 + lift, r.w + 4, r.h + 4, 22); ctx.stroke(); }
      ctx.restore();
    },
    drawIntro(ctx) {
      const k = Math.min(1, (2.2 - this.introT) * 3);
      ctx.save(); ctx.globalAlpha = Math.min(1, this.introT * 2) * k;
      UI.panel(ctx, 486, 330, 700, 200, { title: `Town ${this.stage.town} · Stage ${this.stage.number}` });
      UI.text(ctx, this.stage.name, 836, 430, { size: 44, color: '#FF7FB0', outlineColor: '#6B3F1C' });
      UI.text(ctx, `${this.waves.length} Waves · โดนัทเริ่มต้น ${this.donuts}`, 836, 488, { size: 26, color: '#8B5A2B', outline: false });
      ctx.restore();
    },
    drawBanner(ctx) {
      const b = this.banner, k = Math.min(1, (2.4 - b.t) * 4, b.t * 3);
      ctx.save(); ctx.globalAlpha = k;
      A.drawFit(ctx, b.final ? 'UI_RIBBON_RED' : 'UI_RIBBON_BLUE', 536, 360 - (1 - k) * 40, 600, 150);
      UI.text(ctx, b.text, 836, 420 - (1 - k) * 40, { size: 56 });
      UI.text(ctx, b.sub, 836, 520, { size: 30, color: '#FFE14D' });
      ctx.restore();
    },
    drawTutorial(ctx) {
      const msg = ['① แตะการ์ด "เครื่องผลิตโดนัท" แล้วแตะช่องบนสนามเพื่อวาง', '② รอโดนัทเด้งออกมา แล้วแตะโดนัทเพื่อเก็บ!', '③ วาง "คุมะยิงโดนัท" ไว้กันซอมบี้ที่มาจากประตูขวา'][this.tutorialStep];
      ctx.save(); ctx.font = UI.font(28); const w = ctx.measureText(msg).width + 80;
      UI.roundRect(ctx, 836 - w / 2, 120, w, 58, 29); ctx.fillStyle = 'rgba(255,244,222,0.95)'; ctx.fill(); ctx.strokeStyle = '#FF7FB0'; ctx.lineWidth = 4; ctx.stroke();
      UI.text(ctx, msg, 836, 150, { size: 28, color: '#6B3F1C', outline: false });
      ctx.restore();
      if (this.tutorialStep === 0) { const r = this.cardRects()[0]; const bob = Math.sin(this.t * 6) * 10; ctx.save(); ctx.translate(r.x + r.w / 2, r.y - 45 + bob); ctx.rotate(Math.PI / 2); A.drawFit(ctx, 'UI_ICON_ARROW_RIGHT', -35, -35, 70, 70); ctx.restore(); }
    },
    drawResult(ctx) {
      const R = this.result, W = RK.Engine.W;
      const k = Math.min(1, R.t * 2.5);
      ctx.fillStyle = `rgba(40,20,10,${0.55 * k})`; ctx.fillRect(0, 0, W, RK.Engine.H);
      const pw = 900, ph = 640, x = (W - pw) / 2, y = 170 + (1 - k) * 60;
      ctx.save(); ctx.globalAlpha = k;
      UI.panel(ctx, x, y, pw, ph, { title: R.win ? 'ชนะแล้ว! VICTORY' : 'แพ้แล้ว… DEFEAT', ribbon: R.win ? 'UI_RIBBON_YELLOW' : 'UI_RIBBON_RED' });
      const btns = [];
      if (R.win) {
        R.stars.forEach((s, i) => { const sx = x + pw / 2 + (i - 1) * 140 - 55, sz = i === 1 ? 120 : 100, pop = Math.min(1, Math.max(0, R.t * 3 - i * 0.5)); ctx.save(); ctx.globalAlpha = k * (s ? 1 : 0.35) * pop; A.drawFit(ctx, s ? 'UI_ICON_STAR' : 'UI_ICON_STAR_BRONZE', sx, y + 50 - (i === 1 ? 14 : 0), sz, sz); ctx.restore(); });
        this.stage.stars.forEach((s, i) => UI.text(ctx, (R.stars[i] ? '✓ ' : '✗ ') + s.text, x + pw / 2, y + 190 + i * 34, { size: 22, color: R.stars[i] ? '#3E9A2B' : '#B05050', outline: false }));
        const rows = [['โดนัทที่เก็บ', this.stats.donutsCollected], ['ซอมบี้ที่กำจัด', this.stats.killed], ['ตัวละครรอด', R.surviving], ['เวลา', this.fmtTime(R.time)], ['ทอง', '+' + R.gold], ['EXP', '+' + R.exp]];
        rows.forEach((r, i) => { const cx = x + 90 + (i % 3) * 260, cy = y + 320 + Math.floor(i / 3) * 70; UI.text(ctx, r[0], cx + 90, cy, { size: 20, color: '#9A6A3A', outline: false }); UI.text(ctx, String(r[1]), cx + 90, cy + 30, { size: 30, color: '#6B3F1C', outline: false }); });
        if (R.unlocked.length) {
          UI.text(ctx, 'ปลดล็อกตัวละครใหม่!', x + pw / 2, y + 470, { size: 26, color: '#FF7FB0' });
          R.unlocked.forEach((id, i) => { const c = RK.Data.characters[id]; A.drawFit(ctx, c.asset, x + pw / 2 + (i - (R.unlocked.length - 1) / 2) * 110 - 45, y + 488, 90, 70); });
        }
        if (!R.saved) UI.text(ctx, '⚠ บันทึกไม่สำเร็จ ข้อมูลเดิมยังอยู่', x + pw / 2, y + 470, { size: 22, color: '#D33', outline: false });
        const hasNext = !!RK.Data.stages[R.nextId];
        btns.push({ label: 'เลือกด่าน', color: 'blue', forcePill: true, action: () => RK.Engine.setScene(RK.Scenes.stageSelect, { town: this.stage.town }) });
        btns.push({ label: 'เล่นซ้ำ', color: 'yellow', forcePill: true, action: () => this.restart() });
        if (hasNext) btns.push({ label: 'ด่านต่อไป ▶', color: 'green', forcePill: true, action: () => RK.Engine.setScene(RK.Scenes.stageSelect, { town: this.stage.town, select: R.nextId }) });
      } else {
        A.drawFit(ctx, 'ZOM_NORMAL', x + pw / 2 - 90, y + 60, 180, 200);
        UI.text(ctx, 'ซอมบี้บุกถึงร้านโดนัทแล้ว!', x + pw / 2, y + 300, { size: 34, color: '#B05050', outline: false });
        UI.text(ctx, `กำจัดได้ ${this.stats.killed}/${this.totalZombies} ตัว · เวลา ${this.fmtTime(R.time)}`, x + pw / 2, y + 350, { size: 26, color: '#6B3F1C', outline: false });
        UI.text(ctx, 'เคล็ดลับ: วางเครื่องโดนัท 2–3 เครื่องตั้งแต่ต้น และใช้ตัวป้องกันขวางหน้าตัวยิง', x + pw / 2, y + 410, { size: 22, color: '#9A6A3A', outline: false });
        btns.push({ label: 'ออก', color: 'blue', forcePill: true, action: () => RK.Engine.setScene(RK.Scenes.stageSelect, { town: this.stage.town }) });
        btns.push({ label: 'ลองใหม่', color: 'green', forcePill: true, action: () => this.restart() });
      }
      const bw = 250, gap = 26, tw = btns.length * bw + (btns.length - 1) * gap;
      R.btns = btns.map((b, i) => Object.assign(b, { x: x + (pw - tw) / 2 + i * (bw + gap), y: y + ph - 108, w: bw, h: 80, size: 30 }));
      R.btns.forEach(b => UI.button(ctx, b));
      ctx.restore();
    },
    fmtTime(s) { s = Math.round(s); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }
  };
})();
