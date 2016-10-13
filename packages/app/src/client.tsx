import * as React from 'react'
import { render } from 'react-dom'

import { GenericStoreEnhancer, createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'

const qs = require('querystring')

import { App } from './active-route'
import { RouteMapper } from './matcher'
import { mountRoutes } from './mount'
import { WebpackRequireContext } from './webpack-context'
import { HttpError } from './error'

export interface ClientOpts {
  routes: WebpackRequireContext
}

export default function runClient(opts: ClientOpts) {
  const routes = opts.routes.keys().map(opts.routes).map(x => x.default)
  const mapper = new RouteMapper(routes)
  const compose = devtoolsCompose()

  const store = createStore(
    () => ({}),
    {},
    compose(
      applyMiddleware(
        thunk
      )
    )
  )

  const queryParams = qs.parse(window.location.search.substr(1))
  const match = mapper.match(window.location.pathname)
  if (!match) {
    throw Error('Unhandled 404')
  }

  mountRoutes({
    store,
    mapper,
    addedRoutes: match.ids,
    params: match.params,
    removedRoutes: [],
    routeState: {},
    queryParams: qs.parse(window.location.search.substr(1))
  })
  .then(state => {
    render(
      <App store={store} mapper={mapper} initialMatch={match} initialRouteState={state} initialQueryParams={queryParams} />,
      document.getElementById('app')
    )
  })
  .catch((error: HttpError) => {
    if (typeof error.redirect === 'undefined') {
      throw error
    }

    window.location.pathname = error.redirect
  })
}

function devtoolsCompose(): StoreComposer  {
  if (typeof __REDUX_DEVTOOLS_EXTENSION_COMPOSE__ === 'undefined') {
    return compose

  } else {
    return __REDUX_DEVTOOLS_EXTENSION_COMPOSE__ as any
  }
}

type StoreComposer = (...x: GenericStoreEnhancer[]) => GenericStoreEnhancer
declare const __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: StoreComposer | undefined

