"""Look-dev slice for 'Quiet Wealth / Aurelis' Episode 1.
Hook -> Chapter 07 -> the #4 payoff. Real Pexels clips + 'Warm Study' grade +
brand-font text cards (Noto Serif Display) + ElevenLabs VO. ~35s, 1080p."""
import urllib.request, urllib.parse, json, base64, subprocess, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
ROOT="/home/alpha/products/youtube-pipeline"
BASE=ROOT+"/quietwealth/slice"; os.makedirs(BASE+"/clips", exist_ok=True)
pk=open(ROOT+"/.pexels_key").read().strip(); ek=open(ROOT+"/.elevenlabs_key").read().strip()
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
SERIF="/usr/share/fonts/truetype/noto/NotoSerifDisplay-Regular.ttf"
SANS="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
IVORY=(243,236,221); GOLD=(201,169,106)
# 'Warm Study' grade: desaturate, lifted-black S-curve, warm, vignette, grain
GRADE=("eq=saturation=0.80:contrast=1.06:brightness=0.006,"
       "curves=all='0/0.05 0.25/0.27 0.75/0.78 1/0.95',"
       "colortemperature=temperature=5300:mix=0.5,"
       "vignette=PI/5,noise=alls=6:allf=t+u")

# beat: (vo, pexels_term, kind, text)   kind: None | 'statement' | 'chapter' | 'big'
BEATS=[
 ("The wealthiest person in the room is almost never the loudest.", "man plain coat crowd party bokeh", None, None),
 ("They perform wealth instead of building it.", "empty elegant living room interior", "statement", "Performing wealth isn't building it."),
 ("Start with number seven.", "dark elegant room single lamp night", "chapter", "07"),
 ("Loud money buys things to be seen. Quiet money buys things to be forgotten.", "tailored wool coat fabric close up", "statement", "Seen  vs.  Forgotten"),
 ("Income is what comes in. Wealth is what you keep.", "modest suburban house quiet street", "big", "Income is what comes in.\nWealth is what you keep."),
]
full=" ".join(b[0] for b in BEATS)

def dl(url,dst):
    req=urllib.request.Request(url,headers={"User-Agent":UA})
    with urllib.request.urlopen(req,timeout=180) as r, open(dst,"wb") as f: f.write(r.read())

# 1) ElevenLabs VO (calm, deliberate) with timestamps -> phrase end times
VOICE="pFZP5JQG7iQjIQuC4Bku"  # Lily — velvety British female narration
if not (os.path.exists(BASE+"/vo.mp3") and os.path.exists(BASE+"/vo.json")):
    body=json.dumps({"text":full,"model_id":"eleven_multilingual_v2",
        "voice_settings":{"stability":0.5,"similarity_boost":0.8,"style":0.2,"use_speaker_boost":True,"speed":1.0}}).encode()
    req=urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}/with-timestamps",
        data=body,headers={"xi-api-key":ek,"Content-Type":"application/json"},method="POST")
    resp=json.load(urllib.request.urlopen(req,timeout=120))
    open(BASE+"/vo.mp3","wb").write(base64.b64decode(resp["audio_base64"]))
    json.dump(resp["alignment"],open(BASE+"/vo.json","w"))
ends=json.load(open(BASE+"/vo.json"))["character_end_times_seconds"]; total=ends[-1]
seg=[]; cum=0; prev=0.0
for vo,term,kind,text in BEATS:
    ei=min(cum+len(vo)-1,len(ends)-1); tend=ends[ei]
    seg.append([vo,term,kind,text,prev,tend]); prev=tend; cum+=len(vo)+1
seg[-1][5]=total
print("VO %.1fs"%total,flush=True)

# 2) pexels clip per beat
def pexels(term,need):
    url="https://api.pexels.com/videos/search?query=%s&per_page=12&orientation=landscape&size=medium"%urllib.parse.quote(term)
    d=json.load(urllib.request.urlopen(urllib.request.Request(url,headers={"Authorization":pk,"User-Agent":UA}),timeout=30))
    for v in d.get("videos",[]):
        if v["duration"]<max(3,need): continue
        f=[x for x in v["video_files"] if x.get("file_type")=="video/mp4" and x.get("height")==1080] or \
          sorted([x for x in v["video_files"] if x.get("file_type")=="video/mp4"],key=lambda x:-(x.get("height") or 0))
        if f: return f[0]["link"]
    return None
for i,(vo,term,kind,text,a,b) in enumerate(seg):
    dst=f"{BASE}/clips/s{i}.mp4"
    if os.path.exists(dst) and os.path.getsize(dst)>10000:
        print("clip",i,"cached",flush=True); continue
    link=pexels(term,b-a) or pexels("quiet luxury interior",b-a)
    if link: dl(link,dst)
    print("clip",i,term,"->",("ok" if link else "MISS"),flush=True)

# 3) text-card PNGs (with soft dark scrim for legibility)
def scrim(img, cx, cy, w, h, alpha=150):
    lay=Image.new("RGBA",img.size,(0,0,0,0)); d=ImageDraw.Draw(lay)
    d.ellipse([cx-w//2,cy-h//2,cx+w//2,cy+h//2],fill=(8,8,10,alpha))
    lay=lay.filter(ImageFilter.GaussianBlur(90)); img.alpha_composite(lay)
def draw_center(d,cx,y,text,font,fill):
    w=d.textlength(text,font=font); asc,desc=font.getmetrics()
    d.text((cx-w/2,y),text,font=font,fill=fill); return asc+desc
def statement_png(text,path,big=False):
    W,H=1920,1080; img=Image.new("RGBA",(W,H),(0,0,0,0))
    fs=132 if big else 94; f=ImageFont.truetype(SERIF,fs)
    lines=text.split("\n"); lh=fs+22; d=ImageDraw.Draw(img)
    tw=max(d.textlength(ln,font=f) for ln in lines); th=lh*len(lines)
    scrim(img, W//2, H//2, int(tw*1.5), int(th*2.4), 165 if big else 140)
    d=ImageDraw.Draw(img); y=H//2-th//2
    for ln in lines: draw_center(d,W//2,y,ln,f,(*IVORY,255)); y+=lh
    img.save(path)
def chapter_png(num,path):
    W,H=1920,1080; img=Image.new("RGBA",(W,H),(0,0,0,0)); d=ImageDraw.Draw(img)
    scrim(img,W//2,H//2,900,900,150); d=ImageDraw.Draw(img)
    lab=ImageFont.truetype(SANS,34)
    s="S E C T I O N"; draw_center(d,W//2,H//2-190,s,lab,(*GOLD,235))
    nf=ImageFont.truetype(SERIF,300); draw_center(d,W//2,H//2-150,num,nf,(*IVORY,255))
    d.line([W//2-70,H//2+185,W//2+70,H//2+185],fill=(*GOLD,255),width=3)
    img.save(path)
for i,(vo,term,kind,text,a,b) in enumerate(seg):
    if kind=="statement": statement_png(text,f"{BASE}/t{i}.png")
    elif kind=="big": statement_png(text,f"{BASE}/t{i}.png",big=True)
    elif kind=="chapter": chapter_png(text,f"{BASE}/t{i}.png")

# 4) per-segment: grade (+ text overlay w/ fade), trimmed to phrase dur
for i,(vo,term,kind,text,a,b) in enumerate(seg):
    dur=round(b-a,3); src=f"{BASE}/clips/s{i}.mp4"
    if not os.path.exists(src): continue
    base=(f"[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1,fps=30,{GRADE}")
    if kind:
        fc=(base+"[bg];[1:v]format=rgba,fade=t=in:st=0.35:d=0.8:alpha=1,"
            f"fade=t=out:st={max(0,dur-0.6):.2f}:d=0.5:alpha=1[tx];[bg][tx]overlay=0:0,format=yuv420p[o]")
        cmd=["ffmpeg","-y","-t",str(dur),"-i",src,"-framerate","30","-loop","1","-t",str(dur),"-i",f"{BASE}/t{i}.png","-filter_complex",fc,
             "-map","[o]","-an","-r","30","-c:v","libx264","-preset","medium","-pix_fmt","yuv420p",f"{BASE}/f{i}.mp4"]
    else:
        cmd=["ffmpeg","-y","-t",str(dur),"-i",src,"-filter_complex",base+",format=yuv420p[o]",
             "-map","[o]","-an","-r","30","-c:v","libx264","-preset","medium","-pix_fmt","yuv420p",f"{BASE}/f{i}.mp4"]
    subprocess.run(cmd,check=True,stderr=subprocess.DEVNULL)
    print("segment",i,kind or "clip",dur,"s",flush=True)

# 5) concat + mux VO (dip-to-black between via xfade is heavier; straight cuts on the beat)
with open(BASE+"/list.txt","w") as fh:
    for i in range(len(seg)):
        if os.path.exists(f"{BASE}/f{i}.mp4"): fh.write(f"file 'f{i}.mp4'\n")
subprocess.run(["ffmpeg","-y","-f","concat","-safe","0","-i",BASE+"/list.txt","-c","copy",BASE+"/video.mp4"],check=True,stderr=subprocess.DEVNULL)
subprocess.run(["ffmpeg","-y","-i",BASE+"/video.mp4","-i",BASE+"/vo.mp3","-c:v","copy","-c:a","aac","-b:a","192k",
    "-shortest","-movflags","+faststart",BASE+"/aurelis_slice.mp4"],check=True,stderr=subprocess.DEVNULL)
print("SLICE DONE",flush=True)
