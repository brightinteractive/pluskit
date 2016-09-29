import * as React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import Field from './src';

declare var module: {}
type Record = {id: string, name: string}
const RecordField = Field as new() => Field<Record>

storiesOf('Field', module)
  .add('With suggestions', () => (
    <div style={{width: 200, height: 200}}>
      <RecordField
        field={<input />}
        textValue="Hello"
        getKey={x => x.id}
        onCommit={action('commit')}
        onDismiss={action('dismiss')}
        onTextChange={action('text-change')}
        renderSuggestion={x => <div>x.name</div>}
        suggestionContainer={<div />}
        suggestions={[
          {id: 'foo', name: 'Foo'},
          {id: 'bar', name: 'Bar'},
          {id: 'baz', name: 'Baz'},
        ]}
      />
    </div>
  ))