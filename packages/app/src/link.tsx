import * as React from 'react'
import { Route } from './route'
import { App } from './active-route'

export interface LinkProps<T> {
  target: LinkTarget<T>
}

export class Link<T> extends React.Component<LinkProps<T>, {}> {
  handleClicked = (e: React.SyntheticEvent<{}>) => {
    e.preventDefault()
    navigate(this.props.target)
  }

  render() {
    const { params, route, query } = this.props.target
    return (
      <a href={route.pathname(params, query)} onClick={this.handleClicked}>
        {this.props.children}
      </a>
    )
  }
}

export interface LinkTarget<T> {
  route: Route<T, any>
  params: T
  query?: { [key: string]: string }
}

export function parseLinkTarget(routeString: string) {
  return App.parseRoute(routeString)
}

export function navigate<T>({ route, params, query }: LinkTarget<T>, opts: { pushState: boolean } = { pushState: true }) {
  if (opts.pushState) {
    route.pushState(params, query)

  } else {
    route.replaceState(params, query)
  }
}
