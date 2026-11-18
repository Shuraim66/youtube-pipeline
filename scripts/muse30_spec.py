"""Structured overlay spec per beat for the Aurelis Test 30 video (consumed by muse30_build_data.py -> Remotion src/muse30).
Same shape as oldmoney_spec.py. Anchors ("at") are words in the spoken narration; they are resolved to Whisper times in build_data.
Card side: L when the puppet points (pointLeft, puppet frame-right); the CLAIM card also goes L so the puppet stays visible.
The CHALLENGED stamp lands when the word "challenged" is spoken (stampAt), not 1 s after the card appears.
The lesson's OLD MONEY LESSON label is on the card only, not spoken.
End note "EDUCATION ONLY - NOT FINANCIAL ADVICE" is rendered by the EndCard (not a Note overlay)."""
D = dict
L = lambda t: D(lesson=D(text=t))

KW = "Kalsi & Ward · NBER working paper · 2025 (via InvestmentNews)"
WG = "Williams Group study · Grubman, “There is no 70% rule” · 2022 (via InvestmentNews)"

SPEC = {
    1: D(title=True),
    2: D(dc=D(label="GRANDCHILDREN OF THE TOP 1%", big="93%",
               cap="did not reach the top 1% themselves", at=r"ninety", size=190, side="L"),
         src=D(text=KW, at=r"ninety", span=1)),
    3: D(dc=D(label="AN OFTEN-QUOTED CLAIM", big="70%",
               cap="lose their money by the second generation", at=r"seventy", size=170,
               claim=True, side="L", stamp="CHALLENGED", stampAt=r"challenged"),
         src=D(text=WG, at=r"heard", span=1)),
    4: D(fix=D(lines=["MAKE SAVING THE DEFAULT"], at=r"fix", span=1)),
    5: L("The families that last rely on systems, not willpower."),
    6: D(end=True),
}
