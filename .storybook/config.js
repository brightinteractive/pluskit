import { configure } from '@kadira/storybook';
import 'normalize.css'
const req = require.context('../packages', true, /examples\.tsx$/)

function loadStories() {
  console.log('keys', req.keys())
  req.keys().forEach(req)
}

configure(loadStories, module);