import asyncio, base64, struct
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox','--autoplay-policy=no-user-gesture-required'])
        pg = await b.new_page(viewport={'width':1180,'height':820}); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('http://localhost:8765/index.html'); await pg.evaluate('localStorage.clear()'); await pg.reload()
        await pg.wait_for_function('window.RK_READY===true')
        # live context test: tap -> music starts, battle moods switch
        await pg.mouse.click(600,400); await pg.wait_for_timeout(1500)
        print('live', await pg.evaluate('JSON.stringify(RK.Music.info())'), await pg.evaluate('RK.Music.ctx.state'))
        # composer uniqueness: 4 songs' first melodies differ
        print('unique', await pg.evaluate("""(()=>{const s=new Set(); for(let i=0;i<20;i++){const c=new RK.Music._Composer('battle'); let sig=''; for(let b=0;b<8;b++) sig+=c.nextBar().events.filter(e=>e.inst==='marimba').map(e=>e.midi).join(','); s.add(sig);} return s.size;})()"""))
        data = await pg.evaluate("""(async()=>{
          const buf = await RK.Music.renderOffline([{mood:'menu',seconds:22},{mood:'battle',seconds:40,ramp:true},{mood:'final',seconds:18},{jingle:'victory',seconds:4}], 32000);
          const L=buf.getChannelData(0), Rr=buf.getChannelData(1), n=L.length; let peak=0;
          const out=new Int16Array(n*2); for(let i=0;i<n;i++){const a=Math.max(-1,Math.min(1,L[i])), c=Math.max(-1,Math.min(1,Rr[i])); peak=Math.max(peak,Math.abs(a)); out[2*i]=a*32767; out[2*i+1]=c*32767;}
          const bytes=new Uint8Array(out.buffer); let s=''; for(let i=0;i<bytes.length;i+=0x8000) s+=String.fromCharCode.apply(null,bytes.subarray(i,i+0x8000));
          return {b64:btoa(s), sr:buf.sampleRate, peak};})()""")
        pcm = base64.b64decode(data['b64']); sr = data['sr']
        hdr = b'RIFF'+struct.pack('<I',36+len(pcm))+b'WAVEfmt '+struct.pack('<IHHIIHH',16,1,2,sr,sr*4,4,16)+b'data'+struct.pack('<I',len(pcm))
        open('/home/claude/tests/music_preview.wav','wb').write(hdr+pcm)
        print('peak', data['peak'], 'seconds', len(pcm)/4/sr, 'errors', errs)
        await b.close()
asyncio.run(main())
