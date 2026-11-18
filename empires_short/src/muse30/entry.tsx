import { Composition, registerRoot } from "remotion";
import { DUR_FRAMES, FPS, H, Muse30, W } from "./Muse30";

registerRoot(() => <Composition id="Muse30" component={Muse30} durationInFrames={DUR_FRAMES} fps={FPS} width={W} height={H} />);
