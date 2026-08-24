"""Rig each physique variant via Meshy rigging API, download the rigged GLB as mascot_<name>_rigbase.glb."""
import urllib.request, json, time
BASE="/home/alpha/products/youtube-pipeline/fitness/mascot3d"
key=open(BASE+'/.meshy_key').read().strip()
# retexture task ids per variant (the textured Meshy models)
RETEX={
 'bulk':    '019fe251-776f-780c-b2a8-abfb8f79dcfa',
 'dadbod':  '019fe258-0e9b-7f4d-9d74-31c93218d2ea',
 'shredded':'019fe258-1615-7630-abd4-de4be4763ee5',
 'skinny':  '019fe258-4f3b-7935-abf3-b210245d9d45',
}
# shredded rigging already submitted in the probe
RIG={'shredded':'019fe262-937e-77ee-8430-6ca9fb2d753d'}
def post(body):
    req=urllib.request.Request('https://api.meshy.ai/openapi/v1/rigging', data=json.dumps(body).encode(),
        headers={'Authorization':'Bearer '+key,'Content-Type':'application/json'}, method='POST')
    return json.load(urllib.request.urlopen(req,timeout=40))['result']
def get(tid):
    req=urllib.request.Request(f'https://api.meshy.ai/openapi/v1/rigging/{tid}', headers={'Authorization':'Bearer '+key})
    return json.load(urllib.request.urlopen(req,timeout=30))
for n,rt in RETEX.items():
    if n not in RIG:
        RIG[n]=post({'input_task_id':rt}); print('rig submitted',n,RIG[n],flush=True)
for n,tid in RIG.items():
    while True:
        s=get(tid); st=s.get('status')
        if st=='SUCCEEDED':
            urls=s.get('model_urls') or s.get('result',{}).get('model_urls') or {}
            print('DONE',n,'keys:',list(s.keys()),'model_urls:',list(urls.keys()),flush=True)
            glb=urls.get('glb')
            if glb: urllib.request.urlretrieve(glb, f'{BASE}/mascot_{n}_rigbase.glb'); print('  downloaded',n,flush=True)
            else: print('  NO GLB; full:',json.dumps(s)[:600],flush=True)
            break
        if st=='FAILED': print('FAILED',n,s.get('task_error'),flush=True); break
        print('  ',n,st,s.get('progress'),flush=True); time.sleep(12)
print('RIG ALL DONE',flush=True)
