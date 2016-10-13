const { home, Resource, Link, parseLinkTarget, Query } = require('../../lib/es5')
const React = require('react')

const users = new Resource('users', u => u.id)

const route = home('/')
  .state(users)
  .task(users.create({ id: 'me', name: 'Chris' }))
  .dataDependency({
    prerequisites: () => ({}),
    query: () => users.get({ id: 'me' }).required(),
    bindTo: me => ({ me })
  })
  .dataDependency({
    prerequisites: () => ({}),
    query: (_, query) => Query.always(query.count),
    bindTo: count => ({ count: Number(count) || 0 })
  })
  .render(({ me, count }) =>
    React.DOM.div({},
      `Hello, ${me.name} ${count}!`,
      `location: ${JSON.stringify(parseLinkTarget(window.location.href))}`,
      React.createElement(Link, { target: { route, query: { count: count + 1 }, params: {} } }, '++')
    )
  )

exports.default = route
