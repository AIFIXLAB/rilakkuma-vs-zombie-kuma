import numpy as np
from PIL import Image
from scipy import ndimage
def grid_slice(path, cols, rows, region=None, alpha=30, pad=4):
    """Return list of dicts per cell (row-major): {'img':PIL crop,'box':(x0,y0,x1,y1),'comps':[(area,box,mask)]}"""
    im=Image.open(path).convert('RGBA'); A=np.array(im)
    H,W=A.shape[:2]
    x0,y0,x1,y1 = region or (0,0,W,H)
    cw=(x1-x0)/cols; ch=(y1-y0)/rows
    solid=A[:,:,3]>alpha
    rm=np.zeros_like(solid); rm[int(y0):int(y1),int(x0):int(x1)]=True; solid&=rm
    lab,n=ndimage.label(ndimage.binary_dilation(solid,iterations=2))
    owner=np.full((H,W),-1,np.int32)
    yy,xx=np.mgrid[0:H,0:W]
    cellidx=(np.clip(((yy-y0)//ch).astype(int),0,rows-1))*cols+np.clip(((xx-x0)//cw).astype(int),0,cols-1)
    objs=ndimage.find_objects(lab)
    for i,sl in enumerate(objs):
        m=(lab[sl]==i+1)
        ys,xs=sl
        w=xs.stop-xs.start; h=ys.stop-ys.start
        if w<=cw*1.15 and h<=ch*1.15:
            cy,cx=ndimage.center_of_mass(m); cy+=ys.start; cx+=xs.start
            c=min(rows-1,max(0,int((cy-y0)//ch)))*cols+min(cols-1,max(0,int((cx-x0)//cw)))
            owner[sl][m]=c
        else:
            owner[sl][m]=cellidx[sl][m]
    cells=[]
    for c in range(cols*rows):
        m=(owner==c)&solid
        if m.sum()<300: cells.append(None); continue
        ys,xs=np.where(m); bx=(max(0,xs.min()-pad),max(0,ys.min()-pad),min(W,xs.max()+pad+1),min(H,ys.max()+pad+1))
        out=A.copy(); out[~((owner==c))]=0
        crop=Image.fromarray(out[bx[1]:bx[3],bx[0]:bx[2]])
        cells.append({'img':crop,'box':bx,'owner':owner,'cell':c})
    return cells
