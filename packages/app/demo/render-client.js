const loadClient = require('../lib/es5/client').default
const routes = require.context('./routes', true, /.*\.jsx$/)

window.addEventListener('load', () => {
  loadClient({ routes })
})
