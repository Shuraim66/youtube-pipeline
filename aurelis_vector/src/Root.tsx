import React from 'react';
import {Composition} from 'remotion';
import {CollapseScene} from './CollapseScene';
import {ScriptScene} from './ScriptScene';
import {CharacterTest} from './CharacterTest';
import timing from './timing.json';
import {W, H, FPS} from './theme';
import {loadFont as loadFraunces} from '@remotion/google-fonts/Fraunces';
import {loadFont as loadGrotesk} from '@remotion/google-fonts/SpaceGrotesk';

loadFraunces();
loadGrotesk();

export const RemotionRoot: React.FC = () => (
  <>
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
