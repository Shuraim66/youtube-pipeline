"""Shared narration-anchored visual and sound cues, in composition frames.

The renderer and mixer consume the SAME cue sheet in timing.json. No duplicated
hard-coded SFX timestamps in seconds; shorter/revised narration moves both together.
"""
import re


def token(word):
    return re.sub(r"[^a-z0-9]", "", word.lower())


def decorate_timing(timing):
    fps = timing["fps"]
    effects = []
    missing = []
    for index, beat in enumerate(timing["beats"]):
        start, end = beat["startFrame"], beat["endFrame"]
        duration = end - start
        words = [c for c in timing["captions"] if start <= c["startFrame"] < end]
        motion = {}

        def cue(name, phrase, fallback):
            wanted = [token(w) for w in phrase.split()]
            for i in range(len(words) - len(wanted) + 1):
                if [token(w["word"]) for w in words[i:i+len(wanted)]] == wanted:
                    a = words[i]["startFrame"] - start
                    b = words[i+len(wanted)-1]["endFrame"] - start
                    break
            else:
                a, b = fallback
                missing.append({"scene": beat["scene"], "phrase": phrase})
            a = max(0, min(a, duration - 2))
            b = max(a + 1, min(b, duration - 1))
            motion[name] = {"start": a, "end": b}
            return a, b

        def effect(kind, frame, gain=-26, pan=0, pitch=0):
            frame = max(start, min(start + round(frame), end - 1))
            effects.append({"kind": kind, "frame": frame, "gainDb": gain,
                            "pan": pan, "pitch": pitch, "scene": index})

        scene = beat["scene"].removeprefix("rothschild-")
        if scene.startswith('money-'):
            data = beat.get('data', {})
            beat['transition'] = 'paper'
            if data.get('shot') == 0:
                effect('resolve', 0, -32)
            elif data.get('mode') == 'action':
                a, _ = cue('emphasis', data['anchor'], (0, 12))
                effect('tick', a, -32)
            beat.setdefault('data', {})['motion'] = motion
            continue
        transition = "paper" if scene in ("transaction", "letters") else (
            "brass" if scene in ("network", "markets", "adapt") else "ink")
        beat["transition"] = transition
        if index:
            # One 0.6s sound centered on the 18-frame visual transition.
            effects.append({"kind": transition, "frame": max(0, start-round(.3*fps)),
                            "gainDb": -24 if transition == "paper" else -27,
                            "pan": 0, "pitch": 0, "scene": index})

        if scene == "office":
            cue("emphasis", "dominated", (15, 30))
        elif scene == "network":
            for i, city in enumerate(["Frankfurt", "London", "Paris", "Vienna", "Naples"]):
                a, _ = cue(city.lower(), city, (12+i*24, 30+i*24))
                effect("ping", a, -28, [-.05, -.55, -.3, .45, .15][i], [0, 3, 7, 10, 12][i])
            cue("emphasis", "five brothers", (20, 40))
        elif scene == "letters":
            a, b = cue("dispatch", "moving money and trust", (65, 115))
            for i in range(3):
                effect("paper", a+(b-a)*i/3, -32, -.4+i*.4)
            cue("emphasis", "trust", (90, 110))
        elif scene == "transaction":
            a, b = cue("signature", "lent the British government", (15, 80))
            effect("pen", a, -28, -.3)
            effect("pen", (a+b)/2, -31, -.25)
            a, b = cue("amount", "four million pounds", (58, 100))
            for i in range(3):
                effect("tick", a+(b-a)*i/2, -28, .3, i*3)
            cue("purchase", "Suez Canal shares", (110, 160))
            cue("emphasis", "four million", (58, 90))
        elif scene == "markets":
            a, b = cue("expansion", "expanded", (30, 75))
            _, finish = cue("markets", "markets deepened", (80, 140))
            motion["expansion"]["end"] = max(b, finish)
            for i in range(3):
                effect("tick", a+(finish-a)*i/3, -30, .4, i*3)
            cue("emphasis", "changed", (8, 25))
        elif scene == "insight":
            a, b = cue("builds", "builds an empire", (45, 75))
            cue("sustains", "sustains it", (105, 145))
            effect("resolve", b, -28, 0)
            cue("emphasis", "rarely", (80, 95))
        elif scene == "adapt":
            cue("lesson", "The lesson", (30, 55))
            cue("expansion", "businesses adapt", (65, 125))
            cue("emphasis", "continues today", (10, 40))
        elif scene == "end":
            cue("emphasis", "legacy", (60, 90))
            effect("resolve", 15, -32)
        beat.setdefault("data", {})["motion"] = motion
        for word in words:
            emphasis = motion.get("emphasis")
            if emphasis and emphasis["start"] <= word["startFrame"]-start < emphasis["end"]:
                word["emphasis"] = True

    timing["soundEvents"] = sorted(effects, key=lambda e: e["frame"])
    timing["cueFallbacks"] = missing
    timing["productionVersion"] = 1
    return timing
