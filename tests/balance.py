import asyncio, json, sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width':1180,'height':820})
        await pg.goto('http://localhost:8765/index.html'); await pg.evaluate('localStorage.clear()'); await pg.reload()
        await pg.wait_for_function('window.RK_READY===true'); await pg.add_script_tag(path='/home/claude/tests/bot.js')
        ev=pg.evaluate; await ev('RK.Engine.manualStepping=true')
        seeds=[int(s) for s in sys.argv[1:]] or [12345]
        for sid in ['T1-S1','T1-S2','T1-S3','T1-S4','T1-S5']:
            out=[]
            for sd in seeds:
                await ev("RK.Save.data.deck = ['ATK_DONUT_KUMA','ATK_DONUT_KORI','ATK_UMBRELLA_PANDA','ATK_DONUT_CANNON','ATK_CHOCO_KUMA','DEF_POT_SHIELD','DEF_CARDBOARD','DEF_LAUNDRY_PANDA','ATK_GOGGLE_CAT','DEF_SPRAY','ATK_LADLE_TORI'].filter(i=>RK.Save.isOwned(i)).slice(0,8)")
                await ev(f"RK.Engine.setScene(RK.Battle,{{stageId:'{sid}',deck:RK.Save.data.deck.slice()}}); RK.RNG.seed({sd}); RK.Battle.state='play'")
                r=await ev('T.runBot(700)')
                out.append(f"{r['state'][0]} t{r['t']:.0f} base{await ev('RK.Battle.baseHp')} lost{await ev('RK.Battle.stats.unitsLost')} placed{await ev('RK.Battle.stats.unitsPlaced')}")
            # grant unlocks so later stages are tested with the intended roster
            await ev(f"RK.Data.stages['{sid}'].reward.unlock.forEach(id=>RK.Save.unlockCharacter(id))")
            print(sid, ' | '.join(out))
        await b.close()
asyncio.run(main())
