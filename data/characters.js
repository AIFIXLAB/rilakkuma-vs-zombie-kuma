// ===== Character Database (doc PART 6/7/8, 21.1) =====
// Units are in CELLS (range) and SECONDS (attackSpeed = seconds between attacks, cooldown).
// attack.pattern: single | burst | piercing | splash | melee | rapid | spray | knockback | none
RK.Data.characters = {
  // ---------- Producer ----------
  FACTORY: {
    id: 'FACTORY', name: 'Donut Factory', nameTH: 'เครื่องผลิตโดนัท', role: 'Producer', rarity: 'Common',
    asset: 'FACTORY_LV1', description: 'ผลิตโดนัทตามเวลา ต้องแตะเก็บเอง แตะเครื่องเพื่ออัปเกรด',
    hp: 400, atk: 0, def: 0, attackSpeed: 0, range: 0, cost: 50, cooldown: 6,
    isFactory: true, attack: { pattern: 'none' }, skills: ['Produce Donut'], passive: '', upgradeBranch: ['Lv.1-5 in battle']
  },

  // ---------- Defenders (doc PART 7) ----------
  DEF_POT_SHIELD: {
    id: 'DEF_POT_SHIELD', name: 'Pot Shield Kuma', nameTH: 'คุมะโล่หม้อ', role: 'Defender', rarity: 'Common',
    asset: 'DEF_POT_SHIELD', description: 'แทงก์ HP สูง DEF สูง ลดดาเมจที่ได้รับ',
    hp: 1300, atk: 0, def: 8, damageReduction: 0.20, attackSpeed: 0, range: 0, cost: 50, cooldown: 18,
    attack: { pattern: 'none' }, skills: [], passive: 'ลด Damage 20%', upgradeBranch: ['Iron Pot', 'Golden Pot', 'Reflect Pot']
  },
  DEF_SPRAY: {
    id: 'DEF_SPRAY', name: 'Spray Kuma', nameTH: 'คุมะสเปรย์', role: 'Defender', rarity: 'Common',
    asset: 'DEF_SPRAY', description: 'ฉีดสเปรย์ลดความเร็ว มีโอกาสทำให้ศัตรูหยุดชั่วคราว',
    hp: 520, atk: 8, def: 2, attackSpeed: 2.4, range: 2.2, cost: 75, cooldown: 10,
    attack: { pattern: 'spray', damageType: 'ice', status: { type: 'slow', strength: 0.45, duration: 3 }, stunChance: 0.15, stunDuration: 1.0 },
    skills: ['Slow Spray'], passive: '15% Stun', upgradeBranch: ['Freeze Spray', 'Sticky Spray', 'Mega Spray']
  },
  DEF_CARDBOARD: {
    id: 'DEF_CARDBOARD', name: 'Cardboard Kiiroitori', nameTH: 'คิอิโรอิโทริกล่องกระดาษ', role: 'Defender', rarity: 'Common',
    asset: 'DEF_CARDBOARD', description: 'มีเกราะกล่อง (Armor HP) ต้องทำลายกล่องก่อน',
    hp: 800, armorHp: 700, atk: 0, def: 4, damageReduction: 0.10, attackSpeed: 0, range: 0, cost: 100, cooldown: 22,
    attack: { pattern: 'none' }, skills: [], passive: 'Box Armor', upgradeBranch: ['Iron Box', 'Reinforced Box', 'Fortress Box']
  },
  DEF_FAN: {
    id: 'DEF_FAN', name: 'Fan Korilakkuma', nameTH: 'พัดลมโคริ', role: 'Defender', rarity: 'Rare',
    asset: 'DEF_FAN', description: 'เป่าลมผลักซอมบี้ตัวหน้าสุดถอยหลัง มีคูลดาวน์',
    hp: 650, atk: 10, def: 3, attackSpeed: 6, range: 2.5, cost: 100, cooldown: 16,
    attack: { pattern: 'knockback', distance: 0.9, damageType: 'normal' }, skills: ['Gust'], passive: '', upgradeBranch: ['Strong Fan', 'Turbo Fan', 'Tornado Fan']
  },
  DEF_MOP_CAT: {
    id: 'DEF_MOP_CAT', name: 'Mop Cat', nameTH: 'แมวไม้ถูพื้น', role: 'Defender', rarity: 'Common',
    asset: 'DEF_MOP_CAT', description: 'ทำพื้นลื่นหน้าตัวเอง ซอมบี้ที่เดินผ่านช้าลง และตีด้วยไม้ถู',
    hp: 480, atk: 16, def: 2, attackSpeed: 1.6, range: 1.15, cost: 75, cooldown: 12,
    attack: { pattern: 'melee', damageType: 'normal' },
    aura: { type: 'wetFloor', cellsAhead: 2, slow: 0.4 }, skills: ['Wet Floor'], passive: 'พื้นลื่น 2 ช่อง', upgradeBranch: ['Wet Floor', 'Soap Floor', 'Mega Cleaning']
  },
  DEF_LAUNDRY_PANDA: {
    id: 'DEF_LAUNDRY_PANDA', name: 'Laundry Panda', nameTH: 'แพนด้าตะกร้าผ้า', role: 'Defender', rarity: 'Rare',
    asset: 'DEF_LAUNDRY_PANDA', description: 'โล่หนัก รับดาเมจจากของขว้างลดลงครึ่งหนึ่ง',
    hp: 1700, atk: 0, def: 6, damageReduction: 0.10, projectileReduction: 0.5, attackSpeed: 0, range: 0, cost: 125, cooldown: 24,
    attack: { pattern: 'none' }, skills: [], passive: 'ลดดาเมจของขว้าง 50%', upgradeBranch: ['Strong Basket', 'Iron Basket', 'Mega Laundry']
  },

  // ---------- Attackers (Donut Shooter set, doc PART 8) ----------
  ATK_DONUT_KUMA: {
    id: 'ATK_DONUT_KUMA', name: 'Donut Kuma', nameTH: 'คุมะยิงโดนัท', role: 'Attacker', rarity: 'Common',
    asset: 'ATK_DONUT_KUMA', description: 'ยิงโดนัททีละลูกตลอดแถว ตัวโจมตีพื้นฐาน',
    hp: 300, atk: 20, def: 0, attackSpeed: 1.4, range: 9, cost: 100, cooldown: 7,
    attack: { pattern: 'single', projectile: 'DONUT_NORMAL', projectileSpeed: 7, damageType: 'normal' },
    skills: [], passive: '', upgradeBranch: ['Double Donut', 'Big Donut', 'Golden Donut']
  },
  ATK_DONUT_KORI: {
    id: 'ATK_DONUT_KORI', name: 'Donut Korilakkuma', nameTH: 'โคริขว้างโดนัทคู่', role: 'Attacker', rarity: 'Common',
    asset: 'ATK_DONUT_KORI', description: 'ยิงโดนัทเป็นชุด 2 ลูก (Burst)',
    hp: 280, atk: 14, def: 0, attackSpeed: 1.7, range: 9, cost: 125, cooldown: 8,
    attack: { pattern: 'burst', shots: 2, burstGap: 0.18, projectile: 'DONUT_NORMAL', projectileSpeed: 7.5, damageType: 'normal' },
    skills: [], passive: '', upgradeBranch: ['Triple Burst', 'Sprinkle Burst', 'Party Burst']
  },
  ATK_LADLE_TORI: {
    id: 'ATK_LADLE_TORI', name: 'Ladle Kiiroitori', nameTH: 'คิอิโรอิโทริทัพพี', role: 'Attacker', rarity: 'Common',
    asset: 'ATK_LADLE_TORI', description: 'ราคาถูก ตีระยะประชิดเร็ว ไว้ปิดแถวฉุกเฉิน',
    hp: 260, atk: 30, def: 1, attackSpeed: 0.9, range: 1.15, cost: 75, cooldown: 6,
    attack: { pattern: 'melee', damageType: 'normal' }, skills: [], passive: '', upgradeBranch: ['Steel Ladle', 'Hot Ladle', 'Mega Ladle']
  },
  ATK_ROLLINGPIN_CHEF: {
    id: 'ATK_ROLLINGPIN_CHEF', name: 'Rolling Pin Chef', nameTH: 'เชฟไม้นวดแป้ง', role: 'Attacker', rarity: 'Rare',
    asset: 'ATK_ROLLINGPIN_CHEF', description: 'ฟาดไม้นวดแป้งโดนทุกตัวในช่องหน้า ดาเมจหนัก',
    hp: 520, atk: 70, def: 3, attackSpeed: 1.9, range: 1.3, cost: 150, cooldown: 14,
    attack: { pattern: 'melee', hitAll: true, damageType: 'heavy' }, skills: [], passive: 'โจมตีทุกตัวในระยะ', upgradeBranch: ['Iron Pin', 'Spin Pin', 'Giant Pin']
  },
  ATK_DONUT_CANNON: {
    id: 'ATK_DONUT_CANNON', name: 'Donut Cannon Kuma', nameTH: 'คุมะปืนใหญ่โดนัท', role: 'Attacker', rarity: 'Rare',
    asset: 'ATK_DONUT_CANNON', description: 'ยิงโดนัทระเบิด (Splash) แรงแต่ช้า',
    hp: 340, atk: 48, def: 0, attackSpeed: 3.0, range: 9, cost: 200, cooldown: 18,
    attack: { pattern: 'splash', splashRadius: 0.9, projectile: 'DONUT_NORMAL', projectileSpeed: 5.5, projectileScale: 1.5, damageType: 'heavy' },
    skills: [], passive: '', upgradeBranch: ['Mega Cannon', 'Cluster Cannon', 'Rainbow Cannon']
  },
  ATK_GOGGLE_CAT: {
    id: 'ATK_GOGGLE_CAT', name: 'Goggle Cat Blaster', nameTH: 'แมวแว่นยิงรัว', role: 'Attacker', rarity: 'Rare',
    asset: 'ATK_GOGGLE_CAT', description: 'ยิงรัวเร็วมาก ดาเมจต่อนัดต่ำ ระยะ 6 ช่อง',
    hp: 260, atk: 9, def: 0, attackSpeed: 0.45, range: 6, cost: 175, cooldown: 14,
    attack: { pattern: 'single', projectile: 'DONUT_NORMAL', projectileSpeed: 9, projectileScale: 0.6, damageType: 'normal' },
    skills: [], passive: '', upgradeBranch: ['Turbo Blaster', 'Sprinkle Gun', 'Donut Gatling']
  },
  ATK_UMBRELLA_PANDA: {
    id: 'ATK_UMBRELLA_PANDA', name: 'Umbrella Panda', nameTH: 'แพนด้าร่มโดนัท', role: 'Attacker', rarity: 'Rare',
    asset: 'ATK_UMBRELLA_PANDA', description: 'โดนัททะลุ (Piercing) โดนทุกตัวในแถว',
    hp: 400, atk: 18, def: 2, attackSpeed: 2.0, range: 9, cost: 150, cooldown: 12,
    attack: { pattern: 'piercing', projectile: 'DONUT_NORMAL', projectileSpeed: 6, damageType: 'normal' },
    skills: [], passive: 'ยิงทะลุ', upgradeBranch: ['Wide Umbrella', 'Spin Umbrella', 'Storm Umbrella']
  },
  ATK_CHOCO_KUMA: {
    id: 'ATK_CHOCO_KUMA', name: 'Choco Kuma', nameTH: 'คุมะช็อกโก', role: 'Attacker', rarity: 'Epic',
    asset: 'ATK_CHOCO_KUMA', description: 'โดนัทช็อกโกเวทมนตร์ ไม่สน DEF และทำให้ช้าลง',
    hp: 300, atk: 15, def: 0, attackSpeed: 1.5, range: 9, cost: 175, cooldown: 14,
    attack: { pattern: 'single', projectile: 'DONUT_NORMAL', projectileSpeed: 7, projectileTint: 'choco', damageType: 'magic', ignoreDef: true,
              status: { type: 'slow', strength: 0.3, duration: 2 } },
    skills: [], passive: 'Magic: ignore DEF', upgradeBranch: ['Dark Choco', 'Choco Rain', 'Choco Fountain']
  }
};
