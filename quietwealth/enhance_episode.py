"""Enhance Ep1: (1) light ORIGINAL ambient music bed (no copyright-claim risk),
(2) subtle motion — text cards slide-up+fade, chapter segments fade in from black (section transitions).
Reuses cached clips/t-cards/intro/subs; only re-renders the ~22 text segments. Output: aurelis_ep1_v3.mp4"""
import ast, json, os, subprocess
import numpy as np
from scipy.io import wavfile

BASE="/home/alpha/products/youtube-pipeline/quietwealth/episode"
QW="/home/alpha/products/youtube-pipeline/quietwealth"
INTRO=3.6
GRADE=("eq=saturation=0.80:contrast=1.06:brightness=0.006,"
       "curves=all='0/0.05 0.25/0.27 0.75/0.78 1/0.95',"
       "colortemperature=temperature=5300:mix=0.5,vignette=PI/5,noise=alls=6:allf=t+u")

# ---------- parse BEATS (kind/text) + seg times ----------
src=open(QW+"/build_episode.py").read()
b0=src.index("BEATS="); b1=src.index("\nfull=",b0)
BEATS=ast.literal_eval(src[b0+len("BEATS="):b1].strip())
al=json.load(open(BASE+"/vo.json")); ends=al["character_end_times_seconds"]; total=ends[-1]
seg=[]; cum=0; prev=0.0
for vo,term,kind,text in BEATS:
    ei=min(cum+len(vo)-1,len(ends)-1); seg.append((prev,ends[ei])); prev=ends[ei]; cum+=len(vo)+1
seg[-1]=(seg[-1][0],total)

# ---------- 1) generate light ambient pad ----------
def gen_music(path, T):
    fs=44100
    Am=[220.00,261.63,329.63]; F=[174.61,220.00,261.63]; C=[261.63,329.63,392.00]; G=[196.00,246.94,293.66]
    prog=[Am,F,C,G]; chord=8.0; xf=1.8
    def note(freq,n):
        t=np.arange(n)/fs; s=np.zeros(n,dtype=np.float32)
        for h,a in [(1,1.0),(2,0.26),(3,0.09)]:
            for det in (-0.22,0.22): s+=a*np.sin(2*np.pi*(freq*h+det)*t).astype(np.float32)
        return s/2.7
    total_n=int(T*fs); buf=np.zeros(total_n+fs,dtype=np.float32)
    nch=int((chord+xf)*fs); win=np.ones(nch,dtype=np.float32); r=int(xf*fs)
    ramp=(0.5-0.5*np.cos(np.linspace(0,np.pi,r))).astype(np.float32); win[:r]*=ramp; win[-r:]*=ramp[::-1]
    pos=0; ci=0
    while pos<total_n:
        ch=prog[ci%4]; s=np.zeros(nch,dtype=np.float32)
        for fr in ch: s+=note(fr,nch)
        s+=0.28*note(ch[0]/2,nch); s/=(len(ch)+0.28); s*=win
        e=min(pos+nch,len(buf)); buf[pos:e]+=s[:e-pos]; pos+=int(chord*fs); ci+=1
    buf=buf[:total_n]; t=np.arange(total_n)/fs
    buf*=(1.0+0.12*np.sin(2*np.pi*0.04*t)).astype(np.float32)   # slow breathing swell
    buf/=max(1e-6,float(np.max(np.abs(buf)))); buf*=0.6
    wavfile.write(BASE+"/music_raw.wav",fs,(buf*32767).astype(np.int16))
    subprocess.run(["ffmpeg","-y","-i",BASE+"/music_raw.wav","-af",
        "highpass=f=45,lowpass=f=2300,aecho=0.8:0.9:900:0.28,aecho=0.85:0.85:55:0.2,alimiter=limit=0.9",
        path],check=True,stderr=subprocess.DEVNULL)
vdur=INTRO+total
gen_music(BASE+"/music.wav", vdur+1)
print("music generated %.1fs"%(vdur+1),flush=True)

# ---------- 2) re-render text segments with slide-up motion (+ chapter fade-in) ----------
text_beats=[i for i,b in enumerate(BEATS) if b[2]]
for i in text_beats:
    dur=round(seg[i][1]-seg[i][0],3); clip=f"{BASE}/clips/s{i}.mp4"; card=f"{BASE}/t{i}.png"
    if not (os.path.exists(clip) and os.path.exists(card)): continue
    base=f"[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1,fps=30,{GRADE}"
    if BEATS[i][2]=="chapter": base+=",fade=t=in:st=0:d=0.45"     # section transition
    base+="[bg];"
    tx=(f"[1:v]format=rgba,fade=t=in:st=0.35:d=0.75:alpha=1,fade=t=out:st={max(0.1,dur-0.6):.2f}:d=0.5:alpha=1[txf];")
    # slide text up 24px into place over first ~0.8s
    ov=("[bg][txf]overlay=x=0:y='if(lt(t,0.35),24,if(lt(t,1.15),24*(1-(t-0.35)/0.8),0))',format=yuv420p[o]")
    subprocess.run(["ffmpeg","-y","-t",str(dur),"-i",clip,"-framerate","30","-loop","1","-t",str(dur),"-i",card,
        "-filter_complex",base+tx+ov,"-map","[o]","-an","-r","30","-c:v","libx264","-preset","medium","-pix_fmt","yuv420p",
        f"{BASE}/g{i}.mp4"],check=True,stderr=subprocess.DEVNULL)
print("re-rendered %d text segments"%len(text_beats),flush=True)

# ---------- 3) concat intro + (g{i} for text beats else cached f{i}) ----------
with open(BASE+"/list3.txt","w") as fh:
    fh.write("file 'intro.mp4'\n")
    for i in range(len(BEATS)):
        segfile=f"g{i}.mp4" if i in text_beats else f"f{i}.mp4"
        if os.path.exists(f"{BASE}/{segfile}"): fh.write(f"file '{segfile}'\n")
subprocess.run(["ffmpeg","-y","-f","concat","-safe","0","-i",BASE+"/list3.txt","-c","copy",BASE+"/video3.mp4"],check=True,stderr=subprocess.DEVNULL)
print("concat done",flush=True)

# ---------- 4) burn subs + mux VO (delayed) + light music bed ----------
fo=max(1.0,vdur-4.0)
fc=(f"[0:v]subtitles={BASE}/subs.ass[v];"
    f"[1:a]adelay={int(INTRO*1000)}|{int(INTRO*1000)}[vo];"
    f"[2:a]afade=t=in:st=0:d=3,afade=t=out:st={fo:.2f}:d=4,volume=0.10[mus];"
    f"[vo][mus]amix=inputs=2:normalize=0:duration=first[mix];"
    f"[mix]loudnorm=I=-14:TP=-1.5:LRA=11[a]")
subprocess.run(["ffmpeg","-y","-i",BASE+"/video3.mp4","-i",BASE+"/vo.mp3","-i",BASE+"/music.wav",
    "-filter_complex",fc,"-map","[v]","-map","[a]","-c:v","libx264","-crf","19","-preset","medium","-pix_fmt","yuv420p",
    "-c:a","aac","-b:a","192k","-movflags","+faststart",BASE+"/aurelis_ep1_v3.mp4"],check=True,stderr=subprocess.DEVNULL)
print("EPISODE V3 DONE (music + motion)",flush=True)
