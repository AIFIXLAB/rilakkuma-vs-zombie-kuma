import sys,os,numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
def blob_slice(path,region,dil,minarea,prefix,O):
    im=Image.open(path).convert('RGBA'); A=np.array(im); x0,y0,x1,y1=region
    s=A[:,:,3]>30; rm=np.zeros_like(s); rm[y0:y1,x0:x1]=True; s&=rm
    lab,n=ndimage.label(ndimage.binary_dilation(s,iterations=dil))
    res=[]
    for i,sl in enumerate(ndimage.find_objects(lab)):
        m=lab[sl]==i+1
        if (m&s[sl]).sum()<minarea: continue
        ys,xs=sl; res.append((ys.start,xs.start,ys,xs,i+1))
    res.sort(key=lambda r:(r[0]//120,r[1]))
    out=[]
    for k,(a,b,ys,xs,i) in enumerate(res):
        crop=A[ys,xs].copy(); crop[lab[ys,xs]!=i]=0
        fn=f'{prefix}_{k:02d}.png'; Image.fromarray(crop).save(f'{O}/{fn}'); out.append((fn,(xs.start,ys.start,xs.stop,ys.stop)))
    return out
if __name__=='__main__':
    O='/home/claude/work/sliced'; S='/home/claude/work/src'
    for f in os.listdir(O):
        if f.startswith('a02b_'): os.remove(f'{O}/{f}')
    for args in [('a02',(0,770,1536,1024),4,3000,'a02b'),('a26',(0,0,1536,1024),5,1500,'a26')]:
        r=blob_slice(f'{S}/{args[0]}.png',args[1],args[2],args[3],args[4],O)
        for x in r: print(x)
