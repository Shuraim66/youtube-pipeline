"""Quiet Wealth — Shorts Batch 2: FAST-CUT, word-matched b-roll (35-45s, growth-first).
Each VO beat is split into ~2.5s sub-clips, each matched to the phrase being spoken (cut every 2-3s).
Alice VO (cached, per-short speed) + portrait Pexels + Warm Study grade + first-second hook + one punch card
+ burned captions + loop-back tail + light music. Output: shorts_b2/short_{signs,raise,need}.mp4"""
import urllib.request, urllib.parse, json, base64, subprocess, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
ROOT="/home/alpha/products/youtube-pipeline"; QW=ROOT+"/quietwealth"
OUT=QW+"/shorts_b2"; os.makedirs(OUT,exist_ok=True)
pk=open(ROOT+"/.pexels_key").read().strip(); ek=open(ROOT+"/.elevenlabs_key").read().strip()
MUSIC=QW+"/ep2/episode/music.wav"
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
SERIF="/usr/share/fonts/truetype/noto/NotoSerifDisplay-Regular.ttf"; SANS="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
IVORY=(243,236,221); GOLD=(201,169,106); VOICE="Xb7hH8MSUJpSbSDYk0k2"
GRADE=("eq=saturation=0.80:contrast=1.06:brightness=0.006,curves=all='0/0.05 0.25/0.27 0.75/0.78 1/0.95',"
       "colortemperature=temperature=5300:mix=0.5,vignette=PI/6,noise=alls=6:allf=t+u")

# beats: (plain VO line [feeds ElevenLabs & drives timing], [matched sub-clip terms, cut fast across the line])
SHORTS=[
 {"id":"signs","speed":0.85,"hook":["3 signs","you'll be rich."],"punch":"Free  >  Impressive","punch_beat":4,"cta":["Which one are you?","Follow for more"],"beats":[
   ("Three signs you'll be wealthy. Most people have none of them.",
    ["calm man alone at window city night","person looking out window skyline dusk"]),
   ("Not money. Not luck. Behavior. And number one is the rarest.",
    ["rolling dice luck gamble","stack of cash money","calm composed man serious portrait"]),
   ("Three. You're comfortable being misunderstood. You take the boring path, and let people think you're falling behind.",
    ["lone man walking away from crowd","person ignoring trend calm","quiet man walking empty path"]),
   ("Two. Silence doesn't rattle you. You say nothing, and let the other person fill the gap. But number one, almost nobody has.",
    ["still calm serious face man","tense business negotiation table","poker face calm man portrait"]),
   ("One. You'd rather be free than look impressive. The car that turns heads, or the account nobody sees? You pick the account.",
    ["flashy sports car showroom","bank account balance phone screen","calm free man walking morning light"]),
   ("If that's you, the money's already on its way.",
    ["quiet confident man dusk city","peaceful calm wealthy person window"]),
 ]},
 {"id":"raise","speed":0.85,"hook":["Your raise","is the trap."],"punch":"It's not what you earn.\nIt's what you keep.","punch_beat":2,"cta":["Keep what you earn.","Follow for more"],"beats":[
   ("The raise that felt like winning is exactly why you're still broke.",
    ["car keys handed over dealership","new shiny luxury car showroom"]),
   ("The money goes up, so the lifestyle rises to match. Bigger car, nicer place, better everything. And that's the trap nobody warns you about.",
    ["luxury shopping bags spending","expensive modern apartment interior","sports car driving city night","cash money counting fast hands"]),
   ("Income is what comes in. Wealth is what you keep. Spend every raise, and you're just a well-paid employee of your own lifestyle.",
    ["modest simple home exterior calm","bank savings rising screen phone","person budgeting calm at desk"]),
   ("The quietly rich do the opposite. Income climbs, life stays the same. That gap, between what they earn and what they spend, is the wealth.",
    ["calm wealthy man simple lifestyle","savings growth chart graph rising","person walking calm modest street"]),
   ("So the raise was never the win. Keeping it was.",
    ["calm confident person portrait dusk","quiet money calm lifestyle window"]),
 ]},
 {"id":"need","speed":0.85,"hook":["Need it?","You've already lost."],"punch":"Desperation\nis expensive.","punch_beat":2,"cta":["Patience is leverage.","Follow for more"],"beats":[
   ("The second you need the money, you've already lost it. And the wealthy know it.",
    ["man standing up leaving meeting","calm businessman walking away table"]),
   ("Watch someone with real money negotiate. The first thing you notice? How comfortable they are walking away.",
    ["confident businessman negotiation calm","business handshake deal office","calm man in suit walking away"]),
   ("Desperation is expensive. The moment they sense you need this, the price moves. Against you. Every time.",
    ["anxious eager buyer leaning in","tense stressed negotiation face","price numbers tag close up"]),
   ("The person who can calmly say no, and mean it, holds all the leverage. Patience isn't passive. It's the most underrated money skill there is.",
    ["calm composed man saying no","patient serious man portrait","chess strategic move hand"]),
   ("So the flex was never chasing the deal. It was being able to walk away.",
    ["confident man walking away street","calm powerful person dusk city"]),
 ]},
]
def dl(url,dst):
    with urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":UA}),timeout=180) as r,open(dst,"wb") as f: f.write(r.read())
def pexels(term,need):
    for orient in ("portrait","landscape"):
        url="https://api.pexels.com/videos/search?query=%s&per_page=10&orientation=%s&size=medium"%(urllib.parse.quote(term),orient)
        try: vids=json.load(urllib.request.urlopen(urllib.request.Request(url,headers={"Authorization":pk,"User-Agent":UA}),timeout=30)).get("videos",[])
        except Exception: vids=[]
        for v in vids:
            if v["duration"]<max(2,need): continue
            f=sorted([x for x in v["video_files"] if x.get("file_type")=="video/mp4"],key=lambda x:-(x.get("height") or 0))
            if f: return f[0]["link"]
    return None
def scrim(img,cx,cy,w,h,a=180):
    lay=Image.new("RGBA",img.size,(0,0,0,0)); ImageDraw.Draw(lay).ellipse([cx-w//2,cy-h//2,cx+w//2,cy+h//2],fill=(8,8,10,a))
    img.alpha_composite(lay.filter(ImageFilter.GaussianBlur(90)))
def text_png(lines,path,ycenter,fs,gold_last=False,rule=False):
    W,H=1080,1920; img=Image.new("RGBA",(W,H),(0,0,0,0)); d=ImageDraw.Draw(img)
    while fs>44 and max(d.textlength(l,font=ImageFont.truetype(SERIF,fs)) for l in lines)>860: fs-=4
    f=ImageFont.truetype(SERIF,fs); lh=fs+14; th=lh*len(lines)
    scrim(img,540,ycenter,960,th+230); d=ImageDraw.Draw(img); y=ycenter-th//2
    for i,l in enumerate(lines):
        w=d.textlength(l,font=f); col=GOLD if (gold_last and i==len(lines)-1) else IVORY
        for dx in(-2,2):
            for dy in(-2,2): d.text((540-w/2+dx,y+dy),l,font=f,fill=(8,8,10))
        d.text((540-w/2,y),l,font=f,fill=col); y+=lh
    if rule: d.line([540-90,ycenter+th//2+22,540+90,ycenter+th//2+22],fill=(*GOLD,255),width=3)
    img.save(path)
def subs(js,path,fs=52,mv=470):
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
        if line and (e-line[0][0]+1)>24: fl(line); line=[(s,e)]
        else: line.append((s,e))
        if "".join(ch[s:e+1])[-1:] in ".!?": fl(line); line=[]
    fl(line)
    def T(t):
        t=max(0,t); cs=int(round(t*100)); h=cs//360000; cs%=360000; return f"{h}:{cs//6000:02d}:{(cs%6000)//100:02d}.{cs%100:02d}"
    out=["[Script Info]","ScriptType: v4.00+","PlayResX: 1080","PlayResY: 1920","","[V4+ Styles]",
     "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
     f"Style: Sub,DejaVu Sans,{fs},&H00DDECF3,&H00DDECF3,&H00101010,&H80000000,1,0,0,0,100,100,0,0,1,3,2,2,120,120,{mv},1","",
     "[Events]","Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
    for a,b,t in cues: out.append(f"Dialogue: 0,{T(a)},{T(b)},Sub,,0,0,0,,{t.replace('{','(').replace('}',')')}")
    open(path,"w").write("\n".join(out))

for S in SHORTS:
    D=f"{OUT}/{S['id']}"; os.makedirs(D,exist_ok=True); beats=S["beats"]
    full=" ".join(b[0] for b in beats)
    if not (os.path.exists(D+"/vo.mp3") and os.path.exists(D+"/vo.json")):
        body=json.dumps({"text":full,"model_id":"eleven_multilingual_v2","voice_settings":{"stability":0.5,"similarity_boost":0.8,"style":0.15,"use_speaker_boost":True,"speed":S.get("speed",0.82)}}).encode()
        r=urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}/with-timestamps",data=body,headers={"xi-api-key":ek,"Content-Type":"application/json"},method="POST")
        resp=json.load(urllib.request.urlopen(r,timeout=180)); open(D+"/vo.mp3","wb").write(base64.b64decode(resp["audio_base64"])); json.dump(resp["alignment"],open(D+"/vo.json","w"))
    ends=json.load(open(D+"/vo.json"))["character_end_times_seconds"]; vend=ends[-1]
    seg=[]; cum=0; prev=0.0
    for vo,terms in beats:
        ei=min(cum+len(vo)-1,len(ends)-1); seg.append([terms,prev,ends[ei]]); prev=ends[ei]; cum+=len(vo)+1
    seg[-1][2]=vend
    tail=2.6; total=vend+tail
    # build fast-cut sub-clips: split each beat window across its matched terms (min ~1.6s per clip)
    order=[]  # list of (segfile, start_time)
    for i,(terms,a,b) in enumerate(seg):
        dur=b-a; n=len(terms)
        # merge to keep each sub-clip >=1.6s
        while n>1 and dur/n<1.6: n-=1
        terms=terms[:n]; sub=dur/n
        for k,term in enumerate(terms):
            src=f"{D}/c{i}_{k}.mp4"
            if not (os.path.exists(src) and os.path.getsize(src)>10000):
                link=pexels(term,sub) or pexels("quiet cinematic calm",sub)
                if link:
                    try: dl(link,src)
                    except Exception: pass
            segf=f"{D}/s{i}_{k}.mp4"
            if os.path.exists(src) and os.path.getsize(src)>10000:
                if not (os.path.exists(segf) and os.path.getsize(segf)>10000):
                    vf=f"[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=24,{GRADE},format=yuv420p[o]"
                    subprocess.run(["ffmpeg","-y","-ss","0.2","-t",str(round(sub,3)),"-i",src,"-filter_complex",vf,"-map","[o]","-an","-r","24","-c:v","libx264","-preset","medium","-pix_fmt","yuv420p",segf],check=True,stderr=subprocess.DEVNULL)
                order.append(segf)
    # loop-back tail = slow zoom on the opening frame
    first=order[0] if order else None
    subprocess.run(["ffmpeg","-y","-ss","0.4","-i",first,"-frames:v","1","-vf","scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920",f"{D}/tail_still.png"],check=True,stderr=subprocess.DEVNULL)
    subprocess.run(["ffmpeg","-y","-loop","1","-framerate","24","-t",str(round(tail,3)),"-i",f"{D}/tail_still.png","-filter_complex",
        f"[0:v]zoompan=z='min(zoom+0.0006,1.10)':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=24,{GRADE},format=yuv420p[o]",
        "-map","[o]","-an","-r","24","-t",str(round(tail,3)),"-c:v","libx264","-preset","medium","-pix_fmt","yuv420p",f"{D}/s_tail.mp4"],check=True,stderr=subprocess.DEVNULL)
    with open(D+"/list.txt","w") as fh:
        for f in order: fh.write(f"file '{os.path.basename(f)}'\n")
        fh.write("file 's_tail.mp4'\n")
    subprocess.run(["ffmpeg","-y","-f","concat","-safe","0","-i",D+"/list.txt","-c","copy",D+"/v.mp4"],check=True,stderr=subprocess.DEVNULL)
    text_png(S["hook"],D+"/hook.png",430,104,gold_last=True,rule=True)
    text_png(S["punch"].split("\n"),D+"/punch.png",840,96,rule=True)
    text_png(S["cta"],D+"/cta.png",1040,60,gold_last=True)
    subs(D+"/vo.json",D+"/subs.ass")
    pb=S["punch_beat"]; ps,pe=seg[pb][1],seg[pb][2]
    fc=(f"[0:v]subtitles={D}/subs.ass[b];"
        f"[3:v]format=rgba,fade=t=in:st=0.1:d=0.4:alpha=1,fade=t=out:st=3.0:d=0.5:alpha=1[hk];"
        f"[4:v]format=rgba,fade=t=in:st={ps+0.3:.2f}:d=0.5:alpha=1,fade=t=out:st={pe-0.6:.2f}:d=0.5:alpha=1[pn];"
        f"[5:v]format=rgba,fade=t=in:st={vend+0.4:.2f}:d=0.5:alpha=1[ct];"
        f"[b][hk]overlay=0:0[v1];[v1][pn]overlay=0:0[v2];[v2][ct]overlay=0:0[v];"
        f"[1:a]apad,atrim=0:{total:.2f},asetpts=PTS-STARTPTS[vo];[2:a]atrim=0:{total:.2f},afade=t=in:st=0:d=1,afade=t=out:st={total-1.5:.2f}:d=1.5,volume=0.08[mus];"
        f"[vo][mus]amix=inputs=2:normalize=0:duration=first[mix];[mix]loudnorm=I=-14:TP=-1.5:LRA=11[af];"
        f"[af]afade=t=in:st=0:d=0.15,afade=t=out:st={total-0.5:.2f}:d=0.5[a]")
    subprocess.run(["ffmpeg","-y","-i",D+"/v.mp4","-i",D+"/vo.mp3","-i",MUSIC,
        "-framerate","24","-loop","1","-t",str(total),"-i",D+"/hook.png",
        "-framerate","24","-loop","1","-t",str(total),"-i",D+"/punch.png",
        "-framerate","24","-loop","1","-t",str(total),"-i",D+"/cta.png",
        "-filter_complex",fc,"-map","[v]","-map","[a]","-c:v","libx264","-crf","20","-preset","medium","-pix_fmt","yuv420p",
        "-c:a","aac","-b:a","160k","-shortest","-movflags","+faststart",f"{OUT}/short_{S['id']}.mp4"],check=True,stderr=subprocess.DEVNULL)
    print(f"SHORT DONE {S['id']}  {len(order)} clips  total={total:.1f}s (cut ~{total/max(1,len(order)):.1f}s)",flush=True)
print("BATCH 1 v2 DONE",flush=True)
