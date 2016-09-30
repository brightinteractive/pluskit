import * as React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import Portal from './src';

declare var module: {}

storiesOf('Portal', module)
  .add('With content', () => (
    <div>
      <Portal>
        <div>Hello, world</div>
      </Portal>
      <Portal>
        <div>Hello, world 2</div>
      </Portal>
    </div>
  ));
