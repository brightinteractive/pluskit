import * as React from 'react'
import { Store, Dispatch } from 'redux'
import { assign } from 'lodash'

import { AnyRoute, BindOpts } from './route'
import { RouteMapper, Match } from './matcher'

export interface AppProps {
  store: Store<{}>
  mapper: RouteMapper
  initialMatch: Match
}

export interface AppState {
  state: {}
  match: Match
}

export class App extends React.Component<AppProps, AppState> {
  stateTransition?: number
  state = {
    state: this.props.store.getState(),
    match: this.props.initialMatch
  }

  componentDidMount() {
    window.onpopstate = this.handlePopState.bind(this)

    this.props.store.subscribe(() => {
      if (typeof this.stateTransition === 'undefined') {
        this.stateTransition = window.setTimeout(() => {
          this.stateTransition = undefined
          this.setState({ state: this.props.store.getState(), match: this.state.match })
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
          params: match.params
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
    const { state, dispatch } = this.props.context

    const prerequisites = binding.prerequisites(props)
    const query = binding.query(prerequisites)
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
