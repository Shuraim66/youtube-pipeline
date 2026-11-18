"""Shared beat-planning checks (playbooks/PUPPET_BEAT_RULES.md). A beat is a dict:
  plate: str; mascot: "puppet" | "library" | None; gesture: str | None (puppet gesture name); puppet_x: "R" | "C" | "L"; card: "L" | "R" | None (side of a data card shown this beat)
Rules returned as error strings:
 1. pointing at a card: gesture pointLeft only, puppet frame-right (puppet_x == "R"), card frame-left (card == "L").
 2. no puppet <-> library switch on the same plate in back-to-back beats (puppet->puppet or library->library may keep a plate).
 3. a plate may repeat in adjacent beats ONLY when both beats use the puppet (continuity of one talking character).
"""

def puppet_rule_errors(beats, label="beat"):
    errs = []
    for i, b in enumerate(beats, 1):
        if b.get("gesture") in ("pointLeft", "pointRight"):
            if b["gesture"] != "pointLeft": errs.append(f"{label} {i}: only pointLeft is allowed (pointRight does not exist in puppet v2.0)")
            if b.get("puppet_x") != "R": errs.append(f"{label} {i}: puppet must stand frame-right when pointing at a card")
            if b.get("card") != "L": errs.append(f"{label} {i}: the card must be frame-left when the puppet points at it")
    for i in range(1, len(beats)):
        a, b = beats[i - 1], beats[i]
        if a.get("mascot") and b.get("mascot") and a["plate"] == b["plate"]:
            if a["mascot"] != b["mascot"]:
                errs.append(f"{label}s {i}-{i+1}: puppet/library switch on the same plate ({a['plate']})")
            elif a["mascot"] != "puppet":
                errs.append(f"{label}s {i}-{i+1}: the same plate in back-to-back library beats ({a['plate']})")
        elif a["plate"] == b["plate"] and not (a.get("mascot") == "puppet" and b.get("mascot") == "puppet"):
            errs.append(f"{label}s {i}-{i+1}: same plate in adjacent beats ({a['plate']})")
    return errs
