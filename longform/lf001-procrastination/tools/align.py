import json,re,difflib,zipfile,csv,io
D='/home/user/american-youtube/longform/lf001-procrastination/'
DUR=744.432
norm=lambda w: re.sub(r"[^a-z0-9']","",w.lower().replace('’',"'"))
# script words
s=open(D+'02-script.md').read()
script=[]
for b in s.split('\n### ')[1:]:
    for l in b.split('\n'):
        if l.startswith('> '): script+= [norm(w) for w in l[2:].split() if norm(w)]
asr=json.load(open('words.json'))
aw=[norm(w[0]) for w in asr]
sm=difflib.SequenceMatcher(None,script,aw,autojunk=False)
t=[None]*len(script)
for a,b,n in sm.get_matching_blocks():
    for k in range(n): t[a+k]=asr[b+k][1]
matched=sum(x is not None for x in t)
# interpolate gaps
known=[i for i,x in enumerate(t) if x is not None]
for i in range(len(t)):
    if t[i] is None:
        prev=max([k for k in known if k<i],default=None); nxt=min([k for k in known if k>i],default=None)
        if prev is None: t[i]=t[nxt]
        elif nxt is None: t[i]=t[prev]
        else: t[i]=t[prev]+(t[nxt]-t[prev])*(i-prev)/(nxt-prev)
# scenes
scenes=[]
for bn in range(1,6):
    md=open(D+f'05-prompts-{bn:02d}.md').read()
    scenes+=re.findall(r'\*\*(S\d{3})\*\* · (.*?) · (\S+) · `',md)
pos=0; rows=[]; issues=[]
for sid,ph,typ in scenes:
    if ph.startswith('('):  # final frame after last line
        rows.append([sid,None,ph,typ,'after']); continue
    words=[norm(w) for w in re.sub(r'[…]|\.\.\.',' ',ph).split() if norm(w)][:5]
    found=None
    for n in [k for k in (5,4,3,2,1) if k<=len(words)]:
        q=words[:n]
        for i in range(pos,len(script)-n+1):
            if script[i:i+n]==q: found=i;break
        if found is not None: break
    if found is None: issues.append(sid); found=pos
    pos=found+1
    rows.append([sid,found,ph,typ,'ok'])
# times
starts=[]
for r in rows:
    if r[4]=='after':
        # end of last narrative word before CTA
        idx=next(i for i in range(len(script)) if script[i:i+4]==["what's","the","thing","you've"])
        st=t[next(i for i in range(idx-1,0,-1) if script[i]=='pass')]
    else: st=t[r[1]]
    starts.append(st)
starts[0]=0.0
MIN=1.0
for i in range(len(starts)-1):
    if starts[i+1]-starts[i]<MIN: starts[i+1]=starts[i]+MIN
# CTA card (last) should start at CTA word; final frame between
out=[]
for i,r in enumerate(rows):
    st=starts[i]; en=starts[i+1] if i+1<len(rows) else DUR
    out.append((r[0],st,en,en-st,r[3],r[2]))
fmt=lambda x: f"{int(x//60):02d}:{x%60:06.3f}"
fmt2=lambda x: f"{int(x//60)}:{int(x%60):02d}"
print('script words',len(script),'matched',matched,'issues',issues)
print('min dur',min(o[3] for o in out),'max',max(o[3] for o in out))
for o in out:
    if o[3]<1.2 or o[3]>12: print('WARN',o[0],round(o[3],2),o[5][:50])
json.dump(out,open('timeline.json','w'))
