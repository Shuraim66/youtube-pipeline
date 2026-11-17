"""Resumable frame-range rendering for long episodes, preserving global timing."""
import hashlib
import json
import subprocess
from pathlib import Path


def frame_ranges(total, chunk):
    if total < 1 or chunk < 1:
        raise ValueError('Frame counts must be positive')
    return [(start,min(start+chunk,total)-1) for start in range(0,total,chunk)]


def digest(path):
    h=hashlib.sha256()
    with open(path,'rb') as source:
        for block in iter(lambda:source.read(1024*1024),b''):
            h.update(block)
    return h.hexdigest()


def render(root, directory, script_id, timing, chunk_seconds=0):
    root, directory = Path(root), Path(directory)
    output=directory/'silent.mp4'
    base=['npx','remotion','render',timing.get('composition', 'Script')]
    options=['--props',json.dumps({'id':script_id}),'--log=error']
    if not chunk_seconds:
        subprocess.run([*base,str(output),*options],cwd=root,check=True)
        return str(output)
    paths=sorted(p for folder in ['src','public'] for p in (root/folder).rglob('*') if p.is_file())
    paths += [p for p in [root/'package.json',root/'package-lock.json',root/'remotion.config.ts'] if p.exists()]
    identity=hashlib.sha256(json.dumps({'timing':timing,'chunk':chunk_seconds,'id':script_id},sort_keys=True).encode())
    for path in paths:
        identity.update(str(path.relative_to(root)).encode()); identity.update(digest(path).encode())
    fingerprint=identity.hexdigest()
    folder=directory/'render-parts'; folder.mkdir(exist_ok=True)
    manifest_path=folder/'manifest.json'
    manifest=json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
    if manifest.get('fingerprint') != fingerprint:
        manifest={'fingerprint':fingerprint,'parts':{}}
    parts=[]
    for index,(start,end) in enumerate(frame_ranges(timing['totalFrames'],round(chunk_seconds*timing['fps']))):
        name=f'part-{index:04d}.mp4'; path=folder/name
        if not path.exists() or manifest['parts'].get(name) != digest(path):
            print(f'[render] frames {start}–{end}',flush=True)
            subprocess.run([*base,str(path),*options,f'--frames={start}-{end}'],cwd=root,check=True)
            manifest['parts'][name]=digest(path)
            manifest_path.write_text(json.dumps(manifest,indent=2)+'\n')
        else:
            print(f'[render] reuse verified {name}',flush=True)
        parts.append(name)
    # Fixed safe filenames only; no shell interpolation or user text in concat syntax.
    listing=folder/'concat.txt'
    listing.write_text(''.join(f"file '{name}'\n" for name in parts))
    subprocess.run(['ffmpeg','-y','-hide_banner','-loglevel','error','-f','concat','-safe','1',
                    '-i',str(listing),'-c','copy',str(output)],check=True)
    return str(output)
