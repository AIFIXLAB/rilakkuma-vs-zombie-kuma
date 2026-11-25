import asyncio, json
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width': 800, 'height': 450})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('http://localhost:8765/index.html'); await pg.evaluate('localStorage.clear()'); await pg.reload()
        await pg.wait_for_function('window.RK_READY===true', timeout=60000)
        await pg.add_script_tag(path='/home/claude/tests/harness.js')
        await pg.evaluate('RK.Engine.manualStepping = true')
        ev = pg.evaluate
        await ev('TB.setup(4)')
        # VS: bear CPU vs zombie CPU, and human-side checks via AI
        for v in ["{bear:'cpu',zombie:'cpu'}"]*4:
            await ev(f"RK.RNG.seed(Math.floor(Math.random()*1e6)); RK.Engine.setScene(RK.Battle, {{stageId:'VS', deck: RK.Save.deck.slice(), vs: Object.assign({v}, {{zdeck:['ZOM_NORMAL','ZOM_NURSE','ZOM_CONE','ZOM_BUCKET','ZOM_HEAVY','RZ_ROCK','RZ_FARMER','BOSS_GIANT_ZOMBIE_KUMA']}})}}); RK.Battle.state='play'")
            await ev("for(let i=0;i<600 && RK.Battle.state==='play';i++) RK.Engine.step(0.5)")
            print('VS cpu-vs-cpu:', await ev("JSON.stringify({state:RK.Battle.state, winner:RK.Battle.result&&RK.Battle.result.winner, t:Math.round(RK.Battle.t), bear:Math.round(RK.Battle.baseHp), zbase:Math.round(RK.Battle.vs.zBase), boss:RK.Battle.vs.bossUsed, brain:Math.round(RK.Battle.vs.brain)})"))
        print('errors', errs[:5])
        await b.close()
asyncio.run(main())
