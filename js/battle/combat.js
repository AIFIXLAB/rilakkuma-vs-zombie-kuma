// ===== HP, Damage and Status system (doc PART 11) =====
(function () {
  const CFG = RK.Data.config.combat;
  const COLORS = { normal: '#FFFFFF', crit: '#FFE14D', heavy: '#FF4B4B', ice: '#7FD7FF', poison: '#7CF06B', magic: '#D18BFF', heal: '#9BFF9B' };

  const Combat = RK.Combat = {
    COLORS,
    /**
     * Apply damage following doc 11.2:
     *   Final = Base × Multiplier × Crit
     *   AfterDef = max(MinimumDamage, Final − EffectiveDefense)
     *   Final = AfterDef × (1 − DamageReduction)
     * Armor / Shield HP absorbs damage before HP. Returns damage dealt (0 if target already dead).
     */
    applyDamage(battle, target, base, o) {
      o = o || {};
      if (!target || target.dead || target.dying) return 0;           // never die twice (doc 11.5)
      const crit = o.canCrit && RK.RNG.next() < CFG.critChance;
      let dmg = base * (o.multiplier || 1) * (crit ? CFG.critMultiplier : 1);
      const def = o.ignoreDef ? 0 : (target.def || 0);
      dmg = Math.max(CFG.minimumDamage, dmg - def);
      let dr = target.damageReduction || 0;
      if (o.projectile && target.projectileReduction) dr += target.projectileReduction;
      if (target.armorHp > 0 && target.armorReduction) dr += target.armorReduction;
      if (target.shieldHp > 0 && target.shieldReduction && o.fromFront !== false) dr += target.shieldReduction;
      dmg = Math.max(CFG.minimumDamage, dmg * (1 - Math.min(0.9, dr)));
      dmg = Math.round(dmg);
      let left = dmg;
      if (target.shieldHp > 0 && o.fromFront !== false) { const a = Math.min(target.shieldHp, left); target.shieldHp -= a; left -= a; if (target.shieldHp <= 0) battle.fx('break', target); }
      if (left > 0 && target.armorHp > 0) { const a = Math.min(target.armorHp, left); target.armorHp -= a; left -= a; if (target.armorHp <= 0) battle.fx('break', target); }
      target.hp -= left;
      target.lastHitT = battle.t; target.hitFlash = 0.14;
      const type = crit ? 'crit' : (o.type === 'heavy' || dmg >= CFG.heavyDamageThreshold ? 'heavy' : (o.type || 'normal'));
      battle.damageNumber(target, dmg, type);
      battle.stats.damageDealt[target.side] = (battle.stats.damageDealt[target.side] || 0) + dmg;
      if (o.status) Combat.addStatus(target, o.status);
      if (target.hp <= 0) battle.kill(target, o.source);
      return dmg;
    },

    // Status stacking rule: same status type refreshes duration; the stronger strength wins.
    // Status entries: { type, strength, duration, t(remaining), tick }
    addStatus(target, s) {
      if (!s || target.dead || target.dying) return;
      if (s.chance !== undefined && RK.RNG.next() > s.chance) return;
      if (target.statusImmune && target.statusImmune.includes(s.type)) return;
      const cur = target.status[s.type];
      if (s.type === 'knockback') return;   // handled directly
      if (cur) { cur.t = Math.max(cur.t, s.duration); cur.strength = Math.max(cur.strength, s.strength); }
      else target.status[s.type] = { type: s.type, strength: s.strength, t: s.duration, tick: 0 };
    },
    tickStatus(battle, e, dt) {
      for (const k in e.status) {
        const s = e.status[k];
        s.t -= dt;
        if (k === 'poison' || k === 'burn' || k === 'bleed') {
          s.tick += dt;
          if (s.tick >= 1) { s.tick -= 1; Combat.applyDamage(battle, e, s.strength, { type: 'poison', ignoreDef: true }); }
        }
        if (k === 'regeneration') { s.tick += dt; if (s.tick >= 1) { s.tick -= 1; e.hp = Math.min(e.maxHp, e.hp + s.strength); } }
        if (s.t <= 0) delete e.status[k];
      }
    },
    speedMult(e) {
      if (e.status.stun || e.status.freeze) return 0;
      let m = 1;
      if (e.status.slow) m *= (1 - e.status.slow.strength);
      if (e.status.wet) m *= (1 - e.status.wet.strength);
      return Math.max(0.1, m);
    },
    // bears: slow makes attacks slower
    attackRateMult(e) {
      if (e.status.stun || e.status.freeze) return 0;
      return e.status.slow ? (1 - e.status.slow.strength * 0.7) : 1;
    }
  };
})();
