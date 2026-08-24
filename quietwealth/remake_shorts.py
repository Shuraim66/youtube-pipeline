"""Remake Ep1 Shorts to the distribution SPEC:
 - 60-90s each (was 18-20s), reframed from Ep1's OWN sections (reuse VO+clips -> NO new spend)
 - 9:16 1080x1920, 24fps, -14 LUFS
 - all text INSIDE vertical safe box (x:60-960, y:220-1500): subs bottom-safe, hook upper, focal card center
Output: quietwealth/shorts_v2/short_{income,privacy,quality}.mp4"""
import json, re, os, subprocess
from PIL import Image, ImageDraw, ImageFont, ImageFilter

QW="/home/alpha/products/youtube-pipeline/quietwealth"; EP=QW+"/episode"
OUT=QW+"/shorts_v2"; os.makedirs(OUT,exist_ok=True)
SERIF="/usr/share/fonts/truetype/noto/NotoSerifDisplay-Regular.ttf"
SANS="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
IVORY=(243,236,221); GOLD=(201,169,106)
GRADE=("eq=saturation=0.80:contrast=1.06:brightness=0.006,"
       "curves=all='0/0.05 0.25/0.27 0.75/0.78 1/0.95',"
       "colortemperature=temperature=5300:mix=0.5,vignette=PI/6,noise=alls=6:allf=t+u")

# ---- per-beat time boundaries from the cached episode VO (same math as build_episode) ----
src=open(QW+"/build_episode.py").read()
beats=re.findall(r'\("((?:[^"\\]|\\.)*?)","',src)
al=json.load(open(EP+"/vo.json")); ends=al["character_end_times_seconds"]; total=ends[-1]
seg=[]; cum=0; prev=0.0
for vo in beats:
    ei=min(cum+len(vo)-1,len(ends)-1); seg.append((prev,ends[ei])); prev=ends[ei]; cum+=len(vo)+1
seg[-1]=(seg[-1][0],total)

# id, hook lines, beat lo..hi (inclusive), focal card text, focal beat, big?
SHORTS=[
 ("income", ["INCOME ISN'T","WEALTH"],      22,29, "Income is what comes in.\nWealth is what you keep.", 25, True),
 ("privacy",["PRIVACY","IS POWER"],         39,44, "Real wealth\ndoesn't shout.",                       44, True),
 ("quality",["SEEN","vs. FORGOTTEN"],        5,12, "Seen   vs.   Forgotten",                            10, False),
]

# ---------- text renderers (all kept inside safe box) ----------
def scrim(img,cx,cy,w,h,a=160):
    lay=Image.new("RGBA",img.size,(0,0,0,0)); ImageDraw.Draw(lay).ellipse([cx-w//2,cy-h//2,cx+w//2,cy+h//2],fill=(8,8,10,a))
    img.alpha_composite(lay.filter(ImageFilter.GaussianBlur(90)))
def hook_png(lines,path):
    W,H=1080,1920; img=Image.new("RGBA",(W,H),(0,0,0,0)); d=ImageDraw.Draw(img)
    fs=104
    while fs>60 and max(d.textlength(l,font=ImageFont.truetype(SERIF,fs)) for l in lines)>840: fs-=4
    f=ImageFont.truetype(SERIF,fs); lh=fs+12; th=lh*len(lines); y0=360   # top-safe clear (>220)
    scrim(img,540,y0+th//2-lh//2,900,th+220,175); d=ImageDraw.Draw(img); y=y0
    for i,l in enumerate(lines):
        w=d.textlength(l,font=f); x=540-w/2; col=GOLD if i==len(lines)-1 else IVORY
        for dx in(-2,2):
            for dy in(-2,2): d.text((x+dx,y+dy),l,font=f,fill=(8,8,10))
        d.text((x,y),l,font=f,fill=col); y+=lh
    img.save(path)
def card_png(text,path,big):
    W,H=1080,1920; img=Image.new("RGBA",(W,H),(0,0,0,0)); d=ImageDraw.Draw(img)
    fs=86 if big else 92; lines=text.split("\n")
    while fs>50 and max(d.textlength(l,font=ImageFont.truetype(SERIF,fs)) for l in lines)>840: fs-=4
    f=ImageFont.truetype(SERIF,fs); lh=fs+20; th=lh*len(lines); cy=820   # sweet spot 780-900, inside safe
    scrim(img,540,cy,940,th+260,175); d=ImageDraw.Draw(img); y=cy-th//2
    for l in lines:
        w=d.textlength(l,font=f); d.text((540-w/2,y),l,font=f,fill=(*IVORY,255)); y+=lh
    if not big:  # gold underline accent for the "vs" card
        d.line([540-90,cy+th//2+26,540+90,cy+th//2+26],fill=(*GOLD,255),width=3)
    img.save(path)

def subs(t0,t1,path):
    ch=al["characters"]; st=al["character_start_times_seconds"]; en=al["character_end_times_seconds"]; n=len(ch)
    words=[]; k=0
    while k<n:
        if ch[k]==" ": k+=1; continue
        s=k
        while k<n and ch[k]!=" ": k+=1
        words.append((s,k-1))
    cues=[]; line=[]
    def fl(line):
        if line:
            a=line[0][0]; b=line[-1][1]
            if st[a]>=t0-0.08 and en[b]<=t1+0.25: cues.append((st[a]-t0,en[b]-t0,"".join(ch[a:b+1]).strip()))
    for (s,e) in words:
        if line and (e-line[0][0]+1)>24: fl(line); line=[(s,e)]
        else: line.append((s,e))
        if "".join(ch[s:e+1])[-1:] in ".!?": fl(line); line=[]
    fl(line)
    def T(t):
        t=max(0,t); cs=int(round(t*100)); h=cs//360000; cs%=360000; return f"{h}:{cs//6000:02d}:{(cs%6000)//100:02d}.{cs%100:02d}"
    out=["[Script Info]","ScriptType: v4.00+","PlayResX: 1080","PlayResY: 1920","",
     "[V4+ Styles]","Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
     "Style: Sub,DejaVu Sans,52,&H00DDECF3,&H00DDECF3,&H00101010,&H80000000,1,0,0,0,100,100,0,0,1,3,2,2,120,120,470,1","",
     "[Events]","Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
    for a,b,t in cues: out.append(f"Dialogue: 0,{T(a)},{T(b)},Sub,,0,0,0,,{t.replace('{','(').replace('}',')')}")
    open(path,"w").write("\n".join(out))

# ---------- build each short ----------
for sid,hook,lo,hi,card,cb,big in SHORTS:
    D=f"{OUT}/{sid}"; os.makedirs(D,exist_ok=True)
    t0=seg[lo][0]; t1=seg[hi][1]
    hook_png(hook,D+"/hook.png"); card_png(card,D+"/card.png",big); subs(t0,t1,D+"/subs.ass")
    for i in range(lo,hi+1):
        dur=round(seg[i][1]-seg[i][0],3); srcc=f"{EP}/clips/s{i}.mp4"; segout=f"{D}/b{i}.mp4"
        base=f"[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=24,{GRADE}"
        if i==cb:
            fc=(base+"[bg];[1:v]format=rgba,fade=t=in:st=0.35:d=0.7:alpha=1,"
                f"fade=t=out:st={max(0.1,dur-0.6):.2f}:d=0.5:alpha=1[tx];[bg][tx]overlay=0:0,format=yuv420p[o]")
            cmd=["ffmpeg","-y","-t",str(dur),"-i",srcc,"-framerate","24","-loop","1","-t",str(dur),"-i",D+"/card.png",
                 "-filter_complex",fc,"-map","[o]","-an","-r","24","-c:v","libx264","-preset","medium","-pix_fmt","yuv420p",segout]
        else:
            cmd=["ffmpeg","-y","-t",str(dur),"-i",srcc,"-filter_complex",base+",format=yuv420p[o]",
                 "-map","[o]","-an","-r","24","-c:v","libx264","-preset","medium","-pix_fmt","yuv420p",segout]
        subprocess.run(cmd,check=True,stderr=subprocess.DEVNULL)
    with open(D+"/list.txt","w") as fh:
        for i in range(lo,hi+1): fh.write(f"file 'b{i}.mp4'\n")
    subprocess.run(["ffmpeg","-y","-f","concat","-safe","0","-i",D+"/list.txt","-c","copy",D+"/v.mp4"],check=True,stderr=subprocess.DEVNULL)
    # extract VO span (accurate seek after -i), keep as wav for clean loudnorm at mux
    subprocess.run(["ffmpeg","-y","-i",EP+"/vo.mp3","-ss",str(t0),"-to",str(t1),"-c:a","pcm_s16le",D+"/vo.wav"],check=True,stderr=subprocess.DEVNULL)
    fc=(f"[0:v]subtitles={D}/subs.ass[b];"
        f"[2:v]format=rgba,fade=t=in:st=0.3:d=0.6:alpha=1,fade=t=out:st=2.4:d=0.7:alpha=1[hk];"
        f"[b][hk]overlay=0:0[v];[1:a]loudnorm=I=-14:TP=-1.5:LRA=11[a]")
    subprocess.run(["ffmpeg","-y","-i",D+"/v.mp4","-i",D+"/vo.wav","-framerate","24","-loop","1","-t","3.1","-i",D+"/hook.png",
        "-filter_complex",fc,"-map","[v]","-map","[a]","-r","24","-c:v","libx264","-crf","20","-preset","medium","-pix_fmt","yuv420p",
        "-c:a","aac","-b:a","192k","-shortest","-movflags","+faststart",f"{OUT}/short_{sid}.mp4"],check=True,stderr=subprocess.DEVNULL)
    print(f"SHORT DONE {sid}  {t1-t0:.1f}s  beats {lo}-{hi}",flush=True)
print("ALL SHORTS V2 DONE",flush=True)
