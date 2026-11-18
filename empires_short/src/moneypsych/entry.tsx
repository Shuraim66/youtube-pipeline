import { Composition, registerRoot } from "remotion";
import { DUR_FRAMES, FPS, H, MoneyPsych, W } from "./MoneyPsych";

registerRoot(() => <Composition id="MoneyPsych" component={MoneyPsych} durationInFrames={DUR_FRAMES} fps={FPS} width={W} height={H} />);
