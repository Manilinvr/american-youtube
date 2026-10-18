import numpy as np, cv2
KL=set(range(1,40))|{110,111,114,121,128,130,131,132,133,134,135}
RA={49,50,51,52,53,54,55,56,57,58,59,62,64,67,72,74,78,86,87,108,109}
MI=set(range(93,108))|{112,113,115,116,117,118,119,120,122,123,124,125,126,127,129}
def rects(i,w,h):
    r=[]; ar=w/h
    if i in MI: r.append((.62,.875,.998,.999) if i==126 else ((.64,.928,.998,.999) if i==93 else (.64,.902,.998,.999)))
    elif i in KL: r.append((.83,.925,.99,.99) if ar<1.5 else (.86,.92,.995,.99))
    if i in RA: r.append((.85,.88,.999,.997))
    return r
def reflect_fill(img,f):
    h,w=img.shape[:2]
    x0,y0,x1,y1=int(w*f[0]),int(h*f[1]),min(w,int(w*f[2])),min(h,int(h*f[3]))
    hr=y1-y0; src=img[y0-hr:y0, x0:x1][::-1].astype(np.float32)
    dst=img[y0:y1,x0:x1].astype(np.float32)
    # feather left/right/top edges so the patch melts into the picture
    fx=max(6,(x1-x0)//25); fy=max(4,hr//8)
    ax=np.ones(x1-x0,np.float32); ax[:fx]=np.linspace(0,1,fx); 
    if x1<w: ax[-fx:]=np.linspace(1,0,fx)
    ay=np.ones(hr,np.float32); ay[:fy]=np.linspace(0,1,fy)
    a=(ay[:,None]*ax[None,:])[...,None]
    out=img.copy(); out[y0:y1,x0:x1]=(src*a+dst*(1-a)).astype(np.uint8)
    return out
def remove(img,i):
    h,w=img.shape[:2]; n=0
    for f in rects(i,w,h): img=reflect_fill(img,f); n+=1
    return img,n
