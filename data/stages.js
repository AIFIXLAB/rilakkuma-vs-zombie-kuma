// ===== Maps, Towns, Stage / Wave Database (doc PART 13/14, 21.3) =====
// Battlefield geometry measured from the painted boards so taps land on the painted tiles.
// rowY = y of each row boundary; topL/topR = board x-edges at the top boundary, botL/botR at the bottom one.
const T1G = { rows: 5, cols: 9, rowY: [243, 340, 437, 537, 637, 743], topL: 344, topR: 1349, botL: 296, botR: 1407 };
const flat = (x0, x1, rowY, cols) => ({ rows: rowY.length - 1, cols, rowY, topL: x0, topR: x1, botL: x0, botR: x1 });
const even = (y0, y1, n) => Array.from({ length: n + 1 }, (_, i) => Math.round(y0 + (y1 - y0) * i / n));
RK.Data.maps = {
  MAP_TOWN1: Object.assign({ asset: 'MAP_TOWN1', terrain: 'Normal Ground' }, T1G),
  MAP_TOWN2: Object.assign({ asset: 'MAP_TOWN2', terrain: 'Normal Ground' }, T1G),
  MAP_TOWN3: Object.assign({ asset: 'MAP_TOWN3', terrain: 'Sand' }, T1G),
  MAP_TOWN4: Object.assign({ asset: 'MAP_TOWN4', terrain: 'Normal Ground' }, T1G),
  MAP_TOWN5: Object.assign({ asset: 'MAP_TOWN5', terrain: 'Ice' }, T1G),
  MAP_TOWN6: Object.assign({ asset: 'MAP_TOWN6', terrain: 'Sand' }, T1G),
  MAP_TOWN7: Object.assign({ asset: 'MAP_TOWN7', terrain: 'Normal Ground' }, T1G),
  MAP_TOWN8: Object.assign({ asset: 'MAP_TOWN8', terrain: 'Normal Ground' }, T1G),
  MAP_COOP10: Object.assign({ asset: 'MAP_COOP10', terrain: 'Normal Ground' }, flat(325, 1380, even(155, 768, 10), 12)),
  MAP_EV_HALLOWEEN: Object.assign({ asset: 'MAP_EV_HALLOWEEN' }, flat(302, 1390, even(290, 745, 5), 11)),
  MAP_EV_SAKURA: Object.assign({ asset: 'MAP_EV_SAKURA' }, flat(385, 1455, even(285, 800, 5), 9)),
  MAP_EV_SUMMER: Object.assign({ asset: 'MAP_EV_SUMMER' }, flat(400, 1410, even(200, 765, 6), 9)),
  MAP_EV_DONUT: Object.assign({ asset: 'MAP_EV_DONUT' }, flat(375, 1435, even(200, 790, 5), 8)),
  MAP_EV_ANNIV: Object.assign({ asset: 'MAP_EV_ANNIV' }, flat(385, 1440, even(200, 790, 6), 10)),
  MAP_EV_HARVEST: Object.assign({ asset: 'MAP_EV_HARVEST' }, flat(390, 1420, even(260, 755, 5), 9))
};
for (const k in RK.Data.maps) { const m = RK.Data.maps[k]; m.id = k; m.baseCol = -0.35; m.spawnCol = m.cols + 0.7; m.terrain = m.terrain || 'Normal Ground'; }

// Towns (doc PART 14). basic/special/ranged pools drive the stage generator; terrain = special cells used in that town.
RK.Data.towns = [
  { id: 1, key: 'TOWN1', name: 'Rilakkuma Town', nameTH: 'เมืองริลัคคุมะ', map: 'MAP_TOWN1', boss: 'BOSS_GIANT_ZOMBIE_KUMA', mini: 'BOSS_TANK', chapter: 1,
    basic: ['ZOM_NORMAL', 'ZOM_NURSE'], special: ['ZOM_CONE', 'ZOM_HEAVY', 'ZOM_BUCKET', 'ZOM_MINER'], ranged: ['RZ_ROCK', 'RZ_FARMER', 'RZ_TRASH'], terrain: [] },
  { id: 2, key: 'TOWN2', name: 'Sakura Town', nameTH: 'เมืองซากุระ', map: 'MAP_TOWN2', boss: 'ZOM_SAKURA_DEMON', mini: 'ZOM_SAMURAI', chapter: 2,
    basic: ['ZOM_NORMAL', 'ZOM_CHEF_MELEE'], special: ['ZOM_NINJA', 'ZOM_SAMURAI', 'ZOM_GHOST', 'ZOM_SAKURA'], ranged: ['RZ_CHEF', 'RZ_ROCK'], terrain: [] },
  { id: 3, key: 'TOWN3', name: 'Seaside Town', nameTH: 'เมืองชายทะเล', map: 'MAP_TOWN3', boss: 'BOSS_TENTACLE', mini: 'ZOM_PIRATE', chapter: 3,
    basic: ['ZOM_PIRATE', 'ZOM_NORMAL'], special: ['ZOM_SURFER', 'ZOM_CRAB', 'ZOM_LIFEGUARD'], ranged: ['RZ_TRASH', 'RZ_FARMER'], terrain: ['Water', 'Sand'] },
  { id: 4, key: 'TOWN4', name: 'Forest Town', nameTH: 'เมืองป่ามหัศจรรย์', map: 'MAP_TOWN4', boss: 'ZOM_MUSHROOM_KING', mini: 'BOSS_TOXIC_SLIME', chapter: 4,
    basic: ['ZOM_FOREST', 'ZOM_POISON'], special: ['ZOM_MUSHROOM', 'ZOM_PLANT', 'ZOM_GHOST'], ranged: ['RZ_TOXIC', 'RZ_FARMER'], terrain: ['Poison Ground'] },
  { id: 5, key: 'TOWN5', name: 'Snow Town', nameTH: 'เมืองหิมะ', map: 'MAP_TOWN5', boss: 'ZOM_ICE_GIANT', mini: 'ZOM_FROZEN_KNIGHT', chapter: 5,
    basic: ['ZOM_SNOW', 'ZOM_NORMAL'], special: ['ZOM_NURSE', 'ZOM_ICE', 'ZOM_FROZEN_KNIGHT', 'ZOM_CRAB'], ranged: ['ZOM_ICE_THROWER', 'RZ_ROCK'], terrain: ['Ice'] },
  { id: 6, key: 'TOWN6', name: 'Desert Town', nameTH: 'เมืองทะเลทราย', map: 'MAP_TOWN6', boss: 'ZOM_PHARAOH_KING', mini: 'ZOM_MUMMY', chapter: 6,
    basic: ['ZOM_MUMMY', 'ZOM_NORMAL'], special: ['ZOM_SCARAB', 'ZOM_PHARAOH', 'ZOM_SAND', 'ZOM_HEAVY'], ranged: ['RZ_BUILDER', 'RZ_TOXIC'], terrain: ['Sand'] },
  { id: 7, key: 'TOWN7', name: 'Volcano Town', nameTH: 'เมืองภูเขาไฟ', map: 'MAP_TOWN7', boss: 'BOSS_SPIKE_ARMOR', mini: 'ZOM_MAGMA', chapter: 7,
    basic: ['ZOM_FIRE', 'ZOM_NORMAL'], special: ['ZOM_DEVIL', 'ZOM_SCIENTIST', 'ZOM_MAGMA'], ranged: ['RZ_BUILDER', 'RZ_TRASH'], terrain: ['Lava'] },
  { id: 8, key: 'TOWN8', name: 'Sky Castle', nameTH: 'ปราสาทลอยฟ้า', map: 'MAP_TOWN8', boss: 'BOSS_FINAL_KING', mini: 'ZOM_DARK', chapter: 8,
    basic: ['ZOM_DARK', 'ZOM_SNOW'], special: ['ZOM_FLYING', 'ZOM_ANGEL', 'ZOM_FROZEN_KNIGHT', 'ZOM_SCIENTIST'], ranged: ['ZOM_WIZARD', 'RZ_TOXIC'], terrain: ['Special Ground'] }
];
RK.Data.stagesPerTown = 15;
RK.Data.startingCharacters = RK.Data.startingCharacters || ['FACTORY', 'ATK_DONUT_KUMA', 'DEF_POT_SHIELD', 'ATK_LADLE_TORI'];

// Story unlock path: stageId -> characters unlocked on first clear (Epic/Legend are gacha/shop only)
RK.Data.storyUnlocks = {
  'T1-S8': ['KT_PAN_KUMA'], 'T1-S12': ['KT_WHISK_TORI'], 'T1-S15': ['ANI_PENGUIN_CHEF'],
  'T2-S3': ['KT_SWATTER_PANDA'], 'T2-S8': ['HW_PLUNGER_KORI'], 'T2-S15': ['KT_SPRAY_DUCK'],
  'T3-S5': ['ANI_BUNNY'], 'T3-S10': ['HW_ROLLER_KUMA'], 'T3-S15': ['KT_SPATULA_CAT'],
  'T4-S5': ['HW_LEAF_PENGUIN'], 'T4-S15': ['KT_DUSTER_KORI'], 'T5-S5': ['HW_HOSE_BEAR'], 'T5-S15': ['KT_BROOM_KUMA'],
  'T6-S5': ['ANI_FOX'], 'T6-S15': ['HW_RACKET_CAT'], 'T7-S5': ['HW_VACUUM_TORI'], 'T7-S15': ['KT_YARN_BEAR'],
  'T8-S5': ['ANI_ELEPHANT'], 'T8-S15': ['ANI_HEDGEHOG']
};

RK.Data.handStages = {
  'T1-S1': {
    id: 'T1-S1', town: 1, number: 1, name: 'ร้านโดนัทถูกบุก!', map: 'MAP_TOWN1', startingDonut: 200, baseHP: 1000,
    recommendedPower: 100, tutorial: true,
    // tutorial: only the 3 middle lanes
    waves: [
      { delay: 25, timeout: 40, spawns: [{ enemy: 'ZOM_NORMAL', count: 2, interval: 10, lanes: [3, 2] }] },
      { delay: 12, timeout: 45, spawns: [{ enemy: 'ZOM_NORMAL', count: 4, interval: 7, lanes: [2, 3, 4] }, { enemy: 'RZ_ROCK', count: 1, interval: 0, lanes: [3], at: 14 }] },
      { delay: 10, timeout: 60, final: true, spawns: [{ enemy: 'ZOM_NORMAL', count: 5, interval: 4.5, lanes: [2, 3, 4] }, { enemy: 'RZ_ROCK', count: 2, interval: 8, lanes: [2, 4], at: 6 }] }
    ],
    stars: [ { type: 'clear', text: 'ผ่านด่าน' }, { type: 'baseHpAbove', value: 0.8, text: 'ฐานเหลือ HP ≥ 80%' }, { type: 'collectDonuts', value: 20, text: 'เก็บโดนัท 20 ชิ้น' } ],
    reward: { gold: 100, exp: 20, unlock: ['DEF_SPRAY', 'ATK_DONUT_KORI'] }
  },
  'T1-S2': {
    id: 'T1-S2', town: 1, number: 2, name: 'ซอมบี้วิ่งไว', map: 'MAP_TOWN1', startingDonut: 125, baseHP: 1000, recommendedPower: 150,
    waves: [
      { delay: 20, timeout: 40, spawns: [{ enemy: 'ZOM_NORMAL', count: 3, interval: 7, lanes: 'random' }] },
      { delay: 10, timeout: 45, spawns: [{ enemy: 'ZOM_NURSE', count: 3, interval: 5, lanes: 'random' }, { enemy: 'ZOM_NORMAL', count: 3, interval: 6, lanes: 'random' }] },
      { delay: 10, timeout: 50, spawns: [{ enemy: 'RZ_FARMER', count: 2, interval: 8, lanes: 'random' }, { enemy: 'ZOM_NORMAL', count: 4, interval: 5, lanes: 'random' }] },
      { delay: 10, timeout: 70, final: true, spawns: [{ enemy: 'ZOM_NORMAL', count: 6, interval: 3, lanes: 'random' }, { enemy: 'ZOM_NURSE', count: 4, interval: 4, lanes: 'random' }, { enemy: 'RZ_ROCK', count: 2, interval: 6, lanes: 'random', at: 8 }] }
    ],
    stars: [ { type: 'clear', text: 'ผ่านด่าน' }, { type: 'baseHpAbove', value: 0.7, text: 'ฐานเหลือ HP ≥ 70%' }, { type: 'maxUnitsLost', value: 2, text: 'เสียตัวละครไม่เกิน 2 ตัว' } ],
    reward: { gold: 120, exp: 25, unlock: ['DEF_CARDBOARD', 'ATK_UMBRELLA_PANDA'] }
  },
  'T1-S3': {
    id: 'T1-S3', town: 1, number: 3, name: 'หมวกกรวยมาแล้ว', map: 'MAP_TOWN1', startingDonut: 125, baseHP: 1000, recommendedPower: 220,
    waves: [
      { delay: 20, timeout: 40, spawns: [{ enemy: 'ZOM_NORMAL', count: 3, interval: 6, lanes: 'random' }, { enemy: 'ZOM_CONE', count: 1, interval: 0, lanes: 'random', at: 12 }] },
      { delay: 10, timeout: 50, spawns: [{ enemy: 'ZOM_CONE', count: 3, interval: 7, lanes: 'random' }, { enemy: 'RZ_BUILDER', count: 2, interval: 9, lanes: 'random', at: 6 }] },
      { delay: 10, timeout: 50, spawns: [{ enemy: 'ZOM_NURSE', count: 4, interval: 3, lanes: 'random' }, { enemy: 'ZOM_NORMAL', count: 4, interval: 4, lanes: 'random' }] },
      { delay: 10, timeout: 80, final: true, spawns: [{ enemy: 'ZOM_CONE', count: 4, interval: 4, lanes: 'random' }, { enemy: 'ZOM_NORMAL', count: 6, interval: 3, lanes: 'random' }, { enemy: 'RZ_BUILDER', count: 2, interval: 7, lanes: 'random', at: 5 }, { enemy: 'RZ_ROCK', count: 2, interval: 7, lanes: 'random', at: 9 }] }
    ],
    stars: [ { type: 'clear', text: 'ผ่านด่าน' }, { type: 'baseHpAbove', value: 0.7, text: 'ฐานเหลือ HP ≥ 70%' }, { type: 'maxUnitsLost', value: 1, text: 'เสียตัวละครไม่เกิน 1 ตัว' } ],
    reward: { gold: 140, exp: 30, unlock: ['DEF_FAN', 'DEF_MOP_CAT', 'ATK_GOGGLE_CAT'] }
  },
  'T1-S4': {
    id: 'T1-S4', town: 1, number: 4, name: 'หมีอ้วนตัวยักษ์', map: 'MAP_TOWN1', startingDonut: 150, baseHP: 1000, recommendedPower: 300,
    waves: [
      { delay: 20, timeout: 45, spawns: [{ enemy: 'ZOM_NORMAL', count: 4, interval: 5, lanes: 'random' }, { enemy: 'RZ_TRASH', count: 1, interval: 0, lanes: 'random', at: 10 }] },
      { delay: 10, timeout: 60, spawns: [{ enemy: 'ZOM_HEAVY', count: 1, interval: 0, lanes: [3] }, { enemy: 'ZOM_CONE', count: 3, interval: 6, lanes: 'random' }, { enemy: 'RZ_CHEF', count: 2, interval: 8, lanes: 'random', at: 4 }] },
      { delay: 10, timeout: 60, spawns: [{ enemy: 'ZOM_NURSE', count: 6, interval: 2.5, lanes: 'random' }, { enemy: 'RZ_TRASH', count: 2, interval: 6, lanes: 'random' }] },
      { delay: 10, timeout: 90, final: true, spawns: [{ enemy: 'ZOM_HEAVY', count: 2, interval: 12, lanes: 'random' }, { enemy: 'ZOM_NORMAL', count: 8, interval: 2.5, lanes: 'random' }, { enemy: 'ZOM_CONE', count: 3, interval: 5, lanes: 'random' }, { enemy: 'RZ_ROCK', count: 2, interval: 6, lanes: 'random', at: 6 }] }
    ],
    stars: [ { type: 'clear', text: 'ผ่านด่าน' }, { type: 'baseHpAbove', value: 0.6, text: 'ฐานเหลือ HP ≥ 60%' }, { type: 'maxUnitsLost', value: 2, text: 'เสียตัวละครไม่เกิน 2 ตัว' } ],
    reward: { gold: 160, exp: 35, unlock: ['DEF_LAUNDRY_PANDA', 'ATK_ROLLINGPIN_CHEF', 'ATK_DONUT_CANNON'] }
  },
  'T1-S5': {
    id: 'T1-S5', town: 1, number: 5, name: 'กองทัพขว้างของ', map: 'MAP_TOWN1', startingDonut: 150, baseHP: 1000, recommendedPower: 380,
    waves: [
      { delay: 18, timeout: 45, spawns: [{ enemy: 'RZ_ROCK', count: 2, interval: 6, lanes: 'random' }, { enemy: 'ZOM_NORMAL', count: 3, interval: 5, lanes: 'random' }] },
      { delay: 10, timeout: 60, spawns: [{ enemy: 'ZOM_BUCKET', count: 2, interval: 8, lanes: 'random' }, { enemy: 'RZ_TOXIC', count: 2, interval: 7, lanes: 'random', at: 5 }, { enemy: 'ZOM_NURSE', count: 3, interval: 4, lanes: 'random' }] },
      { delay: 10, timeout: 60, spawns: [{ enemy: 'RZ_FARMER', count: 2, interval: 5, lanes: 'random' }, { enemy: 'RZ_BUILDER', count: 2, interval: 6, lanes: 'random' }, { enemy: 'ZOM_CONE', count: 4, interval: 4, lanes: 'random' }] },
      { delay: 10, timeout: 100, final: true, spawns: [{ enemy: 'ZOM_HEAVY', count: 2, interval: 10, lanes: 'random' }, { enemy: 'ZOM_BUCKET', count: 2, interval: 8, lanes: 'random' }, { enemy: 'ZOM_NORMAL', count: 8, interval: 2.2, lanes: 'random' }, { enemy: 'RZ_TOXIC', count: 2, interval: 6, lanes: 'random', at: 4 }, { enemy: 'RZ_TRASH', count: 2, interval: 6, lanes: 'random', at: 8 }] }
    ],
    stars: [ { type: 'clear', text: 'ผ่านด่าน' }, { type: 'baseHpAbove', value: 0.6, text: 'ฐานเหลือ HP ≥ 60%' }, { type: 'maxUnitsLost', value: 3, text: 'เสียตัวละครไม่เกิน 3 ตัว' } ],
    reward: { gold: 200, exp: 40, unlock: ['ATK_CHOCO_KUMA'] }
  }
};

// ---------------- Stage generator (deterministic per stage id) ----------------
(function () {
  function rng(seed) { let s = seed >>> 0; return () => { s += 0x6D2B79F5; let t = s; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const pick = (r, a) => a[Math.floor(r() * a.length)];
  RK.Data.difficulty = d => ({ hp: Math.pow(1.0105, d - 1), atk: Math.pow(1.007, d - 1) });

  // Build waves from an enemy pool. opts: { d, waves, perWave, pools:{basic,special,ranged}, mini, boss, lanes, flavor }
  function buildWaves(r, o) {
    const waves = [];
    for (let w = 0; w < o.waves; w++) {
      const last = w === o.waves - 1, spawns = [];
      const n = Math.max(2, Math.round(o.perWave * (0.55 + 0.75 * w / Math.max(1, o.waves - 1))));
      const nb = Math.max(1, Math.round(n * (o.specialShare != null ? 1 - o.specialShare : 0.55)));
      spawns.push({ enemy: pick(r, o.pools.basic), count: Math.ceil(nb / 2), interval: Math.max(2, 7 - w), lanes: o.lanes || 'random' });
      spawns.push({ enemy: pick(r, o.pools.basic), count: Math.floor(nb / 2), interval: Math.max(2, 6 - w), lanes: o.lanes || 'random', at: 3 });
      const ns = n - nb;
      if (ns > 0 && o.pools.special.length) spawns.push({ enemy: pick(r, o.pools.special), count: Math.ceil(ns / 2), interval: 6, lanes: o.lanes || 'random', at: 5 });
      if (ns > 1 && o.pools.special.length) spawns.push({ enemy: pick(r, o.pools.special), count: Math.floor(ns / 2), interval: 7, lanes: o.lanes || 'random', at: 9 });
      if (o.pools.ranged.length && (w > 0 || o.d > 2)) spawns.push({ enemy: pick(r, o.pools.ranged), count: 1 + Math.floor(w / 2), interval: 8, lanes: o.lanes || 'random', at: 7 });
      if (last && o.mini) spawns.push({ enemy: o.mini, count: 1, interval: 0, lanes: [3], at: 12, mini: true });
      if (last && o.boss) spawns.push({ enemy: o.boss, count: 1, interval: 0, lanes: [3], at: 14, boss: true });
      waves.push({ delay: w === 0 ? 30 : 12, timeout: 45 + w * 10 + (last && (o.boss || o.mini) ? 60 : 0), final: last, spawns, difficultyMultiplier: 1 });
    }
    return waves;
  }
  function terrainFor(r, kinds, count, rows, cols) {
    const out = [];
    if (!kinds || !kinds.length) return out;
    for (let i = 0; i < count; i++) out.push({ row: 1 + Math.floor(r() * rows), col: 2 + Math.floor(r() * (cols - 2)), type: pick(r, kinds) });
    return out;
  }
  const STAR3 = [
    s => ({ type: 'collectDonuts', value: 15 + Math.floor(s / 10), text: `เก็บโดนัท ${15 + Math.floor(s / 10)} ชิ้น` }),
    () => ({ type: 'maxUnitsLost', value: 2, text: 'เสียตัวละครไม่เกิน 2 ตัว' }),
    () => ({ type: 'noTrap', text: 'ผ่านด่านโดยไม่ใช้กับดัก' }),
    () => ({ type: 'maxUnits', value: 14, text: 'วางตัวละครไม่เกิน 14 ตัว' }),
    () => ({ type: 'timeUnder', value: 360, text: 'ผ่านภายใน 6 นาที' })
  ];
  RK.Data.genStoryStage = function (town, n) {
    const T = RK.Data.towns[town - 1], d = (town - 1) * 15 + n, r = rng(town * 1000 + n * 17 + 7);
    const pools = { basic: T.basic.slice(), special: [], ranged: T.ranged.slice() };
    if (n >= 4) pools.special.push(T.special[0]);
    if (n >= 7) pools.special.push(...T.special.slice(1));
    if (n >= 11 && town > 1) pools.special.push(pick(r, RK.Data.towns[town - 2].special));
    if (n <= 3) { pools.ranged = n === 3 ? [T.ranged[0]] : []; }
    const waves = 3 + Math.floor((n - 1) / 4) + (n === 15 ? 1 : 0);
    const st = {
      id: `T${town}-S${n}`, town, number: n, mode: 'story', name: n === 15 ? `บอส: ${RK.Data.enemies[T.boss].nameTH}` : n === 10 ? 'มินิบอสบุก!' : `${T.nameTH} ${n}`,
      map: T.map, startingDonut: 150 + Math.round(d * 3) + (n <= 3 ? 50 : 0), baseHP: Math.round(1000 * RK.Data.difficulty(d).atk / 50) * 50, d, scale: RK.Data.difficulty(d), recommendedPower: Math.round(100 * Math.pow(1.03, d - 1)),
      waves: buildWaves(r, { d, waves, perWave: 3 + Math.floor(d / 18) + Math.floor(n / 4), pools, specialShare: n <= 3 ? 0 : 0.4, mini: n === 10 ? T.mini : null, boss: n === 15 ? T.boss : null }),
      terrain: terrainFor(r, T.terrain, n <= 2 ? 0 : 3 + Math.floor(n / 4), 5, 9),
      stars: [{ type: 'clear', text: 'ผ่านด่าน' }, { type: 'baseHpAbove', value: 0.7, text: 'ฐานเหลือ HP ≥ 70%' }, STAR3[(town + n) % STAR3.length](d)],
      reward: { gold: 80 + d * 9, exp: 15 + d, gems: n === 15 ? 100 : n === 10 ? 50 : 20, fragments: 3 + Math.floor(n / 5), materials: { cookie: 2 + Math.floor(d / 15), honey: n % 5 === 0 ? 2 : 0, crystal: n === 15 ? 2 : 0 },
        unlock: RK.Data.storyUnlocks[`T${town}-S${n}`] || [] }
    };
    if (n === 10) st.miniBoss = T.mini; if (n === 15) st.boss = T.boss;
    return st;
  };
  // ---- All 120 story stages ----
  RK.Data.stages = {};
  for (let t = 1; t <= 8; t++) for (let n = 1; n <= 15; n++) {
    const id = `T${t}-S${n}`;
    const h = RK.Data.handStages[id];
    if (h) { const g = RK.Data.genStoryStage(t, n); RK.Data.stages[id] = Object.assign(g, h, { mode: 'story', d: g.d, scale: { hp: 1, atk: 1 }, reward: Object.assign({}, g.reward, h.reward) }); }
    else RK.Data.stages[id] = RK.Data.genStoryStage(t, n);
  }

  // ---------------- Events (doc 15.14) ----------------
  RK.Data.events = [
    { id: 'halloween', name: 'Halloween Night', nameTH: 'เทศกาลฮาโลวีน', map: 'MAP_EV_HALLOWEEN', enemies: ['EV_JACK', 'EV_SKELETON', 'EV_REAPER', 'EV_VAMPIRE', 'ZOM_PUMPKIN', 'ZOM_DEVIL'], boss: 'EV_TRIPLE', costume: 'CS_SHADOW', banner: 'EV_JACK', color: '#7B3FA0' },
    { id: 'christmas', name: 'Christmas', nameTH: 'คริสต์มาสหิมะ', map: 'MAP_TOWN5', enemies: ['EV_CAKE', 'EV_REINDEER', 'ZOM_SNOW', 'EV_CUPCAKE', 'ZOM_ICE'], boss: 'ZOM_ICE_GIANT', costume: 'CS_MINT', banner: 'EV_REINDEER', color: '#2E8B57' },
    { id: 'sakura', name: 'Sakura Festival', nameTH: 'เทศกาลซากุระ', map: 'MAP_EV_SAKURA', enemies: ['EV_BRIDE', 'EV_JIANGSHI', 'EV_YUREI', 'ZOM_SAKURA', 'ZOM_NINJA'], boss: 'ZOM_SAKURA_DEMON', costume: 'CS_SAKURA', banner: 'EV_BRIDE', color: '#E86A9A' },
    { id: 'summer', name: 'Summer Beach', nameTH: 'ซัมเมอร์บีช', map: 'MAP_EV_SUMMER', enemies: ['EV_SODA', 'EV_POPCORN', 'EV_BOAR', 'ZOM_SURFER', 'ZOM_CRAB'], boss: 'BOSS_TENTACLE', costume: 'CS_OCEAN', banner: 'EV_SODA', color: '#1E90C8' },
    { id: 'donut', name: 'Donut Festival', nameTH: 'เทศกาลโดนัท', map: 'MAP_EV_DONUT', enemies: ['EV_DONUT', 'EV_CUPCAKE', 'EV_BURGER', 'EV_FRIES', 'EV_CHICK'], boss: 'EV_CAKE', costume: 'CS_STRAWBERRY', banner: 'EV_DONUT', color: '#E8739A' },
    { id: 'anniversary', name: 'Anniversary', nameTH: 'ครบรอบปี', map: 'MAP_EV_ANNIV', enemies: ['EV_GENTLEMAN', 'EV_MAGICIAN', 'EV_VOODOO', 'EV_TRIPLE', 'EV_WOLF'], boss: 'BOSS_FINAL_KING', costume: 'CS_GOLD', banner: 'EV_GENTLEMAN', color: '#D4A017' }
  ];
  const EV_D = [10, 25, 45, 70, 100], EV_NAME = ['ง่าย', 'ปกติ', 'ยาก', 'เชี่ยวชาญ', 'ฝันร้าย'];
  RK.Data.events.forEach((ev, ei) => {
    ev.stages = [];
    for (let k = 1; k <= 5; k++) {
      const r = rng(9000 + ei * 100 + k), d = EV_D[k - 1], m = RK.Data.maps[ev.map];
      const pools = { basic: ev.enemies.slice(0, 2), special: ev.enemies.slice(2), ranged: ['RZ_ROCK', 'RZ_TRASH'] };
      const id = `EV-${ev.id}-${k}`;
      const lanes = Array.from({ length: m.rows }, (_, i) => i + 1);
      RK.Data.stages[id] = { id, mode: 'event', event: ev.id, number: k, name: `${ev.nameTH} · ${EV_NAME[k - 1]}`, map: ev.map, startingDonut: 175 + d * 2, baseHP: Math.round(1000 * RK.Data.difficulty(d).atk / 50) * 50, d, scale: RK.Data.difficulty(d),
        recommendedPower: Math.round(100 * Math.pow(1.03, d - 1)), lanes,
        waves: buildWaves(r, { d, waves: 3 + Math.floor(k / 2), perWave: 4 + Math.floor(d / 10), pools, lanes: 'random', boss: k === 5 ? ev.boss : null }),
        terrain: [], stars: [{ type: 'clear', text: 'ผ่านด่าน' }, { type: 'baseHpAbove', value: 0.6, text: 'ฐานเหลือ HP ≥ 60%' }, { type: 'collectDonuts', value: 20, text: 'เก็บโดนัท 20 ชิ้น' }],
        reward: { gold: 100 + d * 6, exp: 20 + d, eventDonut: 30 + k * 20, gems: 10 * k } };
      ev.stages.push(id);
    }
  });

  // ---------------- Challenge stages (lobby "โหมดท้าทาย") ----------------
  const CH = [
    { name: 'ทางลัด 3 เลน', desc: 'มีแค่ 3 แถวกลาง ซอมบี้วิ่งไวล้วน', rules: { lanes: [2, 3, 4] }, pools: { basic: ['ZOM_NURSE', 'ZOM_NINJA'], special: ['ZOM_SURFER'], ranged: [] }, d: 20 },
    { name: 'ไม่มีเครื่องผลิต', desc: 'ห้ามวางเครื่องผลิต เริ่มด้วยโดนัท 1,500', rules: { noFactory: true, startingDonut: 1500 }, pools: { basic: ['ZOM_NORMAL', 'ZOM_CONE'], special: ['ZOM_BUCKET', 'ZOM_HEAVY'], ranged: ['RZ_ROCK'] }, d: 15 },
    { name: 'ป้องกันล้วน', desc: 'ใช้ได้เฉพาะ Defender / Support / Producer + กับดัก', rules: { roles: ['Defender', 'Support', 'Producer', 'Special'] }, pools: { basic: ['ZOM_NORMAL', 'ZOM_NURSE'], special: ['ZOM_CONE'], ranged: [] }, d: 12 },
    { name: 'ฝนผีลอยฟ้า', desc: 'ซอมบี้บินได้ล้วน — ต้องหมุนตัวละครยิงข้างหลัง!', rules: {}, pools: { basic: ['ZOM_GHOST', 'ZOM_FLYING'], special: ['ZOM_DEVIL', 'ZOM_ANGEL'], ranged: [] }, d: 30 },
    { name: 'จำกัด 6 ตัว', desc: 'วางตัวละครบนสนามพร้อมกันได้ไม่เกิน 6 ตัว (ไม่นับเครื่องผลิต)', rules: { maxUnits: 6 }, pools: { basic: ['ZOM_NORMAL', 'ZOM_PIRATE'], special: ['ZOM_CRAB', 'ZOM_SAMURAI'], ranged: ['RZ_BUILDER'] }, d: 25 },
    { name: 'Boss Rush', desc: 'บอส 3 ตัวติดกัน', rules: {}, bossRush: ['BOSS_GIANT_ZOMBIE_KUMA', 'ZOM_SAKURA_DEMON', 'BOSS_TENTACLE'], pools: { basic: ['ZOM_NORMAL'], special: [], ranged: [] }, d: 35 },
    { name: 'กับดักเท่านั้น', desc: 'ใช้ได้แค่เครื่องผลิต + กับดัก (แจกกับดักทุกชนิดชนิดละ 5 ชิ้นเฉพาะด่านนี้)', rules: { roles: ['Producer'], freeTraps: 5 }, pools: { basic: ['ZOM_NORMAL', 'ZOM_NURSE'], special: ['ZOM_CONE'], ranged: [] }, d: 4 },
    { name: 'ลาวาเดือด', desc: 'ครึ่งสนามเป็นลาวา ตัวละครที่ยืนบนลาวาเสีย HP', rules: { lavaHalf: true }, map: 'MAP_TOWN7', pools: { basic: ['ZOM_FIRE', 'ZOM_NORMAL'], special: ['ZOM_MAGMA'], ranged: ['RZ_TRASH'] }, d: 40 },
    { name: 'ระเบิดรอบด้าน', desc: 'ซอมบี้ระเบิดเมื่อตาย — อย่าวางตัวละครติดกัน', rules: {}, pools: { basic: ['ZOM_SCIENTIST', 'EV_JACK'], special: ['ZOM_MUSHROOM'], ranged: [] }, d: 45 },
    { name: 'ยักษ์ใหญ่', desc: 'ซอมบี้ยักษ์และมินิบอสล้วน', rules: {}, pools: { basic: ['ZOM_HEAVY', 'ZOM_PLANT'], special: ['ZOM_MAGMA', 'ZOM_FROZEN_KNIGHT'], ranged: [] }, mini: 'BOSS_TANK', d: 55 }
  ];
  RK.Data.challenges = CH.map((c, i) => {
    const id = `CH-${i + 1}`, r = rng(7000 + i), d = c.d, map = c.map || 'MAP_EV_HARVEST';
    const waves = buildWaves(r, { d, waves: 4, perWave: 5 + Math.floor(d / 10), pools: c.pools, lanes: c.rules.lanes || 'random', mini: c.mini });
    if (c.bossRush) c.bossRush.forEach((b, k) => waves[Math.min(waves.length - 1, k + 1)].spawns.push({ enemy: b, count: 1, interval: 0, lanes: [3], at: 6, boss: true }));
    const terrain = c.rules.lavaHalf ? [].concat(...[1, 2, 3, 4, 5].map(rw => [5, 6, 7, 8, 9].map(cl => ({ row: rw, col: cl, type: 'Lava' })))) : [];
    RK.Data.stages[id] = { id, mode: 'challenge', number: i + 1, name: c.name, desc: c.desc, rules: c.rules, map, startingDonut: c.rules.startingDonut || (200 + d * 2), baseHP: Math.round(1000 * RK.Data.difficulty(d).atk / 50) * 50, d, scale: RK.Data.difficulty(d),
      recommendedPower: Math.round(100 * Math.pow(1.03, d - 1)), waves, terrain,
      stars: [{ type: 'clear', text: 'ผ่านด่าน' }, { type: 'baseHpAbove', value: 0.5, text: 'ฐาน ≥ 50%' }, { type: 'baseHpAbove', value: 0.9, text: 'ฐาน ≥ 90%' }],
      reward: { gold: 300 + d * 10, exp: 30 + d, gems: 80 } };
    return id;
  });

  // ---------------- CO-OP campaign (10 rows) ----------------
  RK.Data.coopStages = RK.Data.towns.map((T, i) => {
    const id = `CO-${i + 1}`, r = rng(5000 + i), d = i === 0 ? 3 : 8 + i * 14;   // CO-1 is open from the start → gentler
    const lanes = 'random';
    RK.Data.stages[id] = { id, mode: 'coop', number: i + 1, name: `CO-OP · ${T.nameTH}`, map: 'MAP_COOP10', startingDonut: 300 + d * 3, baseHP: Math.round(1600 * RK.Data.difficulty(d).atk / 50) * 50, d, scale: { hp: RK.Data.difficulty(d).hp * 1.25, atk: RK.Data.difficulty(d).atk },
      recommendedPower: Math.round(100 * Math.pow(1.03, d - 1)),
      waves: buildWaves(r, { d, waves: 4 + Math.floor(i / 3), perWave: Math.round((5 + Math.floor(d / 10)) * 1.8), pools: { basic: T.basic, special: T.special, ranged: T.ranged }, lanes, boss: T.boss }),
      terrain: [], stars: [{ type: 'clear', text: 'ผ่านด่าน' }, { type: 'baseHpAbove', value: 0.6, text: 'ฐาน ≥ 60%' }, { type: 'collectDonuts', value: 40, text: 'เก็บโดนัทรวม 40 ชิ้น' }],
      reward: { gold: 400 + d * 10, exp: 40 + d, gems: 60 } };
    return id;
  });

  // ---------------- Endless ----------------
  RK.Data.stages['ENDLESS'] = { id: 'ENDLESS', mode: 'endless', name: 'โหมดไม่รู้จบ', map: 'MAP_EV_HARVEST', startingDonut: 200, baseHP: 1500, d: 5, scale: { hp: 1, atk: 1 }, endless: true,
    waves: [], terrain: [], stars: [], reward: { gold: 0, exp: 0 } };

  // ---------------- VS ----------------
  RK.Data.stages['VS'] = { id: 'VS', mode: 'vs', name: 'VS Mode', map: 'MAP_TOWN1', startingDonut: 300, baseHP: 1500, d: 10, scale: { hp: 1, atk: 1 }, waves: [], terrain: [], stars: [], reward: { gold: 150, exp: 30 } };
})();
