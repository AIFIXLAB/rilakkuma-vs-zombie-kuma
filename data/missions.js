// ===== Missions, Achievements, Daily Login, Pass (doc 15.11–15.13) =====
// Progress is driven by real game events (RK.Ev.emit) — see js/systems/progress.js
// stat: which counter the mission listens to. reward: { gold, gems, tickets, zticket, passPts, cookie, ... }
RK.Data.missions = {
  daily: [
    { id: 'd_donut', text: 'เก็บโดนัท 100 ชิ้น', stat: 'donut', goal: 100, reward: { gold: 300, passPts: 20 } },
    { id: 'd_kill', text: 'กำจัดซอมบี้ 50 ตัว', stat: 'kill', goal: 50, reward: { gold: 300, passPts: 20 } },
    { id: 'd_play', text: 'เล่น 3 ด่าน', stat: 'play', goal: 3, reward: { gems: 20, passPts: 20 } },
    { id: 'd_def', text: 'วางตัวป้องกัน 10 ครั้ง', stat: 'placeDefender', goal: 10, reward: { cookie: 5, passPts: 15 } },
    { id: 'd_upgrade', text: 'อัปเกรดตัวละคร 1 ครั้ง', stat: 'upgrade', goal: 1, reward: { gold: 200, passPts: 15 } },
    { id: 'd_trap', text: 'ใช้กับดัก 3 ครั้ง', stat: 'trapUse', goal: 3, reward: { gold: 250, passPts: 15 } },
    { id: 'd_all', text: 'ทำภารกิจรายวันครบ 5 ข้อ', stat: 'dailyDone', goal: 5, reward: { gems: 50, tickets: 1, passPts: 40 } }
  ],
  weekly: [
    { id: 'w_clear', text: 'ผ่าน 20 ด่าน', stat: 'clear', goal: 20, reward: { gems: 100, passPts: 60 } },
    { id: 'w_boss', text: 'กำจัดบอส 3 ตัว', stat: 'killBoss', goal: 3, reward: { gems: 80, tickets: 1, passPts: 60 } },
    { id: 'w_kill', text: 'กำจัดซอมบี้ 500 ตัว', stat: 'kill', goal: 500, reward: { gold: 3000, passPts: 50 } },
    { id: 'w_upgrade', text: 'อัปเกรดตัวละคร 5 ครั้ง', stat: 'upgrade', goal: 5, reward: { honey: 5, recipe: 2, passPts: 40 } },
    { id: 'w_gacha', text: 'สุ่มกาชา 10 ครั้ง', stat: 'gacha', goal: 10, reward: { tickets: 2, passPts: 40 } },
    { id: 'w_vs', text: 'เล่น VS หรือ CO-OP 3 ครั้ง', stat: 'mpPlay', goal: 3, reward: { zticket: 2, passPts: 40 } }
  ],
  story: [1, 2, 3, 4, 5, 6, 7, 8].map(t => ({ id: 's_town' + t, text: `ผ่าน Town ${t} ครบ 15 ด่าน`, stat: 'townClear' + t, goal: 15, reward: { gems: 150, tickets: 2, crystal: 3 } }))
    .concat([{ id: 's_20', text: 'ผ่าน 20 ด่าน', stat: 'stagesCompleted', goal: 20, reward: { gems: 100 } }, { id: 's_60', text: 'ผ่าน 60 ด่าน', stat: 'stagesCompleted', goal: 60, reward: { gems: 200, rainbow: 1 } },
      { id: 's_120', text: 'ผ่านครบ 120 ด่าน', stat: 'stagesCompleted', goal: 120, reward: { gems: 500, EQ_CROWN: 1 } }]),
  challenge: [
    { id: 'c_3star', text: 'ได้ 3 ดาวใน 10 ด่าน', stat: 'threeStar', goal: 10, reward: { gems: 100 } },
    { id: 'c_endless10', text: 'โหมดไม่รู้จบ ถึง Wave 10', stat: 'endlessBest', goal: 10, reward: { gems: 80, tickets: 1 } },
    { id: 'c_endless25', text: 'โหมดไม่รู้จบ ถึง Wave 25', stat: 'endlessBest', goal: 25, reward: { gems: 200, rainbow: 1 } },
    { id: 'c_ch5', text: 'ผ่านด่านท้าทาย 5 ด่าน', stat: 'challengeClear', goal: 5, reward: { gems: 150 } },
    { id: 'c_vs', text: 'ชนะ VS Mode 3 ครั้ง', stat: 'vsWin', goal: 3, reward: { zticket: 3 } },
    { id: 'c_coop', text: 'ชนะ CO-OP 3 ด่าน', stat: 'coopWin', goal: 3, reward: { gems: 120 } },
    { id: 'c_rotate', text: 'หมุนตัวละครยิงซอมบี้ที่บินผ่าน 20 ครั้ง', stat: 'rotate', goal: 20, reward: { gold: 1500 } },
    { id: 'c_sell', text: 'ขายตัวละครในสนาม 10 ครั้ง', stat: 'sell', goal: 10, reward: { gold: 800 } }
  ]
};
// Event missions (per active event)
RK.Data.eventMissions = [
  { id: 'e_play', text: 'เล่นด่านกิจกรรม 5 ครั้ง', stat: 'eventPlay', goal: 5, reward: { eventDonut: 100 } },
  { id: 'e_kill', text: 'กำจัดซอมบี้ในด่านกิจกรรม 150 ตัว', stat: 'eventKill', goal: 150, reward: { eventDonut: 150 } },
  { id: 'e_clear5', text: 'ผ่านด่านกิจกรรม "ฝันร้าย"', stat: 'eventHard', goal: 1, reward: { eventDonut: 300, gems: 100 } },
  { id: 'e_donut', text: 'เก็บโดนัทกิจกรรมในสนาม 30 ชิ้น', stat: 'eventDonutPick', goal: 30, reward: { eventDonut: 120 } }
];
// Achievements with tiers (doc 15.13)
RK.Data.achievements = [
  { id: 'a_kill', text: 'กำจัดซอมบี้', stat: 'kill', tiers: [100, 1000, 10000, 50000], reward: t => ({ gems: [20, 60, 150, 400][t] }) },
  { id: 'a_donut', text: 'เก็บโดนัท', stat: 'donut', tiers: [100, 1000, 10000, 50000], reward: t => ({ gold: [500, 2000, 8000, 20000][t] }) },
  { id: 'a_towns', text: 'ผ่านทุกเมือง', stat: 'townsCleared', tiers: [1, 4, 8], reward: t => ({ gems: [100, 300, 1000][t] }) },
  { id: 'a_chars', text: 'ปลดล็อกตัวละคร', stat: 'charsOwned', tiers: [10, 20, 30, 37], reward: t => ({ tickets: [2, 4, 6, 10][t] }) },
  { id: 'a_boss', text: 'ชนะบอส', stat: 'killBoss', tiers: [1, 8, 25, 60], reward: t => ({ gems: [50, 150, 300, 600][t] }) },
  { id: 'a_time', text: 'เวลาเล่นรวม (ชั่วโมง)', stat: 'playHours', tiers: [1, 10, 50, 100], reward: t => ({ gems: [30, 100, 300, 800][t] }) },
  { id: 'a_maxup', text: 'อัปเกรดตัวละครถึงระดับสูงสุด (Awakening)', stat: 'awakened', tiers: [1, 5, 15], reward: t => ({ rainbow: [1, 2, 5][t] }) },
  { id: 'a_upgrade', text: 'อัปเกรดตัวละคร (ครั้ง)', stat: 'upgrade', tiers: [10, 100, 500], reward: t => ({ crystal: [3, 10, 30][t] }) },
  { id: 'a_gacha', text: 'สุ่มกาชา (ครั้ง)', stat: 'gacha', tiers: [10, 100, 500], reward: t => ({ tickets: [2, 5, 10][t] }) },
  { id: 'a_trap', text: 'ใช้กับดัก (ครั้ง)', stat: 'trapUse', tiers: [10, 100, 1000], reward: t => ({ gold: [1000, 5000, 20000][t] }) },
  { id: 'a_vs', text: 'ชนะ VS Mode', stat: 'vsWin', tiers: [1, 10, 50], reward: t => ({ zticket: [2, 5, 10][t] }) },
  { id: 'a_stars', text: 'สะสมดาว', stat: 'totalStars', tiers: [30, 150, 360], reward: t => ({ gems: [100, 300, 800][t] }) }
];
// Daily login 7-day cycle (doc 15.11)
RK.Data.dailyLogin = [
  { label: 'Donut', text: 'ทอง 1,000', reward: { gold: 1000 }, icon: 'DONUT_NORMAL' },
  { label: 'Upgrade Material', text: 'คุกกี้ 15 + น้ำผึ้ง 5', reward: { cookie: 15, honey: 5 }, icon: 'UI_ICON_BEAR_COOKIE' },
  { label: 'Random Box', text: 'กล่องสุ่ม', reward: { randomBox: 1 }, icon: 'UI_ICON_MYSTERY_BOX' },
  { label: 'Special Donut', text: 'บูสเตอร์โดนัท ×3', reward: { BST_DONUT50: 3 }, icon: 'DONUT_NORMAL' },
  { label: 'Gacha Ticket', text: 'ตั๋วกาชา ×3', reward: { tickets: 3 }, icon: 'UI_ICON_TICKET' },
  { label: 'Rare Material', text: 'คริสตัล 3 + น้ำตาลรุ้ง 1', reward: { crystal: 3, rainbow: 1 }, icon: 'UI_ICON_CRYSTAL' },
  { label: 'Special Reward', text: 'เพชร 300 + ตั๋วซอมบี้ 2', reward: { gems: 300, zticket: 2 }, icon: 'UI_ICON_GEM' }
];
// Kuma Pass: 30 tiers, 100 points per tier. Free track for everyone, Gold track unlocked with gems (no real money).
RK.Data.pass = {
  pointsPerTier: 100, premiumPrice: 980,
  free: Array.from({ length: 30 }, (_, i) => i % 5 === 4 ? { tickets: 1 } : i % 3 === 0 ? { gold: 500 + i * 50 } : i % 3 === 1 ? { cookie: 8 } : { gems: 20 }),
  premium: Array.from({ length: 30 }, (_, i) => i === 29 ? { CS_GOLD: 1, gems: 500 } : i % 5 === 4 ? { tickets: 2, crystal: 2 } : i % 2 ? { gems: 40 } : { honey: 4, recipe: 1 })
};
// News / announcements
RK.Data.news = [
  { title: 'อัปเดตใหญ่: ครบทุกโหมด!', date: '2026-11-24', body: ['เปิด 8 เมือง 120 ด่าน, บอสประจำเมือง และมินิบอส', 'เพิ่ม VS Mode (2 คน / VS CPU), CO-OP 10 แถว, โหมดไม่รู้จบ, ด่านท้าทาย', 'ร้านค้า, กาชา, ภารกิจ, ความสำเร็จ, บัตรผ่าน, กิจกรรม 6 เทศกาล', 'ตัวละครหมุนซ้าย/ขวา และขายคืนในสนามได้ · ระบบกับดัก 15 ชนิด'] },
  { title: 'วิธีรับมือซอมบี้บินได้', date: '2026-11-24', body: ['ผี / ซอมบี้มีปีก จะบินข้ามหัวตัวละคร', 'แตะตัวละคร → กด "หมุน" ให้หันไปยิงข้างหลัง', 'แพนด้าไม้ตียุง ทำดาเมจ ×2.5 ใส่ศัตรูบินได้'] },
  { title: 'โค้ดของขวัญ', date: '2026-11-24', body: ['กล่องของขวัญ → ใส่โค้ด: KUMA2026 / DONUTLOVE / ZOMBIEKUMA'] }
];
