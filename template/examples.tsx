import * as React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import MyComponent from './src';

declare var module: {}

storiesOf('MyComponent', module)
  .add('Without min date', () => (
    <MyComponent
    />
  ));
