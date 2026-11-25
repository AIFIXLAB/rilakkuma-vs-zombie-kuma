// ===== Trap Database (doc PART 12, 21.4) =====
// Traps are bought in the Trap Shop (gold) and stored in the trap bag. In battle open the "กับดัก" tab,
// pick a trap and tap a cell: it uses 1 from the bag + a small donut cost.
// behavior: trigger (fires when a zombie steps on it, then rearms after cooldown, or is used up if uses = 1)
//           continuous (works every `interval` seconds on zombies in triggerRange, can be destroyed — has hp)
//           oneTime (single use, disappears)
// effect fields: damage, status, knock (cells pushed back), area (cells radius), targetType: ground | air | all
RK.Data.traps = {
  TRAP_BANANA_PEEL: { id: 'TRAP_BANANA_PEEL', name: 'Banana Peel', nameTH: 'เปลือกกล้วยลื่น (ฟองสบู่)', asset: 'TRAP_BANANA_PEEL', behavior: 'trigger', uses: 3,
    cost: 25, price: 60, pack: 3, damage: 10, cooldown: 4, duration: 0, triggerRange: 0.4, targetType: 'ground', effect: 'ลื่นล้ม มึน 1.5 วิ', status: { type: 'stun', strength: 1, duration: 1.5 }, maxPlacement: 6, unlock: 1,
    note: 'ไม่มีภาพเปลือกกล้วยในชุด Asset — ใช้ภาพฟองสบู่ลื่นแทน' },
  TRAP_FRYING_PAN: { id: 'TRAP_FRYING_PAN', name: 'Frying Pan Trap', nameTH: 'กับดักกระทะ', asset: 'TRAP_FRYING_PAN', behavior: 'trigger', uses: 4,
    cost: 25, price: 80, pack: 3, damage: 80, cooldown: 3, triggerRange: 0.45, targetType: 'ground', effect: 'ฟาดกระทะ ดาเมจ 80 + มึน 0.8 วิ', status: { type: 'stun', strength: 1, duration: 0.8 }, maxPlacement: 6, unlock: 1 },
  TRAP_WATER_BUCKET: { id: 'TRAP_WATER_BUCKET', name: 'Water Bucket', nameTH: 'ถังน้ำราด', asset: 'TRAP_WATER_BUCKET', behavior: 'trigger', uses: 3,
    cost: 25, price: 70, pack: 3, damage: 15, cooldown: 5, triggerRange: 0.45, area: 0.9, targetType: 'ground', effect: 'ราดน้ำเย็นรอบช่อง สโลว์ 50% 4 วิ', status: { type: 'slow', strength: 0.5, duration: 4 }, maxPlacement: 6, unlock: 2 },
  TRAP_NET: { id: 'TRAP_NET', name: 'Net Trap', nameTH: 'ตาข่ายดักจับ', asset: 'TRAP_NET', behavior: 'trigger', uses: 2,
    cost: 50, price: 120, pack: 2, damage: 0, cooldown: 6, triggerRange: 0.45, targetType: 'all', effect: 'จับตัวหยุด 3 วิ (จับซอมบี้บินได้)', status: { type: 'stun', strength: 1, duration: 3 }, maxPlacement: 4, unlock: 3 },
  TRAP_ELECTRIC_FAN: { id: 'TRAP_ELECTRIC_FAN', name: 'Electric Fan Trap', nameTH: 'พัดลมกับดัก', asset: 'TRAP_ELECTRIC_FAN', behavior: 'continuous', hp: 300,
    cost: 50, price: 150, pack: 2, damage: 5, interval: 4, triggerRange: 2.5, targetType: 'all', knock: 0.7, effect: 'ทุก 4 วิ เป่าผลักทุกตัวในระยะ 2.5 ช่อง', maxPlacement: 3, unlock: 4 },
  TRAP_SPIKE: { id: 'TRAP_SPIKE', name: 'Spike Trap', nameTH: 'แผ่นหนาม', asset: 'TRAP_SPIKE', behavior: 'continuous', hp: 500,
    cost: 25, price: 100, pack: 3, damage: 12, interval: 0.5, triggerRange: 0.5, targetType: 'ground', effect: 'ทิ่ม 12 ดาเมจทุก 0.5 วิ ขณะยืนบนช่อง', maxPlacement: 8, unlock: 2 },
  TRAP_STICKY_GLUE: { id: 'TRAP_STICKY_GLUE', name: 'Sticky Glue', nameTH: 'กาวเหนียวหนึบ', asset: 'TRAP_STICKY_GLUE', behavior: 'continuous', hp: 400,
    cost: 25, price: 90, pack: 3, damage: 0, interval: 0.25, triggerRange: 0.55, targetType: 'ground', effect: 'ช้าลง 65% ขณะอยู่บนกาว', status: { type: 'slow', strength: 0.65, duration: 0.4 }, maxPlacement: 6, unlock: 3 },
  TRAP_ROLLING_PIN: { id: 'TRAP_ROLLING_PIN', name: 'Rolling Pin', nameTH: 'ลูกกลิ้งบดแป้ง', asset: 'TRAP_ROLLING_PIN_CANDIDATE', behavior: 'oneTime',
    cost: 75, price: 200, pack: 1, damage: 250, triggerRange: 0.45, targetType: 'ground', lane: true, effect: 'กลิ้งทับทั้งแถว ดาเมจ 250 ทุกตัวในแถว', maxPlacement: 2, unlock: 5,
    note: 'ภาพลูกกลิ้งที่ใกล้เคียงที่สุดในชุด (ลูกกลิ้งขนนุ่ม)' },
  TRAP_BUG_SWATTER: { id: 'TRAP_BUG_SWATTER', name: 'Electric Bug Swatter', nameTH: 'ไม้ช็อตยุงไฟฟ้า', asset: 'TRAP_BUG_SWATTER', behavior: 'continuous', hp: 350,
    cost: 50, price: 160, pack: 2, damage: 45, interval: 1.5, triggerRange: 1.0, targetType: 'all', effect: 'ช็อต 45 ทุก 1.5 วิ (โดนซอมบี้บินได้ ×2)', antiAir: 2, maxPlacement: 4, unlock: 4 },
  TRAP_SPRING: { id: 'TRAP_SPRING', name: 'Spring Trap', nameTH: 'สปริงดีดกลับ', asset: 'TRAP_SPRING', behavior: 'trigger', uses: 3,
    cost: 50, price: 140, pack: 2, damage: 20, cooldown: 5, triggerRange: 0.45, targetType: 'ground', knock: 2.5, effect: 'ดีดซอมบี้กลับไป 2.5 ช่อง', maxPlacement: 4, unlock: 5 },
  // ---- bonus traps found in the trap sheet ----
  TRAP_ICE_CRYSTAL: { id: 'TRAP_ICE_CRYSTAL', name: 'Ice Crystal', nameTH: 'ผลึกน้ำแข็ง', asset: 'TRAP_ICE_CRYSTAL', behavior: 'trigger', uses: 2,
    cost: 50, price: 160, pack: 2, damage: 30, cooldown: 6, triggerRange: 0.45, area: 1.0, targetType: 'ground', effect: 'แช่แข็งรอบช่อง 2.5 วิ', status: { type: 'freeze', strength: 1, duration: 2.5 }, maxPlacement: 4, unlock: 6 },
  TRAP_TORNADO: { id: 'TRAP_TORNADO', name: 'Tornado Fan', nameTH: 'พายุทอร์นาโด', asset: 'TRAP_TORNADO', behavior: 'oneTime',
    cost: 75, price: 220, pack: 1, damage: 60, triggerRange: 0.5, area: 1.5, targetType: 'all', knock: 3, effect: 'หมุนพัดทุกตัวรอบ ๆ ถอยไป 3 ช่อง', maxPlacement: 2, unlock: 6 },
  TRAP_BEAR_BITE: { id: 'TRAP_BEAR_BITE', name: 'Bear Trap', nameTH: 'กับดักงับหมี', asset: 'TRAP_BEAR_BITE', behavior: 'oneTime',
    cost: 75, price: 240, pack: 1, damage: 600, triggerRange: 0.45, targetType: 'ground', effect: 'งับตัวแรก ดาเมจ 600 (ไม่ใช้กับบอส ×0.3)', bossMul: 0.3, maxPlacement: 2, unlock: 7 },
  TRAP_BOXING_GLOVE: { id: 'TRAP_BOXING_GLOVE', name: 'Boxing Glove', nameTH: 'นวมเด้ง', asset: 'TRAP_BOXING_GLOVE', behavior: 'continuous', hp: 300,
    cost: 50, price: 170, pack: 2, damage: 40, interval: 2, triggerRange: 1.2, targetType: 'ground', knock: 1.2, effect: 'ต่อยผลัก 1.2 ช่อง ทุก 2 วิ', maxPlacement: 4, unlock: 7 },
  TRAP_ALARM: { id: 'TRAP_ALARM', name: 'Alarm Bell', nameTH: 'สัญญาณกันขโมย', asset: 'TRAP_ALARM', behavior: 'trigger', uses: 2,
    cost: 50, price: 180, pack: 2, damage: 0, cooldown: 10, triggerRange: 0.5, targetType: 'all', effect: 'ส่งเสียงดัง: ตัวละครทั้งแถวโจมตีเร็วขึ้น 40% 6 วิ', rally: { amount: 0.4, duration: 6 }, maxPlacement: 3, unlock: 8 }
};
