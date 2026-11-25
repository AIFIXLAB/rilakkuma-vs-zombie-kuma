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
        for town, ids in [(3, ['EV-halloween-1','EV-donut-2','CH-1','CH-3','CH-7','CO-1','CO-2']), (5, ['EV-sakura-3','EV-summer-3','CH-2','CH-4','CH-5','CH-6','CO-4']), (7, ['EV-anniversary-4','EV-christmas-4','CH-8','CH-9','CO-6']), (8, ['EV-halloween-5','CH-10','CO-8'])]:
            await ev(f'TB.setup({town})')
            print(f'T{town}-level team:', ' '.join(f"{r['id']}:{'W' if r['state']=='won' else 'L'}{r['base']}" for r in [await ev(f"TB.run('{i}', 1200)") for i in ids]), flush=True)
        await ev('TB.setup(4)')
        r = await ev("TB.run('ENDLESS', 1800)"); print('ENDLESS (T4 team) wave', r['wave'], 'kills', r['kills'], 'best', await ev('RK.Save.data.endless.best'))
        # VS: bear CPU vs zombie CPU, and human-side checks via AI
        for v in ["{bear:'cpu',zombie:'cpu'}"]:
            await ev(f"RK.RNG.seed(5); RK.Engine.setScene(RK.Battle, {{stageId:'VS', deck: RK.Save.deck.slice(), vs: Object.assign({v}, {{zdeck:['ZOM_NORMAL','ZOM_NURSE','ZOM_CONE','ZOM_BUCKET','ZOM_HEAVY','RZ_ROCK','RZ_FARMER','BOSS_GIANT_ZOMBIE_KUMA']}})}}); RK.Battle.state='play'")
            await ev("for(let i=0;i<600 && RK.Battle.state==='play';i++) RK.Engine.step(0.5)")
            print('VS cpu-vs-cpu:', await ev("JSON.stringify({state:RK.Battle.state, winner:RK.Battle.result&&RK.Battle.result.winner, t:Math.round(RK.Battle.t), bear:Math.round(RK.Battle.baseHp), zbase:Math.round(RK.Battle.vs.zBase), boss:RK.Battle.vs.bossUsed, brain:Math.round(RK.Battle.vs.brain)})"))
        print('errors', errs[:5])
        await b.close()
asyncio.run(main())
