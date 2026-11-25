// Balance / gameplay harness: runs a stage entirely inside the page with the AI bot
window.TB = {
  setup(town, extra) {
    const sd = RK.Save.data, D = RK.Data;
    const unlockedBy = new Set(RK.Data.startingCharacters);
    for (const k in D.stages) { const st = D.stages[k]; if (st.mode === 'story' && (st.town < town || (st.town === town && st.number <= 8)) && st.reward.unlock) st.reward.unlock.forEach(i => unlockedBy.add(i)); }
    (extra || []).forEach(i => unlockedBy.add(i));
    sd.characters.owned = {};
    const lv = Math.round(2 + 3.3 * (town - 1)), star = 1 + Math.floor((town - 1) / 2.5);
    unlockedBy.forEach(id => { sd.characters.owned[id] = Object.assign(RK.Save._freshChar(), { level: Math.min(lv, RK.Prog.maxLevel(star)), star, skill: Math.min(5, star) }); });
    sd.towns.unlocked = [1, 2, 3, 4, 5, 6, 7, 8];
    const ids = Object.keys(sd.characters.owned).filter(i => i !== 'FACTORY');
    const st = i => RK.Prog.stats(i), dps = i => { const c = st(i); return c.attackSpeed ? c.atk / c.attackSpeed * (c.attack.pattern === 'splash' || c.attack.pattern === 'lob' || c.attack.pattern === 'piercing' || c.attack.pattern === 'spread' ? 1.6 : 1) : 0; };
    const ranged = ids.filter(i => st(i).atk && st(i).range >= 3).sort((a, b) => dps(b) - dps(a));
    const defs = ids.filter(i => D.characters[i].role === 'Defender').sort((a, b) => st(b).hp - st(a).hp);
    const sup = ids.filter(i => ['Support', 'Producer'].includes(D.characters[i].role) || (D.characters[i].role === 'Special' && !st(i).atk));
    const pick = ranged.slice(0, 5).concat(defs.slice(0, 2), sup.slice(0, 1));
    if (ids.includes('KT_SWATTER_PANDA') && !pick.includes('KT_SWATTER_PANDA')) pick.splice(4, 1, 'KT_SWATTER_PANDA');
    ids.forEach(i => { if (pick.length < 8 && !pick.includes(i)) pick.push(i); });
    sd.teams.presets[0].members = pick; sd.teams.active = 0;
    for (const k in D.traps) sd.traps[k] = town >= 2 ? 3 : 2;
    return { lv, star, deck: pick };
  },
  run(stageId, maxSec, seed) {
    RK.RNG.seed(seed || 777);
    RK.Engine.setScene(RK.Battle, { stageId, deck: RK.Save.deck.slice(), deck2: RK.Save.deck.slice() });
    const B = RK.Battle; B.state = 'play';
    let t = 0; RK.UI.mute = true;
    while (t < (maxSec || 900) && B.state === 'play') {
      RK.AI.bearTick(B, 0); if (B.mode === 'coop') RK.AI.bearTick(B, 1);
      RK.Engine.step(0.5); t += 0.5;
    }
    RK.UI.mute = false; RK.UI.closeModal();
    return { id: stageId, state: B.state, t: Math.round(B.t), base: Math.round(B.baseHp / B.baseMax * 100), lost: B.stats.unitsLost, kills: B.stats.killed, total: B.totalZombies, stars: B.result && B.result.stars ? B.result.stars.filter(Boolean).length : 0, wave: B.waveIdx + 1 };
  }
};
