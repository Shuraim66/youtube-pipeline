"""Authored visual edit over approved narration; never changes speech or its timing."""
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
# Every row corresponds to a narrated beat, in order. Routes are editorial choices,
# not paragraph-index rotations. Long beats develop through their specified views.
ROUTES=[
 'crisis leaks', 'subscription checkout payslip night', 'ledger', 'street clinic family', 'checkout debt comfort', 'overview globe',
 'chapter', 'clock', 'television time-stat rest', 'time-budget calendar', 'workshop portfolio calendar', 'calendar study television',
 'chapter', 'night', 'delivery wardrobe checkout', 'checkout ledger', 'phone-pause calendar decision',
 'chapter', 'sale decision', 'wardrobe sale', 'receipt costs choices', 'decision relationships',
 'chapter', 'kitchen', 'restaurant food-stat delivery', 'kitchen groceries meal', 'meal wallet',
 'chapter', 'debt', 'bank clinic education terms', 'rate debt-stat', 'statement paid-card', 'terms alternatives budget',
 'chapter', 'repair', 'repair clinic bills', 'emergency-stat payment-method method-note', 'unexpected-stat', 'buffer priorities',
 'chapter', 'bills', 'leaks', 'transfer calendar', 'compound risk', 'transfer bills manual-transfer',
 'chapter', 'fee-timeline', 'fee-assumptions fee-chart fee-compare', 'hypothetical', 'adviser receipt', 'fee-audit receipts',
 'chapter', 'secret', 'diversify risk', 'spiva horizon uncertainty', 'policy horizon',
 'chapter', 'payslip', 'car apartment subscription', 'income-stat bills', 'leaks', 'allocate leisure',
 'chapter', 'workshop', 'coins workshop network', 'jobs interview compare', 'portfolio certificate workshop',
 'chapter', 'park', 'medical-stat clinic', 'sleep park', 'consultation calendar meal', 'park treatment',
 'chapter', 'adviser', 'scam panic guaranteed', 'fraud-stat fraud-loss scope', 'verify registry risk',
 'chapter', 'friends conversation', 'status study-group', 'class network friends',
 'chapter', 'street', 'family support step', 'adviser calendar conversation', 'calendar documents tax-account workshop', 'conversation',
 'friends', 'system', 'step street choices', 'one-action repair', 'transfer subscription meal calendar receipt study', 'seed', 'pattern', 'end'
]

# Exact spoken anchors where a number, purchase or action needs a precise cut.
ANCHORS={
 0:['It can also'],1:['A payment plan','A raise','A few hours'],
 3:['medical bills','family obligations'],4:['Some are mathematical','Some are sold'],
 5:['The statistics'],8:['averaging about','That does not'],
 14:['You buy the outfit','You buy the gadget'],16:['Put the item','If you still want'],
 25:['If you have','A default breakfast'],29:['help cover a crisis','or fund education','The interest rate'],
 30:['The New York Fed'],31:['The personal risk'],35:['the tooth hurts','You may need'],
 36:['entirely with','That measures'],38:['Balance it'],42:['A scheduled transfer'],
 43:['Contributions'],44:['with enough left','If income varies'],
 47:['Its rounded ending values','and $179,000'],49:['ask'],
 53:['Diversification can'],54:['Some managers did','Past results'],55:['Money needed soon'],
 58:['a bigger apartment','premium subscriptions'],59:['Yet many households'],
 61:['Enjoy the money'],65:['Compare salary','Better skills'],
 69:['That is not'],70:['movement'],71:['Include sleep','food that supports'],
 72:['but it does not'],75:['Some sell envy','Some sell "guaranteed"'],
 76:['The estimated total','This includes'],77:['Verify any required','Registration alone'],
 79:["Your friends' incomes"],80:['If people around'],81:['A serious online','A small group'],
 84:['Some systems','None of that'],85:['reminders','You do not need'],
 86:['A folder','A separate account','A list of skills'],
 90:['It cannot erase','It can help'],91:['Fix the leak'],
 92:['Cancel one','Cook one','Make one','Read one','Spend thirty'],
}

def main():
    t=json.loads((ROOT/'work/money_habits/timing.json').read_text())
    assert len(ROUTES)==len(t['beats'])==96
    shots=[]
    for index,(b,route) in enumerate(zip(t['beats'],ROUTES)):
        styles=route.split(); words=[w for w in t['captions'] if b['startFrame']<=w['startFrame']<b['endFrame']]
        boundaries=[b['startFrame']]
        # Align changes to nearby spoken word starts. These routes follow the
        # concepts in narration order; retain the continuous original audio.
        for i in range(1,len(styles)):
            target=b['startFrame']+(b['endFrame']-b['startFrame'])*i/len(styles)
            if index in ANCHORS:
                import re
                clean=lambda w:re.sub(r'[^a-z0-9]','',w.lower())
                wanted=[clean(w) for w in ANCHORS[index][i-1].split()]
                matches=[j for j in range(len(words)-len(wanted)+1) if [clean(w['word']) for w in words[j:j+len(wanted)]]==wanted]
                assert len(matches)==1,(index,ANCHORS[index][i-1],matches)
                target=words[matches[0]]['startFrame']
            candidates=[w['startFrame'] for w in words if w['startFrame']>boundaries[-1]+18 and w['startFrame']<b['endFrame']-18]
            assert candidates, b['scene']
            boundaries.append(min(candidates,key=lambda f:abs(f-target)))
        boundaries.append(b['endFrame'])
        for i,style in enumerate(styles):
            shots.append({'id':f'{b["scene"]}-{i}','beat':index,'style':style,'startFrame':boundaries[i],
                'endFrame':boundaries[i+1],'chapter':b['data']['chapter'],'title':b['data']['title'],
                'source':b['data']['source'],'labels':b['data']['labels']})
    shots[-1]['endFrame']=t['totalFrames']
    assert all(a['endFrame']==b['startFrame'] for a,b in zip(shots,shots[1:]))
    assert max(s['endFrame']-s['startFrame'] for s in shots)<=16*30
    out=ROOT/'src/moneyStoryboard.json';out.write_text(json.dumps(shots,indent=2)+'\n')
    work=ROOT/'work/money_habits-v2';work.mkdir(exist_ok=True)
    t['composition']='MoneyHabitsV2';t['visualShots']=shots
    # Sparse cues attached to actual visible reveals in this edition.
    sounds=[]
    for s in shots:
        if s['style'] in ('chapter','end','transfer','manual-transfer','phone-pause','fee-chart','allocate','registry','one-action'):
            sounds.append({'kind':'resolve' if s['style'] in ('chapter','end') else 'tick',
                'frame':s['startFrame']+18,'gainDb':-32,'pan':0,'pitch':0,'scene':s['beat']})
    t['soundEvents']=sounds
    (work/'timing.json').write_text(json.dumps(t,indent=2)+'\n')
    print(f'{len(shots)} authored views; longest {max(s["endFrame"]-s["startFrame"] for s in shots)/30:.2f}s; continuous')

if __name__=='__main__':main()
