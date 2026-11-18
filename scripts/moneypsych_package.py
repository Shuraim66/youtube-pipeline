#!/usr/bin/env python3
"""Upload package for the Money Psychology video (LOCAL ONLY, private manifest entry, no 'uploaded' field):
  empires_short/out/aurelis_moneypsych.en.srt   captions from the script text, timed with the Whisper word times
  aurelis_moneypsych.json                       manifest entry (title, description with chapters from the real timings + Sources, tags, pinned comment)
Never uploads anything."""
import json, re, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import moneypsych_build_data as BD, moneypsych_plan as P

ROOT = Path(__file__).resolve().parent.parent
R = ROOT / "empires_short"
data = json.loads((R / "src/moneypsych/data.json").read_text())
vo = BD.vo["beats"]


def stamp(s, comma=True):
    s = max(0.0, s); h, m = int(s // 3600), int(s % 3600 // 60); sec = s % 60
    return f"{h:02d}:{m:02d}:{int(sec):02d}{',' if comma else '.'}{int(round((sec % 1) * 1000)):03d}"


def srt_text(cues):
    out = []
    for n, (a, b_, t) in enumerate(cues, 1):
        out.append(f"{n}\n{stamp(a)} --> {stamp(b_)}\n{t}\n")
    return "\n".join(out)


def main():
    # captions must show the written script, so re-split the written text with the same word counts where they match; fall back to spoken text
    cues = []
    for b in vo:
        toks_sp, tt = BD.token_times(b); written = b["text"].split()
        if len(written) != len(toks_sp):                      # respelled numbers/names change word counts: map proportionally
            idx = lambda k: min(len(toks_sp) - 1, int(k * len(toks_sp) / len(written)))
            tt = [tt[idx(k)] for k in range(len(written))]
        toks = written; i = 0
        while i < len(toks):
            j = min(len(toks), i + 7)
            while j < len(toks) and j - i < 10 and not re.search(r"[.,:;?!]$", toks[j - 1]): j += 1
            cues.append([b["start"] + tt[i], b["start"] + (tt[j] if j < len(toks) else b["dur"] - 0.25), " ".join(toks[i:j])]); i = j
    for k in range(len(cues) - 1):
        cues[k][1] = max(min(cues[k][1], cues[k + 1][0] - 0.02), cues[k][0] + 0.4)
    (R / "out/aurelis_moneypsych.en.srt").write_text(srt_text(cues))

    ch = [(0.0, "Intro: why money problems change how we think")] + [(c["start"], f"{c['n']}. {c['title'].title().replace('Of', 'of').replace('The ', 'the ') if False else c['title'].capitalize()}") for c in data["chapters"]]
    close = next(b for b in data["beats"] if b["sec"] == "close")
    ch.append((close["start"], "Closing: pick one fix this week"))
    fm = lambda s: f"{int(s // 60)}:{int(s % 60):02d}"
    chapters = "\n".join(f"{fm(s)} {t}" for s, t in ch)
    sources = """Mani, Mullainathan, Shafir and Zhao, "Poverty Impedes Cognitive Function," Science, 2013
Annamaria Lusardi and Olivia S. Mitchell, "Big Three" financial literacy questions, Wharton, 2015
Kuhn, Kooreman, Soetevent and Kapteyn, American Economic Review, 2011
Hankins, Hoekstra and Skiba, The Review of Economics and Statistics, 2011
Federal Reserve, Economic Well-Being of U.S. Households in 2025 (published May 2026)
Brad Barber and Terrance Odean, "Trading Is Hazardous to Your Wealth," Journal of Finance, 2000
Daniel Kahneman and Amos Tversky, prospect theory (1979); Tversky and Kahneman (1992)
Brigitte Madrian and Dennis Shea, "The Power of Suggestion," Quarterly Journal of Economics, 2001
Richard Thaler and Shlomo Benartzi, "Save More Tomorrow," Journal of Political Economy, 2004
Drazen Prelec and Duncan Simester, "Always Leave Home Without It," Marketing Letters, 2001"""
    desc = ("Many money mistakes come from how our brains work, not from how smart we are. This video counts down ten mental traps that researchers have measured, with the source behind each one and a simple fix.\n\n"
            f"CHAPTERS\n{chapters}\n\nSOURCES\n{sources}\n\n"
            "Education only, not financial advice.\n\n#moneypsychology #personalfinance #moneymindset #psychology #money")
    entry = {"file": str(R / "out/aurelis_moneypsych.mp4"), "title": "Money Psychology Explained: 10 Mental Traps That Keep Smart People Broke", "description": desc,
             "tags": ["money psychology", "money psychology explained", "money psychology animated", "psychology of spending money", "money mindset", "rich habits", "personal finance", "behavioral economics"],
             "categoryId": 27, "privacyStatus": "private", "madeForKids": False, "format": "longform",
             "captionsSrt": str(R / "out/aurelis_moneypsych.en.srt"), "pinnedComment": "Which trap do you fall into most? 👇"}
    (ROOT / "aurelis_moneypsych.json").write_text(json.dumps([entry], indent=2, ensure_ascii=False))
    print(len(cues), "caption cues;", len(desc), "chars in description;", len(entry["title"]), "chars in title")
    print(chapters)


if __name__ == "__main__":
    main()
