import * as React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import Calendar from './src';

declare var module: {}

storiesOf('Calendar', module)
  .add('Without min date', () => (
    <Calendar
      date={new Date()}
      onChange={action('change')}
      theme={require('./theme.scss')}
    />
  ));
