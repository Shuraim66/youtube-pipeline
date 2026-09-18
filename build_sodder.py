"""Creepy-mystery short (new horror channel) — Hinterkaifeck 1922. HOOK-FIRST, unease-driven.
Deep ominous narrator (ElevenLabs Daniel, slow), cold desaturated horror grade + heavy vignette ring + grain,
VARIED motion (push-in/pull/pan + zoom-punch on twist), Anton ALL-CAPS white + BLOOD-RED word pop,
original synthesized dread music, dense ~2s cuts. Output: prototypes/short_hinterkaifeck.mp4"""
import urllib.request, urllib.parse, json, base64, subprocess, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
ROOT="/home/alpha/products/youtube-pipeline"
OUT=ROOT+"/prototypes"; os.makedirs(OUT,exist_ok=True)
SCR="/tmp/claude-1000/-home-alpha-products-youtube-pipeline/d26cef8b-33f8-460d-a296-387d6471b220/scratchpad/sodder"
IMG=SCR+"/img"; REAL=SCR+"/real"; MUSIC=ROOT+"/assets/horror_bed.wav"
ek=open(ROOT+"/.elevenlabs_key").read().strip()
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
SERIF="/usr/share/fonts/truetype/noto/NotoSerifDisplay-Regular.ttf"; SERIFB="/usr/share/fonts/truetype/noto/NotoSerifDisplay-Bold.ttf"
COLDWHITE=(230,232,236); BLOODRED=(198,30,30); VOICE="onwK4e9ZLuTAKqWW03F9"  # Daniel, deep narrator
# cold, desaturated, crushed-black horror grade + heavy vignette ring + film grain
HGRADE=("eq=saturation=0.55:contrast=1.20:brightness=-0.02,curves=all='0/0.0 0.25/0.20 0.75/0.72 1/0.92',"
        "colortemperature=temperature=4300:mix=0.5,vignette=PI/4.5,noise=alls=9:allf=t+u")
# first frame: slightly less crushed so it still reads in the feed, but still ominous
HGRADE_OPEN=("eq=saturation=0.62:contrast=1.20:brightness=0.02,curves=all='0/0.0 0.25/0.24 0.75/0.78 1/0.98',"
        "colortemperature=temperature=4500:mix=0.4,vignette=PI/5,noise=alls=6:allf=t+u")
# REAL archival photos (rimg:) — near-monochrome archival wash + grain + vignette so BW/sepia sit with the AI shots
RGRADE=("eq=saturation=0.18:contrast=1.14:brightness=0.02,colortemperature=temperature=5200:mix=0.2,"
        "vignette=PI/4.5,noise=alls=10:allf=t+u")

SHORTS=[
 {"id":"sodder","speed":0.97,
  "hook":["Five children vanished.","No bones were found."],
  "punch":"Too fast.\nToo clean.","punch_beat":2,
  "cta":["What happened to them?","Follow for more"],
  "beats":[
   ("On Christmas Eve, a fire destroyed this family's home. Five of their children vanished, and not a single bone was ever found.",
    [f"img:{IMG}/sd_house_fire.jpg",f"img:{IMG}/sd_xmas_dark.jpg"]),
   ("West Virginia, 1945. The parents and four kids escaped. Five children upstairs did not.",
    [f"img:{IMG}/sd_house_fire.jpg",f"img:{IMG}/sd_snow_ruins.jpg"]),
   ("But the fire burned for only forty five minutes. Too fast, and too clean.",
    [f"img:{IMG}/sd_ashes.jpg",f"img:{IMG}/sd_snow_ruins.jpg"]),
   ("No remains. The ladder was gone. The phone lines were cut.",
    [f"img:{IMG}/sd_ashes.jpg",f"img:{IMG}/sd_ladder.jpg",f"img:{IMG}/sd_phone_wire.jpg"]),
   ("A witness saw the children in a passing car that night.",
    [f"img:{IMG}/sd_car_night.jpg"]),
   ("Years later, the parents got a photo in the mail, a young man who looked just like their missing son.",
    [f"rimg:{REAL}/sd_louis.jpg",f"img:{IMG}/sd_mailbox.jpg"]),
   ("They put up a billboard and searched for the rest of their lives. They never found them.",
    [f"img:{IMG}/sd_billboard.jpg",f"img:{IMG}/sd_house_fire.jpg"]),
 ]},
]
def scrim(img,cx,cy,w,h,a=190):
    lay=Image.new("RGBA",img.size,(0,0,0,0)); ImageDraw.Draw(lay).ellipse([cx-w//2,cy-h//2,cx+w//2,cy+h//2],fill=(4,4,6,a))
    img.alpha_composite(lay.filter(ImageFilter.GaussianBlur(90)))
def text_png(lines,path,ycenter,fs,red_last=False,rule=False,bold=False):
    FONT=SERIFB if bold else SERIF; sa=225 if bold else 195; ow=3 if bold else 2
    W,H=1080,1920; img=Image.new("RGBA",(W,H),(0,0,0,0)); d=ImageDraw.Draw(img)
    while fs>44 and max(d.textlength(l,font=ImageFont.truetype(FONT,fs)) for l in lines)>900: fs-=4
    f=ImageFont.truetype(FONT,fs); lh=fs+14; th=lh*len(lines)
    scrim(img,540,ycenter,980,th+260,a=sa); d=ImageDraw.Draw(img); y=ycenter-th//2
    for i,l in enumerate(lines):
        w=d.textlength(l,font=f); col=BLOODRED if (red_last and i==len(lines)-1) else COLDWHITE
        for dx in(-ow,ow):
            for dy in(-ow,ow): d.text((540-w/2+dx,y+dy),l,font=f,fill=(4,4,6))
        d.text((540-w/2,y),l,font=f,fill=col); y+=lh
    if rule: d.line([540-90,ycenter+th//2+22,540+90,ycenter+th//2+22],fill=(*BLOODRED,255),width=3)
    img.save(path)
def subs(js,path,fs=96,mv=360):
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
        if len(cur)>=3 or wt[-1] in ".!?":
            chunks.append(cur); cur=[]
    if cur: chunks.append(cur)
    idx2chunk={}
    for c in chunks:
        for i in c: idx2chunk[i]=c
    HILITE=r"{\c&H0000FF&\fscx90\fscy90\t(0,110,\fscx108\fscy108)}"; RESET=r"{\r}"  # BLOOD-RED active word
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
     f"Style: Caption,Anton,{fs},&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,6,0,2,60,60,{mv},1","",
     "[Events]","Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
    out+=ev
    open(path,"w").write("\n".join(out))
def kb(style):
    # varied Ken Burns / camera moves for horror motion; returns zoompan args (z,x,y)
    if style=="in_fast":  return "min(zoom+0.0016,1.20)","iw/2-(iw/zoom/2)","ih/2-(ih/zoom/2)"
    if style=="in":       return "min(zoom+0.0009,1.14)","iw/2-(iw/zoom/2)","ih/2-(ih/zoom/2)"
    if style=="panR":     return "1.12","iw/2-(iw/zoom/2)+(on*0.7)","ih/2-(ih/zoom/2)"
    if style=="panL":     return "1.12","iw/2-(iw/zoom/2)-(on*0.7)","ih/2-(ih/zoom/2)"
    if style=="up":       return "min(zoom+0.0007,1.12)","iw/2-(iw/zoom/2)","ih/2-(ih/zoom/2)-(on*0.6)"
    return "min(zoom+0.0009,1.13)","iw/2-(iw/zoom/2)","ih/2-(ih/zoom/2)"
MOVES=["in","panR","panL","up"]

for S in SHORTS:
    D=f"{OUT}/{S['id']}"; os.makedirs(D,exist_ok=True); beats=S["beats"]
    full=" ".join(b[0] for b in beats)
    if not (os.path.exists(D+"/vo.mp3") and os.path.exists(D+"/vo.json")):
        body=json.dumps({"text":full,"model_id":"eleven_multilingual_v2","voice_settings":{"stability":0.5,"similarity_boost":0.8,"style":0.22,"use_speaker_boost":True,"speed":S.get("speed",1.0)}}).encode()
        r=urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}/with-timestamps",data=body,headers={"xi-api-key":ek,"Content-Type":"application/json"},method="POST")
        resp=json.load(urllib.request.urlopen(r,timeout=180)); open(D+"/vo.mp3","wb").write(base64.b64decode(resp["audio_base64"])); json.dump(resp["alignment"],open(D+"/vo.json","w"))
    ends=json.load(open(D+"/vo.json"))["character_end_times_seconds"]; vend=ends[-1]
    seg=[]; cum=0; prev=0.0
    for vo,terms in beats:
        ei=min(cum+len(vo)-1,len(ends)-1); seg.append([terms,prev,ends[ei]]); prev=ends[ei]; cum+=len(vo)+1
    seg[-1][2]=vend
    tail=1.4; total=vend+tail
    order=[]; gi=0
    for i,(terms,a,b) in enumerate(seg):
        dur=b-a; n=len(terms)
        while n>1 and dur/n<1.4: n-=1
        terms=terms[:n]; sub=dur/n
        for k,term in enumerate(terms):
            segf=f"{D}/s{i}_{k}.mp4"; isreal=term.startswith("rimg:"); imgp=term.split(":",1)[1]
            first=(i==0 and k==0); g=RGRADE if isreal else (HGRADE_OPEN if first else HGRADE)
            style="in_fast" if (i==S["punch_beat"]) else ("in" if first else MOVES[gi%4])
            z,x,y=kb(style)
            if not (os.path.exists(segf) and os.path.getsize(segf)>10000):
                vf=(f"[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,gblur=sigma=30[bg];"
                    f"[0:v]scale=1040:1840:force_original_aspect_ratio=decrease[fg];"
                    f"[bg][fg]overlay=(W-w)/2:(H-h)/2,{g},format=yuv420p,"
                    f"zoompan=z='{z}':d=1:x='{x}':y='{y}':s=1080x1920:fps=24[o]")
                subprocess.run(["ffmpeg","-y","-loop","1","-framerate","24","-t",str(round(sub,3)),"-i",imgp,"-filter_complex",vf,"-map","[o]","-an","-r","24","-t",str(round(sub,3)),"-c:v","libx264","-preset","medium","-pix_fmt","yuv420p",segf],check=True,stderr=subprocess.DEVNULL)
            order.append(segf); gi+=1
    # loop-back tail = slow push on the creepiest closing image (attic eyes)
    tailsrc=order[-1]
    subprocess.run(["ffmpeg","-y","-ss","0.2","-i",tailsrc,"-frames:v","1","-vf","scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920",f"{D}/tail_still.png"],check=True,stderr=subprocess.DEVNULL)
    subprocess.run(["ffmpeg","-y","-loop","1","-framerate","24","-t",str(round(tail,3)),"-i",f"{D}/tail_still.png","-filter_complex",
        f"[0:v]zoompan=z='min(zoom+0.0009,1.14)':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=24,{HGRADE},format=yuv420p[o]",
        "-map","[o]","-an","-r","24","-t",str(round(tail,3)),"-c:v","libx264","-preset","medium","-pix_fmt","yuv420p",f"{D}/s_tail.mp4"],check=True,stderr=subprocess.DEVNULL)
    with open(D+"/list.txt","w") as fh:
        for f in order: fh.write(f"file '{os.path.basename(f)}'\n")
        fh.write("file 's_tail.mp4'\n")
    subprocess.run(["ffmpeg","-y","-f","concat","-safe","0","-i",D+"/list.txt","-c","copy",D+"/v.mp4"],check=True,stderr=subprocess.DEVNULL)
    text_png(S["hook"],D+"/hook.png",600,124,red_last=True,rule=True,bold=True)
    text_png(S["punch"].split("\n"),D+"/punch.png",840,96,red_last=True,rule=True)
    text_png(S["cta"],D+"/cta.png",1040,60,red_last=True)
    subs(D+"/vo.json",D+"/subs.ass")
    pb=S["punch_beat"]; ps,pe=seg[pb][1],seg[pb][2]
    fc=(f"[0:v]ass={D}/subs.ass:fontsdir=/home/alpha/products/openshorts/fonts[b];"
        f"[3:v]format=rgba,fade=t=out:st=2.9:d=0.4:alpha=1[hk];"
        f"[4:v]format=rgba,fade=t=in:st={ps+0.3:.2f}:d=0.4:alpha=1,fade=t=out:st={pe-0.5:.2f}:d=0.4:alpha=1[pn];"
        f"[5:v]format=rgba,fade=t=in:st={vend+0.4:.2f}:d=0.5:alpha=1[ct];"
        f"[b][hk]overlay=0:0[v1];[v1][pn]overlay=0:0[v2];[v2][ct]overlay=0:0[v];"
        f"[1:a]apad,atrim=0:{total:.2f},asetpts=PTS-STARTPTS[vo];[2:a]atrim=0:{total:.2f},afade=t=in:st=0:d=2,afade=t=out:st={total-2.0:.2f}:d=2.0,volume=0.20[mus];"
        f"[vo][mus]amix=inputs=2:normalize=0:duration=first[mix];[mix]loudnorm=I=-14:TP=-1.5:LRA=11[af];"
        f"[af]afade=t=in:st=0:d=0.15,afade=t=out:st={total-0.5:.2f}:d=0.5[a]")
    subprocess.run(["ffmpeg","-y","-i",D+"/v.mp4","-i",D+"/vo.mp3","-i",MUSIC,
        "-framerate","24","-loop","1","-t",str(total),"-i",D+"/hook.png",
        "-framerate","24","-loop","1","-t",str(total),"-i",D+"/punch.png",
        "-framerate","24","-loop","1","-t",str(total),"-i",D+"/cta.png",
        "-filter_complex",fc,"-map","[v]","-map","[a]","-c:v","libx264","-crf","20","-preset","medium","-pix_fmt","yuv420p",
        "-c:a","aac","-b:a","160k","-shortest","-movflags","+faststart",f"{OUT}/short_{S['id']}.mp4"],check=True,stderr=subprocess.DEVNULL)
    print(f"SHORT DONE {S['id']}  {len(order)} clips  total={total:.1f}s (cut ~{total/max(1,len(order)):.1f}s)",flush=True)
print("HINTERKAIFECK DONE",flush=True)
