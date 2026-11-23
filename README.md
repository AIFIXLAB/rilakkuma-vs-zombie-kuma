# RILAKKUMA vs ZOMBIE KUMA — Phase 1 (Playable Core)

## 🚀 อัปขึ้น GitHub + Vercel (ไม่ต้อง build)

โปรเจกต์นี้เป็นเว็บ static ล้วน — `index.html` อยู่ที่ root, ไม่มี npm, ไม่มีขั้น build

### 1) อัปขึ้น GitHub (โปรเจกต์มี 61 ไฟล์ — อัปผ่านหน้าเว็บได้ในครั้งเดียว)
1. ที่ github.com กด **New repository** → ตั้งชื่อ `rilakkuma-vs-zombie-kuma` → **Create repository**
2. ในหน้า repo ที่ว่างอยู่ คลิกลิงก์ **uploading an existing file**
3. แตกซิปในเครื่อง → เปิดโฟลเดอร์ `rilakkuma-vs-zombie-kuma` → **เลือกทุกอย่างข้างใน** (Ctrl+A / Cmd+A) แล้วลากใส่หน้าเว็บ
   (ต้องให้ `index.html` อยู่ชั้นนอกสุดของ repo — อย่าลากตัวโฟลเดอร์ `rilakkuma-vs-zombie-kuma` เข้าไปทั้งก้อน)
4. รออัปครบ → **Commit changes**

> macOS ซ่อนไฟล์ที่ขึ้นต้นด้วยจุด (`.vercelignore`, `.gitignore`) — กด `Cmd + Shift + .` ใน Finder ให้เห็นก่อนลาก (ถ้าลืม เกมก็ยังทำงานได้)
> ใช้ GitHub Desktop หรือ `git push` ก็ได้เช่นกัน

### 2) เชื่อม Vercel
1. เข้า vercel.com → *Add New… → Project* → *Import* repo `rilakkuma-vs-zombie-kuma`
2. **Framework Preset: Other** · Build Command: เว้นว่าง · Output Directory: เว้นว่าง (ใช้ root) · Install Command: เว้นว่าง
3. กด **Deploy** → ได้ลิงก์ `https://rilakkuma-vs-zombie-kuma.vercel.app`
4. ทุกครั้งที่ push ขึ้น GitHub, Vercel จะ deploy ใหม่ให้อัตโนมัติ

(ไม่ใช้ GitHub ก็ได้: ติดตั้ง Node แล้วรัน `npx vercel --prod` ในโฟลเดอร์นี้)

### 3) เล่นบน iPad
เปิดลิงก์ Vercel ใน **Safari** → ปุ่ม *Share* → **Add to Home Screen** → ไอคอนคุมะจะอยู่บนหน้าจอ เปิดแบบเต็มจอแนวนอน
- เซฟเก็บในเครื่องตาม "ลิงก์" — ความคืบหน้าจากหน้าทดลองบน claude.ai จะไม่ตามมาที่ลิงก์ Vercel
- เพลงเริ่มหลังแตะหน้าจอครั้งแรก (กฎของ iOS) และอย่าลืมปิดโหมดเงียบ (silent switch)

### ไฟล์สำหรับ deploy
- `vercel.json` — cache ภาพ 1 วัน, โค้ด/ข้อมูลเช็คเวอร์ชันใหม่ทุกครั้ง (แก้ค่าเกมแล้ว push เห็นผลทันที)
- `.vercelignore` — ไม่อัป `tests/ tools/ docs/` ขึ้นเว็บ (ยังอยู่ใน GitHub)
- `manifest.webmanifest`, `apple-touch-icon.png`, `icon-*.png`, `favicon.png` — ไอคอน/ติดตั้งเป็นแอป (ทำจากไอคอนหน้าคุมะในชุด UI ของคุณ)
- **ภาพตัวละคร/ซอมบี้/ไอคอน 147 ภาพถูกรวมเป็น 3 แผ่น** ใน `Assets/atlas/` (units = ใช้ในเกมตอนนี้, ui = ไอคอน/ปุ่ม, future = ตัวละคร-กับดัก Phase 2–3) เกมตัดกลับเป็นภาพเดี่ยวตอนโหลด ตำแหน่งแต่ละภาพอยู่ใน `data/assets.js` · ภาพเต็มจอ 18 ภาพยังเป็นไฟล์ .jpg แยก
- ภาพเดี่ยวทั้งหมด + `Assets/Unassigned/` (131 ภาพที่ยังไม่ได้ใช้) อยู่ใน zip โปรเจกต์ชุดก่อน — ถ้าเพิ่ม/แก้ภาพ ให้แก้ในชุดนั้นแล้วรัน `python3 tools/pack_atlas.py <โฟลเดอร์ภาพเดี่ยว> <โฟลเดอร์ repo>` เพื่อสร้าง atlas ใหม่

---

เกม Tower Defense 2D แบบ HTML5 Canvas + JavaScript ล้วน ไม่ต้อง build ไม่ต้องติดตั้ง Engine
ออกแบบสำหรับ iPad แนวนอน (ความละเอียดตรรกะ 1672×941 ตามภาพสนาม) และรองรับ PC / จอสัดส่วนอื่นด้วยการ letterbox

## วิธีเปิดเกม

**บน PC**
```bash
cd RilakkumaVsZombieKuma
python3 -m http.server 8000
# เปิด http://localhost:8000
```
(ดับเบิลคลิก `index.html` ก็เปิดได้ใน Chrome/Edge เพราะไม่ใช้ ES module หรือ fetch)

**บน iPad**
อัปโหลดทั้งโฟลเดอร์ขึ้นเว็บโฮสต์ static ใดก็ได้ (GitHub Pages, Netlify, Cloudflare Pages) → เปิดใน Safari → ปุ่ม Share → *Add to Home Screen* จะเปิดแบบเต็มจอ
ข้อมูลเซฟเก็บใน `localStorage` ของเบราว์เซอร์บนเครื่องนั้น

## โครงสร้างโปรเจกต์

```
index.html              จุดเริ่ม (โหลดสคริปต์ตามลำดับ)
data/                   ★ ฐานข้อมูลเกม แก้ตัวเลขได้โดยไม่แตะโค้ด
  config.js             ค่าทั่วไป: มูลค่าโดนัท, อายุโดนัท 15 วิ, ตารางอัปเกรดเครื่อง Lv1–5, Minimum Damage, Base HP
  characters.js         Character Database (เครื่องโดนัท + ตัวป้องกัน 6 + ตัวโจมตี 8)
  enemies.js            Enemy Database (ซอมบี้ประชิด 5 + ระยะไกล 6 + บอส Giant Zombie Kuma)
  stages.js             Map geometry, 8 Towns, Stage/Wave Database (Town 1 ด่าน 1–5)
  assets.js             asset id → ไฟล์ (สร้างอัตโนมัติจาก Asset Manifest)
js/core/                engine.js (loop/scale/input), assets.js, ui.js, save.js, audio.js
js/battle/              grid.js, combat.js (สูตรดาเมจ/สถานะ), entities.js (หมี/ซอมบี้), battle.js (ฉาก, wave, HUD)
js/scenes/menus.js      Title, Main Menu, Select Town, Select Stage + จัดทีม, Intro, Settings, Profile, Collection
Assets/                 ภาพที่ตัดและจัดหมวดแล้ว + asset_manifest.json
  Unassigned/           ภาพที่ยังไม่รู้ว่าใช้ทำอะไร (รอผู้ใช้ตรวจ)
docs/ASSET_REPORT.md    รายการ Asset ทั้งหมด, สิ่งที่ขาด, จุดที่ต้องยืนยัน
docs/TESTING_REPORT.md  ผลทดสอบตาม PART 29
tests/                  acceptance.py, balance.py, bot.js, screenshots/
tools/                  สคริปต์ตัด sprite sheet และสร้าง Assets/ (Python + Pillow + SciPy)
```

## การแก้ไขเนื้อหา

- **เพิ่ม/ปรับตัวละคร** แก้ `data/characters.js` (HP, ATK, DEF, Attack Speed, Range, Cost, Cooldown, pattern: single/burst/piercing/splash/melee/spray/knockback)
- **เพิ่มด่าน** เพิ่ม entry ใน `RK.Data.stages` (`'T1-S6'` …) — เวฟ, ศัตรู, เลน, ช่วงเวลา, เงื่อนไขดาว, รางวัล, ตัวละครที่ปลดล็อก
- **เพิ่มเมือง** เพิ่ม map ใน `RK.Data.maps` (วัดพิกัดขอบกระดานจากภาพ: `rowY`, `topL/topR/botL/botR`) และตั้ง `built: true`
- **เพลงประกอบ** แต่งอัตโนมัติไม่ซ้ำโดย `js/core/music.js` (Web Audio): โหมด menu / battle (หนักขึ้นตามจำนวนซอมบี้) / final wave + jingle ชนะ/แพ้ ปรับ BPM, สเกล, คีย์, ทางเดินคอร์ดได้ที่ `MOODS` ด้านบนไฟล์ · ถ้าอยากใช้ไฟล์เพลงจริงแทน ใส่ชื่อไฟล์ที่ `bgmMenu`/`bgmBattle` ใน `audio.js`
- **เพิ่มเสียงเอฟเฟกต์** ใส่ไฟล์ใน `Assets/Audio/` แล้วกรอกชื่อไฟล์ใน `js/core/audio.js`
- **ภาพใหม่** เพิ่มใน `Assets/` แล้วเพิ่ม id ใน `data/assets.js` (และ `RK.Assets.PRELOAD` ถ้าต้องโหลดตอนเริ่ม)

## การทดสอบ

```bash
cd RilakkumaVsZombieKuma && python3 -m http.server 8765 &
pip install playwright && playwright install chromium
python3 tests/acceptance.py     # PART 29 acceptance tests → tests/results.json
python3 tests/balance.py 1 2 3  # บอทเล่นด่าน 1–5 หลาย seed
```
(สคริปต์ชี้ไปที่ `/usr/bin/google-chrome` และโฟลเดอร์ `/home/claude/...` — แก้ path ด้านบนไฟล์ให้ตรงเครื่อง)

## สถานะ Phase 1

### ✅ ทำเสร็จและทดสอบแล้ว
- Title → Main Menu → Story → Intro comic → Select Town → Select Stage (+จัดทีม 8 ช่อง) → Battle → Result
- Grid 5×9 จริง ข้อมูลช่องครบตาม 4.2 วัดให้ตรงกับช่องที่วาดในภาพ
- Donut Factory: วาง, ผลิตตามเวลา, เด้งออกมา, Lv1–5 ตามตาราง 5.4 (แตะเครื่อง → ยืนยันก่อนหัก), เฟรมผลิตจริงจากภาพ
- เก็บโดนัทด้วยตัวเองเท่านั้น (Object มี ID/Value/Position/Spawn/Expire/Type/Collected, หมดอายุ 15 วิ, กะพริบก่อนหาย, เพดาน 30 ชิ้น, กันแตะซ้ำ)
- วางตัวละครตามขั้นตอน 4.3 (เช็คโดนัท, ไฮไลต์ช่อง, ช่องไม่ว่างวางไม่ได้, ไม่พอแจ้งเตือน, คูลดาวน์)
- ตัวป้องกัน 6 ตัวตามเอกสาร (Tank, Slow+Stun spray, Box armor, Knockback, Wet floor, ลดดาเมจของขว้าง)
- ตัวโจมตี 8 ตัว (Single, Burst, Melee, Hit-all, Splash, Rapid, Piercing, Magic+Slow)
- Zombie AI ประชิด (Normal/Fast/Heavy/Armor/Shield) + ระยะไกล 6 ตัวตาม 10.7 (หยุดเมื่อมีเป้าในระยะ, เดินต่อเมื่อไม่มี, ขว้างฐานได้)
- Projectile ที่มีการชนและคำนวณดาเมจจริง (ไม่ใช่แค่ภาพ)
- สูตรดาเมจ 11.2, Minimum Damage, Armor/Shield HP, Status (Slow/Stun/Poison/Wet) + กฎซ้อน, Death ครั้งเดียว
- HP Bar, Damage Number 6 สี, Wave + Final Wave, Victory/Defeat, ดาว 3 เงื่อนไข, รางวัลทอง/EXP/ปลดล็อกตัวละคร/ด่าน
- Pause (หยุด simulation ทั้งหมด) + Resume/Restart/Settings/Exit, ความเร็ว ×1/×2, Auto-pause เมื่อสลับแอป
- Save/Load ทันทีหลังเหตุการณ์สำคัญ, Backup, Version + Migration, แจ้งเตือนเมื่อบันทึกล้มเหลวโดยไม่ลบข้อมูลเดิม, Continue
- Settings (HP Bar ตลอด, Damage Number, Auto Pause, Reset Data ยืนยัน 2 ครั้ง), Profile, Collection (แสดงเงาตัวที่ล็อก)
- Town 1 ด่าน 1–5 พร้อมสมดุลที่ทดสอบด้วยบอท

### ⏳ ยังไม่ทำ (ตาม Phase)
- **Phase 2**: Level/Star/Skill/Upgrade Branch, Character Detail, Trap System (ภาพกับดัก 9/10 ตัวจับคู่แล้ว), ตัวโจมตีชุดอื่น 22 ตัว (ภาพจัดหมวดแล้ว ยังไม่มีค่าสถานะ)
- **Phase 3**: Town 1 ด่าน 6–15, Town 2–8 (ภาพสนามครบ 8 เมืองแล้ว ต้องวัดพิกัด grid), Boss system (ข้อมูล Giant Zombie Kuma พร้อม), Cutscene ทุกบท
- **Phase 4**: Team Presets, Shop, Gacha, Daily Login, Mission, Achievement, Event (ปุ่มแสดงสถานะล็อก)
- **Phase 5**: VS Mode, CO-OP 10 แถว, Brain Energy; Online ต้องมี Backend จริง
- **Phase 6**: เสียงเอฟเฟกต์ (ยังไม่มีไฟล์; เพลงประกอบทำแล้วแบบ generative), พื้นสนามพิเศษ (มีโครงข้อมูลแล้ว), ทดสอบบน iPad จริง

### ⚠️ หมายเหตุการออกแบบที่ปรับจากเอกสาร
- มูลค่าโดนัท 1 ชิ้น = **50** (เอกสารไม่ระบุ; ทดสอบที่ 25 แล้วเศรษฐกิจตึงเกินจนด่าน 2–5 แพ้) ปรับได้ที่ `config.donut.normalValue`
- เครื่องโดนัทผลิตชิ้นแรกหลังวาง 6 วิ (ไม่ใช่ 20) เพื่อไม่ให้ช่วงเปิดเกมเงียบเกินไป — `config.firstProductionDelay`
- ปุ่มบนภาพหน้าจอที่ยังไม่มีในเอกสาร (โหมดไม่รู้จบ, บัตรผ่าน, อันดับ, เพื่อน) แสดงเป็นล็อก
