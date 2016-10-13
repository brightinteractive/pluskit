import * as React from 'react'
import { Route } from './route'

export interface LinkProps<T> {
  route: Route<T, any>
  params: T
  query?: { [key: string]: string }
}

export class Link<T> extends React.Component<LinkProps<T>, {}> {
  handleClicked = (e: React.SyntheticEvent<{}>) => {
    e.preventDefault()
    this.props.route.pushState(this.props.params, this.props.query)
  }

  render() {
    const { params, route, query, children } = this.props
    return (
      <a href={route.pathname(params, query)} onClick={this.handleClicked}>
        {children}
      </a>
    )
  }
}
