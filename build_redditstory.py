"""Reddit-story-over-gameplay short (viral faceless format).
Original gripping story (TTS) over no-copyright vertical gameplay + word-by-word Anton captions + frame-0 hook.
Output: prototypes/short_redditstory.mp4"""
import urllib.request, json, base64, subprocess, os, random
from PIL import Image, ImageDraw, ImageFont, ImageFilter
ROOT="/home/alpha/products/youtube-pipeline"; OUT=ROOT+"/prototypes"; os.makedirs(OUT,exist_ok=True)
SCR="/tmp/claude-1000/-home-alpha-products-youtube-pipeline/d26cef8b-33f8-460d-a296-387d6471b220/scratchpad/reddit"
SFX=ROOT+"/assets/sfx"
BGPOOL=ROOT+"/assets/bg_pool"  # DURABLE clean-licensed Pexels footage (build_bgpool.py); rotates per video
ek=open(ROOT+"/.elevenlabs_key").read().strip()
SERIF="/usr/share/fonts/truetype/noto/NotoSerifDisplay-Regular.ttf"; SERIFB="/usr/share/fonts/truetype/noto/NotoSerifDisplay-Bold.ttf"
IVORY=(245,245,245); GOLD=(255,213,74); VOICE="Xb7hH8MSUJpSbSDYk0k2"  # Alice
def build_bg(dst,total,dstdir,theme=""):
    """Assemble the background from the clean-licensed pool: pick a theme, shuffle its clips,
    concat enough to cover `total`s, re-encode to exactly total. Every build => different bg."""
    themes=[t for t in sorted(os.listdir(BGPOOL)) if os.path.isdir(f"{BGPOOL}/{t}")]
    theme=theme if theme in themes else (os.environ.get("BG_THEME","") if os.environ.get("BG_THEME","") in themes else random.choice(themes))
    clips=[f"{BGPOOL}/{theme}/{f}" for f in sorted(os.listdir(f"{BGPOOL}/{theme}")) if f.endswith(".mp4")]
    random.shuffle(clips)
    seq=[]; acc=0.0; i=0
    while acc<total+1 and clips:
        c=clips[i%len(clips)]
        d=float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",c],capture_output=True,text=True).stdout.strip() or 0)
        seq.append((c,d)); acc+=d; i+=1
    listf=dstdir+"/bglist.txt"
    with open(listf,"w") as fh:
        for c,_ in seq: fh.write(f"file '{c}'\n")
    subprocess.run(["ffmpeg","-y","-f","concat","-safe","0","-i",listf,"-t",str(total),
        "-vf","scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=24",
        "-an","-c:v","libx264","-preset","medium","-pix_fmt","yuv420p",dst],check=True,stderr=subprocess.DEVNULL)
    print(f"  bg theme='{theme}'  {len(seq)} clips: {[os.path.basename(c) for c,_ in seq]}",flush=True)
    return theme

ID="reddit4"
HOOK=["My apartment had","a door that wasn't","on the floor plan."]
STORY=("I moved into an old apartment last month, and everything seemed normal until I decided to hang some shelves. "
 "Behind a tall bookcase in the hallway, there was a door. A real door, with a handle, painted the same color as the wall. "
 "It wasn't on the floor plan I signed. My landlord swore the building only had the rooms I already knew about. "
 "I tried the handle. It was locked, but I could feel cold air leaking out from underneath it. "
 "That night I put a strip of tape across the bottom of the door, the way they do in movies, to see if anything moved. "
 "In the morning, the tape was torn, and there were faint muddy footprints leading out of the door and stopping in the middle of my hallway. "
 "Just stopping. Like whoever it was had simply vanished, or was still standing there. "
 "I called a locksmith to force it open. When he finally did, there was no room behind it. "
 "Just another door, identical, a few feet back. And behind that one, faintly, I could hear someone breathing.")

def scrim(img,cx,cy,w,h,a=200):
    lay=Image.new("RGBA",img.size,(0,0,0,0)); ImageDraw.Draw(lay).ellipse([cx-w//2,cy-h//2,cx+w//2,cy+h//2],fill=(8,8,10,a))
    img.alpha_composite(lay.filter(ImageFilter.GaussianBlur(80)))
def text_png(lines,path,ycenter,fs,gold_last=False,bold=True):
    FONT=SERIFB if bold else SERIF; W,H=1080,1920; img=Image.new("RGBA",(W,H),(0,0,0,0)); d=ImageDraw.Draw(img)
    while fs>44 and max(d.textlength(l,font=ImageFont.truetype(FONT,fs)) for l in lines)>940: fs-=4
    f=ImageFont.truetype(FONT,fs); lh=fs+14; th=lh*len(lines)
    scrim(img,540,ycenter,1000,th+240,a=215); d=ImageDraw.Draw(img); y=ycenter-th//2
    for i,l in enumerate(lines):
        w=d.textlength(l,font=f); col=GOLD if (gold_last and i==len(lines)-1) else IVORY
        for dx in(-3,3):
            for dy in(-3,3): d.text((540-w/2+dx,y+dy),l,font=f,fill=(6,6,8))
        d.text((540-w/2,y),l,font=f,fill=col); y+=lh
    img.save(path)
def subs_words(words,path,fs=104):
    words=[(float(a),float(b),str(w)) for a,b,w in words]
    chunks=[]; cur=[]
    for i,(ws,we,wt) in enumerate(words):
        cur.append(i)
        if len(cur)>=3 or wt[-1] in ".!?": chunks.append(cur); cur=[]
    if cur: chunks.append(cur)
    idx2chunk={}
    for c in chunks:
        for i in c: idx2chunk[i]=c
    HILITE=r"{\c&H4AD5FF&\fscx92\fscy92\t(0,110,\fscx112\fscy112)}"; RESET=r"{\r}"
    def clean(w): return "".join(x for x in w.upper() if x.isalnum() or x in "'&-.")
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
     f"Style: Caption,Anton,{fs},&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,7,0,5,80,80,0,1","",
     "[Events]","Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
    out+=ev; open(path,"w").write("\n".join(out))

D=f"{OUT}/{ID}"; os.makedirs(D,exist_ok=True)
PIPER=os.path.expanduser("~/.local/bin/piper"); PMODEL=os.path.expanduser("~/piper-voices/en_US-ryan-high.onnx")
if not os.path.exists(D+"/vo.mp3"):
    subprocess.run([PIPER,"-m",PMODEL,"-f",D+"/vo.wav"],input=STORY.encode(),check=True,stderr=subprocess.DEVNULL)
    subprocess.run(["ffmpeg","-y","-i",D+"/vo.wav","-ar","44100",D+"/vo.mp3"],check=True,stderr=subprocess.DEVNULL)
if not os.path.exists(D+"/words.json"):
    from faster_whisper import WhisperModel
    m=WhisperModel("small",device="cpu",compute_type="int8")
    segs,_=m.transcribe(D+"/vo.wav",word_timestamps=True)
    words=[[float(w.start),float(w.end),w.word.strip()] for s in segs for w in s.words if w.word.strip()]
    json.dump(words,open(D+"/words.json","w"))
words=json.load(open(D+"/words.json"))
vend=words[-1][1]; tail=1.0; total=round(vend+tail,2)
subs_words(words,D+"/subs.ass")
text_png(HOOK,D+"/hook.png",360,120,gold_last=True,bold=True)
bg_theme=build_bg(D+"/bg.mp4",total,D)
# clean-licensed pool bg (already 1080x1920/24fps) + darken + captions + hook
fc=(f"[0:v]eq=brightness=-0.06:saturation=1.05,format=yuv420p[bg];"
    f"[bg]ass={D}/subs.ass:fontsdir=/home/alpha/products/openshorts/fonts[cap];"
    f"[2:v]format=rgba,fade=t=out:st=3.6:d=0.5:alpha=1[hk];"
    f"[cap][hk]overlay=0:0[v];"
    f"[1:a]volume=1.2[vo];[3:a]adelay=120,volume=0.7[bm];"
    f"[vo][bm]amix=inputs=2:normalize=0:duration=first[mx];[mx]loudnorm=I=-14:TP=-1.5:LRA=11,afade=t=out:st={total-0.5:.2f}:d=0.5[a]")
subprocess.run(["ffmpeg","-y","-t",str(total),"-i",D+"/bg.mp4","-i",D+"/vo.mp3",
    "-framerate","24","-loop","1","-t",str(total),"-i",D+"/hook.png","-i",SFX+"/boom.wav",
    "-filter_complex",fc,"-map","[v]","-map","[a]","-c:v","libx264","-crf","20","-preset","medium","-pix_fmt","yuv420p",
    "-c:a","aac","-b:a","160k","-t",str(total),"-movflags","+faststart",f"{OUT}/short_{ID}.mp4"],check=True,stderr=subprocess.DEVNULL)
print(f"REDDIT STORY DONE  total={total:.1f}s  bg={bg_theme}",flush=True)
