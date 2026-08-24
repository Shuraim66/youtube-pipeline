"""Aurelis Episode 2 — 'How the Quietly Wealthy Actually Spend Their Money'.
ONE-COMMAND CLI pipeline (same system as Ep1): ElevenLabs (Alice) VO + Pexels clips per beat
+ Warm Study grade + Noto Serif Display motion text-cards + AURELIS intro + synced subtitles
+ original ambient music bed. Output: ep2/episode/aurelis_ep2_v3.mp4
Run:  cd /home/alpha/products/youtube-pipeline/quietwealth && python3 ep2/build_ep2.py
Caching: VO (vo.mp3/json), clips, segments are cached — safe to re-run; only missing parts rebuild."""
import urllib.request, urllib.parse, json, base64, subprocess, os, time
import numpy as np
from scipy.io import wavfile
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT="/home/alpha/products/youtube-pipeline"; BASE=ROOT+"/quietwealth/ep2/episode"
os.makedirs(BASE+"/clips",exist_ok=True)
pk=open(ROOT+"/.pexels_key").read().strip(); ek=open(ROOT+"/.elevenlabs_key").read().strip()
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
SERIF="/usr/share/fonts/truetype/noto/NotoSerifDisplay-Regular.ttf"
SANS="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
IVORY=(243,236,221); GOLD=(201,169,106); VOICE="Xb7hH8MSUJpSbSDYk0k2"  # Alice
INTRO=3.6
GRADE=("eq=saturation=0.80:contrast=1.06:brightness=0.006,"
       "curves=all='0/0.05 0.25/0.27 0.75/0.78 1/0.95',"
       "colortemperature=temperature=5300:mix=0.5,vignette=PI/5,noise=alls=6:allf=t+u")
def stage(n,msg): print(f"\n\033[1m[{n}]\033[0m {msg}",flush=True)

# ---- BEATS: (plain VO, pexels term, kind, card text) ; kind: None|statement|big|texture|chapter|end
BEATS=[
 ("Last time, we ended on the one habit that quietly keeps people broke: they spend the raise. When the money goes up, the lifestyle rises to swallow it.","single watch face down table minimal",None,None),
 ("But that leaves an obvious question, and it's the one almost everyone gets wrong about rich people. Because the quietly wealthy do spend money. Sometimes a lot of it. They just spend it on things you'll never see.","plain elegant room interior calm",None,None),
 ("So this is the other half of the secret. Not what they refuse to buy, but what they happily, quietly pour money into, while still looking completely ordinary. They spend on what compounds, not on what shows.","understated expensive room slow","statement","They spend on what compounds —\nnot on what shows."),
 ("There are six of them. Number four is the one almost nobody even counts as spending, and it might be the smartest money the wealthy ever spend. We'll build to it. Start with number six.","dark elegant interior single lamp","chapter","06"),
 ("The quietly wealthy own surprisingly few things, but the few are excellent, and they last. A coat worn for twenty years. A bag that outlives its owner. Tools, furniture, everyday things chosen once and kept.","heavy wool coat fabric texture",None,None),
 ("This isn't cheapness, they'll spend real money here. It's a different math. A six hundred dollar coat worn three hundred times costs two dollars a wear. Five cheap coats that fall apart cost more, look worse, and quietly eat the year.","well worn leather bag old",None,None),
 ("The loud version buys often, buys trendy, and replaces constantly, a permanent low grade leak. The quiet version buys rarely, buys well, and stops thinking about it. It's the old idea of buy it for life, spend more, once, and never spend on it again.","quality tailored coat calm man","statement","Buy once.\nForget it."),
 ("But the biggest things they buy aren't things at all. And the next one is something you can never get back.","hourglass sand flowing slow",None,None),
 ("Ask the quietly wealthy where they don't cut corners, and it's almost always the same answer: the body.","fresh food prepared slowly","chapter","05"),
 ("Good food, real sleep, movement, the doctor and the dentist before something's wrong. It's unglamorous, it photographs like nothing, and they spend on it relentlessly, because it's the one asset that can't be bought back once it's gone. You can rebuild a bank account. You cannot rebuild a decade of a wrecked body.","quiet early morning walk nature",None,None),
 ("The opposite instinct is common and quietly tragic: cut the health to afford the things people can see. A better phone, a worse spine.","empty lap pool dawn calm","statement","The one asset\nyou can't repurchase."),
 ("Health is the purest example of quiet spending, enormous investment, zero display, and it compounds for the rest of your life.","calm person morning stretch light",None,None),
 ("And there's one more thing they'll pay almost anything for, something most people never think of as buyable at all. Number four.","clock close up ticking",None,None),
 ("Here it is. The quietly wealthy spend money to delete tasks. The cleaning, the admin, the errands, the long commute, the thing that eats a Saturday, they pay to make it disappear.","person reading calm home","chapter","04"),
 ("To most people that looks like laziness, or a waste. It's the opposite. It's the most rational purchase there is, because time is the only thing you can never earn more of. Every hour you buy back is an hour returned to your actual life, or to the work that pays far more than the chore ever cost.","calm man coffee window morning",None,None),
 ("You can always make more money. You can never make more time.","serene person unhurried window coffee","big","You can always make more money.\nYou can never make more time."),
 ("And this isn't just a nice idea. Researchers have found that people who spend money to save time report more happiness than people who spend the same money on more stuff.","relaxed happy person free time","texture","People who buy time report more\nhappiness than people who buy stuff."),
 ("The wealthy figured this out early: they stopped buying objects to impress, and started buying hours to be free. That's the trade almost nobody makes, and it's invisible from the outside.","calm free person morning",None,None),
 ("Once your time is protected, watch where they point it, and their money, next. It's the thing that raised them in the first place.","person walking calm purposeful",None,None),
 ("Books, courses, coaches, the expensive dinner with someone smarter, the room they had to pay to get into. The quietly wealthy spend heavily on becoming more capable, and none of it shows.","wall of books library shelves","chapter","03"),
 ("This is the exact inversion of the loud crowd. One spends to look more successful; the other spends to become more capable, and capability quietly raises the ceiling on everything else they'll ever earn.","notebook handwriting close up",None,None),
 ("A ten dollar book that changes one decision can be the highest returning purchase of a life. You just can't photograph it, so nobody brags about it.","person reading focused lamp","statement","They buy skills,\nnot status."),
 ("But ask them what they've never once regretted spending on, and it's never a thing at all.","small private dinner warm",None,None),
 ("They travel. They pay for meaningful experiences. And they're quietly generous, but toward a small circle, not an audience.","small group long table warm light","chapter","02"),
 ("The difference is the audience. Many of them don't even post it; the experience was the point, not the proof. And there's real weight behind this: study after study finds that experiences make people happier than possessions, and unlike a purchase that fades, a memory tends to grow.","quiet scenic trip calm travel","texture","Experiences make people happier\nthan possessions."),
 ("The generosity works the same way, helping family quietly, covering a bill without a word, investing in the few people who matter. No plaque, no announcement.","friends candid dinner laughing","statement","Experiences compound.\nObjects fade."),
 ("Quiet money takes care of its own without needing to be seen doing it.","hands helping quietly warm",None,None),
 ("And every one of these points to the same final thing, the one purchase underneath all the others. Number one.","calm home quiet street dusk",None,None),
 ("Everything else on this list adds up to this. The ultimate thing the quietly wealthy buy is a quiet life.","calm home set back quiet street","chapter","01"),
 ("A home somewhere calm. Distance from noise and drama. A buffer thick enough that a bad month is an inconvenience, not a catastrophe. Privacy from the attention everyone else is chasing. They spend to remove stress, not to add status.","peaceful home interior soft light",None,None),
 ("That's the purchase you can never see from the outside, which is exactly why it works. The loud crowd spends everything trying to be noticed. The quiet crowd spends everything trying to be left alone.","person alone peaceful window calm","statement","They buy peace —\nnot status."),
 ("Because they learned that peace is the most expensive thing money can buy, and the only one that actually feels like wealth. Real wealth doesn't shout.","slow dusk exterior warm window lit","statement","Real wealth doesn't shout."),
 ("So here's the whole reframe. The quietly wealthy don't spend less, they spend differently. On what lasts, what can't be replaced, and what quietly gives something back. Never on what only gets seen.","single well made object evening light",None,None),
 ("Next time you're about to buy something, ask the quiet question: will this give me something back, or just be seen?","person thoughtful pause calm","statement","Give back —\nor just be seen?"),
 ("If this is starting to sound like a way of thinking you already have, you might be further along than you realize. There are early signs you're becoming the kind of person who ends up wealthy, and most people miss every one of them. That's the next video.","calm elegant interior dusk hopeful",None,None),
 ("And, fittingly, keep it quiet.","dark calm night still lamp","end",None),
]
full=" ".join(b[0] for b in BEATS)

def dl(url,dst):
    with urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":UA}),timeout=180) as r,open(dst,"wb") as f: f.write(r.read())

# ---- 1) ElevenLabs VO (Alice) with timestamps [cached] ----
stage(1,"ElevenLabs VO (Alice)")
if not (os.path.exists(BASE+"/vo.mp3") and os.path.exists(BASE+"/vo.json")):
    body=json.dumps({"text":full,"model_id":"eleven_multilingual_v2",
        "voice_settings":{"stability":0.5,"similarity_boost":0.8,"style":0.15,"use_speaker_boost":True,"speed":1.0}}).encode()
    req=urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}/with-timestamps",
        data=body,headers={"xi-api-key":ek,"Content-Type":"application/json"},method="POST")
    resp=json.load(urllib.request.urlopen(req,timeout=300))
    open(BASE+"/vo.mp3","wb").write(base64.b64decode(resp["audio_base64"])); json.dump(resp["alignment"],open(BASE+"/vo.json","w"))
    print("  generated",flush=True)
else: print("  cached",flush=True)
al=json.load(open(BASE+"/vo.json")); ends=al["character_end_times_seconds"]; total=ends[-1]
seg=[]; cum=0; prev=0.0
for vo,term,kind,text in BEATS:
    ei=min(cum+len(vo)-1,len(ends)-1); seg.append([vo,term,kind,text,prev,ends[ei]]); prev=ends[ei]; cum+=len(vo)+1
seg[-1][5]=total
print("  VO %.1fs  (%d beats)"%(total,len(seg)),flush=True)

# ---- 2) Pexels clip per beat [cached] ----
stage(2,"Fetching Pexels clips (%d beats)"%len(seg))
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
    if link: dl(link,dst); print("  clip %2d ok  %s"%(i,term),flush=True)
    else: print("  clip %2d MISS %s"%(i,term),flush=True)

# ---- 3) text cards ----
stage(3,"Rendering text cards")
def scrim(img,cx,cy,w,h,a):
    lay=Image.new("RGBA",img.size,(0,0,0,0)); ImageDraw.Draw(lay).ellipse([cx-w//2,cy-h//2,cx+w//2,cy+h//2],fill=(8,8,10,a))
    img.alpha_composite(lay.filter(ImageFilter.GaussianBlur(90)))
def ctext(d,cx,y,t,f,fill):
    w=d.textlength(t,font=f); d.text((cx-w/2,y),t,font=f,fill=fill)
def statement_png(text,path,big=False):
    W,H=1920,1080; img=Image.new("RGBA",(W,H),(0,0,0,0)); fs=132 if big else 92
    lines=text.split("\n"); d=ImageDraw.Draw(img)
    while fs>48 and max(d.textlength(l,font=ImageFont.truetype(SERIF,fs)) for l in lines)>1720: fs-=4  # shrink to fit frame
    f=ImageFont.truetype(SERIF,fs); lh=fs+22
    tw=max(d.textlength(l,font=f) for l in lines); th=lh*len(lines)
    scrim(img,W//2,H//2,min(1880,int(tw*1.5)),int(th*2.5),170 if big else 145); d=ImageDraw.Draw(img); y=H//2-th//2
    for l in lines: ctext(d,W//2,y,l,f,(*IVORY,255)); y+=lh
    img.save(path)
def texture_png(text,path):
    W,H=1920,1080; img=Image.new("RGBA",(W,H),(0,0,0,0)); f=ImageFont.truetype(SERIF,66)
    lines=text.split("\n"); lh=88; d=ImageDraw.Draw(img); th=lh*len(lines); tw=max(d.textlength(l,font=f) for l in lines)
    scrim(img,W//2,H//2,int(tw*1.6),int(th*3.0),185); d=ImageDraw.Draw(img)
    d.line([W//2-tw*0.6,H//2-th//2-46,W//2+tw*0.6,H//2-th//2-46],fill=(*GOLD,235),width=2); y=H//2-th//2+8
    for l in lines: ctext(d,W//2,y,l,f,(*IVORY,255)); y+=lh
    d.line([W//2-tw*0.6,y+18,W//2+tw*0.6,y+18],fill=(*GOLD,235),width=2); img.save(path)
def chapter_png(num,path):
    W,H=1920,1080; img=Image.new("RGBA",(W,H),(0,0,0,0)); d=ImageDraw.Draw(img)
    scrim(img,W//2,H//2,900,900,150); d=ImageDraw.Draw(img)
    ctext(d,W//2,H//2-190,"S E C T I O N",ImageFont.truetype(SANS,34),(*GOLD,235))
    ctext(d,W//2,H//2-150,num,ImageFont.truetype(SERIF,300),(*IVORY,255))
    d.line([W//2-70,H//2+185,W//2+70,H//2+185],fill=(*GOLD,255),width=3); img.save(path)
def end_png(path):
    W,H=1920,1080; img=Image.new("RGBA",(W,H),(0,0,0,0)); d=ImageDraw.Draw(img)
    scrim(img,W//2,H//2,1300,700,180); d=ImageDraw.Draw(img)
    f=ImageFont.truetype(SERIF,150); t="AURELIS"; ws=[d.textlength(c,font=f) for c in t]; tr=30; x=W//2-(sum(ws)+tr*(len(t)-1))/2
    for c,w in zip(t,ws): d.text((x,H//2-140),c,font=f,fill=(*IVORY,255)); x+=w+tr
    d.line([W//2-150,H//2+55,W//2+150,H//2+55],fill=(*GOLD,255),width=2)
    ctext(d,W//2,H//2+90,"Not financial advice.",ImageFont.truetype(SANS,34),(*GOLD,220)); img.save(path)
for i,(vo,term,kind,text,a,b) in enumerate(seg):
    p=f"{BASE}/t{i}.png"
    if kind=="statement": statement_png(text,p)
    elif kind=="big": statement_png(text,p,big=True)
    elif kind=="texture": texture_png(text,p)
    elif kind=="chapter": chapter_png(text,p)
    elif kind=="end": end_png(p)

# ---- 4) original ambient music bed ----
stage(4,"Generating ambient music bed")
def gen_music(path,T):
    fs=44100; Am=[220.0,261.63,329.63]; F=[174.61,220.0,261.63]; C=[261.63,329.63,392.0]; G=[196.0,246.94,293.66]
    prog=[Am,F,C,G]; chord=8.0; xf=1.8
    def note(freq,n):
        t=np.arange(n)/fs; s=np.zeros(n,dtype=np.float32)
        for h,amp in [(1,1.0),(2,0.26),(3,0.09)]:
            for det in (-0.22,0.22): s+=amp*np.sin(2*np.pi*(freq*h+det)*t).astype(np.float32)
        return s/2.7
    tn=int(T*fs); buf=np.zeros(tn+fs,dtype=np.float32); nch=int((chord+xf)*fs)
    win=np.ones(nch,dtype=np.float32); r=int(xf*fs); ramp=(0.5-0.5*np.cos(np.linspace(0,np.pi,r))).astype(np.float32)
    win[:r]*=ramp; win[-r:]*=ramp[::-1]; pos=0; ci=0
    while pos<tn:
        ch=prog[ci%4]; s=np.zeros(nch,dtype=np.float32)
        for fr in ch: s+=note(fr,nch)
        s+=0.28*note(ch[0]/2,nch); s/=(len(ch)+0.28); s*=win
        e=min(pos+nch,len(buf)); buf[pos:e]+=s[:e-pos]; pos+=int(chord*fs); ci+=1
    buf=buf[:tn]; t=np.arange(tn)/fs; buf*=(1.0+0.12*np.sin(2*np.pi*0.04*t)).astype(np.float32)
    buf/=max(1e-6,float(np.max(np.abs(buf)))); buf*=0.6
    wavfile.write(BASE+"/music_raw.wav",fs,(buf*32767).astype(np.int16))
    subprocess.run(["ffmpeg","-y","-i",BASE+"/music_raw.wav","-af",
        "highpass=f=45,lowpass=f=2300,aecho=0.8:0.9:900:0.28,aecho=0.85:0.85:55:0.2,alimiter=limit=0.9",path],check=True,stderr=subprocess.DEVNULL)
vdur=INTRO+total
if not os.path.exists(BASE+"/music.wav"): gen_music(BASE+"/music.wav",vdur+1)

# ---- 5) AURELIS intro title card ----
stage(5,"Building AURELIS intro")
def spaced(d,cx,y,t,f,fill,tr):
    ws=[d.textlength(c,font=f) for c in t]; x=cx-(sum(ws)+tr*(len(t)-1))/2
    for c,w in zip(t,ws): d.text((x,y),c,font=f,fill=fill); x+=w+tr
W,H=1920,1080; img=Image.new("RGBA",(W,H),(0,0,0,0)); lay=Image.new("RGBA",img.size,(0,0,0,0))
ImageDraw.Draw(lay).ellipse([W//2-1000,H//2-520,W//2+1000,H//2+520],fill=(8,8,10,170))
img.alpha_composite(lay.filter(ImageFilter.GaussianBlur(120))); d=ImageDraw.Draw(img)
spaced(d,W//2,H//2-300,"A U R E L I S",ImageFont.truetype(SANS,40),(*GOLD,235),4)
tf=ImageFont.truetype(SERIF,84)
for k,ln in enumerate(["HOW THE QUIETLY WEALTHY","ACTUALLY SPEND THEIR MONEY"]):
    w=d.textlength(ln,font=tf); d.text((W//2-w/2,H//2-150+k*(tf.size+16)),ln,font=tf,fill=(*IVORY,255))
d.line([W//2-150,H//2+130,W//2+150,H//2+130],fill=(*GOLD,255),width=2)
tl="Real wealth doesn't shout."; sf=ImageFont.truetype(SANS,36)
d.text((W//2-d.textlength(tl,font=sf)/2,H//2+160),tl,font=sf,fill=(*GOLD,220)); img.save(BASE+"/intro.png")
introbg=BASE+"/clips/s3.mp4" if os.path.exists(BASE+"/clips/s3.mp4") else BASE+"/clips/s0.mp4"
fc=(f"[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1,fps=30,{GRADE},eq=brightness=-0.03[bg];"
    "[1:v]format=rgba,fade=t=in:st=0.3:d=1.0:alpha=1,fade=t=out:st=%.2f:d=0.5:alpha=1[tx];[bg][tx]overlay=0:0,format=yuv420p[o]"%(INTRO-0.6))
subprocess.run(["ffmpeg","-y","-t",str(INTRO),"-i",introbg,"-framerate","30","-loop","1","-t",str(INTRO),"-i",BASE+"/intro.png",
    "-filter_complex",fc,"-map","[o]","-an","-r","30","-c:v","libx264","-preset","medium","-pix_fmt","yuv420p",BASE+"/intro.mp4"],check=True,stderr=subprocess.DEVNULL)

# ---- 6) per-segment render: grade + MOTION (text slide-up, chapter fade-from-black) ----
stage(6,"Rendering %d segments (grade + motion)"%len(seg))
def fades(kind,dur):
    if kind=="chapter": return 0.2,0.6,min(dur-0.5,1.7),0.5
    if kind=="end": return 0.4,1.0,dur+9,0.3
    return 0.35,0.8,max(0.1,dur-0.6),0.5
for i,(vo,term,kind,text,a,b) in enumerate(seg):
    dur=round(b-a,3); src=f"{BASE}/clips/s{i}.mp4"; out=f"{BASE}/g{i}.mp4"
    if not os.path.exists(src): continue
    if os.path.exists(out) and os.path.getsize(out)>10000: continue
    base=f"[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1,fps=30,{GRADE}"
    if kind=="chapter": base+=",fade=t=in:st=0:d=0.45"
    if kind:
        fi,fid,fo,fod=fades(kind,dur)
        tx=(base+f"[bg];[1:v]format=rgba,fade=t=in:st={fi}:d={fid}:alpha=1,fade=t=out:st={fo}:d={fod}:alpha=1[txf];"
            f"[bg][txf]overlay=x=0:y='if(lt(t,{fi}),24,if(lt(t,{fi+0.8}),24*(1-(t-{fi})/0.8),0))',format=yuv420p[o]")
        cmd=["ffmpeg","-y","-t",str(dur),"-i",src,"-framerate","30","-loop","1","-t",str(dur),"-i",f"{BASE}/t{i}.png",
             "-filter_complex",tx,"-map","[o]","-an","-r","30","-c:v","libx264","-preset","medium","-pix_fmt","yuv420p",out]
    else:
        cmd=["ffmpeg","-y","-t",str(dur),"-i",src,"-filter_complex",base+",format=yuv420p[o]",
             "-map","[o]","-an","-r","30","-c:v","libx264","-preset","medium","-pix_fmt","yuv420p",out]
    subprocess.run(cmd,check=True,stderr=subprocess.DEVNULL)
    if i%6==0: print("  ..seg %d/%d"%(i,len(seg)),flush=True)

# ---- 7) subtitles (.ass) from char timings, offset by intro ----
stage(7,"Building synced subtitles")
ch=al["characters"]; st=al["character_start_times_seconds"]; n=len(ch); words=[]; k=0
while k<n:
    if ch[k]==" ": k+=1; continue
    s=k
    while k<n and ch[k]!=" ": k+=1
    words.append((s,k-1))
cues=[]; line=[]
def flush(line):
    if line: aa=line[0][0]; bb=line[-1][1]; cues.append((st[aa],ends[bb],"".join(ch[aa:bb+1]).strip()))
for (s,e) in words:
    if line and (e-line[0][0]+1)>46: flush(line); line=[(s,e)]
    else: line.append((s,e))
    if "".join(ch[s:e+1])[-1:] in ".!?": flush(line); line=[]
flush(line)
def T(t):
    t=max(0,t+INTRO); cs=int(round(t*100)); h=cs//360000; cs%=360000; return f"{h}:{cs//6000:02d}:{(cs%6000)//100:02d}.{cs%100:02d}"
ass=["[Script Info]","ScriptType: v4.00+","PlayResX: 1920","PlayResY: 1080","","[V4+ Styles]",
 "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
 "Style: Sub,DejaVu Sans,50,&H00DDECF3,&H00DDECF3,&H00101010,&H80000000,0,0,0,0,100,100,0,0,1,2,1,2,140,140,66,1","",
 "[Events]","Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
for a,b,txt in cues: ass.append(f"Dialogue: 0,{T(a)},{T(b)},Sub,,0,0,0,,{txt.replace('{','(').replace('}',')')}")
open(BASE+"/subs.ass","w").write("\n".join(ass))

# ---- 8) concat + burn subs + mux VO(delayed) + music ----
stage(8,"Concat + subtitles + mix (final render)")
with open(BASE+"/list.txt","w") as fh:
    fh.write("file 'intro.mp4'\n")
    for i in range(len(seg)):
        if os.path.exists(f"{BASE}/g{i}.mp4"): fh.write(f"file 'g{i}.mp4'\n")
subprocess.run(["ffmpeg","-y","-f","concat","-safe","0","-i",BASE+"/list.txt","-c","copy",BASE+"/video.mp4"],check=True,stderr=subprocess.DEVNULL)
fo=max(1.0,vdur-4.0)
fc=(f"[0:v]subtitles={BASE}/subs.ass[v];[1:a]adelay={int(INTRO*1000)}|{int(INTRO*1000)}[vo];"
    f"[2:a]afade=t=in:st=0:d=3,afade=t=out:st={fo:.2f}:d=4,volume=0.06[mus];"
    f"[vo][mus]amix=inputs=2:normalize=0:duration=first[mix];[mix]loudnorm=I=-14:TP=-1.5:LRA=11[a]")
subprocess.run(["ffmpeg","-y","-i",BASE+"/video.mp4","-i",BASE+"/vo.mp3","-i",BASE+"/music.wav","-filter_complex",fc,
    "-map","[v]","-map","[a]","-c:v","libx264","-crf","19","-preset","medium","-pix_fmt","yuv420p",
    "-c:a","aac","-b:a","192k","-movflags","+faststart",BASE+"/aurelis_ep2_v3.mp4"],check=True,stderr=subprocess.DEVNULL)
print("\n\033[1;32m✓ DONE\033[0m  ->  ep2/episode/aurelis_ep2_v3.mp4   (%.0f min %02.0f s)"%(vdur//60,vdur%60),flush=True)
