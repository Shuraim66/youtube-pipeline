"""Regression checks for retiming and the generated audio, without a browser."""
import copy
import unittest
from types import SimpleNamespace

import numpy as np

from production import decorate_timing
from audio_mix import make_effects, make_music, SR
from voice_direction import token_alignment, token_alignment_alias, cache_key, apply_aliases
from render_video import frame_ranges


def fixture(offset=0, speed=1):
    words = "four million pounds Suez Canal shares".split()
    return {"fps": 30, "totalFrames": offset+round(240*speed), "beats": [{
        "scene": "rothschild-transaction", "startFrame": offset,
        "endFrame": offset+round(200*speed), "vo": " ".join(words)
    }], "captions": [{"word": w, "startFrame": offset+round((30+i*20)*speed),
                      "endFrame": offset+round((48+i*20)*speed)} for i,w in enumerate(words)]}


class ProductionTest(unittest.TestCase):
    def test_aliases_use_whole_words_and_longest_match(self):
        aliases={'Rothschild':'Roths-child','Rothschilds':'Roths-childs'}
        self.assertEqual(apply_aliases('Rothschilds, Rothschild, Rothschildian',aliases),
                         'Roths-childs, Roths-child, Rothschildian')

    def test_alias_alignment_spaces_remain_monotonic(self):
        tokens=[SimpleNamespace(text=w,start_ts=a,end_ts=b) for w,a,b in
                [('The',.1,.3),('Roths-childs',.4,1.2),('bank',1.3,1.6)]]
        starts,ends=token_alignment_alias('The Rothschilds bank','The Roths-childs bank',tokens,1.7)
        self.assertTrue(all(starts[i]>=ends[i-1] for i in range(1,len(starts))))

    def test_twelve_minute_episode_ranges_have_no_gaps_or_duplicate_frames(self):
        ranges=frame_ranges(12*60*30+7,60*30)
        covered=[frame for start,end in ranges for frame in range(start,end+1)]
        self.assertEqual(covered,list(range(12*60*30+7)))
        self.assertEqual(ranges[-1],(21600,21606))

    def test_native_alignment_handles_contractions_and_punctuation(self):
        parts=[('It',.1,.2),("was",.2,.4),("n't",.4,.5),('banking',.6,1.2),('.',1.2,1.3)]
        text="It wasn't banking."
        a,b=token_alignment(text,[SimpleNamespace(text=w,start_ts=s,end_ts=e) for w,s,e in parts],1.4)
        self.assertEqual(len(a),len(text))
        self.assertAlmostEqual(a[text.index('banking')],.6)
        self.assertTrue(all(a[i]>=b[i-1] for i in range(1,len(a))))
        self.assertAlmostEqual(b[-1],1.3)

    def test_native_alignment_rejects_missing_word_instead_of_shifting_captions(self):
        tokens=[SimpleNamespace(text='banks',start_ts=.1,end_ts=.5)]
        with self.assertRaises(ValueError):
            token_alignment('five banks',tokens,.6)

    def test_pronunciation_alias_preserves_display_spelling_and_word_timing(self):
        parts=[SimpleNamespace(text='Roths-childs',start_ts=.2,end_ts=1.1)]
        starts, ends=token_alignment_alias('The Rothschilds', 'The Roths-childs',
                                            [SimpleNamespace(text='The',start_ts=.0,end_ts=.15), *parts], 1.2)
        self.assertEqual(len(starts),len('The Rothschilds'))
        self.assertAlmostEqual(starts[4],.2)
        self.assertAlmostEqual(ends[-1],1.1)

    def test_delivery_change_invalidates_voice_cache(self):
        beats=[{'vo':'Five banks.'}]
        self.assertNotEqual(cache_key(beats,{'speed':1},'bf_emma'),cache_key(beats,{'speed':.98},'bf_emma'))

    def test_lesson_arrangement_handles_short_scene_without_nan(self):
        timeline=fixture()
        timeline['beats'][0]['scene']='rothschild-insight'
        self.assertTrue(np.isfinite(make_music(decorate_timing(timeline))).all())

    def test_sound_and_visual_cues_follow_retimed_narration(self):
        base = decorate_timing(fixture())
        shifted = decorate_timing(fixture(offset=90, speed=1.5))
        a = base["beats"][0]["data"]["motion"]["amount"]
        b = shifted["beats"][0]["data"]["motion"]["amount"]
        self.assertEqual(b, {key:round(value*1.5) for key,value in a.items()})
        ticks = [e for e in shifted["soundEvents"] if e["kind"] == "tick"]
        self.assertEqual(ticks[0]["frame"], 90+b["start"])
        self.assertEqual(ticks[-1]["frame"], 90+b["end"])

    def test_missing_anchor_is_visible_and_bounded(self):
        result = decorate_timing(fixture())
        self.assertTrue(any(x["phrase"] == "lent the British government" for x in result["cueFallbacks"]))
        self.assertTrue(all(0 <= e["frame"] < result["totalFrames"] for e in result["soundEvents"]))

    def test_stereo_stems_are_deterministic_finite_and_do_not_clip(self):
        timeline = decorate_timing(fixture())
        for generate in (make_music, make_effects):
            a, b = generate(timeline), generate(copy.deepcopy(timeline))
            self.assertEqual(a.shape, (8*SR, 2))
            np.testing.assert_array_equal(a,b)
            self.assertTrue(np.isfinite(a).all())
            self.assertGreater(float(np.max(np.abs(a))), .001)
            self.assertLess(float(np.max(np.abs(a))), 1)
            self.assertGreater(float(np.max(np.abs(a[:,0]-a[:,1]))), .0001)


if __name__ == '__main__':
    unittest.main()
