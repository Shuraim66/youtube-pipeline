"""Add a proper branded intro title-card + burned synced subtitles to Episode 1.
Reuses cached VO + graded segments (no re-narration). Output: aurelis_ep1_v2.mp4."""
import json, os, subprocess
from PIL import Image, ImageDraw, ImageFont, ImageFilter
BASE="/home/alpha/products/youtube-pipeline/quietwealth/episode"
SERIF="/usr/share/fonts/truetype/noto/NotoSerifDisplay-Regular.ttf"
SANS="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
IVORY=(243,236,221); GOLD=(201,169,106)
INTRO=3.6
GRADE=("eq=saturation=0.80:contrast=1.06:brightness=0.006,"
       "curves=all='0/0.05 0.25/0.27 0.75/0.78 1/0.95',"
       "colortemperature=temperature=5300:mix=0.5,vignette=PI/5,noise=alls=6:allf=t+u")

# ---- 1) intro title card ----
def spaced(d,cx,y,t,f,fill,tr):
    ws=[d.textlength(c,font=f) for c in t]; x=cx-(sum(ws)+tr*(len(t)-1))/2
    for c,w in zip(t,ws): d.text((x,y),c,font=f,fill=fill); x+=w+tr
def fitfont(d,text,maxw,start):
    s=start
    while s>40 and d.textlength(text,font=ImageFont.truetype(SERIF,s))>maxw: s-=4
    return ImageFont.truetype(SERIF,s)
def intro_png(path):
    W,H=1920,1080; img=Image.new("RGBA",(W,H),(0,0,0,0)); d=ImageDraw.Draw(img)
    lay=Image.new("RGBA",img.size,(0,0,0,0)); dl=ImageDraw.Draw(lay)
    dl.ellipse([W//2-1000,H//2-520,W//2+1000,H//2+520],fill=(8,8,10,170))
    img.alpha_composite(lay.filter(ImageFilter.GaussianBlur(120))); d=ImageDraw.Draw(img)
    spaced(d,W//2,H//2-300,"A U R E L I S",ImageFont.truetype(SANS,40),(*GOLD,235),4)
    l1="7 THINGS THE QUIETLY WEALTHY"; l2="NEVER DO IN PUBLIC"
    f=fitfont(d,l1,1560,96)
    for i,ln in enumerate([l1,l2]):
        w=d.textlength(ln,font=f); d.text((W//2-w/2,H//2-150+i*(f.size+16)),ln,font=f,fill=(*IVORY,255))
    d.line([W//2-150,H//2+120,W//2+150,H//2+120],fill=(*GOLD,255),width=2)
    tl="Real wealth doesn't shout."; tf=ImageFont.truetype(SANS,36)
    d.text((W//2-d.textlength(tl,font=tf)/2,H//2+150),tl,font=tf,fill=(*GOLD,220))
    img.save(path)
intro_png(BASE+"/intro.png")
fc=(f"[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1,fps=30,{GRADE},eq=brightness=-0.03[bg];"
    "[1:v]format=rgba,fade=t=in:st=0.3:d=1.0:alpha=1,fade=t=out:st=%.2f:d=0.5:alpha=1[tx];[bg][tx]overlay=0:0,format=yuv420p[o]"%(INTRO-0.6))
subprocess.run(["ffmpeg","-y","-t",str(INTRO),"-i",BASE+"/clips/s5.mp4","-framerate","30","-loop","1","-t",str(INTRO),"-i",BASE+"/intro.png",
    "-filter_complex",fc,"-map","[o]","-an","-r","30","-c:v","libx264","-preset","medium","-pix_fmt","yuv420p",BASE+"/intro.mp4"],check=True,stderr=subprocess.DEVNULL)
print("intro built",flush=True)

# ---- 2) subtitles (.ass) from ElevenLabs char timings, offset by intro ----
al=json.load(open(BASE+"/vo.json")); chars=al["characters"]; st=al["character_start_times_seconds"]; en=al["character_end_times_seconds"]; n=len(chars)
words=[]; k=0
while k<n:
    if chars[k]==" ": k+=1; continue
    s=k
    while k<n and chars[k]!=" ": k+=1
    words.append((s,k-1))
cues=[]; line=[]
def flush(line):
    if line: a=line[0][0]; b=line[-1][1]; cues.append((st[a],en[b],"".join(chars[a:b+1]).strip()))
for (s,e) in words:
    if line and (e-line[0][0]+1)>46: flush(line); line=[(s,e)]
    else: line.append((s,e))
    if "".join(chars[s:e+1])[-1:] in ".!?": flush(line); line=[]
flush(line)
def T(t):
    t+=INTRO; cs=int(round(t*100)); h=cs//360000; cs%=360000; m=cs//6000; cs%=6000; return f"{h}:{m:02d}:{cs//100:02d}.{cs%100:02d}"
ass=["[Script Info]","ScriptType: v4.00+","PlayResX: 1920","PlayResY: 1080","",
 "[V4+ Styles]",
 "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
 "Style: Sub,DejaVu Sans,50,&H00DDECF3,&H00DDECF3,&H00101010,&H80000000,0,0,0,0,100,100,0,0,1,2,1,2,140,140,66,1","",
 "[Events]","Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
for a,b,txt in cues:
    txt=txt.replace("{","(").replace("}",")")
    ass.append(f"Dialogue: 0,{T(a)},{T(b)},Sub,,0,0,0,,{txt}")
open(BASE+"/subs.ass","w").write("\n".join(ass))
print("subs cues:",len(cues),flush=True)

# ---- 3) concat intro + cached segments ----
segs=[f"f{i}.mp4" for i in range(49) if os.path.exists(f"{BASE}/f{i}.mp4")]
with open(BASE+"/list2.txt","w") as fh:
    fh.write("file 'intro.mp4'\n")
    for s in segs: fh.write(f"file '{s}'\n")
subprocess.run(["ffmpeg","-y","-f","concat","-safe","0","-i",BASE+"/list2.txt","-c","copy",BASE+"/video2.mp4"],check=True,stderr=subprocess.DEVNULL)
print("concat done",flush=True)

# ---- 4) burn subs + mux VO delayed by intro ----
subprocess.run(["ffmpeg","-y","-i",BASE+"/video2.mp4","-i",BASE+"/vo.mp3",
    "-filter_complex",f"[0:v]subtitles={BASE}/subs.ass[v];[1:a]adelay={int(INTRO*1000)}|{int(INTRO*1000)}[a]",
    "-map","[v]","-map","[a]","-c:v","libx264","-crf","19","-preset","medium","-pix_fmt","yuv420p",
    "-c:a","aac","-b:a","192k","-movflags","+faststart",BASE+"/aurelis_ep1_v2.mp4"],check=True,stderr=subprocess.DEVNULL)
print("EPISODE V2 DONE",flush=True)
