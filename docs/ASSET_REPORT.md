# Asset Report — Full Version 1.0

## ⚠️ ภาพที่ Claude เลือกจับคู่เอง — กรุณาตรวจ

ทุกภาพมาจากชุด `kumazombie.zip` ของผู้ใช้ ไม่มีภาพที่วาดขึ้นใหม่ · แต่เอกสารไม่ได้บอกว่าภาพไหนเป็นตัวไหน รายการด้านล่างจึงเป็นการเดาจากหน้าตา:

**ซอมบี้เมือง 2–8 และซอมบี้กิจกรรม (49 ตัว)** ย้ายจาก `Unassigned` (แผ่น 48 แบบ + แผ่น pixel 36 แบบ): `ZOM_NINJA`, `ZOM_SAKURA`, `ZOM_CRAB`, `ZOM_LIFEGUARD`, `ZOM_FOREST`, `ZOM_MUSHROOM`, `ZOM_PLANT`, `ZOM_POISON`, `ZOM_FROZEN_KNIGHT`, `ZOM_ICE_THROWER`, `ZOM_ICE_GIANT`, `ZOM_PHARAOH`, `ZOM_SAND`, `ZOM_SCARAB`, `ZOM_PHARAOH_KING`, `ZOM_FIRE`, `ZOM_MAGMA`, `ZOM_FLYING`, `ZOM_ANGEL`, `ZOM_SAKURA_DEMON`, `EV_JACK`, `EV_CAKE`, `EV_CUPCAKE`, `EV_BRIDE`, `EV_JIANGSHI`, `EV_SODA`, `EV_POPCORN`, `EV_DONUT`, `EV_BURGER`, `EV_FRIES`, `EV_GENTLEMAN`, `EV_MAGICIAN`, `EV_VOODOO`, `EV_TRIPLE`, `ZOM_SURFER`, `ZOM_SNOW`, `ZOM_ICE`, `ZOM_DARK`, `EV_SKELETON`, `EV_REAPER`, `EV_VAMPIRE`, `EV_YUREI`, `EV_REINDEER`, `EV_CHICK`, `EV_BUNNY`, `EV_PUPPY`, `EV_BOAR`, `EV_WOLF`, `EV_CAT`

**บอส/มินิบอสประจำเมือง:**
| เมือง | บอส (ด่าน 15) | มินิบอส (ด่าน 10) |
|---|---|---|
| 1 ริลัคคุมะ | BOSS_GIANT_ZOMBIE_KUMA | BOSS_TANK (รถถัง) |
| 2 ซากุระ | ZOM_SAKURA_DEMON | ZOM_SAMURAI |
| 3 ชายทะเล | BOSS_TENTACLE | ZOM_PIRATE |
| 4 ป่า | ZOM_MUSHROOM_KING | BOSS_TOXIC_SLIME |
| 5 หิมะ | ZOM_ICE_GIANT | ZOM_FROZEN_KNIGHT |
| 6 ทะเลทราย | ZOM_PHARAOH_KING | ZOM_MUMMY |
| 7 ภูเขาไฟ | BOSS_SPIKE_ARMOR | ZOM_MAGMA |
| 8 ปราสาทลอยฟ้า | BOSS_FINAL_KING | ZOM_DARK |

**กับดัก 15 แบบ** จับคู่จากแผ่นกับดัก 47 แบบ (เลขช่องในแผ่น → กับดัก): 14→TRAP_BANANA_PEEL, 17→TRAP_ICE_CRYSTAL, 19→TRAP_TORNADO, 7→TRAP_BEAR_BITE, 25→TRAP_BOXING_GLOVE, 20→TRAP_ALARM, 9→TRAP_BUG_SWATTER, 2→TRAP_FRYING_PAN, 3→TRAP_WATER_BUCKET, 4→TRAP_NET, 18→TRAP_ELECTRIC_FAN, 6→TRAP_SPIKE, 8→TRAP_STICKY_GLUE, 26→TRAP_ROLLING_PIN_CANDIDATE, 21→TRAP_SPRING
- **Banana Peel ไม่มีภาพในชุด** → ใช้ภาพ **ฟองสบู่** แทน (ชื่อในเกม "เปลือกกล้วยลื่น (ฟองสบู่)")
- Rolling Pin ใช้ภาพลูกกลิ้งที่ใกล้ที่สุด

**ชุดแต่งตัว** ไม่มีภาพชุดแยก → ใช้การย้อมสีภาพตัวละครเดิมด้วยโค้ด (มิ้นต์, ทอง, ฮาโลวีน ฯลฯ) — ไม่ได้วาดชุดใหม่
**อุปกรณ์/วัตถุดิบ/สกุลเงิน** ใช้ไอคอนจากชุด UI ของผู้ใช้ (บางชิ้นย้อมสีเพื่อแยกประเภท)

## การรวมภาพสำหรับ GitHub
ภาพ sprite 247 ชิ้นรวมเป็น atlas 4 แผ่น (`Assets/atlas/bears1, zombies1, zombies2, ui1` ขนาดไม่เกิน 2048×2048 ปลอดภัยกับหน่วยความจำ iPad) ภาพเต็มจอ 24 ภาพเป็นไฟล์ JPG แยก · สร้างด้วย `tools/pack_atlas.py` จากรายการภาพที่เกมใช้จริง

---

# (ด้านล่าง: รายงานการตัดภาพครั้งแรก — Phase 1)

## Asset Manifest & Report (Phase 1)

สร้างจากไฟล์ภาพต้นฉบับ 37 ไฟล์ (sprite sheet 10 ไฟล์ + ภาพเต็มจอ 27 ไฟล์) → ตัดเป็น **301 รายการ**

| สถานะ | จำนวน |
|---|---:|
| unassigned | 136 |
| assigned | 126 |
| assigned-phase2 | 31 |
| assigned-phase3 | 8 |

| ประเภท | จำนวน |
|---|---:|
| Zombie | 100 |
| UI | 56 |
| Trap | 48 |
| Attacker | 30 |
| Battlefield | 16 |
| Defender | 6 |
| Ranged Zombie | 6 |
| Projectile | 6 |
| Boss | 6 |
| Button | 6 |
| Screen | 6 |
| Factory | 5 |
| Factory Animation | 4 |
| Cutscene | 3 |
| Effect | 1 |
| UI/Info | 1 |
| Donut | 1 |

## Asset ที่ยังขาด (ไม่พบในชุดภาพ)

- **เสียงทั้งหมด** (BGM/SFX) — ระบบเสียงต่อสายไว้ครบทุก Event แต่ปิดเสียงไว้ (doc PART 24)
- **Animation frame** ของตัวละคร — ทุกตัวมีภาพเดียว ใช้เป็น Static Sprite + การขยับด้วย transform (เด้ง/พุ่ง/กะพริบ/ล้ม) ไม่ได้วาดเฟรมใหม่ (doc PART 23); ยกเว้นเครื่องโดนัทที่มีเฟรมผลิตจริง 4 เฟรม
- **กระสุนฝ่ายหมี** — ใช้ภาพโดนัทจากชุดโรงงาน; ช็อกโกโดนัทใช้ filter สีน้ำตาล
- **Banana Peel trap** — ไม่พบในชุดกับดัก 47 แบบ → ใช้ภาพฟองสบู่
- **ศัตรูเมือง 2–8** ส่วนใหญ่ (Samurai/Ninja/Beach/Snow ฯลฯ) — มีซอมบี้ธีมบางตัวใน a03/a06 แต่ต้องให้ผู้ใช้ยืนยันการจับคู่
- **บอสเมือง 2–7** — มีภาพบอสใหญ่ 6 ตัว; จับคู่แน่นอนแค่ Giant Zombie Kuma (Town 1)
- **ปุ่ม Pause / ปุ่มเปล่าไม่มีตัวหนังสือ / Panel แบบยืดได้ (9-slice)** — วาดด้วยโค้ดโดยใช้สีจากชุด UI ของผู้ใช้
- **หน้าจอ Select Stage, Shop, Gacha, Achievement, Profile, Collection Detail** — ไม่มีภาพหน้าจอ (มีเฉพาะ Mission, Daily Login, VS mockup)

## จุดที่ต้องให้ผู้ใช้ตรวจสอบ

- `DEF_FAN` เอกสารตั้งชื่อ **Fan Korilakkuma** แต่ภาพเป็น **นกเพนกวินถือพัดลม** — คงชื่อตามเอกสารไว้
- Fast Zombie ใช้ภาพ **ซอมบี้พยาบาล** (เดาจากบทบาท), Armor = ซอมบี้กรวยจราจร, Shield = ซอมบี้ถังน้ำ
- โฟลเดอร์ `Assets/Unassigned/` มีภาพที่ยังไม่รู้ว่าใช้กับอะไร: ซอมบี้ pixel 36 ตัว, ซอมบี้ 48 แบบ, กับดัก 38 แบบ, สนามสำรอง 6 แบบ (คาเฟ่กลางคืน, ฟาร์มฤดูใบไม้ร่วง, เมืองนีออน ฯลฯ)
- ภาพหน้าจอ Title/Lobby/Select Town มีตัวเลขตัวอย่างฝังในภาพ (เช่น 1,250,000 coin, Lv.42) — เกมวาดค่าจริงทับไว้

## รายการทั้งหมด

| ID | ชื่อ | ประเภท | บทบาท | ไฟล์ | ขนาด | สถานะ | ไฟล์ต้นฉบับ | หมายเหตุ |
|---|---|---|---|---|---|---|---|---|
| DEF_POT_SHIELD | Pot Shield Kuma | Defender | Tank | `Assets/Characters/Defenders/def_pot_shield.png` | 320×285 | assigned | หกสหายสัตว์จิ๋วพิทักษ์บ้าน.png |  |
| DEF_SPRAY | Spray Kuma | Defender | Defensive Support | `Assets/Characters/Defenders/def_spray.png` | 320×270 | assigned | หกสหายสัตว์จิ๋วพิทักษ์บ้าน.png |  |
| DEF_CARDBOARD | Cardboard Kiiroitori | Defender | Heavy Defender | `Assets/Characters/Defenders/def_cardboard.png` | 320×262 | assigned | หกสหายสัตว์จิ๋วพิทักษ์บ้าน.png |  |
| DEF_FAN | Fan Korilakkuma | Defender | Knockback Defender | `Assets/Characters/Defenders/def_fan.png` | 320×259 | assigned | หกสหายสัตว์จิ๋วพิทักษ์บ้าน.png | Art shows a penguin holding a fan; name kept from design doc |
| DEF_MOP_CAT | Mop Cat | Defender | Control Defender | `Assets/Characters/Defenders/def_mop_cat.png` | 320×253 | assigned | หกสหายสัตว์จิ๋วพิทักษ์บ้าน.png |  |
| DEF_LAUNDRY_PANDA | Laundry Panda | Defender | Heavy Shield | `Assets/Characters/Defenders/def_laundry_panda.png` | 320×216 | assigned | หกสหายสัตว์จิ๋วพิทักษ์บ้าน.png |  |
| ATK_DONUT_KUMA | Donut Kuma | Attacker | Donut Shooter | `Assets/Characters/Attackers/atk_donut_kuma.png` | 200×207 | assigned | โรงงานโดนัทริลัคคุมะพิกเซลอาร์ต.png |  |
| ATK_DONUT_KORI | Donut Korilakkuma | Attacker | Donut Shooter | `Assets/Characters/Attackers/atk_donut_kori.png` | 179×191 | assigned | โรงงานโดนัทริลัคคุมะพิกเซลอาร์ต.png |  |
| ATK_LADLE_TORI | Ladle Kiiroitori | Attacker | Rapid Attacker | `Assets/Characters/Attackers/atk_ladle_tori.png` | 173×192 | assigned | โรงงานโดนัทริลัคคุมะพิกเซลอาร์ต.png |  |
| ATK_ROLLINGPIN_CHEF | Rolling Pin Chef | Attacker | Heavy Attacker | `Assets/Characters/Attackers/atk_rollingpin_chef.png` | 191×208 | assigned | โรงงานโดนัทริลัคคุมะพิกเซลอาร์ต.png |  |
| ATK_DONUT_CANNON | Donut Cannon Kuma | Attacker | Heavy Attacker | `Assets/Characters/Attackers/atk_donut_cannon.png` | 214×183 | assigned | โรงงานโดนัทริลัคคุมะพิกเซลอาร์ต.png |  |
| ATK_GOGGLE_CAT | Goggle Cat Blaster | Attacker | Rapid Attacker | `Assets/Characters/Attackers/atk_goggle_cat.png` | 191×205 | assigned | โรงงานโดนัทริลัคคุมะพิกเซลอาร์ต.png |  |
| ATK_UMBRELLA_PANDA | Umbrella Panda | Attacker | Projectile Shooter | `Assets/Characters/Attackers/atk_umbrella_panda.png` | 213×215 | assigned | โรงงานโดนัทริลัคคุมะพิกเซลอาร์ต.png |  |
| ATK_CHOCO_KUMA | Choco Kuma | Attacker | Magic Attacker | `Assets/Characters/Attackers/atk_choco_kuma.png` | 191×218 | assigned | โรงงานโดนัทริลัคคุมะพิกเซลอาร์ต.png |  |
| ATK_HOUSEWORK_01 | Housework Assault Squad #1 | Attacker | TBD (Phase 2) | `Assets/Characters/Attackers/atk_housework_01.png` | 320×305 | assigned-phase2 | 可愛い家事アニマル突撃隊.png |  |
| ATK_HOUSEWORK_02 | Housework Assault Squad #2 | Attacker | TBD (Phase 2) | `Assets/Characters/Attackers/atk_housework_02.png` | 320×277 | assigned-phase2 | 可愛い家事アニマル突撃隊.png |  |
| ATK_HOUSEWORK_03 | Housework Assault Squad #3 | Attacker | TBD (Phase 2) | `Assets/Characters/Attackers/atk_housework_03.png` | 320×309 | assigned-phase2 | 可愛い家事アニマル突撃隊.png |  |
| ATK_HOUSEWORK_04 | Housework Assault Squad #4 | Attacker | TBD (Phase 2) | `Assets/Characters/Attackers/atk_housework_04.png` | 320×274 | assigned-phase2 | 可愛い家事アニマル突撃隊.png |  |
| ATK_HOUSEWORK_05 | Housework Assault Squad #5 | Attacker | TBD (Phase 2) | `Assets/Characters/Attackers/atk_housework_05.png` | 320×281 | assigned-phase2 | 可愛い家事アニマル突撃隊.png |  |
| ATK_HOUSEWORK_06 | Housework Assault Squad #6 | Attacker | TBD (Phase 2) | `Assets/Characters/Attackers/atk_housework_06.png` | 320×292 | assigned-phase2 | 可愛い家事アニマル突撃隊.png |  |
| ATK_HOUSEWORK_07 | Housework Assault Squad #7 | Attacker | TBD (Phase 2) | `Assets/Characters/Attackers/atk_housework_07.png` | 320×278 | assigned-phase2 | 可愛い家事アニマル突撃隊.png |  |
| ATK_HOUSEWORK_08 | Housework Assault Squad #8 | Attacker | TBD (Phase 2) | `Assets/Characters/Attackers/atk_housework_08.png` | 320×311 | assigned-phase2 | 可愛い家事アニマル突撃隊.png |  |
| ATK_KITCHEN_01 | Kitchen Army (pixel) #1 | Attacker | TBD (Phase 2) | `Assets/Characters/Attackers/atk_kitchen_01.png` | 320×317 | assigned-phase2 | กองทัพหมีจิ๋วอาวุธครัว.png |  |
| ATK_KITCHEN_02 | Kitchen Army (pixel) #2 | Attacker | TBD (Phase 2) | `Assets/Characters/Attackers/atk_kitchen_02.png` | 320×276 | assigned-phase2 | กองทัพหมีจิ๋วอาวุธครัว.png |  |
| ATK_KITCHEN_03 | Kitchen Army (pixel) #3 | Attacker | TBD (Phase 2) | `Assets/Characters/Attackers/atk_kitchen_03.png` | 320×270 | assigned-phase2 | กองทัพหมีจิ๋วอาวุธครัว.png |  |
| ATK_KITCHEN_04 | Kitchen Army (pixel) #4 | Attacker | TBD (Phase 2) | `Assets/Characters/Attackers/atk_kitchen_04.png` | 320×285 | assigned-phase2 | กองทัพหมีจิ๋วอาวุธครัว.png |  |
| ATK_KITCHEN_05 | Kitchen Army (pixel) #5 | Attacker | TBD (Phase 2) | `Assets/Characters/Attackers/atk_kitchen_05.png` | 320×286 | assigned-phase2 | กองทัพหมีจิ๋วอาวุธครัว.png |  |
| ATK_KITCHEN_06 | Kitchen Army (pixel) #6 | Attacker | TBD (Phase 2) | `Assets/Characters/Attackers/atk_kitchen_06.png` | 320×288 | assigned-phase2 | กองทัพหมีจิ๋วอาวุธครัว.png |  |
| ATK_KITCHEN_07 | Kitchen Army (pixel) #7 | Attacker | TBD (Phase 2) | `Assets/Characters/Attackers/atk_kitchen_07.png` | 320×305 | assigned-phase2 | กองทัพหมีจิ๋วอาวุธครัว.png |  |
| ATK_KITCHEN_08 | Kitchen Army (pixel) #8 | Attacker | TBD (Phase 2) | `Assets/Characters/Attackers/atk_kitchen_08.png` | 320×269 | assigned-phase2 | กองทัพหมีจิ๋วอาวุธครัว.png |  |
| ATK_ANIMAL_01 | Animal Housework Warriors #1 | Attacker | TBD (Phase 2) | `Assets/Characters/Attackers/atk_animal_01.png` | 263×320 | assigned-phase2 | หกสัตว์จิบินักรบงานบ้าน.png |  |
| ATK_ANIMAL_02 | Animal Housework Warriors #2 | Attacker | TBD (Phase 2) | `Assets/Characters/Attackers/atk_animal_02.png` | 320×258 | assigned-phase2 | หกสัตว์จิบินักรบงานบ้าน.png |  |
| ATK_ANIMAL_03 | Animal Housework Warriors #3 | Attacker | TBD (Phase 2) | `Assets/Characters/Attackers/atk_animal_03.png` | 320×260 | assigned-phase2 | หกสัตว์จิบินักรบงานบ้าน.png |  |
| ATK_ANIMAL_04 | Animal Housework Warriors #4 | Attacker | TBD (Phase 2) | `Assets/Characters/Attackers/atk_animal_04.png` | 320×296 | assigned-phase2 | หกสัตว์จิบินักรบงานบ้าน.png |  |
| ATK_ANIMAL_05 | Animal Housework Warriors #5 | Attacker | TBD (Phase 2) | `Assets/Characters/Attackers/atk_animal_05.png` | 307×320 | assigned-phase2 | หกสัตว์จิบินักรบงานบ้าน.png |  |
| ATK_ANIMAL_06 | Animal Housework Warriors #6 | Attacker | TBD (Phase 2) | `Assets/Characters/Attackers/atk_animal_06.png` | 320×277 | assigned-phase2 | หกสัตว์จิบินักรบงานบ้าน.png |  |
| ZOM_NORMAL | Normal Zombie Kuma | Zombie | Melee | `Assets/Zombies/zom_normal.png` | 275×320 | assigned | แปดหมีซอมบี้คาวาอี้ในตาราง.png |  |
| ZOM_CONE | Cone Zombie Kuma | Zombie | Armor | `Assets/Zombies/zom_cone.png` | 257×320 | assigned | แปดหมีซอมบี้คาวาอี้ในตาราง.png |  |
| ZOM_BUCKET | Bucket Zombie Kuma | Zombie | Armor/Shield | `Assets/Zombies/zom_bucket.png` | 264×320 | assigned | แปดหมีซอมบี้คาวาอี้ในตาราง.png |  |
| ZOM_NURSE | Nurse Zombie Kuma | Zombie | Fast | `Assets/Zombies/zom_nurse.png` | 276×320 | assigned | แปดหมีซอมบี้คาวาอี้ในตาราง.png |  |
| ZOM_MINER | Miner Zombie Kuma | Zombie | Melee (Phase 2) | `Assets/Zombies/zom_miner.png` | 276×320 | assigned | แปดหมีซอมบี้คาวาอี้ในตาราง.png |  |
| ZOM_CHEF_MELEE | Spatula Chef Zombie | Zombie | Melee (Phase 2) | `Assets/Zombies/zom_chef_melee.png` | 280×320 | assigned | แปดหมีซอมบี้คาวาอี้ในตาราง.png |  |
| ZOM_HEAVY | Heavy Zombie Kuma | Zombie | Tank | `Assets/Zombies/zom_heavy.png` | 320×294 | assigned | แปดหมีซอมบี้คาวาอี้ในตาราง.png |  |
| ZOM_GHOST | Ghost Kuma | Zombie | Special (Town 2) | `Assets/Zombies/zom_ghost.png` | 310×320 | assigned | แปดหมีซอมบี้คาวาอี้ในตาราง.png |  |
| RZ_ROCK | Rock Zombie | Ranged Zombie | Ranged | `Assets/RangedZombies/rz_rock.png` | 266×320 | assigned | หมีซอมบี้จอมขว้างหกตัว.png |  |
| PROJ_ROCK | Rock | Projectile | Zombie projectile | `Assets/Projectiles/proj_rock.png` | 128×74 | assigned | หมีซอมบี้จอมขว้างหกตัว.png |  |
| RZ_BUILDER | Builder Zombie | Ranged Zombie | Ranged | `Assets/RangedZombies/rz_builder.png` | 279×320 | assigned | หมีซอมบี้จอมขว้างหกตัว.png |  |
| PROJ_BRICK | Brick | Projectile | Zombie projectile | `Assets/Projectiles/proj_brick.png` | 120×81 | assigned | หมีซอมบี้จอมขว้างหกตัว.png |  |
| RZ_CHEF | Chef Zombie | Ranged Zombie | Ranged | `Assets/RangedZombies/rz_chef.png` | 265×320 | assigned | หมีซอมบี้จอมขว้างหกตัว.png |  |
| PROJ_EGG | Egg | Projectile | Zombie projectile | `Assets/Projectiles/proj_egg.png` | 128×78 | assigned | หมีซอมบี้จอมขว้างหกตัว.png |  |
| RZ_FARMER | Farmer Zombie | Ranged Zombie | Ranged | `Assets/RangedZombies/rz_farmer.png` | 254×320 | assigned | หมีซอมบี้จอมขว้างหกตัว.png |  |
| PROJ_TOMATO | Tomato | Projectile | Zombie projectile | `Assets/Projectiles/proj_tomato.png` | 128×104 | assigned | หมีซอมบี้จอมขว้างหกตัว.png |  |
| RZ_TRASH | Trash Zombie | Ranged Zombie | Ranged | `Assets/RangedZombies/rz_trash.png` | 275×320 | assigned | หมีซอมบี้จอมขว้างหกตัว.png |  |
| PROJ_CAN | Can | Projectile | Zombie projectile | `Assets/Projectiles/proj_can.png` | 128×120 | assigned | หมีซอมบี้จอมขว้างหกตัว.png |  |
| RZ_TOXIC | Toxic Zombie | Ranged Zombie | Ranged | `Assets/RangedZombies/rz_toxic.png` | 320×288 | assigned | หมีซอมบี้จอมขว้างหกตัว.png |  |
| PROJ_POISON_BOTTLE | Poison Bottle | Projectile | Zombie projectile | `Assets/Projectiles/proj_poison_bottle.png` | 128×126 | assigned | หมีซอมบี้จอมขว้างหกตัว.png |  |
| BOSS_GIANT_ZOMBIE_KUMA | Giant Zombie Kuma | Boss | Town 1 Boss | `Assets/Bosses/boss_giant_zombie_kuma.png` | 288×238 | assigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| BOSS_SPIKE_ARMOR | Spiked Armor Zombie | Boss | candidate Mini Boss | `Assets/Bosses/boss_spike_armor.png` | 220×219 | unassigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| BOSS_TANK | Tank Zombie Kuma | Boss | candidate Mini Boss | `Assets/Bosses/boss_tank.png` | 190×216 | unassigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| BOSS_TENTACLE | Tentacle Zombie | Boss | candidate Boss | `Assets/Bosses/boss_tentacle.png` | 230×234 | unassigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| BOSS_TOXIC_SLIME | Toxic Slime Zombie | Boss | candidate Boss (Town 4?) | `Assets/Bosses/boss_toxic_slime.png` | 240×236 | unassigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| BOSS_FINAL_KING | Final King Zombie Kuma (candidate) | Boss | Town 8 Boss candidate | `Assets/Bosses/boss_final_king.png` | 363×245 | unassigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| UNA_ZPIX_01 | Pixel zombie #1 | Zombie | ? | `Assets/Unassigned/ZombiePixel/zombie_pixel_01.png` | 162×195 | unassigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| UNA_ZPIX_02 | Pixel zombie #2 | Zombie | ? | `Assets/Unassigned/ZombiePixel/zombie_pixel_02.png` | 165×204 | unassigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| UNA_ZPIX_03 | Pixel zombie #3 | Zombie | ? | `Assets/Unassigned/ZombiePixel/zombie_pixel_03.png` | 168×202 | unassigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| UNA_ZPIX_04 | Pixel zombie #4 | Zombie | ? | `Assets/Unassigned/ZombiePixel/zombie_pixel_04.png` | 166×208 | unassigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| UNA_ZPIX_05 | Pixel zombie #5 | Zombie | ? | `Assets/Unassigned/ZombiePixel/zombie_pixel_05.png` | 154×213 | unassigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| UNA_ZPIX_06 | Pixel zombie #6 | Zombie | ? | `Assets/Unassigned/ZombiePixel/zombie_pixel_06.png` | 149×212 | unassigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| UNA_ZPIX_07 | Pixel zombie #7 | Zombie | ? | `Assets/Unassigned/ZombiePixel/zombie_pixel_07.png` | 162×214 | unassigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| UNA_ZPIX_08 | Pixel zombie #8 | Zombie | ? | `Assets/Unassigned/ZombiePixel/zombie_pixel_08.png` | 156×206 | unassigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| UNA_ZPIX_09 | Pixel zombie #9 | Zombie | ? | `Assets/Unassigned/ZombiePixel/zombie_pixel_09.png` | 170×206 | unassigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| UNA_ZPIX_10 | Pixel zombie #10 | Zombie | ? | `Assets/Unassigned/ZombiePixel/zombie_pixel_10.png` | 176×198 | unassigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| UNA_ZPIX_11 | Pixel zombie #11 | Zombie | ? | `Assets/Unassigned/ZombiePixel/zombie_pixel_11.png` | 155×193 | unassigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| UNA_ZPIX_12 | Pixel zombie #12 | Zombie | ? | `Assets/Unassigned/ZombiePixel/zombie_pixel_12.png` | 173×187 | unassigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| UNA_ZPIX_13 | Pixel zombie #13 | Zombie | ? | `Assets/Unassigned/ZombiePixel/zombie_pixel_13.png` | 157×192 | unassigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| UNA_ZPIX_14 | Pixel zombie #14 | Zombie | ? | `Assets/Unassigned/ZombiePixel/zombie_pixel_14.png` | 174×185 | unassigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| UNA_ZPIX_15 | Pixel zombie #15 | Zombie | ? | `Assets/Unassigned/ZombiePixel/zombie_pixel_15.png` | 172×185 | unassigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| UNA_ZPIX_16 | Pixel zombie #16 | Zombie | ? | `Assets/Unassigned/ZombiePixel/zombie_pixel_16.png` | 166×187 | unassigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| UNA_ZPIX_17 | Pixel zombie #17 | Zombie | ? | `Assets/Unassigned/ZombiePixel/zombie_pixel_17.png` | 163×184 | unassigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| UNA_ZPIX_18 | Pixel zombie #18 | Zombie | ? | `Assets/Unassigned/ZombiePixel/zombie_pixel_18.png` | 176×187 | unassigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| UNA_ZPIX_19 | Pixel zombie #19 | Zombie | ? | `Assets/Unassigned/ZombiePixel/zombie_pixel_19.png` | 154×177 | unassigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| UNA_ZPIX_20 | Pixel zombie #20 | Zombie | ? | `Assets/Unassigned/ZombiePixel/zombie_pixel_20.png` | 167×184 | unassigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| UNA_ZPIX_21 | Pixel zombie #21 | Zombie | ? | `Assets/Unassigned/ZombiePixel/zombie_pixel_21.png` | 162×184 | unassigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| UNA_ZPIX_22 | Pixel zombie #22 | Zombie | ? | `Assets/Unassigned/ZombiePixel/zombie_pixel_22.png` | 170×186 | unassigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| UNA_ZPIX_23 | Pixel zombie #23 | Zombie | ? | `Assets/Unassigned/ZombiePixel/zombie_pixel_23.png` | 150×186 | unassigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| UNA_ZPIX_24 | Pixel zombie #24 | Zombie | ? | `Assets/Unassigned/ZombiePixel/zombie_pixel_24.png` | 143×182 | unassigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| UNA_ZPIX_25 | Pixel zombie #25 | Zombie | ? | `Assets/Unassigned/ZombiePixel/zombie_pixel_25.png` | 199×175 | unassigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| UNA_ZPIX_26 | Pixel zombie #26 | Zombie | ? | `Assets/Unassigned/ZombiePixel/zombie_pixel_26.png` | 167×182 | unassigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| UNA_ZPIX_27 | Pixel zombie #27 | Zombie | ? | `Assets/Unassigned/ZombiePixel/zombie_pixel_27.png` | 190×180 | unassigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| UNA_ZPIX_28 | Pixel zombie #28 | Zombie | ? | `Assets/Unassigned/ZombiePixel/zombie_pixel_28.png` | 162×170 | unassigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| UNA_ZPIX_29 | Pixel zombie #29 | Zombie | ? | `Assets/Unassigned/ZombiePixel/zombie_pixel_29.png` | 153×166 | unassigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| UNA_ZPIX_30 | Pixel zombie #30 | Zombie | ? | `Assets/Unassigned/ZombiePixel/zombie_pixel_30.png` | 174×195 | unassigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| UNA_ZPIX_31 | Pixel zombie #31 | Zombie | ? | `Assets/Unassigned/ZombiePixel/zombie_pixel_31.png` | 156×150 | unassigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| UNA_ZPIX_32 | Pixel zombie #32 | Zombie | ? | `Assets/Unassigned/ZombiePixel/zombie_pixel_32.png` | 184×161 | unassigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| UNA_ZPIX_33 | Pixel zombie #33 | Zombie | ? | `Assets/Unassigned/ZombiePixel/zombie_pixel_33.png` | 175×174 | unassigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| UNA_ZPIX_34 | Pixel zombie #34 | Zombie | ? | `Assets/Unassigned/ZombiePixel/zombie_pixel_34.png` | 153×179 | unassigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| UNA_ZPIX_35 | Pixel zombie #35 | Zombie | ? | `Assets/Unassigned/ZombiePixel/zombie_pixel_35.png` | 182×202 | unassigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| UNA_ZPIX_36 | Pixel zombie #36 | Zombie | ? | `Assets/Unassigned/ZombiePixel/zombie_pixel_36.png` | 185×181 | unassigned | กองทัพหมีซอมบี้พิกเซลอาร์ต.png |  |
| UNA_Z48_01 | Zombie variant #1 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_01.png` | 179×186 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_02 | Zombie variant #2 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_02.png` | 173×184 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_03 | Zombie variant #3 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_03.png` | 171×181 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_04 | Zombie variant #4 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_04.png` | 170×176 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_05 | Zombie variant #5 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_05.png` | 171×178 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_06 | Zombie variant #6 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_06.png` | 175×176 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_07 | Zombie variant #7 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_07.png` | 177×186 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_08 | Zombie variant #8 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_08.png` | 177×191 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_09 | Zombie variant #9 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_09.png` | 171×179 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_10 | Zombie variant #10 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_10.png` | 163×172 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_11 | Zombie variant #11 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_11.png` | 188×184 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_12 | Zombie variant #12 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_12.png` | 174×178 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_13 | Zombie variant #13 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_13.png` | 165×180 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_14 | Zombie variant #14 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_14.png` | 168×178 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_15 | Zombie variant #15 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_15.png` | 164×182 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_16 | Zombie variant #16 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_16.png` | 173×173 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_17 | Zombie variant #17 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_17.png` | 180×169 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_18 | Zombie variant #18 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_18.png` | 165×183 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_19 | Zombie variant #19 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_19.png` | 196×170 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_20 | Zombie variant #20 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_20.png` | 175×174 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_21 | Zombie variant #21 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_21.png` | 185×180 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_22 | Zombie variant #22 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_22.png` | 202×174 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_23 | Zombie variant #23 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_23.png` | 168×177 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_24 | Zombie variant #24 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_24.png` | 184×163 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_25 | Zombie variant #25 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_25.png` | 205×152 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_26 | Zombie variant #26 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_26.png` | 178×157 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_27 | Zombie variant #27 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_27.png` | 151×160 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_28 | Zombie variant #28 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_28.png` | 176×152 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_29 | Zombie variant #29 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_29.png` | 186×159 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_30 | Zombie variant #30 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_30.png` | 178×158 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_31 | Zombie variant #31 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_31.png` | 175×156 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_32 | Zombie variant #32 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_32.png` | 175×162 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_33 | Zombie variant #33 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_33.png` | 159×149 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_34 | Zombie variant #34 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_34.png` | 145×154 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_35 | Zombie variant #35 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_35.png` | 145×152 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_36 | Zombie variant #36 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_36.png` | 151×152 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_37 | Zombie variant #37 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_37.png` | 201×142 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_38 | Zombie variant #38 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_38.png` | 186×185 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_39 | Zombie variant #39 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_39.png` | 160×142 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_40 | Zombie variant #40 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_40.png` | 144×150 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_41 | Zombie variant #41 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_41.png` | 200×167 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_42 | Zombie variant #42 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_42.png` | 164×166 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_43 | Zombie variant #43 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_43.png` | 184×158 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_44 | Zombie variant #44 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_44.png` | 194×154 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_45 | Zombie variant #45 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_45.png` | 243×169 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_46 | Zombie variant #46 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_46.png` | 160×171 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_47 | Zombie variant #47 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_47.png` | 235×172 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| UNA_Z48_48 | Zombie variant #48 | Zombie | ? | `Assets/Unassigned/Zombie48/zombie48_48.png` | 196×171 | unassigned | ตารางซอมบี้หมีคิวต์แปดสายพันธุ์.png |  |
| ZOM_PIRATE | Pirate Zombie | Zombie | Themed (later towns) | `Assets/Zombies/Themed/zombie_pirate.png` | 319×320 | assigned-phase3 | ชีกี้ซอมบี้หมี 8 คาแรกเตอร์.png |  |
| ZOM_SAMURAI | Samurai Zombie | Zombie | Themed (later towns) | `Assets/Zombies/Themed/zombie_samurai.png` | 283×320 | assigned-phase3 | ชีกี้ซอมบี้หมี 8 คาแรกเตอร์.png |  |
| ZOM_WIZARD | Wizard Zombie | Zombie | Themed (later towns) | `Assets/Zombies/Themed/zombie_wizard.png` | 287×320 | assigned-phase3 | ชีกี้ซอมบี้หมี 8 คาแรกเตอร์.png |  |
| ZOM_SCIENTIST | Scientist Zombie | Zombie | Themed (later towns) | `Assets/Zombies/Themed/zombie_scientist.png` | 294×320 | assigned-phase3 | ชีกี้ซอมบี้หมี 8 คาแรกเตอร์.png |  |
| ZOM_MUMMY | Mummy Zombie | Zombie | Themed (later towns) | `Assets/Zombies/Themed/zombie_mummy.png` | 277×320 | assigned-phase3 | ชีกี้ซอมบี้หมี 8 คาแรกเตอร์.png |  |
| ZOM_DEVIL | Devil Zombie | Zombie | Themed (later towns) | `Assets/Zombies/Themed/zombie_devil.png` | 316×320 | assigned-phase3 | ชีกี้ซอมบี้หมี 8 คาแรกเตอร์.png |  |
| ZOM_PUMPKIN | Pumpkin Zombie | Zombie | Themed (later towns) | `Assets/Zombies/Themed/zombie_pumpkin.png` | 260×320 | assigned-phase3 | ชีกี้ซอมบี้หมี 8 คาแรกเตอร์.png |  |
| ZOM_PLAGUE_DOCTOR | Plague Doctor Zombie | Zombie | Themed (later towns) | `Assets/Zombies/Themed/zombie_plague_doctor.png` | 285×320 | assigned-phase3 | ชีกี้ซอมบี้หมี 8 คาแรกเตอร์.png |  |
| UNA_TRAP_01 | Trap #1 | Trap | ? | `Assets/Unassigned/Traps/trap_01.png` | 192×160 | unassigned | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| UNA_TRAP_02 | Trap #2 | Trap | ? | `Assets/Unassigned/Traps/trap_02.png` | 191×163 | unassigned | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| TRAP_FRYING_PAN | Frying Pan | Trap |  | `Assets/Traps/trap_frying_pan.png` | 183×172 | assigned-phase2 | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| TRAP_WATER_BUCKET | Water Bucket | Trap |  | `Assets/Traps/trap_water_bucket.png` | 201×171 | assigned-phase2 | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| TRAP_NET | Net | Trap |  | `Assets/Traps/trap_net.png` | 192×179 | assigned-phase2 | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| UNA_TRAP_06 | Trap #6 | Trap | ? | `Assets/Unassigned/Traps/trap_06.png` | 172×177 | unassigned | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| TRAP_SPIKE | Spike | Trap |  | `Assets/Traps/trap_spike.png` | 180×112 | assigned-phase2 | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| UNA_TRAP_08 | Trap #8 | Trap | ? | `Assets/Unassigned/Traps/trap_08.png` | 189×164 | unassigned | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| TRAP_STICKY_GLUE | Sticky Glue | Trap |  | `Assets/Traps/trap_sticky_glue.png` | 197×166 | assigned-phase2 | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| TRAP_BUG_SWATTER | Bug Swatter | Trap |  | `Assets/Traps/trap_bug_swatter.png` | 184×169 | assigned-phase2 | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| UNA_TRAP_11 | Trap #11 | Trap | ? | `Assets/Unassigned/Traps/trap_11.png` | 187×167 | unassigned | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| UNA_TRAP_12 | Trap #12 | Trap | ? | `Assets/Unassigned/Traps/trap_12.png` | 202×161 | unassigned | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| UNA_TRAP_13 | Trap #13 | Trap | ? | `Assets/Unassigned/Traps/trap_13.png` | 186×159 | unassigned | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| UNA_TRAP_14 | Trap #14 | Trap | ? | `Assets/Unassigned/Traps/trap_14.png` | 190×158 | unassigned | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| UNA_TRAP_15 | Trap #15 | Trap | ? | `Assets/Unassigned/Traps/trap_15.png` | 208×148 | unassigned | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| UNA_TRAP_16 | Trap #16 | Trap | ? | `Assets/Unassigned/Traps/trap_16.png` | 202×149 | unassigned | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| UNA_TRAP_17 | Trap #17 | Trap | ? | `Assets/Unassigned/Traps/trap_17.png` | 223×159 | unassigned | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| UNA_TRAP_18 | Trap #18 | Trap | ? | `Assets/Unassigned/Traps/trap_18.png` | 212×158 | unassigned | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| TRAP_ELECTRIC_FAN | Electric Fan | Trap |  | `Assets/Traps/trap_electric_fan.png` | 201×164 | assigned-phase2 | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| UNA_TRAP_20 | Trap #20 | Trap | ? | `Assets/Unassigned/Traps/trap_20.png` | 195×172 | unassigned | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| UNA_TRAP_21 | Trap #21 | Trap | ? | `Assets/Unassigned/Traps/trap_21.png` | 174×158 | unassigned | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| TRAP_SPRING | Spring | Trap |  | `Assets/Traps/trap_spring.png` | 194×155 | assigned-phase2 | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| UNA_TRAP_23 | Trap #23 | Trap | ? | `Assets/Unassigned/Traps/trap_23.png` | 193×126 | unassigned | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| UNA_TRAP_24 | Trap #24 | Trap | ? | `Assets/Unassigned/Traps/trap_24.png` | 210×169 | unassigned | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| UNA_TRAP_25 | Trap #25 | Trap | ? | `Assets/Unassigned/Traps/trap_25.png` | 218×142 | unassigned | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| UNA_TRAP_26 | Trap #26 | Trap | ? | `Assets/Unassigned/Traps/trap_26.png` | 187×158 | unassigned | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| TRAP_ROLLING_PIN_CANDIDATE | Rolling Pin Candidate | Trap |  | `Assets/Traps/trap_rolling_pin_candidate.png` | 206×159 | assigned-phase2 | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| UNA_TRAP_28 | Trap #28 | Trap | ? | `Assets/Unassigned/Traps/trap_28.png` | 197×161 | unassigned | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| UNA_TRAP_29 | Trap #29 | Trap | ? | `Assets/Unassigned/Traps/trap_29.png` | 188×144 | unassigned | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| UNA_TRAP_30 | Trap #30 | Trap | ? | `Assets/Unassigned/Traps/trap_30.png` | 194×144 | unassigned | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| UNA_TRAP_31 | Trap #31 | Trap | ? | `Assets/Unassigned/Traps/trap_31.png` | 189×143 | unassigned | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| UNA_TRAP_32 | Trap #32 | Trap | ? | `Assets/Unassigned/Traps/trap_32.png` | 190×144 | unassigned | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| UNA_TRAP_33 | Trap #33 | Trap | ? | `Assets/Unassigned/Traps/trap_33.png` | 207×162 | unassigned | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| UNA_TRAP_34 | Trap #34 | Trap | ? | `Assets/Unassigned/Traps/trap_34.png` | 205×163 | unassigned | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| UNA_TRAP_35 | Trap #35 | Trap | ? | `Assets/Unassigned/Traps/trap_35.png` | 187×171 | unassigned | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| UNA_TRAP_36 | Trap #36 | Trap | ? | `Assets/Unassigned/Traps/trap_36.png` | 180×153 | unassigned | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| UNA_TRAP_37 | Trap #37 | Trap | ? | `Assets/Unassigned/Traps/trap_37.png` | 196×171 | unassigned | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| UNA_TRAP_38 | Trap #38 | Trap | ? | `Assets/Unassigned/Traps/trap_38.png` | 191×169 | unassigned | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| UNA_TRAP_39 | Trap #39 | Trap | ? | `Assets/Unassigned/Traps/trap_39.png` | 198×175 | unassigned | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| UNA_TRAP_40 | Trap #40 | Trap | ? | `Assets/Unassigned/Traps/trap_40.png` | 200×142 | unassigned | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| UNA_TRAP_41 | Trap #41 | Trap | ? | `Assets/Unassigned/Traps/trap_41.png` | 210×179 | unassigned | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| UNA_TRAP_42 | Trap #42 | Trap | ? | `Assets/Unassigned/Traps/trap_42.png` | 197×152 | unassigned | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| UNA_TRAP_43 | Trap #43 | Trap | ? | `Assets/Unassigned/Traps/trap_43.png` | 188×160 | unassigned | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| UNA_TRAP_44 | Trap #44 | Trap | ? | `Assets/Unassigned/Traps/trap_44.png` | 188×153 | unassigned | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| UNA_TRAP_45 | Trap #45 | Trap | ? | `Assets/Unassigned/Traps/trap_45.png` | 213×162 | unassigned | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| UNA_TRAP_46 | Trap #46 | Trap | ? | `Assets/Unassigned/Traps/trap_46.png` | 184×165 | unassigned | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| UNA_TRAP_47 | Trap #47 | Trap | ? | `Assets/Unassigned/Traps/trap_47.png` | 199×162 | unassigned | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| UNA_TRAP_48 | Trap #48 | Trap | ? | `Assets/Unassigned/Traps/trap_48.png` | 196×145 | unassigned | สติกเกอร์กับดักหมีสุดคิวต์ 40 แบบ.png |  |
| FACTORY_LV1 | Donut Factory Lv.1 | Factory | Producer | `Assets/Factories/factory_lv1.png` | 176×227 | assigned | โรงงานโดนัทริลัคคุมะพิกเซลอาร์ต.png | includes painted Lv label |
| FACTORY_LV2 | Donut Factory Lv.2 | Factory | Producer | `Assets/Factories/factory_lv2.png` | 201×256 | assigned | โรงงานโดนัทริลัคคุมะพิกเซลอาร์ต.png | includes painted Lv label |
| FACTORY_LV3 | Donut Factory Lv.3 | Factory | Producer | `Assets/Factories/factory_lv3.png` | 245×283 | assigned | โรงงานโดนัทริลัคคุมะพิกเซลอาร์ต.png | includes painted Lv label |
| FACTORY_LV4 | Donut Factory Lv.4 | Factory | Producer | `Assets/Factories/factory_lv4.png` | 278×320 | assigned | โรงงานโดนัทริลัคคุมะพิกเซลอาร์ต.png | includes painted Lv label |
| FACTORY_LV5 | Donut Factory Lv.5 | Factory | Producer | `Assets/Factories/factory_lv5.png` | 263×320 | assigned | โรงงานโดนัทริลัคคุมะพิกเซลอาร์ต.png | Lv.5 uses the large showcase illustration |
| FACTORY_ANIM_IDLE | Factory frame: idle | Factory Animation |  | `Assets/Factories/factory_anim_1_idle.png` | 179×177 | assigned | โรงงานโดนัทริลัคคุมะพิกเซลอาร์ต.png |  |
| FACTORY_ANIM_HEATING | Factory frame: heating | Factory Animation |  | `Assets/Factories/factory_anim_2_heating.png` | 197×198 | assigned | โรงงานโดนัทริลัคคุมะพิกเซลอาร์ต.png |  |
| FACTORY_ANIM_BAKING | Factory frame: baking | Factory Animation |  | `Assets/Factories/factory_anim_3_baking.png` | 199×197 | assigned | โรงงานโดนัทริลัคคุมะพิกเซลอาร์ต.png |  |
| FACTORY_ANIM_EJECT | Factory frame: eject | Factory Animation |  | `Assets/Factories/factory_anim_4_eject.png` | 217×199 | assigned | โรงงานโดนัทริลัคคุมะพิกเซลอาร์ต.png |  |
| FX_SPARKLE | Sparkle burst | Effect |  | `Assets/Effects/fx_sparkle_yellow.png` | 73×82 | assigned | โรงงานโดนัทริลัคคุมะพิกเซลอาร์ต.png |  |
| UNA_DONUT_PANEL | Donut evolution panel | UI/Info | ? | `Assets/Unassigned/Factory/donut_evolution_panel.png` | 320×62 | unassigned | โรงงานโดนัทริลัคคุมะพิกเซลอาร์ต.png |  |
| DONUT_NORMAL | Normal Donut | Donut | Resource | `Assets/Donuts/donut_normal.png` | 71×64 | assigned | โรงงานโดนัทริลัคคุมะพิกเซลอาร์ต.png |  |
| UI_ICON_PLAY | icon play | UI |  | `Assets/UI/Icons/icon_play.png` | 120×115 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_ICON_SETTINGS | icon settings | UI |  | `Assets/UI/Icons/icon_settings.png` | 99×88 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_ICON_COIN | icon coin | UI |  | `Assets/UI/Icons/icon_coin.png` | 65×58 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_ICON_HOURGLASS | icon hourglass | UI |  | `Assets/UI/Icons/icon_hourglass.png` | 58×68 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_ICON_HEART | icon heart | UI |  | `Assets/UI/Icons/icon_heart.png` | 57×48 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_ICON_LOCK | icon lock | UI |  | `Assets/UI/Icons/icon_lock.png` | 53×58 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_ICON_STAR | icon star | UI |  | `Assets/UI/Icons/icon_star.png` | 72×62 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_ICON_STAR_BRONZE | icon star bronze | UI |  | `Assets/UI/Icons/icon_star_bronze.png` | 57×52 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_ICON_CHECK | icon check | UI |  | `Assets/UI/Icons/icon_check.png` | 55×52 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_ICON_CLOSE | icon close | UI |  | `Assets/UI/Icons/icon_close.png` | 54×52 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_ICON_ARROW_LEFT | icon arrow left | UI |  | `Assets/UI/Icons/icon_arrow_left.png` | 46×51 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_ICON_ARROW_RIGHT | icon arrow right | UI |  | `Assets/UI/Icons/icon_arrow_right.png` | 45×51 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_ICON_REFRESH | icon refresh | UI |  | `Assets/UI/Icons/icon_refresh.png` | 64×57 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_ICON_SWORDS | icon swords | UI |  | `Assets/UI/Icons/icon_swords.png` | 75×65 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_ICON_SHIELD | icon shield | UI |  | `Assets/UI/Icons/icon_shield.png` | 68×67 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_ICON_BOMB | icon bomb | UI |  | `Assets/UI/Icons/icon_bomb.png` | 68×70 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_ICON_HOME | icon home | UI |  | `Assets/UI/Icons/icon_home.png` | 117×118 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_ICON_MAP | icon map | UI |  | `Assets/UI/Icons/icon_map.png` | 120×120 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_ICON_CHARACTER | icon character | UI |  | `Assets/UI/Icons/icon_character.png` | 108×89 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_ICON_UPGRADE | icon upgrade | UI |  | `Assets/UI/Icons/icon_upgrade.png` | 94×116 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_ICON_SHOP | icon shop | UI |  | `Assets/UI/Icons/icon_shop.png` | 124×112 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_ICON_GACHA | icon gacha | UI |  | `Assets/UI/Icons/icon_gacha.png` | 86×93 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_ICON_EVENT | icon event | UI |  | `Assets/UI/Icons/icon_event.png` | 102×89 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_ICON_MISSION | icon mission | UI |  | `Assets/UI/Icons/icon_mission.png` | 96×115 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_ICON_ACHIEVEMENT | icon achievement | UI |  | `Assets/UI/Icons/icon_achievement.png` | 127×111 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_ICON_COLLECTION | icon collection | UI |  | `Assets/UI/Icons/icon_collection.png` | 115×104 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_ICON_CROWN | icon crown | UI |  | `Assets/UI/Icons/icon_crown.png` | 101×76 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_ICON_EXP | icon exp | UI |  | `Assets/UI/Icons/icon_exp.png` | 80×72 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_ICON_CLOCK | icon clock | UI |  | `Assets/UI/Icons/icon_clock.png` | 71×67 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_ICON_HELP_INFO | icon help info | UI |  | `Assets/UI/Icons/icon_help_info.png` | 106×53 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_ICON_ALERT | icon alert | UI |  | `Assets/UI/Icons/icon_alert.png` | 53×52 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_CARD_FRAME_KUMA | card frame kuma | UI |  | `Assets/UI/card_frame_kuma.png` | 104×103 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_CARD_FRAME_KORI | card frame kori | UI |  | `Assets/UI/card_frame_kori.png` | 105×103 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_CARD_FRAME_EMPTY | card frame empty | UI |  | `Assets/UI/card_frame_empty.png` | 105×99 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_PANEL_DIALOG | panel dialog | UI |  | `Assets/UI/panel_dialog.png` | 256×164 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_RIBBON_YELLOW | ribbon yellow | UI |  | `Assets/UI/ribbon_yellow.png` | 167×62 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_RIBBON_BLUE | ribbon blue | UI |  | `Assets/UI/ribbon_blue.png` | 166×56 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_RIBBON_PINK | ribbon pink | UI |  | `Assets/UI/ribbon_pink.png` | 125×50 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_RIBBON_RED | ribbon red | UI |  | `Assets/UI/ribbon_red.png` | 106×53 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_BAR_GREEN | bar green | UI |  | `Assets/UI/bar_green.png` | 221×27 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_BAR_YELLOW | bar yellow | UI |  | `Assets/UI/bar_yellow.png` | 221×28 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_BAR_BLUE | bar blue | UI |  | `Assets/UI/bar_blue.png` | 221×27 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_BAR_PURPLE | bar purple | UI |  | `Assets/UI/bar_purple.png` | 221×28 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_BUBBLE_WHITE | bubble white | UI |  | `Assets/UI/bubble_white.png` | 205×63 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_BUBBLE_CREAM | bubble cream | UI |  | `Assets/UI/bubble_cream.png` | 159×71 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_BURST_WHITE | burst white | UI |  | `Assets/UI/burst_white.png` | 122×65 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_TOGGLE_ON | toggle on | UI |  | `Assets/UI/toggle_on.png` | 79×41 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_TOGGLE_OFF | toggle off | UI |  | `Assets/UI/toggle_off.png` | 85×41 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_CHECKBOX_EMPTY | checkbox empty | UI |  | `Assets/UI/checkbox_empty.png` | 48×45 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_CHECKBOX_CHECKED | checkbox checked | UI |  | `Assets/UI/checkbox_checked.png` | 50×46 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_FX_LOADING_DOTS | fx loading dots | UI |  | `Assets/Effects/fx_loading_dots.png` | 63×59 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_FX_STAR_GLOW | fx star glow | UI |  | `Assets/Effects/fx_star_glow.png` | 53×48 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_FX_TWINKLE | fx twinkle | UI |  | `Assets/Effects/fx_twinkle.png` | 40×42 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_FX_HIT_SPLAT | fx hit splat | UI |  | `Assets/Effects/fx_hit_splat.png` | 59×44 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_FX_CLOUD | fx cloud | UI |  | `Assets/Effects/fx_cloud.png` | 58×52 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| UI_FX_BURST_LINES | fx burst lines | UI |  | `Assets/Effects/fx_burst_lines.png` | 98×58 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| BTN_START | Button start | Button |  | `Assets/UI/Buttons/btn_start.png` | 206×52 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| BTN_RECEIVE | Button receive | Button |  | `Assets/UI/Buttons/btn_receive.png` | 220×51 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| BTN_GO | Button go | Button |  | `Assets/UI/Buttons/btn_go.png` | 220×54 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| BTN_UPGRADE | Button upgrade | Button |  | `Assets/UI/Buttons/btn_upgrade.png` | 220×53 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| BTN_BUY | Button buy | Button |  | `Assets/UI/Buttons/btn_buy.png` | 205×53 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| BTN_CANCEL | Button cancel | Button |  | `Assets/UI/Buttons/btn_cancel.png` | 206×51 | assigned | ชุดไอคอน UI เกมหมีน้อยภาษาไทย.png |  |
| MAP_TOWN1 | Town 1 Rilakkuma Town battlefield | Battlefield |  | `Assets/Maps/town1_rilakkuma_board.jpg` | 1672×941 | assigned | townmap/กระดานเมืองหมีริลักคุมะสีสันสดใส.png |  |
| MAP_TOWN2 | Town 2 Sakura battlefield | Battlefield |  | `Assets/Maps/town2_sakura_board.jpg` | 1672×941 | assigned | townmap/เมืองซากุระยามค่ำคืนแห่งหมีน้อย.png |  |
| MAP_TOWN3 | Town 3 Seaside battlefield | Battlefield |  | `Assets/Maps/town3_seaside_board.jpg` | 1671×941 | assigned | townmap/สนามรบกริดชายหาดริลัคคุมะ.png |  |
| MAP_TOWN4 | Town 4 Forest battlefield | Battlefield |  | `Assets/Maps/town4_forest_board.jpg` | 1670×941 | assigned | townmap/เมืองป่าแฟนตาซีแบบพิกเซล.png |  |
| MAP_TOWN5 | Town 5 Snow battlefield | Battlefield |  | `Assets/Maps/town5_snow_board.jpg` | 1671×941 | assigned | townmap/เมืองหิมะกับประตูหมีเรืองแสง.png |  |
| MAP_TOWN6 | Town 6 Desert battlefield | Battlefield |  | `Assets/Maps/town6_desert_board.jpg` | 1670×941 | assigned | townmap/สนามรบอียิปต์โบราณหมีน้อย Pixel Art.png |  |
| MAP_TOWN7 | Town 7 Volcano battlefield | Battlefield |  | `Assets/Maps/town7_volcano_board.jpg` | 1670×941 | assigned | townmap/ด่านปราสาทลาวา เมือง 7.png |  |
| MAP_TOWN8 | Town 8 Sky Castle battlefield | Battlefield |  | `Assets/Maps/town8_sky_board.jpg` | 1670×941 | assigned | townmap/เมืองลอยฟ้าแห่งปราสาทหมี.png |  |
| MAP_COOP10 | CO-OP battlefield (title says ten rows) | Battlefield |  | `Assets/Maps/coop_10row_board.jpg` | 1672×941 | assigned | 十行草地上的熊熊防线.png |  |
| BG_TITLE | Title screen (baked buttons) | Screen |  | `Assets/Backgrounds/title_screen.jpg` | 1672×941 | assigned | หน้าจอเกมคิวท์ ริลัคคุมะปะทะซอมบี้.png |  |
| BG_LOBBY | Main menu lobby (baked buttons) | Screen |  | `Assets/Backgrounds/lobby_main_menu.jpg` | 1672×941 | assigned | ล็อบบี้เกมริลัคคุมะปะทะซอมบี้สุดคิวท์.png |  |
| BG_SELECT_TOWN | Select Town screen | Screen |  | `Assets/Backgrounds/select_town.jpg` | 1671×941 | assigned | townmap/หน้าจอเลือกเมืองริลัคคุมะพิกเซลสดใส (1).png |  |
| BG_MISSION | Mission screen mockup | Screen |  | `Assets/Backgrounds/mission_screen.jpg` | 1671×941 | assigned | หน้าภารกิจรายวันสุดคาวาอี้ Rilakkuma.png |  |
| BG_DAILY_LOGIN | Daily Login screen mockup | Screen |  | `Assets/Backgrounds/daily_login.jpg` | 1672×941 | assigned | หน้ารางวัลล็อกอินรายวันแสนน่ารัก.png |  |
| BG_VS | VS Mode screen mockup | Screen |  | `Assets/Backgrounds/vs_mode.jpg` | 1672×941 | assigned | ศึก VS หมีน่ารักปะทะซอมบี้บาคาร่า.png |  |
| CUT_INTRO | Story intro comic + first mission | Cutscene |  | `Assets/Cutscenes/story_intro_comic.jpg` | 1672×941 | assigned | ภารกิจเริ่มต้น_ ซอมบี้คุมะบุกเมือง.png |  |
| CUT_DONUT | Donut comic (4 panels) | Cutscene |  | `Assets/Cutscenes/donut_comic.jpg` | 1672×941 | assigned | โดนัทพิชิตฝูงหมีซอมบี้.png |  |
| CUT_BLOODMOON | Blood moon horde scene | Cutscene |  | `Assets/Cutscenes/blood_moon.jpg` | 1672×941 | assigned | หมีน้อยปะทะฝูงซอมบี้ใต้จันทร์สีเลือด.png |  |
| UNA_A05 | Night cafe board (stone, 9x5?) | Battlefield |  | `Assets/Unassigned/Boards/a05_night.jpg` | 1672×941 | unassigned | ด่านเมืองยามค่ำคืนคาเฟ่หมีน่ารัก.png | Extra board/alt — choose which town or event uses it |
| UNA_A11 | Night pixel board | Battlefield |  | `Assets/Unassigned/Boards/a11_night.jpg` | 1672×941 | unassigned | สนามรบพิกเซลอาร์ต ริลัคคุมะปะทะซอมบี้.png | Extra board/alt — choose which town or event uses it |
| UNA_A20 | Autumn farm board | Battlefield |  | `Assets/Unassigned/Boards/a20_autumn.jpg` | 1672×941 | unassigned | หมู่บ้านฟาร์มฤดูใบไม้ร่วงพิกเซลอาร์ต.png | Extra board/alt — choose which town or event uses it |
| UNA_A22 | Seaside board alt | Battlefield |  | `Assets/Unassigned/Boards/a22_seaside.jpg` | 1672×941 | unassigned | แผนที่สนามรบริมทะเลธีมหมีริลัคคุมะ.png | Extra board/alt — choose which town or event uses it |
| UNA_A23 | Backyard board | Battlefield |  | `Assets/Unassigned/Boards/a23_backyard.jpg` | 1672×941 | unassigned | แผนที่สวนหลังบ้านพิชิตซอมบี้.png | Extra board/alt — choose which town or event uses it |
| UNA_A24 | Neon city board | Battlefield |  | `Assets/Unassigned/Boards/a24_neon.jpg` | 1672×941 | unassigned | แผนที่เมืองนีออนริลัคคุมะ.png | Extra board/alt — choose which town or event uses it |
| UNA_A15 | Select Town screen (duplicate of townmap copy) | Battlefield |  | `Assets/Unassigned/Boards/a15_select.jpg` | 1671×941 | unassigned | หน้าจอเลือกเมืองริลัคคุมะพิกเซลสดใส.png | Extra board/alt — choose which town or event uses it |
