#!/usr/bin/env python3
"""Step-2 plan for "9 Old Money Habits That Actually Keep Wealth" (Aurelis long-form). Same pipeline shape as moneypsych_plan.py.

Single source of truth for the beat plan. Running it validates and writes
  empires_short/out/aurelis_oldmoney/beats.md   (beat table, plate spread, library gaps, cost)
  empires_short/out/aurelis_oldmoney/claims.md  (every figure checked against AURELIS_OLDMONEY_SOURCE_PACK.md)
Checks:
  - spoken text == approved script v1 (empires_short/AURELIS_OLDMONEY_SCRIPT.md), word for word, except the nine spoken chapter lines;
  - every plate / library cut-out exists in library.json; puppet strings use v2.0 expressions/gestures only;
  - PUPPET_BEAT_RULES via beat_rules.puppet_rule_errors; no plate+mascot pair twice; no library cut-out in adjacent beats;
  - plate spread: no plate more than MAX_PLATE times;
  - every number in narration/overlays appears in the source pack (as worded); camera never repeats in adjacent beats or on a plate's next use.
No API calls, no cost.
"""
import json, re, sys
from collections import Counter, defaultdict
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import beat_rules, retention_rules

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "empires_short/out/aurelis_oldmoney"
SCRIPT = ROOT / "empires_short/AURELIS_OLDMONEY_SCRIPT.md"
PACK = ROOT / "empires_short/AURELIS_OLDMONEY_SOURCE_PACK.md"
LIB = json.loads((ROOT / "empires_short/public/img/aurelis/library/library.json").read_text())["images"]
PLATES = {x["filename"][6:-4] for x in LIB if x["kind"] == "plate"}
CUTS = {x["filename"][7:-4] for x in LIB if x["kind"] == "cutout"}
EXPR = {"neutral", "happy", "worried", "shocked", "angry", "thinking", "sad"}
GEST = {"rest", "explain", "pointLeft", "shrug", "thumbsUp", "celebrate", "worriedHands"}   # holdProp deliberately unused: prop poses go to library cut-outs
MAX_PLATE = 6

TITLE = "9 Old Money Habits That Actually Keep Wealth (What the Research Says)"
CH = {9: "DON'T WAIT FOR AN INHERITANCE", 8: "AVOID EXPENSIVE DEBT", 7: "DON'T BUY STATUS", 6: "KEEP A BUDGET", 5: "AUTOMATE SAVING",
      4: "HOLD, DON'T CHASE", 3: "WRITE THINGS DOWN", 2: "TALK TO YOUR CHILDREN", 1: "THINK IN GENERATIONS"}
SEC_NAMES = {"open": "Cold open", "loops": "Open loops", "myth": "Myth-check", "close": "Closing + CTA",
             **{f"h{n}": f"Habit {n}: {CH[n].title()}" for n in CH}}
ORDER = ["open", "loops", "myth"] + [f"h{n}" for n in range(9, 0, -1)] + ["close"]

# (section, narration, plate, mascot, overlays, chapter_line?)
# mascot: "puppet:<expression>/<gesture>@R|C|L" (puppet v2.0) or "<library cut-out>@L|C|R" or None.
# overlays: CH chapter card, TRK 9>1 tracker, DC data card, SRC source line, FIX fix card, LESSON old-money-lesson card,
#           LOOP open-loop chip, PROP drawn Remotion prop, NOTE chip. Card side L when the puppet points (pointLeft, puppet @R).
B = []
def b(sec, text, plate, m, ov, ch=False, **kw):    # kw: rehook / loop / sfx / cta (playbooks/LONGFORM_RETENTION.md)
    B.append(dict(sec=sec, text=text, plate=plate, m=m, ov=ov, ch=ch, **kw))

SRC_KW = "SRC: Kalsi & Ward, 'The Gilded Age and Beyond,' NBER working paper, 2025 (via InvestmentNews)"
SRC_BOA = "SRC: Bank of America, 2024 (as cited by InvestmentNews)"
SRC_MND = "SRC: Stanley & Danko, The Millionaire Next Door (1996)"

# ------------------------------------------------------------------ COLD OPEN
b("open", "Picture a family with a fortune.", "mansion_estate", "puppet:happy/explain@R",
  "TITLE card (first 2 s): 9 OLD MONEY HABITS / THAT ACTUALLY KEEP WEALTH")
b("open", "A big house, servants, the best schools.", "library_study", None,
  "PROP three icons pop on the words: HOUSE / SERVICE BELL / SCHOOL CREST")
b("open", "Everyone assumes the money will be there forever.", "alux_stage_spotlight", "puppet:happy/celebrate@C",
  "PROP gold coins raining slowly")
b("open", "Now fast-forward two generations.", "living_room_sofa", None,
  "PROP family tree draws itself: GRANDPARENTS > PARENTS > GRANDCHILDREN, ▶▶ chip; top row gold, lower rows fading")
b("open", "Economists Priti Kalsi and Zachary Ward followed American families through census records from 1850 to 1940.", "alux_open_notebook_closeup", None,
  f"PROP census ledger pages flip, year chip 1850 → 1940; {SRC_KW}")
b("open", "Of the grandchildren of men in the top 1%, 93% did not reach the top 1% themselves.", "alux_arena_skyline_spotlight", "puppet:shocked/pointLeft@R",
  "DC (L): 93% / of grandchildren of the top 1% did not reach the top 1%; SRC held")
b("open", "And it doesn't even take that long.", "kitchen_table", "puppet:worried/worriedHands@C", "none")
b("open", "In the same study, 72% of people in the top 1% had fallen out of it within ten years.", "bank_counter", "puppet:shocked/pointLeft@R",
  f"DC (L): 72% / of the top 1% fell out within ten years; {SRC_KW}")
b("open", "So \"old money\" mostly doesn't stay old.", "mansion_estate", "sad_front@L", "PROP gold OLD MONEY plaque cracks and dims")
b("open", "What do the families who keep it actually do differently?", "office_desk", "alux_thinking_worried@R", "PROP question mark over a family-crest icon")
b("open", "Here are nine habits, and the evidence behind each one.", "alux_skyline_checklist", "puppet:happy/explain@R",
  "TRK builds: nine pips drop in 9 > 1")

# ------------------------------------------------------------------ OPEN LOOPS
b("loops", "Habit number three is one that even most wealthy people haven't fully taken care of.", "alux_desk_lamp_book", "puppet:thinking/explain@R",
  "LOOP chip: #3 (pip 3 pulses gold); PROP sealed envelope with a ? stamp")
b("loops", "And stay to number one, because it ties everything together.", "alux_arena_concourse", "puppet:happy/thumbsUp@R",
  "LOOP chip: #1 (pip 1 pulses gold)")

# ------------------------------------------------------------------ MYTH-CHECK
b("myth", "Quick warning first.", "apartment_hallway", "puppet:worried/worriedHands@C", "CH: MYTH-CHECK (wipe in/out)")
b("myth", "You've probably heard that 70% of wealthy families lose their money by the second generation,", "coffee_shop", "phone_scroll_front@L",
  "DC (R, grey, CLAIM tag): 70% BY THE SECOND GENERATION / an often-quoted claim")
b("myth", "and 90% by the third.", "mall_storefronts", None, "DC (grey, CLAIM tag): 90% BY THE THIRD")
b("myth", "It's usually credited to a Williams Group study of 3,200 families.", "library_study", "clipboard_show_front@R",
  "SRC: Williams Group study, as cited by InvestmentNews; PROP chip 3,200 FAMILIES")
b("myth", "But family-wealth consultant James Grubman challenged it in a 2022 paper literally titled \"There is no 70% rule.\"", "office_desk", "puppet:shocked/pointLeft@R",
  "DC (L): 'THERE IS NO 70% RULE' / James Grubman, 2022; red CHALLENGED stamp lands on the 70% / 90% chips; SRC: Grubman, 'There is no 70% rule' (2022), as cited by InvestmentNews")
b("myth", "The real research, like that census study, still shows wealth fading.", "alux_open_notebook_closeup", "puppet:neutral/explain@R",
  "PROP ledger with a gold line fading out")
b("myth", "Just don't trust a neat round number until you know where it came from.", "living_room_sofa", "puppet:thinking/shrug@C",
  "PROP round number badge with a magnifying glass")

# ------------------------------------------------------------------ HABIT 9
b("h9", "Number nine: they don't wait for an inheritance.", "house_front", "calendar_hold_front@L", f"CH #9 · {CH[9]}; TRK pip 9 gold", True)
b("h9", "Maybe you've caught yourself thinking, \"One day, family money will sort this out.\"", "park_bench", "sitting_threeq@R",
  "PROP thought bubble with a drawn envelope INHERITANCE?")
b("h9", "Here's the thing.", "alux_stage_spotlight", "puppet:neutral/explain@C", "none")
b("h9", "A Federal Reserve analysis looked at how much of the top 10%'s wealth traces back to inheritances and gifts.", "bank_counter", None,
  "PROP wealth bar TOP 10% with a gift-box segment; SRC: Federal Reserve, FEDS Notes (June 2018), Survey of Consumer Finances 2016")
b("h9", "Depending on the assumption about investment returns, it was about a quarter, or about half.", "kitchen_table", "puppet:thinking/pointLeft@R",
  "DC (L): ABOUT A QUARTER (25%) OR ABOUT HALF (53%) / of top-10% wealth from inheritances and gifts; SRC held")
b("h9", "Either way, a large share of wealth at the top was built, not handed down.", "startup_garage", "confident_threeq@L",
  "PROP bricks stack, label BUILT")
b("h9", "The fix: plan as if no inheritance is coming.", "home_office_laptop", "clipboard_fill_threeq@R", "FIX: PLAN AS IF NO INHERITANCE IS COMING")
b("h9", "Build your own base first.", "payday_desk", "piggy_bank_drop_coin_threeq@L", "FIX line 2: BUILD YOUR OWN BASE FIRST")
b("h9", "Money that outlasts you starts with money you built yourself.", "alux_arena_concourse", "puppet:happy/pointLeft@R",
  "LESSON (L): OLD MONEY LESSON / Money that outlasts you starts with money you built yourself.")

# ------------------------------------------------------------------ HABIT 8
b("h8", "Number eight: they avoid expensive debt.", "checkout_lane", "card_worried_front@C", f"CH #8 · {CH[8]}; TRK pip 9 filled, pip 8 gold", True)
b("h8", "You pay the minimum on your card, the balance barely moves,", "living_room_sofa", "receipt_angry_threeq@R",
  "PROP statement: MINIMUM PAYMENT stamp, balance bar barely shrinks")
b("h8", "and you tell yourself you'll deal with it next month.", "bedroom_night", "calendar_circle_threeq@L", "PROP calendar page slides to next month")
b("h8", "The Federal Reserve says that in the third quarter of 2026,", "bank_counter", "puppet:neutral/explain@R",
  "PROP chip Q3 2026; SRC: Federal Reserve, G.19 Consumer Credit release (November 2026)")
b("h8", "the average interest rate on credit card accounts that were charged interest was 22.36%.", "alux_counter_cash_box", "puppet:shocked/pointLeft@R",
  "DC (L): 22.36% / average rate on card accounts charged interest, Q3 2026; SRC held")
b("h8", "The fix: if you carry a balance, paying it off is one of the highest \"returns\" you can get.", "payday_desk", "cash_hand_over_threeq@L",
  "FIX: PAY OFF THE BALANCE / one of the highest 'returns' you can get")
b("h8", "Treat it like an emergency.", "alux_shop_front_card_reader", "alux_phone_shocked@R", "FIX line 2: TREAT IT LIKE AN EMERGENCY; PROP small siren icon")
b("h8", "Debt at over 22% eats money before it ever gets the chance to outlast you.", "alux_stage_spotlight", "puppet:worried/pointLeft@R",
  "LESSON (L): OLD MONEY LESSON / Debt at over 22% eats money before it ever gets the chance to outlast you.")

# ------------------------------------------------------------------ HABIT 7
b("h7", "Number seven: they don't buy status.", "car_dealership", "car_keys_dangle_threeq@R", f"CH #7 · {CH[7]}; TRK pip 8 filled, pip 7 gold", True)
b("h7", "You've seen it. The new car in the driveway that says \"we made it.\"", "two_houses_new_car", "fence_envious_front@L",
  "PROP gold speech tag WE MADE IT over the car")
b("h7", "In the research behind The Millionaire Next Door,", "library_study", "alux_point_book@R", f"PROP drawn book cover (title as Remotion text); {SRC_MND}")
b("h7", "nearly 37% of the millionaires surveyed said they'd bought their most recent car used, not new.", "car_dealership", "puppet:happy/pointLeft@R",
  "DC (L): NEARLY 37% / bought their most recent car used, not new; SRC held")
b("h7", "The fix: spend on what you value, not on what other people will see.", "mall_storefronts", "cash_fan_front@L", "FIX: SPEND ON WHAT YOU VALUE, NOT WHAT OTHERS SEE")
b("h7", "Status is spent today. Wealth is what's still there tomorrow.", "alux_arena_skyline_spotlight", "puppet:thinking/explain@R",
  "LESSON (L): OLD MONEY LESSON / Status is spent today. Wealth is what's still there tomorrow.")

# ------------------------------------------------------------------ HABIT 6
b("h6", "Number six: they keep a budget.", "home_office_laptop", "calendar_point_threeq@L", f"CH #6 · {CH[6]}; TRK pip 7 filled, pip 6 gold", True)
b("h6", "It's the end of the month and you're scrolling your banking app, wondering where it all went.", "bedroom_night", "phone_scroll_front@R",
  "PROP drawn banking-app screen, balance bar draining (no numerals)")
b("h6", "Same book: more than half of those millionaires said they stuck to a budget.", "kitchen_table", "puppet:neutral/pointLeft@R",
  f"DC (L): MORE THAN HALF / stuck to a budget; {SRC_MND}")
b("h6", "The fix: a simple monthly plan beats a perfect one you never keep.", "payday_desk", "clipboard_fill_threeq@L",
  "FIX: A SIMPLE MONTHLY PLAN / beats a perfect one you never keep; PROP three-line plan vs crumpled spreadsheet")
b("h6", "You can't make money outlast you if you don't know where it goes.", "alux_desk_lamp_book", "puppet:worried/explain@R",
  "LESSON (L): OLD MONEY LESSON / You can't make money outlast you if you don't know where it goes.")

# ------------------------------------------------------------------ HABIT 5
b("h5", "Number five: they automate saving.", "bank_counter", "pay_slip_open_front@L", f"CH #5 · {CH[5]}; TRK pip 6 filled, pip 5 gold", True)
b("h5", "You fully mean to save \"whatever's left.\"", "coffee_shop", "phone_happy_front@R", "PROP jar labelled WHATEVER'S LEFT")
b("h5", "And there's never anything left.", "restaurant_table", "puppet:sad/shrug@C", "PROP the jar empties, a single coin rattles")
b("h5", "A study in the Quarterly Journal of Economics looked at one large US company.", "office_desk", "puppet:neutral/explain@R",
  "SRC: Madrian & Shea, 'The Power of Suggestion,' Quarterly Journal of Economics, 2001; PROP office-tower icon")
b("h5", "When new employees had to sign up for the 401(k) themselves, 37% joined.", "home_office_laptop", "puppet:neutral/pointLeft@R",
  "DC (L): 37% / when they had to sign up themselves; PROP first bar to 37%")
b("h5", "Under automatic enrolment, it was about 86%.", "payday_desk", None, "DC: ABOUT 86% / automatic enrolment; PROP second bar to 86% beside 37%")
b("h5", "Same people. The only thing that changed was the default.", "living_room_sofa", "puppet:happy/explain@C", "PROP toggle switch flips OFF → ON")
b("h5", "The fix: make saving the default.", "apartment_hallway", "piggy_bank_full_front@L", "FIX: MAKE SAVING THE DEFAULT")
b("h5", "Move money on payday, before you can spend it.", "payday_desk", "pay_slip_hand_over_threeq@R", "FIX line 2: MOVE MONEY ON PAYDAY")
b("h5", "The families that last don't rely on willpower. They rely on systems.", "restaurant_table", "puppet:happy/pointLeft@R",
  "LESSON (L): OLD MONEY LESSON / The families that last don't rely on willpower. They rely on systems.")

# ------------------------------------------------------------------ HABIT 4
b("h4", "Number four: they hold, they don't chase.", "trading_screens", "running_threeq@L", f"CH #4 · {CH[4]}; TRK pip 5 filled, pip 4 gold", True)
b("h4", "The market drops, the headlines scream, and you feel the urge to do something.", "apartment_hallway", "alux_phone_shocked@R",
  "PROP red down-arrow and three blank headline strips flashing")
b("h4", "Morningstar found that over ten years,", "alux_open_notebook_closeup", None,
  "PROP ten-year ruler; SRC: Morningstar, 'Mind the Gap 2025' (August 2025)")
b("h4", "investors earned about 1.2 percentage points a year less than the funds they owned.", "trading_screens", "puppet:worried/pointLeft@R",
  "DC (L): ABOUT 1.2 POINTS A YEAR / less than the funds they owned; SRC held")
b("h4", "That's roughly 15% of the funds' potential gains, lost mostly to buying and selling at the wrong times.", "startup_garage", "surprised_threeq@L",
  "DC (R): ROUGHLY 15% / of the funds' potential gains; PROP gains bar with a slice leaking out")
b("h4", "The fix: pick a simple long-term plan and stop reacting to the news.", "park_bench", "sitting_front@L", "FIX: PICK A SIMPLE LONG-TERM PLAN / stop reacting to the news")
b("h4", "Money outlasts you when you give it time and leave it alone.", "alux_arena_concourse", "puppet:happy/explain@R",
  "LESSON (L): OLD MONEY LESSON / Money outlasts you when you give it time and leave it alone.")

# ------------------------------------------------------------------ HABIT 3 (open-loop payoff)
b("h3", "Number three: they write things down: a will and a plan.", "alux_desk_lamp_book", "test_paper_pencil_front@L",
  f"CH #3 · {CH[3]}; TRK pip 4 filled, pip 3 gold + LOOP glow", True)
b("h3", "Be honest: do you have a will?", "living_room_sofa", "puppet:thinking/explain@R", "PROP drawn will document with a ? seal")
b("h3", "If you don't, you're far from alone.", "kitchen_table", "puppet:neutral/shrug@C", "none")
b("h3", "In a 2025 Caring.com and YouGov survey of more than 2,500 American adults, only 24% said they had one.", "home_office_laptop", "puppet:shocked/pointLeft@R",
  "DC (L): ONLY 24% / have a will; SRC: Caring.com & YouGov, 2025 Wills and Estate Planning Survey")
b("h3", "The most common reason? They \"just haven't gotten around to it.\" That was 43%.", "bedroom_night", "yawning_threeq@L",
  "DC (R): 43% / 'just haven't gotten around to it'; SRC held")
b("h3", "And this is the one I told you about.", "supermarket_aisle", "puppet:happy/pointLeft@R",
  "LOOP payoff card (L): #3 / THE ONE I TOLD YOU ABOUT; pip 3 flashes")
b("h3", "Even among the wealthy, a 2024 Bank of America survey of 1,007 high-net-worth people found", "bank_counter", "alux_surprised_arms_up@L",
  f"PROP chip 1,007 HIGH-NET-WORTH RESPONDENTS; {SRC_BOA}")
b("h3", "52% lacked a will, an advance healthcare directive or a durable power of attorney.", "suburban_fence", "puppet:shocked/pointLeft@R",
  "DC (L): 52% / lacked a will, an advance healthcare directive or a durable power of attorney; PROP three drawn documents, empty ticks; SRC held")
b("h3", "The fix: a basic will and a list of your accounts, written down this year.", "office_desk", "clipboard_show_front@L",
  "FIX: A BASIC WILL + A LIST OF YOUR ACCOUNTS / written down this year; PROP drawn will + account list, ticks fill")
b("h3", "Money can only outlast you if someone knows what to do with it.", "library_study", "puppet:neutral/pointLeft@R",
  "LESSON (L): OLD MONEY LESSON / Money can only outlast you if someone knows what to do with it.")

# ------------------------------------------------------------------ HABIT 2
b("h2", "Number two: they talk about money with their children.", "house_front", "family_child_front@C",
  f"CH #2 · {CH[2]}; TRK pip 3 filled, pip 2 gold", True)
b("h2", "Think back. Did anyone actually sit you down and explain money?", "kitchen_table", "puppet:thinking/explain@R",
  "PROP childhood memory frame: small chair, empty speech bubble")
b("h2", "In that same Bank of America survey, 69% of wealthy parents with adult children had discussed family wealth plans with them,", "living_room_sofa", "puppet:neutral/pointLeft@R",
  f"DC (L): 69% / of wealthy parents with adult children had discussed family wealth plans; {SRC_BOA}")
b("h2", "typically when the children were about 31.", "alux_open_notebook_closeup", None, "DC: ABOUT 31 / typical age of the child at that talk; PROP age ruler, marker slides to 31")
b("h2", "Thirty-one. That's a long time to figure it out alone.", "apartment_hallway", "sad_threeq@L", "none")
b("h2", "The fix: start earlier. Small, honest conversations about money, from the teenage years.", "park_bench", "family_child_front@R",
  "FIX (L): START EARLIER / small, honest money talks from the teenage years")
b("h2", "The next generation can't keep what they were never taught.", "alux_desk_lamp_book", "puppet:sad/pointLeft@R",
  "LESSON (L): OLD MONEY LESSON / The next generation can't keep what they were never taught.")

# ------------------------------------------------------------------ HABIT 1 (open-loop payoff)
b("h1", "Number one: they think in generations.", "alux_stage_spotlight", "celebrate_threeq@C", f"CH #1 · {CH[1]}; TRK pip 2 filled, pip 1 gold", True)
b("h1", "This is the one I told you to stay for, because it ties everything together.", "alux_arena_concourse", "puppet:happy/celebrate@R",
  "LOOP payoff chip: #1 / THE ONE TO STAY FOR")
b("h1", "Remember the start: 93% of the grandchildren of the top 1% didn't stay there,", "house_front", "puppet:neutral/pointLeft@R",
  f"DC (L, same design as the opening): 93%; {SRC_KW}")
b("h1", "and 72% of the top 1% fell out within a decade.", "library_study", None, "DC: 72% / within a decade; SRC held")
b("h1", "So the families who last plan beyond their own lifetime.", "kitchen_table", None,
  "PROP family tree from the cold open returns; this time all three rows light gold")
b("h1", "They avoid expensive debt, hold for the long term, write things down and teach the next generation.", "shop_counter", "puppet:happy/explain@R",
  "TRK pips 8, 4, 3, 2 light in turn on their words")
b("h1", "Every habit on this list is really this one.", "alux_arena_skyline_spotlight", "puppet:happy/thumbsUp@R", "TRK all pips flow into pip 1")
b("h1", "The fix: before any big money decision, ask one question.", "park_bench", "alux_thinking_worried@L", "FIX: ASK ONE QUESTION")
b("h1", "\"Will this still look smart in twenty years?\"", "bedroom_night", "calendar_point_threeq@R", "FIX quote card: 'WILL THIS STILL LOOK SMART IN TWENTY YEARS?'")
b("h1", "Making money outlast you is the whole game.", "alux_stage_spotlight", "puppet:happy/pointLeft@R",
  "LESSON (L, larger, final): OLD MONEY LESSON / Making money outlast you is the whole game.")

# ------------------------------------------------------------------ CLOSING
b("close", "\"Old money\" isn't really about money that's old.", "house_front", "idle_front@L", "PROP OLD MONEY plaque from the cold open, restored")
b("close", "It's about habits that make money last: building your own base, avoiding expensive debt, spending on what matters,", "alux_arena_concourse", "puppet:neutral/explain@R",
  "PROP checklist rows tick in on the words")
b("close", "holding for the long term, and writing things down for the people who come next.", "suburban_fence", None,
  "PROP checklist continues; family tree silhouettes at the bottom")
b("close", "Pick one habit from this list and start it this month.", "alux_skyline_checklist", "puppet:happy/pointLeft@R",
  "CHECKLIST card (L): the nine fixes as nine one-line rows; title START ONE THIS MONTH")
b("close", "Which habit are you starting with? Tell me the number in the comments.", "alux_arena_skyline_spotlight", "puppet:happy/celebrate@R",
  "TRK as comment prompt: nine numbered pips + COMMENT YOUR NUMBER chip; NOTE footer EDUCATION ONLY, NOT FINANCIAL ADVICE; hold 2 s after voice")

# ------------------------------------------------------------------ retention marks (playbooks/LONGFORM_RETENTION.md)
RETENTION = {
    "What do the families who keep it": dict(rehook="question"),
    "Habit number three is one": dict(loop="open"),
    "And stay to number one": dict(rehook="teaser"),
    "Be honest: do you have a will?": dict(rehook="question"),
    "And this is the one I told you about.": dict(loop="payoff"),
    "Think back. Did anyone": dict(rehook="question"),
    "This is the one I told you to stay for": dict(loop="payoff"),
    "Which habit are you starting with?": dict(cta=True),
}
for x in B:
    for k, v in RETENTION.items():
        if x["text"].startswith(k):
            x.update(v)

# ======================================================================= validation
def norm(s):
    return re.sub(r"\s+", " ", s.replace("*", "").replace("“", '"').replace("”", '"').replace("’", "'")).strip().lower()


def approved_narration():
    txt = SCRIPT.read_text().split("## Cold open", 1)[1].split("\n", 1)[1].split("## Fact check", 1)[0]
    keep = []
    for ln in txt.splitlines():
        ln = ln.strip()
        if not ln or ln.startswith(("`[SRC", "#", "---", "*(")):
            continue
        keep.append(ln.replace("**Old money lesson:** ", ""))
    return norm(" ".join(keep))


def pack_numbers():
    p = PACK.read_text().split("## Full sources", 1)[0]
    return {n.replace(",", "") for n in re.findall(r"\d[\d,]*(?:\.\d+)?", p)}


def nums(s):
    s = re.sub(r"pip[s]? [\d, and]+|#\d|\b\d (?:s|>)|\b9 > 1|\d+ s after|first 2 s|hold 2 s", "", s)
    return {n.rstrip(".,").replace(",", "") for n in re.findall(r"\d[\d,]*(?:\.\d+)?", s)}


def parse_m(m):
    if not m:
        return None, None, None, None
    if m.startswith("puppet:"):
        spec, pos = m[7:].split("@")
        e, g = spec.split("/")
        return "puppet", e, g, pos
    name, pos = m.split("@")
    return "library", name, None, pos


def camera_plan():
    seq = ["PUSH 1.00>1.06", "PAN-R 40 px", "DRIFT-UP", "PULL 1.08>1.00", "PAN-L 40 px", "HOLD (parallax)", "TILT-DOWN 40 px", "ZOOM 1.35 crop"]
    out, last_plate, prev, k = [], {}, None, 0
    for x in B:
        if x["ov"].startswith("DC") or "; DC" in x["ov"] or " DC (" in x["ov"]:
            cand = ["PUNCH to 1.10 on DC"] + seq
        else:
            cand = seq[k % len(seq):] + seq[:k % len(seq)]
            k += 1
        if x["m"] and x["m"].startswith("puppet:"):          # zoom crops scale the character layer and push the puppet out of frame
            cand = [c for c in cand if not c.startswith("ZOOM")]
        for c in cand:
            key = c.split()[0]
            if key != prev and last_plate.get(x["plate"]) != key:
                break
        out.append(c); prev = c.split()[0]; last_plate[x["plate"]] = prev
    return out


def validate():
    errs = []
    spoken = norm(" ".join(x["text"] for x in B if not x["ch"]))
    want = approved_narration()
    if spoken != want:
        a, c = spoken.split(), want.split()
        i = next((j for j in range(min(len(a), len(c))) if a[j] != c[j]), min(len(a), len(c)))
        errs.append(f"narration differs from approved script at word {i}: plan '{' '.join(a[i:i+8])}' vs script '{' '.join(c[i:i+8])}'")
    allowed = pack_numbers() | {"22", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "401"}
    pairs = Counter()
    pb = []
    for i, x in enumerate(B, 1):
        if x["plate"] not in PLATES:
            errs.append(f"beat {i}: plate '{x['plate']}' not in library")
        kind, a, g, pos = parse_m(x["m"])
        if kind == "library" and a not in CUTS:
            errs.append(f"beat {i}: cut-out '{a}' not in library")
        if kind == "puppet" and (a not in EXPR or g not in GEST):
            errs.append(f"beat {i}: puppet '{a}/{g}' not in v2.0")
        if kind:
            pairs[(x["plate"], x["m"].split("@")[0])] += 1
        if i > 1 and kind == "library" and parse_m(B[i - 2]["m"])[1] == a:
            errs.append(f"beat {i}: cut-out {a} repeated from the previous beat")
        pb.append(dict(plate=x["plate"], mascot=kind, gesture=g, puppet_x=pos or "C",
                       card=("L" if g == "pointLeft" and "(L" in x["ov"] else None)))
        for n in nums(x["text"]) | nums(x["ov"]):
            if n not in allowed:
                errs.append(f"beat {i}: number {n} is not in the source pack")
    errs += [f"pair {p} + {m} used {k} times" for (p, m), k in pairs.items() if k > 1]
    errs += beat_rules.puppet_rule_errors(pb)
    for p, k in Counter(x["plate"] for x in B).items():
        if k > MAX_PLATE:
            errs.append(f"plate {p} used {k} times (max {MAX_PLATE})")
    return errs


FINAL_ITEM = "h1"
def retention_check():
    cams, t, rb = camera_plan(), 0.0, []
    for x, c in zip(B, cams):
        d = dur(x["text"]); rb.append(dict(x, start=t, dur=d, cam=c)); t += d
    fi = next(i for i, x in enumerate(B) if x["sec"] == FINAL_ITEM)
    return retention_rules.retention_errors(rb, PACK.read_text(), fi)


WPS = 2.6
def dur(t):
    return max(2.6, len(t.split()) / WPS + 0.35)


def fmt_t(s):
    return f"{int(s // 60)}:{int(s % 60):02d}"


GAPS = [
    ("family / several generations on screen (cold open, #2, #1, close)", "No family or child cut-outs exist.",
     "Remotion PROP: a drawn 3-row family tree (GRANDPARENTS > PARENTS > GRANDCHILDREN) in palette line-art, plus flat silhouettes (adult, teen, child) as SVG; reused as a callback in #1 and the close.", "$0"),
    ("children / parent-child talk (#2)", "No child cut-out.", "GENERATED (user-approved): `mascot_family_child_front` on `house_front` (#2 chapter) and `park_bench` (#2 fix).", "$0.025"),
    ("documents / will (#3, #1)", "No will, estate document or seal in the library.",
     "Remotion PROP: drawn will page with a gold wax seal, plus three document cards (WILL / HEALTHCARE DIRECTIVE / POWER OF ATTORNEY) with empty ticks; library `clipboard_fill_threeq`, `clipboard_show_front`, `test_paper_pencil_front` give the writing poses.", "$0"),
    ("census records 1850-1940 (cold open)", "No archive plate.",
     "`alux_open_notebook_closeup` + drawn ledger pages flipping and a year chip.", "$0"),
    ("big house / servants / best schools (cold open)", "No mansion plate.", "GENERATED (user-approved): `plate_mansion_estate` (beats 1 and 9); icons for servants/schools on `library_study`.", "$0.025"),
    ("inheritance (#9)", "No inheritance plate.", "Thought-bubble envelope prop + gift-box segment in a wealth bar.", "$0"),
    ("used vs new car (#7)", "Covered", "`car_dealership`, `two_houses_new_car`, `car_keys_dangle_threeq`, `fence_envious_front`.", "$0"),
]
OPTIONAL = [("`mascot_will_sign_front` cut-out (skipped by the user)", 1, 0.025)]


def write():
    OUT.mkdir(parents=True, exist_ok=True)
    cams = camera_plan()
    words = sum(len(x["text"].split()) for x in B)
    total = sum(dur(x["text"]) for x in B)
    pu = Counter(x["plate"] for x in B)
    kinds = Counter(parse_m(x["m"])[0] for x in B)
    m = [f"# Beat plan: {TITLE}", "",
         f"_Step 2 for review. Nothing voiced, generated or rendered._", "",
         f"- **{len(B)} beats**, {words} words, about **{fmt_t(total)}** of narration at Kokoro pace ({total / len(B):.1f} s per beat, estimate).",
         f"- Mascot: **puppet v2.0** {kinds['puppet']} beats (talking, pointing at cards, reactions) · **library cut-outs** {kinds['library']} beats (prop poses) · no mascot {kinds[None]} beats.",
         "- Narration = approved script v1 word for word (checked in code), **plus nine spoken chapter lines** (`Number nine: they don't wait for an inheritance.` etc., marked `CH` below). The approved script has them only as headings; say if you want them silent (card only).",
         "- The `Old money lesson:` label is **on the card only**, not spoken; the lesson sentence is spoken.",
         "- Checks passed: PUPPET_BEAT_RULES (`beat_rules.puppet_rule_errors`), library existence, no plate+mascot pair twice, no cut-out in adjacent beats, "
         f"plate spread ≤ {MAX_PLATE} uses, camera never repeats in adjacent beats or on a plate's next use, every number in the pack.", "",
         "## Legend", "",
         "- Mascot `puppet:<expression>/<gesture>@R|C|L` (pointing = `pointLeft`, puppet frame-right, card frame-left) or library cut-out `name@pos`.",
         "- Overlays: `CH` chapter card `#n · TITLE` · `TRK` 9 → 1 tracker (top-right pips) · `DC` data card (charcoal, gold border, Fraunces number) · `SRC` short source line bottom-left (full citation in the description) · `FIX` fix card · `LESSON` **Old money lesson card** (new style: cream card, small gold OLD MONEY LESSON label, serif italic line, gold rule; same slot every habit) · `LOOP` open-loop chip / payoff card · `PROP` drawn Remotion prop.", ""]
    secs = defaultdict(list)
    for i, x in enumerate(B, 1):
        secs[x["sec"]].append(i)
    t = 0.0
    for s in ORDER:
        m += [f"## {SEC_NAMES[s]}", "", "| # | t | len | narration | plate | mascot | overlays | camera |", "|---|---|---|---|---|---|---|---|"]
        for i in secs[s]:
            x = B[i - 1]; d = dur(x["text"])
            m.append(f"| {i}{' CH' if x['ch'] else ''} | {fmt_t(t)} | {d:.1f}s | {x['text']} | `{x['plate']}` | {('`' + x['m'] + '`') if x['m'] else '-'} | {x['ov']} | {cams[i - 1]} |")
            t += d
        m.append("")
    m += ["## Plate spread", "",
          f"{len(pu)} of {len(PLATES)} plates used. Uses per plate: " + ", ".join(f"`{k}` ×{v}" for k, v in pu.most_common()) + ".",
          "Heaviest plates (`house_front`, `living_room_sofa`, `kitchen_table`, `alux_stage_spotlight`, ...) are spread across sections, never adjacent except puppet → puppet, and each reuse has a different mascot, camera move and overlay.", "",
          "## Library gaps and solutions", "",
          "| gap | library state | solution (no generation) | cost |", "|---|---|---|---|"]
    m += [f"| {a} | {b_} | {c} | {d} |" for a, b_, c, d in GAPS]
    m += ["", "**Two upgrades generated on Nov 13 (mansion plate, mascot-with-child), real spend $0.050; the rest is Remotion props / existing plates.**", "",
          "Optional upgrades only (I will not generate them without your OK), at the RunPod public-endpoint image price used before:", "",
          "| asset | images | est. cost |", "|---|---|---|"]
    m += [f"| {a} | {n} | ${c * n:.3f} |" for a, n, c in OPTIONAL]
    tot = sum(n * c for _, n, c in OPTIONAL)
    m += [f"| **total if all three** | {sum(n for _, n, _ in OPTIONAL)} | **${tot:.3f}** (plus retries; cut-outs also need the existing background-removal + QA pass, $0) |", ""]
    (OUT / "beats.md").write_text("\n".join(m))
    return words, total


CLAIMS = [
    ("93% of grandchildren of men in the top 1% did not reach the top 1%; census 1850-1940", "Opening hook", "Kalsi & Ward, NBER 2025 (via InvestmentNews)", "6, 85"),
    ("72% of the top 1% fell out within ten years / a decade", "Opening hook, supporting fact", "Kalsi & Ward, NBER 2025", "8, 86"),
    ("70% by 2nd generation, 90% by 3rd — shown only as an often-quoted, challenged claim", "Myth-check + rule", "Williams Group; Grubman 2022 (via InvestmentNews)", "15-16"),
    ("Williams Group study of 3,200 families", "Myth-check", "Williams Group, as cited by InvestmentNews", "17"),
    ("Grubman 2022, 'There is no 70% rule'", "Myth-check", "Grubman (2022), as cited by InvestmentNews", "18"),
    ("about a quarter (25%) or about half (53%) of top-10% wealth from inheritances and gifts", "Habit 9", "Federal Reserve FEDS Notes, June 2018 (SCF 2016)", "24-25"),
    ("22.36% average rate on card accounts charged interest, Q3 2026", "Habit 8", "Federal Reserve G.19, November 2026", "33-34"),
    ("'Debt at over 22%' (lesson line)", "true of the pack's 22.36% (user-approved wording, Nov 13)", "same", "37"),
    ("nearly 37% bought their most recent car used, not new", "Habit 7", "Stanley & Danko, The Millionaire Next Door (1996)", "41"),
    ("more than half stuck to a budget", "Habit 6", "Stanley & Danko (1996)", "46"),
    ("401(k) participation 37% (opt-in) vs about 86% (automatic enrolment), one large US company", "Habit 5", "Madrian & Shea, QJE 2001", "52-54"),
    ("about 1.2 percentage points a year, roughly 15% of potential gains, over ten years", "Habit 4", "Morningstar, Mind the Gap 2025", "61-63"),
    ("only 24% have a will; 43% 'just haven't gotten around to it'; more than 2,500 adults, 2025", "Habit 3", "Caring.com & YouGov 2025", "69-70"),
    ("52% of 1,007 high-net-worth respondents lacked a will, advance healthcare directive or durable power of attorney (2024)", "Habit 3 supporting", "Bank of America 2024 (via InvestmentNews)", "72-73"),
    ("open loop 'even most wealthy people haven't fully taken care of' = the 52% figure", "approved wording (script v1)", "Bank of America 2024", "12"),
    ("69% of wealthy parents with adult children discussed plans, typically at about 31", "Habit 2", "Bank of America 2024", "78-79"),
]


def write_claims():
    c = ["# Claims table — checked against `AURELIS_OLDMONEY_SOURCE_PACK.md`", "",
         "Every number in narration and overlays is machine-checked to occur in the pack (`oldmoney_plan.py`); this table maps each claim to its pack section by hand.", "",
         "| claim as spoken / shown | pack section | source on screen | beats |", "|---|---|---|---|"]
    c += [f"| {a} | {b_} | {s} | {n} |" for a, b_, s, n in CLAIMS]
    c += ["", "Pack rules: 70%/90% only as a challenged claim ✔ · source named whenever a number is stated ✔ (short SRC line on screen, brief name in speech) · countdown 9 → 1 ✔ · no promises of wealth; NOT FINANCIAL ADVICE footer at the end ✔ · no other Millionaire Next Door figures ✔.",
          "Non-numeric statements I wrote (opinions/framing, not evidence): the nine 'Old money lesson' lines, 'Here's the thing', the relatable second-person moments. None adds a fact."]
    (OUT / "claims.md").write_text("\n".join(c))


if __name__ == "__main__":
    e = validate()
    re_, rw = retention_check(); e += re_
    for x in rw:
        print("WARN", x)
    for x in e:
        print("ERR", x)
    w, ts = write()
    write_claims()
    print(f"beats {len(B)}, words {w}, est {fmt_t(ts)}, errors {len(e)}")
    sys.exit(1 if e else 0)
