// ===== Towns, Maps and Stage Database (doc PART 13/14, 21.3) =====
// Battlefield geometry is measured from the painted board so taps land on the painted tiles.
// rowY = y of each row boundary (top of row 1 ... bottom of row 5)
// topL/topR = x of the board's left/right edge at rowY[0]; botL/botR = same at the last rowY.
RK.Data.maps = {
  MAP_TOWN1: { asset: 'MAP_TOWN1', rows: 5, cols: 9, rowY: [243, 340, 437, 537, 637, 743], topL: 344, topR: 1349, botL: 296, botR: 1407,
               baseCol: -0.35, spawnCol: 9.7, terrain: 'Normal Ground' }
};

RK.Data.towns = [
  { id: 1, key: 'TOWN1', name: 'Rilakkuma Town', boss: 'Giant Zombie Kuma', map: 'MAP_TOWN1', built: true },
  { id: 2, key: 'TOWN2', name: 'Sakura Town', boss: 'Sakura Demon Kuma', map: 'MAP_TOWN2', built: false },
  { id: 3, key: 'TOWN3', name: 'Seaside Town', boss: 'Giant Sea Monster Kuma', map: 'MAP_TOWN3', built: false },
  { id: 4, key: 'TOWN4', name: 'Forest Town', boss: 'Giant Mushroom Zombie', map: 'MAP_TOWN4', built: false },
  { id: 5, key: 'TOWN5', name: 'Snow Town', boss: 'Ice Giant Kuma', map: 'MAP_TOWN5', built: false },
  { id: 6, key: 'TOWN6', name: 'Desert Town', boss: 'Pharaoh Giant Kuma', map: 'MAP_TOWN6', built: false },
  { id: 7, key: 'TOWN7', name: 'Volcano Town', boss: 'Inferno Giant Kuma', map: 'MAP_TOWN7', built: false },
  { id: 8, key: 'TOWN8', name: 'Sky Castle', boss: 'Final King Zombie Kuma', map: 'MAP_TOWN8', built: false }
];

// Characters the player owns on a fresh save
RK.Data.startingCharacters = ['FACTORY', 'ATK_DONUT_KUMA', 'DEF_POT_SHIELD', 'ATK_LADLE_TORI'];
RK.Data.maxDeck = 8;          // cards besides the factory (doc 15.5: team of 8)

// Wave spawn entry: { enemy, count, interval (s between spawns), lanes: 'random' | [row numbers 1-5] }
// wave.delay = seconds to wait before this wave starts (after the previous wave finished spawning)
// wave.clearToAdvance = next wave waits until this wave's zombies are all dead (or wave.timeout passes)
RK.Data.stages = {
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
RK.Data.stagesPerTown = 15;   // stages 6-15 of Town 1 and Towns 2-8 are Phase 3 content
