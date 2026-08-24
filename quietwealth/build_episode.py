"""Aurelis Episode 1 — '7 Things the Quietly Wealthy Never Do in Public'.
Full ~12-min build: Alice (ElevenLabs) VO + Pexels clips per beat + Warm Study grade
+ Noto Serif Display text cards (chapter/statement/big/texture/end). VO+clips cached."""
import urllib.request, urllib.parse, json, base64, subprocess, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
ROOT="/home/alpha/products/youtube-pipeline"; BASE=ROOT+"/quietwealth/episode"
os.makedirs(BASE+"/clips",exist_ok=True)
pk=open(ROOT+"/.pexels_key").read().strip(); ek=open(ROOT+"/.elevenlabs_key").read().strip()
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
SERIF="/usr/share/fonts/truetype/noto/NotoSerifDisplay-Regular.ttf"
SANS="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
IVORY=(243,236,221); GOLD=(201,169,106)
VOICE="Xb7hH8MSUJpSbSDYk0k2"  # Alice
GRADE=("eq=saturation=0.80:contrast=1.06:brightness=0.006,"
       "curves=all='0/0.05 0.25/0.27 0.75/0.78 1/0.95',"
       "colortemperature=temperature=5300:mix=0.5,vignette=PI/5,noise=alls=6:allf=t+u")

BEATS=[
 ("The wealthiest person in the room is almost never the loudest.","man grey coat crowd party bokeh",None,None),
 ("If you had to guess who actually had money — the man in the bright watch and head-to-toe logos, or the one in the plain grey sweater, saying almost nothing — most people guess wrong. Every time.","flashy gold watch luxury man",None,None),
 ("Because most people chasing money spend their whole lives doing the exact opposite of what builds it. They perform wealth instead of building it.","empty elegant living room interior","statement","Performing wealth isn't building it."),
 ("And that one habit is why some people look rich for a decade, and never actually become it.","luxury shopping bags street",None,None),
 ("These are seven things the quietly wealthy never do in public. A few you'll recognise. But number four is the one almost everyone gets wrong. It feels like success, it looks like winning, and it's quietly keeping millions of people broke for life.","dark elegant room single lamp night",None,None),
 ("We'll build up to it. Start with number seven.","dark moody luxury interior","chapter","07"),
 ("Walk through an old-money neighbourhood and something feels off. The cars are clean, but ordinary.","old money neighborhood street house",None,None),
 ("The clothes are clearly excellent, but you couldn't name a single brand on them.","tailored wool coat fabric close up",None,None),
 ("That's deliberate. The quietly wealthy pay for quality, the thing that lasts twenty years, and refuse to pay for the logo, the part that only tells strangers a price.","leather craftsmanship hands macro",None,None),
 ("The opposite instinct is to buy the loudest brand you can barely afford, so people assume the number behind it. That's renting a signal you don't own.","luxury boutique window shopping",None,None),
 ("Here's the tell. Loud money buys things to be seen. Quiet money buys things to be forgotten, so well made you stop thinking about them.","elegant watch close up low key","statement","Seen  vs.  Forgotten"),
 ("And there's data behind this, not just taste. The most famous study of everyday millionaires found the majority drove modest, used cars, and had rarely spent much on a watch in their lives.","older man modest sedan car","texture","The most-cited study of real millionaires:\nmost drove used cars."),
 ("The people who looked rich, and the people who were rich, turned out to be two almost entirely different groups.","quiet man walking city street",None,None),
 ("Ask the quietly wealthy what they make, the salary, the net worth, how well the deal went, and you get a shrug and a change of subject.","two men talking cafe casual","chapter","06"),
 ("Not because they're hiding something shady. Because the number simply isn't for you.","hands coffee table conversation",None,None),
 ("The loud crowd can't wait to tell you, or hint at it, because to them the number is the identity. It's proof they matter.","man showing phone bragging",None,None),
 ("But money that has to be announced isn't security. It's a costume.","mannequin suit shop window","statement","A costume, not security."),
 ("The person who needs you to know they're winning is quietly telling you something else underneath: that being seen as rich matters more to them than being rich. Two very different games. One makes you feel important today. The other makes you free in ten years.","man alone sunrise window calm",None,None),
 ("Most people over-explain. They justify the purchase they didn't make, the invitation they turned down, the reason they left early, narrating their choices to anyone nearby, hoping for a nod of approval.","person leaving party coat","chapter","05"),
 ("The quietly wealthy just don't. No is a complete sentence to them. They'll skip the thing everyone's doing and feel no need to defend it.","man calmly declining gesture","statement","\"No.\"  is a complete sentence."),
 ("Here's why that matters far beyond manners. The constant need to explain yourself is really a need for approval, and approval-seeking is one of the most expensive habits there is.","person hesitant luxury purchase","statement","Approval is expensive."),
 ("It's what makes people buy things they don't want, to impress people they don't like. The moment you stop needing the room to agree with you, an enormous amount of money simply stops leaking out of your life.","confident person walking away calm",None,None),
 ("Here it is.","dark room single light mysterious","chapter","04"),
 ("Most people get a raise and celebrate by upgrading their life. Bigger car, nicer place, better everything, instantly and permanently. Income goes up, and lifestyle rises to swallow it whole. It feels like winning. It feels earned.","couple keys new apartment happy",None,None),
 ("The quietly wealthy do something that feels almost unnatural. When the money goes up, they let their life stay exactly the same. The raise doesn't become a nicer car. It becomes ownership. Of assets, of time, of the option to walk away from anything.","modest calm home interior morning",None,None),
 ("This is the line nobody draws for you, so draw it now. Income is what comes in. Wealth is what you keep.","modest suburban house quiet street","big","Income is what comes in.\nWealth is what you keep."),
 ("A high earner who spends every raise is just a well-paid employee of their own lifestyle. One bad month from the edge.","stressed man bills kitchen night",None,None),
 ("The person who quietly kept living like their old self, while the income climbed, becomes untouchable.","calm content man modest home",None,None),
 ("It's the same reason so many people who suddenly come into money are broke again within a few years. The lifestyle rose faster than the wealth ever could.","empty wallet money problems","texture","Most people who suddenly come into money\nare broke again within a few years."),
 ("Looking rich and being rich pull in opposite directions. At every raise, almost everyone picks the wrong one.","calm quiet luxury interior",None,None),
 ("Watch someone with real money in a negotiation, and the first thing you notice is how comfortable they are walking away.","man stands leaves meeting table","chapter","03"),
 ("They don't chase deals, don't chase people, don't chase whatever everyone's suddenly excited about. They've built the one advantage most people never will. The ability to wait.","empty negotiation table chairs",None,None),
 ("The opposite is urgency. Jump on every opportunity, every hot trend, every this could be it, terrified of missing out. And that urgency is precisely what gets people used, overcharged, and talked into things they don't understand.","busy anxious crowd rushing",None,None),
 ("Desperation is expensive. The moment you need the deal, you've already lost it, and the other side can feel it.","calm confident man still","statement","Desperation is expensive."),
 ("The person who can calmly say no thank you, and mean it, holds all the leverage in the room. Every time. Patience isn't passive. It's the most underrated financial skill there is. Opportunities come to the calm, not the frantic.","calm man still lake dawn",None,None),
 ("The quietly wealthy make big decisions slowly and small decisions instantly, the exact reverse of how most people live.","coffee cup contract pen desk","chapter","02"),
 ("Most of us agonise over the menu and the minor purchase, then make the decisions that actually shape a life, the job, the partner, the money, the yes we should have made a no, on impulse, in a mood.","person hesitating menu restaurant",None,None),
 ("Wealthy behaviour here is boring, and boring is the point. They sleep on it. They let the excitement drain out of a decision, because excitement is a terrible advisor. Their default answer to almost everything is a quiet no, and that no is what protects the rare, deliberate yes.","hourglass sand slow time","statement","Big decisions slow.\nSmall ones instant."),
 ("Think back. Nearly every expensive mistake you've ever made was made quickly, while you were feeling something. The people who compound wealth aren't smarter than you. They're just harder to rush, and a decision made from patience almost never becomes a regret.","man thinking window rain contemplative",None,None),
 ("The biggest wins of their lives happen in complete silence. No announcement when the deal closes. No parade when the money arrives. You'd never know, unless they chose to tell you, and they won't.","single desk lamp dark office night","chapter","01"),
 ("The loud crowd needs the win witnessed. If nobody saw it, to them it barely counts. But the quietly wealthy learned something the loud crowd never does. Being underestimated is an advantage.","quiet unnoticed man crowd",None,None),
 ("When no one thinks you're a threat, no one competes with you, no one guards against you, no one even knows the game is being played. Privacy is a form of power, and attention is a tax on it.","silhouette window city night","statement","Privacy is power.\nAttention is a tax."),
 ("It's why one of the most successful investors alive has lived in the same modest house he bought in the nineteen fifties. He could buy the whole street. He simply never needed you to know it.","modest suburban house ordinary street","texture","One of the most successful investors alive\nstill lives in the modest house he bought in the 1950s."),
 ("While everyone else is busy looking successful, people like him are busy compounding. Quietly, patiently, out of view.","calm figure walking away street",None,None),
 ("That's the whole secret, and it's almost too simple. Real wealth doesn't shout. It doesn't need to be seen. It just grows, quietly, in the silence everyone else is too loud to notice.","slow dusk city skyline calm","statement","Real wealth doesn't shout."),
 ("So here's the quiet test. The next time you're about to spend money, ask one question. Am I trying to build wealth, or just look like I already have it?","man grey sweater walking away street",None,None),
 ("Most people never ask. And now you won't be able to stop hearing it.","quiet contemplative man street","statement","Build it — or look like it?"),
 ("If any of this landed, you already think a little more like the quietly wealthy than you did eleven minutes ago. The next video goes deeper on number four. How the quietly wealthy actually spend the money they don't reinvest, without ever looking rich.","elegant calm interior dusk",None,None),
 ("And, fittingly, keep it quiet.","dark calm night still lamp","end",None),
]
full=" ".join(b[0] for b in BEATS)

def dl(url,dst):
    req=urllib.request.Request(url,headers={"User-Agent":UA})
    with urllib.request.urlopen(req,timeout=180) as r,open(dst,"wb") as f: f.write(r.read())

# 1) ElevenLabs VO (Alice) with timestamps  [cached]
if not (os.path.exists(BASE+"/vo.mp3") and os.path.exists(BASE+"/vo.json")):
    body=json.dumps({"text":full,"model_id":"eleven_multilingual_v2",
        "voice_settings":{"stability":0.5,"similarity_boost":0.8,"style":0.15,"use_speaker_boost":True,"speed":1.0}}).encode()
    req=urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}/with-timestamps",
        data=body,headers={"xi-api-key":ek,"Content-Type":"application/json"},method="POST")
    resp=json.load(urllib.request.urlopen(req,timeout=240))
    open(BASE+"/vo.mp3","wb").write(base64.b64decode(resp["audio_base64"]))
    json.dump(resp["alignment"],open(BASE+"/vo.json","w"))
    print("VO generated",flush=True)
ends=json.load(open(BASE+"/vo.json"))["character_end_times_seconds"]; total=ends[-1]
seg=[]; cum=0; prev=0.0
for vo,term,kind,text in BEATS:
    ei=min(cum+len(vo)-1,len(ends)-1); tend=ends[ei]
    seg.append([vo,term,kind,text,prev,tend]); prev=tend; cum+=len(vo)+1
seg[-1][5]=total
print("VO total %.1fs  (%d beats)"%(total,len(seg)),flush=True)

# 2) pexels clip per beat [cached]
def pexels(term,need):
    url="https://api.pexels.com/videos/search?query=%s&per_page=15&orientation=landscape&size=medium"%urllib.parse.quote(term)
    try: d=json.load(urllib.request.urlopen(urllib.request.Request(url,headers={"Authorization":pk,"User-Agent":UA}),timeout=30))
    except Exception: return None
    for v in d.get("videos",[]):
        if v["duration"]<max(3,need): continue
        f=[x for x in v["video_files"] if x.get("file_type")=="video/mp4" and x.get("height")==1080] or \
          sorted([x for x in v["video_files"] if x.get("file_type")=="video/mp4"],key=lambda x:-(x.get("height") or 0))
        if f: return f[0]["link"]
    return None
for i,(vo,term,kind,text,a,b) in enumerate(seg):
    dst=f"{BASE}/clips/s{i}.mp4"
    if os.path.exists(dst) and os.path.getsize(dst)>10000: continue
    link=pexels(term,b-a) or pexels("quiet luxury interior cinematic",b-a) or pexels("calm dark elegant",b-a)
    if link: dl(link,dst); print("clip %d ok"%i,flush=True)
    else: print("clip %d MISS %s"%(i,term),flush=True)

# 3) text cards
def scrim(img,cx,cy,w,h,alpha):
    lay=Image.new("RGBA",img.size,(0,0,0,0)); d=ImageDraw.Draw(lay)
    d.ellipse([cx-w//2,cy-h//2,cx+w//2,cy+h//2],fill=(8,8,10,alpha))
    img.alpha_composite(lay.filter(ImageFilter.GaussianBlur(90)))
def ctext(d,cx,y,t,f,fill):
    w=d.textlength(t,font=f); d.text((cx-w/2,y),t,font=f,fill=fill); return f.getmetrics()[0]+f.getmetrics()[1]
def statement_png(text,path,big=False):
    W,H=1920,1080; img=Image.new("RGBA",(W,H),(0,0,0,0)); fs=132 if big else 92
    f=ImageFont.truetype(SERIF,fs); lines=text.split("\n"); lh=fs+22; d=ImageDraw.Draw(img)
    tw=max(d.textlength(l,font=f) for l in lines); th=lh*len(lines)
    scrim(img,W//2,H//2,int(tw*1.5),int(th*2.5),170 if big else 145); d=ImageDraw.Draw(img)
    y=H//2-th//2
    for l in lines: ctext(d,W//2,y,l,f,(*IVORY,255)); y+=lh
    img.save(path)
def texture_png(text,path):
    W,H=1920,1080; img=Image.new("RGBA",(W,H),(0,0,0,0)); f=ImageFont.truetype(SERIF,66)
    lines=text.split("\n"); lh=88; d=ImageDraw.Draw(img); th=lh*len(lines)
    tw=max(d.textlength(l,font=f) for l in lines)
    scrim(img,W//2,H//2,int(tw*1.6),int(th*3.0),185); d=ImageDraw.Draw(img)
    d.line([W//2-tw*0.6,H//2-th//2-46,W//2+tw*0.6,H//2-th//2-46],fill=(*GOLD,235),width=2)
    y=H//2-th//2+8
    for l in lines: ctext(d,W//2,y,l,f,(*IVORY,255)); y+=lh
    d.line([W//2-tw*0.6,y+18,W//2+tw*0.6,y+18],fill=(*GOLD,235),width=2)
    img.save(path)
def chapter_png(num,path):
    W,H=1920,1080; img=Image.new("RGBA",(W,H),(0,0,0,0)); d=ImageDraw.Draw(img)
    scrim(img,W//2,H//2,900,900,150); d=ImageDraw.Draw(img)
    ctext(d,W//2,H//2-190,"S E C T I O N",ImageFont.truetype(SANS,34),(*GOLD,235))
    ctext(d,W//2,H//2-150,num,ImageFont.truetype(SERIF,300),(*IVORY,255))
    d.line([W//2-70,H//2+185,W//2+70,H//2+185],fill=(*GOLD,255),width=3); img.save(path)
def end_png(path):
    W,H=1920,1080; img=Image.new("RGBA",(W,H),(0,0,0,0)); d=ImageDraw.Draw(img)
    scrim(img,W//2,H//2,1300,700,180); d=ImageDraw.Draw(img)
    f=ImageFont.truetype(SERIF,150); t="AURELIS"; ws=[d.textlength(c,font=f) for c in t]; tr=30
    x=W//2-(sum(ws)+tr*(len(t)-1))/2
    for c,w in zip(t,ws): d.text((x,H//2-140),c,font=f,fill=(*IVORY,255)); x+=w+tr
    d.line([W//2-150,H//2+55,W//2+150,H//2+55],fill=(*GOLD,255),width=2)
    ctext(d,W//2,H//2+90,"Not financial advice.",ImageFont.truetype(SANS,34),(*GOLD,220))
    img.save(path)
for i,(vo,term,kind,text,a,b) in enumerate(seg):
    p=f"{BASE}/t{i}.png"
    if kind=="statement": statement_png(text,p)
    elif kind=="big": statement_png(text,p,big=True)
    elif kind=="texture": texture_png(text,p)
    elif kind=="chapter": chapter_png(text,p)
    elif kind=="end": end_png(p)

# 4) per-segment render (grade + optional faded text overlay)
def fades(kind,dur):
    if kind=="chapter": return 0.2,0.6,min(dur-0.5,1.7),0.5
    if kind=="end": return 0.4,1.0,dur+9,0.3   # fade in, hold to end
    return 0.35,0.8,max(0.1,dur-0.6),0.5
for i,(vo,term,kind,text,a,b) in enumerate(seg):
    dur=round(b-a,3); src=f"{BASE}/clips/s{i}.mp4"; out=f"{BASE}/f{i}.mp4"
    if not os.path.exists(src): continue
    if os.path.exists(out) and os.path.getsize(out)>10000: continue
    basef=f"[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1,fps=30,{GRADE}"
    if kind:
        fi,fid,fo,fod=fades(kind,dur)
        fc=(basef+"[bg];[1:v]format=rgba,fade=t=in:st=%.2f:d=%.2f:alpha=1,fade=t=out:st=%.2f:d=%.2f:alpha=1[tx];"
            "[bg][tx]overlay=0:0,format=yuv420p[o]")%(fi,fid,fo,fod)
        cmd=["ffmpeg","-y","-t",str(dur),"-i",src,"-framerate","30","-loop","1","-t",str(dur),"-i",f"{BASE}/t{i}.png",
             "-filter_complex",fc,"-map","[o]","-an","-r","30","-c:v","libx264","-preset","medium","-pix_fmt","yuv420p",out]
    else:
        cmd=["ffmpeg","-y","-t",str(dur),"-i",src,"-filter_complex",basef+",format=yuv420p[o]",
             "-map","[o]","-an","-r","30","-c:v","libx264","-preset","medium","-pix_fmt","yuv420p",out]
    subprocess.run(cmd,check=True,stderr=subprocess.DEVNULL)
    if i%8==0: print("rendered seg",i,flush=True)
print("segments done",flush=True)

# 5) concat + mux VO
with open(BASE+"/list.txt","w") as fh:
    for i in range(len(seg)):
        if os.path.exists(f"{BASE}/f{i}.mp4"): fh.write(f"file 'f{i}.mp4'\n")
subprocess.run(["ffmpeg","-y","-f","concat","-safe","0","-i",BASE+"/list.txt","-c","copy",BASE+"/video.mp4"],check=True,stderr=subprocess.DEVNULL)
subprocess.run(["ffmpeg","-y","-i",BASE+"/video.mp4","-i",BASE+"/vo.mp3","-c:v","copy","-c:a","aac","-b:a","192k",
    "-shortest","-movflags","+faststart",BASE+"/aurelis_ep1.mp4"],check=True,stderr=subprocess.DEVNULL)
print("EPISODE DONE",flush=True)
