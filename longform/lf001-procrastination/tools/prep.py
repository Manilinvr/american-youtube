import os, json
from PIL import Image, ImageFilter, ImageStat
src='clean/'; out='/home/user/american-youtube/public/longform/lf001/'
os.makedirs(out,exist_ok=True)
files={int(n.split('.')[0]):n for n in os.listdir(src)}
# scene -> source image number (default same number)
remap={7:8,8:9,9:7,16:17,17:16,25:62,26:25,27:26,28:27,62:19,89:109,92:95,95:70,109:19}
patch={88:[(400,50,575,130)],90:[(410,55,575,145)],110:[(820,120,1135,285)]}
W,H=2560,1440
def fill_color(im,box):
    x0,y0,x1,y1=box; pad=12
    ring=[im.crop((max(0,x0-pad),y0,x0,y1)),im.crop((x1,y0,min(im.width,x1+pad),y1)),im.crop((x0,max(0,y0-pad),x1,y0))]
    import statistics
    px=[p for r in ring for p in r.getdata()]
    return tuple(int(statistics.median([p[i] for p in px])) for i in range(3))
used={}
for s in range(1,136):
    n=remap.get(s,s); used[s]=n
    im=Image.open(src+files[n]).convert('RGB')
    for b in patch.get(n,[]):
        c=fill_color(im,b); im.paste(Image.new('RGB',(b[2]-b[0],b[3]-b[1]),c),b[:2])
        # soften the patch edge
        reg=im.crop((b[0]-6,b[1]-6,b[2]+6,b[3]+6)).filter(ImageFilter.GaussianBlur(3)); im.paste(reg,(b[0]-6,b[1]-6))
    r=im.width/im.height
    if abs(r-16/9)<0.03:
        im=im.resize((W,H),Image.LANCZOS)
    else:
        # fill the whole 16:9 frame: stretch width a little, then crop height around the drawing
        im=im.resize((int(im.width*1.15),im.height),Image.LANCZOS)
        ch=int(im.width*9/16)
        import numpy as np
        g=np.asarray(im.convert('L'),dtype=np.float32)
        ink=(np.abs(g-np.median(g))>40).sum(axis=1)   # how much drawing is in each row
        rows=np.where(ink>im.width*0.01)[0]
        rows=rows[rows>im.height*0.01]
        first=int(rows[0]) if len(rows) else 0
        by=min(max(0,first-int(im.height*0.03)),im.height-ch)
        im=im.crop((0,by,im.width,by+ch)).resize((W,H),Image.LANCZOS)
    im.save(out+f'S{s:03d}.jpg',quality=90)
json.dump(used,open('scene_images.json','w'))
print('done', len(os.listdir(out)))
