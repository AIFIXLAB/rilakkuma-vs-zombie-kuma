// ===== Battle entities: Bear units (incl. factory / supports), Zombie Kuma (all behaviours + bosses), Traps =====
// Coordinates: x is in COLUMN units (0 = left board edge, cols = right edge); zombies walk toward x = baseCol.
(function () {
  const CFG = RK.Data.config;
  let UID = 1;
  RK.resetUid = () => { UID = 1; };
  const C = () => RK.Combat;

  // =========================== Bear unit ===========================
  class Unit {
    constructor(b, def, r, c, owner) {
      this.uid = UID++; this.side = 'bear'; this.id = def.id; this.owner = owner || 0;
      this.row = r; this.col = c; this.x = c + 0.5; this.facing = 1;
      this.data = def; this.asset = def.asset;
      this.maxHp = def.hp; this.hp = def.hp; this.armorHp = def.armorHp || 0; this.maxArmor = this.armorHp; this.shieldHp = 0; this.maxShield = 0;
      this.def = def.def || 0; this.damageReduction = def.damageReduction || 0; this.projectileReduction = def.projectileReduction || 0;
      this.reflect = def.reflect || 0; this.crit = def.crit || 0;
      this.status = {}; this.atkTimer = (def.attackSpeed || 1) * 0.5; this.supTimer = def.support ? (def.support.first || def.support.interval * 0.6 || 1) : 0;
      this.anim = { spawn: 0.35, attack: 0, idlePhase: RK.RNG.next() * 6 };
      this.hitFlash = 0; this.lastHitT = -99; this.showHpT = 0; this.burstLeft = 0; this.burstT = 0; this.buffAS = 0; this.rally = 0;
      this.isFactory = !!def.isFactory; this.spent = def.cost;
      if (this.isFactory) { this.level = b.factoryStartLevel || 1; this.prodTimer = CFG.firstProductionDelay; this.ejectAnim = 0; }
    }
    get assetId() { return this.isFactory ? CFG.factoryLevels[this.level].asset : this.asset; }
    get lvl() { return CFG.factoryLevels[this.level]; }
    get terrain() { const g = this.b && this.b.grid; return g ? g.cells[this.row][this.col].terrainType : 'Normal Ground'; }

    update(b, dt) {
      this.b = b;
      const d = this.data, a = d.attack;
      this.anim.spawn = Math.max(0, this.anim.spawn - dt); this.anim.attack = Math.max(0, this.anim.attack - dt);
      this.hitFlash = Math.max(0, this.hitFlash - dt); this.showHpT = Math.max(0, this.showHpT - dt); this.rally = Math.max(0, this.rally - dt);
      // terrain (doc 4.4)
      const tt = this.terrain;
      if (tt === 'Lava') { this._lava = (this._lava || 0) + dt; if (this._lava >= 1) { this._lava -= 1; C().applyDamage(b, this, Math.max(6, this.maxHp * 0.025), { type: 'heavy', ignoreDef: true, terrain: true }); } }
      if (tt === 'Poison Ground') { this._psn = (this._psn || 0) + dt; if (this._psn >= 1) { this._psn -= 1; C().applyDamage(b, this, Math.max(4, this.maxHp * 0.015), { type: 'poison', ignoreDef: true, terrain: true }); } }
      if (d.regen) this.hp = Math.min(this.maxHp, this.hp + this.maxHp * d.regen * dt);
      if (this.dying) return;
      if (this.isFactory) return this.updateFactory(b, dt);
      if (d.support) this.updateSupport(b, dt);
      let rate = C().attackRateMult(this) * (1 + this.buffAS + (this.rally > 0 ? 0.4 : 0)) * (tt === 'Ice' ? 0.9 : 1);
      // zombie slow auras in this row
      for (const z of b.zombiesInRow(this.row)) if (z.data.slowAura && Math.abs(z.x - this.x) <= z.data.slowAura.cells) { rate *= 1 - z.data.slowAura.strength; break; }
      if (d.aura && d.aura.type === 'wetFloor') {
        for (const z of b.zombiesInRow(this.row)) { const dx = (z.x - this.x) * this.facing; if (dx > 0.1 && dx <= 0.5 + d.aura.cellsAhead) C().addStatus(z, { type: 'wet', strength: d.aura.slow, duration: 0.25 }); }
      }
      if (this.burstLeft > 0) { this.burstT -= dt; if (this.burstT <= 0) { this.fireAt(b, this.findTarget(b)); this.burstLeft--; this.burstT = a.burstGap || 0.15; } }
      if (!d.atk || a.pattern === 'none') return;
      this.atkTimer -= dt * rate;
      if (this.atkTimer > 0) return;
      const target = this.findTarget(b);
      if (!target) {
        // VS only: the zombie base is a valid target for shooters whose range reaches the far edge
        if (b.mode === 'vs' && this.facing > 0 && ['single', 'burst', 'piercing', 'splash', 'spread'].includes(a.pattern) && this.x + d.range + 0.6 >= b.cols + 0.3) {
          this.atkTimer = d.attackSpeed; this.anim.attack = 0.22;
          b.spawnProjectile({ side: 'bear', row: this.row, x: this.x + 0.35, speed: (a.projectileSpeed || 7), damage: d.atk, type: a.damageType, pattern: 'single', img: 'DONUT_NORMAL',
            scale: a.projectileScale || 1, tint: a.projectileTint, range: d.range + 0.6, startX: this.x, hitsAir: true, source: this });
          return;
        }
        this.atkTimer = 0; return;                          // no target: do not shoot (doc 8.2)
      }
      this.atkTimer = d.attackSpeed;
      this.attack(b, target);
    }
    canHitAir() { const p = this.data.attack.pattern; return ['single', 'burst', 'piercing', 'spread', 'chain', 'beam', 'splash'].includes(p); }
    inFront(z, extra) { const dx = (z.x - this.x) * this.facing; return dx > -0.25 && dx <= this.data.range + 0.35 + (extra || 0); }
    // Targeting (doc 8.2): same row, in the facing direction, within range, closest to the base first (or closest when facing back)
    findTarget(b, row) {
      let best = null, air = this.canHitAir();
      for (const z of b.zombiesInRow(row == null ? this.row : row)) {
        if (!z.targetable) continue;
        if (z.flying && !air) continue;
        if (z.x > b.boardMax && this.facing > 0) continue;
        if (!this.inFront(z)) continue;
        if (!best) best = z;
        else if (this.facing > 0 ? z.x < best.x : z.x > best.x) best = z;
      }
      return best;
    }
    dmgOpts(extra) { const a = this.data.attack; return Object.assign({ type: a.damageType, canCrit: true, crit: this.crit, ignoreDef: a.ignoreDef, source: this, antiAir: this.data.antiAir, status: a.status,
      atkMul: this.terrain === 'Special Ground' ? 1.25 : 1 }, extra || {}); }
    attack(b, target) {
      const d = this.data, a = d.attack; this.anim.attack = 0.22; this.showHpT = 1.5;
      RK.Audio.play('attack');
      const atk = d.atk;
      switch (a.pattern) {
        case 'melee': {
          const hits = a.hitAll ? b.zombiesInRow(this.row).filter(z => z.targetable && !z.flying && this.inFront(z)) : [target];
          hits.forEach(z => { C().applyDamage(b, z, atk, this.dmgOpts({ status: a.status })); if (a.stunChance && RK.RNG.next() < a.stunChance) C().addStatus(z, { type: 'stun', strength: 1, duration: a.stunDuration || 0.8 }); });
          b.fx('slash', target); break;
        }
        case 'spray': {
          b.zombiesInRow(this.row).filter(z => z.targetable && !z.flying && this.inFront(z)).forEach(z => {
            C().applyDamage(b, z, atk, this.dmgOpts());
            if (RK.RNG.next() < (a.stunChance || 0)) C().addStatus(z, { type: 'stun', strength: 1, duration: a.stunDuration });
          });
          b.fx('spray', this); break;
        }
        case 'knockback': {
          const hits = a.hitAll ? b.zombiesInRow(this.row).filter(z => z.targetable && !z.flying && this.inFront(z)) : [target];
          hits.forEach(z => { C().applyDamage(b, z, atk, this.dmgOpts()); b.knock(z, a.distance * this.facing); C().addStatus(z, { type: 'stun', strength: 1, duration: 0.4 }); });
          b.fx('wind', this); break;
        }
        case 'beam': {
          b.zombiesInRow(this.row).filter(z => z.targetable && this.inFront(z)).forEach(z => { C().applyDamage(b, z, atk, this.dmgOpts({ quiet: true })); if (a.push) b.knock(z, a.push * this.facing); });
          b.fx('beam', this); break;
        }
        case 'chain': {
          let cur = target; const hit = new Set();
          for (let j = 0; j <= a.jumps && cur; j++) {
            hit.add(cur.uid); C().applyDamage(b, cur, atk * (j ? 0.7 : 1), this.dmgOpts({ type: 'magic' }));
            if (a.stunChance && RK.RNG.next() < a.stunChance) C().addStatus(cur, { type: 'stun', strength: 1, duration: 0.8 });
            b.fxLine(this, cur, j ? cur.__prev : null); const prev = cur;
            cur = b.zombies.filter(z => !z.dying && z.targetable && !hit.has(z.uid) && Math.abs(z.row - prev.row) <= 1 && Math.abs(z.x - prev.x) <= 2).sort((p, q) => Math.abs(p.x - prev.x) - Math.abs(q.x - prev.x))[0];
            if (cur) cur.__prev = prev;
          }
          break;
        }
        case 'spread': {
          for (const dr of [-1, 0, 1]) { const r = this.row + dr; if (r < 0 || r >= b.grid.rows) continue; this.fireAt(b, dr === 0 ? target : null, r); }
          break;
        }
        case 'burst': this.fireAt(b, target); this.burstLeft = a.shots - 1; this.burstT = a.burstGap; break;
        default:
          this.fireAt(b, target);
          if ((a.multi || 1) > 1) { this.burstLeft = a.multi - 1; this.burstT = 0.15; }
      }
    }
    fireAt(b, target, row) {
      const a = this.data.attack; row = row == null ? this.row : row;
      if (!target && row === this.row) return;
      const dir = this.facing, lob = a.pattern === 'lob';
      b.spawnProjectile({ side: 'bear', row, x: this.x + 0.35 * dir, speed: (a.projectileSpeed || 7) * dir, damage: this.data.atk * (this.terrain === 'Special Ground' ? 1.25 : 1), type: a.damageType,
        pattern: lob ? 'splash' : a.pattern, splash: a.splashRadius || 0, status: a.status, ignoreDef: a.ignoreDef, img: (RK.Data.projectiles[a.projectile] || {}).asset || 'DONUT_NORMAL',
        scale: a.projectileScale || 1, tint: a.projectileTint, range: this.data.range + 0.6, startX: this.x, knock: a.knock || 0, crit: this.crit, antiAir: this.data.antiAir,
        lob, targetX: lob && target ? target.x : null, hitsAir: !lob, source: this, arc: lob });
      RK.Audio.play('projectile');
    }
    neighbors(b, radius) { return b.units.filter(u => u !== this && !u.dying && Math.abs(u.row - this.row) <= radius && Math.abs(u.col - this.col) <= radius); }
    updateSupport(b, dt) {
      const s = this.data.support;
      if (s.type === 'buffAS') return;   // aura computed by battle each tick
      this.supTimer -= dt;
      if (this.supTimer > 0) return;
      this.supTimer = s.interval;
      if (s.type === 'heal') {
        const t = this.neighbors(b, s.radius).concat([this]).filter(u => u.hp < u.maxHp).sort((p, q) => p.hp / p.maxHp - q.hp / q.maxHp)[0];
        if (t) { const n = Math.round(s.amount); t.hp = Math.min(t.maxHp, t.hp + n); b.addDmgText(b.ux(t), b.uy(t) - 70, '+' + n, RK.Combat.COLORS.heal, 26); b.fx('heal', t); this.anim.attack = 0.22; }
        else this.supTimer = 0.5;
      } else if (s.type === 'shield') {
        this.neighbors(b, s.radius).concat([this]).forEach(u => { u.shieldHp = Math.max(u.shieldHp, Math.round(s.amount)); u.maxShield = Math.max(u.maxShield, u.shieldHp); b.fx('shield', u); });
        this.anim.attack = 0.22;
      } else if (s.type === 'produce') {
        const ty = this.data.rainbowChance && RK.RNG.next() < this.data.rainbowChance ? 'rainbow' : s.donut || 'normal';
        b.spawnDonut(this, 0, ty); this.ejectAnim = 0.6; this.anim.attack = 0.3;
      } else if (s.type === 'sweep') {
        const hits = b.zombiesInRow(this.row).filter(z => z.targetable && !z.flying && (z.x - this.x) * this.facing > -0.2 && (z.x - this.x) * this.facing <= s.cells + 0.5);
        if (!hits.length) { this.supTimer = 0.5; return; }
        hits.forEach(z => { C().applyDamage(b, z, this.data.atk, this.dmgOpts({ type: 'normal' })); b.knock(z, s.push * this.facing); if (s.stun) C().addStatus(z, { type: 'stun', strength: 1, duration: s.stun }); });
        b.fx('wind', this); this.anim.attack = 0.3;
      }
    }
    updateFactory(b, dt) {
      this.ejectAnim = Math.max(0, this.ejectAnim - dt);
      if (C().attackRateMult(this) === 0) return;
      this.prodTimer -= dt * (this.data.produceMul || 1);
      if (this.prodTimer <= 0) {
        this.prodTimer = this.lvl.productionTime;
        const sp = RK.Data.factorySpecial[this.level];
        for (let i = 0; i < this.lvl.donutsPerCycle; i++) {
          const r = RK.RNG.next(); let ty = 'normal';
          const g = sp.golden + (this.data.goldenBonus || 0);
          if (r < sp.rainbow) ty = 'rainbow'; else if (r < sp.rainbow + g) ty = 'golden'; else if (r < sp.rainbow + g + sp.chocolate) ty = 'chocolate';
          if (b.stage.mode === 'event' && RK.RNG.next() < 0.15) ty = 'event';
          b.spawnDonut(this, i, ty);
        }
        this.ejectAnim = 0.6; RK.Audio.play('factoryProduce');
      }
    }
  }

  // =========================== Zombie Kuma ===========================
  class Zombie {
    constructor(b, def, r, scale, opts) {
      opts = opts || {};
      this.uid = UID++; this.side = 'zombie'; this.data = def; this.id = def.id; this.row = r;
      this.x = opts.x != null ? opts.x : b.map.spawnCol + RK.RNG.range(0, 0.25);
      const hpM = (scale && scale.hp) || 1, atkM = (scale && scale.atk) || 1;
      this.maxHp = Math.round(def.hp * hpM); this.hp = this.maxHp; this.atk = def.atk * atkM;
      this.armorHp = Math.round((def.armorHp || 0) * hpM); this.maxArmor = this.armorHp; this.armorReduction = def.armorReduction || 0;
      this.shieldHp = Math.round((def.shieldHp || 0) * hpM); this.maxShield = this.shieldHp; this.shieldReduction = def.shieldReduction || 0;
      this.def = def.def || 0; this.damageReduction = 0; this.reflect = def.reflect || 0;
      this.status = {}; this.atkTimer = 0.4; this.state = 'walk'; this.anim = { phase: RK.RNG.next() * 6, attack: 0, spawn: 0.5, jump: 0 };
      this.hitFlash = 0; this.lastHitT = -99; this.showHpT = 0; this.isRanged = !!def.projectile;
      this.flying = !!def.fly; this.jumped = !def.jump; this.burrowed = !!def.burrow; this.blinkT = RK.RNG.range(2, 5); this.hidden = false;
      this.healT = def.heal ? def.heal.interval : 0; this.summonT = def.summon ? def.summon.interval : 0;
      this.boss = def.boss ? { phase: 0, skillT: def.boss.skillInterval * 0.6, speedMul: 1 } : null;
      this.isBoss = !!def.isBoss; this.isMini = !!def.miniBoss; this.speedBuff = 0;
      this.dir = -1; this.b_max = b.boardMax + 0.4;   // walks toward smaller x
    }
    get targetable() { return !this.burrowed && !this.hidden && !this.dying && this.x <= this.b_max; }
    update(b, dt) {
      const d = this.data; this.b_max = b.boardMax + 0.4;
      this.hitFlash = Math.max(0, this.hitFlash - dt); this.anim.attack = Math.max(0, this.anim.attack - dt); this.anim.spawn = Math.max(0, this.anim.spawn - dt);
      this.showHpT = Math.max(0, this.showHpT - dt); this.speedBuff = Math.max(0, this.speedBuff - dt);
      // behaviours
      if (d.blink) { this.blinkT -= dt; if (this.blinkT <= 0) { this.hidden = !this.hidden; this.blinkT = this.hidden ? 1.5 : RK.RNG.range(3.5, 5.5); } }
      if (this.burrowed && this.x <= d.burrow.surfaceAt) { this.burrowed = false; b.fx('dirt', this); }
      if (d.heal) { this.healT -= dt; if (this.healT <= 0) { this.healT = d.heal.interval;
        // radius 0 = heals itself only; a zombie can receive at most one heal per second (no stacking loops)
        const tgt = d.heal.radius ? b.zombies.filter(z => !z.dying && Math.abs(z.row - this.row) <= Math.floor(d.heal.radius) && Math.abs(z.x - this.x) <= d.heal.radius) : [this];
        tgt.forEach(z => { if (z.hp < z.maxHp && b.t - (z.lastHealT || -9) >= 1) { z.lastHealT = b.t; z.hp = Math.min(z.maxHp, z.hp + d.heal.amount * (b.scale.hp || 1)); b.fx('heal', z); } }); } }
      if (d.summon && this.x < b.boardMax) { this.summonT -= dt; if (this.summonT <= 0) { this.summonT = d.summon.interval; for (let i = 0; i < d.summon.count; i++) b.spawnZombie(d.summon.enemy, this.row, { x: this.x + 0.3 + i * 0.2, minion: true }); b.fx('summon', this); } }
      if (this.boss) this.updateBoss(b, dt);
      const sm = RK.Combat.speedMult(this) * (this.speedBuff > 0 ? 1.4 : 1) * (this.boss ? this.boss.speedMul : 1);
      const cell = b.grid.cellAt(b.ux(this), b.uy(this));
      let terr = 1; if (cell && !this.flying) { const tt = b.grid.cells[cell.r][cell.c].terrainType; if (tt === 'Ice') terr = 1.3; else if (tt === 'Sand') terr = 0.8; }
      if (sm > 0) this.anim.phase += dt * 6 * sm;
      if (this.anim.jump > 0) { this.anim.jump -= dt; this.x -= this.jumpSpeed * dt; return; }
      // blocking (flying and burrowed zombies are never blocked; net trap handled by trap)
      const blocker = (this.flying || this.burrowed) ? null : b.blockerFor(this);
      if (blocker && !this.jumped) { this.jumped = true; this.anim.jump = 0.7; this.jumpSpeed = (this.x - (blocker.col - 0.15)) / 0.7; b.fx('jump', this); return; }
      let target = blocker, atBase = false;
      if (this.isRanged && !this.burrowed) {
        const t = b.rangedTargetFor(this);
        if (t) target = t; else if (!blocker && this.x - b.map.baseCol <= d.range) atBase = true;
      } else if (!blocker && this.x <= b.map.baseCol + 0.45) atBase = true;
      if ((target || atBase) && !this.burrowed) {
        this.state = this.isRanged ? 'throw' : 'attack';
        this.atkTimer -= dt * (sm > 0 ? 1 : 0) * (this.speedBuff > 0 ? 1.3 : 1);
        if (this.atkTimer <= 0) {
          this.atkTimer = d.attackSpeed; this.anim.attack = 0.3; this.showHpT = 1.5;
          if (this.isRanged) this.throwAt(b, target, atBase);
          else if (atBase) b.damageBase(this.atk, this);
          else {
            const hits = d.hitsAllInCell ? b.unitsInRow(this.row).filter(u => u.col === target.col) : [target];
            hits.forEach(u => {
              const dealt = RK.Combat.applyDamage(b, u, this.atk, { type: 'normal', source: this, status: d.hitStatus, melee: true });
              if (d.lifesteal && dealt) this.hp = Math.min(this.maxHp, this.hp + dealt * d.lifesteal);
            });
            RK.Audio.play('zombie');
          }
        }
      } else {
        this.state = 'walk';
        this.x -= d.speed * sm * terr * dt;
        if (this.isRanged) this.atkTimer = Math.min(this.atkTimer, 0.6);
      }
    }
    updateBoss(b, dt) {
      const B = this.boss, ph = this.data.boss.phases, k = this.hp / this.maxHp;
      while (B.phase + 1 < ph.length && k <= ph[B.phase + 1].at) { B.phase++; B.speedMul = ph[B.phase].speed; b.bossPhase(this, B.phase); }
      if (this.x > b.boardMax) return;
      B.skillT -= dt;
      if (B.skillT <= 0) { B.skillT = this.data.boss.skillInterval; const sk = ph[B.phase].skills; b.bossSkill(this, sk[Math.floor(RK.RNG.next() * sk.length)]); }
    }
    throwAt(b, target, atBase) {
      const p = this.data.projectile;
      b.spawnProjectile({ side: 'zombie', row: this.row, x: this.x - 0.35, speed: -p.speed, damage: this.atk, type: p.damageType, status: p.status, ignoreDef: p.damageType === 'magic',
        img: p.asset, tint: p.tint, scale: 1, targetUid: target ? target.uid : null, toBase: atBase, startX: this.x - 0.35, endX: target ? target.col + 0.5 : b.map.baseCol, source: this, arc: true });
      RK.Audio.play('projectile');
    }
  }

  // =========================== Trap ===========================
  class Trap {
    constructor(b, def, r, c) {
      this.uid = UID++; this.side = 'trap'; this.data = def; this.id = def.id; this.row = r; this.col = c; this.x = c + 0.5;
      this.uses = def.uses || 1; this.cd = 0; this.timer = def.interval || 0; this.hp = def.hp || 0; this.maxHp = this.hp; this.alive = true; this.anim = 0;
      this.state = 'idle';   // doc 23: Idle / Trigger / Active / Cooldown / Destroyed
    }
    victims(b, range) {
      const d = this.data;
      return b.zombies.filter(z => !z.dying && !z.burrowed && (d.area ? Math.abs(z.row - this.row) <= Math.floor(d.area) : z.row === this.row) && Math.abs(z.x - this.x) <= (range || d.triggerRange) &&
        (d.targetType === 'all' || !z.flying));
    }
    hit(b, z) {
      const d = this.data; let dmg = d.damage * (b.scale.trapMul || 1);
      if (z.isBoss || z.isMini) dmg *= d.bossMul || 1;
      if (z.flying && d.antiAir) dmg *= d.antiAir;
      if (dmg) RK.Combat.applyDamage(b, z, dmg, { type: 'normal', ignoreDef: true, source: this });
      if (d.status) RK.Combat.addStatus(z, d.status);
      if (d.knock && !z.isBoss) b.knock(z, d.knock);
    }
    update(b, dt) {
      if (!this.alive) return;
      const d = this.data; this.anim = Math.max(0, this.anim - dt);
      if (d.behavior === 'continuous') {
        // zombies standing on it wear it down (doc 12.1: continuous traps can be destroyed)
        b.zombies.forEach(z => { if (!z.dying && !z.flying && z.row === this.row && Math.abs(z.x - this.x) < 0.45 && z.state === 'walk') this.hp -= z.atk * 0.35 * dt; });
        if (this.hp <= 0) { this.alive = false; this.state = 'destroyed'; b.fx('death', this); return; }
        this.timer -= dt;
        if (this.timer <= 0) {
          const v = this.victims(b);
          if (v.length) { v.forEach(z => this.hit(b, z)); this.anim = 0.3; this.state = 'active'; b.stats.trapHits++; } else this.state = 'idle';
          this.timer = d.interval;
        }
        return;
      }
      if (this.cd > 0) { this.cd -= dt; this.state = 'cooldown'; return; }
      this.state = 'idle';
      const v = this.victims(b); if (!v.length) return;
      // trigger
      this.anim = 0.4; this.state = 'trigger'; b.stats.trapHits++;
      if (d.lane) b.zombiesInRow(this.row).filter(z => !z.flying).forEach(z => this.hit(b, z));
      else if (d.area) v.forEach(z => this.hit(b, z));
      else this.hit(b, v.sort((p, q) => p.x - q.x)[0]);
      if (d.rally) b.units.filter(u => u.row === this.row).forEach(u => u.rally = d.rally.duration);
      b.fx(d.lane ? 'roll' : 'trap', this);
      this.uses--; if (d.behavior === 'oneTime' || this.uses <= 0) { this.alive = false; this.state = 'destroyed'; } else this.cd = d.cooldown || 3;
    }
  }

  RK.Unit = Unit; RK.Zombie = Zombie; RK.Trap = Trap;
})();
