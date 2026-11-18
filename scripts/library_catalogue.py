"""Catalogue for the reusable Aurelis image library (plates + mascot cut-outs).

Pure data + prompt builders; no network, no spend. Used by gen_library_runpod.py and by the plan printout
(`python scripts/library_catalogue.py` -> empires_short/out/experiments/library/LIBRARY_PLAN.md).

Each entry: id, kind (plate|cutout), description, tags, tier (1 = generate first, 2 = fills the cap), prompt scene, and for cutouts pose / view / prop.
"""
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GUIDE = (ROOT / "AURELIS_STYLE_GUIDE.md").read_text()
PRICE = 0.025
CAP = 3.50

TAIL = ("Empty scene. No people, no animals, no characters, no creatures. "
        "No text, letters, numbers, signs, logos or currency symbols anywhere (signs and screens are blank).")

# ---------------------------------------------------------------- plates (40)
# (id, description, tags, scene, tier)
PLATES = [
    ("office_desk", "Office desk with blank monitor and papers", "office,desk,work,job,salary", "a tidy office desk with a blank monitor, a stack of papers, a mug and a desk lamp", 1),
    ("bank_counter", "Bank teller counter with glass partition", "bank,counter,loan,savings", "a bank counter with a glass partition, a blank sign panel and a pen stand", 1),
    ("shop_counter", "Small shop counter with till", "shop,store,counter,retail,pay", "a small shop counter with a till, a card reader and shelves of plain boxes behind", 1),
    ("kitchen_table", "Kitchen table with bills and a coffee", "kitchen,home,table,bills,budget", "a kitchen table with a mug, a pile of envelopes and a window behind", 1),
    ("city_street", "City street with blank shopfronts", "street,city,outside,walk", "a city street with plain shopfronts, a lamp post and a bin", 1),
    ("trading_screens", "Trading desk with three blank chart screens", "trading,stocks,screens,market,invest", "a trading desk with three monitors showing abstract unlabeled line shapes only", 1),
    ("payday_desk", "Desk at payday: envelope and calculator", "payday,salary,income,desk", "a plain desk with a sealed envelope, a calculator and a small plant", 1),
    ("bedroom_night", "Bedroom at night with phone glow", "bedroom,night,home,phone,scroll", "a bedroom at night with a bed, a bedside lamp and a window with a night sky", 1),
    ("supermarket_aisle", "Supermarket aisle with blank shelves", "supermarket,grocery,aisle,shopping,price", "a supermarket aisle with shelves of plain unlabeled boxes and a trolley at the end", 1),
    ("car_dealership", "Car dealership forecourt with one car", "car,dealership,loan,buy,auto", "a car dealership forecourt with one plain car, a glass showroom and blank flag poles", 1),
    ("atm_street", "ATM wall on a street", "atm,cash,withdraw,bank,street", "an ATM set in a wall on a quiet street with a lamp above (screen blank)", 1),
    ("coffee_shop", "Coffee shop counter and tables", "coffee,cafe,latte,small spending", "a coffee shop with a counter, an espresso machine and two small tables", 1),
    ("living_room_sofa", "Living room with sofa and TV", "living room,home,sofa,tv,ads", "a living room with a sofa, a blank TV and a floor lamp", 1),
    ("home_office_laptop", "Home office with laptop and shelf", "home office,laptop,side hustle,online", "a home office desk with a closed laptop, a shelf of plain books and a chair", 1),
    ("apartment_hallway", "Apartment hallway with doors", "rent,landlord,apartment,door,housing", "an apartment hallway with three plain doors and a doormat", 1),
    ("mall_storefronts", "Shopping mall concourse", "mall,shopping,sale,retail,impulse", "a shopping mall concourse with blank storefronts, a bench and a potted palm", 1),
    ("restaurant_table", "Restaurant table for two", "restaurant,dinner,bill,tip,eating out", "a restaurant table for two with plates, glasses and a candle", 1),
    ("gym_floor", "Gym with weights", "gym,subscription,membership,fitness", "a gym with a rack of weights, a bench and a mirror", 2),
    ("airport_gate", "Airport gate seating", "airport,travel,flight,holiday", "an airport gate with rows of seats and a large window showing a plane", 2),
    ("library_study", "Library or study room", "library,study,learning,school,education", "a study room with a long table, a lamp and shelves of plain books", 1),
    ("lottery_kiosk", "Lottery kiosk at a corner shop", "lottery,kiosk,corner shop,ticket,luck,gambling", "a corner shop front with a small lottery kiosk window beside the door, a blank sign board, a rack of plain blank tickets in the window (no numbers) and a lamp above", 1),
    ("two_houses_new_car", "Two house fronts side by side, shiny new car in one driveway", "neighbours,house,car,driveway,suburb,envy", "two similar suburban house fronts side by side, a shiny new gold-coloured car parked in the driveway of the right house, the left house has an empty driveway and a hedge", 1),
    ("suburban_fence", "Suburban street with a fence between two gardens", "neighbours,fence,garden,suburb,envy", "a suburban street with a low wooden fence between two front gardens, one tidy with flowers and one plain, houses behind", 1),
    ("sugarcane_harvest", "Sugarcane field at harvest, no people", "sugarcane,farm,harvest,field,scarcity,india", "a sugarcane field at harvest, tall green-gold cane stalks, a cut section with stacked bundles, a dirt track and a low sun, nobody in the scene", 1),
    ("house_front", "House front with for-sale post", "house,mortgage,property,real estate,buy home", "a small house front with a front door, a hedge and a blank for-sale board on a post", 1),
    ("courthouse_steps", "Courthouse steps and columns", "court,law,fraud,trial,legal", "courthouse steps with four columns and a flag pole", 2),
    ("stock_exchange_floor", "Stock exchange floor", "stock exchange,floor,wall street,market", "a stock exchange hall with a long blank board and rows of desks", 2),
    ("bank_vault", "Bank vault door", "vault,gold,safe,reserve,security", "a bank vault with a big round door and shelves of gold bars", 1),
    ("factory_floor", "Factory floor with conveyor", "factory,industry,manufacturing,production", "a factory floor with a conveyor belt, boxes and a high window", 2),
    ("warehouse_shelves", "Warehouse shelving", "warehouse,stock,shipping,ecommerce", "a warehouse with tall shelves of plain boxes and a pallet jack", 2),
    ("startup_garage", "Startup garage with whiteboard", "startup,garage,business,founder,whiteboard", "a garage workspace with a workbench, a blank whiteboard and a laptop", 1),
    ("subway_platform", "Subway platform", "subway,commute,train,city,transport", "a subway platform with a bench, a yellow edge line and a tunnel mouth", 2),
    ("park_bench", "Park bench with trees", "park,bench,calm,outside,thinking", "a park path with a bench, a tree and a lamp", 1),
    ("rooftop_city_dusk", "Rooftop with skyline at dusk", "rooftop,skyline,dusk,success,wealth", "a rooftop with a low wall and a city skyline at dusk", 1),
    ("bus_stop_rain", "Bus stop in the rain", "bus stop,rain,commute,broke,waiting", "a bus stop shelter with a bench in light rain", 2),
    ("clinic_waiting_room", "Clinic waiting room", "hospital,clinic,insurance,health,medical bill", "a clinic waiting room with chairs, a reception desk and a plant", 2),
    ("market_stall", "Farmers market stall", "market,stall,small business,trade,local", "a market stall with a striped awning, crates of produce and a scale", 2),
    ("pawn_shop", "Pawn shop counter", "pawn,debt,desperate,sell,collateral", "a pawn shop counter with a barred window and shelves of random objects", 2),
    ("boardroom_table", "Boardroom with long table", "boardroom,meeting,ceo,corporate,deal", "a boardroom with a long table, chairs and a blank presentation screen", 1),
    ("call_center_desk", "Call centre desk with headset", "call centre,support,scam,phone,debt collector", "a desk with a headset, a phone and a partition wall", 2),
    ("plain_studio_wall", "Neutral plain wall and floor", "neutral,plain,studio,generic,explainer", "a plain wall with a gold ground line and a single faint gold spotlight, nothing else", 1),
    ("open_road_sunset", "Open road at sunset", "road,sunset,journey,future,long term", "an open road toward a low sun and distant hills", 2),
    ("checkout_lane", "Supermarket checkout lane", "checkout,self checkout,pay,tap,card", "a supermarket checkout lane with a conveyor, a card reader and a basket", 1),
]

# ---------------------------------------------------------------- mascot cut-outs (100)
VIEWS = {"front": "front view, facing the camera", "threeq": "three-quarter view, body turned about 35 degrees to the right, head turned toward the camera"}

# 18 poses x front + three-quarter = 36 (no prop)
POSES = [
    ("idle", "neutral", "standing relaxed, arms at his sides, calm closed smile"),
    ("happy", "happy", "standing, big open smile, one hand raised in a small wave"),
    ("laughing", "laughing", "laughing with eyes squeezed shut, mouth wide open, one hand on his belly"),
    ("thinking", "thinking", "one hand on his chin, eyes looking up and to the side, brows slightly raised"),
    ("surprised", "surprised", "eyes wide, small round open mouth, both hands raised a little"),
    ("worried", "worried", "brows tilted up, wobbly mouth, one sweat drop at the temple, hands together"),
    ("sad", "sad", "head slightly down, downturned mouth, shoulders slumped"),
    ("angry", "angry", "furrowed brows, frown, both fists clenched at his sides"),
    ("confident", "confident", "arms crossed, chin up, small smirk"),
    ("pointing", "explaining", "pointing with one arm out to the side, eyebrows raised"),
    ("explaining", "explaining", "one palm turned up in front of him as if explaining, friendly face"),
    ("thumbs_up", "happy", "giving a thumbs up with one hand, big smile"),
    ("shrug", "confused", "shrugging, both palms up, brows tilted, mouth a flat line"),
    ("celebrate", "excited", "both arms thrown up in the air, mouth wide open in a cheer"),
    ("walking", "neutral", "mid walking stride, arms swinging, calm face"),
    ("running", "stressed", "running fast, leaning forward, arms pumping, determined face"),
    ("sitting", "neutral", "sitting on a plain stool, hands on his knees, calm face"),
    ("yawning", "tired", "yawning with one hand over his mouth, heavy eyelids"),
]

# props: (prop, ref text, [(pose label, expression, view, action), ...])   10 each = 60
PROPS = [
    ("cash", "a stack of paper bills with a paper band (no symbols or numbers on the bills)", [
        ("hold_stack", "happy", "front", "holding the stack in both hands in front of his chest, smiling"),
        ("counting", "neutral", "threeq", "counting bills in one hand, looking down at them"),
        ("fan", "excited", "front", "holding a fan of bills up in one hand, big grin"),
        ("throw", "excited", "front", "throwing bills in the air with both arms up, cheering"),
        ("hand_over", "neutral", "threeq", "holding the stack out to the right as if handing it over"),
        ("shocked", "shocked", "front", "holding one thin bill in both hands, wide eyes, mouth open"),
        ("pocket", "sly", "threeq", "tucking the stack into his trouser pocket, a sly grin"),
        ("thin", "worried", "front", "holding a very thin stack, brows tilted, sweat drop"),
        ("point", "explaining", "threeq", "holding the stack in one hand and pointing at it with the other"),
        ("think", "thinking", "threeq", "holding the stack at his side, one hand on his chin"),
    ]),
    ("card", "a plain blank rectangular bank card (no numbers, no logos)", [
        ("hold", "happy", "front", "holding the card up in one hand, smiling"),
        ("tap", "neutral", "threeq", "tapping the card forward as if paying"),
        ("swipe", "excited", "front", "swiping the card through the air with a flourish"),
        ("hand_over", "neutral", "threeq", "holding the card out to the right between two fingers"),
        ("shocked", "shocked", "front", "staring at the card in his hand, wide eyes, small round mouth"),
        ("worried", "worried", "front", "holding the card in both hands, brows tilted, sweat drop"),
        ("sly", "sly", "threeq", "holding the card up beside his face with a sly grin"),
        ("confident", "confident", "front", "holding the card up between two fingers, chin up"),
        ("point", "explaining", "threeq", "pointing at the card in his other hand"),
        ("broken", "sad", "front", "holding a card snapped in two halves, head down"),
    ]),
    ("phone", "a plain smartphone with a blank dark screen", [
        ("look", "neutral", "threeq", "looking down at the phone held in both hands"),
        ("scroll", "tired", "front", "scrolling the phone with one thumb, half-closed eyes"),
        ("shocked", "shocked", "front", "holding the phone up to his face, wide eyes, mouth open"),
        ("happy", "happy", "front", "holding the phone up in one hand, smiling"),
        ("point", "explaining", "threeq", "pointing at the phone in his other hand"),
        ("selfie", "happy", "threeq", "holding the phone out at arm's length for a selfie, smiling"),
        ("worried", "worried", "front", "gripping the phone with both hands, brows tilted, sweat drop"),
        ("call", "neutral", "threeq", "holding the phone to his ear"),
        ("angry", "angry", "front", "squeezing the phone in one fist, furrowed brows"),
        ("lowered", "sad", "front", "phone lowered in one hand, shoulders slumped"),
    ]),
    ("receipt", "a long blank paper receipt strip with no printing", [
        ("read", "neutral", "threeq", "reading the long receipt held in both hands"),
        ("shocked", "shocked", "front", "holding the receipt, which hangs down to the floor, wide eyes"),
        ("hold_up", "explaining", "front", "holding the receipt up in one hand, explaining"),
        ("worried", "worried", "front", "holding the receipt in both hands, sweat drop, brows tilted"),
        ("angry", "angry", "threeq", "crumpling the receipt in one fist, furrowed brows"),
        ("sad", "sad", "front", "holding the receipt limp in one hand, head down"),
        ("point", "explaining", "threeq", "pointing at the receipt in his other hand"),
        ("think", "thinking", "threeq", "holding the receipt, one hand on his chin"),
        ("tear", "stressed", "front", "tearing the receipt in half, jaw clenched"),
        ("toss", "neutral", "threeq", "tossing the receipt over his shoulder, relaxed"),
    ]),
    ("piggy_bank", "a gold-and-ivory piggy bank with a coin slot (palette colours only, no text)", [
        ("hold", "happy", "front", "hugging the piggy bank in both arms, smiling"),
        ("drop_coin", "neutral", "threeq", "dropping a coin into the piggy bank slot with one hand"),
        ("shake", "worried", "front", "shaking the piggy bank by his ear, worried face"),
        ("empty", "sad", "front", "holding an upside-down piggy bank, nothing falls out, sad face"),
        ("full", "excited", "front", "holding up a full heavy piggy bank, big grin"),
    ]),
    ("calendar", "a plain wall calendar page with a blank grid (no numbers, no letters)", [
        ("hold", "neutral", "front", "holding the calendar in both hands in front of him"),
        ("point", "explaining", "threeq", "pointing at one square on the calendar held in the other hand"),
        ("worried", "worried", "front", "holding the calendar, brows tilted, sweat drop"),
        ("circle", "happy", "threeq", "circling a square on the calendar with a marker, smiling"),
        ("shocked", "shocked", "front", "staring at the calendar in his hands, wide eyes"),
    ]),
    ("lottery_ticket", "a plain blank lottery-style ticket strip (no numbers, no letters, no logos)", [
        ("hold", "excited", "front", "holding the ticket up in one hand, big hopeful grin"),
        ("scratch", "happy", "threeq", "looking down at the ticket in both hands, one finger rubbing it, hopeful smile"),
    ]),
    ("pay_slip", "a plain blank pay slip envelope with an open flap (no numbers, no letters)", [
        ("open", "happy", "front", "holding the open envelope in both hands, looking pleased"),
        ("hand_over", "neutral", "threeq", "holding the envelope out to the right with one hand"),
    ]),
    ("clipboard", "a plain clipboard with a blank form of empty lines and tick boxes (no letters, no numbers)", [
        ("fill", "thinking", "threeq", "holding the clipboard in one arm, filling in the form with a pen, thoughtful face"),
        ("show", "explaining", "front", "holding the clipboard up in front of him with both hands, friendly face"),
    ]),
    ("test_paper", "a plain blank test paper with empty lines and a pencil (no letters, no numbers)", [
        ("pencil", "worried", "front", "holding the paper in one hand and a pencil in the other, biting his lip, sweat drop"),
        ("think", "thinking", "threeq", "looking at the paper, pencil tapping his chin"),
    ]),
    ("car_keys", "a set of car keys on a ring with a plain fob (no logos, no text)", [
        ("hold", "happy", "front", "holding the car keys up in one hand, proud grin"),
        ("dangle", "sly", "threeq", "dangling the car keys from one finger, sly smile"),
    ]),
    ("fence", "a short plain wooden picket fence in front of him, waist high, with no ground under it", [
        ("envious", "envious", "front", "looking over the fence with a sulky envious face, both hands gripping the top of the fence"),
        ("envious_side", "envious", "threeq", "leaning on the fence looking off to the right with a sulky envious face, brows furrowed"),
    ]),
]

# 4 extras: (prop, text, view, expression, action)
EXTRAS = [
    ("empty_wallet", "an open empty brown wallet", "front", "sad", "holding the wallet open with both hands, looking into it with a sad face"),
    ("shopping_bag", "a plain paper shopping bag with rope handles (no logo)", "threeq", "happy", "carrying the bag in one hand, smiling"),
    ("calculator", "a plain calculator with blank keys", "threeq", "thinking", "holding the calculator in one hand, other hand on his chin"),
    ("laptop", "a plain closed grey laptop", "threeq", "neutral", "carrying the laptop under one arm, walking"),
]


def _cut_prompt(pose_text, view, prop_text=None):
    p = (f"aurelismascot. Keep the attached character EXACTLY (same face, hair, outfit, proportions, line style). He always wears his complete gold button-up shirt with the chest pocket, buttoned up and fully covering his torso, belly and both arms, plus slate trousers and black sneakers: never bare skin on the torso or belly, whatever the pose or expression. Redraw him in the pose below, "
         f"{VIEWS[view]}, full body, centred with a clear margin on every side and the soles of his shoes well inside the frame. "
         f"Pose: {pose_text}.")
    if prop_text:
        p += f" He is holding/using {prop_text}."
    p += (" Flat 2D hand-drawn editorial style as in the reference, uniform dark-brown ink outlines. On a flat pure #00FF00 green background, "
          "no ground, no shadow, no scene, nothing else. One character only. No text, letters, numbers, currency symbols, or logos on clothing, shoes or props.")
    return p


def _plate_prompt(scene):
    a = re.search(r"> (Flat 2D hand-drawn editorial illustration.*?)The recurring mascot", GUIDE, re.S).group(1).strip()
    a = a.replace("in the Aurelis house style", "in a flat editorial style")
    return f"Redraw the attached blank charcoal paper canvas as this finished flat hand-drawn illustration of an empty location. {a} Scene: {scene}. {TAIL}"


# ---- Nov 2026 approval changes
DROP_PLATES = set("city_street gym_floor airport_gate courthouse_steps bank_vault factory_floor warehouse_shelves subway_platform market_stall "
                  "boardroom_table open_road_sunset plain_studio_wall rooftop_city_dusk atm_street".split())   # 11 general + 3 duplicated by the imports
DROP_CUTOUTS = set("""mascot_laughing_front mascot_laughing_threeq mascot_walking_front mascot_walking_threeq
 mascot_card_hold_front mascot_card_confident_front mascot_card_tap_threeq mascot_card_hand_over_threeq
 mascot_cash_hold_stack_front mascot_cash_counting_threeq mascot_phone_look_threeq mascot_phone_shocked_front mascot_receipt_read_threeq
 mascot_pointing_front mascot_pointing_threeq mascot_thinking_front mascot_thinking_threeq mascot_surprised_front""".split())
TARGET_TOTAL = 140

# 12 approved AluxTest plates + 15 keyed cut-outs: imported as-is (no generation, no cost). (file, id, description, tags, pose, view, prop)
ALUX = ROOT / "empires_short/public/img/aurelis/alux_test"
IMP_PLATES = [
    ("beat01_bg.png", "arena_skyline_spotlight", "Arena exterior skyline in gold line art with a spotlight (title plate)", "arena,stadium,skyline,spotlight,title,basketball,sold out"),
    ("beat02_bg.png", "ticket_booth_sold_out", "Ticket booth with striped awning and a red SOLD OUT board (text in plate)", "ticket booth,sold out,tickets,queue,kiosk"),
    ("beat03_bg.png", "arena_concourse", "Empty arena seating bowl and concourse with a doorway", "arena,stadium,concourse,crowd,seats,basketball"),
    ("beat04_bg.png", "split_podiums_city", "Two spotlit round podiums on a city silhouette, split stage (CARD / CASH labels in plate)", "split,comparison,two sides,podium,card,cash"),
    ("beat05_bg.png", "stage_spotlight", "Dark stage with a spotlight cone and gold dust", "stage,spotlight,thinking,question,dark"),
    ("beat06_bg.png", "card_vs_cash_stage", "Two thought clouds above a split floor, stacks of bills (CARD / CASH labels in plate)", "comparison,card,cash,thought cloud,bills,stack"),
    ("beat07_bg.png", "tickets_backdrop", "Dark backdrop with two big ticket shapes (data-card plate)", "tickets,data card,backdrop,dark"),
    ("beat08_bg.png", "desk_lamp_book", "Wooden desk with a lamp, a book and paper stack in a spotlight", "desk,lamp,book,research,paper,source"),
    ("beat09_bg.png", "open_notebook_closeup", "Giant open notebook with a bookmark and a pen, close-up", "notebook,book,pen,paper,study,research,note"),
    ("beat10_bg.png", "shop_front_card_reader", "Night shop front with a lit window and a card reader on the counter", "shop,card reader,tap,pay,night,street,checkout"),
    ("beat11_bg.png", "counter_cash_box", "Counter with cash spilling from an open box", "counter,cash,box,till,money,shop"),
    ("beat12_bg.png", "skyline_checklist", "Gold city skyline with a checklist card and receipt roll (checklist text in plate)", "skyline,checklist,receipt,tick,city,call to action"),
]
IMP_CUTS = [   # (crop file, id suffix, pose, expression, view, prop, description)
    ("beat01_char.png", "point_left", "pointing", "explaining", "threeq", None, "Mascot pointing to the left, calm smile"),
    ("beat02_char.png", "hold_ticket", "hold_ticket", "happy", "front", "ticket", "Mascot holding up a white ticket, happy"),
    ("beat03_char.png", "card_hold_threeq", "card_hold", "neutral", "threeq", "card", "Mascot holding a gold card at chest height"),
    ("beat04_char.png", "card_hold_happy", "card_hold", "happy", "front", "card", "Mascot holding a gold card up, big smile"),
    ("beat04_char2.png", "cash_fan_worried", "cash_fan", "worried", "front", "cash", "Mascot holding a fan of green bills, sweat drop, worried"),
    ("beat05_char.png", "thinking_worried", "thinking", "worried", "front", None, "Mascot with hand on chin, sweat drop, thinking"),
    ("beat06_char.png", "card_hold_up", "card_hold", "happy", "front", "card", "Mascot holding a gold card up beside his face, smiling"),
    ("beat06_char2.png", "cash_hold_small", "cash_hold", "neutral", "threeq", "cash", "Mascot holding a few green bills in one hand"),
    ("beat07_char.png", "surprised_arms_up", "surprised", "surprised", "front", None, "Mascot arms spread wide, mouth open, surprised"),
    ("beat08_char.png", "point_book", "pointing", "explaining", "threeq", "book", "Mascot pointing with an outstretched arm holding a small book"),
    ("beat09_char.png", "idle_calm", "idle", "neutral", "threeq", None, "Mascot standing relaxed, calm face"),
    ("beat10_char.png", "phone_look", "phone_look", "neutral", "front", "phone", "Mascot looking down at a phone in one hand"),
    ("beat10_char2.png", "phone_shocked", "phone_shocked", "shocked", "front", "phone", "Mascot shocked, phone lowered in one hand"),
    ("beat11_char.png", "card_hold_grin", "card_hold", "happy", "front", "card", "Mascot holding a gold card out, big grin"),
    ("beat12_char.png", "receipt_point", "receipt_point", "happy", "threeq", "receipt", "Mascot grinning, holding out a receipt with one hand"),
]

# ---- coverage of the ten traps in empires_short/AURELIS_MONEYPSYCH_SOURCE_PACK.md (number = countdown position)
TRAP_NAMES = {10: "knowledge gap", 9: "keeping up with neighbours", 8: "windfall illusion", 7: "no buffer", 6: "overconfidence",
              5: "loss aversion", 4: "default trap", 3: "present bias", 2: "card blindness", 1: "scarcity tax"}
PLATE_TRAPS = {10: "library_study kitchen_table home_office_laptop plain_studio_wall", 9: "house_front apartment_hallway car_dealership mall_storefronts two_houses_new_car suburban_fence",
               8: "payday_desk lottery_kiosk house_front", 7: "kitchen_table clinic_waiting_room atm_street pawn_shop",
               6: "trading_screens stock_exchange_floor startup_garage", 5: "trading_screens stock_exchange_floor bank_counter park_bench",
               4: "payday_desk office_desk bank_counter home_office_laptop", 3: "bedroom_night mall_storefronts supermarket_aisle coffee_shop living_room_sofa",
               2: "shop_counter checkout_lane restaurant_table supermarket_aisle", 1: "bus_stop_rain kitchen_table pawn_shop call_center_desk apartment_hallway sugarcane_harvest"}
CUT_TRAPS = {10: ("calculator", "thinking", "explaining", "pointing", "test_paper"), 9: ("shopping_bag", "car_keys", "fence", "envious"),
             8: ("cash", "celebrate", "surprised", "lottery_ticket"), 7: ("empty_wallet", "piggy_bank", "worried", "sad"),
             6: ("confident", "laptop", "phone", "thumbs_up"), 5: ("worried", "angry", "receipt", "shocked"),
             4: ("calendar", "piggy_bank", "clipboard", "sitting"), 3: ("yawning", "pay_slip", "calendar", "tired"),
             2: ("card", "cash", "receipt", "shocked"), 1: ("worried", "sad", "running", "thin", "empty_wallet", "test_paper")}


def traps_for(it):
    if it["kind"] == "plate":
        k = it["id"][len("plate_"):]
        return [t for t, ids in PLATE_TRAPS.items() if k in ids.split()]
    keys = {it["pose"], it["prop"], it["expression"]} - {None}
    return [t for t, ks in CUT_TRAPS.items() if keys & set(ks)]


def oldmoney_items():
    plate = dict(id="plate_mansion_estate", kind="plate", description="Grand old mansion with formal gardens (old money estate)",
                 tags=["mansion", "estate", "old money", "house", "wealth", "garden", "inheritance"], tier=3, scene=None, pose=None, view=None, prop=None,
                 prompt=_plate_prompt("a grand old two-storey stone mansion with tall windows, a columned entrance and a gravel drive, framed by formal gardens with clipped hedges, a fountain and old trees; empty, no people, no cars, no signs"), traps=[])
    child = ("aurelismascot. Keep the attached character EXACTLY (same face, hair, outfit, proportions, line style). He always wears his complete gold button-up shirt with the chest pocket, buttoned up and fully covering his torso, belly and both arms, plus slate trousers and black sneakers. "
             "Redraw him front view, full body, kneeling on one knee beside a child of about ten years old (a simple friendly kid in a plain ivory t-shirt, charcoal shorts and white sneakers, drawn in exactly the same flat style), "
             "explaining something: he holds a small open notebook towards the child with one hand and gestures with the other, three plain gold coins resting on the notebook; the child looks at it, curious. "
             "Both figures complete, overlapping slightly, centred with a clear margin on every side and all shoes well inside the frame. "
             "Flat 2D hand-drawn editorial style as in the reference, uniform dark-brown ink outlines. On a flat pure #00FF00 green background, no ground, no shadow, no scene, nothing else. Exactly these two characters, nobody else. No text, letters, numbers, currency symbols, or logos anywhere.")
    cut = dict(id="mascot_family_child_front", kind="cutout", description="Mascot kneeling beside a child (~10), explaining with a notebook and coins, front view",
               tags=["mascot", "child", "family", "parent", "teaching", "notebook", "coins", "happy", "front"], tier=3, scene=None, pose="family_child",
               view="front", prop="notebook", expression="happy", prompt=child, traps=[], multi_figure=True)
    return [plate, cut]


def build():
    items = []
    for pid, desc, tags, scene, tier in PLATES:
        items.append(dict(id=f"plate_{pid}", kind="plate", description=desc, tags=[t.strip() for t in tags.split(",")], tier=tier, scene=scene,
                          pose=None, view=None, prop=None, prompt=_plate_prompt(scene)))
    for key, expr, text in POSES:
        for view in ("front", "threeq"):
            tier = 1
            items.append(dict(id=f"mascot_{key}_{view}", kind="cutout", description=f"Mascot {key.replace('_', ' ')}, {view} view",
                              tags=["mascot", key, expr, view, "no prop"], tier=tier, scene=None, pose=key, view=view, prop=None, expression=expr,
                              prompt=_cut_prompt(text, view)))
    for prop, ptxt, rows in PROPS:
        for i, (lab, expr, view, act) in enumerate(rows):
            items.append(dict(id=f"mascot_{prop}_{lab}_{view}", kind="cutout", description=f"Mascot with {prop.replace('_', ' ')}: {lab.replace('_', ' ')}, {view} view",
                              tags=["mascot", prop, lab, expr, view], tier=1 if i < 6 else 2, scene=None, pose=lab, view=view, prop=prop, expression=expr,
                              prompt=_cut_prompt(act, view, ptxt)))
    for prop, ptxt, view, expr, act in EXTRAS:
        items.append(dict(id=f"mascot_{prop}_{view}", kind="cutout", description=f"Mascot with {prop.replace('_', ' ')}, {view} view",
                          tags=["mascot", prop, expr, view], tier=2, scene=None, pose=prop, view=view, prop=prop, expression=expr, prompt=_cut_prompt(act, view, ptxt)))
    for fn, key, desc, tags in IMP_PLATES:
        items.append(dict(id=f"plate_alux_{key}", kind="plate", description=desc, tags=["alux", "imported", "trap2"] + tags.split(","), tier=0, scene=None,
                          pose=None, view=None, prop=None, prompt=None, imported=True, src=str(ALUX / fn), traps=[2]))
    for fn, key, pose, expr, view, prop, desc in IMP_CUTS:
        items.append(dict(id=f"mascot_alux_{key}", kind="cutout", description=desc, tags=["mascot", "alux", "imported", "trap2", pose, expr, view] + ([prop] if prop else ["no prop"]),
                          tier=0, scene=None, pose=pose, view=view, prop=prop, expression=expr, prompt=None, imported=True, src=str(ALUX / "crops" / fn), traps=[2]))
    items = [i for i in items if i.get("imported") or not ((i["kind"] == "plate" and i["id"][6:] in DROP_PLATES) or i["id"] in DROP_CUTOUTS)]
    assert len(items) == TARGET_TOTAL, len(items)
    items += oldmoney_items()   # Nov 13 2026 upgrades for the Old Money long-form (user-approved, $0.15 cap)
    for it in items:
        if it.get("imported"):
            continue
        it["traps"] = traps_for(it)
        it["tags"] = it["tags"] + [f"trap{t}" for t in it["traps"]]
    return items


def plan_md(items):
    pl = [i for i in items if i["kind"] == "plate"]; cu = [i for i in items if i["kind"] == "cutout"]
    t1 = [i for i in items if i["tier"] == 1]; t2 = [i for i in items if i["tier"] == 2]; im = [i for i in items if i.get("imported")]
    gen = [i for i in items if not i.get("imported")]
    out = [f"# Aurelis image library: plan and cost\n",
           f"| | items | generated | imported (free) | cost @ ${PRICE}/image |\n|---|---|---|---|---|",
           f"| Plates | {len(pl)} | {sum(not i.get('imported') for i in pl)} | {sum(bool(i.get('imported')) for i in pl)} | ${sum(not i.get('imported') for i in pl) * PRICE:.3f} |",
           f"| Mascot cut-outs | {len(cu)} | {sum(not i.get('imported') for i in cu)} | {sum(bool(i.get('imported')) for i in cu)} | ${sum(not i.get('imported') for i in cu) * PRICE:.3f} |",
           f"| **Total** | **{len(items)}** | **{len(gen)}** | **{len(im)}** | **${len(gen) * PRICE:.3f}** |\n",
           f"Hard cap ${CAP:.2f}. Tier 1 = {len(t1)} images (${len(t1) * PRICE:.3f}) is generated first; tier 2 = {len(t2)} images (${len(t2) * PRICE:.3f}). "
           f"Headroom under the cap for retries: ${CAP - len(gen) * PRICE:.3f} = {int((CAP - len(gen) * PRICE) / PRICE + 1e-9)} images. The run stops the moment spend would pass the cap.\n",
           "## Coverage of the ten traps (source pack)\n", "| trap | plates | cut-outs |\n|---|---|---|"]
    out += [f"| {t}. {TRAP_NAMES[t]} | {sum(t in i['traps'] for i in pl)} | {sum(t in i['traps'] for i in cu)} |" for t in range(10, 0, -1)]
    out += ["\nEvery item also carries `trapN` tags in library.json, so scripts can pick by trap.\n",
           "## Plates (16:9, 1536x864, empty, no text)\n", "| id | tier | description | traps |\n|---|---|---|---|"]
    out += [f"| {i['id']} | {'import' if i.get('imported') else i['tier']} | {i['description']} | {','.join(map(str, i['traps']))} |" for i in pl]
    out += ["\n## Mascot cut-outs (transparent PNG, keyed from #00FF00)\n", "| id | tier | pose | view | prop | traps |\n|---|---|---|---|---|---|"]
    out += [f"| {i['id']} | {'import' if i.get('imported') else i['tier']} | {i['pose']} | {i['view']} | {i['prop'] or '-'} | {','.join(map(str, i['traps']))} |" for i in cu]
    return "\n".join(out) + "\n"


if __name__ == "__main__":
    import sys
    items = build()
    if "--export" in sys.argv:        # jobs file for the Kaggle notebook: python scripts/library_catalogue.py --export notebooks/kaggle_dataset/jobs.json
        dest = Path(sys.argv[sys.argv.index("--export") + 1]); dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(json.dumps([{k: i[k] for k in ("id", "kind", "prompt", "description", "tags", "pose", "view", "prop")} for i in items if not i.get("imported")], indent=1))
        print("exported", sum(not i.get("imported") for i in items), "jobs ->", dest); raise SystemExit
    d = ROOT / "empires_short/out/experiments/library"; d.mkdir(parents=True, exist_ok=True)
    (d / "LIBRARY_PLAN.md").write_text(plan_md(items))
    print(len(items), "items; plates", sum(i["kind"] == "plate" for i in items), "cutouts", sum(i["kind"] == "cutout" for i in items),
          f"; imported {sum(bool(i.get('imported')) for i in items)}; generate ${sum(not i.get('imported') for i in items) * PRICE:.3f}; tier1 {sum(i['tier'] == 1 for i in items)} tier2 {sum(i['tier'] == 2 for i in items)}")
