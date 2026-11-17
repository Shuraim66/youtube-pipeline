"""Adapt the approved Markdown into shots without rewriting its narration."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CHAPTERS = [
    ('The quiet leaks', 'statement', 'Small decisions. Real consequences.', ['SUBSCRIPTIONS', 'PAYMENT PLANS', 'UNPLANNED SPENDING']),
    ('Protect your time', 'time', 'Give your future a place in the calendar.', ['30 MINUTES', 'ONE SKILL', 'REPEAT']),
    ('Pause the purchase', 'phone', 'Let the impulse pass before paying.', ['WANT IT?', 'WAIT 24 HOURS', 'CHECK THE BUDGET']),
    ('Look past the discount', 'sale', 'A lower price is still a cost.', ['PRICE', 'UPKEEP', 'USEFUL LIFE']),
    ('Pre-decide your meals', 'meal', 'Make the easy option fit your budget.', ['DEFAULT BREAKFAST', 'SIMPLE LUNCH', 'PLANNED DINNER']),
    ('Read the debt terms', 'bank', 'Compare the full cost of borrowing.', ['RATE + FEES', 'REPAYMENT', 'INCOME RISK']),
    ('Build a shock absorber', 'car', 'Savings create options under pressure.', ['ESSENTIAL BILLS', 'COSTLY DEBT', 'ACCESSIBLE BUFFER']),
    ('Make saving repeatable', 'transfer', 'Choose an amount you can sustain.', ['INCOME CLEARS', 'BILLS + BUFFER', 'SAVINGS']),
    ('Find the hidden fees', 'fees', 'Small percentages deserve attention.', ['0.25% / $208K', '0.50% / $198K', '1.00% / $179K']),
    ('Write an investing plan', 'portfolio', 'Match the risk to the goal.', ['TIME HORIZON', 'DIVERSIFICATION', 'COSTS']),
    ('Give every raise a job', 'salary', 'Income is only part of the picture.', ['INVESTING', 'DEBT REDUCTION', 'QUALITY OF LIFE']),
    ('Build earning options', 'laptop', 'Make useful work visible.', ['RESEARCH DEMAND', 'BUILD PROOF', 'COMPARE OPTIONS']),
    ('Care for your health', 'health', 'A routine tailored to your needs.', ['APPROPRIATE CARE', 'SUITABLE MOVEMENT', 'SLEEP']),
    ('Check the adviser', 'scam', 'Confidence is not evidence.', ['INCENTIVES', 'INDEPENDENT CHECK', 'RISK']),
    ('Find useful conversations', 'people', 'Support the habits you want to build.', ['LEARN', 'DISCUSS', 'ENCOURAGE']),
    ('Build your support system', 'planner', 'Start before the decision is urgent.', ['BILL REMINDERS', 'DOCUMENTS', 'TRUSTED SUPPORT']),
    ('Choose one action', 'closing', 'Start with the next useful step.', ['ONE TRANSFER', 'ONE APPOINTMENT', 'ONE SKILL']),
]

def main():
    text = (ROOT/'money_habits_longform.md').read_text().split('Cold open:\n',1)[1].split('## Fact and claim verification',1)[0].strip()
    paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
    beats=[]; chapter=0; shot=0
    for paragraph in paragraphs:
        if paragraph=='Closing:':
            chapter=16; shot=0; continue
        if paragraph.startswith('Number '):
            chapter+=1; shot=0
        title, kind, takeaway, labels=CHAPTERS[chapter]
        sentences=re.split(r'(?<=[.!?])\s+(?=[A-Z])',paragraph)
        groups=[]; current=''
        for sentence in sentences:
            if current and len((current+' '+sentence).split())>48:
                groups.append(current); current=''
            current=(current+' '+sentence).strip()
        if current: groups.append(current)
        for vo in groups:
            scene=f'money-{len(beats):03d}'
            mode='establish' if shot==0 else ('action' if 'replacement system' in vo or vo.startswith(('Try ', 'Start ', 'Write ', 'Build ', 'Use ')) else ['detail','diagram','conversation'][shot%3])
            source=''
            for keyword,label in [('American Time Use','BLS / ATUS 2024'),('Bureau of Labor','BLS / Consumer Expenditures 2024'),('commercial-bank','Federal Reserve / G.19'),('New York Fed','New York Fed / Q2 2025'),('63 percent','Federal Reserve / SHED 2025'),('59 percent','Federal Reserve / SHED 2025'),('26 percent','Federal Reserve / SHED 2025'),('100 billion','Federal Reserve / SHED 2025'),('SEC','SEC / Investor.gov'),('SPIVA','S&P DJI / SPIVA U.S. Year-End 2024'),('Census','U.S. Census Bureau / Income 2025'),('physical activity can','CDC / Physical Activity Benefits')]:
                if keyword in vo: source=label
            beats.append({'scene':scene,'vo':vo,'data':{'chapter':chapter,'shot':shot,'title':title,'kind':kind,'mode':mode,'takeaway':takeaway,'labels':labels,'source':source,'anchor':vo.split()[0]}})
            shot+=1
    expected=' '.join(p for p in paragraphs if p!='Closing:')
    assert ' '.join(b['vo'] for b in beats)==expected
    (ROOT/'money_habits.json').write_text(json.dumps(beats,indent=2)+'\n')
    direction={b['scene']:{'speed':1.09 if b['data']['chapter'] not in (0,16) else 1.04,'phrasePause':.07,'pauseAfter':.24 if b['data']['shot']==0 else .12} for b in beats}
    direction['ttsAliases']={'SPIVA':'Speeva','U.S.':'US','SEC':'S.E.C.'}
    (ROOT/'money_habits.delivery.json').write_text(json.dumps(direction,indent=2)+'\n')
    print(f'{len(beats)} shots; {len(expected.split())} words; narration matches approved script exactly')

if __name__=='__main__': main()
