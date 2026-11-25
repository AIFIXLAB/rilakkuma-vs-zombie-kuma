// ===== Enemy Database (doc PART 9/10, 13.4, 21.2) =====
// speed = cells/second · range in cells · attackSpeed = seconds between attacks · values are pre-difficulty-scaling
// Behaviour flags (implemented in js/battle/entities.js):
//   fly        flies over bear units (only projectiles / turned-around units can hit it after it passes)
//   jump       leaps over the first unit that blocks it (once)
//   heal       { amount, radius, interval } heals nearby zombies
//   summon     { enemy, interval, count } spawns minions
//   explode    { dmg, radius } damages bears around it when it dies
//   slowAura   { strength, cells } bears in its row within N cells attack slower
//   burrow     { surfaceAt } untargetable underground until x <= surfaceAt
//   split      { enemy, count } splits on death
//   hitStatus  status applied by its melee hit · blink: periodically untargetable
//   boss: { phases:[{at, speed, skills:[...] }], skillInterval } — skills: stomp | summon | roar | slam | freeze | fireRain | shield | heal
const Z = (o) => Object.assign({ def: 0, range: 0, attackSpeed: 1.0, scale: 1.25, reward: { gold: 2 } }, o);
RK.Data.enemies = {
  // ---------------- Town 1 · basics ----------------
  ZOM_NORMAL: Z({ id: 'ZOM_NORMAL', name: 'Normal Zombie Kuma', nameTH: 'ซอมบี้คุมะ', role: 'Melee', asset: 'ZOM_NORMAL', hp: 200, atk: 22, speed: 0.22, desc: 'เดินตรง กัดทุกอย่างที่ขวาง' }),
  ZOM_NURSE: Z({ id: 'ZOM_NURSE', name: 'Fast Zombie (Nurse)', nameTH: 'ซอมบี้พยาบาลวิ่งไว', role: 'Fast', asset: 'ZOM_NURSE', hp: 130, atk: 14, speed: 0.46, attackSpeed: 0.8, scale: 1.2, desc: 'วิ่งเร็ว HP ต่ำ' }),
  ZOM_HEAVY: Z({ id: 'ZOM_HEAVY', name: 'Heavy Zombie Kuma', nameTH: 'ซอมบี้คุมะยักษ์', role: 'Tank', asset: 'ZOM_HEAVY', hp: 760, atk: 60, def: 5, speed: 0.13, attackSpeed: 1.6, scale: 1.55, reward: { gold: 6 }, desc: 'HP สูง เดินช้า กัดแรง' }),
  ZOM_CONE: Z({ id: 'ZOM_CONE', name: 'Armor Zombie (Cone)', nameTH: 'ซอมบี้หมวกกรวย', role: 'Melee', asset: 'ZOM_CONE', hp: 200, armorHp: 260, armorReduction: 0.2, atk: 22, speed: 0.22, scale: 1.3, reward: { gold: 3 }, desc: 'มีเกราะกรวย ต้องทำลายก่อน' }),
  ZOM_BUCKET: Z({ id: 'ZOM_BUCKET', name: 'Shield Zombie (Bucket)', nameTH: 'ซอมบี้ถังน้ำ', role: 'Melee', asset: 'ZOM_BUCKET', hp: 200, shieldHp: 560, shieldReduction: 0.3, atk: 22, speed: 0.2, scale: 1.3, reward: { gold: 4 }, desc: 'โล่ถังกันดาเมจด้านหน้า' }),
  ZOM_MINER: Z({ id: 'ZOM_MINER', name: 'Miner Zombie', nameTH: 'ซอมบี้คนงานเหมือง', role: 'Special', asset: 'ZOM_MINER', hp: 240, atk: 24, speed: 0.24, burrow: { surfaceAt: 4 }, reward: { gold: 4 }, desc: 'ขุดดินมุดใต้ดิน โผล่ขึ้นมากลางสนาม' }),
  ZOM_CHEF_MELEE: Z({ id: 'ZOM_CHEF_MELEE', name: 'Spatula Chef Zombie', nameTH: 'ซอมบี้เชฟตะหลิว', role: 'Melee', asset: 'ZOM_CHEF_MELEE', hp: 260, atk: 30, speed: 0.24, hitStatus: { type: 'burn', strength: 4, duration: 3 }, reward: { gold: 3 }, desc: 'ตีร้อนติด Burn' }),

  // ---------------- Ranged (doc PART 10) ----------------
  RZ_ROCK: Z({ id: 'RZ_ROCK', name: 'Rock Zombie', nameTH: 'ซอมบี้ขว้างหิน', role: 'Ranged', asset: 'RZ_ROCK', hp: 170, atk: 22, speed: 0.2, range: 3.5, attackSpeed: 2.6, scale: 1.3, projectile: { asset: 'PROJ_ROCK', speed: 4.5, damageType: 'normal' }, reward: { gold: 3 }, desc: 'ขว้างหิน ดาเมจปกติ' }),
  RZ_BUILDER: Z({ id: 'RZ_BUILDER', name: 'Builder Zombie', nameTH: 'ซอมบี้ช่างก่อสร้าง', role: 'Ranged', asset: 'RZ_BUILDER', hp: 190, atk: 42, def: 2, speed: 0.18, range: 3.2, attackSpeed: 3.8, scale: 1.3, projectile: { asset: 'PROJ_BRICK', speed: 4, damageType: 'heavy' }, reward: { gold: 4 }, desc: 'ขว้างอิฐ แรงแต่ช้า' }),
  RZ_CHEF: Z({ id: 'RZ_CHEF', name: 'Chef Zombie', nameTH: 'ซอมบี้เชฟไข่ดาว', role: 'Ranged', asset: 'RZ_CHEF', hp: 170, atk: 14, speed: 0.2, range: 3.4, attackSpeed: 2.8, scale: 1.3, projectile: { asset: 'PROJ_EGG', speed: 4.2, damageType: 'normal', status: { type: 'stun', strength: 1, duration: 0.7 } }, reward: { gold: 4 }, desc: 'ไข่ดาวทำให้มึน' }),
  RZ_FARMER: Z({ id: 'RZ_FARMER', name: 'Farmer Zombie', nameTH: 'ซอมบี้ชาวไร่', role: 'Ranged', asset: 'RZ_FARMER', hp: 180, atk: 18, speed: 0.2, range: 3.4, attackSpeed: 2.8, scale: 1.3, projectile: { asset: 'PROJ_TOMATO', speed: 4.2, damageType: 'normal', status: { type: 'slow', strength: 0.35, duration: 3, chance: 0.5 } }, reward: { gold: 4 }, desc: 'มะเขือเทศ มีโอกาส Slow' }),
  RZ_TRASH: Z({ id: 'RZ_TRASH', name: 'Trash Zombie', nameTH: 'ซอมบี้ถังขยะ', role: 'Ranged', asset: 'RZ_TRASH', hp: 160, atk: 9, speed: 0.22, range: 3.0, attackSpeed: 1.0, scale: 1.3, projectile: { asset: 'PROJ_CAN', speed: 5, damageType: 'normal' }, reward: { gold: 4 }, desc: 'ขว้างกระป๋องรัว' }),
  RZ_TOXIC: Z({ id: 'RZ_TOXIC', name: 'Toxic Zombie', nameTH: 'ซอมบี้ยาพิษ', role: 'Ranged', asset: 'RZ_TOXIC', hp: 170, atk: 10, speed: 0.2, range: 3.5, attackSpeed: 3.0, scale: 1.3, projectile: { asset: 'PROJ_POISON_BOTTLE', speed: 4, damageType: 'poison', status: { type: 'poison', strength: 6, duration: 4 } }, reward: { gold: 5 }, desc: 'ขวดพิษ Poison ต่อเนื่อง' }),

  // ---------------- Town 2 · Sakura ----------------
  ZOM_SAMURAI: Z({ id: 'ZOM_SAMURAI', name: 'Samurai Zombie', nameTH: 'ซอมบี้ซามูไร', role: 'Melee', asset: 'ZOM_SAMURAI', hp: 320, armorHp: 220, armorReduction: 0.15, atk: 40, speed: 0.2, scale: 1.3, reward: { gold: 5 }, desc: 'ฟันแรง มีเกราะ' }),
  ZOM_NINJA: Z({ id: 'ZOM_NINJA', name: 'Ninja Zombie', nameTH: 'ซอมบี้นินจา', role: 'Fast', asset: 'ZOM_NINJA', hp: 170, atk: 20, speed: 0.4, jump: true, scale: 1.25, reward: { gold: 4 }, desc: 'กระโดดข้ามตัวแรกที่ขวาง' }),
  ZOM_GHOST: Z({ id: 'ZOM_GHOST', name: 'Ghost Kuma', nameTH: 'ผีคุมะ', role: 'Special', asset: 'ZOM_GHOST', hp: 150, atk: 18, speed: 0.28, fly: true, reward: { gold: 4 }, desc: 'ลอยผ่านหัวตัวละคร — หมุนตัวละครไปยิงข้างหลัง!' }),
  ZOM_SAKURA: Z({ id: 'ZOM_SAKURA', name: 'Sakura Zombie', nameTH: 'ซอมบี้ซากุระ', role: 'Support', asset: 'ZOM_SAKURA', hp: 220, atk: 16, speed: 0.2, heal: { amount: 30, radius: 1.3, interval: 3 }, reward: { gold: 5 }, desc: 'กลีบซากุระฟื้น HP ซอมบี้รอบตัว' }),
  ZOM_SAKURA_DEMON: Z({ id: 'ZOM_SAKURA_DEMON', name: 'Sakura Demon Kuma', nameTH: 'ปีศาจซากุระคุมะ', role: 'Boss', asset: 'ZOM_SAKURA_DEMON', hp: 2700, atk: 90, def: 6, speed: 0.1, attackSpeed: 1.6, scale: 2.4, isBoss: true, hitsAllInCell: true, reward: { gold: 80 },
    boss: { skillInterval: 9, phases: [{ at: 1, speed: 1, skills: ['summon'] }, { at: 0.66, speed: 1.2, skills: ['summon', 'heal'] }, { at: 0.33, speed: 1.5, skills: ['freeze', 'summon', 'roar'] }], summon: 'ZOM_NINJA' }, desc: 'บอสเมืองซากุระ เรียกนินจา ฟื้นตัว' }),

  // ---------------- Town 3 · Seaside ----------------
  ZOM_PIRATE: Z({ id: 'ZOM_PIRATE', name: 'Beach Zombie (Pirate)', nameTH: 'ซอมบี้โจรสลัดชายหาด', role: 'Melee', asset: 'ZOM_PIRATE', hp: 300, atk: 30, def: 3, speed: 0.22, scale: 1.3, reward: { gold: 4 }, desc: 'ตะขอเหล็ก ทนกว่าปกติ' }),
  ZOM_SURFER: Z({ id: 'ZOM_SURFER', name: 'Surfer Zombie', nameTH: 'ซอมบี้นักโต้คลื่น', role: 'Fast', asset: 'ZOM_SURFER', hp: 180, atk: 18, speed: 0.45, jump: true, reward: { gold: 4 }, desc: 'โต้คลื่นข้ามแนวป้องกัน' }),
  ZOM_CRAB: Z({ id: 'ZOM_CRAB', name: 'Crab Zombie', nameTH: 'ซอมบี้ปู', role: 'Tank', asset: 'ZOM_CRAB', hp: 260, shieldHp: 700, shieldReduction: 0.35, atk: 26, speed: 0.17, scale: 1.3, reward: { gold: 5 }, desc: 'กระดองแข็ง (Shield)' }),
  ZOM_LIFEGUARD: Z({ id: 'ZOM_LIFEGUARD', name: 'Lifeguard Zombie', nameTH: 'ซอมบี้ไลฟ์การ์ด', role: 'Support', asset: 'ZOM_LIFEGUARD', hp: 240, atk: 14, speed: 0.24, heal: { amount: 40, radius: 1.5, interval: 4 }, reward: { gold: 5 }, desc: 'ช่วยชีวิตซอมบี้ (Heal)' }),
  BOSS_TENTACLE: Z({ id: 'BOSS_TENTACLE', name: 'Giant Sea Monster Kuma', nameTH: 'ปีศาจทะเลยักษ์', role: 'Boss', asset: 'BOSS_TENTACLE', hp: 3350, atk: 100, def: 6, speed: 0.08, attackSpeed: 1.8, scale: 2.5, isBoss: true, hitsAllInCell: true, reward: { gold: 90 },
    boss: { skillInterval: 8, phases: [{ at: 1, speed: 1, skills: ['slam'] }, { at: 0.66, speed: 1.15, skills: ['slam', 'summon'] }, { at: 0.33, speed: 1.4, skills: ['slam', 'stomp', 'summon'] }], summon: 'ZOM_CRAB' }, desc: 'หนวดฟาด 3 แถว เรียกปู' }),

  // ---------------- Town 4 · Forest ----------------
  ZOM_FOREST: Z({ id: 'ZOM_FOREST', name: 'Forest Zombie', nameTH: 'ซอมบี้ป่า', role: 'Melee', asset: 'ZOM_FOREST', hp: 280, atk: 26, speed: 0.22, reward: { gold: 4 }, desc: 'ซอมบี้ขนรก เดินดุ' }),
  ZOM_MUSHROOM: Z({ id: 'ZOM_MUSHROOM', name: 'Mushroom Zombie', nameTH: 'ซอมบี้เห็ด', role: 'Special', asset: 'ZOM_MUSHROOM', hp: 240, atk: 18, speed: 0.2, explode: { dmg: 60, radius: 1.1, status: { type: 'poison', strength: 5, duration: 4 } }, reward: { gold: 5 }, desc: 'ตายแล้วปล่อยสปอร์พิษ' }),
  ZOM_PLANT: Z({ id: 'ZOM_PLANT', name: 'Plant Zombie', nameTH: 'ซอมบี้ต้นไม้กินคน', role: 'Tank', asset: 'ZOM_PLANT', hp: 680, atk: 50, def: 4, speed: 0.14, scale: 1.45, reward: { gold: 6 }, desc: 'งับแรง HP สูง' }),
  ZOM_POISON: Z({ id: 'ZOM_POISON', name: 'Poison Zombie', nameTH: 'ซอมบี้เมือกพิษ', role: 'Melee', asset: 'ZOM_POISON', hp: 230, atk: 16, speed: 0.22, hitStatus: { type: 'poison', strength: 6, duration: 4 }, reward: { gold: 5 }, desc: 'กัดติดพิษ' }),
  BOSS_TOXIC_SLIME: Z({ id: 'BOSS_TOXIC_SLIME', name: 'Toxic Slime Zombie', nameTH: 'สไลม์พิษยักษ์', role: 'Boss', asset: 'BOSS_TOXIC_SLIME', hp: 1800, atk: 40, def: 3, speed: 0.12, scale: 1.9, miniBoss: true, split: { enemy: 'ZOM_POISON', count: 3 }, hitStatus: { type: 'poison', strength: 8, duration: 4 }, reward: { gold: 40 }, desc: 'Mini Boss แตกตัวเมื่อตาย' }),
  ZOM_MUSHROOM_KING: Z({ id: 'ZOM_MUSHROOM_KING', name: 'Giant Mushroom Zombie', nameTH: 'ราชาเห็ดยักษ์', role: 'Boss', asset: 'ZOM_MUSHROOM', hp: 3600, atk: 95, def: 6, speed: 0.08, attackSpeed: 1.8, scale: 2.5, isBoss: true, hitsAllInCell: true, reward: { gold: 100 },
    explode: { dmg: 120, radius: 1.5 }, boss: { skillInterval: 8, phases: [{ at: 1, speed: 1, skills: ['summon'] }, { at: 0.66, speed: 1.2, skills: ['summon', 'fireRain'] }, { at: 0.33, speed: 1.4, skills: ['fireRain', 'summon', 'heal'] }], summon: 'ZOM_MUSHROOM', rainType: 'poison' }, desc: 'โปรยสปอร์พิษทั่วสนาม' }),

  // ---------------- Town 5 · Snow ----------------
  ZOM_SNOW: Z({ id: 'ZOM_SNOW', name: 'Snow Zombie', nameTH: 'ซอมบี้หิมะ', role: 'Melee', asset: 'ZOM_SNOW', hp: 300, atk: 26, speed: 0.22, hitStatus: { type: 'slow', strength: 0.3, duration: 2 }, reward: { gold: 4 }, desc: 'กัดเย็นทำให้ช้า' }),
  ZOM_ICE: Z({ id: 'ZOM_ICE', name: 'Ice Zombie', nameTH: 'ซอมบี้น้ำแข็ง', role: 'Special', asset: 'ZOM_ICE', hp: 260, atk: 20, speed: 0.22, slowAura: { strength: 0.3, cells: 3 }, reward: { gold: 5 }, desc: 'ไอเย็นทำให้ตัวละครในแถวโจมตีช้าลง' }),
  ZOM_FROZEN_KNIGHT: Z({ id: 'ZOM_FROZEN_KNIGHT', name: 'Frozen Knight', nameTH: 'อัศวินน้ำแข็ง', role: 'Tank', asset: 'ZOM_FROZEN_KNIGHT', hp: 420, armorHp: 600, armorReduction: 0.25, atk: 45, def: 6, speed: 0.15, scale: 1.4, reward: { gold: 7 }, desc: 'เกราะหนามาก' }),
  ZOM_ICE_THROWER: Z({ id: 'ZOM_ICE_THROWER', name: 'Ice Thrower', nameTH: 'ซอมบี้ขว้างก้อนน้ำแข็ง', role: 'Ranged', asset: 'ZOM_ICE_THROWER', hp: 200, atk: 18, speed: 0.2, range: 3.6, attackSpeed: 2.8, projectile: { asset: 'PROJ_ROCK', tint: 'ice', speed: 4.4, damageType: 'ice', status: { type: 'slow', strength: 0.4, duration: 3 } }, reward: { gold: 5 }, desc: 'ก้อนน้ำแข็งทำให้ช้า' }),
  ZOM_ICE_GIANT: Z({ id: 'ZOM_ICE_GIANT', name: 'Ice Giant Kuma', nameTH: 'ยักษ์น้ำแข็งคุมะ', role: 'Boss', asset: 'ZOM_ICE_GIANT', hp: 4000, atk: 110, def: 8, speed: 0.07, attackSpeed: 2, scale: 2.6, isBoss: true, hitsAllInCell: true, slowAura: { strength: 0.3, cells: 4 }, reward: { gold: 110 },
    boss: { skillInterval: 8, phases: [{ at: 1, speed: 1, skills: ['freeze'] }, { at: 0.66, speed: 1.15, skills: ['freeze', 'summon'] }, { at: 0.33, speed: 1.35, skills: ['freeze', 'stomp', 'shield'] }], summon: 'ZOM_SNOW' }, desc: 'แช่แข็งทั้งแถว' }),

  // ---------------- Town 6 · Desert ----------------
  ZOM_MUMMY: Z({ id: 'ZOM_MUMMY', name: 'Mummy Zombie', nameTH: 'ซอมบี้มัมมี่', role: 'Tank', asset: 'ZOM_MUMMY', hp: 520, atk: 30, def: 4, speed: 0.17, scale: 1.35, heal: { amount: 15, radius: 0, interval: 2 }, reward: { gold: 5 }, desc: 'ฟื้น HP ตัวเองช้า ๆ' }),
  ZOM_PHARAOH: Z({ id: 'ZOM_PHARAOH', name: 'Pharaoh Zombie', nameTH: 'ซอมบี้ฟาโรห์', role: 'Support', asset: 'ZOM_PHARAOH', hp: 380, atk: 22, speed: 0.16, summon: { enemy: 'ZOM_SCARAB', interval: 9, count: 2 }, reward: { gold: 7 }, desc: 'เรียกแมงสคารับ' }),
  ZOM_SAND: Z({ id: 'ZOM_SAND', name: 'Sand Zombie', nameTH: 'ซอมบี้ทราย', role: 'Special', asset: 'ZOM_SAND', hp: 300, atk: 26, speed: 0.26, burrow: { surfaceAt: 3.5 }, reward: { gold: 5 }, desc: 'มุดทรายโผล่ใกล้ฐาน' }),
  ZOM_SCARAB: Z({ id: 'ZOM_SCARAB', name: 'Scarab Zombie', nameTH: 'แมงสคารับซอมบี้', role: 'Fast', asset: 'ZOM_SCARAB', hp: 90, atk: 10, speed: 0.55, attackSpeed: 0.6, scale: 1.0, reward: { gold: 1 }, desc: 'ฝูงแมลงวิ่งเร็ว' }),
  ZOM_PHARAOH_KING: Z({ id: 'ZOM_PHARAOH_KING', name: 'Pharaoh Giant Kuma', nameTH: 'ฟาโรห์ยักษ์คุมะ', role: 'Boss', asset: 'ZOM_PHARAOH_KING', hp: 4550, atk: 120, def: 8, speed: 0.07, attackSpeed: 1.9, scale: 2.6, isBoss: true, hitsAllInCell: true, reward: { gold: 120 },
    boss: { skillInterval: 8, phases: [{ at: 1, speed: 1, skills: ['summon'] }, { at: 0.66, speed: 1.15, skills: ['summon', 'shield'] }, { at: 0.33, speed: 1.4, skills: ['summon', 'shield', 'roar'] }], summon: 'ZOM_MUMMY' }, desc: 'เรียกมัมมี่ สร้างโล่ทองคำ' }),

  // ---------------- Town 7 · Volcano ----------------
  ZOM_FIRE: Z({ id: 'ZOM_FIRE', name: 'Fire Zombie', nameTH: 'ซอมบี้ไฟ', role: 'Melee', asset: 'ZOM_FIRE', hp: 320, atk: 26, speed: 0.24, hitStatus: { type: 'burn', strength: 7, duration: 4 }, reward: { gold: 5 }, desc: 'กัดติดไฟ' }),
  ZOM_DEVIL: Z({ id: 'ZOM_DEVIL', name: 'Lava Zombie (Devil)', nameTH: 'ซอมบี้ลาวามีปีก', role: 'Special', asset: 'ZOM_DEVIL', hp: 260, atk: 24, speed: 0.3, fly: true, reward: { gold: 6 }, desc: 'บินข้ามแนวป้องกัน' }),
  ZOM_SCIENTIST: Z({ id: 'ZOM_SCIENTIST', name: 'Explosive Zombie', nameTH: 'ซอมบี้นักวิทย์ระเบิด', role: 'Special', asset: 'ZOM_SCIENTIST', hp: 240, atk: 18, speed: 0.26, explode: { dmg: 160, radius: 1.2 }, reward: { gold: 6 }, desc: 'ตายแล้วระเบิดใส่ตัวละครรอบ ๆ' }),
  ZOM_MAGMA: Z({ id: 'ZOM_MAGMA', name: 'Magma Zombie', nameTH: 'ซอมบี้แมกมา', role: 'Tank', asset: 'ZOM_MAGMA', hp: 720, atk: 55, def: 6, speed: 0.13, scale: 1.45, hitStatus: { type: 'burn', strength: 10, duration: 4 }, reward: { gold: 7 }, desc: 'ร่างแมกมา กัดไหม้' }),
  BOSS_SPIKE_ARMOR: Z({ id: 'BOSS_SPIKE_ARMOR', name: 'Inferno Giant Kuma', nameTH: 'ยักษ์อินเฟอร์โน', role: 'Boss', asset: 'BOSS_SPIKE_ARMOR', hp: 5050, atk: 130, def: 10, speed: 0.07, attackSpeed: 1.8, scale: 2.4, isBoss: true, hitsAllInCell: true, reflect: 0.1, reward: { gold: 130 },
    boss: { skillInterval: 7, phases: [{ at: 1, speed: 1, skills: ['fireRain'] }, { at: 0.66, speed: 1.2, skills: ['fireRain', 'summon'] }, { at: 0.33, speed: 1.45, skills: ['fireRain', 'stomp', 'roar'] }], summon: 'ZOM_FIRE', rainType: 'burn' }, desc: 'ฝนไฟถล่มสนาม หนามสะท้อนดาเมจ' }),

  // ---------------- Town 8 · Sky Castle ----------------
  ZOM_FLYING: Z({ id: 'ZOM_FLYING', name: 'Flying Zombie', nameTH: 'ซอมบี้ลอยฟ้า', role: 'Fast', asset: 'ZOM_FLYING', hp: 220, atk: 20, speed: 0.34, fly: true, reward: { gold: 5 }, desc: 'บินข้ามทุกอย่าง' }),
  ZOM_DARK: Z({ id: 'ZOM_DARK', name: 'Dark Zombie', nameTH: 'ซอมบี้เงามืด', role: 'Special', asset: 'ZOM_DARK', hp: 380, atk: 34, speed: 0.22, blink: true, reward: { gold: 7 }, desc: 'หายตัวเป็นช่วง ๆ (โจมตีไม่ได้)' }),
  ZOM_ANGEL: Z({ id: 'ZOM_ANGEL', name: 'Angel Zombie', nameTH: 'ซอมบี้นางฟ้า', role: 'Support', asset: 'ZOM_ANGEL', hp: 300, atk: 16, speed: 0.26, fly: true, heal: { amount: 45, radius: 1.5, interval: 3 }, reward: { gold: 7 }, desc: 'บินและฟื้น HP พวกเดียวกัน' }),
  ZOM_WIZARD: Z({ id: 'ZOM_WIZARD', name: 'Sky Knight Zombie', nameTH: 'อัศวินเวทลอยฟ้า', role: 'Ranged', asset: 'ZOM_WIZARD', hp: 360, atk: 30, def: 4, speed: 0.2, range: 3.8, attackSpeed: 2.4, projectile: { asset: 'PROJ_POISON_BOTTLE', tint: 'purple', speed: 4.6, damageType: 'magic' }, reward: { gold: 7 }, desc: 'ยิงเวทม่วงทะลุ DEF' }),
  BOSS_FINAL_KING: Z({ id: 'BOSS_FINAL_KING', name: 'Final King Zombie Kuma', nameTH: 'ราชาซอมบี้คุมะ', role: 'Boss', asset: 'BOSS_FINAL_KING', hp: 6150, atk: 150, def: 12, speed: 0.07, attackSpeed: 1.6, scale: 2.6, isBoss: true, hitsAllInCell: true, reward: { gold: 200 },
    boss: { skillInterval: 6, phases: [{ at: 1, speed: 1, skills: ['summon', 'slam'] }, { at: 0.66, speed: 1.2, skills: ['summon', 'freeze', 'fireRain'] }, { at: 0.33, speed: 1.5, skills: ['summon', 'stomp', 'roar', 'shield', 'fireRain'] }], summon: 'ZOM_DARK', rainType: 'burn' }, desc: 'บอสสุดท้าย ใช้ทุกสกิล' }),

  // ---------------- Bosses & mini bosses ----------------
  BOSS_GIANT_ZOMBIE_KUMA: Z({ id: 'BOSS_GIANT_ZOMBIE_KUMA', name: 'Giant Zombie Kuma', nameTH: 'ซอมบี้คุมะยักษ์ใหญ่', role: 'Boss', asset: 'BOSS_GIANT_ZOMBIE_KUMA', hp: 2700, atk: 120, def: 8, speed: 0.08, attackSpeed: 2.2, scale: 2.3, isBoss: true, hitsAllInCell: true, reward: { gold: 60 },
    boss: { skillInterval: 10, phases: [{ at: 1, speed: 1, skills: ['stomp'] }, { at: 0.66, speed: 1.15, skills: ['stomp', 'summon'] }, { at: 0.33, speed: 1.4, skills: ['stomp', 'summon', 'roar'] }], summon: 'ZOM_NORMAL' }, desc: 'บอส Town 1 กระทืบพื้นทำให้มึน' }),
  BOSS_TANK: Z({ id: 'BOSS_TANK', name: 'Tank Zombie Kuma', nameTH: 'รถถังซอมบี้คุมะ', role: 'Boss', asset: 'BOSS_TANK', hp: 1600, armorHp: 800, armorReduction: 0.2, atk: 30, def: 6, speed: 0.1, range: 4, attackSpeed: 3, scale: 1.9, miniBoss: true, projectile: { asset: 'PROJ_BRICK', tint: 'dark', speed: 5, damageType: 'heavy' }, reward: { gold: 30 }, desc: 'Mini Boss ยิงกระสุนหนัก' }),
  ZOM_PUMPKIN: Z({ id: 'ZOM_PUMPKIN', name: 'Pumpkin Zombie', nameTH: 'ซอมบี้ฟักทอง', role: 'Melee', asset: 'ZOM_PUMPKIN', hp: 260, armorHp: 200, armorReduction: 0.2, atk: 22, speed: 0.22, reward: { gold: 4 }, desc: 'หัวฟักทองเป็นเกราะ' }),
  ZOM_PLAGUE_DOCTOR: Z({ id: 'ZOM_PLAGUE_DOCTOR', name: 'Plague Doctor Zombie', nameTH: 'ซอมบี้หมอโรคระบาด', role: 'Support', asset: 'ZOM_PLAGUE_DOCTOR', hp: 280, atk: 14, speed: 0.2, heal: { amount: 35, radius: 1.5, interval: 3 }, reward: { gold: 5 }, desc: 'รักษาซอมบี้' }),

  // ---------------- Event & Endless enemies ----------------
  EV_JACK: Z({ id: 'EV_JACK', name: 'Jack-o-Lantern Zombie', nameTH: 'ซอมบี้แจ็คโอแลนเทิร์น', role: 'Special', asset: 'EV_JACK', hp: 280, atk: 20, speed: 0.22, explode: { dmg: 90, radius: 1, status: { type: 'burn', strength: 6, duration: 3 } }, reward: { gold: 5 }, event: 'halloween', desc: 'ระเบิดไฟเมื่อตาย' }),
  EV_SKELETON: Z({ id: 'EV_SKELETON', name: 'Skeleton Zombie', nameTH: 'ซอมบี้โครงกระดูก', role: 'Fast', asset: 'EV_SKELETON', hp: 150, atk: 16, speed: 0.4, split: { enemy: 'ZOM_SCARAB', count: 1 }, reward: { gold: 3 }, event: 'halloween', desc: 'วิ่งไว' }),
  EV_REAPER: Z({ id: 'EV_REAPER', name: 'Reaper Zombie', nameTH: 'ยมทูตซอมบี้', role: 'Special', asset: 'EV_REAPER', hp: 420, atk: 60, speed: 0.2, fly: true, reward: { gold: 8 }, event: 'halloween', desc: 'ลอยข้ามและฟันแรง' }),
  EV_VAMPIRE: Z({ id: 'EV_VAMPIRE', name: 'Vampire Zombie', nameTH: 'ซอมบี้แวมไพร์', role: 'Special', asset: 'EV_VAMPIRE', hp: 360, atk: 28, speed: 0.24, lifesteal: 0.6, reward: { gold: 6 }, event: 'halloween', desc: 'ดูดเลือดฟื้นตัว' }),
  EV_CAKE: Z({ id: 'EV_CAKE', name: 'Christmas Cake Zombie', nameTH: 'ซอมบี้เค้กคริสต์มาส', role: 'Tank', asset: 'EV_CAKE', hp: 620, atk: 30, speed: 0.15, scale: 1.4, split: { enemy: 'EV_CUPCAKE', count: 2 }, reward: { gold: 6 }, event: 'christmas', desc: 'แตกเป็นคัพเค้ก' }),
  EV_REINDEER: Z({ id: 'EV_REINDEER', name: 'Reindeer Zombie', nameTH: 'ซอมบี้เรนเดียร์', role: 'Fast', asset: 'EV_REINDEER', hp: 220, atk: 18, speed: 0.48, jump: true, reward: { gold: 4 }, event: 'christmas', desc: 'กระโดดข้ามแนว' }),
  EV_CUPCAKE: Z({ id: 'EV_CUPCAKE', name: 'Cupcake Zombie', nameTH: 'ซอมบี้คัพเค้ก', role: 'Fast', asset: 'EV_CUPCAKE', hp: 110, atk: 12, speed: 0.4, scale: 1.0, reward: { gold: 1 }, event: 'donut', desc: 'ตัวเล็กวิ่งเร็ว' }),
  EV_BRIDE: Z({ id: 'EV_BRIDE', name: 'Bride Zombie', nameTH: 'ซอมบี้เจ้าสาว', role: 'Support', asset: 'EV_BRIDE', hp: 300, atk: 16, speed: 0.2, heal: { amount: 40, radius: 1.5, interval: 3 }, reward: { gold: 5 }, event: 'sakura', desc: 'โยนช่อดอกไม้ฟื้น HP' }),
  EV_JIANGSHI: Z({ id: 'EV_JIANGSHI', name: 'Jiangshi Zombie', nameTH: 'ซอมบี้กระโดดเจียงซือ', role: 'Fast', asset: 'EV_JIANGSHI', hp: 260, atk: 24, speed: 0.34, jump: true, reward: { gold: 5 }, event: 'sakura', desc: 'กระโดดข้ามแนว' }),
  EV_YUREI: Z({ id: 'EV_YUREI', name: 'Yurei Zombie', nameTH: 'ผียูเร', role: 'Special', asset: 'EV_YUREI', hp: 280, atk: 26, speed: 0.22, fly: true, blink: true, reward: { gold: 6 }, event: 'sakura', desc: 'ลอยและหายตัว' }),
  EV_SODA: Z({ id: 'EV_SODA', name: 'Soda Zombie', nameTH: 'ซอมบี้โซดา', role: 'Special', asset: 'EV_SODA', hp: 240, atk: 18, speed: 0.26, explode: { dmg: 70, radius: 1, status: { type: 'slow', strength: 0.4, duration: 3 } }, reward: { gold: 4 }, event: 'summer', desc: 'ระเบิดฟองเหนียว' }),
  EV_POPCORN: Z({ id: 'EV_POPCORN', name: 'Popcorn Zombie', nameTH: 'ซอมบี้ป๊อปคอร์น', role: 'Ranged', asset: 'EV_POPCORN', hp: 220, atk: 8, speed: 0.22, range: 3.2, attackSpeed: 0.8, projectile: { asset: 'PROJ_EGG', tint: 'cream', speed: 5, damageType: 'normal' }, reward: { gold: 4 }, event: 'summer', desc: 'ยิงป๊อปคอร์นรัว' }),
  EV_BOAR: Z({ id: 'EV_BOAR', name: 'Boar Zombie', nameTH: 'ซอมบี้หมูป่า', role: 'Tank', asset: 'EV_BOAR', hp: 560, atk: 45, def: 3, speed: 0.3, scale: 1.3, reward: { gold: 5 }, event: 'summer', desc: 'พุ่งชนแรง' }),
  EV_DONUT: Z({ id: 'EV_DONUT', name: 'Donut Zombie', nameTH: 'ซอมบี้โดนัท', role: 'Melee', asset: 'EV_DONUT', hp: 300, atk: 20, speed: 0.22, reward: { gold: 5, donut: 1 }, event: 'donut', desc: 'ตายแล้วทิ้งโดนัท!' }),
  EV_BURGER: Z({ id: 'EV_BURGER', name: 'Burger Zombie', nameTH: 'ซอมบี้เบอร์เกอร์', role: 'Tank', asset: 'EV_BURGER', hp: 540, armorHp: 300, armorReduction: 0.2, atk: 30, speed: 0.15, scale: 1.35, reward: { gold: 6 }, event: 'donut', desc: 'ชั้นขนมปังเป็นเกราะ' }),
  EV_FRIES: Z({ id: 'EV_FRIES', name: 'Fries Zombie', nameTH: 'ซอมบี้เฟรนช์ฟรายส์', role: 'Ranged', asset: 'EV_FRIES', hp: 200, atk: 14, speed: 0.22, range: 3.3, attackSpeed: 1.6, projectile: { asset: 'PROJ_CAN', tint: 'cream', speed: 5, damageType: 'normal' }, reward: { gold: 4 }, event: 'donut', desc: 'ยิงเฟรนช์ฟรายส์' }),
  EV_GENTLEMAN: Z({ id: 'EV_GENTLEMAN', name: 'Gentleman Zombie', nameTH: 'ซอมบี้สุภาพบุรุษ', role: 'Melee', asset: 'EV_GENTLEMAN', hp: 340, armorHp: 260, armorReduction: 0.2, atk: 26, speed: 0.22, reward: { gold: 5 }, event: 'anniversary', desc: 'หมวกทรงสูงเป็นเกราะ' }),
  EV_MAGICIAN: Z({ id: 'EV_MAGICIAN', name: 'Magician Zombie', nameTH: 'ซอมบี้นักมายากล', role: 'Support', asset: 'EV_MAGICIAN', hp: 300, atk: 18, speed: 0.2, summon: { enemy: 'EV_BUNNY', interval: 8, count: 1 }, blink: true, reward: { gold: 6 }, event: 'anniversary', desc: 'เสกกระต่ายออกจากหมวก' }),
  EV_TRIPLE: Z({ id: 'EV_TRIPLE', name: 'Triple-Head Zombie', nameTH: 'ซอมบี้สามหัว', role: 'Tank', asset: 'EV_TRIPLE', hp: 700, atk: 40, speed: 0.15, scale: 1.4, split: { enemy: 'ZOM_NORMAL', count: 3 }, reward: { gold: 8 }, event: 'anniversary', desc: 'ตายแล้วแยก 3 ตัว' }),
  EV_VOODOO: Z({ id: 'EV_VOODOO', name: 'Voodoo Zombie', nameTH: 'ตุ๊กตาวูดู', role: 'Special', asset: 'EV_VOODOO', hp: 320, atk: 20, speed: 0.22, slowAura: { strength: 0.35, cells: 3 }, reward: { gold: 6 }, event: 'anniversary', desc: 'คำสาปทำให้ตัวละครช้า' }),
  EV_BUNNY: Z({ id: 'EV_BUNNY', name: 'Bunny Zombie', nameTH: 'ซอมบี้กระต่าย', role: 'Fast', asset: 'EV_BUNNY', hp: 130, atk: 12, speed: 0.42, jump: true, scale: 1.1, reward: { gold: 2 }, desc: 'กระโดดข้าม' }),
  EV_CHICK: Z({ id: 'EV_CHICK', name: 'Chick Zombie', nameTH: 'ซอมบี้ลูกเจี๊ยบ', role: 'Fast', asset: 'EV_CHICK', hp: 100, atk: 10, speed: 0.5, scale: 1.0, reward: { gold: 1 }, desc: 'ตัวจิ๋ววิ่งไว' }),
  EV_PUPPY: Z({ id: 'EV_PUPPY', name: 'Puppy Zombie', nameTH: 'ซอมบี้ลูกหมา', role: 'Fast', asset: 'EV_PUPPY', hp: 160, atk: 16, speed: 0.44, jump: true, scale: 1.1, reward: { gold: 2 }, desc: 'กระโดดข้าม' }),
  EV_CAT: Z({ id: 'EV_CAT', name: 'Cat Zombie', nameTH: 'ซอมบี้แมว', role: 'Fast', asset: 'EV_CAT', hp: 170, atk: 18, speed: 0.4, scale: 1.1, reward: { gold: 2 }, desc: 'ข่วนไว' }),
  EV_WOLF: Z({ id: 'EV_WOLF', name: 'Wolf Zombie', nameTH: 'ซอมบี้หมาป่า', role: 'Melee', asset: 'EV_WOLF', hp: 420, atk: 38, speed: 0.3, scale: 1.25, reward: { gold: 5 }, desc: 'ดุร้าย เร็ว แรง' })
};

// Projectile visuals for the bear side
RK.Data.projectiles = { DONUT_NORMAL: { asset: 'DONUT_NORMAL', size: 46 } };

// Mini-boss wrapper (Stage 10): any enemy can be promoted
RK.Data.miniBoss = function (id) {
  const e = RK.Data.enemies[id]; if (!e) return null;
  if (e.miniBoss || e.isBoss) return e;
  const key = id + '__MINI';
  if (!RK.Data.enemies[key]) RK.Data.enemies[key] = Object.assign({}, e, { id: key, name: e.name + ' (Mini Boss)', nameTH: e.nameTH + ' (มินิบอส)', hp: e.hp * 6, atk: e.atk * 1.6, def: (e.def || 0) + 4,
    scale: (e.scale || 1.25) * 1.45, miniBoss: true, reward: { gold: 30 }, baseId: id });
  return RK.Data.enemies[key];
};
