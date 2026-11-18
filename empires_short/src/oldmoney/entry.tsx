import { Composition, registerRoot } from "remotion";
import { DUR_FRAMES, FPS, H, OldMoney, W } from "./OldMoney";

registerRoot(() => <Composition id="OldMoney" component={OldMoney} durationInFrames={DUR_FRAMES} fps={FPS} width={W} height={H} />);
