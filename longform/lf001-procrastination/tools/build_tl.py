import json,re,difflib
D='/home/user/american-youtube/longform/lf001-procrastination/'
FPS=30; DUR=744.432
norm=lambda w: re.sub(r"[^a-z0-9']","",w.lower().replace('’',"'"))
s=open(D+'02-script.md').read()
tok=[]
for b in s.split('\n### ')[1:]:
    for l in b.split('\n'):
        if l.startswith('> '): tok+=[w for w in l[2:].split() if norm(w)]
script=[norm(w) for w in tok]
asr=json.load(open('words.json')); aw=[norm(w[0]) for w in asr]
sm=difflib.SequenceMatcher(None,script,aw,autojunk=False)
st=[None]*len(script); en=[None]*len(script)
for a,b,n in sm.get_matching_blocks():
    for k in range(n): st[a+k]=asr[b+k][1]; en[a+k]=asr[b+k][2]
known=[i for i,x in enumerate(st) if x is not None]
import bisect
for i in range(len(st)):
    if st[i] is None:
        j=bisect.bisect_left(known,i); p=known[j-1] if j>0 else None; q=known[j] if j<len(known) else None
        if p is None: st[i]=st[q]
        elif q is None: st[i]=en[p]
        else: st[i]=en[p]+(st[q]-en[p])*(i-p)/(q-p)
for i in range(len(st)):
    if en[i] is None: en[i]=st[i+1] if i+1<len(st) else st[i]+0.4
# ---------- captions
caps=[]; cur=[]
def flush():
    global cur
    if cur: caps.append(cur); cur=[]
for i,w in enumerate(tok):
    cur.append(i)
    txt=' '.join(tok[k] for k in cur)
    if re.search(r'[.?!]["”]?$',w) or len(cur)>=7 or len(txt)>40 or (w.endswith(',') and len(cur)>=4) or (i+1<len(tok) and st[i+1]-en[i]>0.7):
        flush()
flush()
C=[]
for n,c in enumerate(caps):
    s0=st[c[0]]-0.05; e0=en[c[-1]]+0.35
    if n+1<len(caps): e0=min(e0,st[caps[n+1][0]]-0.02)
    C.append({'s':round(s0,3),'e':round(e0,3),'w':[[tok[k],round(st[k],3)] for k in c]})
# ---------- scenes
tl=json.load(open('timeline.json'))
blocks={'S001','S011','S017','S020','S040','S051','S061','S090','S097','S109','S121','S126'}
P={'in':dict(s0=1.0,s1=1.12),'out':dict(s0=1.14,s1=1.01),'panR':dict(s0=1.12,s1=1.12,x0=3,x1=-3),'panL':dict(s0=1.12,s1=1.12,x0=-3,x1=3),
   'up':dict(s0=1.12,s1=1.12,y0=2.5,y1=-2.5),'down':dict(s0=1.12,s1=1.12,y0=-2.5,y1=2.5)}
cycle=['in','panR','out','panL','up','in','down','out']
OV={ # scene: camera override
 'S001':dict(s0=1.0,s1=1.14,ox=42,oy=42),'S008':dict(s0=1.0,s1=1.2,ox=45,oy=32),'S009':'panL','S012':'in','S015':dict(s0=1.16,s1=1.0),
 'S018':dict(s0=1.0,s1=1.16,ox=48,oy=38),'S034':'in','S035':dict(s0=1.0,s1=1.05,ox=35,oy=55),'S040':dict(s0=1.0,s1=1.08),
 'S043':dict(s0=1.0,s1=1.16,ox=46,oy=42),'S047':dict(s0=1.12,s1=1.12,x0=3.5,x1=-3.5),'S049':'out','S057':dict(s0=1.2,s1=1.0),
 'S061':'in','S071':'panR','S082':dict(s0=1.12,s1=1.12,y0=-3,y1=3),'S083':dict(s0=1.0,s1=1.18,ox=47,oy=35),
 'S087':dict(s0=1.12,s1=1.18,ox=20,oy=62),'S094':'panR','S098':'in','S099':dict(s0=1.0,s1=1.15,ox=55,oy=40),
 'S119':dict(s0=1.0,s1=1.09),'S128':dict(s0=1.0,s1=1.16,ox=50,oy=35),'S133':dict(s0=1.12,s1=1.12,x0=2,x1=-3),
 'S134':dict(s0=1.0,s1=1.1),'S135':dict(s0=1.0,s1=1.04),
}
SC=[]; ci=0
for k,(sid,a,b,du,typ,ph) in enumerate(tl):
    o=OV.get(sid)
    if isinstance(o,str): cam=dict(P[o])
    elif isinstance(o,dict): cam=dict(o)
    elif typ=='КАРТОЧКА': cam=dict(s0=1.0,s1=1.05)
    elif typ=='СРАВНЕНИЕ': cam=dict(s0=1.0,s1=1.06)
    elif typ=='СХЕМА': cam=dict(s0=1.08,s1=1.0)
    else: cam=dict(P[cycle[ci%len(cycle)]]); ci+=1
    if a<60 and typ not in ('КАРТОЧКА','СРАВНЕНИЕ') and o is None:  # livelier hook
        if cam['s1']>cam['s0']: cam['s1']=cam['s0']+0.16
    for key,v in (('x0',0),('x1',0),('y0',0),('y1',0),('ox',50),('oy',50)): cam.setdefault(key,v)
    SC.append({'id':sid,'from':round(a*FPS),'to':round(b*FPS),'fade':sid in blocks and sid!='S001','cam':cam,'type':typ})
start={x['id']:x['from']/FPS for x in SC}; end={x['id']:x['to']/FPS for x in SC}
# ---------- overlays
O=[]
def ov(sid,kind,text,until=None,delay=0.3,**kw):
    s0=start[sid]+delay; e0=(end[until] if until else end[sid])-0.12
    O.append(dict(kind=kind,text=text,f=round(s0*FPS),t=round(e0*FPS),scene=sid,**kw))
ov('S002','chip','≈ 20 minutes'); ov('S003','stat','9',label='days',value=9)
ov('S013','card','LAZY?',red='LAZY?')
ov('S019','card','3 things your brain is doing')
ov('S021','card','“voluntarily delaying something you intended to do — even though you expect to be worse off”',small=True,sub='Piers Steel, 2007')
ov('S023','stat','~700',value=700,prefix='~',label='findings on procrastination'); ov('S023','cite','Steel · Psychological Bulletin · 2007',delay=0.6)
ov('S025','chip','mood repair, right now'); ov('S026','chip','the bill → future you')
ov('S028','cite','Tice, Bratslavsky & Baumeister · 2001',until='S033'); ov('S029','chip','15 minutes to practice',pos='tr')
ov('S032','chip','“your mood is frozen”')
ov('S035','pin','13.7 min',x=30,y=11); ov('S035','pin','5.7 min',x=40.5,y=33,delay=1.2); ov('S035','chip','minutes NOT practicing (out of 15)',pos='tr')
ov('S038','chip','small lab study · 88 students')
for sid,t in (('S041','1 · EVENT'),('S042','2 · STORY'),('S043','3 · FEELING'),('S044','4 · ESCAPE'),('S045','5 · RELIEF'),('S046','THE LOOP')): ov(sid,'chip',t,pos='tr')
ov('S050','card','Relief now. Interest later.',small=True)
ov('S052','cite','Tice & Baumeister · Psychological Science · 1997',until='S056'); ov('S053','chip','early semester: less stress',pos='tr')
ov('S055','chip','end of semester: more stress, symptoms, doctor visits',pos='tr'); ov('S056','card','short-term benefits, long-term costs',small=True)
ov('S057','stat','3,525',value=3525,label='students · 9 months · Sweden'); ov('S057','cite','Johansson et al. · JAMA Network Open · 2023',until='S059',delay=0.8)
ov('S059','chip','weak links · not proof of cause',pos='tr')
ov('S062','card','3 things your brain is doing'); ov('S063','card','1 · The feeling, not the task')
ov('S064','cite','Blunt & Pychyl · 2000',until='S069')
for sid,t in (('S065','boring'),('S066','frustrating'),('S067','resented'),('S068','meaningless'),('S069','unclear steps')): ov(sid,'stamp',t,delay=0.1)
ov('S070','chip','not on the list: “I’m a bad person”',pos='tr')
ov('S072','card','2 · The more it matters, the more it threatens',small=True)
ov('S074','cite','Ferrari & Tice · 2000',until='S077'); ov('S075','chip','“a test of your cognitive skills”',pos='tr'); ov('S076','chip','“just a fun game”',pos='tr')
ov('S079','stamp','SELF-HANDICAPPING',pos='tl'); ov('S080','cite','Sirois, Molnar & Hirsch · 2017 · 44 studies',until='S081')
ov('S080','chip','high standards → slightly less',pos='tr'); ov('S081','chip','fear of mistakes & judgment → more',pos='tr')
ov('S084','card','3 · Future you')
ov('S085','cite','Pronin, Olivola & Kennedy · 2008',until='S087')
ov('S086','stat','2',value=2,prefix='≈ ',label='tablespoons — for “me, now”')
ov('S087','pin','now\n≈ 2 tbsp',x=9.7,y=46); ov('S087','pin','future you\n≈ ½ cup',x=22.9,y=46,delay=0.9); ov('S087','pin','another student\n≈ ½ cup',x=35.9,y=46,delay=1.8)
ov('S092','stamp','boredom?',delay=0.1); ov('S093','stamp','where do I start?',delay=0.1); ov('S094','stamp','not good enough?',delay=0.1,pos='tl')
ov('S100','stamp','+ GUILT')
ov('S102','cite','Wohl, Pychyl & Bennett · 2010',until='S105'); ov('S102','chip','119 first-year students · two midterms',pos='tr',delay=0.6)
ov('S106','card','One study: a link, not proof',small=True); ov('S107','cite','Sirois · Self and Identity · 2014')
ov('S109','card','3 things worth trying'); ov('S110','chip','1 · Shrink the start',pos='tr')
ov('S113','card','An idea from the research — not yet tested on its own',small=True)
ov('S114','card','2 · If → then'); ov('S116','stat','642',value=642,label='tests · small but real effect',pos='left'); ov('S116','cite','Sheeran, Listrom & Gollwitzer · 2024',delay=0.8)
ov('S117','chip','3 · Forgive the slip',pos='tr'); ov('S119','card','A video can’t diagnose. A professional can help.',small=True,delay=2.0,pos='bottom')
ov('S120','cite','Rozental et al. · J. Consulting & Clinical Psychology · 2015'); ov('S120','chip','10-week online CBT program',pos='tr',delay=0.8)
ov('S121','card','The short version'); ov('S122','chip','not lazy — trying to feel better',pos='tr')
ov('S123','chip','works for 5 minutes · charges you for weeks',pos='tr'); ov('S124','chip','care more → it feels like a verdict',pos='tr')
ov('S126','chip','day 10',pos='tl'); ov('S130','chip','“Hi, sorry for the slow reply.”',pos='tr')
ov('S135','card','Which feeling is behind yours?',small=True,sub='boredom · confusion · fear of not being good enough')
data=dict(fps=FPS,duration=int((DUR+1.6)*FPS),scenes=SC,overlays=O,captions=C)
json.dump(data,open('/home/user/american-youtube/src/longform/lf001.json','w'),ensure_ascii=False)
print(len(SC),len(O),len(C),data['duration'])
