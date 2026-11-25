// ===== Story chapters & dialogue (doc PART 19) =====
// Each chapter: shown before the town's first stage (intro) and after its boss (outro).
// line: [speaker key, text]. Speakers map to a portrait asset. bg = background asset (town board or comic).
RK.Data.speakers = {
  kuma: { name: 'คุมะ', asset: 'ATK_DONUT_KUMA' }, kori: { name: 'โคริ', asset: 'ATK_DONUT_KORI' }, tori: { name: 'คิอิโรอิโทริ', asset: 'ATK_LADLE_TORI' },
  chef: { name: 'เชฟหมี', asset: 'ATK_ROLLINGPIN_CHEF' }, panda: { name: 'แพนด้า', asset: 'DEF_LAUNDRY_PANDA' }, cat: { name: 'แมวไม้ถู', asset: 'DEF_MOP_CAT' },
  zombie: { name: 'ซอมบี้คุมะ', asset: 'ZOM_NORMAL' }, boss1: { name: 'ซอมบี้คุมะยักษ์ใหญ่', asset: 'BOSS_GIANT_ZOMBIE_KUMA' }, demon: { name: 'ปีศาจซากุระ', asset: 'ZOM_SAKURA_DEMON' },
  sea: { name: 'ปีศาจทะเล', asset: 'BOSS_TENTACLE' }, shroom: { name: 'ราชาเห็ด', asset: 'ZOM_MUSHROOM' }, ice: { name: 'ยักษ์น้ำแข็ง', asset: 'ZOM_ICE_GIANT' },
  pharaoh: { name: 'ฟาโรห์ยักษ์', asset: 'ZOM_PHARAOH_KING' }, inferno: { name: 'ยักษ์อินเฟอร์โน', asset: 'BOSS_SPIKE_ARMOR' }, king: { name: 'ราชาซอมบี้', asset: 'BOSS_FINAL_KING' },
  deer: { name: 'กวางไดร์', asset: 'ATK_ANIMAL_06' }, duck: { name: 'เป็ดฟอกกี้', asset: 'ATK_KITCHEN_05' }
};
RK.Data.story = [
  { chapter: 1, title: 'Donut Town', titleTH: 'บทที่ 1: เมืองโดนัท', bg: 'CUT_DONUT',
    intro: [['kuma', 'วันนี้อากาศดีจัง... เดี๋ยวไปซื้อโดนัทที่ร้านหน้าบ้านดีกว่า'], ['kori', 'คุมะ! ดูประตูหินตรงนั้นสิ มีแสงม่วงพุ่งออกมา!'], ['zombie', 'อ๊าววว... โดนัท... ขอโดนัทหน่อย...'],
      ['tori', 'ซอมบี้! พวกมันจะบุกร้านโดนัทของเรา!'], ['kuma', 'งั้นเอาเครื่องอบโดนัทมาตั้งแนวป้องกันกันเถอะ ทุกคนหยิบของในบ้านมาเป็นอาวุธ!']],
    outro: [['boss1', 'โฮกกก... โดนัทพวกนี้... อร่อยเกินไป...'], ['kori', 'ชนะแล้ว! แต่ประตูหินยังเปิดอยู่นะ'], ['kuma', 'แสงม่วงพุ่งไปทางเมืองซากุระ... ต้องตามไปดู!']] },
  { chapter: 2, title: 'Sakura Mystery', titleTH: 'บทที่ 2: ปริศนาซากุระ', bg: 'MAP_TOWN2',
    intro: [['tori', 'ดอกซากุระสวยมาก... แต่ทำไมเงียบจัง'], ['demon', 'ผู้บุกรุก... จงกลายเป็นปุ๋ยให้ต้นซากุระของข้า'], ['kori', 'นั่นมันนินจาซอมบี้! มันกระโดดข้ามแนวป้องกันได้ด้วย!'],
      ['kuma', 'ระวังผีลอยฟ้า มันบินข้ามหัวเราไป ต้องหมุนตัวยิงข้างหลังนะ!']],
    outro: [['demon', 'กลีบซากุระ... ร่วงหมดแล้ว...'], ['kuma', 'มีกลิ่นทะเลลอยมาตามลม... ซอมบี้หนีไปชายหาด!']] },
  { chapter: 3, title: 'Beach Panic', titleTH: 'บทที่ 3: ชายหาดอลหม่าน', bg: 'MAP_TOWN3',
    intro: [['kori', 'ทะเล! ว่ายน้ำได้ไหม?'], ['cat', 'ไม่ได้! ดูนั่น ซอมบี้โต้คลื่นมาเป็นฝูงเลย'], ['kuma', 'ช่องน้ำวางเครื่องผลิตกับตัวป้องกันไม่ได้นะ วางแผนให้ดี']],
    outro: [['sea', 'บลุบ... บลุบ...'], ['tori', 'หนวดยักษ์กลับลงทะเลไปแล้ว! ต่อไปคือป่ามหัศจรรย์']] },
  { chapter: 4, title: 'Forest Nightmare', titleTH: 'บทที่ 4: ฝันร้ายในป่า', bg: 'MAP_TOWN4',
    intro: [['panda', 'ป่านี้มีเห็ดเต็มไปหมด...'], ['shroom', 'สปอร์ของข้าจะทำให้ทุกคนหลับใหล'], ['kuma', 'อย่ายืนบนพื้นพิษนานนะ ตัวละครจะค่อย ๆ เสีย HP']],
    outro: [['shroom', 'สปอร์... หมดแล้ว...'], ['kori', 'หนาวจัง... ทางข้างหน้ามีหิมะตก']] },
  { chapter: 5, title: 'Frozen Trouble', titleTH: 'บทที่ 5: ปัญหาเยือกแข็ง', bg: 'MAP_TOWN5',
    intro: [['duck', 'ก๊าบ! พื้นน้ำแข็งลื่นมาก ซอมบี้ไถลมาเร็วขึ้น!'], ['ice', 'ข้าจะแช่แข็งร้านโดนัทของพวกเจ้า'], ['kuma', 'ใช้สายยางกับไดร์ช่วยกันละลาย!']],
    outro: [['ice', 'ร้อน... ละลาย...'], ['tori', 'รอยเท้าทรายนำไปทะเลทราย']] },
  { chapter: 6, title: 'Desert Secret', titleTH: 'บทที่ 6: ความลับทะเลทราย', bg: 'MAP_TOWN6',
    intro: [['kori', 'ร้อนสุด ๆ เลย'], ['pharaoh', 'ใครปลุกข้าจากพีระมิด...'], ['kuma', 'ซอมบี้ทรายมุดดินมาโผล่ใกล้ฐาน ระวังแถวหลังด้วย!']],
    outro: [['pharaoh', 'สมบัติของข้า...'], ['kuma', 'แผนที่ในพีระมิดชี้ไปภูเขาไฟ ต้นตอของประตูหินอยู่ที่นั่น']] },
  { chapter: 7, title: 'Volcano Chaos', titleTH: 'บทที่ 7: ภูเขาไฟวุ่นวาย', bg: 'MAP_TOWN7',
    intro: [['chef', 'ลาวาร้อนพอจะอบโดนัทได้เลย'], ['inferno', 'ไม่มีใครผ่านภูเขาไฟของข้าได้!'], ['kuma', 'อย่าวางตัวละครบนลาวา และระวังซอมบี้ระเบิด!']],
    outro: [['inferno', 'ไฟ... ดับแล้ว...'], ['deer', 'ปราสาทบนฟ้า! ราชาซอมบี้อยู่ที่นั่น']] },
  { chapter: 8, title: 'Sky Final Battle', titleTH: 'บทที่ 8: ศึกสุดท้ายบนฟ้า', bg: 'CUT_BLOODMOON',
    intro: [['king', 'ในที่สุดก็มาถึง... ข้าเปิดประตูทุกบานเพื่อหาโดนัทที่อร่อยที่สุดในโลก!'], ['kuma', 'แค่อยากกินโดนัทก็บอกดี ๆ สิ!'], ['king', 'ไม่มีวัน! สู้กันให้รู้เรื่อง!']],
    outro: [['king', 'อร่อย... นี่คือโดนัทที่ข้าตามหา...'], ['kuma', 'มากินด้วยกันที่ร้านทุกวันก็ได้นะ ไม่ต้องบุกแล้ว'], ['kori', 'สันติภาพกลับมาแล้ว! ปาร์ตี้โดนัท!']] }
];
