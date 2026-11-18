#!/usr/bin/env python3
"""Gate-1 plan for "Money Psychology Explained: 10 Mental Traps That Keep Smart People Broke" (Aurelis long-form, AluxTest style).

Single source of truth for the narration + beat plan. Running it validates the plan and writes
  empires_short/out/aurelis_moneypsych_v2/script.md   (narration, word counts, claims/source table)
  empires_short/out/aurelis_moneypsych_v2/beats.md    (beat table: line, plate, cut-out, overlays, camera; coverage; gaps; cost)
Checks: every plate/cut-out exists in library.json; no plate+cut-out pair repeats anywhere and neither repeats in the adjacent beat;
same plate never reuses the same camera move twice in a row; every number in narration/overlays is in the source pack (as worded).
No API calls, no cost.
"""
import json, re, sys
sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "empires_short/out/aurelis_moneypsych_v2"
LIB = json.loads((ROOT / "empires_short/public/img/aurelis/library/library.json").read_text())["images"]
PLATES = {x["filename"][6:-4]: x for x in LIB if x["kind"] == "plate"}
CUTS = {x["filename"][7:-4]: x for x in LIB if x["kind"] == "cutout"}

TITLE = "Money Psychology Explained: 10 Mental Traps That Keep Smart People Broke"
CH = {10: "THE KNOWLEDGE GAP", 9: "KEEPING UP WITH THE NEIGHBOURS", 8: "THE WINDFALL ILLUSION", 7: "LIVING WITHOUT A BUFFER", 6: "OVERCONFIDENCE",
      5: "LOSS AVERSION", 4: "THE DEFAULT TRAP", 3: "PRESENT BIAS", 2: "CARD BLINDNESS", 1: "THE SCARCITY TAX"}
SEC_NAMES = {"hook": "Hook and promise", "close": "Closing", **{f"t{n}": f"Trap {n}: {CH[n].title()}" for n in CH}}

# (section, narration, plate, cut-out(s) or None, overlays, camera)
# cut-out syntax: name@L|C|R (screen position); "a@L+b@R" = two mascots; "~" after the name = mirrored.
# overlays: CH chapter card, TRK tracker, DC data card, SRC source line, FIX fix card, PROP drawn prop, NOTE other.
B = []
def b(sec, text, plate, cut, ov, cam):
    B.append((sec, text, plate, cut, ov, cam))

# ------------------------------------------------------------------ HOOK + PROMISE
b("hook", "Worrying about money can lower your thinking power about as much as losing a full night's sleep.",
  "bedroom_night", "yawning_front@R", "TITLE card (opening seconds): MONEY PSYCHOLOGY EXPLAINED / 10 MENTAL TRAPS THAT KEEP SMART PEOPLE BROKE; PROP drawn crescent moon + drifting zzz", "PUSH 1.00>1.06")
b("hook", "In one study, the effect was similar to a 13-point drop in IQ.",
  "alux_stage_spotlight", "alux_surprised_arms_up@C", "DC (on 'drop'): SIMILAR TO A 13-POINT DROP IN IQ; SRC line fades in on the next beat", "PUNCH to 1.10 on DC")
b("hook", "That study was published in the journal Science, by Mani, Mullainathan, Shafir and Zhao.",
  "kitchen_table", "alux_point_book@R", "SRC: Mani, Mullainathan, Shafir & Zhao, Science, 2013 (held from the previous beat)", "PAN-R 40 px")
b("hook", "Money problems aren't only about money. They change how we think.",
  "apartment_hallway", "worried_threeq@C", "PROP: gold thought-spiral drawn above the head, tightening", "DRIFT-UP")
b("hook", "Many money mistakes come from how our brains work, not from how smart we are.",
  "library_study", "alux_thinking_worried@L", "KEY words pop: HOW OUR BRAINS WORK / NOT HOW SMART WE ARE (gold-glow, word-anchored); PROP drawn brain icon", "HOLD (plate parallax 0.55x)")
b("hook", "The good news is that a trap you can see is a trap you can plan around.",
  "home_office_laptop", "confident_threeq@R", "PROP: drawn trap-door outline lighting up gold", "PULL 1.08>1.00")
b("hook", "Here are ten mental traps researchers have measured, counting down to the one that matters most.",
  "alux_arena_skyline_spotlight", "alux_point_left@R", "TRK builds (ten pips drop in 10>1, one per beat of the line); mascot points at it", "PUSH 1.00>1.05")
b("hook", "For each trap you'll get the evidence, the source, and one simple fix.",
  "office_desk", "explaining_threeq@L", "three chips pop in order: EVIDENCE / SOURCE / FIX", "PAN-L 40 px")
b("hook", "This is education, not financial advice, and nothing here promises you riches.",
  "bank_counter", "idle_front@C", "NOTE small footer EDUCATION - NOT FINANCIAL ADVICE (stays 4 s)", "HOLD")

# ------------------------------------------------------------------ TRAP 10
b("t10", "Number ten: the knowledge gap.",
  "library_study", "test_paper_think_threeq@R", "CH #10 · THE KNOWLEDGE GAP (wipe in, then out); TRK on, pip 10 gold", "PULL 1.08>1.00")
b("t10", "Picture sitting down to answer some basic money questions, with no phone and no calculator.",
  "home_office_laptop", "test_paper_pencil_front@L", "PROP: blank test sheet slides in beside the mascot", "PUSH 1.00>1.06")
b("t10", "Annamaria Lusardi and Olivia S. Mitchell asked three questions like that, known as the Big Three, at Wharton in 2015.",
  "alux_desk_lamp_book", "clipboard_show_front@R", "SRC: Lusardi & Mitchell, 'Big Three' financial literacy questions, Wharton, 2015", "PAN-L 40 px")
b("t10", "They covered interest, inflation and diversification.",
  "kitchen_table", None, "PROP: three drawn cards flip in, one per word: INTEREST / INFLATION / DIVERSIFICATION (labels = Remotion text)", "HOLD")
b("t10", "Only about one in three Americans aged 50 and over answered those three basic money questions correctly.",
  "alux_open_notebook_closeup", "shrug_front@L", "DC: ABOUT 1 IN 3 / Americans aged 50 and over answered three basic money questions correctly; PROP: three figure icons, one lit gold; SRC held", "PUNCH to 1.10 on DC")
b("t10", "That isn't about laziness. Nobody is born knowing what inflation does to savings.",
  "supermarket_aisle", "idle_threeq@C", "none (breathing room beat)", "DRIFT-UP")
b("t10", "Interest is what your money earns when you save it, and what it costs when you borrow.",
  "bank_counter", "explaining_front@R", "PROP: coin stack growing with a gold arrow", "PUSH 1.00>1.05")
b("t10", "Inflation means prices rise, so the same money buys less.",
  "checkout_lane", "cash_shocked_front@L", "PROP: price tag ticking upward (blank digits shown as bars, no numerals)", "PAN-R 40 px")
b("t10", "Diversification means not putting all your money in one place.",
  "payday_desk", "piggy_bank_hold_front@C", "PROP: three drawn jars, coins split between them", "ZOOM 1.35 on the desk")
b("t10", "Without them, advanced strategies are just guesses with nicer names.",
  "library_study", "idle_front@L", "none", "PUSH 1.00>1.05")
b("t10", "The fix: learn those three basics, compound interest, inflation and diversification, before any advanced strategy.",
  "office_desk", "thumbs_up_front@L", "FIX card: LEARN THE 3 BASICS FIRST / compound interest · inflation · diversification", "PULL 1.08>1.00")

# ------------------------------------------------------------------ TRAP 9
b("t9", "Number nine: keeping up with the neighbours.",
  "suburban_fence", "fence_envious_front@C", "CH #9 · KEEPING UP WITH THE NEIGHBOURS; TRK pip 10 filled, pip 9 gold", "PUSH 1.00>1.06")
b("t9", "You don't need a rich neighbour. You just need one who buys something shiny.",
  "two_houses_new_car", "sad_threeq@L", "none", "PAN-R slow across the driveway")
b("t9", "Researchers looked at the Netherlands, at people living next door to Postcode Lottery winners who hadn't played themselves.",
  "house_front", "alux_point_left@R", "PROP: map-pin chip NETHERLANDS (Remotion text); two drawn house icons, one marked LOTTERY NEXT DOOR", "DRIFT-UP")
b("t9", "Compared with other people who didn't take part, those neighbours bought significantly more cars.",
  "car_dealership", "car_keys_dangle_threeq@R", "DC: SIGNIFICANTLY MORE CARS / neighbours of Postcode Lottery winners vs other non-participants; PROP: house icons side by side, NOT IN THE LOTTERY", "PUNCH to 1.10 on DC")
b("t9", "That's from Kuhn, Kooreman, Soetevent and Kapteyn, published in the American Economic Review in 2011.",
  "two_houses_new_car", None, "SRC: Kuhn, Kooreman, Soetevent & Kapteyn, American Economic Review, 2011", "ZOOM 1.35 on the car, slow push")
b("t9", "We tend to measure ourselves against whoever lives closest.",
  "mall_storefronts", "confident_front@C", "none", "PULL 1.08>1.00")
b("t9", "Nobody sets out to compete. It just happens quietly, one driveway at a time.",
  "two_houses_new_car", "car_keys_hold_front@L", "none", "DRIFT-UP")
b("t9", "A new car next door can quietly turn your own plans into a race.",
  "apartment_hallway", "angry_threeq@R", "PROP: drawn speedometer needle creeping up", "PAN-L 40 px")
b("t9", "The fix: compare your spending to your own goals, not to the people around you.",
  "home_office_laptop", "clipboard_show_front@L", "FIX card: COMPARE TO YOUR GOALS, NOT YOUR NEIGHBOURS", "TILT-DOWN 40 px")

# ------------------------------------------------------------------ TRAP 8
b("t8", "Number eight: the windfall illusion.",
  "lottery_kiosk", "lottery_ticket_hold_front@L", "CH #8 · THE WINDFALL ILLUSION; TRK pip 9 filled, pip 8 gold", "PULL 1.08>1.00")
b("t8", "A big win feels like it should solve everything.",
  "house_front", "celebrate_front@C", "PROP: gold confetti burst", "PUSH 1.00>1.06")
b("t8", "Researchers studied about 35,000 Florida lottery winners.",
  "bank_counter", "lottery_ticket_scratch_threeq@R", "DC: ABOUT 35,000 FLORIDA LOTTERY WINNERS; SRC: Hankins, Hoekstra & Skiba, The Review of Economics and Statistics, 2011", "PAN-L 40 px")
b("t8", "Prizes of $50,000 to $150,000 only postponed bankruptcy. They didn't prevent it.",
  "kitchen_table", "cash_throw_front@C", "DC: $50,000 TO $150,000 PRIZES / ONLY POSTPONED BANKRUPTCY; PROP: drawn calendar page sliding the date later, then a red stamp", "PUNCH to 1.10 on DC")
b("t8", "Big winners were less likely to file in the first two years.",
  "payday_desk", "cash_fan_front@R", "PROP: timeline bar, first stretch lit: FIRST TWO YEARS - LESS LIKELY TO FILE", "DRIFT-UP")
b("t8", "But three to five years after winning, they were more likely to file.",
  "house_front", "sad_front@L", "PROP: timeline bar, later stretch lit red: THREE TO FIVE YEARS AFTER - MORE LIKELY TO FILE", "PULL 1.08>1.00")
b("t8", "That's from Hankins, Hoekstra and Skiba, in The Review of Economics and Statistics, 2011.",
  "library_study", None, "SRC: Hankins, Hoekstra & Skiba, The Review of Economics and Statistics, 2011", "ZOOM 1.35 on the shelves, slow push")
b("t8", "Money that arrives without a plan has no job to do, so it drifts away.",
  "payday_desk", "worried_threeq@L", "PROP: coins drifting off the desk edge", "PAN-R 40 px")
b("t8", "The fix: treat any windfall, a bonus, an inheritance or a refund, as a plan, not a party.",
  "lottery_kiosk", "pay_slip_open_front@R", "FIX card: A PLAN, NOT A PARTY / bonus · inheritance · refund", "PUSH 1.00>1.05")
b("t8", "Decide where it goes before it arrives.",
  "kitchen_table", "pay_slip_hand_over_threeq@L", "PROP: three drawn envelopes labelled by Remotion text with arrows (blank until the user names them)", "HOLD")

# ------------------------------------------------------------------ TRAP 7
b("t7", "Number seven: living without a buffer.",
  "apartment_hallway", "piggy_bank_shake_front@C", "CH #7 · LIVING WITHOUT A BUFFER; TRK pip 8 filled, pip 7 gold", "PUSH 1.00>1.06")
b("t7", "A buffer is a small pile of cash set aside for surprises.",
  "kitchen_table", "piggy_bank_hold_front@L", "PROP: small coin pile fades in beside the mascot", "PAN-R 40 px")
b("t7", "Think of the last time something broke at the worst possible moment.",
  "car_dealership", "sad_threeq@L", "none", "PUSH 1.00>1.05")
b("t7", "Say a surprise expense of $400 lands on your table.",
  "living_room_sofa", "receipt_shocked_front@R", "PROP: drawn bill tag $400 drops onto the frame (Remotion text)", "PUNCH to 1.10 on the tag")
b("t7", "In the Federal Reserve's 2025 survey, 63% of US adults said they would cover a $400 emergency expense with cash or its equivalent.",
  "bank_counter", "alux_cash_hold_small@L", "DC: 63% / would cover a $400 emergency expense with cash or its equivalent; SRC: Federal Reserve, Economic Well-Being of U.S. Households in 2025 (published May 2026)", "DRIFT-UP")
b("t7", "So more than a third would not.",
  "bedroom_night", "worried_front@R", "DC: MORE THAN A THIRD WOULD NOT; PROP: drawn pie, the larger slice gold, the rest dark with a gap", "PULL 1.08>1.00")
b("t7", "That's from the Federal Reserve's Economic Well-Being of U.S. Households in 2025, published in May 2026.",
  "alux_desk_lamp_book", None, "SRC: Federal Reserve, Economic Well-Being of U.S. Households in 2025 (published May 2026)", "ZOOM 1.35 on the lamp and papers")
b("t7", "Without a buffer, a small surprise can turn into a big decision.",
  "apartment_hallway", "sad_front@C", "PROP: a drawn domino chain starting from a tiny tag", "HOLD")
b("t7", "The fix: build a small emergency buffer first.",
  "bank_counter", "piggy_bank_drop_coin_threeq@L", "FIX card: BUILD A SMALL EMERGENCY BUFFER FIRST", "PAN-L 40 px")
b("t7", "Even one month of essentials changes how you make every other decision.",
  "bedroom_night", "piggy_bank_full_front@R", "PROP: drawn calendar block, one month shaded gold: ONE MONTH OF ESSENTIALS", "HOLD")

# ------------------------------------------------------------------ TRAP 6
b("t6", "Number six: overconfidence.",
  "trading_screens", "confident_front@R", "CH #6 · OVERCONFIDENCE; TRK pip 7 filled, pip 6 gold", "PULL 1.08>1.00")
b("t6", "Confidence feels like skill, especially when you are right a few times in a row.",
  "startup_garage", "thumbs_up_threeq@L", "PROP: drawn winning streak of gold ticks", "PUSH 1.00>1.06")
b("t6", "Brad Barber and Terrance Odean studied 66,465 US households with brokerage accounts, from 1991 to 1996.",
  "office_desk", "phone_point_threeq@L", "DC: 66,465 US HOUSEHOLDS / brokerage accounts, 1991-1996; SRC: Barber & Odean, Journal of Finance, 2000", "PAN-R 40 px")
b("t6", "The households that traded the most earned 11.4% a year.",
  "home_office_laptop", "running_front@R", "PROP: bar chart, first bar grows to 11.4% (label TRADED MOST)", "PUNCH to 1.10 on the bar")
b("t6", "The market returned 17.9%.",
  "trading_screens", None, "PROP: second bar grows to 17.9% (label THE MARKET)", "ZOOM 1.35 on the screens")
b("t6", "And the average household earned 16.4%.",
  "startup_garage", "idle_front@R", "PROP: third bar grows to 16.4% (label AVERAGE HOUSEHOLD); all three bars held", "DRIFT-UP")
b("t6", "That comes from Barber and Odean, \"Trading Is Hazardous to Your Wealth,\" in the Journal of Finance, 2000.",
  "library_study", "alux_point_book@R", "SRC: Barber & Odean, 'Trading Is Hazardous to Your Wealth,' Journal of Finance, 2000", "PAN-L 40 px")
b("t6", "More activity did not mean more money.",
  "trading_screens", "sad_threeq@C", "none", "PULL 1.08>1.00")
b("t6", "The fix: trade less. For most people, a simple long-term plan beats constant activity.",
  "park_bench", "sitting_front@L", "FIX card: TRADE LESS / a simple long-term plan beats constant activity", "DRIFT-UP")

# ------------------------------------------------------------------ TRAP 5
b("t5", "Number five: loss aversion.",
  "bank_counter", "worried_threeq@R", "CH #5 · LOSS AVERSION; TRK pip 6 filled, pip 5 gold", "PUSH 1.00>1.06")
b("t5", "Finding some money feels good. Losing the same amount feels worse.",
  "living_room_sofa", "sad_front@L", "PROP: drawn balance scale, GAIN pan light, LOSS pan heavy", "PAN-R 40 px")
b("t5", "Daniel Kahneman and Amos Tversky described this in prospect theory in 1979, and Tversky and Kahneman again in 1992.",
  "library_study", "explaining_threeq@R", "SRC: Kahneman & Tversky, prospect theory (1979); Tversky & Kahneman (1992)", "DRIFT-UP")
b("t5", "Losses feel roughly twice as strong as equal gains.",
  "park_bench", "angry_threeq@L", "DC: ROUGHLY TWICE AS STRONG / losses vs equal gains; PROP: scale tips hard to the LOSS side", "PUNCH to 1.10 on DC")
b("t5", "Researchers still debate how strong the effect is for small amounts.",
  "alux_desk_lamp_book", "shrug_threeq@R", "NOTE chip: STILL DEBATED FOR SMALL AMOUNTS (honesty flag, stays 3 s)", "HOLD")
b("t5", "Selling can feel like admitting the loss, so waiting feels easier.",
  "kitchen_table", "worried_threeq@L", "PROP: a drawn price tag with an arrow pointing down, a hand hovering over it", "PULL 1.08>1.00")
b("t5", "That pull makes us sell in a panic, or hold a bad decision for too long.",
  "trading_screens", "worried_front@C", "PROP: drawn red down-arrow on the middle screen, then a gold padlock", "ZOOM 1.35 on the screens")
b("t5", "The fix: ask yourself, would I make this choice today if I were starting fresh?",
  "living_room_sofa", "alux_thinking_worried@R", "FIX card: 'Would I make this choice today if I were starting fresh?'", "PULL 1.08>1.00")

# ------------------------------------------------------------------ TRAP 4
b("t4", "Number four: the default trap.",
  "office_desk", "sitting_threeq@L", "CH #4 · THE DEFAULT TRAP; TRK pip 5 filled, pip 4 gold", "DRIFT-UP")
b("t4", "A default is whatever happens if you do nothing.",
  "home_office_laptop", "yawning_front@C", "PROP: drawn toggle switch already set to ON", "PUSH 1.00>1.06")
b("t4", "Think of every setting on your phone that you never changed.",
  "living_room_sofa", "phone_selfie_threeq@R", "none", "PAN-L 40 px")
b("t4", "At one large US company, 401(k) participation among new employees was 37% when they had to sign up themselves.",
  "payday_desk", "clipboard_fill_threeq@R", "DC: 37% / had to sign up themselves; SRC: Madrian & Shea, The Power of Suggestion, Quarterly Journal of Economics, 2001; PROP: first bar to 37%", "TILT-DOWN 40 px")
b("t4", "Under automatic enrolment, it was about 86%.",
  "bank_counter", "pay_slip_open_front@L", "DC: ABOUT 86% / automatic enrolment; PROP: second bar to 86% beside the 37% bar", "PUNCH to 1.10 on the bar")
b("t4", "Most people simply keep whatever is set for them.",
  "office_desk", "shrug_threeq@R", "none", "ZOOM 1.35 on the desk")
b("t4", "That's from Brigitte Madrian and Dennis Shea, \"The Power of Suggestion,\" in the Quarterly Journal of Economics, 2001.",
  "library_study", None, "SRC: Madrian & Shea, 'The Power of Suggestion,' Quarterly Journal of Economics, 2001", "PUSH 1.00>1.05")
b("t4", "What moved the numbers was the starting setting.",
  "home_office_laptop", "explaining_front@L", "PROP: the toggle from earlier flips from OFF to ON (labels Remotion text)", "PAN-L 40 px")
b("t4", "The fix: make good choices the default. Automate saving on payday, so doing nothing means saving.",
  "payday_desk", "pay_slip_hand_over_threeq@R", "FIX card: AUTOMATE SAVING ON PAYDAY / doing nothing = saving", "PULL 1.08>1.00")

# ------------------------------------------------------------------ TRAP 3
b("t3", "Number three: present bias.",
  "bedroom_night", "phone_scroll_front@C", "CH #3 · PRESENT BIAS; TRK pip 4 filled, pip 3 gold", "PUSH 1.00>1.06")
b("t3", "Present you wants comfort now. Future you gets the bill.",
  "coffee_shop", "phone_happy_front@L", "PROP: drawn silhouette of a future self waiting at the far end of the counter", "PAN-R 40 px")
b("t3", "A treat today feels close and certain. Savings feel far away.",
  "restaurant_table", "cash_hand_over_threeq@R", "PROP: a near gold coin drawn big, a far one drawn tiny", "ZOOM 1.35 on the table")
b("t3", "Saving later always sounds easy, because later never feels like today.",
  "mall_storefronts", "calendar_circle_threeq@R", "PROP: calendar page with a circled square that keeps sliding one box ahead", "DRIFT-UP")
b("t3", "Richard Thaler and Shlomo Benartzi wrote about an idea called Save More Tomorrow.",
  "library_study", "alux_idle_calm@L", "SRC: Thaler & Benartzi, Save More Tomorrow, Journal of Political Economy, 2004", "PULL 1.08>1.00")
b("t3", "Employees committed in advance to save part of their future pay raises.",
  "office_desk", "calendar_hold_front@R", "PROP: raise envelope drawn in the calendar's future corner, a gold arrow pointing 'saved'", "PAN-R 40 px")
b("t3", "Over 40 months, their average saving rate rose from 3.5% to 13.6%.",
  "supermarket_aisle", None, "DC: 3.5% > 13.6% / average saving rate over 40 months; PROP: rising line chart with a month ruler", "PUNCH to 1.10 on DC")
b("t3", "That is from the Journal of Political Economy, 2004.",
  "bedroom_night", "calendar_worried_front@C", "SRC: Thaler & Benartzi, 'Save More Tomorrow,' Journal of Political Economy, 2004", "HOLD")
b("t3", "They didn't fight their present selves. They decided early, for their future selves.",
  "coffee_shop", "confident_front@L", "PROP: present-self silhouette and future-self silhouette shaking hands", "PUSH 1.00>1.05")
b("t3", "The fix: decide now to save a share of your next raise.",
  "payday_desk", "thumbs_up_threeq@R", "FIX card: DECIDE NOW TO SAVE A SHARE OF YOUR NEXT RAISE", "PAN-L 40 px")

# ------------------------------------------------------------------ TRAP 2 (Alux-style callbacks to the approved test)
b("t2", "Number two: card blindness.",
  "alux_arena_skyline_spotlight", "alux_card_hold_happy@R", "CH #2 · CARD BLINDNESS; TRK pip 3 filled, pip 2 gold", "PULL 1.08>1.00")
b("t2", "How you pay can change how much you are willing to pay.",
  "alux_shop_front_card_reader", "alux_phone_look@L", "none", "PAN-R 40 px")
b("t2", "Researchers ran an experiment with tickets to a sold-out basketball game.",
  "alux_ticket_booth_sold_out", "alux_hold_ticket@L", "none (the SOLD OUT board is baked into this plate)", "DRIFT-UP")
b("t2", "Some people were told they would pay by credit card.",
  "checkout_lane", "card_swipe_front@R", "PROP: drawn gold card icon with CARD chip", "PULL 1.08>1.00")
b("t2", "Others were told to pay cash.",
  "alux_counter_cash_box", "cash_fan_front@L", "PROP: drawn bill stack with CASH chip", "PUSH 1.00>1.05")
b("t2", "People told they would pay by credit card were willing to pay more than twice as much, on average, as people told to pay cash.",
  "alux_split_podiums_city", "alux_card_hold_up@L+alux_cash_hold_small@R", "PROP: two drawn bars rise, CARD tall, CASH short (labels baked in the plate); SRC held", "PUNCH to 1.10 at 'more than twice'")
b("t2", "Same tickets, same game. Only the way of paying changed.",
  "alux_tickets_backdrop", None, "DC: MORE THAN 2× / same tickets · same game · only the way of paying changed (the approved AluxTest card)", "HOLD")
b("t2", "That's from Drazen Prelec and Duncan Simester, \"Always Leave Home Without It,\" in Marketing Letters, 2001.",
  "alux_desk_lamp_book", "alux_point_book@L", "SRC: Prelec & Simester, 'Always Leave Home Without It,' Marketing Letters, 2001", "PAN-L 40 px")
b("t2", "Cash leaves your hand. A card just waits for the bill.",
  "supermarket_aisle", "cash_hand_over_threeq@L", "PROP: a bill slides out of the frame, a card icon stays", "DRIFT-UP")
b("t2", "A card makes paying feel less real.",
  "shop_counter", "card_shocked_front@R", "none", "ZOOM 1.35 on the till")
b("t2", "The fix: for spending you want to control, make paying feel real again.",
  "restaurant_table", "alux_card_hold_grin@L", "FIX card: MAKE PAYING FEEL REAL AGAIN", "PULL 1.08>1.00")
b("t2", "Use a debit card, where the money leaves your account right away, or check your total before every purchase.",
  "alux_skyline_checklist", "alux_receipt_point@L", "FIX card continues: DEBIT CARD / CHECK YOUR TOTAL (tick animation, as in the AluxTest end beat)", "PUSH 1.00>1.05")

# ------------------------------------------------------------------ TRAP 1
b("t1", "Number one: the scarcity tax.",
  "sugarcane_harvest", "worried_front@L", "CH #1 · THE SCARCITY TAX; TRK pip 2 filled, pip 1 gold", "PULL 1.08>1.00")
b("t1", "Think about a hard money problem for a moment, the kind that keeps you awake.",
  "kitchen_table", "calendar_worried_front@R", "PROP: thought-spiral over a drawn overdue-looking page (blank lines, no text)", "PUSH 1.00>1.06")
b("t1", "In one experiment, people were made to think about a hard money problem, and then took thinking tests.",
  "apartment_hallway", "test_paper_pencil_front@L", "SRC: Mani, Mullainathan, Shafir & Zhao, Poverty Impedes Cognitive Function, Science, 2013", "PAN-R 40 px")
b("t1", "Lower-income participants scored significantly worse, an effect similar to a 13-point drop in IQ, or losing a full night's sleep.",
  "kitchen_table", "sad_threeq@R", "DC: SIGNIFICANTLY WORSE / lower-income participants on thinking tests; then DC swaps to SIMILAR TO A 13-POINT DROP IN IQ / or losing a full night's sleep; PROP: crescent moon", "PUNCH to 1.10 on DC")
b("t1", "In other words, a worried mind has less left over for thinking.",
  "bedroom_night", "worried_threeq@C", "PROP: a drawn brain-battery icon draining", "TILT-DOWN 40 px")
b("t1", "The researchers also looked at Indian sugarcane farmers.",
  "sugarcane_harvest", None, "none (establishing shot, no mascot)", "PAN-L slow across the field")
b("t1", "The farmers scored higher after harvest, when money was less tight, than before it.",
  "living_room_sofa", "alux_idle_calm@C", "PROP: split BEFORE HARVEST / AFTER HARVEST, the after bar higher", "DRIFT-UP")
b("t1", "That's from Mani, Mullainathan, Shafir and Zhao, \"Poverty Impedes Cognitive Function,\" in Science, 2013.",
  "library_study", None, "SRC: Mani, Mullainathan, Shafir & Zhao, 'Poverty Impedes Cognitive Function,' Science, 2013", "ZOOM 1.35 on the desk lamp, slow push")
b("t1", "Scarcity isn't a character flaw. It places a tax on your thinking.",
  "kitchen_table", "sad_front@L", "PROP: a drawn tax stamp lands on the head-spiral", "PUSH 1.00>1.05")
b("t1", "The fix: make big money decisions when you're calm, never in a crisis.",
  "park_bench", "sitting_threeq@R", "FIX card: DECIDE WHEN YOU'RE CALM, NEVER IN A CRISIS", "PAN-R 40 px")
b("t1", "And build the buffer from trap seven, so fewer decisions happen under stress.",
  "bank_counter", "piggy_bank_hold_front@L", "TRK pip 7 pulses gold; PROP: small buffer pile; FIX card second line: BUILD THE BUFFER (#7)", "PULL 1.08>1.00")

# ------------------------------------------------------------------ CLOSING
b("close", "None of these traps mean you're bad with money. They mean you're human.",
  "alux_arena_skyline_spotlight", "alux_idle_calm@C", "TRK all ten pips lit gold; no data cards", "PUSH 1.00>1.05")
b("close", "The people who do well usually aren't smarter.",
  "home_office_laptop", "confident_front@R", "none", "ZOOM 1.35 on the shelf")
b("close", "They've built systems that work even when their brain doesn't.",
  "payday_desk", "idle_threeq@L", "PROP: drawn gears turning with a gold tick (a 'system')", "DRIFT-UP")
b("close", "Pick one fix from this list and set it up this week.",
  "alux_skyline_checklist", "alux_point_left@R", "CHECKLIST card: the ten fixes as ten one-line rows (text from the FIX cards); title DO THIS WEEK: PICK ONE", "PULL 1.08>1.00")
b("close", "Start with the trap that sounded most like you.",
  "park_bench", "idle_front@R", "none", "ZOOM 1.35 on the bench")
b("close", "Which trap do you fall into most?",
  "alux_stage_spotlight", "alux_thinking_worried@R", "TRK as a comment prompt: ten numbered pips, 'COMMENT YOUR NUMBER' chip; hold 2 s after the voice ends", "PUSH 1.00>1.04")

# ======================================================================= validation
ALLOWED_NUM = {"13", "3.5", "13.6", "40", "37", "86", "63", "400", "66,465", "11.4", "17.9", "16.4", "1991", "1996", "35,000", "50,000", "150,000",
               "2011", "2015", "2013", "2000", "2001", "2004", "1979", "1992", "2025", "2026", "50", "401", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
               "1991-1996", "2×"}


def nums(s):
    s = re.sub(r"pip \d+|#\d+|\d+(?:\.\d+)?(?:-\d+)? ?s\b|beat \d+", "", s)
    return {n.rstrip(".,") for n in re.findall(r"\d[\d,]*(?:\.\d+)?(?:-\d+)?", s)}


def validate():
    errs = []
    prev = None
    pairs = Counter(); cam_last = {}
    for i, (sec, text, plate, cut, ov, cam) in enumerate(B, 1):
        if plate not in PLATES:
            errs.append(f"beat {i}: plate '{plate}' not in library")
        cuts = [c.split("@")[0].rstrip("~") for c in cut.split("+")] if cut else []
        for c in cuts:
            if c not in CUTS:
                errs.append(f"beat {i}: cut-out '{c}' not in library")
        if prev:
            if plate == prev[0]:
                errs.append(f"beat {i}: same plate as beat {i-1} ({plate})")
            if cuts and set(cuts) & set(prev[1]):
                errs.append(f"beat {i}: cut-out repeated from beat {i-1} ({set(cuts) & set(prev[1])})")
        for c in cuts or [None]:
            pairs[(plate, c)] += 1
        if cam_last.get(plate) == cam.split()[0] and False:
            pass
        prev = (plate, cuts)
        for n in nums(text) | nums(ov):
            if n not in ALLOWED_NUM and n.replace(",", "") not in {a.replace(",", "") for a in ALLOWED_NUM}:
                errs.append(f"beat {i}: number {n} is not in the source pack")
    for (p, c), k in pairs.items():
        if k > 1 and c:
            errs.append(f"pair {p} + {c} used {k} times")
    # camera: consecutive uses of the same plate must differ
    last = {}
    for i, (sec, text, plate, cut, ov, cam) in enumerate(B, 1):
        key = cam.split(" ")[0].split("-")[0]
        if last.get(plate) == key:
            errs.append(f"beat {i}: plate {plate} repeats camera move {key} from its previous use")
        last[plate] = key
    # puppet / library rules (playbooks/PUPPET_BEAT_RULES.md): cut strings written "puppet:<expression>/<gesture>[@R|C|L]" are puppet beats, anything else is a library cut-out
    import beat_rules
    pb = []
    for (sec, text, plate, cut, ov, cam) in B:
        isp = bool(cut) and cut.startswith("puppet:")
        g = None; px = "C"
        if isp:
            spec = cut[len("puppet:"):]; g = spec.split("/")[1].split("@")[0] if "/" in spec else None; px = spec.split("@")[1] if "@" in spec else "C"
        pb.append(dict(plate=plate, mascot=("puppet" if isp else ("library" if cut else None)), gesture=g, puppet_x=px, card=("L" if isp and g == "pointLeft" else None)))
    errs += beat_rules.puppet_rule_errors([x for x in pb if x["mascot"] or True])
    # adjacent camera repeats
    for i in range(1, len(B)):
        if B[i][5].split()[0].split("-")[0] == B[i - 1][5].split()[0].split("-")[0]:
            errs.append(f"beats {i}-{i+1}: identical camera '{B[i][5]}'")
    return errs


WPS = 2.6   # Kokoro words per second (AluxTest measured about 2.7); +0.35 s pause per line
def dur(text):
    return max(2.6, len(text.split()) / WPS + 0.35)


def fmt_t(s):
    return f"{int(s // 60)}:{int(s % 60):02d}"


def _real():
    f = OUT / "vo_beats.json"
    return {b["i"]: (b["start"], b["dur"]) for b in json.loads(f.read_text())["beats"]} if f.exists() else {}


def write():
    OUT.mkdir(parents=True, exist_ok=True)
    REAL = _real()
    words = sum(len(t.split()) for _, t, *_ in B)
    secs = defaultdict(list)
    for i, beat in enumerate(B, 1):
        secs[beat[0]].append((i, beat))
    total_s = max((a + d for a, d in REAL.values()), default=sum(dur(x[1]) for x in B))

    # ---------------- script.md
    s = [f"# {TITLE}", "", "_Gate 1: narration for approval. Nothing is generated, voiced, rendered or uploaded._", "",
         f"- **Words:** {words} (target 1,300-1,600).  **Beats:** {len(B)}.  **Narration length:** {fmt_t(total_s)} ({"real Kokoro bf_emma timings" if REAL else "estimate"}; the video adds a short end hold).",
         "- **Facts:** only the source pack (`empires_short/AURELIS_MONEYPSYCH_SOURCE_PACK.md`); every figure is worded as the pack words it and its source is named in the same section. Plain explanations, everyday examples and scene ideas are mine and carry no new numbers, studies or claims.",
         "- **Order:** hook, then trap 10 down to trap 1, then close. Not financial advice, no promises of wealth.",
         "- **Spoken forms for TTS:** `401(k)` is read 'four oh one K'; `$400` 'four hundred dollars'; `$50,000 to $150,000` 'fifty thousand dollars to one hundred fifty thousand dollars'; `66,465` 'sixty-six thousand, four hundred sixty-five'; `11.4%` 'eleven point four percent'; `3.5% to 13.6%` 'three point five percent to thirteen point six percent'. The text normaliser handles these before Kokoro.",
         "- **Differences from the Short rules:** this is a long-form explainer, so it uses the pack's explicit 'The fix:' lines and a direct call to action; the V2 Short rule 'no generic lessons' applies to the Shorts and is relaxed here by the brief. Convert to `scripts_v2/<ep>.json` with `claims` only after approval.", ""]
    for sec in ["hook"] + [f"t{n}" for n in range(10, 0, -1)] + ["close"]:
        rows = secs[sec]
        w = sum(len(r[1][1].split()) for r in rows)
        s += [f"## {SEC_NAMES[sec]}  ({w} words, {len(rows)} beats)", ""]
        s += [" ".join(r[1][1] for r in rows), ""]
    s += ["## Claims and sources (every figure, as the pack words it)", "",
          "| figure as spoken / shown | source named in the video | beat(s) |", "|---|---|---|"]
    claims = [
        ("about as much as losing a full night's sleep; similar to a 13-point drop in IQ", "Mani, Mullainathan, Shafir and Zhao, Science, 2013 (hook; again in trap 1)", "1-3, trap 1"),
        ("only about one in three Americans aged 50 and over answered three basic money questions correctly (interest, inflation, diversification)", "Lusardi and Mitchell, 'Big Three' financial literacy questions, Wharton, 2015", "trap 10"),
        ("people living next door to Postcode Lottery winners bought significantly more cars than other non-participants (Netherlands)", "Kuhn, Kooreman, Soetevent and Kapteyn, American Economic Review, 2011", "trap 9"),
        ("about 35,000 Florida lottery winners; prizes of $50,000 to $150,000 only postponed bankruptcy; less likely to file in the first two years, more likely three to five years after", "Hankins, Hoekstra and Skiba, The Review of Economics and Statistics, 2011", "trap 8"),
        ("63% of US adults would cover a $400 emergency expense with cash or its equivalent; more than a third would not", "Federal Reserve, Economic Well-Being of U.S. Households in 2025 (published May 2026)", "trap 7"),
        ("66,465 US households, 1991 to 1996: most active traders 11.4% a year, market 17.9%, average household 16.4%", "Barber and Odean, 'Trading Is Hazardous to Your Wealth,' Journal of Finance, 2000", "trap 6"),
        ("losses feel roughly twice as strong as equal gains; debated for small amounts", "Kahneman and Tversky, prospect theory (1979); Tversky and Kahneman (1992)", "trap 5"),
        ("401(k) participation 37% when employees had to sign up, about 86% under automatic enrolment", "Madrian and Shea, 'The Power of Suggestion,' Quarterly Journal of Economics, 2001", "trap 4"),
        ("saving rate rose from 3.5% to 13.6% over 40 months", "Thaler and Benartzi, 'Save More Tomorrow,' Journal of Political Economy, 2004", "trap 3"),
        ("willing to pay more than twice as much by credit card than cash, sold-out basketball tickets", "Prelec and Simester, 'Always Leave Home Without It,' Marketing Letters, 2001", "trap 2"),
        ("lower-income participants scored significantly worse, an effect similar to a 13-point drop in IQ or losing a full night's sleep; Indian sugarcane farmers scored higher after harvest than before it", "Mani, Mullainathan, Shafir and Zhao, 'Poverty Impedes Cognitive Function,' Science, 2013", "trap 1"),
    ]
    s += [f"| {a} | {b_} | {c} |" for a, b_, c in claims]
    s += ["", "Everything else in the narration is a definition, an everyday example or a transition. Statements I added that are opinion rather than evidence are: 'a trap you can see is a trap you can plan around', 'confidence feels like skill', 'we tend to measure ourselves against whoever lives closest', 'money that arrives without a plan has no job to do', 'a card makes paying feel less real', 'scarcity is a tax on your thinking'. Say if you want any of them cut.", ""]
    (OUT / "script.md").write_text("\n".join(s))

    # ---------------- beats.md
    pu = Counter(x[2] for x in B)
    cu = Counter(c.split("@")[0].rstrip("~") for x in B if x[3] for c in x[3].split("+"))
    m = [f"# Beat plan: {TITLE}", "",
         f"{len(B)} beats, about {total_s / len(B):.1f} s each, {fmt_t(total_s)} of narration ({'times are the real Kokoro beat timings' if REAL else 'estimated times'}). Plates and cut-outs are library filenames without the `plate_` / `mascot_` prefix and `.png` "
         "(`empires_short/public/img/aurelis/library/`, indexed in `library.json`). The render source of truth for overlays is `empires_short/src/moneypsych/data.json` (built from `scripts/moneypsych_spec.py`); the overlay column here is the planning description.", "",
         "## Legend", "",
         "- **Cut-out** `name@L|C|R` = screen position; `~` = mirrored; `a@L+b@R` = two mascots.",
         "- **Overlays:** `CH` chapter card (e.g. `#7 · LIVING WITHOUT A BUFFER`), `TRK` 10 to 1 tracker (ten pips top-right: passed = filled, current = gold, upcoming = outline), `DC` data card (AluxTest design: charcoal card, gold border, Fraunces number, small caption), `SRC` source line (bottom-left bar), `FIX` fix card (checklist style), `PROP` drawn Remotion prop (SVG/CSS, palette only), `NOTE` small chip.",
         "- **Camera:** `PUSH` 1.00>1.06, `PULL` 1.08>1.00, `PAN-L/R` 40 px, `DRIFT-UP`, `PUNCH` quick 1.10 at the data-card word, `ZOOM 1.35 on <area>` crops a different part of a reused plate, `HOLD` parallax only (plate 0.55x, mascot 1.0x). Mascots pop in word-anchored (AluxTest pop archetype).",
         "- **Reuse rule (checked by `scripts/moneypsych_plan.py`):** no plate or cut-out repeats in the next beat, no plate+cut-out pair appears twice, a reused plate never repeats the camera move of its previous use, and no two adjacent beats share a camera move.", ""]
    t = 0.0
    for sec in ["hook"] + [f"t{n}" for n in range(10, 0, -1)] + ["close"]:
        rows = secs[sec]
        m += [f"## {SEC_NAMES[sec]}", "", "| # | t | len | narration | plate | cut-out | overlays | camera |", "|---|---|---|---|---|---|---|---|"]
        for i, beat in rows:
            _, text, plate, cut, ov, cam = beat
            st, dd = REAL.get(i, (t, dur(text)))
            m.append(f"| {i} | {fmt_t(st)} | {dd:.1f}s | {text} | `{plate}` | {('`' + cut + '`') if cut else '-'} | {ov} | {cam} |")
            t += dur(text)
        m.append("")
    ntrap = {n: len([1 for x in B if x[0] == f't{n}']) for n in range(10, 0, -1)}
    m += ["## Library usage", "",
          f"- Plates used: {len(pu)} of {len(PLATES)}; most reused: " + ", ".join(f"`{k}` x{v}" for k, v in pu.most_common(6)) + ". Every reuse has a different camera move or crop and a different cut-out.",
          f"- Cut-outs used: {len(cu)} of {len(CUTS)}; most reused: " + ", ".join(f"`{k}` x{v}" for k, v in cu.most_common(6)) + ".",
          f"- Beats without a mascot (plate + prop/data card only): {sum(1 for x in B if not x[3])}.",
          "- Plates with baked-in text, used only where the text fits: `alux_ticket_booth_sold_out` (SOLD OUT, trap 2), `alux_split_podiums_city` and `alux_card_vs_cash_stage` (CARD / CASH labels; the second is not used here). All other plates were checked as text-free at thumbnail size, and `trading_screens`, `apartment_hallway`, `lottery_kiosk` at full size; the rest still need a full-size look before render.",
          f"- Beats per section: hook {len([1 for x in B if x[0] == 'hook'])}, " + ", ".join(f"#{n} {k}" for n, k in ntrap.items()) + f", close {len([1 for x in B if x[0] == 'close'])}.", "",
          "## What the library can't cover, and how I'd solve it", "",
          "Nothing blocks the plan: **0 images must be generated.** Each gap below is solved with Remotion props or an existing plate:", "",
          "| beat need | solution without generating |",
          "|---|---|",
          "| mascot asleep or exhausted (hook, trap 1) | `yawning_front/threeq` on `bedroom_night` plus a drawn moon and zzz |",
          "| a surprise $400 bill (trap 7) | `receipt_shocked_front` plus a drawn `$400` tag (Remotion text) |",
          "| two neighbours side by side (trap 9) | one cut-out mirrored (`fence_envious_side_threeq~`) against `fence_envious_front`; or a drawn house icon pair |",
          "| a panicking seller / falling market (trap 5) | `worried_front` on `trading_screens` plus a drawn red arrow and padlock |",
          "| a sign-up form with a tick (trap 4) | `clipboard_fill_threeq` plus a drawn toggle / tick animation |",
          "| a farmer in the cane field (trap 1) | not needed: the plate is shown empty (the pack only says farmers, no scene), mascot appears on other plates |",
          "| future self (trap 3) | drawn silhouette prop, no new cut-out |",
          "| four cut-outs that failed the checks and are not in the library (`receipt_sad_front`, `receipt_hold_up_front`, `receipt_worried_front`, `piggy_bank_empty_front`) | not used; `receipt_shocked_front`, `receipt_angry_threeq`, `sad_front` and `piggy_bank_shake_front` cover the same moods |",
          "| tier-2 plates that were cancelled (clinic waiting room, pawn shop, bus stop in rain, call centre, stock exchange) | not used; trap 7 and trap 1 use `kitchen_table`, `apartment_hallway`, `bedroom_night` instead |", "",
          "**Optional, only if you want it (not needed to render):** one `mascot_asleep_threeq` cut-out would cost $0.025 on the RunPod public endpoint (estimated spend so far $2.825 of the $3.50 cap, so $0.675 headroom). I will not generate it, or anything else, without your OK.", "",
          "## Risks to look at in review", "",
          "- Pace: about 12 words per beat, 4.5 s on average with the real voice; chapter cards are about 2.5 s.",
          "- Trap 2 deliberately reuses the AluxTest look and its approved plates and cut-outs, with new lines for the full pack wording.",
          "- Plate palette varies (the graded outdoor plates are still brighter than the indoor ones); Remotion applies a charcoal vignette and a slight dark overlay to unify them.",
          "- Mascot face/hair drift between cut-outs is the known weakness; cut-outs are kept small (about 45-60% frame height) and pop in short.",
          ""]
    (OUT / "beats.md").write_text("\n".join(m))
    return words, total_s


# retention marks (playbooks/LONGFORM_RETENTION.md): beat text prefix -> rehook / loop / sfx / cta. Fill in when re-planning.
RETENTION = {
    "Which trap do you fall into most?": dict(cta=True),
}
FINAL_ITEM = "t1"


def retention_check():
    import retention_rules
    t, rb = 0.0, []
    for (sec, text, plate, cut, ov, cam) in B:
        x = dict(sec=sec, text=text, plate=plate, cam=cam, start=t, dur=dur(text))
        for k, v in RETENTION.items():
            if text.startswith(k):
                x.update(v)
        rb.append(x); t += x["dur"]
    if rb[-1].get("cta") is None and any(x.get("cta") for x in rb):     # CTA = from the marked line to the end
        i = next(i for i, x in enumerate(rb) if x.get("cta"))
        for x in rb[i:]: x["cta"] = True
    fi = next(i for i, x in enumerate(rb) if x["sec"] == FINAL_ITEM)
    return retention_rules.retention_errors(rb, (ROOT / "empires_short/AURELIS_MONEYPSYCH_SOURCE_PACK.md").read_text(), fi)


if __name__ == "__main__":
    e = validate()
    re_, rw = retention_check(); e += re_
    for x in rw:
        print("WARN", x)
    for x in e:
        print("ERR", x)
    w, ts = write()
    print(f"beats {len(B)}, words {w}, est {fmt_t(ts)}, errors {len(e)}")
    sys.exit(1 if e else 0)
