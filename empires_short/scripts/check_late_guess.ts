import { guessTiming } from "../src/guess/types";
import { andreeLateGuess } from "../src/guess/andreelate_guess";
import { christieLateGuess } from "../src/guess/christielate_guess";
import { celesteLateGuess } from "../src/guess/celestelate_guess";
for (const [n, p] of [["NightfileAndreeLate", andreeLateGuess], ["NightfileChristieLate", christieLateGuess], ["NightfileCelesteLate", celesteLateGuess]] as const) {
  const T = guessTiming(p);
  console.log(n, JSON.stringify({ dur: T.durationSec, frames: T.durationFrames, strip: T.stripAt, cards: T.cardWindows, revealAt: T.revealAt, closingAt: T.closingAt }));
}
