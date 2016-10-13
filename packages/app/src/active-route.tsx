import * as React from 'react'
import { Store, Dispatch } from 'redux'
import { assign } from 'lodash'
import * as qs from 'querystring'
import * as url from 'url'

import { AnyRoute, BindOpts } from './route'
import { RouteMapper, Match } from './matcher'
import { mountRoutes, MountedRouteState } from './mount'
import { LinkTarget } from './link'

export interface AppProps {
  store: Store<{}>
  mapper: RouteMapper
  initialMatch: Match
  initialRouteState: MountedRouteState
  initialQueryParams: { [key: string]: string }
}

export interface AppState {
  state: {}
  match: Match
  routeState: MountedRouteState
  queryParams: { [key: string]: string }
}

export class App extends React.Component<AppProps, AppState> {
  private static instance?: App

  mounting?: boolean
  stateTransition?: number
  state: AppState = {
    queryParams: this.props.initialQueryParams,
    state: this.props.store.getState(),
    match: this.props.initialMatch,
    routeState: this.props.initialRouteState
  }

  static transition(route: AnyRoute, params: {}, queryParams: { [key: string]: string }) {
    const { instance } = this
    if (!instance) return Promise.resolve()

    const { mapper, store } = instance.props
    const { routeState } = instance.state

    const match = mapper.match(route.pathname(params))
    if (!match) {
      throw Error('Unhandled 404')
    }

    const addedRoutes = mapper.addedRoutes(routeState, match)
    const removedRoutes = mapper.removedRoutes(routeState, match)

    instance.mounting = true

    return mountRoutes({
      store,
      mapper,
      addedRoutes,
      params: match.params,
      removedRoutes,
      routeState,
      queryParams
    })
    .then(state => {
      instance.mounting = false
      instance.setState({ state: store.getState(), match, queryParams, routeState })
    })
    .catch(() => {
      instance.mounting = true
    })
  }

  static parseRoute(routeString: string): LinkTarget<{}> | undefined {
    if (!this.instance) throw new Error('No app instance is defined')

    const { mapper } = this.instance.props

    const path = url.parse(routeString).pathname || '/'
    const query = qs.parse(url.parse(routeString).query)

    const match = mapper.match(path)
    if (!match) return undefined

    return {
      route: mapper.getRoute(match.ids[match.ids.length]),
      params: match.params,
      query: query
    }
  }

  componentWillMount() {
    if (App.instance) {
      throw Error('Only one app instance is suported')
    }

    App.instance = this
  }

  componentDidMount() {
    window.onpopstate = this.handlePopState.bind(this)

    this.props.store.subscribe(() => {
      if (typeof this.stateTransition === 'undefined') {
        this.stateTransition = window.setTimeout(() => {
          this.stateTransition = undefined
          this.setState({
            state: this.props.store.getState(),
            match: this.state.match,
            queryParams: this.state.queryParams,
            routeState: this.state.routeState
          })
        })
      }
    })
  }

  componentWillUnmount() {
    throw new Error('App should never unmount')
  }

  handlePopState() {
    debugger
  }

  render() {
    const { match, state } = this.state
    const { mapper, store } = this.props

    return (
      <RouteNode
        key={match.ids[0]}
        inputData={match.params}
        childRoutes={match.ids.slice(1)}
        route={mapper.getRoute(match.ids[0])}
        context={{
          dispatch: store.dispatch,
          state: () => state,
          mapper: mapper,
          params: match.params,
          queryParams: this.state.queryParams
        }}
      />
    )
  }
}


export interface RouteNodeProps {
  /** Common properties shared between all routes */
  context: RouteContext

  /** The route config object represented by this node */
  route: AnyRoute

  /** Paths of the descendent routes of this node */
  childRoutes: string[]

  /** Route parameters plus derived data inherited from parent routes */
  inputData: {}
}

export interface RouteContext {
  /** Dynamic route params */
  params: { [key: string]: string }

  /** Dynamic route params */
  queryParams: { [key: string]: string }

  /** Application state object */
  state: () => {}

  /** Application dispatcher */
  dispatch: Dispatch<{}>

  /** Mapping between route IDs and route config objects */
  mapper: RouteMapper
}

export interface RouteNodeState {
}

export class RouteNode extends React.Component<RouteNodeProps, RouteNodeState> {
  query(props: {}, binding: BindOpts<{}, {}, {}, {}, {}>) {
    const { state, dispatch, queryParams } = this.props.context

    const prerequisites = binding.prerequisites(props)
    const query = binding.query(prerequisites, queryParams)
    return binding.bindTo(query.select(dispatch, state))
  }

  renderParams() {
    return this.props.route.bindings.reduce(
      (props, binding) => assign.apply(undefined, [props].concat(this.query(props, binding))),
      this.props.inputData
    )
  }

  renderContent(child: React.ReactElement<{}>): React.ReactElement<{}> {
    if (this.props.route.containerRenderer) {
      return React.cloneElement(
        this.props.route.containerRenderer(this.renderParams()),
        {},
        child
      )

    } else {
      return child
    }
  }

  render(): React.ReactElement<{}> {
    if (this.props.childRoutes.length === 0) {
      return this.renderContent(
        this.props.route.renderer(this.renderParams())
      )

    } else {
      const { context, childRoutes } = this.props

      return this.renderContent(
        <RouteNode
          key={childRoutes[0]}
          context={context}
          route={context.mapper.getRoute(childRoutes[0])}
          childRoutes={childRoutes.slice(1)}
          inputData={this.renderParams()}
        />
      )
    }
  }
}
