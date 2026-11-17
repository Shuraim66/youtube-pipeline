import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Banker} from './Banker';

// Clean reference render of the recurring Aurelis guide (Banker) for image models
// (FLUX Kontext character reference). Plain neutral ground, full body, front-ish.
export const GuideRef: React.FC = () => (
  <AbsoluteFill style={{background: '#d9d4c7'}}>
    <svg width="1024" height="1024" viewBox="0 0 1024 1024">
      <Banker x={512} y={560} scale={1.2} action="present" stance="standing" held="document" gaze={0} id="ref" gestureAt={-200} />
    </svg>
  </AbsoluteFill>
);
