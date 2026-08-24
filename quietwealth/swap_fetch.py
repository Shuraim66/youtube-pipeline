"""Fetch clean replacement candidates for the 3 flagged beats; extract a frame from each for review."""
import urllib.request, urllib.parse, json, subprocess, os
ROOT="/home/alpha/products/youtube-pipeline"; QW=ROOT+"/quietwealth"
SD="/tmp/claude-1000/-home-alpha-products-youtube-pipeline/d26cef8b-33f8-460d-a296-387d6471b220/scratchpad/swap"
os.makedirs(SD,exist_ok=True)
pk=open(ROOT+"/.pexels_key").read().strip()
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
# beat -> list of search terms (clean, brand-safe: calm dark interiors, NO people/bars/tobacco)
BEATS={
 5:  ["dark elegant living room evening dim","luxury dark interior lamp calm","cozy dark room warm lamp night"],
 22: ["dark room single lamp night mood","moody dark interior warm light","dim living room lamp evening calm"],
 39: ["empty dark office desk lamp night","dark study desk lamp night quiet","dark home office lamp night still"],
}
def search(term,n=6):
    url="https://api.pexels.com/videos/search?query=%s&per_page=%d&orientation=landscape&size=medium"%(urllib.parse.quote(term),n)
    try: return json.load(urllib.request.urlopen(urllib.request.Request(url,headers={"Authorization":pk,"User-Agent":UA}),timeout=30)).get("videos",[])
    except Exception as e: print("search err",e); return []
def dl(url,dst):
    with urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":UA}),timeout=180) as r,open(dst,"wb") as f: f.write(r.read())
for beat,terms in BEATS.items():
    got=0; seen=set()
    for term in terms:
        for v in search(term):
            if got>=3: break
            if v["duration"]<8 or v["id"] in seen: continue
            seen.add(v["id"])
            fl=[x for x in v["video_files"] if x.get("file_type")=="video/mp4" and x.get("height")==1080] or \
               sorted([x for x in v["video_files"] if x.get("file_type")=="video/mp4"],key=lambda x:-(x.get("height") or 0))
            if not fl: continue
            cand=f"{SD}/b{beat}_c{got}.mp4"
            try: dl(fl[0]["link"],cand)
            except Exception as e: print("dl err",e); continue
            subprocess.run(["ffmpeg","-y","-ss","2","-i",cand,"-frames:v","1","-vf","scale=480:270",f"{SD}/b{beat}_c{got}.png"],stderr=subprocess.DEVNULL)
            print(f"beat {beat} cand {got}: id={v['id']} {v['duration']}s  [{term}]",flush=True)
            got+=1
        if got>=3: break
print("DONE",flush=True)
