"""Run: python -m unittest discover -s tests -p 'test_*.py'"""
import copy, csv, json, sys, tempfile, unittest
from pathlib import Path
from types import SimpleNamespace

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
import record_metrics as rm  # noqa: E402
import validate_script_v2 as vs  # noqa: E402
import validate_topics as vt  # noqa: E402

CRIT = {k: 3 for k in vt.CRITERIA}


def topics(n=10, **kw):
    cands = [{"name": f"Case {chr(65 + i)} Zyx{i}", "hook": "h", "sources": ["https://en.wikipedia.org/wiki/X"],
              "scores": dict(CRIT, curiosity=5 if i < 3 else 2)} for i in range(n)]
    d = {"channel": "The Night File", "date": "2026-10-12", "candidates": cands, "top3": [c["name"] for c in cands[:3]]}
    d.update(kw)
    return d


def codes(issues, level=None):
    return [i["code"] for i in issues if level is None or i["level"] == level]


class TopicTests(unittest.TestCase):
    def test_valid_file(self):
        issues, ranked = vt.validate(topics(), corpus="")
        self.assertEqual(codes(issues, "error"), [])
        self.assertEqual([n for _, n, _ in ranked[:3]], topics()["top3"])

    def test_errors(self):
        self.assertIn("too-few", codes(vt.validate(topics(9), corpus="")[0], "error"))
        d = topics(); d["candidates"][0]["scores"]["visuals"] = 6
        self.assertIn("scores", codes(vt.validate(d, corpus="")[0], "error"))
        d = topics(); d["candidates"][1]["hook"] = ""
        self.assertIn("top3-hook", codes(vt.validate(d, corpus="")[0], "error"))
        self.assertIn("channel", codes(vt.validate(topics(channel="Other"), corpus="")[0], "error"))

    def test_duplicate_against_published(self):
        d = topics(); d["candidates"][4]["name"] = "Nikola Tesla"
        self.assertIn("duplicate", codes(vt.validate(d, corpus="tesla: the man who lit the world | nikola tesla")[0], "warning"))
        # the real repo corpus already contains Tesla and D. B. Cooper
        corpus = vt.published_corpus()
        d = topics(); d["candidates"][5]["name"] = "D. B. Cooper"
        self.assertIn("duplicate", codes(vt.validate(d, corpus=corpus)[0], "warning"))

    def test_top3_not_highest_is_warning(self):
        d = topics(); d["top3"] = [d["candidates"][i]["name"] for i in (0, 1, 7)]
        self.assertIn("top3-not-highest", codes(vt.validate(d, corpus="")[0], "warning"))


class ScriptProfileTests(unittest.TestCase):
    base = json.loads((ROOT / "scripts_v2" / "capone.json").read_text())

    def test_workflow_fields_warn_when_missing(self):
        c = codes(vs.validate(copy.deepcopy(self.base)), "warning")
        self.assertIn("hook-candidates", c)
        self.assertIn("beats-missing", c)

    def test_complete_workflow_fields(self):
        d = copy.deepcopy(self.base)
        d["hook_candidates"] = ["Never convicted of murder. Jailed for taxes.", "Ten gunmen. All dead.", "He bought a train car to leave town."]
        d["hook_rationale"] = "States the contradiction the ending pays off."
        d["beats"] = {"setup": "Al Capone ran Chicago.", "conflict": "A rival put a 50,000 dollar bounty on his head.",
                      "evidence": "At least 10 gunmen tried to collect.", "reveal": "In 1931, he was convicted using his own offers",
                      "payoff": "11 years."}
        c = codes(vs.validate(d))
        for k in ("hook-candidates", "hook-rationale", "beats-missing", "beat-not-in-script", "hook-not-candidate"):
            self.assertNotIn(k, c)
        d["beats"]["twist"] = "x"
        self.assertIn("beat-role", codes(vs.validate(d), "error"))

    def test_unsourced_quote_and_profile(self):
        d = copy.deepcopy(self.base)
        d["script"] += ' He said "I am just a businessman giving the public what they want."'
        self.assertIn("unsourced-quote", codes(vs.validate(d), "warning"))
        d = copy.deepcopy(self.base); d["script"] += " The lesson here is simple."
        self.assertIn("off-profile", codes(vs.validate(d), "warning"))


class MetricsTests(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        (self.tmp / "aurelis_x_short.json").write_text(json.dumps([{"title": "T", "uploaded": "https://youtu.be/ABC123"}]))
        self.old = rm.ROOT, rm.CSV
        rm.ROOT, rm.CSV = self.tmp, self.tmp / "analytics" / "metrics.csv"

    def tearDown(self):
        rm.ROOT, rm.CSV = self.old

    def args(self, **kw):
        base = dict(video="ABC123", checkpoint="48h", hours="48", views="100", engaged=None, stayed="40.5", apv="70",
                    likes=None, subs=None, date="2026-10-12", note=None)
        base.update(kw)
        return SimpleNamespace(**base)

    def test_add_and_upsert(self):
        rm.add(self.args())
        rm.add(self.args(views="120"))
        with rm.CSV.open() as f:
            rows = list(csv.DictReader(f))
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["views"], "120")
        self.assertEqual(rows[0]["channel"], "Aurelis HQ")
        self.assertEqual(rows[0]["likes"], "")  # not given → blank, never estimated

    def test_rejects_unknown_video_and_bad_values(self):
        with self.assertRaises(SystemExit):
            rm.add(self.args(video="NOPE"))
        with self.assertRaises(SystemExit):
            rm.add(self.args(stayed="140"))
        with self.assertRaises(SystemExit):
            rm.add(self.args(checkpoint="3d"))


if __name__ == "__main__":
    unittest.main()
