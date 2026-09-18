"""AURELIS v2 ENGINE test — Jakob Fugger (richest man in history).
Upgrades vs v1: faster ~1.6s cuts, varied punch-in motion, SOUND DESIGN (riser+boom on hook,
boom on punch, whoosh on each beat cut), ~32s, punchy first second. Gold captions + Alice voice.
Output: prototypes/short_fugger.mp4"""
import urllib.request, urllib.parse, json, base64, subprocess, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
ROOT="/home/alpha/products/youtube-pipeline"; QW=ROOT+"/quietwealth"
OUT=ROOT+"/prototypes"; os.makedirs(OUT,exist_ok=True)
SCR="/tmp/claude-1000/-home-alpha-products-youtube-pipeline/d26cef8b-33f8-460d-a296-387d6471b220/scratchpad/mansamusa"
IMG=SCR+"/img"; REAL=SCR+"/real"
os.makedirs(IMG,exist_ok=True); os.makedirs(REAL,exist_ok=True)
import time,random
def genimg(name,prompt):
    dst=f"{IMG}/{name}.jpg"
    if os.path.exists(dst) and os.path.getsize(dst)>20000: return
    STYLE=", cinematic still, bright high-key lighting, well lit, vivid, 35mm film, highly detailed, vertical composition"
    url=f"https://image.pollinations.ai/prompt/{urllib.parse.quote(prompt+STYLE)}?width=832&height=1472&model=flux&nologo=true&seed={random.randint(1,999999)}"
    for a in range(6):
        try:
            d=urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0"}),timeout=180).read()
            if len(d)>20000: open(dst,"wb").write(d); print("  img OK",name,flush=True); return
        except Exception as e: print("  img retry",name,a,str(e)[:50],flush=True)
        time.sleep(8*(a+1)+random.random()*4)
    print("  img FAIL",name,flush=True)
IMGPROMPTS={
 "mm_king":"a regal medieval West African emperor in flowing gold robes on an ornate throne holding a gold staff, bright warm light, majestic, vivid",
 "mm_caravan":"a vast desert caravan of camels carrying gold across bright Sahara sand dunes under blue sky, epic, vivid daylight",
}
def render_card(path,big,label,sub=""):
    """Original data card — big gold number on a premium dark gradient. Signals real, non-slop production."""
    W,H=1080,1920; img=Image.new("RGB",(W,H),(12,12,14))
    top=(20,20,26); bot=(8,8,10); px=img.load()
    for y in range(H):
        t=y/H; c=tuple(int(top[j]+(bot[j]-top[j])*t) for j in range(3))
        for x in range(W): px[x,y]=c
    d=ImageDraw.Draw(img)
    # faint vignette-ish frame
    d.rectangle([46,46,W-46,H-46],outline=(60,52,34),width=2)
    fs=190; f=ImageFont.truetype(SERIFB,fs)
    while d.textlength(big,font=f)>W-160 and fs>90: fs-=8; f=ImageFont.truetype(SERIFB,fs)
    bw=d.textlength(big,font=f); by=H//2-fs
    d.text(((W-bw)/2,by),big,font=f,fill=GOLD)
    d.line([W/2-120,by+fs+30,W/2+120,by+fs+30],fill=GOLD,width=4)
    lf=ImageFont.truetype(SERIF,64); ly=by+fs+70
    for ln in label.split("\n"):
        lw=d.textlength(ln,font=lf); d.text(((W-lw)/2,ly),ln,font=lf,fill=IVORY); ly+=80
    if sub:
        sf=ImageFont.truetype(SERIF,44); sw=d.textlength(sub,font=sf); d.text(((W-sw)/2,ly+20),sub,font=sf,fill=(150,150,155))
    img.save(path)
CARDS={
 "c_worth":("$400B+","estimated fortune, inflation-adjusted","richest person in history"),
 "c_gold":("~12 years","for Cairo's gold price to recover","after his visit in 1324"),
}
SFX=ROOT+"/assets/sfx"
MUSIC=QW+"/ep2/episode/music.wav"
ek=open(ROOT+"/.elevenlabs_key").read().strip()
pk=open(ROOT+"/.pexels_key").read().strip()
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
VID_FALLBACK="luxury cinematic gold wealth atmosphere"  # channel-appropriate stock fallback
def pexels(term,need):
    for orient in ("portrait","landscape"):
        url="https://api.pexels.com/videos/search?query=%s&per_page=12&orientation=%s&size=medium"%(urllib.parse.quote(term),orient)
        try: vids=json.load(urllib.request.urlopen(urllib.request.Request(url,headers={"Authorization":pk,"User-Agent":UA}),timeout=30)).get("videos",[])
        except Exception: vids=[]
        for v in vids:
            if v.get("duration",0)<max(2,need): continue
            f=sorted([x for x in v["video_files"] if x.get("file_type")=="video/mp4"],key=lambda x:-(x.get("height") or 0))
            if f: return f[0]["link"]
    return None
def dl(url,dst):
    with urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":UA}),timeout=180) as r,open(dst,"wb") as f: f.write(r.read())
SERIF="/usr/share/fonts/truetype/noto/NotoSerifDisplay-Regular.ttf"; SERIFB="/usr/share/fonts/truetype/noto/NotoSerifDisplay-Bold.ttf"
IVORY=(243,236,221); GOLD=(201,169,106); VOICE="TX3LPaxmHKxFdv7VOQHJ"  # Liam - Energetic, Social Media Creator (per playbook)
GRADE=("eq=saturation=0.82:contrast=1.08:brightness=0.008,curves=all='0/0.04 0.25/0.26 0.75/0.78 1/0.96',"
       "colortemperature=temperature=5200:mix=0.5,vignette=PI/6,noise=alls=6:allf=t+u")
GRADE_OPEN=("eq=saturation=1.02:contrast=1.15:brightness=0.05,curves=all='0/0.02 0.25/0.30 0.75/0.86 1/1.0',"
       "colortemperature=temperature=6000:mix=0.3,vignette=PI/10,noise=alls=3:allf=t+u")
RGRADE=("eq=saturation=0.22:contrast=1.12:brightness=0.02,colortemperature=temperature=5600:mix=0.2,"
       "vignette=PI/6,noise=alls=8:allf=t+u")  # near-monochrome wash for real archival photos (rimg:)

SHORTS=[
 {"id":"mansamusa","speed":1.03,
  "hook":["The richest man ever","gave away so much gold"],
  "punch":"He crashed\nan economy.","punch_beat":3,
  "cta":["You've never heard","his name."],
  "beats":[
   ("The richest man who ever lived gave away so much gold that he accidentally wrecked an entire economy.",
    [f"img:{IMG}/mm_king.jpg","vid:gold bars bullion stacked"]),
   ("His name was Mansa Musa, ruler of the Mali Empire in the 1300s, and he controlled about half the world's gold.",
    [f"img:{IMG}/mm_king.jpg","vid:sahara desert sand dunes"]),
   ("Estimates put his fortune above 400 billion dollars, more than any billionaire alive today.",
    [f"card:{IMG}/c_worth.jpg"]),
   ("In 1324 he crossed into Cairo and handed out so much gold that its price collapsed for over a decade.",
    [f"card:{IMG}/c_gold.jpg","vid:gold bullion bars vault"]),
   ("Historians still call him the richest human in history. And most people have never heard his name.",
    [f"img:{IMG}/mm_caravan.jpg","vid:gold ingots bars close up"]),
 ]},
]
def scrim(img,cx,cy,w,h,a=180):
    lay=Image.new("RGBA",img.size,(0,0,0,0)); ImageDraw.Draw(lay).ellipse([cx-w//2,cy-h//2,cx+w//2,cy+h//2],fill=(8,8,10,a))
    img.alpha_composite(lay.filter(ImageFilter.GaussianBlur(90)))
def text_png(lines,path,ycenter,fs,gold_last=False,rule=False,bold=False):
    FONT=SERIFB if bold else SERIF; sa=215 if bold else 180; ow=3 if bold else 2
    W,H=1080,1920; img=Image.new("RGBA",(W,H),(0,0,0,0)); d=ImageDraw.Draw(img)
    while fs>44 and max(d.textlength(l,font=ImageFont.truetype(FONT,fs)) for l in lines)>920: fs-=4
    f=ImageFont.truetype(FONT,fs); lh=fs+14; th=lh*len(lines)
    scrim(img,540,ycenter,980,th+260,a=sa); d=ImageDraw.Draw(img); y=ycenter-th//2
    for i,l in enumerate(lines):
        w=d.textlength(l,font=f); col=GOLD if (gold_last and i==len(lines)-1) else IVORY
        for dx in(-ow,ow):
            for dy in(-ow,ow): d.text((540-w/2+dx,y+dy),l,font=f,fill=(8,8,10))
        d.text((540-w/2,y),l,font=f,fill=col); y+=lh
    if rule: d.line([540-90,ycenter+th//2+22,540+90,ycenter+th//2+22],fill=(*GOLD,255),width=3)
    img.save(path)
def subs(js,path,fs=98,mv=360):
    al=json.load(open(js)); ch=al["characters"]; st=al["character_start_times_seconds"]; en=al["character_end_times_seconds"]; n=len(ch)
    words=[]; k=0
    while k<n:
        if ch[k]==" ": k+=1; continue
        s=k
        while k<n and ch[k]!=" ": k+=1
        w="".join(ch[s:k]).strip()
        if w: words.append((st[s],en[k-1],w))
    chunks=[]; cur=[]
    for i,(ws,we,wt) in enumerate(words):
        cur.append(i)
        if len(cur)>=3 or wt[-1] in ".!?": chunks.append(cur); cur=[]
    if cur: chunks.append(cur)
    idx2chunk={}
    for c in chunks:
        for i in c: idx2chunk[i]=c
    HILITE=r"{\c&H00E5FF&\fscx90\fscy90\t(0,110,\fscx112\fscy112)}"; RESET=r"{\r}"
    def clean(w): return "".join(x for x in w.upper() if x.isalnum() or x in "'&-.$")
    def T(t):
        t=max(0,t); cs=int(round(t*100)); h=cs//360000; cs%=360000; return f"{h}:{cs//6000:02d}:{(cs%6000)//100:02d}.{cs%100:02d}"
    ev=[]
    for i,(ws,we,wt) in enumerate(words):
        a=ws; b=words[i+1][0] if i+1<len(words) else we
        if b<=a: b=a+0.2
        parts=[HILITE+clean(words[j][2])+RESET if j==i else clean(words[j][2]) for j in idx2chunk[i]]
        ev.append(f"Dialogue: 0,{T(a)},{T(b)},Caption,,0,0,0,,{' '.join(parts)}")
    out=["[Script Info]","ScriptType: v4.00+","PlayResX: 1080","PlayResY: 1920","WrapStyle: 0","ScaledBorderAndShadow: yes","","[V4+ Styles]",
     "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
     f"Style: Caption,Anton,{fs},&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,6,0,2,60,60,{mv},1","",
     "[Events]","Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
    out+=ev; open(path,"w").write("\n".join(out))
def kb(style):
    if style=="in_fast": return "min(zoom+0.0018,1.22)","iw/2-(iw/zoom/2)","ih/2-(ih/zoom/2)"
    if style=="in":      return "min(zoom+0.0010,1.15)","iw/2-(iw/zoom/2)","ih/2-(ih/zoom/2)"
    if style=="panR":    return "1.12","iw/2-(iw/zoom/2)+(on*0.8)","ih/2-(ih/zoom/2)"
    if style=="panL":    return "1.12","iw/2-(iw/zoom/2)-(on*0.8)","ih/2-(ih/zoom/2)"
    if style=="up":      return "min(zoom+0.0008,1.13)","iw/2-(iw/zoom/2)","ih/2-(ih/zoom/2)-(on*0.7)"
    return "min(zoom+0.0010,1.14)","iw/2-(iw/zoom/2)","ih/2-(ih/zoom/2)"
MOVES=["in","panR","panL","up"]

for name,pr in IMGPROMPTS.items(): genimg(name,pr)
for name,(big,label,sub) in CARDS.items(): render_card(f"{IMG}/{name}.jpg",big,label,sub)
for S in SHORTS:
    D=f"{OUT}/{S['id']}"; os.makedirs(D,exist_ok=True); beats=S["beats"]
    full=" ".join(b[0] for b in beats)
    if not (os.path.exists(D+"/vo.mp3") and os.path.exists(D+"/vo.json")):
        body=json.dumps({"text":full,"model_id":"eleven_turbo_v2_5","voice_settings":{"stability":0.35,"similarity_boost":0.80,"style":0.15,"use_speaker_boost":True,"speed":S.get("speed",1.0)}}).encode()
        r=urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}/with-timestamps",data=body,headers={"xi-api-key":ek,"Content-Type":"application/json"},method="POST")
        resp=json.load(urllib.request.urlopen(r,timeout=180)); open(D+"/vo.mp3","wb").write(base64.b64decode(resp["audio_base64"])); json.dump(resp["alignment"],open(D+"/vo.json","w"))
    ends=json.load(open(D+"/vo.json"))["character_end_times_seconds"]; vend=ends[-1]
    seg=[]; cum=0; prev=0.0
    for vo,terms in beats:
        ei=min(cum+len(vo)-1,len(ends)-1); seg.append([terms,prev,ends[ei]]); prev=ends[ei]; cum+=len(vo)+1
    seg[-1][2]=vend
    tail=1.3; total=vend+tail
    order=[]; gi=0; cutmarks=[]  # start time of each clip
    tcur=0.0
    for i,(terms,a,b) in enumerate(seg):
        dur=b-a; n=len(terms)
        while n>1 and dur/n<1.15: n-=1
        terms=terms[:n]; sub=dur/n
        for k,term in enumerate(terms):
            segf=f"{D}/s{i}_{k}.mp4"; isreal=term.startswith("rimg:"); isvid=term.startswith("vid:"); iscard=term.startswith("card:"); imgp=term.split(":",1)[1]
            first=(i==0 and k==0); g=RGRADE if isreal else (GRADE_OPEN if first else GRADE)
            if iscard:  # ORIGINAL data card (our own graphic) — full-frame, gentle zoom, no blur-fill/crop
                if not (os.path.exists(segf) and os.path.getsize(segf)>10000):
                    z,x,y=kb("in")
                    vf=(f"[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,format=yuv420p,"
                        f"zoompan=z='{z}':d=1:x='{x}':y='{y}':s=1080x1920:fps=24[o]")
                    subprocess.run(["ffmpeg","-y","-loop","1","-framerate","24","-t",str(round(sub,3)),"-i",imgp,"-filter_complex",vf,"-map","[o]","-an","-r","24","-t",str(round(sub,3)),"-c:v","libx264","-preset","medium","-pix_fmt","yuv420p",segf],check=True,stderr=subprocess.DEVNULL)
                order.append(segf); cutmarks.append(tcur); tcur+=sub; gi+=1
                continue
            if isvid:  # REAL stock footage (Pexels) — actual motion, de-templates the channel
                if not (os.path.exists(segf) and os.path.getsize(segf)>10000):
                    src=f"{D}/c{i}_{k}.mp4"
                    if not (os.path.exists(src) and os.path.getsize(src)>10000):
                        link=pexels(imgp,sub) or pexels(VID_FALLBACK,sub)
                        if link:
                            try: dl(link,src)
                            except Exception: pass
                    if os.path.exists(src) and os.path.getsize(src)>10000:
                        vf=f"[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=24,{GRADE},format=yuv420p[o]"
                        subprocess.run(["ffmpeg","-y","-ss","0.3","-t",str(round(sub,3)),"-i",src,"-filter_complex",vf,"-map","[o]","-an","-r","24","-t",str(round(sub,3)),"-c:v","libx264","-preset","medium","-pix_fmt","yuv420p",segf],check=True,stderr=subprocess.DEVNULL)
                if os.path.exists(segf) and os.path.getsize(segf)>10000:
                    order.append(segf); cutmarks.append(tcur); tcur+=sub; gi+=1
                continue
            style="in_fast" if (first or (i==S["punch_beat"] and k==0)) else MOVES[gi%4]
            z,x,y=kb(style)
            if not (os.path.exists(segf) and os.path.getsize(segf)>10000):
                vf=(f"[0:v]crop=iw:ih*0.94:0:0,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,gblur=sigma=30[bg];"
                    f"[0:v]crop=iw:ih*0.94:0:0,scale=1040:1840:force_original_aspect_ratio=decrease[fg];"
                    f"[bg][fg]overlay=(W-w)/2:(H-h)/2,{g},format=yuv420p,"
                    f"zoompan=z='{z}':d=1:x='{x}':y='{y}':s=1080x1920:fps=24[o]")
                subprocess.run(["ffmpeg","-y","-loop","1","-framerate","24","-t",str(round(sub,3)),"-i",imgp,"-filter_complex",vf,"-map","[o]","-an","-r","24","-t",str(round(sub,3)),"-c:v","libx264","-preset","medium","-pix_fmt","yuv420p",segf],check=True,stderr=subprocess.DEVNULL)
            order.append(segf); cutmarks.append(tcur); tcur+=sub; gi+=1
    first=order[0]
    subprocess.run(["ffmpeg","-y","-ss","0.3","-i",first,"-frames:v","1","-vf","scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920",f"{D}/tail_still.png"],check=True,stderr=subprocess.DEVNULL)
    subprocess.run(["ffmpeg","-y","-loop","1","-framerate","24","-t",str(round(tail,3)),"-i",f"{D}/tail_still.png","-filter_complex",
        f"[0:v]zoompan=z='min(zoom+0.0009,1.12)':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=24,{GRADE},format=yuv420p[o]",
        "-map","[o]","-an","-r","24","-t",str(round(tail,3)),"-c:v","libx264","-preset","medium","-pix_fmt","yuv420p",f"{D}/s_tail.mp4"],check=True,stderr=subprocess.DEVNULL)
    with open(D+"/list.txt","w") as fh:
        for f in order: fh.write(f"file '{os.path.basename(f)}'\n")
        fh.write("file 's_tail.mp4'\n")
    subprocess.run(["ffmpeg","-y","-f","concat","-safe","0","-i",D+"/list.txt","-c","copy",D+"/v.mp4"],check=True,stderr=subprocess.DEVNULL)
    text_png(S["hook"],D+"/hook.png",1180,128,gold_last=True,rule=True,bold=True)
    text_png(S["punch"].split("\n"),D+"/punch.png",840,98,rule=True)
    text_png(S["cta"],D+"/cta.png",1040,60,gold_last=True)
    subs(D+"/vo.json",D+"/subs.ass")
    pb=S["punch_beat"]; ps,pe=seg[pb][1],seg[pb][2]
    # beat-start whoosh times (skip 0 -> hook already has riser/boom)
    beatstarts=[round(seg[i][1],3) for i in range(1,len(seg))]
    punch_ms=int(ps*1000);
    # audio graph: vo(1) music(2) hook(3) punch(4) cta(5) boom(6) riser(7) whoosh(8)
    wsplit="".join(f"[w{j}]" for j in range(len(beatstarts)))
    wchain=f"[8:a]asplit={len(beatstarts)}{wsplit};" if beatstarts else ""
    wmix=""
    for j,tt in enumerate(beatstarts):
        wchain+=f"[w{j}]adelay={int(tt*1000)},volume=0.35[wd{j}];"; wmix+=f"[wd{j}]"
    fc=(f"[0:v]ass={D}/subs.ass:fontsdir=/home/alpha/products/openshorts/fonts[b];"
        f"[3:v]format=rgba,fade=t=out:st=2.6:d=0.4:alpha=1[hk];"
        f"[4:v]format=rgba,fade=t=in:st={ps+0.2:.2f}:d=0.4:alpha=1,fade=t=out:st={pe-0.5:.2f}:d=0.4:alpha=1[pn];"
        f"[5:v]format=rgba,fade=t=in:st={vend+0.3:.2f}:d=0.5:alpha=1[ct];"
        f"[b][hk]overlay=0:0[v1];[v1][pn]overlay=0:0[v2];[v2][ct]overlay=0:0[v];"
        f"[1:a]apad,atrim=0:{total:.2f},asetpts=PTS-STARTPTS,volume=1.15[vo];"
        f"[2:a]atrim=0:{total:.2f},afade=t=in:st=0:d=1,afade=t=out:st={total-1.5:.2f}:d=1.5,volume=0.16[mus];"
        f"[6:a]asplit=2[bm1][bm2];[bm1]adelay=120,volume=0.8[boomh];[bm2]adelay={punch_ms},volume=0.75[boomp];"
        f"[7:a]adelay=0,volume=0.55[rise];"
        f"{wchain}"
        f"[vo][mus][boomh][boomp][rise]{wmix}amix=inputs={5+len(beatstarts)}:normalize=0:dropout_transition=0[mx];"
        f"[mx]loudnorm=I=-14:TP=-1.5:LRA=11,afade=t=in:st=0:d=0.1,afade=t=out:st={total-0.5:.2f}:d=0.5[a]")
    subprocess.run(["ffmpeg","-y","-i",D+"/v.mp4","-i",D+"/vo.mp3","-i",MUSIC,
        "-framerate","24","-loop","1","-t",str(total),"-i",D+"/hook.png",
        "-framerate","24","-loop","1","-t",str(total),"-i",D+"/punch.png",
        "-framerate","24","-loop","1","-t",str(total),"-i",D+"/cta.png",
        "-i",SFX+"/boom.wav","-i",SFX+"/riser.wav","-i",SFX+"/whoosh.wav",
        "-filter_complex",fc,"-map","[v]","-map","[a]","-c:v","libx264","-crf","20","-preset","medium","-pix_fmt","yuv420p",
        "-c:a","aac","-b:a","160k","-t",str(total),"-movflags","+faststart",f"{OUT}/short_{S['id']}.mp4"],check=True,stderr=subprocess.DEVNULL)
    print(f"V2 DONE {S['id']}  {len(order)} clips  total={total:.1f}s (cut ~{total/max(1,len(order)):.1f}s)",flush=True)
print("FUGGER V2 DONE",flush=True)
