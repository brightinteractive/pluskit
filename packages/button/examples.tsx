import * as React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import Button from './src';

declare var module: {}

storiesOf('Button', module)
  .add('With accessory', () => (
    <Button
      theme={require('./theme.scss')}
      value={'foo' as any}
      onClick={action('click')}
      iconClass={require('./example/icon.scss').icon}
    >
      Click Me!
    </Button>
  ))
  .add('Without accessory', () => (
    <Button
      theme={require('./theme.scss')}
      value={'foo' as any}
      onClick={action('click')}
    >
      Click Me!
    </Button>
  ))
