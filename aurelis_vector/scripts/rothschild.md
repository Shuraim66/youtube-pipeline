# Rothschild script — verified facts + build plan (Sep 18 2026)

## Current directed edition — Sep 19

The latest `rothschild.json` removes “every border” in favor of “across Europe.”
The adaptation beat is now: “Rothschild banking continues today. The lesson isn't
that powerful families disappear. It's that enduring businesses adapt.” This
avoids repeating the preceding thesis and preserves the survival correction.
The on-screen relationship-to-capabilities scene is an editorial metaphor.
Delivery is authored in `rothschild.delivery.json`; current duration is 58.93s,
not the original 45s planning estimate below.

Evidence checked in this pass:
- Five-city business: https://www.rothschildarchive.org/business/
- Family partnership and subsequent corporate-structure evolution:
  https://www.rothschildarchive.org/business/origins_of_the_business/family_partnership
- £4m Suez shares advance, Archive annual review:
  https://www.rothschildarchive.org/materials/ar2006.pdf
- Nineteenth-century capital-market development and later adaptation:
  https://www.rothschildarchive.org/exhibitions/timeline/
- Continuing business: https://www.rothschildandco.com/en/about-us/

“What builds may not sustain” is our interpretation, not an attributed quotation
or a claim that public markets caused the family's extinction. The Archive also
documents Rothschild participation in developing public capital markets; do not
turn the two-bank visual into a literal private-versus-public historical dichotomy.

## FACT-CHECK (verified via Rothschild Archive + Britannica + Hansard)
- ✅ Five brothers / five cities: Amschel=Frankfurt, Nathan=London, James=Paris, Salomon=Vienna, Carl=Naples.
- ⚠️ FIXED: banks were NOT "all established by 1821" (London 1804/1811, Paris 1811, Vienna & Naples 1820s).
  → Use **"By the 1820s, all five brothers ran banks"** + card **"A FIVE-CITY DYNASTY BY THE 1820s"**.
  (Rock-solid anchor if needed: all five made BARONS by Emperor Francis I in 1822.)
- ✅ 1875: N M Rothschild & Sons advanced the British govt £4,000,000 to buy Suez Canal shares (Disraeli).
  Documented in the Rothschild Archive. (Parliament later approved £4,080,000.) Famous as a near-handshake deal.
- ✅ Thesis (advantage that BUILDS ≠ advantage that SUSTAINS; joint-stock banks + capital markets eroded the
  private-network edge) = sound, defensible interpretation.
Sources: rothschildarchive.org, britannica.com/money/Rothschild-family, hansard.parliament.uk (1876 Suez debate).

## Publication correction (Sep 18, 2026)
The adaptation beat now explicitly acknowledges that the banking business continues:
"Rothschild banking continues today. Its history is a reminder: the advantage that builds power must evolve to sustain it."
On-screen heading: "Still banking. Still evolving." This replaces the implication
that the financial system simply left the family behind. Contemporary reference:
https://www.rothschildandco.com/en/about-us/

The final mux normalizes narration toward -14 LUFS with a -1.5 dBTP target.
`build.py` checks cached narration text against the script before reusing it, so
this edit regenerates narration, caption cues, and all beat boundaries together.

## NEW COMPONENTS THIS SCRIPT NEEDS (build in components.tsx)
1. EuropeMap — stylized Europe, 5 city dots that light up + connecting lines (beats 4-8)
2. Ledger — parchment page, lines draw on with quill (1875 Suez transaction, beats 13-18)
3. SplitScreen — LEFT (1800s private bank) vs RIGHT (1900s joint-stock), cross-fade weighting (beats 19-24, 31-41)
4. VennInsight — two labeled circles (Advantage Builder / Advantage Sustainer) + overlap pulse (beats 25-30)
5. (reuse) DataCard (beat 9-12), Hook, SourceTag, BrandMark, Wipe transitions, Captions.

## BEATS: 45 beats ~1s each, 45s. bf_emma. Series "How Empires Die".
Structure: Hook(1-3) → Map/5cities(4-8) → DataCard(9-12) → Ledger/Suez(13-18) →
SplitScreen shift(19-24) → Venn insight(25-30) → Modern application(31-41) → CTA+brand(42-45).
