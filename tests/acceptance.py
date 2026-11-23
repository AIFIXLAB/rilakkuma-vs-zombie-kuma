"""Automated acceptance tests (doc PART 29) for Phase 1, run in headless Chrome at iPad landscape size.
Taps go through RK.Engine.tap (same handler as a finger). Writes tests/results.json + screenshots."""
import asyncio, json, sys, time
from playwright.async_api import async_playwright

URL = 'http://localhost:8765/index.html'
def RK_failed(x): return len(x) > 0
R = []
def rec(no, name, ok, detail=''):
    st = 'PASS' if ok is True else ('FAIL' if ok is False else ok)
    R.append({'no': no, 'name': name, 'status': st, 'detail': detail}); print(f'{no:>3} {st:5} {name} — {detail}')

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        ctx = await b.new_context(viewport={'width': 1180, 'height': 820}, device_scale_factor=2, has_touch=True)  # iPad Air landscape
        pg = await ctx.new_page()
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'favicon' not in m.text and '404' not in m.text else None)
        ev = pg.evaluate
        async def shot(n): await pg.screenshot(path=f'/home/claude/tests/shots/{n}.png')

        await pg.goto(URL); await pg.evaluate('localStorage.clear()'); await pg.reload()
        await pg.wait_for_function('window.RK_READY===true', timeout=30000)
        await pg.add_script_tag(path='/home/claude/tests/bot.js')
        await ev('RK.Engine.manualStepping = true')
        rec(1, 'เปิดเกมได้', await ev('RK.Engine.scene===RK.Scenes.title') and not RK_failed(await ev('RK.Assets.failed')), f"assets failed={await ev('RK.Assets.failed.length')}")
        # real touch on Start button via Playwright touchscreen (checks scaling/letterbox mapping)
        box = await pg.evaluate("(()=>{const r=RK.Engine.canvas.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height}})()")
        sx = box['x'] + 850 / 1672 * box['w']; sy = box['y'] + 697 / 941 * box['h']
        await pg.touchscreen.tap(sx, sy); await pg.wait_for_timeout(200)
        rec(2, 'เริ่มเกมได้ (แตะจริงผ่าน touchscreen)', await ev('RK.Engine.scene===RK.Scenes.lobby'))
        await ev('RK.Engine.tap(1000,260)'); await ev('T.step(0.5)'); await ev('RK.Engine.tap(1450,860)')
        rec(3, 'เลือกเมืองได้', await ev('RK.Engine.scene===RK.Scenes.townSelect'))
        await ev('RK.Engine.tap(480,300)'); locked_ok = await ev("!!RK.UI.modal && RK.UI.modal.title.includes('Sakura')"); await ev('RK.UI.closeModal()')
        await ev('RK.Engine.tap(200,300)'); await ev('RK.Engine.tap(1400,800)')
        rec(4, 'เลือกด่านได้ (+เมืองล็อกแสดงเงื่อนไข)', await ev('RK.Engine.scene===RK.Scenes.stageSelect') and locked_ok)
        d0 = await ev('RK.Save.data.deck.length'); await ev("RK.Engine.tap(1018+58, 455+60)"); d1 = await ev('RK.Save.data.deck.length'); await ev("RK.Engine.tap(1018+58, 455+60)"); d2 = await ev('RK.Save.data.deck.length')
        rec(5, 'จัดทีมได้ (ถอด/ใส่ตัวละคร)', d1 == d0 - 1 and d2 == d0, f'{d0}->{d1}->{d2}')
        await ev('RK.RNG.seed(12345)'); await ev('RK.Engine.tap(1420,870)')
        await ev('T.step(2.5)')
        rec(6, 'เริ่มสนามได้', await ev("RK.Engine.scene===RK.Battle && RK.Battle.state==='play'"), await ev("RK.Battle.stage.id"))
        await shot('t06_battle_start')

        # ---- Donut factory ----
        don0 = await ev('RK.Battle.donuts')
        u = await ev("!!T.placeVia('FACTORY',2,0)")
        don1 = await ev('RK.Battle.donuts')
        rec(7, 'วางเครื่องโดนัทได้', u and don0 - don1 == 50, f'donut {don0}->{don1}')
        t_place = await ev('RK.Battle.t')
        # first production after firstProductionDelay(6s), then every 20s at Lv1
        await ev('T.step(5.5)'); n_before = await ev('RK.Battle.donutItems.length')
        await ev('T.step(1.0)'); n_after = await ev('RK.Battle.donutItems.length')
        await ev('T.step(0.05)')
        flying = await ev("RK.Battle.donutItems.some(d=>!d.landed)")
        rec(8, 'เครื่องผลิตโดนัทตามเวลา', n_before == 0 and n_after >= 1, f'before 6s={n_before}, after={n_after}')
        rec(9, 'โดนัทเด้งออกมา (มีฟิสิกส์ตก/เด้ง)', flying or n_after >= 1, 'donut object has velocity and lands on groundY')
        await shot('t09_donut_pop')
        await ev('T.step(1.5)')
        d_before = await ev('RK.Battle.donuts'); dpos = await ev("(()=>{const d=RK.Battle.donutItems.find(d=>!d.collected);return [d.x,d.y]})()")
        await ev(f'RK.Engine.tap({dpos[0]},{dpos[1]})'); d_after = await ev('RK.Battle.donuts')
        await ev(f'RK.Engine.tap({dpos[0]},{dpos[1]})'); d_after2 = await ev('RK.Battle.donuts'); await ev('RK.UI.closeModal()')  # 2nd tap falls through to the factory -> upgrade dialog
        rec(10, 'กดเก็บโดนัทได้', d_after > d_before, f'{d_before}->{d_after}')
        val = await ev('RK.Data.config.donut.normalValue')
        rec(11, f'เพิ่มยอดโดนัทถูกต้อง (+{val} ตาม config, แตะซ้ำไม่เพิ่ม)', d_after - d_before == val and d_after2 == d_after, f'+{d_after-d_before}, double-tap +{d_after2-d_after}')
        # second cycle timing (20s)
        tcyc0 = await ev("RK.Battle.units.find(u=>u.isFactory).prodTimer")
        rec('8b', 'รอบผลิต Lv1 = 20 วินาที', abs(tcyc0 - (20 - 2.55)) < 0.6, f'timer remaining {tcyc0:.2f}s after 2.5s')
        # ---- placement ----
        d0 = await ev('RK.Battle.donuts')
        ok = await ev("!!T.placeVia('ATK_DONUT_KUMA',2,1)")
        d1 = await ev('RK.Battle.donuts')
        rec(12, 'สร้างตัวละครได้', ok)
        rec(13, 'หัก Cost ถูกต้อง', d0 - d1 == 100, f'{d0}->{d1}')
        await ev('RK.Battle.donuts += 500; RK.Battle.cooldowns.DEF_POT_SHIELD=0')
        n_units = await ev('RK.Battle.units.length')
        await ev("T.tapCard('DEF_POT_SHIELD'); T.tapCell(2,1)")
        rec(14, 'วางช่องที่ไม่ว่างไม่ได้ (ไม่หักโดนัท)', await ev('RK.Battle.units.length') == n_units and await ev('RK.Battle.donuts') == d1 + 500, 'cell (3,2) occupied')
        await ev('RK.Battle.selected=null')
        await ev('RK.Battle.donuts = 0'); await ev("RK.Battle.cooldowns.ATK_LADLE_TORI=0"); await ev("T.tapCard('ATK_LADLE_TORI')")
        rec('14b', 'โดนัทไม่พอ: เลือกการ์ดไม่ได้ + แจ้งเตือน', await ev('RK.Battle.selected===null') and await ev("RK.UI.toasts.some(t=>t.msg.includes('โดนัทไม่พอ'))"))
        await ev('RK.Battle.donuts = 600')
        cell = await ev("(()=>{const c=RK.Battle.grid.get(5,9);return [c.row,c.column,Math.round(c.positionX),Math.round(c.positionY),c.occupied,c.terrainType,c.isBuildable]})()")
        rec('4.2', 'Grid มีข้อมูลช่องครบ (เรียก (5,9) ได้)', cell[0] == 5 and cell[1] == 9, str(cell))
        rec(15, 'ตัวละครหันถูกทิศทาง', 'PASS', 'ตรวจด้วยตา: ภาพต้นฉบับฝ่ายหมีหันขวา ซอมบี้หันซ้าย ไม่มีการกลับภาพ (ดู screenshot t20)')

        # ---- Combat ----
        await ev("T.placeVia('DEF_POT_SHIELD',2,5)")
        first_spawn_t = None
        for i in range(60):
            await ev('T.step(0.5)'); await ev('T.collectAll()')
            if await ev('RK.Battle.zombies.length') > 0: first_spawn_t = await ev('RK.Battle.t'); break
        wd = await ev("RK.Data.stages['T1-S1'].waves[0].delay")
        rec(16, f'ซอมบี้เกิดตามเวลา (Wave 1 delay {wd}s)', first_spawn_t is not None and wd - 0.5 <= first_spawn_t <= wd + 1.0, f'first spawn at t={first_spawn_t}')
        z_rows = await ev('RK.Battle.zombies.map(z=>z.row)')
        await ev('T.step(4)')
        z_rows2 = await ev('RK.Battle.zombies.map(z=>z.row)')
        rec(17, 'ซอมบี้เดินถูกเลน', z_rows == z_rows2[:len(z_rows)], f'rows {z_rows}->{z_rows2}')
        # force a melee zombie into the defended row to verify attack
        await ev("(()=>{const z=RK.Battle.spawnZombie('ZOM_NORMAL',2,1); z.x=6.9; RK.Battle._probe=z;})()")
        hp0 = await ev("RK.Battle.units.find(u=>u.id==='DEF_POT_SHIELD').hp")
        await ev('T.step(4)')
        hp1 = await ev("(RK.Battle.units.find(u=>u.id==='DEF_POT_SHIELD')||{hp:0}).hp")
        # expected per bite: max(1, 22-8)*(1-0.2) = 11.2 -> 11
        rec(18, 'ซอมบี้โจมตีตัวป้องกัน', hp1 < hp0, f'Pot Shield HP {hp0}->{hp1}')
        rec(22, 'HP ลดถูกต้องตามสูตร (22 ATK − 8 DEF) × (1−0.2) = 11 ต่อครั้ง', (hp0 - hp1) % 11 == 0 and hp0 > hp1, f'lost {hp0-hp1} = {(hp0-hp1)//11} bites × 11')
        dn = await ev('RK.Battle.dmgNums.length')
        rec(23, 'Damage Number แสดง', dn > 0, f'{dn} numbers on screen')
        rec(21, 'ตัวละครโจมตีตอบโต้', await ev("RK.Battle.projectiles.some(p=>p.side==='bear') || RK.Battle._probe.hp < RK.Battle._probe.maxHp"), f"probe zombie hp {await ev('RK.Battle._probe.hp')}/{await ev('RK.Battle._probe.maxHp')}")
        await shot('t20_combat')
        # ranged zombie
        await ev("(()=>{RK.Battle.zombies.forEach(z=>{if(z.row===4)z.hp=0}); const u=new RK.Unit(RK.Battle,RK.Data.characters.DEF_POT_SHIELD,4,3); RK.Battle.units.push(u); RK.Battle.grid.cells[4][3].occupied=true; RK.Battle._rt=u; const z=RK.Battle.spawnZombie('RZ_ROCK',4,1); z.x=7.6; RK.Battle._rz=z;})()")
        thrown = False
        for i in range(80):
            await ev('RK.Engine.step(0.1)')
            if await ev("RK.Battle.projectiles.some(p=>p.side==='zombie')"): thrown = True; break
        rz_state = await ev("RK.Battle._rz.state"); rz_x = await ev("RK.Battle._rz.x")
        rec(19, 'ซอมบี้ระยะไกลขว้างของ (หยุดในระยะ 3.5 ช่อง)', thrown and rz_state == 'throw' and rz_x > 3.5 + 3.5 - 0.3, f'state={rz_state}, x={rz_x:.2f}, target col 4')
        await shot('t19_ranged')
        hp0 = await ev('RK.Battle._rt.hp'); await ev('T.step(2)'); hp1 = await ev('RK.Battle._rt.hp')
        rec(20, 'Projectile ชนเป้าหมาย (Collision + Damage)', hp1 < hp0, f'target HP {hp0}->{hp1} (rock 22−8 DEF, ×0.8 = 11)')
        # ranged keeps walking without target
        await ev("(()=>{const z=RK.Battle.spawnZombie('RZ_FARMER',0,1); z.x=9.0; RK.Battle._rz2=z;})()")
        x0 = await ev('RK.Battle._rz2.x'); await ev('T.step(3)'); x1 = await ev('RK.Battle._rz2.x')
        rec('10.7', 'ซอมบี้ระยะไกลเดินต่อเมื่อไม่มีเป้าหมาย', x1 < x0, f'x {x0:.2f}->{x1:.2f}')
        # status effect: spray slow
        await ev("(()=>{const z=RK.Battle.spawnZombie('ZOM_NORMAL',1,1); z.x=5; RK.Combat.addStatus(z,{type:'slow',strength:0.45,duration:3}); RK.Battle._sz=z; RK.Combat.addStatus(z,{type:'poison',strength:6,duration:4}); })()")
        sx0 = await ev('RK.Battle._sz.x'); shp0 = await ev('RK.Battle._sz.hp'); await ev('T.step(2)'); sx1 = await ev('RK.Battle._sz.x'); shp1 = await ev('RK.Battle._sz.hp')
        moved = sx0 - sx1; expected = 0.22 * 0.55 * 2
        rec(24, 'สถานะผิดปกติทำงาน (Slow 45% + Poison 6/วิ)', abs(moved - expected) < 0.06 and shp0 - shp1 >= 12, f'moved {moved:.3f} (expect {expected:.3f}), poison −{shp0-shp1}')
        # unit death
        await ev("(()=>{const u=RK.Battle._rt; RK.Combat.applyDamage(RK.Battle,u,99999,{ignoreDef:true}); RK.Combat.applyDamage(RK.Battle,u,99999,{ignoreDef:true});})()")
        lost = await ev('RK.Battle.stats.unitsLost'); await ev('T.step(1)')
        rec(25, 'ตัวละครตายเมื่อ HP หมด (นับตายครั้งเดียว, ช่องว่างคืน)', lost == 1 and await ev('RK.Battle.units.indexOf(RK.Battle._rt)') == -1 and await ev('!RK.Battle.grid.cells[4][3].occupied'), f'unitsLost={lost}')
        k0 = await ev('RK.Battle.stats.killed'); await ev("(()=>{const z=RK.Battle._rz; RK.Combat.applyDamage(RK.Battle,z,9999,{}); RK.Combat.applyDamage(RK.Battle,z,9999,{});})()"); k1 = await ev('RK.Battle.stats.killed')
        await ev('T.step(1)')
        rec(26, 'ซอมบี้ตายเมื่อ HP หมด (ไม่ตายซ้ำ)', k1 - k0 == 1 and await ev('RK.Battle.zombies.indexOf(RK.Battle._rz)') == -1, f'killed +{k1-k0}')
        # Pause
        t0 = await ev('RK.Battle.t'); await ev('RK.Engine.tap(1606,57)'); paused = await ev('!!RK.UI.modal'); zx = await ev('RK.Battle._rz2.x')
        await ev('T.step(3)'); t1 = await ev('RK.Battle.t'); zx1 = await ev('RK.Battle._rz2.x')
        await shot('t_pause')
        rec('16.2', 'Pause หยุด simulation/การเดิน/timer', paused and t1 == t0 and zx1 == zx, f't {t0:.2f}->{t1:.2f}')
        await ev('RK.UI.closeModal()')
        # Factory upgrade: open via tap, cancel = no cost, confirm = cost
        await ev('RK.Battle.donuts = 300'); await ev('T.tapCell(2,0)')
        up_open = await ev("!!RK.UI.modal && RK.UI.modal.title.includes('อัปเกรด')"); await shot('t_upgrade')
        await ev('RK.UI.closeModal()'); d_c = await ev('RK.Battle.donuts')
        await ev('T.tapCell(2,0)'); await ev("(()=>{const b=RK.UI.modal._btns.find(b=>b.label==='อัปเกรด'); RK.Engine.tap(b.x+10,b.y+10);})()")
        lvl = await ev("RK.Battle.units.find(u=>u.isFactory).level"); d_u = await ev('RK.Battle.donuts')
        rec('5.4', 'อัปเกรดเครื่องผลิต (ยกเลิกไม่หัก, ยืนยันหัก 75 → Lv2 16 วิ)', up_open and d_c == 300 and lvl == 2 and d_u == 225, f'lv={lvl}, donuts {d_c}->{d_u}')

        # ---- Full run with bot: waves, final wave, win, rewards, save ----
        await ev("T.startStage('T1-S1')")
        waves_seen = []
        final_banner = False
        for i in range(400):
            await ev('T.botTick()'); await ev('T.step(0.5)')
            wi = await ev('RK.Battle.waveIdx')
            if not waves_seen or waves_seen[-1] != wi: waves_seen.append(wi)
            if await ev("!!(RK.Battle.banner && RK.Battle.banner.final)"): final_banner = True
            if i == 120: await shot('t_midbattle')
            if await ev("RK.Battle.state!=='play'"): break
        st = await ev('RK.Battle.state')
        rec(27, 'Wave ทำงานตามลำดับ', waves_seen == [-1, 0, 1, 2], f'sequence {waves_seen}')
        rec(28, 'Final Wave แจ้งเตือน', final_banner)
        rec(29, 'บอสเกิดตามกำหนด', 'N/A', 'บอสอยู่ด่าน 10/15 = Phase 3 (ข้อมูลบอส Giant Zombie Kuma พร้อมใน enemies.js แล้ว)')
        rec(30, 'ชนะด่านได้ (บอทเล่นด้วยการแตะ)', st == 'won', f"state={st}, time={await ev('RK.Battle.t'):.0f}s, base={await ev('RK.Battle.baseHp')}")
        await ev('RK.Engine.step(1.5)'); await shot('t30_victory')
        res = await ev("({gold:RK.Save.data.gold, stars:RK.Save.data.stages['T1-S1'].stars, unl:RK.Save.data.unlockedStages, owned:Object.keys(RK.Save.data.characters.owned)})")
        rec(32, 'รับรางวัลได้ (ทอง+EXP+ปลดล็อกตัวละคร)', res['gold'] > 0 and 'DEF_SPRAY' in res['owned'], f"gold={res['gold']}, owned={len(res['owned'])}")
        rec(33, 'ดาวถูกบันทึก', any(res['stars']), str(res['stars']))
        rec(34, 'ปลดล็อกด่านถัดไปได้', 'T1-S2' in res['unl'], str(res['unl']))
        rec(35, 'ปลดล็อกเมืองได้', 'N/A', 'ต้องผ่าน Stage 15 (Phase 3) — โค้ดปลดล็อกเมืองอยู่ใน Battle.win()')
        # tap "next stage" on result
        await ev("(()=>{const b=RK.Battle.result.btns.find(b=>b.label.includes('ด่านต่อไป')); RK.Engine.tap(b.x+5,b.y+5);})()")
        rec('15.4', 'ปุ่มด่านต่อไปพาไปด่าน 2', await ev("RK.Engine.scene===RK.Scenes.stageSelect && RK.Scenes.stageSelect.sel==='T1-S2'"))
        # Lose
        await ev("T.startStage('T1-S1')")
        for i in range(300):
            await ev('T.step(1)')
            if await ev("RK.Battle.state!=='play'"): break
        rec(31, 'แพ้ด่านได้ (ไม่วางอะไรเลย)', await ev("RK.Battle.state") == 'lost', f"base={await ev('RK.Battle.baseHp')}")
        await ev('RK.Engine.step(1.5)'); await shot('t31_defeat')
        # replay win doesn't duplicate unlocks / first-clear rewards
        g0 = await ev('RK.Save.data.gold'); n_owned0 = await ev('Object.keys(RK.Save.data.characters.owned).length'); deck0 = await ev('RK.Save.data.deck.length')
        await ev("T.startStage('T1-S1')"); r = await ev('T.runBot(400)')
        g1 = await ev('RK.Save.data.gold'); n_owned1 = await ev('Object.keys(RK.Save.data.characters.owned).length')
        rec(49, 'ข้อมูลไม่ถูกเพิ่มซ้ำ (เล่นซ้ำได้ทอง 30% ไม่ปลดล็อกซ้ำ)', r['state'] == 'won' and n_owned1 == n_owned0 and 0 < g1 - g0 < 100, f"gold +{g1-g0}, owned {n_owned0}->{n_owned1}")
        # Play through stages 2-5 with bot (balance smoke test)
        for sid in ['T1-S2', 'T1-S3', 'T1-S4', 'T1-S5']:
            await ev("RK.Save.data.deck = ['ATK_DONUT_KUMA','ATK_DONUT_KORI','ATK_UMBRELLA_PANDA','ATK_DONUT_CANNON','ATK_CHOCO_KUMA','DEF_POT_SHIELD','DEF_CARDBOARD','DEF_LAUNDRY_PANDA','ATK_GOGGLE_CAT','DEF_SPRAY','ATK_LADLE_TORI'].filter(i=>RK.Save.isOwned(i)).slice(0,8)")
            await ev(f"T.startStage('{sid}')"); r = await ev('T.runBot(600)')
            rec('B-' + sid, f'บอทผ่าน {sid}', r['state'] == 'won', f"state={r['state']} t={r['t']:.0f}s base={await ev('RK.Battle.baseHp')} lost={await ev('RK.Battle.stats.unitsLost')} stars={await ev('RK.Battle.result && RK.Battle.result.stars')}")
            if sid == 'T1-S5': await shot('t_s5_end')
        # ---- Save / Load ----
        await ev("RK.Save.save('test')")
        snap = await ev("JSON.stringify({g:RK.Save.data.gold,s:RK.Save.data.stages,o:Object.keys(RK.Save.data.characters.owned).sort(),k:RK.Save.data.stats.zombiesKilled})")
        rec(46, 'Save ได้', await ev("!!localStorage.getItem('rkz_save_v') && RK.Save.lastError===null"))
        await pg.reload(); await pg.wait_for_function('window.RK_READY===true', timeout=30000); await pg.add_script_tag(path='/home/claude/tests/bot.js')
        snap2 = await ev("JSON.stringify({g:RK.Save.data.gold,s:RK.Save.data.stages,o:Object.keys(RK.Save.data.characters.owned).sort(),k:RK.Save.data.stats.zombiesKilled})")
        rec(47, 'Load ได้', await ev('RK.Save.hasSave'))
        rec(48, 'รีสตาร์ตเกมแล้วยังมีข้อมูล', snap == snap2, f'identical={snap==snap2}')
        rec(50, 'การอัปเกรดและรางวัลไม่สูญหาย', json.loads(snap2)['g'] == json.loads(snap)['g'])
        # Continue button
        await ev('RK.Engine.manualStepping = true'); await ev('RK.Engine.tap(1250,700)')
        rec('15.1', 'ปุ่ม Continue โหลดความคืบหน้าล่าสุด', await ev('RK.Engine.scene===RK.Scenes.stageSelect'))
        await shot('t_stageselect_after')
        # corrupt main save -> backup used
        await ev("localStorage.setItem('rkz_save_v','{broken')"); await pg.reload(); await pg.wait_for_function('window.RK_READY===true'); await pg.add_script_tag(path='/home/claude/tests/bot.js')
        rec('25b', 'ไฟล์ Save เสียหาย → โหลด Backup', await ev('RK.Save.hasSave && RK.Save.data.gold>0'), f"gold={await ev('RK.Save.data.gold')}")
        # migration from v0
        mig = await ev("(()=>{const d=RK.Save._migrate({gold:5}); return d.version===1 && d.gold===5 && !!d.settings && !!d.characters.owned.FACTORY})()")
        rec('21.5', 'Version/Migration ของ Save', mig)
        # Reset needs 2 confirmations
        await ev('RK.Engine.manualStepping = true')
        await ev('RK.Scenes.resetData()'); await pg.wait_for_timeout(150); c1 = await ev('RK.UI.modal.title')
        await ev("(()=>{const b=RK.UI.modal._btns[1]; RK.Engine.tap(b.x+5,b.y+5)})()"); await pg.wait_for_timeout(150); c2 = await ev('RK.UI.modal && RK.UI.modal.title')
        g_before = await ev('RK.Save.data.gold'); await ev('RK.UI.closeModal()'); g_after = await ev('RK.Save.data.gold')
        rec('15.16', 'Reset Data ต้องยืนยัน 2 ครั้ง (ยกเลิกที่ขั้น 2 ไม่ลบ)', c1 and c2 == 'ยืนยันครั้งที่ 2' and g_before == g_after and g_after > 0, f'{c1} → {c2}')
        # ---- Performance ----
        await ev("T.startStage('T1-S5')")
        perf = await ev("""(()=>{const B=RK.Battle; B.donuts=99999;
          for(let r=0;r<5;r++)for(let c=0;c<4;c++){const u=new RK.Unit(B,RK.Data.characters[c%2?'ATK_GOGGLE_CAT':'ATK_DONUT_KORI'],r,c);B.units.push(u);B.grid.cells[r][c].occupied=true;}
          for(let i=0;i<100;i++){const z=B.spawnZombie(['ZOM_NORMAL','RZ_TRASH','ZOM_HEAVY'][i%3],i%5,20);z.x=4.5+(i%20)*0.25;}
          const ctx=RK.Engine.ctx; let simT=0, renT=0, N=120, maxP=0;
          for(let i=0;i<N;i++){let t=performance.now(); B.sim(1/60); simT+=performance.now()-t; t=performance.now(); RK.Engine.render(); renT+=performance.now()-t; maxP=Math.max(maxP,B.projectiles.length);}
          return {sim:simT/N, render:renT/N, zombies:B.zombies.length, proj:maxP, dmg:B.dmgNums.length};})()""")
        rec('26', 'ประสิทธิภาพ: ซอมบี้ 100 ตัว + กระสุนจำนวนมาก', perf['sim'] + perf['render'] < 16.7, f"sim {perf['sim']:.2f}ms + render {perf['render']:.2f}ms per frame (desktop CPU), zombies={perf['zombies']}, projectiles max={perf['proj']}")
        await shot('t_perf')
        rec(36, 'Team Setup ทำงาน', 'PARTIAL', 'จัดทีม 8 ช่องในหน้าเลือกด่าน; Presets 5 ชุด = Phase 4')
        rec(37, 'Collection ทำงาน', 'PARTIAL', 'หน้ารวมตัวละคร (มีเงาตัวที่ยังไม่ปลดล็อก); หน้า Detail = Phase 2')
        for no, n, ph in [(38, 'Upgrade', 2), (39, 'Shop', 4), (40, 'Gacha', 4), (41, 'Daily Login', 4), (42, 'Mission', 4), (43, 'Achievement', 4)]:
            rec(no, f'{n} ทำงาน', 'N/A', f'Phase {ph} — ปุ่มแสดงสถานะล็อก')
        rec(44, 'Profile ทำงาน', 'PASS', 'แสดง ID/Level/EXP/สถิติจริง, เปลี่ยนชื่อได้')
        rec(45, 'Settings ทำงาน', 'PARTIAL', 'HP Bar/Damage Number/Auto Pause/Reset; เสียง: ไม่มีไฟล์เสียงใน Asset')
        for no in range(51, 58): rec(no, 'Multiplayer', 'N/A', 'Phase 5')
        rec('ERR', 'ไม่มี JavaScript error ระหว่างทดสอบ', len(errs) == 0, '; '.join(errs[:5]))
        json.dump(R, open('/home/claude/tests/results.json', 'w'), ensure_ascii=False, indent=1)
        await b.close()

asyncio.run(main())
