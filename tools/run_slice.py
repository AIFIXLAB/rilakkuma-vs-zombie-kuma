import sys,os,json
sys.path.insert(0,'/home/claude/tools')
from gridslice import grid_slice
from PIL import Image, ImageDraw
S='/home/claude/work/src'; O='/home/claude/work/sliced'; os.makedirs(O,exist_ok=True)
jobs=[('a01',4,2,None),('a03',4,2,None),('a12',3,2,None),('a13',3,2,None),('a18',3,2,None),('a21',4,2,None),('a28',4,2,None),
      ('a06',8,6,None),('a10',8,6,None),('a02',9,4,(0,0,1536,778)),('a02b',6,1,(0,770,1536,1024))]
info={}
for name,c,r,reg in jobs:
    src=name[:3]
    cells=grid_slice(f'{S}/{src}.png',c,r,reg)
    for k,cell in enumerate(cells):
        if cell is None: print('EMPTY',name,k); continue
        fn=f'{name}_{k:02d}.png'; cell['img'].save(f'{O}/{fn}'); info[fn]=[int(v) for v in cell['box']]
json.dump(info,open(f'{O}/_boxes.json','w'))
# contact sheets per sheet
for name,c,r,reg in jobs:
    fs=sorted(f for f in os.listdir(O) if f.startswith(name+'_'))
    T=170; sheet=Image.new('RGB',(T*min(len(fs),9),(T+16)*((len(fs)+8)//9)),(255,0,255)); d=ImageDraw.Draw(sheet)
    for i,f in enumerate(fs):
        im=Image.open(f'{O}/{f}'); im.thumbnail((T-6,T-6)); x,y=(i%9)*T,(i//9)*(T+16)
        sheet.paste(im,(x+3,y+3),im); d.text((x+3,y+T),f[:-4],fill='white')
    sheet.save(f'/home/claude/work/thumb/sl_{name}.jpg',quality=80)
print(len(info))
