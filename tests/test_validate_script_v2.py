"""Run: python -m unittest discover -s tests -p 'test_*.py'"""
import copy, json, sys, unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
import validate_script_v2 as v  # noqa: E402

BASE = json.loads((ROOT / "scripts_v2" / "capone.json").read_text())


def codes(doc, level=None):
    return [i["code"] for i in v.validate(doc) if level is None or i["level"] == level]


class ScriptSpecTests(unittest.TestCase):
    def test_example_scripts_have_no_errors(self):
        for f in sorted((ROOT / "scripts_v2").glob("*.json")):
            self.assertEqual(codes(json.loads(f.read_text()), "error"), [], f.name)

    def test_missing_payoff_and_sources_are_errors(self):
        d = copy.deepcopy(BASE); del d["payoff"]
        self.assertIn("missing-field", codes(d, "error"))
        d = copy.deepcopy(BASE); d["claims"][0]["source"] = ""
        self.assertIn("claim-source", codes(d, "error"))
        d = copy.deepcopy(BASE); d["payoff"]["source"] = ""
        self.assertIn("payoff-source", codes(d, "error"))

    def test_hook_limits(self):
        d = copy.deepcopy(BASE); d["hook"]["lines"] = ["one two three four five six", "seven eight nine ten eleven"]
        self.assertIn("hook-length", codes(d, "error"))
        d = copy.deepcopy(BASE); d["hook"]["emphasis"] = "1999"
        self.assertIn("hook-emphasis", codes(d, "error"))

    def test_editorial_warnings(self):
        d = copy.deepcopy(BASE); d["script"] = "Have you ever wondered about Al Capone? " + d["script"]
        self.assertIn("generic-opener", codes(d, "warning"))
        d = copy.deepcopy(BASE); d["script"] += " Nobody knows the full story to this day."
        self.assertIn("manufactured-mystery", codes(d, "warning"))
        d = copy.deepcopy(BASE); d["script"] = d["script"].replace("11 years", "12 years")
        self.assertIn("unsourced-number", codes(d, "warning"))
        d = copy.deepcopy(BASE); d["script"] += " He paid the taxes he owed in 1931. He paid the taxes he owed in 1931."
        self.assertIn("beat-repeats", codes(d, "warning"))

    def test_question_ending_is_not_required(self):
        d = copy.deepcopy(BASE); d["script"] = d["script"].rsplit(" So was", 1)[0]
        self.assertEqual(codes(d, "error"), [])

    def test_length(self):
        d = copy.deepcopy(BASE); d["script"] = " ".join(["word"] * 200) + "."
        self.assertIn("too-long", codes(d, "error"))
        d = copy.deepcopy(BASE); d["script"] = "He lost it all. Then he won."
        self.assertIn("duration", codes(d, "warning"))


if __name__ == "__main__":
    unittest.main()
