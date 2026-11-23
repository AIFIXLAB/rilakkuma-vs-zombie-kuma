// ===== Battle entities: Bear units (incl. Donut Factory), Zombie Kuma, Projectiles, Donuts =====
(function () {
  const CFG = RK.Data.config;
  let UID = 1;
  RK.resetUid = () => { UID = 1; };

  // ---------------- Bear unit ----------------
  class Unit {
    constructor(battle, def, r, c) {
      this.uid = UID++; this.side = 'bear'; this.id = def.id;
      this.row = r; this.col = c; this.x = c + 0.5;
      this.maxHp = def.hp; this.hp = def.hp; this.armorHp = def.armorHp || 0; this.maxArmor = this.armorHp;
      this.def = def.def || 0; this.data = def;   // this.def = defense value
      this.damageReduction = def.damageReduction || 0; this.projectileReduction = def.projectileReduction || 0;
      this.status = {}; this.atkTimer = (def.attackSpeed || 1) * 0.5; this.anim = { spawn: 0.35, attack: 0, idlePhase: RK.RNG.next() * 6 };
      this.hitFlash = 0; this.lastHitT = -99; this.showHpT = 0; this.burstLeft = 0; this.burstT = 0;
      this.isFactory = !!def.isFactory;
      if (this.isFactory) { this.level = 1; this.prodTimer = CFG.firstProductionDelay; this.ejectAnim = 0; }
      this.asset = def.asset;
    }
    get assetId() { return this.isFactory ? CFG.factoryLevels[this.level].asset : this.asset; }
    get lvl() { return CFG.factoryLevels[this.level]; }

    update(b, dt) {
      const d = this.data;
      this.anim.spawn = Math.max(0, this.anim.spawn - dt); this.anim.attack = Math.max(0, this.anim.attack - dt);
      this.hitFlash = Math.max(0, this.hitFlash - dt); this.showHpT = Math.max(0, this.showHpT - dt);
      if (this.isFactory) return this.updateFactory(b, dt);
      const rate = RK.Combat.attackRateMult(this);
      // wet-floor aura (Mop Cat) — applied every tick to zombies in front (doc 7.5)
      if (d.aura && d.aura.type === 'wetFloor') {
        for (const z of b.zombiesInRow(this.row)) if (z.x > this.col + 0.6 && z.x <= this.col + 1 + d.aura.cellsAhead) RK.Combat.addStatus(z, { type: 'wet', strength: d.aura.slow, duration: 0.25 });
      }
      // burst follow-up shots
      if (this.burstLeft > 0) { this.burstT -= dt; if (this.burstT <= 0) { this.fireAt(b, this.findTarget(b)); this.burstLeft--; this.burstT = d.attack.burstGap; } }
      if (!d.atk || d.attack.pattern === 'none') return;
      this.atkTimer -= dt * rate;
      if (this.atkTimer > 0) return;
      const target = this.findTarget(b);
      if (!target) { this.atkTimer = 0; return; }        // no target: do not shoot (doc 8.2)
      this.atkTimer = d.attackSpeed;
      this.attack(b, target);
    }
    // Targeting (doc 8.2): same row, ahead of the unit, within range, closest to the base first
    findTarget(b) {
      let best = null;
      for (const z of b.zombiesInRow(this.row)) {
        if (z.x > CFG_BOARD_MAX || z.x < this.col + 0.25) continue;
        if (z.x - (this.col + 0.5) > this.data.range + 0.35) continue;
        if (!best || z.x < best.x) best = z;
      }
      return best;
    }
    attack(b, target) {
      const a = this.data.attack; this.anim.attack = 0.22; this.showHpT = 1.5;
      RK.Audio.play('attack');
      switch (a.pattern) {
        case 'melee': {
          const hits = a.hitAll ? b.zombiesInRow(this.row).filter(z => z.x >= this.col + 0.25 && z.x - (this.col + 0.5) <= this.data.range + 0.35) : [target];
          hits.forEach(z => RK.Combat.applyDamage(b, z, this.data.atk, { type: a.damageType, canCrit: true, source: this }));
          b.fx('slash', target); break;
        }
        case 'spray': {
          const hits = b.zombiesInRow(this.row).filter(z => z.x >= this.col + 0.25 && z.x - (this.col + 0.5) <= this.data.range + 0.35);
          hits.forEach(z => {
            RK.Combat.applyDamage(b, z, this.data.atk, { type: a.damageType, status: a.status, source: this });
            if (RK.RNG.next() < a.stunChance) RK.Combat.addStatus(z, { type: 'stun', strength: 1, duration: a.stunDuration });
          });
          b.fx('spray', this); break;
        }
        case 'knockback': {
          RK.Combat.applyDamage(b, target, this.data.atk, { type: a.damageType, source: this });
          if (!target.data.isBoss) target.x = Math.min(b.map.spawnCol, target.x + a.distance);
          RK.Combat.addStatus(target, { type: 'stun', strength: 1, duration: 0.4 });
          b.fx('wind', this); break;
        }
        case 'burst': this.fireAt(b, target); this.burstLeft = a.shots - 1; this.burstT = a.burstGap; break;
        default: this.fireAt(b, target);
      }
    }
    fireAt(b, target) {
      if (!target) return;
      const a = this.data.attack;
      b.spawnProjectile({ side: 'bear', row: this.row, x: this.col + 0.85, speed: a.projectileSpeed || 7, damage: this.data.atk, type: a.damageType,
        pattern: a.pattern, splash: a.splashRadius || 0, status: a.status, ignoreDef: a.ignoreDef, img: (RK.Data.projectiles[a.projectile] || {}).asset || 'DONUT_NORMAL',
        scale: a.projectileScale || 1, tint: a.projectileTint, maxX: this.col + 0.5 + this.data.range + 0.6, source: this });
      RK.Audio.play('projectile');
    }
    updateFactory(b, dt) {
      this.ejectAnim = Math.max(0, this.ejectAnim - dt);
      if (RK.Combat.attackRateMult(this) === 0) return;
      this.prodTimer -= dt;
      if (this.prodTimer <= 0) {
        this.prodTimer = this.lvl.productionTime;
        for (let i = 0; i < this.lvl.donutsPerCycle; i++) b.spawnDonut(this, i);
        this.ejectAnim = 0.6; RK.Audio.play('factoryProduce');
      }
    }
  }
  const CFG_BOARD_MAX = 9.35;   // zombies further right than this are still in the portal and can't be targeted

  // ---------------- Zombie Kuma ----------------
  class Zombie {
    constructor(battle, def, r, hpMult) {
      this.uid = UID++; this.side = 'zombie'; this.data = def; this.id = def.id; this.row = r; this.x = battle.map.spawnCol + RK.RNG.range(0, 0.25);
      this.maxHp = Math.round(def.hp * (hpMult || 1)); this.hp = this.maxHp;
      this.armorHp = def.armorHp || 0; this.maxArmor = this.armorHp; this.armorReduction = def.armorReduction || 0;
      this.shieldHp = def.shieldHp || 0; this.maxShield = this.shieldHp; this.shieldReduction = def.shieldReduction || 0;
      this.def = def.def || 0; this.damageReduction = 0;
      this.status = {}; this.atkTimer = 0.4; this.state = 'walk'; this.anim = { phase: RK.RNG.next() * 6, attack: 0, spawn: 0.5 };
      this.hitFlash = 0; this.lastHitT = -99; this.showHpT = 0; this.isRanged = def.role === 'Ranged';
    }
    update(b, dt) {
      const d = this.data;
      this.hitFlash = Math.max(0, this.hitFlash - dt); this.anim.attack = Math.max(0, this.anim.attack - dt); this.anim.spawn = Math.max(0, this.anim.spawn - dt);
      this.showHpT = Math.max(0, this.showHpT - dt);
      const sm = RK.Combat.speedMult(this);
      if (sm > 0) this.anim.phase += dt * 6 * sm;
      // melee contact: frontmost bear whose cell this zombie is touching
      const blocker = b.blockerFor(this);
      let target = blocker, atBase = false;
      if (this.isRanged) {
        // AI rules doc 10.7: stop only when a target is in range in the same row; otherwise keep walking
        const t = b.rangedTargetFor(this);
        if (t) target = t;
        else if (!blocker && this.x - b.map.baseCol <= d.range) atBase = true;
      } else if (!blocker && this.x <= b.map.baseCol + 0.45) atBase = true;
      if (target || atBase) {
        this.state = this.isRanged ? 'throw' : 'attack';
        this.atkTimer -= dt * (sm > 0 ? 1 : 0);
        if (this.atkTimer <= 0) {
          this.atkTimer = d.attackSpeed; this.anim.attack = 0.3; this.showHpT = 1.5;
          if (this.isRanged) this.throwAt(b, target, atBase);
          else if (atBase) b.damageBase(d.atk, this);
          else {
            const hits = d.hitsAllInCell ? b.unitsInRow(this.row).filter(u => u.col === target.col) : [target];
            hits.forEach(u => RK.Combat.applyDamage(b, u, d.atk, { type: 'normal', source: this }));
            RK.Audio.play('zombie');
          }
        }
      } else {
        this.state = 'walk';
        this.x -= d.speed * sm * dt;
        if (this.isRanged) this.atkTimer = Math.min(this.atkTimer, 0.6);
      }
    }
    throwAt(b, target, atBase) {
      const p = this.data.projectile;
      b.spawnProjectile({ side: 'zombie', row: this.row, x: this.x - 0.35, speed: -p.speed, damage: this.data.atk, type: p.damageType, status: p.status,
        img: p.asset, scale: 1, targetUid: target ? target.uid : null, toBase: atBase, startX: this.x - 0.35, endX: target ? target.col + 0.5 : b.map.baseCol, source: this, arc: true });
      RK.Audio.play('projectile');
    }
  }

  RK.Unit = Unit; RK.Zombie = Zombie;
})();
