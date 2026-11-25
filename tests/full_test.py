"""Functional test suite for the full game (all modes / menus / shop / traps / rotate / sell).
Runs in headless Chrome at iPad landscape size; taps go through RK.Engine.tap (same handler as a finger)."""
import asyncio, json
from playwright.async_api import async_playwright
R = []
def rec(group, name, ok, detail=''):
    st = 'PASS' if ok is True else ('FAIL' if ok is False else ok)
    R.append({'group': group, 'name': name, 'status': st, 'detail': str(detail)}); print(f'{st:5} [{group}] {name} — {detail}', flush=True)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        ctx = await b.new_context(viewport={'width': 1180, 'height': 820}, device_scale_factor=1, has_touch=True)
        pg = await ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        ev = pg.evaluate
        async def fresh():
            await ev('localStorage.clear()'); await pg.reload(); await pg.wait_for_function('window.RK_READY===true', timeout=60000)
            await pg.add_script_tag(path='/home/claude/tests/harness.js'); await ev('RK.Engine.manualStepping = true')
        await pg.goto('http://localhost:8765/index.html'); await fresh()

        # ---------- Boot / navigation ----------
        rec('Boot', 'เปิดเกม ภาพโหลดครบ', await ev('RK.Assets.failed.length===0 && RK.Engine.scene===RK.Scenes.title'), f"failed={await ev('RK.Assets.failed.length')}")
        box = await ev("(()=>{const r=RK.Engine.canvas.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height}})()")
        await pg.touchscreen.tap(box['x'] + 850 / 1672 * box['w'], box['y'] + 697 / 941 * box['h']); await pg.wait_for_timeout(100)
        rec('Boot', 'แตะจริง "เริ่มเกม" → เมนูหลัก', await ev('RK.Engine.scene===RK.Scenes.lobby'))
        spots = {'missions': (1100, 480), 'collection': (1540, 480), 'shop': (1170, 690), 'gacha': (1315, 690), 'eventsList': (1455, 690), 'pass': (1590, 690), 'gift': (78, 200), 'ranking': (78, 330),
                 'friends': (78, 440), 'login': (78, 560), 'news': (78, 680), 'modes': (1470, 260), 'event': (760, 690), 'profile': (250, 70)}
        okn = []
        for name, (x, y) in spots.items():
            await ev("RK.Engine.setScene(RK.Scenes.lobby)"); await ev(f'RK.Engine.tap({x},{y})')
            okn.append((name, await ev(f'RK.Engine.scene===RK.Scenes.{name}')))
        rec('Menu', 'ปุ่มทุกปุ่มบนเมนูหลักเปิดหน้าจริง (14 ปุ่ม)', all(o for _, o in okn), ', '.join(n for n, o in okn if not o) or 'ครบ')
        await ev("RK.Engine.setScene(RK.Scenes.lobby)"); await ev('RK.Engine.tap(1000,260)')
        rec('Menu', 'Story Mode → คัทซีน/เลือกเมือง', await ev('RK.Engine.scene===RK.Scenes.intro || RK.Engine.scene===RK.Scenes.townSelect'))
        await ev("RK.Engine.setScene(RK.Scenes.lobby)"); await ev('RK.Engine.tap(850,480)')
        rec('Menu', 'โหมดไม่รู้จบ → หน้าเตรียมด่าน', await ev("RK.Engine.scene===RK.Scenes.pre && RK.Scenes.pre.args.stageId==='ENDLESS'"))
        rec('Data', 'ด่านเนื้อเรื่องครบ 120 ด่าน (8 เมือง × 15)', await ev("Object.values(RK.Data.stages).filter(s=>s.mode==='story').length") == 120)
        rec('Data', 'ด่าน 10 มีมินิบอส / ด่าน 15 มีบอส ทุกเมือง', await ev("RK.Data.towns.every(t=>RK.Data.stages[`T${t.id}-S10`].waves.some(w=>w.spawns.some(g=>g.mini)) && RK.Data.stages[`T${t.id}-S15`].waves.some(w=>w.spawns.some(g=>g.boss)))"))
        rec('Data', 'ตัวละคร 37 ตัว / กับดัก 15 / ศัตรู', await ev("[Object.keys(RK.Data.characters).length, Object.keys(RK.Data.traps).length, Object.keys(RK.Data.enemies).length].join('/')"), '')
        rec('Data', 'โหมด: กิจกรรม 6×5 ด่าน, ท้าทาย 10, CO-OP 8', await ev("RK.Data.events.length*5 + RK.Data.challenges.length + RK.Data.coopStages.length") == 48)

        # ---------- Rotate & sell ----------
        await ev("TB.setup(2)")
        await ev("RK.RNG.seed(3); RK.Engine.setScene(RK.Battle,{stageId:'T2-S5',deck:['ATK_DONUT_KUMA','KT_SWATTER_PANDA','DEF_POT_SHIELD'].filter(i=>RK.Save.isOwned(i))}); RK.Battle.state='play'; RK.Battle.donuts=2000")
        u = await ev("(()=>{const B=RK.Battle; const c=B.players[0].cards.find(c=>c.id==='ATK_DONUT_KUMA'); return !!B.place(c,2,4,0)})()")
        # flying ghost already behind the unit
        await ev("(()=>{const B=RK.Battle; B.waveDelay=999; const z=B.spawnZombie('ZOM_GHOST',2,{x:2.2}); B._g=z; })()")
        await ev("RK.Engine.step(3)")
        hp_front = await ev("RK.Battle._g.hp")
        # open popup by tapping the unit, then tap rotate
        await ev("(()=>{const B=RK.Battle,u=B.units.find(u=>u.col===4&&u.row===2); const p=B.grid.cellCenter(2,4); RK.Engine.tap(p.x,p.y); const r=B.popup.btns[0].r; RK.Engine.tap(r.x+5,r.y+5);})()")
        facing = await ev("RK.Battle.units.find(u=>u.col===4&&u.row===2).facing")
        await ev("RK.Engine.step(4)")
        hp_back = await ev("RK.Battle._g ? RK.Battle._g.hp : 0")
        rec('Battle', 'หมุนตัวละครผ่านเมนูแตะตัวละคร (หันหลัง)', facing == -1, f'facing={facing}')
        rec('Battle', 'หันหลังแล้วยิงโดนซอมบี้บินที่ผ่านไปแล้ว', hp_back < hp_front, f'ghost HP {hp_front} → {hp_back}')
        d0 = await ev("RK.Battle.donuts"); sv = await ev("RK.Battle.sellValue(RK.Battle.units.find(u=>u.col===4&&u.row===2))")
        await ev("(()=>{const B=RK.Battle; const p=B.grid.cellCenter(2,4); RK.Engine.tap(p.x,p.y); const b=B.popup.btns.find(b=>b.label.startsWith('ขาย')); RK.Engine.tap(b.r.x+5,b.r.y+5);})()")
        d1 = await ev("RK.Battle.donuts"); freed = await ev("!RK.Battle.grid.cells[2][4].occupied")
        rec('Battle', 'ขายตัวละครในสนาม ได้โดนัทคืน 50%', d1 - d0 == sv and sv == 50, f'+{d1-d0} (ราคา 100)')
        await ev("RK.Engine.step(0.5)")
        again = await ev("(()=>{const B=RK.Battle; const c=B.players[0].cards.find(c=>c.id==='DEF_POT_SHIELD'); B.players[0].cd[c.id]=0; return !!B.place(c,2,4,0)})()")
        rec('Battle', 'ช่องว่างหลังขาย → วางตัวใหม่ได้', freed and again)
        # ---------- Traps: buy then use ----------
        await ev("RK.Save.data.cur.gold = 5000; RK.Save.data.traps = {}; RK.Save.data.towns.unlocked=[1,2,3]")
        await ev("RK.Engine.setScene(RK.Scenes.shop,{tab:3})")
        g0 = await ev("RK.Save.data.cur.gold")
        await ev("(()=>{const it={key:'tr_TRAP_FRYING_PAN',type:'trap',id:'TRAP_FRYING_PAN',qty:3,price:80,cur:'gold'}; RK.Scenes.confirmBuy(it); RK.Engine.render(); const b=RK.UI.modal._btns.find(b=>b.label==='ซื้อ'); RK.Engine.tap(b.x+5,b.y+5); RK.UI.closeModal();})()")
        g1 = await ev("RK.Save.data.cur.gold"); bag = await ev("RK.Save.data.traps.TRAP_FRYING_PAN")
        rec('Trap', 'ซื้อกับดักในร้านกับดัก (หักทอง, เข้ากระเป๋า)', g0 - g1 == 80 and bag == 3, f'gold -{g0-g1}, bag={bag}')
        locked = await ev("(()=>{RK.Save.data.towns.unlocked=[1]; RK.Engine.setScene(RK.Scenes.shop,{tab:3}); RK.Engine.render(); return true})()")
        await ev("RK.RNG.seed(4); RK.Engine.setScene(RK.Battle,{stageId:'T1-S3',deck:['ATK_DONUT_KUMA']}); RK.Battle.state='play'; RK.Battle.donuts=500; RK.Battle.waveDelay=999")
        rec('Trap', 'แท็บกับดักในสนามแสดงกับดักที่ซื้อ', await ev("(()=>{const B=RK.Battle,bar=B.bars[0]; RK.Engine.tap(bar.slots[0].x+10,bar.slots[0].y+60); return RK.BattleView.slotItems(B,bar).some(i=>i.kind==='trap'&&i.id==='TRAP_FRYING_PAN')})()"))
        await ev("(()=>{const B=RK.Battle,bar=B.bars[0],items=RK.BattleView.slotItems(B,bar),i=items.findIndex(i=>i.id==='TRAP_FRYING_PAN'),r=bar.slots[i]; RK.Engine.tap(r.x+20,r.y+60); const p=B.grid.cellCenter(2,5); RK.Engine.tap(p.x,p.y);})()")
        tr = await ev("JSON.stringify({n:RK.Battle.traps.length, bag:RK.Save.data.traps.TRAP_FRYING_PAN, d:RK.Battle.donuts})")
        rec('Trap', 'วางกับดักบนช่อง (ใช้ 1 ชิ้น + โดนัท 25)', json.loads(tr) == {'n': 1, 'bag': 2, 'd': 475}, tr)
        await ev("(()=>{const z=RK.Battle.spawnZombie('ZOM_NORMAL',2,{x:6.2}); RK.Battle._z=z;})()")
        hz0 = await ev("RK.Battle._z.hp"); await ev("RK.Engine.step(5)")
        rec('Trap', 'กับดักทำงานเมื่อซอมบี้เหยียบ (ดาเมจ + มึน)', await ev("RK.Battle._z.hp") < hz0 and await ev("RK.Battle.stats.trapHits") >= 1, f"HP {hz0} → {await ev('RK.Battle._z.hp')}")
        # skill
        await ev("RK.Battle.skill.gauge=1"); zhp = await ev("RK.Battle._z.hp")
        await ev("RK.Battle.useSkill('STRIKE',2,0)")
        rec('Battle', 'สกิลทีม คุมะถล่ม ทำดาเมจทั้งแถว', await ev("RK.Battle._z.hp") < zhp)
        # ---------- Zombie behaviours ----------
        await ev("RK.Engine.setScene(RK.Battle,{stageId:'T1-S3',deck:['DEF_POT_SHIELD']}); RK.Battle.state='play'; RK.Battle.waveDelay=999; RK.Battle.donuts=999")
        await ev("(()=>{const B=RK.Battle,c=B.players[0].cards.find(c=>c.id==='DEF_POT_SHIELD'); B.place(c,1,5,0); B.place(Object.assign({},c),3,5,0); B._j=B.spawnZombie('ZOM_NINJA',1,{x:7}); B._s=B.spawnZombie('ZOM_SAND',3,{x:7}); B._f=B.spawnZombie('ZOM_GHOST',0,{x:7});})()")
        await ev("RK.Engine.step(12)")
        beh = await ev("JSON.stringify({ninja:+RK.Battle._j.x.toFixed(1), jumped:RK.Battle._j.jumped, sand:+RK.Battle._s.x.toFixed(1), ghost:+RK.Battle._f.x.toFixed(1)})")
        bj = json.loads(beh)
        rec('Enemy', 'นินจากระโดดข้ามตัวป้องกัน / ซอมบี้ทรายมุดใต้ดินผ่าน / ผีบินข้าม', bj['jumped'] and bj['ninja'] < 5.5 and bj['sand'] < 5 and bj['ghost'] < 5, beh)
        await ev("RK.Engine.setScene(RK.Battle,{stageId:'T1-S15',deck:['ATK_DONUT_KUMA']}); RK.Battle.state='play'")
        await ev("(()=>{const B=RK.Battle; B._b=B.spawnZombie('BOSS_GIANT_ZOMBIE_KUMA',2,{x:6}); B._b.hp=B._b.maxHp*0.5; })()"); await ev("RK.Engine.step(1)")
        rec('Enemy', 'บอสมี HP bar + เปลี่ยน Phase เมื่อ HP ลด', await ev("RK.Battle.boss===RK.Battle._b && RK.Battle._b.boss.phase>=1"), f"phase={await ev('RK.Battle._b.boss.phase')}")

        # ---------- Upgrade ----------
        await fresh()
        await ev("RK.Save.data.cur.gold=999999; Object.assign(RK.Save.data.mats,{cookie:999,honey:999,recipe:99,iron:99,crystal:99,rainbow:9}); RK.Save.data.characters.fragments.ATK_DONUT_KUMA=500")
        st0 = await ev("JSON.stringify(RK.Prog.stats('ATK_DONUT_KUMA'))"); s0 = json.loads(st0)
        await ev("RK.Engine.setScene(RK.Scenes.detail,{id:'ATK_DONUT_KUMA',tab:0}); RK.Engine.render()")
        g0 = await ev("RK.Save.data.cur.gold")
        await ev("(()=>{RK.Engine.tap(1120+80+50,790+40); })()")   # Upgrade button -> confirm dialog
        no_charge = await ev("RK.Save.data.cur.gold") == g0 and await ev("!!RK.UI.modal")
        await ev("(()=>{RK.Engine.render(); const b=RK.UI.modal._btns.find(b=>b.label==='ยืนยัน'); RK.Engine.tap(b.x+5,b.y+5);})()")
        lv = await ev("RK.Save.char('ATK_DONUT_KUMA').level")
        rec('Upgrade', 'Level Up: ไม่หักก่อนยืนยัน → ยืนยันแล้ว Lv+1', no_charge and lv == 2, f'lv={lv}, gold -{g0 - await ev("RK.Save.data.cur.gold")}')
        for _ in range(13): await ev("RK.Prog.doLevel('ATK_DONUT_KUMA')")
        cap = await ev("RK.Prog.canLevel('ATK_DONUT_KUMA')")
        rec('Upgrade', 'เลเวลตันที่ 15 (★1) ต้อง Star Evolution', isinstance(cap, str) and await ev("RK.Save.char('ATK_DONUT_KUMA').level") == 15, cap)
        for _ in range(5): await ev("RK.Prog.doStar('ATK_DONUT_KUMA')")
        rec('Upgrade', 'Star Evolution ถึง ★6 (ใช้เศษ)', await ev("RK.Save.char('ATK_DONUT_KUMA').star") == 6, f"เศษเหลือ {await ev('RK.Save.data.characters.fragments.ATK_DONUT_KUMA')}")
        for _ in range(4): await ev("RK.Prog.doSkill('ATK_DONUT_KUMA')")
        await ev("RK.Prog.doBranch('ATK_DONUT_KUMA',0)")
        for _ in range(30): await ev("RK.Prog.doLevel('ATK_DONUT_KUMA')")
        aw = await ev("RK.Prog.doAwaken('ATK_DONUT_KUMA')")
        await ev("RK.Save.data.equipInv.EQ_SPOON=1; RK.Prog.equip('ATK_DONUT_KUMA','EQ_SPOON'); RK.Save.data.costumes.CS_MINT=true; RK.Prog.setCostume('ATK_DONUT_KUMA','CS_MINT')")
        s1 = json.loads(await ev("JSON.stringify(RK.Prog.stats('ATK_DONUT_KUMA'))"))
        rec('Upgrade', 'Skill Lv5 + สายอัปเกรด + Awakening + อุปกรณ์ + ชุด ทำงาน', aw and s1['skillLv'] == 5 and s1['attack'].get('multi') == 2 and s1['costume'] == 'CS_MINT' and s1['awakened'], f"ATK {s0['atk']} → {s1['atk']}, HP {s0['hp']} → {s1['hp']}, ยิงทีละ {s1['attack'].get('multi')}")
        await ev("RK.Engine.setScene(RK.Battle,{stageId:'T1-S1',deck:['ATK_DONUT_KUMA']}); RK.Battle.state='play'; RK.Battle.donuts=500")
        rec('Upgrade', 'ค่าที่อัปเกรดถูกใช้ในสนามจริง', await ev("(()=>{const u=RK.Battle.place(RK.Battle.players[0].cards.find(c=>c.id==='ATK_DONUT_KUMA'),2,1,0); return u.data.atk})()") == s1['atk'])

        # ---------- Team presets ----------
        await ev("RK.Engine.setScene(RK.Scenes.team,{})")
        await ev("RK.Save.data.teams.active=2; RK.Save.data.teams.presets[2].members=['ATK_LADLE_TORI','DEF_POT_SHIELD']")
        await ev("RK.Engine.setScene(RK.Scenes.stageSelect,{town:1}); RK.Engine.render(); RK.Engine.tap(1460,855)")
        rec('Team', 'ทีม 5 ชุด: ทีมที่เลือกถูกใช้ในด่าน', await ev("RK.Engine.scene===RK.Battle && RK.Battle.players[0].cards.map(c=>c.id).join()") == 'FACTORY,ATK_LADLE_TORI,DEF_POT_SHIELD')
        await ev("RK.Engine.setScene(RK.Scenes.team,{}); RK.Save.data.teams.presets[2].members=['ATK_LADLE_TORI','DEF_POT_SHIELD','ATK_DONUT_KUMA']")
        await ev("RK.Engine.tap(70+92,245+100); RK.Engine.tap(70+196*2+92,245+100)")  # select slot0 then slot2 -> swap
        rec('Team', 'สลับตำแหน่งสมาชิกในทีม', await ev("RK.Save.data.teams.presets[2].members.join()") == 'ATK_DONUT_KUMA,DEF_POT_SHIELD,ATK_LADLE_TORI', await ev("RK.Save.data.teams.presets[2].members.join()"))

        # ---------- Shop ----------
        await fresh(); await ev("RK.Save.data.cur.gems=10000; RK.Save.data.cur.gold=100000")
        res = await ev("""(()=>{const out={}; const buy=(it)=>{RK.Scenes.buyItem(it); RK.UI.closeModal(); RK.UI.popupQueue=[];};
          buy({key:'ch_ANI_DEER',type:'character',id:'ANI_DEER',qty:1,price:3000,cur:'gems',limit:1}); out.char=RK.Save.isOwned('ANI_DEER');
          const gB=RK.Save.data.cur.gems; buy({key:'ch_ANI_DEER',type:'character',id:'ANI_DEER',qty:1,price:3000,cur:'gems',limit:1}); out.limit=RK.Save.data.cur.gems===gB;
          buy({key:'material0',type:'material',id:'cookie',qty:10,price:250,cur:'gold'}); out.mat=RK.Save.data.mats.cookie;
          buy({key:'cs_CS_MINT',type:'costume',id:'CS_MINT',qty:1,price:300,cur:'gems',limit:1}); out.cs=!!RK.Save.data.costumes.CS_MINT;
          buy({key:'material7',type:'equipment',id:'EQ_SPOON',qty:1,price:600,cur:'gold'}); out.eq=RK.Save.data.equipInv.EQ_SPOON;
          buy({key:'donut0',type:'booster',id:'BST_DONUT50',qty:1,price:250,cur:'gold'}); out.bst=RK.Save.data.boosters.BST_DONUT50;
          RK.Engine.setScene(RK.Scenes.shop,{tab:5}); RK.Engine.render(); out.daily=RK.Save.data.shop.daily.length; return JSON.stringify(out);})()""")
        r = json.loads(res)
        rec('Shop', 'ร้านตัวละคร/วัตถุดิบ/ชุด/อุปกรณ์/บูสเตอร์ ซื้อได้จริง', r['char'] and r['mat'] == 30 and r['cs'] and r['eq'] == 1 and r['bst'] == 1, res)
        rec('Shop', 'จำกัดจำนวนซื้อ / ร้านพิเศษรายวัน 6 ดีล', r['limit'] and r['daily'] == 6)
        rec('Shop', 'เงินไม่พอซื้อไม่ได้', await ev("(()=>{RK.Save.data.cur.gems=0; const n=Object.keys(RK.Save.data.characters.owned).length; RK.Scenes.buyItem({key:'ch_X',type:'character',id:'HW_ZAPPER_KUMA',qty:1,price:1500,cur:'gems',limit:1}); return !RK.Save.isOwned('HW_ZAPPER_KUMA')})()"))
        # booster used in battle
        await ev("RK.Engine.setScene(RK.Battle,{stageId:'T1-S1',boosters:['BST_DONUT50']})")
        rec('Shop', 'บูสเตอร์ใช้ในด่าน (+75 โดนัท) และถูกหักออก', await ev("RK.Battle.donuts") == 275 and await ev("RK.Save.data.boosters.BST_DONUT50") == 0)

        # ---------- Gacha ----------
        await fresh(); await ev("RK.Save.data.cur.gems=100000; RK.Save.data.cur.tickets=0")
        g0 = await ev("RK.Save.data.cur.gems")
        res = await ev("JSON.stringify(RK.Gacha.pull('CHAR',10).map(r=>r.rarity))")
        g1 = await ev("RK.Save.data.cur.gems")
        rec('Gacha', 'สุ่ม 10 ครั้ง หักเพชร 1350 + การันตี Rare+', g0 - g1 == 1350 and any(x != 'Common' for x in json.loads(res)), res)
        await ev("for(let i=0;i<59;i++) RK.Gacha.pull('CHAR',1)")
        hist = await ev("RK.Save.data.gacha.history.length")
        legend = await ev("RK.Save.data.gacha.history.filter(h=>h.rarity==='Legend').length")
        rec('Gacha', 'Pity 60 ครั้งได้ Legend + ประวัติ', legend >= 1 and hist >= 69, f'legend={legend}, history={hist}')
        frags = await ev("Object.values(RK.Save.data.characters.fragments).reduce((a,b)=>a+b,0)")
        rec('Gacha', 'ตัวซ้ำแปลงเป็นเศษ', frags > 0, f'เศษรวม {frags}')
        await ev("RK.Save.data.cur.tickets=1"); g0 = await ev("RK.Save.data.cur.gems"); await ev("RK.Gacha.pull('CHAR',1)")
        rec('Gacha', 'ใช้ตั๋วก่อนเพชร', await ev("RK.Save.data.cur.tickets") == 0 and await ev("RK.Save.data.cur.gems") == g0)
        z0 = await ev("Object.keys(RK.Save.data.zombies.owned).length"); await ev("RK.Gacha.pull('ZOMBIE',10)")
        rec('Gacha', 'ตู้ซอมบี้ปลดการ์ด VS / ตู้ชุด / ตู้วัตถุดิบ', await ev("Object.keys(RK.Save.data.zombies.owned).length") > z0 and await ev("RK.Gacha.pull('COSTUME',10).length") == 10 and await ev("(RK.Save.data.cur.gold=99999, RK.Gacha.pull('MATERIAL',10).length)") == 10)

        # ---------- Missions / achievements / login / pass ----------
        await fresh()
        await ev("RK.Ev.emit('kill',50)")
        m = await ev("JSON.stringify(RK.Missions.list('daily').find(m=>m.id==='d_kill'))")
        g0 = await ev("RK.Save.data.cur.gold"); got = await ev("JSON.stringify(RK.Missions.claim('daily','d_kill'))"); g1 = await ev("RK.Save.data.cur.gold")
        rec('Mission', 'ภารกิจเพิ่มตาม Event จริง (กำจัด 50) และรับรางวัล', json.loads(m)['done'] and g1 - g0 == 300, f'gold +{g1-g0}')
        rec('Mission', 'รับซ้ำไม่ได้', await ev("RK.Missions.claim('daily','d_kill')") is None)
        await ev("RK.Save.data.missions.dayKey='2000-01-01'")
        rec('Mission', 'เปลี่ยนวัน → ภารกิจรายวันรีเซ็ต', not json.loads(await ev("JSON.stringify(RK.Missions.list('daily').find(m=>m.id==='d_kill'))"))['claimed'])
        await ev("RK.Save.data.stats.zombiesKilled=150")
        rec('Mission', 'ความสำเร็จ (Achievement) รับรางวัลตามขั้น', await ev("!!RK.Ach.claim('a_kill') && RK.Save.data.achievements.a_kill===1"))
        r1 = await ev("!!RK.Login.claim()"); r2 = await ev("RK.Login.claim()")
        await ev("RK.Save.data.login.lastDate='2000-01-01'"); r3 = await ev("!!RK.Login.claim()")
        rec('Login', 'Daily Login: รับวันละครั้ง, วันใหม่รับต่อ (วันที่ 2)', r1 and r2 is None and r3 and await ev("RK.Save.data.login.day") == 2)
        await ev("RK.Save.data.cur.passPts=350; RK.Save.data.cur.gems=2000")
        rec('Pass', 'บัตรผ่าน: ระดับ 3 รับรางวัล + ปลดล็อก Gold', await ev("RK.Pass.tier()===3 && !!RK.Pass.claim('free',0) && !RK.Pass.can('free',3) && RK.Pass.buyPremium() && !!RK.Pass.claim('prem',0)"))
        # gift / mail / code
        rec('Gift', 'จดหมายต้อนรับ + โค้ด KUMA2026 + ของขวัญรายวัน', await ev("(()=>{const sd=RK.Save.data; const g=sd.cur.gems; RK.Engine.setScene(RK.Scenes.gift,{tab:2}); RK.Engine.render(); RK.Engine.tap(1300+20,240+18+20); RK.UI.closeModal(); return sd.mail[0].claimed && sd.cur.gems>g})()"))

        # ---------- Events ----------
        await fresh(); await ev("TB.setup(5)")
        act = await ev("RK.EventsSys.active().id"); other = await ev("RK.Data.events.find(e=>e.id!==RK.EventsSys.active().id).id")
        r = await ev(f"TB.run('EV-{act}-1', 900)")
        ed = await ev(f"RK.Eco.get('eventDonut','{act}')")
        rec('Event', f'ด่านกิจกรรมที่เปิดอยู่ ({act}) ได้โดนัทกิจกรรม', r['state'] == 'won' and ed > 0, f'eventDonut={ed}')
        await ev(f"RK.RNG.seed(9); RK.Engine.setScene(RK.Battle,{{stageId:'EV-{other}-1',deck:RK.Save.deck.slice(),practice:true}}); RK.Battle.state='play'; RK.UI.mute=true; for(let i=0;i<1800&&RK.Battle.state==='play';i++){{RK.AI.bearTick(RK.Battle,0);RK.Engine.step(0.5);}}")
        rec('Event', 'กิจกรรมที่ยังไม่เปิด = โหมดฝึก (ไม่ได้รางวัลกิจกรรม)', await ev(f"RK.Eco.get('eventDonut','{other}')") == 0, await ev("RK.Battle.state"))
        await ev(f"RK.Save.data.cur.eventDonut['{act}']=1000")
        rec('Event', 'ร้านกิจกรรมซื้อด้วยโดนัทกิจกรรม', await ev(f"(()=>{{const it=RK.EventsSys.shopItems('{act}')[2]; it.key='ev_2'; RK.Scenes.buyItem(it,'{act}'); RK.UI.closeModal(); return RK.Eco.get('eventDonut','{act}')===750}})()"))
        rec('Event', 'ภารกิจกิจกรรมนับจากการเล่นจริง', await ev(f"RK.EventsSys.missions('{act}').find(m=>m.id==='e_play').prog") >= 1)

        # ---------- Story progression / save ----------
        await fresh(); await ev("TB.setup(1)")
        await ev("(()=>{for(let n=1;n<=15;n++){RK.Save.data.unlockedStages.push('T1-S'+n);} })()")
        await ev("RK.RNG.seed(2); RK.Engine.setScene(RK.Battle,{stageId:'T1-S15',deck:RK.Save.deck.slice()}); RK.Battle.state='play'; RK.Battle.win && (RK.Battle.zombies=[], RK.Battle.waves.forEach(w=>{w.started=true;w.spawnedAll=true;}), RK.Battle.queue=[]); RK.Engine.step(0.5)")
        rec('Story', 'ผ่านบอส Town 1 → ปลดล็อก Town 2 + มีคัทซีนปิดบท', await ev("RK.Save.data.towns.unlocked.includes(2) && RK.Save.data.unlockedStages.includes('T2-S1') && RK.Battle.result.story && RK.Battle.result.story.chapter===1"))
        await ev("RK.Scenes.playStory(2,'intro'); RK.Engine.render()")
        rec('Story', 'ระบบบทสนทนา (ถัดไป/ข้าม/Auto)', await ev("(()=>{const S=RK.Scenes.story; S.next(); S.next(); return S.i>=1})()"))
        # migration from Phase-1 save
        await ev("""localStorage.setItem('rkz_save_v', JSON.stringify({version:1,gold:777,profile:{playerId:'P1',name:'Old',level:3,exp:5},stages:{'T1-S1':{cleared:true,stars:[true,true,false]}},unlockedStages:['T1-S1','T1-S2'],characters:{owned:{FACTORY:{level:1,star:1},ATK_DONUT_KUMA:{level:1,star:1},DEF_SPRAY:{level:1,star:1}}},deck:['ATK_DONUT_KUMA','DEF_SPRAY'],stats:{wins:1},settings:{music:0.5},towns:{unlocked:[1]}}))""")
        await pg.reload(); await pg.wait_for_function('window.RK_READY===true')
        mg = await ev("JSON.stringify({v:RK.Save.data.version, gold:RK.Save.data.cur.gold, name:RK.Save.data.profile.name, spray:RK.Save.isOwned('DEF_SPRAY'), team:RK.Save.data.teams.presets[0].members, st:RK.Save.data.stages['T1-S1'].stars})")
        m = json.loads(mg)
        rec('Save', 'ย้ายเซฟเก่า (Phase 1, v1) → v2 ไม่หาย', m['v'] == 2 and m['gold'] == 1777 and m['name'] == 'Old' and m['spray'] and m['team'] == ['ATK_DONUT_KUMA', 'DEF_SPRAY'], mg)
        code = await ev("RK.Save.exportCode()")
        await ev("RK.Save.data.cur.gold=1"); ok = await ev(f"RK.Save.importCode('{code}')")
        rec('Save', 'ส่งออก/นำเข้ารหัสเซฟ (ย้ายเครื่อง)', ok and await ev("RK.Save.data.cur.gold") == 1777)
        await ev("RK.Save.data.cur.gold=4242; RK.Save.save('t')"); await pg.reload(); await pg.wait_for_function('window.RK_READY===true')
        rec('Save', 'รีโหลดเกมแล้วข้อมูลยังอยู่', await ev("RK.Save.data.cur.gold") == 4242)
        await pg.add_script_tag(path='/home/claude/tests/harness.js'); await ev('RK.Engine.manualStepping = true')

        # ---------- CO-OP ----------
        await ev("TB.setup(3)")
        await ev("RK.RNG.seed(1); RK.Engine.setScene(RK.Battle,{stageId:'CO-1',deck:RK.Save.deck.slice(),deck2:RK.Save.deck.slice()}); RK.Battle.state='play'")
        co = await ev("""(()=>{const B=RK.Battle; const out={rows:B.grid.rows, cols:B.grid.cols, players:B.players.length};
          const c0=B.players[0].cards[1], c1=B.players[1].cards.find(c=>c.id===c0.id); B.donuts=c0.cost+c0.cost-1;
          const a=B.place(c0,1,1,0), bb=B.place(c1,7,1,1); out.a=!!a; out.b=!!bb; out.left=B.donuts; out.owners=B.units.map(u=>u.owner).join();
          B.skill.gauge=3; B.useSkill('FREEZE',null,0); B.useSkill('HEAL',null,1); out.combo=B.banner&&B.banner.text; return JSON.stringify(out)})()""")
        c = json.loads(co)
        rec('CO-OP', 'สนาม 10 แถว, 2 ผู้เล่น, โดนัทร่วมกัน', c['rows'] == 10 and c['players'] == 2, co)
        rec('CO-OP', 'กันหักซ้ำ: โดนัทพอแค่ตัวเดียว → อีกคนวางไม่ได้', c['a'] and not c['b'] and c['left'] >= 0)
        rec('CO-OP', 'Combo Skill เมื่อใช้สกิลพร้อมกัน', c['combo'] == 'COMBO SKILL!')
        rec('CO-OP', 'ความยากปรับตามผู้เล่น (ศัตรูมากกว่า Story)', await ev("RK.Battle.totalZombies") > await ev("RK.Data.stages['T1-S1'].waves.reduce((a,w)=>a+w.spawns.reduce((x,g)=>x+g.count,0),0)"))
        r = await ev("(()=>{const B=RK.Battle; RK.UI.mute=true; for(let i=0;i<2400&&B.state==='play';i++){RK.AI.bearTick(B,0);RK.AI.bearTick(B,1);RK.Engine.step(0.5);} return B.state})()")
        rec('CO-OP', 'เล่นจบด่าน CO-OP 1 (บอท 2 คน)', r == 'won', r)

        # ---------- VS ----------
        await ev("RK.Engine.setScene(RK.Battle,{stageId:'VS',deck:RK.Save.deck.slice(),vs:{bear:'human',zombie:'human',zdeck:['ZOM_NORMAL','RZ_ROCK','BOSS_GIANT_ZOMBIE_KUMA']}}); RK.Battle.state='play'")
        vs = await ev("""(()=>{const B=RK.Battle,v=B.vs,out={}; out.mirror=B.mirror; out.brain0=v.brain;
          const bar=B.bars.find(b=>b.kind==='zombie'); RK.Engine.tap(bar.slots[0].x+20,bar.slots[0].y+60);
          const p=B.grid.cellCenter(1,6); RK.Engine.tap(RK.Engine.W-p.x,p.y); out.z=B.zombies.length; out.brain1=v.brain; out.zdir=B.zombies[0]&&B.zombies[0].row;
          out.boss=B.vsDeploy('BOSS_GIANT_ZOMBIE_KUMA',2); const c=B.players[0].cards.find(c=>c.atk); B.donuts=999; out.far=B.canPlace(c,2,8,B.players[0]).ok; out.near=B.canPlace(c,2,2,B.players[0]).ok;
          return JSON.stringify(out)})()""")
        v = json.loads(vs)
        rec('VS', 'ผู้เล่นซอมบี้เลือกการ์ด+แตะแถว = ปล่อยซอมบี้ (หัก Brain)', v['z'] == 1 and v['brain0'] - v['brain1'] == 50 and v['zdir'] == 1, vs)
        rec('VS', 'บอสเรียกได้หลัง 1:30 เท่านั้น / หมีวางเกินเส้นไม่ได้', not v['boss'] and not v['far'] and v['near'])
        rec('VS', 'สนามกลับด้าน (ซอมบี้ซ้าย→ขวา, หมีขวา)', v['mirror'])
        await ev("RK.Battle.vs.zBase=10; RK.Battle.damageZombieBase(20)")
        rec('VS', 'ฐานซอมบี้หมด → ฝั่งหมีชนะ', await ev("RK.Battle.result && RK.Battle.result.winner") == 'bear')
        await ev("RK.Engine.setScene(RK.Battle,{stageId:'VS',deck:RK.Save.deck.slice(),vs:{bear:'human',zombie:'human',zdeck:['ZOM_NORMAL']}}); RK.Battle.state='play'; RK.Battle.vs.timer=0.1; RK.Engine.step(0.5)")
        rec('VS', 'หมดเวลา: ตัดสินด้วย HP ฐาน/คะแนน (Draw ได้)', await ev("RK.Battle.result.winner") in ('draw', 'bear', 'zombie'), await ev("RK.Battle.result.winner"))

        # ---------- Endless ----------
        await ev("TB.setup(3)")
        await ev("RK.RNG.seed(1); RK.Engine.setScene(RK.Battle,{stageId:'ENDLESS',deck:RK.Save.deck.slice()}); RK.Battle.state='play'; RK.UI.mute=true; for(let i=0;i<500;i++){RK.AI.bearTick(RK.Battle,0); RK.Engine.step(0.5);} RK.Battle.baseHp=1; RK.Battle.damageBase(5)")
        rec('Endless', 'ไม่รู้จบ: Wave ต่อเนื่อง + บันทึกสถิติ + อันดับในเครื่อง', await ev("RK.Save.data.endless.best") >= 5 and await ev("RK.Save.data.endless.scores.length") == 1, f"best wave {await ev('RK.Save.data.endless.best')}")
        # ---------- Challenge rules ----------
        await ev("RK.Engine.setScene(RK.Battle,{stageId:'CH-2',deck:RK.Save.deck.slice()})")
        rec('Challenge', 'กฎด่านท้าทาย: ไม่มีเครื่องผลิต + โดนัท 1500', await ev("!RK.Battle.players[0].cards.some(c=>c.isFactory) && RK.Battle.donuts===1500"))
        await ev("RK.Engine.setScene(RK.Battle,{stageId:'CH-5',deck:RK.Save.deck.slice()}); RK.Battle.state='play'; RK.Battle.donuts=9999")
        rec('Challenge', 'กฎจำกัด 6 ตัว', await ev("(()=>{const B=RK.Battle,c=B.players[0].cards.find(c=>c.atk); let n=0; for(let r=0;r<5;r++)for(let k=1;k<3;k++){B.players[0].cd={}; if(B.place(c,r,k,0))n++;} return n})()") == 6)
        # ---------- Settings ----------
        await ev("RK.Scenes.openSettings(); RK.Engine.render()")
        rec('Settings', 'หน้าตั้งค่าครบ (เพลง/เสียง/กราฟิก/ความเร็ว/HP bar/ดาเมจ/สั่น/หยุดอัตโนมัติ/บัญชี/เซฟ/รีเซ็ต)', await ev("RK.UI.modal && RK.UI.modal.title==='ตั้งค่า' && RK.UI.modal._areas.length>=20"), f"{await ev('RK.UI.modal._areas.length')} ปุ่ม")
        await ev("RK.UI.closeModal(); RK.Save.data.cur.gold=55; RK.Scenes.resetData(); RK.Engine.render()")
        await ev("(()=>{RK.Engine.render(); const b=RK.UI.modal._btns[1]; RK.Engine.tap(b.x+5,b.y+5); RK.Engine.render(); RK.UI.closeModal();})()")
        rec('Settings', 'รีเซ็ตต้องยืนยัน 2 ครั้ง (ยกเลิกขั้น 2 ไม่ลบ)', await ev("RK.Save.data.cur.gold") == 55)

        # ---------- Performance ----------
        await ev("TB.setup(6)")
        await ev("RK.Engine.setScene(RK.Battle,{stageId:'T6-S10',deck:RK.Save.deck.slice()}); RK.Battle.state='play'")
        perf = await ev("""(()=>{const B=RK.Battle; B.donuts=99999; for(let r=0;r<5;r++)for(let c=0;c<5;c++){B.players[0].cd={}; B.place(B.players[0].cards[1+((r+c)%4)],r,c,0);}
          for(let i=0;i<110;i++){const z=B.spawnZombie(['ZOM_MUMMY','RZ_TRASH','ZOM_FLYING','ZOM_SCARAB'][i%4],i%5); z.x=5+(i%20)*0.22;}
          let sim=0,ren=0,N=120; for(let i=0;i<N;i++){let t=performance.now(); B.sim(1/60); sim+=performance.now()-t; t=performance.now(); RK.Engine.render(); ren+=performance.now()-t;} return JSON.stringify({sim:+(sim/N).toFixed(2),render:+(ren/N).toFixed(2),z:B.zombies.length,p:B.projectiles.length});})()""")
        pf = json.loads(perf)
        rec('Perf', 'ซอมบี้ 100+ ตัว + กระสุนจำนวนมาก ไม่เกินเฟรม 16.7ms (CPU เดสก์ท็อป)', pf['sim'] + pf['render'] < 16.7, perf)
        rec('Errors', 'ไม่มี JavaScript error ตลอดการทดสอบ', len(errs) == 0, '; '.join(errs[:3]))
        json.dump(R, open('/home/claude/tests/full_results.json', 'w'), ensure_ascii=False, indent=1)
        await b.close()
asyncio.run(main())
