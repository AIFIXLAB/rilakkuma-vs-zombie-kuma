// ===== AI: CPU opponent for VS Mode (either side) + the bear-side bot used by automated tests =====
(function () {
  const D = RK.Data;
  const AI = RK.AI = {
    t: 0,
    tick(b, dt) {
      if (b.mode !== 'vs') return;
      AI.t += dt;
      if (AI.t < 0.5) return; AI.t = 0;
      RK.UI.mute = true;
      try { if (b.vs.zombieCtl === 'cpu') AI.zombieCpu(b); if (b.vs.bearCtl === 'cpu') AI.bearTick(b, 0, true); } finally { RK.UI.mute = false; }
    },
    zombieCpu(b) {
      const v = b.vs, opts = v.zcards.filter(id => (v.zcd[id] || 0) <= 0 && D.vsZombies[id].brain <= v.brain && (!D.vsZombies[id].boss || (!v.bossUsed && b.t >= 90)));
      if (!opts.length) return;
      if (RK.RNG.next() < 0.45 && v.brain < 300) return;     // save up sometimes
      const id = opts.sort((p, q) => D.vsZombies[q].brain - D.vsZombies[p].brain)[Math.floor(RK.RNG.next() * Math.min(3, opts.length))];
      const rows = Array.from({ length: b.grid.rows }, (_, i) => i);
      const weak = rows.map(r => ({ r, w: b.units.filter(u => u.row === r && !u.dying && u.data.atk).length + RK.RNG.next() })).sort((p, q) => p.w - q.w)[0].r;
      b.vsDeploy(id, weak);
    },
    // Bear bot: economy first, shooter in each threatened lane, shields in front, traps, skills, rotate vs flyers.
    bearTick(b, pid, cpu) {
      if (b.state !== 'play') return;
      const p = b.players[pid || 0], C = p.cards;
      for (const d of b.donutItems.slice()) if (!d.collected) b.collectDonut(d);
      const ready = c => c && p.cd[c.id] <= 0 && b.donuts >= c.cost;
      const free = (r, c) => c >= 0 && c < b.cols && !b.grid.cells[r][c].occupied && !(b.grid.cells[r][c].terrainType === 'Lava') && (b.mode !== 'vs' || c <= b.cols - 4);
      const place = (c, r, col) => (c.role === 'Producer' || c.role === 'Defender') && b.grid.cells[r][col].terrainType === 'Water' ? null : b.place(c, r, col, p.id);
      const alive = b.zombies.filter(z => !z.dying && z.x < b.boardMax + 0.5);
      const zIn = r => alive.filter(z => z.row === r);
      const atk = r => b.units.filter(u => u.row === r && (u.data.role === 'Attacker' || u.data.role === 'Special') && u.data.atk && !u.dying).length;
      const rows = b.grid.rows, mid = Math.floor(rows / 2), order = Array.from({ length: rows }, (_, i) => i).sort((x, y) => Math.abs(x - mid) - Math.abs(y - mid));
      const facs = b.units.filter(u => (u.isFactory || (u.data.support && u.data.support.type === 'produce')) && !u.dying).length;
      // flyers / jumpers behind a unit -> rotate the unit behind them
      for (const z of alive) if (z.flying || z.jumped) { const u = b.units.find(u => u.row === z.row && !u.dying && u.data.atk && u.x > z.x + 0.4 && u.facing > 0 && u.canHitAir()); if (u && !b.zombies.some(o => o.row === u.row && o.x > u.x && !o.dying && o.x < b.boardMax)) b.rotate(u); }
      for (const u of b.units) if (u.facing < 0 && !b.zombies.some(z => z.row === u.row && z.x < u.x && !z.dying)) b.rotate(u);
      // skills
      if (b.skill.gauge >= 1) {
        const danger = alive.filter(z => z.x < 3).length, atBase = alive.find(z => z.x < 1.2);
        if (atBase) { b.useSkill('STRIKE', atBase.row, pid); return; }
        if (danger >= 2 || (b.boss && b.boss.x < 4)) { const r = b.boss ? b.boss.row : alive.sort((a, z) => a.x - z.x)[0].row; b.useSkill('STRIKE', r, pid); }
        else if (b.units.filter(u => u.hp < u.maxHp * 0.4).length >= 3) b.useSkill('HEAL', null, pid);
      }
      const threatened = order.filter(r => zIn(r).length).sort((a, c) => Math.min(...zIn(a).map(z => z.x)) - Math.min(...zIn(c).map(z => z.x)));
      const shooters = C.filter(c => c.atk && c.range >= 3 && c.role !== 'Producer').sort((x, y) => y.power - x.power);
      const placeShooter = r => { const air = zIn(r).some(z => z.flying); const list = air ? shooters.slice().sort((x, y) => (y.antiAir || 0) - (x.antiAir || 0) || (y.attack.pattern !== 'lob') - (x.attack.pattern !== 'lob')) : shooters; for (const c of list) if (ready(c)) for (const col of [1, 2, 3, 0]) if (free(r, col)) return !!place(c, r, col); return false; };
      for (const r of threatened) if (atk(r) === 0) {
        if (placeShooter(r)) return;
        const z = zIn(r)[0]; const mel = C.find(c => c.atk && c.range < 2 && ready(c));
        if (z && z.x < 3.5 && mel) for (const col of [2, 3, 1]) if (free(r, col)) { place(mel, r, col); return; }
        // trap emergency
        if (z && z.x < 4) { const tid = Object.keys(b.trapBag).find(k => b.trapBag[k] > 0 && b.donuts >= D.traps[k].cost); if (tid) { const col = Math.max(0, Math.floor(z.x) - 1); if (!b.grid.cells[r][col].trapId && b.placeTrap(tid, r, col)) return; } }
      }
      const fac = C.find(c => c.isFactory) || C.find(c => c.support && c.support.type === 'produce');
      const shootersOnBoard = b.units.filter(u => u.data.atk && u.data.range >= 3 && !u.dying).length;
      const facCap = b.mode === 'coop' ? 6 : shootersOnBoard === 0 ? 2 : shootersOnBoard < 3 ? 3 : 4;
      if (fac && facs < 2 && ready(fac)) { for (const r of order) if (free(r, 0)) { place(fac, r, 0); return; } }
      // pre-place one shooter in the middle lanes before the first wave
      if (b.waveIdx < 0 && shootersOnBoard < 2) { for (const r of order.slice(0, 3)) if (atk(r) === 0 && placeShooter(r)) return; }
      if (fac && facs < facCap && ready(fac)) { for (const r of order) if (free(r, 0)) { place(fac, r, 0); return; } }
      for (const r of threatened) { const need = Math.min(3, 1 + Math.ceil(zIn(r).reduce((s, z) => s + z.hp + (z.armorHp || 0) + (z.shieldHp || 0), 0) / (400 * Math.max(1, b.scale.hp * 0.8)))); if (atk(r) < need && placeShooter(r)) return; }
      const tanks = C.filter(c => c.role === 'Defender').sort((x, y) => y.hp - x.hp);
      for (const r of threatened) {
        const z = zIn(r).filter(z => !z.flying).sort((a, c) => a.x - c.x)[0];
        if (z && z.x < b.cols - 2 && atk(r) > 0 && !b.units.some(u => u.row === r && u.data.role === 'Defender' && !u.dying))
          for (const c of tanks) if (ready(c)) { for (const col of [5, 4, 6, 3]) if (free(r, col) && col < z.x - 0.5) { place(c, r, col); return; } }
      }
      const sup = C.filter(c => c.role === 'Support' || (c.role === 'Special' && !c.atk));
      if (b.donuts >= 300) for (const c of sup) if (ready(c)) for (const r of order) for (const col of [2, 1]) if (free(r, col) && atk(r)) { place(c, r, col); return; }
      if (fac && facs < facCap + 1 && ready(fac) && b.donuts >= 150) { for (const r of order) if (free(r, 0)) { place(fac, r, 0); return; } }
      if (b.donuts >= 250) for (const r of order) if (atk(r) === 0 && placeShooter(r)) return;
      if (b.donuts >= 400) for (const r of order) if (atk(r) < (b.donuts >= 900 ? 5 : 3) && placeShooter(r)) return;
      const calm = !threatened.some(r => atk(r) === 0);
      const lowF = b.units.filter(u => u.isFactory && !u.dying && u.level < 4).sort((p, q) => p.level - q.level)[0];
      if (lowF && calm && b.donuts >= D.config.factoryLevels[lowF.level + 1].upgradeCost + 100) { b.upgradeFactory(lowF); return; }
    }
  };
})();
