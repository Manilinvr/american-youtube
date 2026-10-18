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
        # contain on a canvas filled with the image's own edge colour
        edge=ImageStat.Stat(im.crop((0,0,im.width,20))).median
        canvas=Image.new('RGB',(W,H),tuple(int(v) for v in edge))
        sc=H/im.height; im2=im.resize((int(im.width*sc),H),Image.LANCZOS)
        # soft blurred fill on the sides
        bg=im.resize((W,H),Image.LANCZOS).filter(ImageFilter.GaussianBlur(40))
        canvas.paste(bg,(0,0)); canvas.paste(im2,((W-im2.width)//2,0)); im=canvas
    im.save(out+f'S{s:03d}.jpg',quality=90)
json.dump(used,open('scene_images.json','w'))
print('done', len(os.listdir(out)))
