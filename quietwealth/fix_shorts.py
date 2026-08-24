"""Fix shorts: (1) add light music bed to all 3, (2) clean audio fades (fix abnormal start/end),
(3) rebuild 'quality' starting at beat 6 (drop confusing 'start with number seven') -> beats 6-13 (68s).
income/privacy: keep video, rebuild audio only. quality: re-fetch clips (originals were deleted) + full rebuild."""
import ast, json, os, subprocess, urllib.request, urllib.parse
from PIL import Image, ImageDraw, ImageFont, ImageFilter
ROOT="/home/alpha/products/youtube-pipeline"; QW=ROOT+"/quietwealth"; EP=QW+"/episode"; OUT=QW+"/shorts_v2"
MUSIC=EP+"/music.wav"; VO=EP+"/vo.mp3"
pk=open(ROOT+"/.pexels_key").read().strip()
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
SERIF="/usr/share/fonts/truetype/noto/NotoSerifDisplay-Regular.ttf"; SANS="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
IVORY=(243,236,221); GOLD=(201,169,106); MUSVOL="0.06"
GRADE=("eq=saturation=0.80:contrast=1.06:brightness=0.006,curves=all='0/0.05 0.25/0.27 0.75/0.78 1/0.95',"
       "colortemperature=temperature=5300:mix=0.5,vignette=PI/6,noise=alls=6:allf=t+u")

src=open(QW+"/build_episode.py").read(); b0=src.index("BEATS="); b1=src.index("\nfull=",b0)
B=ast.literal_eval(src[b0+6:b1].strip())
al=json.load(open(EP+"/vo.json")); ends=al["character_end_times_seconds"]; ch=al["characters"]
st=al["character_start_times_seconds"]; en=ends; tot=ends[-1]
seg=[]; cum=0; prev=0.0
for vo,term,k,t in B:
    ei=min(cum+len(vo)-1,len(ends)-1); seg.append((prev,ends[ei])); prev=ends[ei]; cum+=len(vo)+1
seg[-1]=(seg[-1][0],tot)

def build_audio(t0,t1,dst):
    dur=t1-t0
    fc=(f"[0:a]atrim={t0}:{t1},asetpts=PTS-STARTPTS[vo];"
        f"[1:a]atrim=0:{dur},asetpts=PTS-STARTPTS,volume={MUSVOL}[mus];"
        f"[vo][mus]amix=inputs=2:normalize=0:duration=first[mix];"
        f"[mix]loudnorm=I=-14:TP=-1.5:LRA=11[ln];"
        f"[ln]afade=t=in:st=0:d=0.3,afade=t=out:st={dur-0.7:.2f}:d=0.7[a]")
    subprocess.run(["ffmpeg","-y","-i",VO,"-i",MUSIC,"-filter_complex",fc,"-map","[a]","-c:a","pcm_s16le",dst],
                   check=True,stderr=subprocess.DEVNULL)

# ---------- (1)(2) income + privacy: rebuild audio, keep video ----------
for sid,lo,hi in [("income",22,29),("privacy",39,44)]:
    t0,t1=seg[lo][0],seg[hi][1]; aud=f"{OUT}/{sid}_aud.wav"; build_audio(t0,t1,aud)
    tmp=f"{OUT}/{sid}_new.mp4"
    subprocess.run(["ffmpeg","-y","-i",f"{OUT}/short_{sid}.mp4","-i",aud,"-map","0:v","-c:v","copy",
        "-map","1:a","-c:a","aac","-b:a","160k","-shortest","-movflags","+faststart",tmp],check=True,stderr=subprocess.DEVNULL)
    os.replace(tmp,f"{OUT}/short_{sid}.mp4"); os.remove(aud)
    print(f"audio-fixed {sid} ({t1-t0:.1f}s)",flush=True)

# ---------- (3) quality: rebuild from beats 6-13 ----------
QLO,QHI,QCB=6,13,10; QHOOK=["SEEN","vs. FORGOTTEN"]; QCARD="Seen   vs.   Forgotten"
D=f"{OUT}/qfix"; os.makedirs(D,exist_ok=True)
def dl(url,dst):
    with urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":UA}),timeout=180) as r,open(dst,"wb") as f: f.write(r.read())
def pexels(term,need):
    for orient in ("portrait","landscape"):
        url="https://api.pexels.com/videos/search?query=%s&per_page=12&orientation=%s&size=medium"%(urllib.parse.quote(term),orient)
        try: vids=json.load(urllib.request.urlopen(urllib.request.Request(url,headers={"Authorization":pk,"User-Agent":UA}),timeout=30)).get("videos",[])
        except Exception: vids=[]
        for v in vids:
            if v["duration"]<max(4,need): continue
            f=sorted([x for x in v["video_files"] if x.get("file_type")=="video/mp4"],key=lambda x:-(x.get("height") or 0))
            if f: return f[0]["link"]
    return None
def scrim(img,cx,cy,w,h,a=170):
    lay=Image.new("RGBA",img.size,(0,0,0,0)); ImageDraw.Draw(lay).ellipse([cx-w//2,cy-h//2,cx+w//2,cy+h//2],fill=(8,8,10,a))
    img.alpha_composite(lay.filter(ImageFilter.GaussianBlur(90)))
def hook_png(lines,path):
    W,H=1080,1920; img=Image.new("RGBA",(W,H),(0,0,0,0)); d=ImageDraw.Draw(img); fs=104
    while fs>60 and max(d.textlength(l,font=ImageFont.truetype(SERIF,fs)) for l in lines)>840: fs-=4
    f=ImageFont.truetype(SERIF,fs); lh=fs+12; th=lh*len(lines); y0=360
    scrim(img,540,y0+th//2-lh//2,900,th+220,175); d=ImageDraw.Draw(img); y=y0
    for i,l in enumerate(lines):
        w=d.textlength(l,font=f); x=540-w/2; col=GOLD if i==len(lines)-1 else IVORY
        for dx in(-2,2):
            for dy in(-2,2): d.text((x+dx,y+dy),l,font=f,fill=(8,8,10))
        d.text((x,y),l,font=f,fill=col); y+=lh
    img.save(path)
def card_png(text,path):
    W,H=1080,1920; img=Image.new("RGBA",(W,H),(0,0,0,0)); d=ImageDraw.Draw(img); fs=92; lines=text.split("\n")
    while fs>50 and max(d.textlength(l,font=ImageFont.truetype(SERIF,fs)) for l in lines)>840: fs-=4
    f=ImageFont.truetype(SERIF,fs); lh=fs+20; th=lh*len(lines); cy=820
    scrim(img,540,cy,940,th+260,175); d=ImageDraw.Draw(img); y=cy-th//2
    for l in lines:
        w=d.textlength(l,font=f); d.text((540-w/2,y),l,font=f,fill=(*IVORY,255)); y+=lh
    d.line([540-90,cy+th//2+26,540+90,cy+th//2+26],fill=(*GOLD,255),width=3); img.save(path)
def subs_ass(t0,t1,path):
    words=[]; k=0; n=len(ch)
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
    out=["[Script Info]","ScriptType: v4.00+","PlayResX: 1080","PlayResY: 1920","","[V4+ Styles]",
     "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
     "Style: Sub,DejaVu Sans,52,&H00DDECF3,&H00DDECF3,&H00101010,&H80000000,1,0,0,0,100,100,0,0,1,3,2,2,120,120,470,1","",
     "[Events]","Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
    for a,b,t in cues: out.append(f"Dialogue: 0,{T(a)},{T(b)},Sub,,0,0,0,,{t.replace('{','(').replace('}',')')}")
    open(path,"w").write("\n".join(out))

t0,t1=seg[QLO][0],seg[QHI][1]
hook_png(QHOOK,D+"/hook.png"); card_png(QCARD,D+"/card.png"); subs_ass(t0,t1,D+"/subs.ass")
for i in range(QLO,QHI+1):
    dur=round(seg[i][1]-seg[i][0],3); term=B[i][1]; dst=f"{D}/c{i}.mp4"
    if not (os.path.exists(dst) and os.path.getsize(dst)>10000):
        link=pexels(term,dur) or pexels("quiet luxury cinematic interior",dur)
        if link: dl(link,dst)
    if not os.path.exists(dst): continue
    base=f"[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=24,{GRADE}"
    if i==QCB:
        fc=(base+"[bg];[1:v]format=rgba,fade=t=in:st=0.35:d=0.7:alpha=1,"
            f"fade=t=out:st={max(0.1,dur-0.6):.2f}:d=0.5:alpha=1[tx];[bg][tx]overlay=0:0,format=yuv420p[o]")
        subprocess.run(["ffmpeg","-y","-t",str(dur),"-i",dst,"-framerate","24","-loop","1","-t",str(dur),"-i",D+"/card.png",
            "-filter_complex",fc,"-map","[o]","-an","-r","24","-c:v","libx264","-preset","medium","-pix_fmt","yuv420p",f"{D}/s{i}.mp4"],check=True,stderr=subprocess.DEVNULL)
    else:
        subprocess.run(["ffmpeg","-y","-t",str(dur),"-i",dst,"-filter_complex",base+",format=yuv420p[o]",
            "-map","[o]","-an","-r","24","-c:v","libx264","-preset","medium","-pix_fmt","yuv420p",f"{D}/s{i}.mp4"],check=True,stderr=subprocess.DEVNULL)
with open(D+"/list.txt","w") as fh:
    for i in range(QLO,QHI+1):
        if os.path.exists(f"{D}/s{i}.mp4"): fh.write(f"file 's{i}.mp4'\n")
subprocess.run(["ffmpeg","-y","-f","concat","-safe","0","-i",D+"/list.txt","-c","copy",D+"/v.mp4"],check=True,stderr=subprocess.DEVNULL)
build_audio(t0,t1,D+"/aud.wav")
fc=(f"[0:v]subtitles={D}/subs.ass[b];[2:v]format=rgba,fade=t=in:st=0.3:d=0.6:alpha=1,fade=t=out:st=2.4:d=0.7:alpha=1[hk];[b][hk]overlay=0:0[v]")
subprocess.run(["ffmpeg","-y","-i",D+"/v.mp4","-i",D+"/aud.wav","-framerate","24","-loop","1","-t","3.1","-i",D+"/hook.png",
    "-filter_complex",fc,"-map","[v]","-map","1:a","-c:v","libx264","-crf","20","-preset","medium","-pix_fmt","yuv420p",
    "-c:a","aac","-b:a","160k","-shortest","-movflags","+faststart",f"{OUT}/short_quality.mp4"],check=True,stderr=subprocess.DEVNULL)
print(f"rebuilt quality ({t1-t0:.1f}s) beats {QLO}-{QHI}",flush=True)
print("ALL SHORTS FIXED",flush=True)
