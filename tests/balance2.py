import asyncio, sys, json
from playwright.async_api import async_playwright
towns = [int(x) for x in sys.argv[1].split(',')] if len(sys.argv) > 1 else range(1, 9)
stages = sys.argv[2] if len(sys.argv) > 2 else 'all'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width': 800, 'height': 450})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('http://localhost:8765/index.html'); await pg.evaluate('localStorage.clear()'); await pg.reload()
        await pg.wait_for_function('window.RK_READY===true', timeout=60000)
        await pg.add_script_tag(path='/home/claude/tests/harness.js')
        await pg.evaluate('RK.Engine.manualStepping = true')
        res = []
        for t in towns:
            info = await pg.evaluate(f'TB.setup({t})')
            ns = range(1, 16) if stages == 'all' else [int(x) for x in stages.split(',')]
            line = []
            for n in ns:
                r = await pg.evaluate(f"TB.run('T{t}-S{n}', 1200)")
                res.append(r); line.append(f"{n}:{'W' if r['state']=='won' else 'L'}{r['base']}")
            print(f"T{t} lv{info['lv']} ★{info['star']} ", ' '.join(line), flush=True)
        json.dump(res, open('/home/claude/tests/balance2.json', 'w'))
        print('errors', errs[:5])
        await b.close()
asyncio.run(main())
