// ===== Character progression: Level, Star Evolution, Skill, Upgrade Branch, Awakening, Equipment, Costume (doc 15.8, 20.3) =====
// Nothing is deducted until the player confirms (doc 15.8): screens call preview*() first, then do*() on Confirm.
(function () {
  const D = RK.Data;
  const STAR_FRAG = [0, 0, 10, 20, 40, 80, 150];          // fragments to reach star index
  const STAR_GOLD = [0, 0, 1000, 3000, 8000, 20000, 50000];
  const STAR_CRYSTAL = [0, 0, 0, 2, 5, 10, 20];
  const Prog = RK.Prog = {
    MAX_STAR: 6, MAX_SKILL: 5,
    maxLevel(star) { return 10 + star * 5; },
    rec(id) { return RK.Save.char(id); },
    // ---- costs ----
    levelCost(lv) { return { gold: Math.round(15 * Math.pow(lv, 1.5) + 50), cookie: 2 + Math.floor(lv / 3), honey: lv >= 15 ? Math.floor((lv - 12) / 3) : 0 }; },
    starCost(star) { return { frag: STAR_FRAG[star + 1], gold: STAR_GOLD[star + 1], crystal: STAR_CRYSTAL[star + 1] }; },
    skillCost(s) { return { gold: 800 * s, recipe: s * 2 }; },
    branchCost() { return { gold: 3000, iron: 5 }; },
    awakenCost() { return { gold: 30000, crystal: 10, rainbow: 3 }; },
    // ---- final stats used in battle (doc 27: all numbers from the database) ----
    stats(id, rec) {
      const base = D.characters[id]; rec = rec || Prog.rec(id) || RK.Save._freshChar();
      const c = JSON.parse(JSON.stringify(base));
      const lvM = 1 + 0.08 * (rec.level - 1), stM = 1 + 0.12 * (rec.star - 1), awM = rec.awakened ? 1.25 : 1;
      const mul = lvM * stM * awM;
      c.hp = Math.round(base.hp * mul); c.atk = Math.round(base.atk * mul * (1 + 0.05 * (rec.skill - 1))); c.def = (base.def || 0) + Math.floor((rec.level - 1) / 5);
      if (base.armorHp) c.armorHp = Math.round(base.armorHp * mul);
      c.crit = 0; c.reflect = base.reflect || 0; c.regen = 0; c.antiAir = (base.attack && base.attack.antiAir) || 0;
      c.skillLv = rec.skill;
      // skill level effects
      const sk = rec.skill - 1;
      if (c.support) { if (c.support.amount) c.support.amount *= 1 + 0.06 * sk; if (c.support.type === 'produce') c.support.interval /= 1 + 0.05 * sk; }
      if (c.attack.status && c.attack.status.type === 'slow') c.attack.status.strength = Math.min(0.85, c.attack.status.strength + 0.04 * sk);
      if (c.attack.status && c.attack.status.type === 'stun') c.attack.status.duration += 0.08 * sk;
      if (c.attack.splashRadius) c.attack.splashRadius *= 1 + 0.04 * sk;
      if (c.damageReduction && c.role === 'Defender') c.damageReduction = Math.min(0.6, c.damageReduction + 0.04 * sk);
      if (c.reflect) c.reflect += 0.04 * sk;
      const mods = [];
      if (rec.branch >= 0 && c.branches[rec.branch]) mods.push(c.branches[rec.branch].mods);
      if (rec.equip && D.equipment[rec.equip]) mods.push(D.equipment[rec.equip].mods);
      mods.forEach(m => Prog.applyMods(c, m));
      c.power = Prog.power(c);
      c.costume = rec.costume || 'CS_DEFAULT'; c.awakened = !!rec.awakened; c.level = rec.level; c.star = rec.star;
      return c;
    },
    applyMods(c, m) {
      const a = c.attack;
      if (m.atk) c.atk = Math.round(c.atk * m.atk);
      if (m.hp) c.hp = Math.round(c.hp * m.hp);
      if (m.armor && c.armorHp) c.armorHp = Math.round(c.armorHp * m.armor);
      if (m.def) c.def += m.def;
      if (m.dr) c.damageReduction = Math.min(0.75, (c.damageReduction || 0) + m.dr);
      if (m.as) { c.attackSpeed *= m.as; if (c.support && c.support.interval) c.support.interval *= m.as; if (a.burstGap) a.burstGap *= m.as; }
      if (m.range) { c.range += m.range; if (c.support && c.support.cells) c.support.cells += m.range; }
      if (m.reflect) c.reflect = (c.reflect || 0) + m.reflect;
      if (m.stun) { if (c.support && c.support.type === 'sweep') c.support.stun = m.stun; else a.stunChance = (a.stunChance || 0) + m.stun; a.stunDuration = a.stunDuration || 1; }
      if (m.slow) { if (a.status && a.status.type === 'slow') a.status.strength = Math.min(0.85, a.status.strength + m.slow); else if (c.aura) c.aura.slow = Math.min(0.85, c.aura.slow + m.slow); else a.status = { type: 'slow', strength: m.slow, duration: 2 }; }
      if (m.shots) { if (a.pattern === 'burst') a.shots += m.shots; else { a.multi = (a.multi || 1) + m.shots; } }
      if (m.splash) a.splashRadius = (a.splashRadius || 0) + m.splash;
      if (m.pierce) a.pattern = 'piercing';
      if (m.crit) c.crit += m.crit;
      if (m.burn) a.status = { type: 'burn', strength: m.burn, duration: 3 };
      if (m.burnMul && a.status) a.status.strength *= m.burnMul;
      if (m.knock) a.distance = (a.distance || 0) + m.knock;
      if (m.hitAll) a.hitAll = true;
      if (m.auraCells && c.aura) c.aura.cellsAhead += m.auraCells;
      if (m.regen) c.regen += m.regen;
      if (m.jumps) a.jumps += m.jumps;
      if (m.antiAir) c.antiAir += m.antiAir;
      if (m.radius && c.support) c.support.radius += m.radius;
      if (m.buff && c.support) c.support.amount += m.buff;
      if (m.heal && c.support) c.support.amount *= m.heal;
      if (m.shield && c.support) c.support.amount *= m.shield;
      if (m.produce && c.support) c.support.interval /= m.produce;
      if (m.produce && c.isFactory) c.produceMul = (c.produceMul || 1) * m.produce;
      if (m.golden) c.goldenBonus = m.golden;
      if (m.rainbow) c.rainbowChance = m.rainbow;
      if (m.stunDur && a.status) a.status.duration += m.stunDur;
      if (m.pushMul) a.push *= m.pushMul;
      if (m.cd) c.cooldown *= m.cd;
    },
    power(c) { const dps = c.attackSpeed ? c.atk / c.attackSpeed : 0; return Math.round(c.hp / 8 + dps * 12 + (c.def || 0) * 6 + (c.support ? 60 : 0) + (c.isFactory ? 40 : 0)); },
    teamPower(ids) { return ids.reduce((s, id) => s + (RK.Save.isOwned(id) ? Prog.stats(id).power : 0), 0); },
    // ---- checks & actions ----
    has(cost) { const sd = RK.Save.data; for (const k in cost) { if (!cost[k]) continue; if (k === 'frag') continue; if (k === 'gold' || k === 'gems') { if (sd.cur[k] < cost[k]) return false; } else if ((sd.mats[k] || 0) < cost[k]) return false; } return true; },
    pay(cost) { const sd = RK.Save.data; for (const k in cost) { if (!cost[k] || k === 'frag') continue; if (k === 'gold' || k === 'gems') sd.cur[k] -= cost[k]; else sd.mats[k] -= cost[k]; } },
    canLevel(id) { const r = Prog.rec(id); if (r.level >= Prog.maxLevel(r.star)) return 'ถึงเลเวลสูงสุดของดาวนี้แล้ว — ต้อง Star Evolution'; return Prog.has(Prog.levelCost(r.level)) ? true : 'วัสดุ/ทองไม่พอ'; },
    doLevel(id) { if (Prog.canLevel(id) !== true) return false; const r = Prog.rec(id); Prog.pay(Prog.levelCost(r.level)); r.level++; Prog.done('level'); return true; },
    canStar(id) {
      const r = Prog.rec(id); if (r.star >= Prog.MAX_STAR) return 'ดาวสูงสุดแล้ว';
      const c = Prog.starCost(r.star), f = RK.Save.data.characters.fragments[id] || 0;
      if (f < c.frag) return `เศษตัวละครไม่พอ (${f}/${c.frag})`; return Prog.has(c) ? true : 'ทอง/คริสตัลไม่พอ';
    },
    doStar(id) { if (Prog.canStar(id) !== true) return false; const r = Prog.rec(id), c = Prog.starCost(r.star); Prog.pay(c); RK.Save.data.characters.fragments[id] -= c.frag; r.star++; Prog.done('star'); return true; },
    canSkill(id) { const r = Prog.rec(id); if (r.skill >= Prog.MAX_SKILL) return 'สกิลสูงสุดแล้ว'; if (r.skill >= r.star + 1) return `ต้องมีดาว ${r.skill} ขึ้นไป`; return Prog.has(Prog.skillCost(r.skill)) ? true : 'ทอง/ตำราไม่พอ'; },
    doSkill(id) { if (Prog.canSkill(id) !== true) return false; const r = Prog.rec(id); Prog.pay(Prog.skillCost(r.skill)); r.skill++; Prog.done('skill'); return true; },
    canBranch(id, b) { const r = Prog.rec(id); if (r.star < 3) return 'ปลดล็อกสายอัปเกรดที่ดาว 3'; if (r.branch === b) return 'ใช้สายนี้อยู่แล้ว'; return Prog.has(Prog.branchCost()) ? true : 'ทอง/เหล็กไม่พอ'; },
    doBranch(id, b) { if (Prog.canBranch(id, b) !== true) return false; Prog.pay(Prog.branchCost()); Prog.rec(id).branch = b; Prog.done('branch'); return true; },
    canAwaken(id) { const r = Prog.rec(id); if (r.awakened) return 'Awakening แล้ว'; if (r.star < 6 || r.level < Prog.maxLevel(6)) return 'ต้องดาว 6 และเลเวลสูงสุด (40)'; return Prog.has(Prog.awakenCost()) ? true : 'วัสดุไม่พอ'; },
    doAwaken(id) { if (Prog.canAwaken(id) !== true) return false; Prog.pay(Prog.awakenCost()); Prog.rec(id).awakened = true; RK.Ev.emit('awakened', 1); Prog.done('awaken'); return true; },
    equip(id, eq) {
      const sd = RK.Save.data, r = Prog.rec(id);
      if (r.equip) sd.equipInv[r.equip] = (sd.equipInv[r.equip] || 0) + 1;
      r.equip = null;
      if (eq) { if (!(sd.equipInv[eq] > 0)) return false; sd.equipInv[eq]--; r.equip = eq; }
      RK.Save.save('equip'); return true;
    },
    setCostume(id, cs) { if (!RK.Save.data.costumes[cs]) return false; Prog.rec(id).costume = cs; RK.Save.save('costume'); return true; },
    done(kind) { RK.Ev.emit('upgrade', 1); RK.Audio.play('upgrade'); RK.Save.save('upgrade-' + kind); }
  };
})();
