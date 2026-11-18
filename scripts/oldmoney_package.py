#!/usr/bin/env python3
"""Upload package for the Old Money video (LOCAL ONLY, private manifest entry, no 'uploaded' field). Copy of moneypsych_package.py:
  empires_short/out/aurelis_oldmoney.en.srt   captions from the script text, timed with the Whisper word times
  aurelis_oldmoney.json                       manifest entry (title, description with chapters from real timings + full sources from the pack, tags, pinned comment)
Never uploads anything."""
import json, re, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import oldmoney_build_data as BD, moneypsych_build_data as MB
from moneypsych_package import srt_text

ROOT = Path(__file__).resolve().parent.parent
R = ROOT / "empires_short"
data = json.loads((R / "src/oldmoney/data.json").read_text())
vo = BD.vo["beats"]; MB.wh = BD.wh
TT = {9: "Don't wait for an inheritance", 8: "Avoid expensive debt", 7: "Don't buy status", 6: "Keep a budget", 5: "Automate saving",
      4: "Hold, don't chase", 3: "Write things down: a will and a plan", 2: "Talk about money with your children", 1: "Think in generations"}


def main():
    cues = []
    for b in vo:
        toks_sp, tt = MB.token_times(b); written = b["text"].split()
        if len(written) != len(toks_sp):                      # respelled numbers change word counts: map proportionally
            idx = lambda k: min(len(toks_sp) - 1, int(k * len(toks_sp) / len(written)))
            tt = [tt[idx(k)] for k in range(len(written))]
        i = 0
        while i < len(written):
            j = min(len(written), i + 7)
            while j < len(written) and j - i < 10 and not re.search(r"[.,:;?!]$", written[j - 1]): j += 1
            cues.append([b["start"] + tt[i], b["start"] + (tt[j] if j < len(written) else b["dur"] - 0.25), " ".join(written[i:j])]); i = j
    for k in range(len(cues) - 1):
        cues[k][1] = max(min(cues[k][1], cues[k + 1][0] - 0.02), cues[k][0] + 0.4)
    (R / "out/aurelis_oldmoney.en.srt").write_text(srt_text(cues))

    fm = lambda s: f"{int(s // 60)}:{int(s % 60):02d}"
    myth = next(b for b in data["beats"] if b.get("ch") and not b["ch"].get("n"))
    ch = [(0.0, "Why most old money doesn't stay old"), (myth["start"], "Myth-check: the 70% rule")] + [(c["start"], f"#{c['n']} {TT[c['n']]}") for c in data["chapters"]]
    ch.append((data["close"], "What old money really means"))
    chapters = "\n".join(f"{fm(s)} {t}" for s, t in ch)
    pack = (R / "AURELIS_OLDMONEY_SOURCE_PACK.md").read_text().split("## Full sources (for the description)", 1)[1]
    sources = "\n".join(l[2:].replace("*", "") for l in pack.strip().splitlines() if l.startswith("- "))
    desc = ("Most \"old money\" doesn't stay old. In a census study of American families from 1850 to 1940, 93% of the grandchildren of men in the top 1% did not reach the top 1% themselves. "
            "Here are nine habits that help wealth last, counting down from 9 to 1, with the evidence behind each one, a myth-check on the famous 70% rule, and one simple fix per habit.\n\n"
            f"CHAPTERS\n{chapters}\n\nSOURCES\n{sources}\n\n"
            "Education only, not financial advice.\n\n#oldmoney #oldmoneyhabits #personalfinance #wealth #money")
    entry = {"file": str(R / "out/aurelis_oldmoney.mp4"), "title": "9 Old Money Habits That Actually Keep Wealth (What the Research Says)", "description": desc,
             "tags": ["old money habits", "old money", "old money mindset", "habits of the wealthy", "generational wealth", "how to build generational wealth",
                      "wealthy habits", "rich habits", "money habits", "personal finance", "old money vs new money", "financial literacy"],
             "categoryId": 27, "privacyStatus": "private", "madeForKids": False, "format": "longform",
             "captionsSrt": str(R / "out/aurelis_oldmoney.en.srt"), "pinnedComment": "Which habit are you starting with? 👇"}
    assert len(entry["title"]) <= 100 and len(desc) <= 5000 and sum(len(t) for t in entry["tags"]) < 480
    (ROOT / "aurelis_oldmoney.json").write_text(json.dumps([entry], indent=2, ensure_ascii=False))
    print(len(cues), "caption cues;", len(desc), "chars in description;", len(entry["title"]), "chars in title")
    print(chapters)


if __name__ == "__main__":
    main()
