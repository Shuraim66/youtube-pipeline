import { Composition, registerRoot } from "remotion";
import { PuppetSheet, PuppetSideBySide } from "./Sheets";
import { SnapTest, SNAP_FRAMES } from "./SnapTest";
import { PuppetTest, TEST_FRAMES } from "./PuppetTest";
import { SwitchTest, SWITCH_FRAMES } from "./SwitchTest";

registerRoot(() => (
  <>
    <Composition id="PuppetSheet" component={PuppetSheet} durationInFrames={60} fps={30} width={1920} height={2400} />
    <Composition id="SnapTest" component={SnapTest} durationInFrames={SNAP_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="PuppetSideBySide" component={PuppetSideBySide} durationInFrames={30} fps={30} width={1920} height={1080} />
    <Composition id="PuppetTest" component={PuppetTest} durationInFrames={TEST_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="SwitchTest" component={SwitchTest} durationInFrames={SWITCH_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="SwitchTestClean" component={SwitchTest} defaultProps={{ labels: false }} durationInFrames={SWITCH_FRAMES} fps={30} width={1920} height={1080} />
  </>
));
