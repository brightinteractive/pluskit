const { configure } = require('@kadira/storybook')
require('normalize.css')
const req = require.context('../packages', true, /examples\.tsx$/)

function loadStories() {
  console.log(req.keys())
  req.keys().forEach(req)
}

configure(loadStories, module);
