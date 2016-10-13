const { home, Resource } = require('../../lib/es5')
const React = require('react')

const users = new Resource('users', u => u.id)

exports.default = home()
  .state(users)
  .task(users.create({ id: 'me', name: 'Chris' }))
  .dataDependency({
    prerequisites: () => ({}),
    query: () => users.get({ id: 'me' }).required(),
    bindTo: me => ({ me })
  })
  .render(({ me }) => React.DOM.div({ }, `Hello, ${me.name} ${count}!`))
