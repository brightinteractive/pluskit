const { home, Resource } = require('../../lib/es5')
const React = require('react')

const users = new Resource('users', u => u.id)

exports.default = home()
  .state(users)
  .render(() => React.DOM.div({}, "Hello, world!"))
