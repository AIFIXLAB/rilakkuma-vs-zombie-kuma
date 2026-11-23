// Test helpers + simple bot. Everything goes through RK.Engine.tap (same path as a finger tap).
window.T = {
  B() { return RK.Battle; },
  step(sec) { const n = Math.ceil(sec / 0.5); for (let i = 0; i < n; i++) RK.Engine.step(0.5); },
  cardRect(id) { return RK.Battle.cardRects().find(r => r.card.id === id); },
  tapCard(id) { const r = this.cardRect(id); RK.Engine.tap(r.x + r.w / 2, r.y + r.h / 2); },
  cellXY(r, c) { return RK.Battle.grid.cellCenter(r, c); },
  tapCell(r, c) { const p = this.cellXY(r, c); RK.Engine.tap(p.x, p.y); },
  placeVia(id, r, c) { this.tapCard(id); if (RK.Battle.selected && RK.Battle.selected.id === id) { this.tapCell(r, c); } const u = RK.Battle.units.find(u => u.row === r && u.col === c && u.id === id); if (!u) RK.Battle.selected = null; return u; },
  collectAll() { let n = 0; for (const d of RK.Battle.donutItems.slice()) if (!d.collected) { RK.Engine.tap(d.x, d.y); n++; } return n; },
  free(r, c) { return !RK.Battle.grid.cells[r][c].occupied; },
  // strategy bot: economy first, a shooter in every threatened lane, shields only in front of shooters
  botTick() {
    const B = RK.Battle; if (B.state !== 'play') return;
    this.collectAll();
    const ids = B.cards.map(c => c.id), C = RK.Data.characters;
    const ready = id => ids.includes(id) && B.cooldowns[id] <= 0 && B.donuts >= C[id].cost;
    const alive = B.zombies.filter(z => !z.dying);
    const zIn = r => alive.filter(z => z.row === r);
    const atk = r => B.units.filter(u => u.row === r && u.data.role === 'Attacker' && !u.dying).length;
    const facs = B.units.filter(u => u.isFactory && !u.dying).length;
    const order = [2, 1, 3, 0, 4];
    const threatened = order.filter(r => zIn(r).length).sort((a, b) => Math.min(...zIn(a).map(z => z.x)) - Math.min(...zIn(b).map(z => z.x)));
    const shooters = ['ATK_DONUT_CANNON', 'ATK_CHOCO_KUMA', 'ATK_UMBRELLA_PANDA', 'ATK_DONUT_KORI', 'ATK_GOGGLE_CAT', 'ATK_DONUT_KUMA'];
    const placeShooter = r => { for (const id of shooters) if (ready(id)) for (const c of [1, 2, 3]) if (this.free(r, c)) return !!this.placeVia(id, r, c); return false; };
    // 1) emergency: zombie close with no shooter
    for (const r of threatened) if (atk(r) === 0) { if (placeShooter(r)) return; const z = zIn(r)[0]; if (z && z.x < 3 && ready('ATK_LADLE_TORI')) for (const c of [2, 3, 1]) if (this.free(r, c)) { this.placeVia('ATK_LADLE_TORI', r, c); return; } }
    // 2) economy
    if (facs < 4 && ready('FACTORY')) { for (const r of order) if (this.free(r, 0)) { this.placeVia('FACTORY', r, 0); return; } }
    // 3) more firepower where pressure is high
    for (const r of threatened) { const need = Math.min(3, 1 + Math.ceil(zIn(r).reduce((s, z) => s + z.hp + (z.armorHp || 0) + (z.shieldHp || 0), 0) / 400)); if (atk(r) < need && placeShooter(r)) return; }
    // 4) shields in front of shooters
    for (const r of threatened) {
      const z = zIn(r).sort((a, b) => a.x - b.x)[0];
      if (z && z.x < 7 && atk(r) > 0 && !B.units.some(u => u.row === r && u.data.role === 'Defender' && !u.dying))
        for (const id of ['DEF_LAUNDRY_PANDA', 'DEF_CARDBOARD', 'DEF_POT_SHIELD', 'DEF_SPRAY', 'DEF_FAN', 'DEF_MOP_CAT']) if (ready(id)) { for (const c of [5, 4, 6]) if (this.free(r, c) && c < z.x - 0.5) { this.placeVia(id, r, c); return; } }
    }
    // 5) grow economy, then cover idle lanes
    if (facs < 5 && ready('FACTORY') && B.donuts >= 150) { for (const r of order) if (this.free(r, 0)) { this.placeVia('FACTORY', r, 0); return; } }
    if (B.donuts >= 250) for (const r of order) if (atk(r) === 0 && placeShooter(r)) return;
  },
  runBot(maxSec) { let t = 0; while (t < maxSec && RK.Battle.state === 'play') { this.botTick(); this.step(0.5); t += 0.5; } return { state: RK.Battle.state, t: RK.Battle.t }; },
  startStage(id, deck) { RK.RNG.seed(12345); RK.Engine.setScene(RK.Battle, { stageId: id, deck: deck || RK.Save.data.deck.slice() }); RK.Battle.state = 'play'; }
};
