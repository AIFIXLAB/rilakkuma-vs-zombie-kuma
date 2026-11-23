# Testing Report — Phase 1

ทดสอบอัตโนมัติใน Chrome headless ขนาดจอ iPad Air แนวนอน (1180×820 @2x) ด้วย `tests/acceptance.py` — **56 PASS · 0 FAIL · 3 PARTIAL · 15 N/A (อยู่ใน Phase ถัดไป)**

การแตะทั้งหมดผ่าน `RK.Engine.tap()` ซึ่งเป็นฟังก์ชันเดียวกับนิ้วแตะจอ (ข้อ 2 ใช้ touchscreen จริงของ Playwright เพื่อตรวจการแปลงพิกัดบนจอ letterbox)

**ยังไม่ได้ทดสอบบน iPad จริง** — แนะนำเปิดผ่าน Safari แล้วเพิ่มเข้า Home Screen

| ข้อ | รายการ | ผล | รายละเอียด |
|---|---|---|---|
| 1 | เปิดเกมได้ | PASS | assets failed=0 |
| 2 | เริ่มเกมได้ (แตะจริงผ่าน touchscreen) | PASS |  |
| 3 | เลือกเมืองได้ | PASS |  |
| 4 | เลือกด่านได้ (+เมืองล็อกแสดงเงื่อนไข) | PASS |  |
| 5 | จัดทีมได้ (ถอด/ใส่ตัวละคร) | PASS | 3->2->3 |
| 6 | เริ่มสนามได้ | PASS | T1-S1 |
| 7 | วางเครื่องโดนัทได้ | PASS | donut 200->150 |
| 8 | เครื่องผลิตโดนัทตามเวลา | PASS | before 6s=0, after=1 |
| 9 | โดนัทเด้งออกมา (มีฟิสิกส์ตก/เด้ง) | PASS | donut object has velocity and lands on groundY |
| 10 | กดเก็บโดนัทได้ | PASS | 150->200 |
| 11 | เพิ่มยอดโดนัทถูกต้อง (+50 ตาม config, แตะซ้ำไม่เพิ่ม) | PASS | +50, double-tap +0 |
| 8b | รอบผลิต Lv1 = 20 วินาที | PASS | timer remaining 17.52s after 2.5s |
| 12 | สร้างตัวละครได้ | PASS |  |
| 13 | หัก Cost ถูกต้อง | PASS | 200->100 |
| 14 | วางช่องที่ไม่ว่างไม่ได้ (ไม่หักโดนัท) | PASS | cell (3,2) occupied |
| 14b | โดนัทไม่พอ: เลือกการ์ดไม่ได้ + แจ้งเตือน | PASS |  |
| 4.2 | Grid มีข้อมูลช่องครบ (เรียก (5,9) ได้) | PASS | [5, 9, 1340, 690, False, 'Normal Ground', True] |
| 15 | ตัวละครหันถูกทิศทาง | PASS | ตรวจด้วยตา: ภาพต้นฉบับฝ่ายหมีหันขวา ซอมบี้หันซ้าย ไม่มีการกลับภาพ (ดู screenshot t20) |
| 16 | ซอมบี้เกิดตามเวลา (Wave 1 delay 25s) | PASS | first spawn at t=25.28333333333318 |
| 17 | ซอมบี้เดินถูกเลน | PASS | rows [2]->[2] |
| 18 | ซอมบี้โจมตีตัวป้องกัน | PASS | Pot Shield HP 1300->1289 |
| 22 | HP ลดถูกต้องตามสูตร (22 ATK − 8 DEF) × (1−0.2) = 11 ต่อครั้ง | PASS | lost 11 = 1 bites × 11 |
| 23 | Damage Number แสดง | PASS | 1 numbers on screen |
| 21 | ตัวละครโจมตีตอบโต้ | PASS | probe zombie hp 140/200 |
| 19 | ซอมบี้ระยะไกลขว้างของ (หยุดในระยะ 3.5 ช่อง) | PASS | state=throw, x=7.00, target col 4 |
| 20 | Projectile ชนเป้าหมาย (Collision + Damage) | PASS | target HP 1300->1289 (rock 22−8 DEF, ×0.8 = 11) |
| 10.7 | ซอมบี้ระยะไกลเดินต่อเมื่อไม่มีเป้าหมาย | PASS | x 9.00->8.40 |
| 24 | สถานะผิดปกติทำงาน (Slow 45% + Poison 6/วิ) | PASS | moved 0.242 (expect 0.242), poison −12 |
| 25 | ตัวละครตายเมื่อ HP หมด (นับตายครั้งเดียว, ช่องว่างคืน) | PASS | unitsLost=1 |
| 26 | ซอมบี้ตายเมื่อ HP หมด (ไม่ตายซ้ำ) | PASS | killed +1 |
| 16.2 | Pause หยุด simulation/การเดิน/timer | PASS | t 45.78->45.78 |
| 5.4 | อัปเกรดเครื่องผลิต (ยกเลิกไม่หัก, ยืนยันหัก 75 → Lv2 16 วิ) | PASS | lv=2, donuts 300->225 |
| 27 | Wave ทำงานตามลำดับ | PASS | sequence [-1, 0, 1, 2] |
| 28 | Final Wave แจ้งเตือน | PASS |  |
| 29 | บอสเกิดตามกำหนด | N/A | บอสอยู่ด่าน 10/15 = Phase 3 (ข้อมูลบอส Giant Zombie Kuma พร้อมใน enemies.js แล้ว) |
| 30 | ชนะด่านได้ (บอทเล่นด้วยการแตะ) | PASS | state=won, time=130s, base=1000 |
| 32 | รับรางวัลได้ (ทอง+EXP+ปลดล็อกตัวละคร) | PASS | gold=131, owned=6 |
| 33 | ดาวถูกบันทึก | PASS | [True, True, True] |
| 34 | ปลดล็อกด่านถัดไปได้ | PASS | ['T1-S1', 'T1-S2'] |
| 35 | ปลดล็อกเมืองได้ | N/A | ต้องผ่าน Stage 15 (Phase 3) — โค้ดปลดล็อกเมืองอยู่ใน Battle.win() |
| 15.4 | ปุ่มด่านต่อไปพาไปด่าน 2 | PASS |  |
| 31 | แพ้ด่านได้ (ไม่วางอะไรเลย) | PASS | base=0 |
| 49 | ข้อมูลไม่ถูกเพิ่มซ้ำ (เล่นซ้ำได้ทอง 30% ไม่ปลดล็อกซ้ำ) | PASS | gold +61, owned 6->6 |
| B-T1-S2 | บอทผ่าน T1-S2 | PASS | state=won t=170s base=1000 lost=0 stars=[True, True, True] |
| B-T1-S3 | บอทผ่าน T1-S3 | PASS | state=won t=189s base=1000 lost=0 stars=[True, True, True] |
| B-T1-S4 | บอทผ่าน T1-S4 | PASS | state=won t=204s base=1000 lost=0 stars=[True, True, True] |
| B-T1-S5 | บอทผ่าน T1-S5 | PASS | state=won t=223s base=1000 lost=0 stars=[True, True, True] |
| 46 | Save ได้ | PASS |  |
| 47 | Load ได้ | PASS |  |
| 48 | รีสตาร์ตเกมแล้วยังมีข้อมูล | PASS | identical=True |
| 50 | การอัปเกรดและรางวัลไม่สูญหาย | PASS |  |
| 15.1 | ปุ่ม Continue โหลดความคืบหน้าล่าสุด | PASS |  |
| 25b | ไฟล์ Save เสียหาย → โหลด Backup | PASS | gold=1168 |
| 21.5 | Version/Migration ของ Save | PASS |  |
| 15.16 | Reset Data ต้องยืนยัน 2 ครั้ง (ยกเลิกที่ขั้น 2 ไม่ลบ) | PASS | รีเซ็ตข้อมูล? → ยืนยันครั้งที่ 2 |
| 26 | ประสิทธิภาพ: ซอมบี้ 100 ตัว + กระสุนจำนวนมาก | PASS | sim 0.12ms + render 1.88ms per frame (desktop CPU), zombies=100, projectiles max=25 |
| 36 | Team Setup ทำงาน | PARTIAL | จัดทีม 8 ช่องในหน้าเลือกด่าน; Presets 5 ชุด = Phase 4 |
| 37 | Collection ทำงาน | PARTIAL | หน้ารวมตัวละคร (มีเงาตัวที่ยังไม่ปลดล็อก); หน้า Detail = Phase 2 |
| 38 | Upgrade ทำงาน | N/A | Phase 2 — ปุ่มแสดงสถานะล็อก |
| 39 | Shop ทำงาน | N/A | Phase 4 — ปุ่มแสดงสถานะล็อก |
| 40 | Gacha ทำงาน | N/A | Phase 4 — ปุ่มแสดงสถานะล็อก |
| 41 | Daily Login ทำงาน | N/A | Phase 4 — ปุ่มแสดงสถานะล็อก |
| 42 | Mission ทำงาน | N/A | Phase 4 — ปุ่มแสดงสถานะล็อก |
| 43 | Achievement ทำงาน | N/A | Phase 4 — ปุ่มแสดงสถานะล็อก |
| 44 | Profile ทำงาน | PASS | แสดง ID/Level/EXP/สถิติจริง, เปลี่ยนชื่อได้ |
| 45 | Settings ทำงาน | PARTIAL | HP Bar/Damage Number/Auto Pause/Reset; เสียง: ไม่มีไฟล์เสียงใน Asset |
| 51 | Multiplayer | N/A | Phase 5 |
| 52 | Multiplayer | N/A | Phase 5 |
| 53 | Multiplayer | N/A | Phase 5 |
| 54 | Multiplayer | N/A | Phase 5 |
| 55 | Multiplayer | N/A | Phase 5 |
| 56 | Multiplayer | N/A | Phase 5 |
| 57 | Multiplayer | N/A | Phase 5 |
| ERR | ไม่มี JavaScript error ระหว่างทดสอบ | PASS |  |

## Balance sweep (`tests/balance.py`, บอท 5 seed × 5 ด่าน)

ชนะ 24/25 รอบ; แพ้ 1 รอบที่ด่าน 3 (บอทพลาดเลนว่าง). ปรับค่าจากผลนี้: มูลค่าโดนัท 25 → 50, ด่าน 1 ใช้แค่ 3 เลนกลาง + โดนัทเริ่มต้น 200

## ข้อจำกัดของการทดสอบ

- ประสิทธิภาพวัดบน CPU เดสก์ท็อป (sim 0.13 ms + render ~1.9 ms ต่อเฟรม ที่ซอมบี้ 100 ตัว) — iPad อาจช้ากว่า 2–4 เท่า ยังอยู่ในงบ 16.7 ms
- บอทเล่นเก่งกว่าคนทั่วไปในด้านการเก็บโดนัท ควรให้คนเล่นจริงปรับความยากด่าน 4–5 อีกรอบ
