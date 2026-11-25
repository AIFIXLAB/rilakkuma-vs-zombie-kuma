// ===== Items, currencies, shops & gacha (doc 15.8–15.10, 5.5) =====
RK.Data.currencies = {
  gold: { name: 'ทอง', icon: 'UI_ICON_COIN' },
  gems: { name: 'เพชร', icon: 'UI_ICON_GEM' },
  tickets: { name: 'ตั๋วกาชา', icon: 'UI_ICON_TICKET' },
  zticket: { name: 'ตั๋วซอมบี้', icon: 'UI_ICON_TICKET_BEAR' },
  eventDonut: { name: 'โดนัทกิจกรรม', icon: 'DONUT_NORMAL', tint: 'pink' },
  passPts: { name: 'แต้มบัตรผ่าน', icon: 'UI_ICON_STAR' }
};
// Upgrade materials (doc "Required Materials")
RK.Data.materials = {
  cookie: { name: 'คุกกี้หมี', icon: 'UI_ICON_BEAR_COOKIE', desc: 'ใช้อัปเลเวลตัวละคร', price: 30 },
  honey: { name: 'น้ำผึ้งคุมะ', icon: 'UI_ICON_HONEY', desc: 'ใช้อัปเลเวลขั้นสูง (Lv 15+)', price: 80 },
  recipe: { name: 'ตำราสูตรลับ', icon: 'UI_ICON_RECIPE', desc: 'ใช้อัปสกิล', price: 150 },
  iron: { name: 'เหล็กแท่ง', icon: 'UI_ICON_IRON', desc: 'ใช้อัปอุปกรณ์ / เปิดสายอัปเกรด', price: 120 },
  crystal: { name: 'คริสตัลฟ้า', icon: 'UI_ICON_CRYSTAL', desc: 'ใช้ Star Evolution และ Awakening', price: 300 },
  rainbow: { name: 'น้ำตาลสายรุ้ง', icon: 'UI_ICON_RAINBOW_SUGAR', desc: 'ใช้ Awakening (หายาก)', price: 800 }
};
// Special donuts in battle (doc 5.5). Chances shown in the factory dialog.
RK.Data.donutTypes = {
  normal: { name: 'โดนัทปกติ', value: 50, tint: null, desc: 'ใช้สร้างตัวละครทั่วไป' },
  chocolate: { name: 'โดนัทช็อกโกแลต', value: 75, tint: 'choco', desc: 'มูลค่า 75 — ได้จาก Bunny Baker และเครื่อง Lv3+' },
  golden: { name: 'โดนัททอง', value: 150, tint: 'gold', desc: 'มูลค่าสูง 150 — โอกาสจากเครื่อง Lv4+' },
  rainbow: { name: 'โดนัทสายรุ้ง', value: 25, tint: 'rainbow', desc: 'เติมเกจสกิลทีม 35%' },
  event: { name: 'โดนัทกิจกรรม', value: 25, tint: 'pink', desc: 'เฉพาะด่านกิจกรรม: ใช้แลกของในร้านกิจกรรม' }
};
// Factory special donut chance by level (doc 5.4 "Special Donut Chance", "Donut Value Bonus")
RK.Data.factorySpecial = [null,
  { chocolate: 0, golden: 0, rainbow: 0.03 }, { chocolate: 0.05, golden: 0, rainbow: 0.04 }, { chocolate: 0.12, golden: 0, rainbow: 0.05 },
  { chocolate: 0.15, golden: 0.05, rainbow: 0.06 }, { chocolate: 0.18, golden: 0.10, rainbow: 0.08 }];

// Equipment: one slot per character (doc 15.8 Equipment)
RK.Data.equipment = {
  EQ_SPOON: { name: 'ช้อนทองคำ', icon: 'UI_ICON_GOLD_STAR_COIN', desc: 'ATK +12%', mods: { atk: 1.12 }, rarity: 'Rare', price: 600 },
  EQ_APRON: { name: 'ผ้ากันเปื้อนเหล็ก', icon: 'UI_ICON_IRON', desc: 'HP +18%', mods: { hp: 1.18 }, rarity: 'Rare', price: 600 },
  EQ_SNEAKER: { name: 'รองเท้าวิ่งไว', icon: 'UI_ICON_ROCKET', desc: 'โจมตีเร็วขึ้น 10%', mods: { as: 0.9 }, rarity: 'Rare', price: 700 },
  EQ_CLOVER: { name: 'ใบโคลเวอร์นำโชค', icon: 'UI_ICON_CLOVER', desc: 'คริติคอล +10%', mods: { crit: 0.1 }, rarity: 'Rare', price: 650 },
  EQ_SHIELD: { name: 'โล่ฝาหม้อทอง', icon: 'UI_ICON_SHIELD', desc: 'ลดดาเมจ +8%', mods: { dr: 0.08 }, rarity: 'Epic', price: 1200 },
  EQ_BATTERY: { name: 'แบตเตอรี่พลังโดนัท', icon: 'UI_ICON_BATTERY', desc: 'คูลดาวน์การ์ด −15%', mods: { cd: 0.85 }, rarity: 'Epic', price: 1200 },
  EQ_CROWN: { name: 'มงกุฎราชาหมี', icon: 'UI_ICON_CROWN_GOLD', desc: 'ATK +15% HP +15%', mods: { atk: 1.15, hp: 1.15 }, rarity: 'Legend', price: null },
  EQ_MEDKIT: { name: 'กล่องปฐมพยาบาล', icon: 'UI_ICON_MEDKIT', desc: 'ฟื้น HP 1%/วิ', mods: { regen: 0.01 }, rarity: 'Epic', price: 1000 }
};
// Costumes: colour skins any character can wear (pure recolour of the original art — no new drawing)
RK.Data.costumes = {
  CS_DEFAULT: { name: 'ชุดปกติ', tint: null, price: 0, rarity: 'Common' },
  CS_STRAWBERRY: { name: 'สตรอว์เบอร์รี', tint: '#FF5E8A', amount: 0.5, price: 300, rarity: 'Rare' },
  CS_MINT: { name: 'มิ้นต์ช็อก', tint: '#3DDBA8', amount: 0.5, price: 300, rarity: 'Rare' },
  CS_MIDNIGHT: { name: 'มิดไนท์', tint: '#4A4AD8', amount: 0.55, dark: 0.25, price: 400, rarity: 'Epic' },
  CS_SAKURA: { name: 'ซากุระ', tint: '#FFB3D9', amount: 0.55, price: 400, rarity: 'Epic' },
  CS_OCEAN: { name: 'โอเชียน', tint: '#2FA8F0', amount: 0.5, price: 400, rarity: 'Epic' },
  CS_GOLD: { name: 'โกลเด้น', tint: '#FFC21A', amount: 0.6, price: null, rarity: 'Legend' },
  CS_SHADOW: { name: 'แชโดว์', tint: '#6B5A7A', amount: 0.7, dark: 0.35, price: null, rarity: 'Legend' }
};
// Pre-battle boosters (sold in Donut Shop, picked in stage select)
RK.Data.boosters = {
  BST_DONUT50: { name: 'โดนัทเริ่มต้น +75', icon: 'DONUT_NORMAL', desc: 'เริ่มด่านด้วยโดนัทเพิ่ม 75', price: 250 },
  BST_FACTORY2: { name: 'เครื่องเริ่ม Lv2', icon: 'UI_ICON_UPGRADE', desc: 'เครื่องผลิตที่วางในด่านเริ่มที่ Lv2', price: 400 },
  BST_BASE: { name: 'กำแพงฐาน +400', icon: 'UI_ICON_HEART', desc: 'Base HP +400 ในด่านนั้น', price: 300 },
  BST_SKILL: { name: 'เกจสกิลเต็ม', icon: 'UI_ICON_ROCKET', desc: 'เริ่มด่านพร้อมเกจสกิลทีมเต็ม', price: 350 }
};
// Team skills in battle (doc 16 "Skill Buttons"). Gauge fills from kills, time and rainbow donuts.
RK.Data.teamSkills = {
  STRIKE: { name: 'Kuma Strike', nameTH: 'คุมะถล่ม', icon: 'UI_ICON_BOMB', cost: 1, desc: 'แตะแถว: ระเบิดทั้งแถว 220 ดาเมจ', target: 'row' },
  FREEZE: { name: 'Freeze Time', nameTH: 'หยุดเวลา', icon: 'UI_ICON_ALARM', cost: 1, desc: 'ซอมบี้ทั้งสนามหยุด 4 วินาที', target: 'none' },
  HEAL: { name: 'Picnic Heal', nameTH: 'ปิกนิกฟื้นพลัง', icon: 'UI_ICON_MEDKIT', cost: 1, desc: 'ฟื้น HP ตัวละครทุกตัว 40% + ฐาน 150', target: 'none' }
};

// ---------------- Gacha (doc 15.10) ----------------
RK.Data.gachaRates = { Common: 0.60, Rare: 0.30, Epic: 0.085, Legend: 0.015 };
RK.Data.dupeFragments = { Common: 10, Rare: 20, Epic: 40, Legend: 80 };
RK.Data.gachaBanners = [
  { id: 'CHAR', name: 'Character Banner', nameTH: 'ตู้ตัวละคร', pool: 'characters', cost1: 150, cost10: 1350, currency: 'gems', ticket: 'tickets', pity: 60, art: 'ATK_DONUT_KUMA',
    desc: 'ตัวละครทุกตัว · 10 ครั้งการันตี Rare ขึ้นไป · Pity 60 ครั้งได้ Legend แน่นอน' },
  { id: 'SPECIAL', name: 'Special Banner', nameTH: 'ตู้พิเศษ Rate-Up', pool: 'characters', rateUp: ['ANI_DEER', 'HW_ZAPPER_KUMA', 'HW_WOK_PANDA'], rateUpShare: 0.5, cost1: 200, cost10: 1800, currency: 'gems', ticket: 'tickets', pity: 50, art: 'ATK_ANIMAL_06',
    desc: 'Rate-Up: Dryer Deer, Zapper Kuma, Wok Panda (50% ของระดับนั้น) · Pity 50' },
  { id: 'ZOMBIE', name: 'Zombie Banner', nameTH: 'ตู้ซอมบี้ (VS Mode)', pool: 'zombies', cost1: 100, cost10: 900, currency: 'gems', ticket: 'zticket', pity: 40, art: 'ZOM_NORMAL',
    desc: 'ปลดล็อกซอมบี้ให้ใช้ในฝั่ง Zombie ของ VS Mode · ซ้ำได้ทอง' },
  { id: 'COSTUME', name: 'Costume Banner', nameTH: 'ตู้ชุดแต่งตัว', pool: 'costumes', cost1: 120, cost10: 1080, currency: 'gems', ticket: 'tickets', pity: 30, art: 'ATK_KITCHEN_07',
    desc: 'ชุดสีพิเศษ (Gold, Shadow มีเฉพาะตู้นี้) · ซ้ำได้เพชรคืน 30' },
  { id: 'MATERIAL', name: 'Material Banner', nameTH: 'ตู้วัตถุดิบ', pool: 'materials', cost1: 1000, cost10: 9000, currency: 'gold', pity: 0, art: 'UI_ICON_MYSTERY_BOX',
    desc: 'ใช้ทอง · วัตถุดิบอัปเกรด อุปกรณ์ และเศษตัวละคร' }
];
RK.Data.zombieRarity = id => { const e = RK.Data.enemies[id]; return e.isBoss ? 'Legend' : (e.role === 'Tank' || e.fly || e.summon || e.heal) ? 'Epic' : e.role === 'Ranged' || e.armorHp || e.shieldHp || e.jump ? 'Rare' : 'Common'; };

// ---------------- Shop catalog (doc 15.9) ----------------
// type: booster | character | fragment | material | trap | costume | equipment | currency
RK.Data.shop = {
  donut: { name: 'Donut Shop', nameTH: 'ร้านโดนัท', items: [
    { type: 'booster', id: 'BST_DONUT50', qty: 1, price: 250, cur: 'gold' }, { type: 'booster', id: 'BST_FACTORY2', qty: 1, price: 400, cur: 'gold' },
    { type: 'booster', id: 'BST_BASE', qty: 1, price: 300, cur: 'gold' }, { type: 'booster', id: 'BST_SKILL', qty: 1, price: 350, cur: 'gold' },
    { type: 'booster', id: 'BST_DONUT50', qty: 5, price: 60, cur: 'gems', label: 'แพ็ก 5 ชิ้น' }, { type: 'currency', id: 'gold', qty: 2000, price: 100, cur: 'gems', label: 'ทอง 2,000' }] },
  character: { name: 'Character Shop', nameTH: 'ร้านตัวละคร', dynamic: 'characters' },
  material: { name: 'Material Shop', nameTH: 'ร้านวัตถุดิบ', items: [
    { type: 'material', id: 'cookie', qty: 10, price: 250, cur: 'gold' }, { type: 'material', id: 'honey', qty: 5, price: 350, cur: 'gold' },
    { type: 'material', id: 'recipe', qty: 3, price: 400, cur: 'gold' }, { type: 'material', id: 'iron', qty: 3, price: 330, cur: 'gold' },
    { type: 'material', id: 'crystal', qty: 2, price: 550, cur: 'gold' }, { type: 'material', id: 'rainbow', qty: 1, price: 120, cur: 'gems' },
    { type: 'equipment', id: 'EQ_SPOON', qty: 1, price: 600, cur: 'gold' }, { type: 'equipment', id: 'EQ_APRON', qty: 1, price: 600, cur: 'gold' },
    { type: 'equipment', id: 'EQ_SNEAKER', qty: 1, price: 700, cur: 'gold' }, { type: 'equipment', id: 'EQ_CLOVER', qty: 1, price: 650, cur: 'gold' },
    { type: 'equipment', id: 'EQ_SHIELD', qty: 1, price: 80, cur: 'gems' }, { type: 'equipment', id: 'EQ_BATTERY', qty: 1, price: 80, cur: 'gems' }, { type: 'equipment', id: 'EQ_MEDKIT', qty: 1, price: 70, cur: 'gems' }] },
  trap: { name: 'Trap Shop', nameTH: 'ร้านกับดัก', dynamic: 'traps' },
  costume: { name: 'Costume Shop', nameTH: 'ร้านชุดแต่งตัว', dynamic: 'costumes' },
  special: { name: 'Special Shop', nameTH: 'ร้านพิเศษรายวัน', dynamic: 'daily' }
};
// Redeem codes (Gift box)
RK.Data.redeemCodes = { KUMA2026: { gems: 300, tickets: 3 }, DONUTLOVE: { gold: 3000, cookie: 20 }, ZOMBIEKUMA: { zticket: 5 } };
