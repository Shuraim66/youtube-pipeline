"""Meshy API pipeline: image-to-3d (geometry) -> retexture (yellow/black text prompt) -> download GLB, for the given physique names."""
import urllib.request, json, time, sys
BASE="/home/alpha/products/youtube-pipeline/fitness/mascot3d"
key=open(BASE+'/.meshy_key').read().strip()
refs=json.load(open(BASE+'/phys_refs_b64.json'))
TEX='smooth golden yellow-amber skin muscular man, matte solid black gym shorts, black sneakers with white soles, flat solid cartoon colors, no text, no logos'
def post(path,body):
    req=urllib.request.Request('https://api.meshy.ai/openapi/'+path, data=json.dumps(body).encode(),
        headers={'Authorization':'Bearer '+key,'Content-Type':'application/json'}, method='POST')
    return json.load(urllib.request.urlopen(req,timeout=60))['result']
def get(path):
    req=urllib.request.Request('https://api.meshy.ai/openapi/'+path, headers={'Authorization':'Bearer '+key})
    return json.load(urllib.request.urlopen(req,timeout=30))
def wait(prefix,tid,label):
    while True:
        s=get(f'{prefix}/{tid}'); st=s.get('status')
        if st=='SUCCEEDED': return s
        if st=='FAILED': raise Exception('FAILED '+label+' '+str(s.get('task_error')))
        print('  ',label,st,s.get('progress'),flush=True); time.sleep(12)
names=sys.argv[1:] or ['dadbod','shredded','skinny']
geo={n: post('v1/image-to-3d', {'image_url':'data:image/png;base64,'+refs[n],'should_texture':False,
     'topology':'triangle','target_polycount':120000,'should_remesh':True}) for n in names}
print('geometry submitted:',geo,flush=True)
rtx={}
for n in names:
    wait('v1/image-to-3d',geo[n],'geo:'+n); print('geometry done',n,flush=True)
    rtx[n]=post('v1/retexture', {'input_task_id':geo[n],'text_style_prompt':TEX,'enable_pbr':True,'enable_original_uv':True})
    print('retexture submitted',n,rtx[n],flush=True)
for n in names:
    s=wait('v1/retexture',rtx[n],'retex:'+n)
    urllib.request.urlretrieve(s['model_urls']['glb'], f'{BASE}/mascot_{n}.glb'); print('DOWNLOADED',n,flush=True)
print('ALL DONE',flush=True)
