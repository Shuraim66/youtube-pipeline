"""Build a DURABLE, pre-vetted background pool from Pexels (clean commercial license,
no attribution required) for the reddit-story format. Replaces the archive.org 'no copyright'
Minecraft clip whose provenance couldn't be verified.

Each theme -> assets/bg_pool/<theme>/NN.mp4, downscaled to 1080x1920/24fps (small, uniform).
The reddit-story builder picks a theme and concatenates clips to cover the VO duration,
so every video gets a different background (kills the 'same loop every video' reused-content flag).
Idempotent: skips clips already downloaded. Writes a credits.json per theme (ids + urls).
"""
import urllib.request, urllib.parse, json, os, subprocess
ROOT="/home/alpha/products/youtube-pipeline"
POOL=ROOT+"/assets/bg_pool"; os.makedirs(POOL,exist_ok=True)
pk=open(ROOT+"/.pexels_key").read().strip()
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
PY=None  # unused

# theme -> list of search terms (genre-appropriate ambient motion that holds the eye under narration)
THEMES={
 "paint":   ["flowing paint ink water","liquid ink swirl","acrylic pour abstract","marbling paint"],
 "drone":   ["aerial drone forest","drone mountains sunrise","drone coastline","aerial river canyon"],
 "satisfying":["kinetic sand cutting","soap cutting asmr","slime satisfying","glass blowing"],
 "drive":   ["night city drive pov","highway timelapse night","car dashboard rain","tunnel driving pov"],
 "water":   ["ocean waves slow motion","underwater sunlight","waterfall slow motion","surfing wave barrel"],
}
TARGET_SEC=70          # gather at least this many seconds of material per theme
MIN_H=1080             # accept >=1080 tall source
def search(term,n=12):
    for orient in ("portrait","square","landscape"):
        url="https://api.pexels.com/videos/search?query=%s&per_page=%d&orientation=%s&size=medium"%(urllib.parse.quote(term),n,orient)
        try: vids=json.load(urllib.request.urlopen(urllib.request.Request(url,headers={"Authorization":pk,"User-Agent":UA}),timeout=30)).get("videos",[])
        except Exception: vids=[]
        for v in vids: yield v
def bestfile(v):
    # prefer a file with height ~1920-2160 (avoid huge 4k); mp4 only
    fs=[x for x in v["video_files"] if x.get("file_type")=="video/mp4" and (x.get("height") or 0)>=MIN_H]
    if not fs: return None
    fs.sort(key=lambda x:abs((x.get("height") or 0)-1920))
    return fs[0]["link"]
def dl(url,dst):
    with urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":UA}),timeout=300) as r,open(dst,"wb") as f: f.write(r.read())

for theme,terms in THEMES.items():
    tdir=f"{POOL}/{theme}"; os.makedirs(tdir,exist_ok=True)
    creds_path=f"{tdir}/credits.json"
    creds=json.load(open(creds_path)) if os.path.exists(creds_path) else {}
    have=sum(3 for _ in [f for f in os.listdir(tdir) if f.endswith(".mp4")])  # rough
    secs=0.0; idx=len([f for f in os.listdir(tdir) if f.endswith(".mp4")])
    seen=set(int(k) for k in creds.keys())
    for term in terms:
        if secs>=TARGET_SEC: break
        for v in search(term):
            if secs>=TARGET_SEC: break
            vid=v.get("id");
            if vid in seen: continue
            d=v.get("duration",0)
            if d<5 or d>40: continue
            link=bestfile(v)
            if not link: continue
            raw=f"{tdir}/_raw_{vid}.mp4"; out=f"{tdir}/{idx:02d}.mp4"
            try: dl(link,raw)
            except Exception: continue
            # downscale+crop to 1080x1920, 24fps, slight darken (captions sit on top later)
            vf="scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=24,eq=brightness=-0.05:saturation=1.03"
            rc=subprocess.run(["ffmpeg","-y","-i",raw,"-t",str(min(d,20)),"-vf",vf,"-an","-c:v","libx264","-preset","medium","-pix_fmt","yuv420p","-movflags","+faststart",out],stderr=subprocess.DEVNULL).returncode
            os.remove(raw)
            if rc!=0 or not (os.path.exists(out) and os.path.getsize(out)>10000): continue
            seen.add(vid); creds[str(vid)]={"term":term,"url":v.get("url"),"file":os.path.basename(out),"dur":min(d,20)}
            secs+=min(d,20); idx+=1
            print(f"  [{theme}] {os.path.basename(out)}  {min(d,20)}s  <- {term} (pexels {vid})")
    json.dump(creds,open(creds_path,"w"),indent=1)
    print(f"THEME {theme}: {idx} clips, ~{secs:.0f}s total")
print("BG POOL DONE ->",POOL)
