"""Apply Meshy motion-library actions to a rig, download each animation GLB as anim_<name>_<action>.glb."""
import urllib.request, json, time, sys
BASE="/home/alpha/products/youtube-pipeline/fitness/mascot3d"
key=open(BASE+'/.meshy_key').read().strip()
RIG={'shredded':'019fe262-937e-77ee-8430-6ca9fb2d753d','bulk':'019fe263-1d9e-7bc4-88e7-7d3346bc68af',
     'dadbod':'019fe263-3941-7432-a8b8-459fe728d56d','skinny':'019fe263-54b6-7bc7-93ec-fb0a5ec8340c'}
ACTIONS={'flex':388,'curl':320,'squat':319,'punch':376,
         'kettlebell':327,'pushup':329,'jacks':326,'situps':330,'victory':412,'idle':0}
name=sys.argv[1] if len(sys.argv)>1 else 'shredded'
picks=sys.argv[2:] or list(ACTIONS)
def post(body):
    req=urllib.request.Request('https://api.meshy.ai/openapi/v1/animations', data=json.dumps(body).encode(),
        headers={'Authorization':'Bearer '+key,'Content-Type':'application/json'}, method='POST')
    return json.load(urllib.request.urlopen(req,timeout=40))['result']
def get(tid):
    req=urllib.request.Request(f'https://api.meshy.ai/openapi/v1/animations/{tid}', headers={'Authorization':'Bearer '+key})
    return json.load(urllib.request.urlopen(req,timeout=30))
tasks={a: post({'rig_task_id':RIG[name],'action_id':ACTIONS[a]}) for a in picks}
print('submitted',tasks,flush=True)
for a,tid in tasks.items():
    while True:
        s=get(tid); st=s.get('status')
        if st=='SUCCEEDED':
            res=s['result']; glb=res.get('glb_url') or res.get('rigged_character_glb_url') or (res.get('model_urls') or {}).get('glb')
            if not glb:
                # find any *glb_url in result
                glb=next((v for k,v in res.items() if isinstance(v,str) and k.endswith('glb_url')),None)
            print('DONE',a,'keys:',list(res.keys()),flush=True)
            if glb: urllib.request.urlretrieve(glb, f'{BASE}/anim_{name}_{a}.glb'); print('  downloaded',a,flush=True)
            break
        if st=='FAILED': print('FAILED',a,s.get('task_error'),flush=True); break
        print('  ',a,st,s.get('progress'),flush=True); time.sleep(12)
print('ANIM DONE',flush=True)
