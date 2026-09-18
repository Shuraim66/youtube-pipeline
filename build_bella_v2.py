"""AURELIS v2 ENGINE test — Jakob Fugger (richest man in history).
Upgrades vs v1: faster ~1.6s cuts, varied punch-in motion, SOUND DESIGN (riser+boom on hook,
boom on punch, whoosh on each beat cut), ~32s, punchy first second. Gold captions + Alice voice.
Output: prototypes/short_fugger.mp4"""
import urllib.request, urllib.parse, json, base64, subprocess, os, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
ROOT="/home/alpha/products/youtube-pipeline"; QW=ROOT+"/quietwealth"
OUT=ROOT+"/prototypes"; os.makedirs(OUT,exist_ok=True)
IMG=ROOT+"/flux_images/bella"   # durable FLUX stills (pre-generated on GPU) + case card
REAL=IMG
os.makedirs(IMG,exist_ok=True)
VOICE_K="am_michael"; LANG_K="a"   # Night File narrator: American male, local Kokoro
EMBLEM=ROOT+"/assets/emblem_watermark.png"
import time,random
def genimg(name,prompt):
    dst=f"{IMG}/{name}.jpg"
    if os.path.exists(dst) and os.path.getsize(dst)>20000: return
    STYLE=", cinematic still, dark eerie moody lighting, 35mm film grain, unsettling, vertical composition"
    url=f"https://image.pollinations.ai/prompt/{urllib.parse.quote(prompt+STYLE)}?width=832&height=1472&model=flux&nologo=true&seed={random.randint(1,999999)}"
    for a in range(6):
        try:
            d=urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0"}),timeout=180).read()
            if len(d)>20000: open(dst,"wb").write(d); print("  img OK",name,flush=True); return
        except Exception as e: print("  img retry",name,a,str(e)[:50],flush=True)
        time.sleep(8*(a+1)+random.random()*4)
    print("  img FAIL",name,flush=True)
IMGPROMPTS={
 "yc_car":"an abandoned 1970s car left on a dark snowy mountain road at night, headlights off, eerie, cold",
 "yc_forest":"a dark dense pine forest on a freezing mountainside at night, fog, dread, moonlight",
 "yc_trailer":"a lonely forest ranger trailer in deep snow at night, one dim window light, isolated, ominous",
}
def _fit1(d,text,fontpath,start,maxw,minsz=28):
    """shrink a single line until it fits maxw."""
    sz=start
    while sz>minsz and d.textlength(text,font=ImageFont.truetype(fontpath,sz))>maxw: sz-=2
    return ImageFont.truetype(fontpath,sz)
def render_casefile(path,case,fields,stamp="UNSOLVED"):
    """Original CASE FILE card — dark dossier with blood-red stamp. Night File's non-slop signature graphic."""
    W,H=1080,1920; img=Image.new("RGB",(W,H),(10,10,12))
    px=img.load()
    for y in range(H):
        t=y/H; base=int(16-8*t)
        for x in range(W): px[x,y]=(base,base,base+2)
    d=ImageDraw.Draw(img)
    RED=(180,28,28)
    d.rectangle([50,50,W-50,H-50],outline=(70,70,74),width=2)
    hf=ImageFont.truetype(SERIFB,72); d.text((90,120),"CASE FILE",font=hf,fill=IVORY)
    d.line([90,220,W-90,220],fill=RED,width=4)
    MW=W-180  # inner text width (x from 90 to W-90)
    cf=_fit1(d,case,SERIF,52,MW); d.text((90,260),case,font=cf,fill=(150,150,155))
    y=430; lf=ImageFont.truetype(SERIFB,46)
    for k,v in fields:
        d.text((90,y),k.upper(),font=lf,fill=RED)
        vf=_fit1(d,v,SERIF,54,MW); d.text((90,y+56),v,font=vf,fill=IVORY)
        d.line([90,y+128,W-90,y+128],fill=(45,45,48),width=1); y+=170
    # blood-red UNSOLVED stamp (rotated)
    st=Image.new("RGBA",(760,220),(0,0,0,0)); sd=ImageDraw.Draw(st)
    sf=ImageFont.truetype(SERIFB,120); sw=sd.textlength(stamp,font=sf)
    sd.rectangle([10,10,750,210],outline=(200,30,30,235),width=8)
    sd.text(((760-sw)/2,40),stamp,font=sf,fill=(200,30,30,235))
    st=st.rotate(11,expand=True,resample=Image.BICUBIC)
    img.paste(st,(int(W/2-st.width/2),int(H-560)),st)
    img.save(path)
CASES={
 "bw_file":("The Bella in the Wych Elm",[("Date","April 1943"),("Location","Hagley Wood, England"),("Victim","Unidentified woman"),("Status","Unsolved")]),
}
SFX=ROOT+"/assets/sfx"
MUSIC=ROOT+"/assets/horror_bed.wav"
ek=open(ROOT+"/.elevenlabs_key").read().strip()
pk=open(ROOT+"/.pexels_key").read().strip()
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
VID_FALLBACK="dark foggy cinematic atmosphere"  # channel-appropriate stock fallback
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
IVORY=(230,232,236); GOLD=(198,30,30); VOICE="onwK4e9ZLuTAKqWW03F9"  # Daniel, deep ominous; GOLD reused as BLOOD-RED
GRADE=("eq=saturation=0.55:contrast=1.20:brightness=-0.02,curves=all='0/0.0 0.25/0.20 0.75/0.72 1/0.92',"
       "colortemperature=temperature=4300:mix=0.5,vignette=PI/4.5,noise=alls=9:allf=t+u")
GRADE_OPEN=("eq=saturation=0.62:contrast=1.20:brightness=0.02,curves=all='0/0.0 0.25/0.24 0.75/0.78 1/0.98',"
       "colortemperature=temperature=4500:mix=0.4,vignette=PI/5,noise=alls=6:allf=t+u")
RGRADE=("eq=saturation=0.18:contrast=1.14:brightness=0.02,colortemperature=temperature=5200:mix=0.2,"
       "vignette=PI/4.5,noise=alls=10:allf=t+u")

SHORTS=[
 {"id":"bella","speed":0.97,
  "hook":["A skull was found","inside a hollow","tree."],
  "punch":"Who put Bella\nin the Wych Elm?","punch_beat":5,
  "cta":["Who was she?","Follow for more"],
  "beats":[
   ("In 1943, four boys poaching in an English wood made a horrifying discovery.",
    ["vid:dark foggy english forest",f"img:{IMG}/bw_forest.jpg"]),
   ("Inside a hollow elm tree was a human skull, and then an entire skeleton.",
    [f"img:{IMG}/bw_tree.jpg","vid:gnarled bare tree trunk fog"]),
   ("Here is what the investigators recorded.",
    [f"card:{IMG}/bw_file.jpg"]),
   ("She had been placed inside the tree while still warm, and a severed hand lay buried nearby.",
    [f"img:{IMG}/bw_ring.jpg","vid:dark forest floor dead leaves"]),
   ("No one could ever identify her. No missing woman was ever matched to the body.",
    [f"img:{IMG}/bw_poster.jpg","vid:dark woodland trees night"]),
   ("Then chilling graffiti appeared: who put Bella in the Wych Elm? Over eighty years later, no one knows.",
    [f"img:{IMG}/bw_graffiti.jpg","vid:foggy dark forest night"]),
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
    HILITE=r"{\c&H0000FF&\fscx90\fscy90\t(0,110,\fscx112\fscy112)}"; RESET=r"{\r}"
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

# FLUX stills pre-generated on the GPU into IMG; here we only render the case-file card.
for name,(case,fields) in CASES.items(): render_casefile(f"{IMG}/{name}.jpg",case,fields)
for S in SHORTS:
    D=f"{OUT}/{S['id']}"; os.makedirs(D,exist_ok=True); beats=S["beats"]
    full=" ".join(b[0] for b in beats)
    if not (os.path.exists(D+"/vo.mp3") and os.path.exists(D+"/vo.json")):
        # LOCAL voice: Kokoro (am_michael) + Whisper alignment -> vo.mp3 + vo.json (ElevenLabs format)
        subprocess.run([sys.executable, ROOT+"/kokoro_align.py", full, VOICE_K, LANG_K, D], check=True)
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
        while n>1 and dur/n<1.3: n-=1
        terms=terms[:n]; sub=dur/n
        for k,term in enumerate(terms):
            segf=f"{D}/s{i}_{k}.mp4"; isreal=term.startswith("rimg:"); isvid=term.startswith("vid:"); iscard=term.startswith("card:"); imgp=term.split(":",1)[1]
            first=(i==0 and k==0); g=RGRADE if isreal else (GRADE_OPEN if first else GRADE)
            if iscard:  # ORIGINAL case-file card (our own graphic) — full-frame, gentle zoom, no blur-fill/crop
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
                vf=(f"[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,gblur=sigma=30[bg];"
                    f"[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920[fg];"
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
        f"[2:a]atrim=0:{total:.2f},afade=t=in:st=0:d=1,afade=t=out:st={total-1.5:.2f}:d=1.5,volume=0.20[mus];"
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
