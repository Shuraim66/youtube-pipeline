import React from 'react';
import {Composition} from 'remotion';
import {CollapseScene} from './CollapseScene';
import {ScriptScene} from './ScriptScene';
import {CharacterTest} from './CharacterTest';
import {MoneyHabits} from './MoneyHabits';
import {MoneyHabitsV2} from './MoneyStory';
import {MoneyHabitsV3} from './MoneyStoryV3';
import {MoneyThumbnail} from './MoneyThumbnail';
import {MoneyLeaksShort} from './MoneyLeaksShort';
import {PanAmShort} from './PanAmShort';
import {AtariShort} from './AtariShort';
import {AtariShortPlates} from './AtariShortPlates';
import {GuideRef} from './GuideRef';
import {AtariSample} from './sample/AtariSample';
import {FtxShort} from './ftx/FtxShort';
import ftxTiming from './ftxShortTiming.json';
import atariTiming from './atariShortTiming.json';
import {GuideTest} from './GuideTest';
import {GuideHero} from './GuideHero';
import panAmTiming from './panAmShortTiming.json';
import timing from './timing.json';
import {W, H, FPS} from './theme';
import {loadFont as loadFraunces} from '@remotion/google-fonts/Fraunces';
import {loadFont as loadGrotesk} from '@remotion/google-fonts/SpaceGrotesk';

loadFraunces('normal', {weights:['400','500','600','700'], subsets:['latin']});
loadGrotesk('normal', {weights:['400','500','600','700'], subsets:['latin']});

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="MoneyThumbnail" component={MoneyThumbnail} durationInFrames={90} fps={30} width={1920} height={1080}/>
    <Composition id="MoneyLeaksShort" component={MoneyLeaksShort} durationInFrames={900} fps={30} width={1080} height={1920}/>
    <Composition id="PanAmShort" component={PanAmShort} durationInFrames={(panAmTiming as any).totalFrames || 900} fps={30} width={1080} height={1920}/>
    <Composition id="AtariShort" component={AtariShort} durationInFrames={(atariTiming as any).totalFrames || 900} fps={30} width={1080} height={1920}/>
    <Composition id="AtariShortPlates" component={AtariShortPlates} durationInFrames={(atariTiming as any).totalFrames || 900} fps={30} width={1080} height={1920}/>
    <Composition id="GuideRef" component={GuideRef} durationInFrames={1} fps={30} width={1024} height={1024}/>
    <Composition id="AtariSample" component={AtariSample} durationInFrames={330} fps={30} width={1080} height={1920}/>
    <Composition id="FtxShort" component={FtxShort} durationInFrames={(ftxTiming as any).totalFrames || 900} fps={30} width={1080} height={1920}/>
    <Composition id="GuideTest" component={GuideTest} durationInFrames={90} fps={30} width={1080} height={1920}/>
    <Composition id="GuideHero" component={GuideHero} durationInFrames={90} fps={30} width={1080} height={1920}/>
    <Composition id="MoneyHabitsV3" component={MoneyHabitsV3} durationInFrames={(timing as any).totalFrames || 300} fps={(timing as any).fps || FPS} width={1920} height={1080}/>
    <Composition id="MoneyHabitsV2" component={MoneyHabitsV2} durationInFrames={(timing as any).totalFrames || 300} fps={(timing as any).fps || FPS} width={1920} height={1080}/>
    <Composition id="MoneyHabits" component={MoneyHabits} durationInFrames={(timing as any).totalFrames || 300} fps={(timing as any).fps || FPS} width={1920} height={1080}/>
    {/* narration-driven composition: duration comes from timing.json (build.py) */}
    <Composition
      id="Script"
      component={ScriptScene}
      durationInFrames={(timing as any).totalFrames || 300}
      fps={(timing as any).fps || FPS}
      width={W}
      height={H}
    />
    {/* real vectorized character test */}
    <Composition
      id="CharTest"
      component={CharacterTest}
      durationInFrames={90}
      fps={FPS}
      width={W}
      height={H}
    />
    {/* original hard-coded demo scene, kept for reference */}
    <Composition
      id="Collapse"
      component={CollapseScene}
      durationInFrames={300}
      fps={FPS}
      width={W}
      height={H}
    />
  </>
);
