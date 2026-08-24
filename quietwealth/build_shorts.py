"""3 vertical Shorts (1080x1920) from Aurelis Ep1 beats — Alice VO + 9:16 graded clips
+ big top hook + synced subtitles. Self-contained ~25-35s each."""
import urllib.request, urllib.parse, json, base64, subprocess, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
ROOT="/home/alpha/products/youtube-pipeline"; BASE=ROOT+"/quietwealth/shorts"; os.makedirs(BASE+"/clips",exist_ok=True)
pk=open(ROOT+"/.pexels_key").read().strip(); ek=open(ROOT+"/.elevenlabs_key").read().strip()
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
SERIF="/usr/share/fonts/truetype/noto/NotoSerifDisplay-Regular.ttf"; SANS="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
IVORY=(243,236,221); GOLD=(201,169,106); VOICE="Xb7hH8MSUJpSbSDYk0k2"
GRADE=("eq=saturation=0.80:contrast=1.06:brightness=0.006,curves=all='0/0.05 0.25/0.27 0.75/0.78 1/0.95',"
       "colortemperature=temperature=5300:mix=0.5,vignette=PI/6,noise=alls=6:allf=t+u")
SHORTS=[
 ("loudest",["THE RICHEST","ISN'T THE LOUDEST"],[
   ("The wealthiest person in any room is almost never the loudest.","man plain coat crowd party bokeh"),
   ("Real wealth doesn't announce itself. It moves in silence.","silhouette man window calm"),
   ("The person who needs you to see the money rarely has it.","man showing off luxury bragging"),
   ("And the quiet one you overlooked is the one compounding while no one is watching.","calm man walking city street"),
   ("Real wealth doesn't shout.","slow dusk city skyline calm")]),
 ("income",["INCOME ISN'T","WEALTH"],[
   ("Here's the mistake almost everyone makes.","dark elegant room single lamp night"),
   ("You get a raise, and your lifestyle grows to swallow it. Bigger car, nicer place. Gone.","couple keys new apartment happy"),
   ("But income is what comes in. Wealth is what you keep.","modest suburban house quiet street"),
   ("The person who keeps living the same while their income climbs becomes untouchable.","calm content man modest home")]),
 ("privacy",["PRIVACY IS","POWER"],[
   ("The truly wealthy never let you see them win. No announcement. No parade.","single desk lamp dark office night"),
   ("Because being underestimated is an advantage.","quiet unnoticed man crowd"),
   ("Privacy is power, and attention is a tax.","silhouette window city night"),
   ("While everyone else performs success, they compound in silence.","calm figure walking away street")]),
]
def dl(url,dst):
    with urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":UA}),timeout=180) as r,open(dst,"wb") as f: f.write(r.read())
def pexels(term,need):
    url="https://api.pexels.com/videos/search?query=%s&per_page=12&orientation=portrait&size=medium"%urllib.parse.quote(term)
    try: d=json.load(urllib.request.urlopen(urllib.request.Request(url,headers={"Authorization":pk,"User-Agent":UA}),timeout=30))
    except Exception: d={}
    vids=d.get("videos",[])
    if not vids:  # fall back to landscape (we crop to 9:16 anyway)
        url=url.replace("orientation=portrait","orientation=landscape")
        try: vids=json.load(urllib.request.urlopen(urllib.request.Request(url,headers={"Authorization":pk,"User-Agent":UA}),timeout=30)).get("videos",[])
        except Exception: vids=[]
    for v in vids:
        if v["duration"]<max(3,need): continue
        f=sorted([x for x in v["video_files"] if x.get("file_type")=="video/mp4"],key=lambda x:-(x.get("height") or 0))
        if f: return f[0]["link"]
    return None
def hook_png(lines,path):
    W,H=1080,1920; img=Image.new("RGBA",(W,H),(0,0,0,0))
    lay=Image.new("RGBA",(W,H),(0,0,0,0)); dl_=ImageDraw.Draw(lay)
    dl_.ellipse([-200,180,W+200,760],fill=(8,8,10,180)); img.alpha_composite(lay.filter(ImageFilter.GaussianBlur(80)))
    d=ImageDraw.Draw(img); fs=104
    while fs>60 and max(d.textlength(l,font=ImageFont.truetype(SERIF,fs)) for l in lines)>W-120: fs-=4
    f=ImageFont.truetype(SERIF,fs); lh=fs+12; y=330
    for i,l in enumerate(lines):
        w=d.textlength(l,font=f); x=(W-w)/2; col=GOLD if i==len(lines)-1 else IVORY
        for dx in(-2,2):
            for dy in(-2,2): d.text((x+dx,y+dy),l,font=f,fill=(8,8,10))
        d.text((x,y),l,font=f,fill=col); y+=lh
    img.save(path)
def subs(js,path,off=0.0,fontsize=58,marginv=430):
    al=json.load(open(js)); ch=al["characters"]; st=al["character_start_times_seconds"]; en=al["character_end_times_seconds"]; n=len(ch)
    words=[]; k=0
    while k<n:
        if ch[k]==" ": k+=1; continue
        s=k
        while k<n and ch[k]!=" ": k+=1
        words.append((s,k-1))
    cues=[]; line=[]
    def fl(line):
        if line: a=line[0][0]; b=line[-1][1]; cues.append((st[a],en[b],"".join(ch[a:b+1]).strip()))
    for (s,e) in words:
        if line and (e-line[0][0]+1)>28: fl(line); line=[(s,e)]
        else: line.append((s,e))
        if "".join(ch[s:e+1])[-1:] in ".!?": fl(line); line=[]
    fl(line)
    def T(t):
        t+=off; cs=int(round(t*100)); h=cs//360000; cs%=360000; return f"{h}:{cs//6000:02d}:{(cs%6000)//100:02d}.{cs%100:02d}"
    out=["[Script Info]","ScriptType: v4.00+","PlayResX: 1080","PlayResY: 1920","",
     "[V4+ Styles]","Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
     f"Style: Sub,DejaVu Sans,{fontsize},&H00DDECF3,&H00DDECF3,&H00101010,&H80000000,1,0,0,0,100,100,0,0,1,3,2,2,80,80,{marginv},1","",
     "[Events]","Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
    for a,b,t in cues: out.append(f"Dialogue: 0,{T(a)},{T(b)},Sub,,0,0,0,,{t.replace('{','(').replace('}',')')}")
    open(path,"w").write("\n".join(out))

for sid,hook,beats in SHORTS:
    D=f"{BASE}/{sid}"; os.makedirs(D,exist_ok=True)
    full=" ".join(b[0] for b in beats)
    if not (os.path.exists(D+"/vo.mp3") and os.path.exists(D+"/vo.json")):
        body=json.dumps({"text":full,"model_id":"eleven_multilingual_v2","voice_settings":{"stability":0.5,"similarity_boost":0.8,"style":0.15,"use_speaker_boost":True,"speed":1.0}}).encode()
        r=urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}/with-timestamps",data=body,headers={"xi-api-key":ek,"Content-Type":"application/json"},method="POST")
        resp=json.load(urllib.request.urlopen(r,timeout=120)); open(D+"/vo.mp3","wb").write(base64.b64decode(resp["audio_base64"])); json.dump(resp["alignment"],open(D+"/vo.json","w"))
    ends=json.load(open(D+"/vo.json"))["character_end_times_seconds"]; total=ends[-1]
    seg=[]; cum=0; prev=0.0
    for vo,term in beats:
        ei=min(cum+len(vo)-1,len(ends)-1); seg.append([term,prev,ends[ei]]); prev=ends[ei]; cum+=len(vo)+1
    seg[-1][2]=total
    for i,(term,a,b) in enumerate(seg):
        dst=f"{D}/c{i}.mp4"
        if os.path.exists(dst) and os.path.getsize(dst)>10000: continue
        link=pexels(term,b-a) or pexels("quiet luxury cinematic",b-a)
        if link: dl(link,dst)
    for i,(term,a,b) in enumerate(seg):
        dur=round(b-a,3); src=f"{D}/c{i}.mp4"
        if not os.path.exists(src): continue
        vf=f"[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30,{GRADE},format=yuv420p[o]"
        subprocess.run(["ffmpeg","-y","-t",str(dur),"-i",src,"-filter_complex",vf,"-map","[o]","-an","-r","30","-c:v","libx264","-preset","medium","-pix_fmt","yuv420p",f"{D}/s{i}.mp4"],check=True,stderr=subprocess.DEVNULL)
    with open(D+"/list.txt","w") as fh:
        for i in range(len(seg)):
            if os.path.exists(f"{D}/s{i}.mp4"): fh.write(f"file 's{i}.mp4'\n")
    subprocess.run(["ffmpeg","-y","-f","concat","-safe","0","-i",D+"/list.txt","-c","copy",D+"/v.mp4"],check=True,stderr=subprocess.DEVNULL)
    hook_png(hook,D+"/hook.png"); subs(D+"/vo.json",D+"/subs.ass")
    fc=("[0:v]subtitles=%s/subs.ass[b];[2:v]format=rgba,fade=t=in:st=0.3:d=0.6:alpha=1,fade=t=out:st=4.6:d=0.7:alpha=1[hk];[b][hk]overlay=0:0[v]"%D)
    subprocess.run(["ffmpeg","-y","-i",D+"/v.mp4","-i",D+"/vo.mp3","-framerate","30","-loop","1","-t","5.5","-i",D+"/hook.png",
        "-filter_complex",fc,"-map","[v]","-map","1:a","-c:v","libx264","-crf","20","-preset","medium","-pix_fmt","yuv420p",
        "-c:a","aac","-b:a","160k","-shortest","-movflags","+faststart",f"{BASE}/short_{sid}.mp4"],check=True,stderr=subprocess.DEVNULL)
    print("SHORT DONE",sid,"%.1fs"%total,flush=True)
print("ALL SHORTS DONE",flush=True)
