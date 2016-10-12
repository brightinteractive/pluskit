const express = require('express')
const renderer = require('../lib/es5/server')

const port = process.env.PORT || 8000
const assetsPrefix = 'demo/build'

renderer.create({
  entryPoints: {
    client: './demo/render-client.js',
    server: './demo/render-server.js'
  },
  enableServerSideRendering: Boolean(process.env.SERVERSIDE_RENDERING),
  enableMinification: Boolean(process.env.MINIFICATION),
  enableHotReload: !Boolean(process.env.NO_HOT_RELOAD),
  assetsPrefix,
  snippets: [],
  verbose: true
})
.catch(error => console.error(error))
.then((renderMiddleware) => {
  const server = express()
  server.use(express.static(assetsPrefix))
  server.use(renderMiddleware)

  server.listen(port, () => {
    process.stderr.write(`Application started on ${port}\n`)
  })
})
