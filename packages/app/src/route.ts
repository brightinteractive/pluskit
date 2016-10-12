import { ReactElement } from 'react'
import { Reducer } from 'redux'
import { assign } from 'lodash'

import { Query } from './query'
import { Resource } from './resource'

export function home(path: string = ''): Route<{}, {}> {
  return new Route(path, {})
}

export interface BindOpts<In, Derived, Prereqs, T, Out> {
  prerequisites: (x: Derived & In) => Prereqs
  query: (params: Prereqs) => Query<T>
  bindTo: (val: T) => Out
}

export type AnyRoute = Route<{}, {}>

export class Route<InputProps extends { [key: string]: string }, DerivedProps extends {}> {
  parent?: Route<{}, {}>
  path: string
  paramMap: InputProps

  renderer: (x: {}) => ReactElement<{}>
  containerRenderer: (x: {}) => ReactElement<{}>
  notFoundErrorRenderer: (x: {}) => ReactElement<{}>
  errorRenderer: (x: {}) => ReactElement<{}>

  resources: Resource<{}, {}>[] = []
  bindings: BindOpts<{}, {}, {}, {}, {}>[] = []

  constructor(path: string, paramMap: InputProps, parent?: Route<{}, {}>) {
    if (!path.trim() && parent) {
      throw Error('route must specify a path segment')
    }

    this.path = path.replace(/^\//, '').replace(/\/$/, '')
    this.paramMap = paramMap
    this.parent = parent
  }

  /** Label (eg: `/foo/:label`) used to identify the dynamic param bound to `key` in the url */
  dynamicParamLabel(key: string): string | undefined {
    return this.paramMap[key] || (this.parent && this.parent.dynamicParamLabel(key))
  }

  /** Array containing this route and all of its container routes */
  parents(): AnyRoute[] {
    return (this.parent && this.parent.parents() || []).concat(this)
  }

  /** Unique identifier for this route */
  routename(): string {
    return '/' + this.parents().map(x => x.path).join('/')
  }

  /** Full path for this route with route params specified by `param` */
  pathname(params: InputProps): string {
    return Object.keys(params).reduce(
      (pathname, key) => pathname.replace(`:${this.dynamicParamLabel(key)}`, params[key]),
      this.routename()
    )
  }

  /** Attach a store to this route */
  state(resource: Resource<{}, {}>): this {
    return this
  }

  /** Attach a data dependency to this route */
  dataDependency<T, Prereqs, OutProps>(opts: BindOpts<InputProps, DerivedProps, Prereqs, T, OutProps>): Route<InputProps, DerivedProps & OutProps> {
    // this.bindings.push(bindFn)
    return this
  }

  reducers(): { [key: string]: Reducer<{}> } {
    return assign.apply(undefined, this.resources.map(r => r.reducers()))
  }

  renderContainer(renderFn: (params: InputProps & DerivedProps) => ReactElement<{}>): this {
    this.containerRenderer = renderFn
    return this
  }

  render(renderFn: (params: InputProps & DerivedProps) => ReactElement<{}>): this {
    this.renderer = renderFn
    return this
  }

  catchNotFound(renderFn: (params: InputProps) => ReactElement<{}>): this {
    this.notFoundErrorRenderer = renderFn
    return this
  }

  catch(renderFn: (error: Error) => ReactElement<{}>): this {
    this.errorRenderer = renderFn
    return this
  }

  route(path: string): Route<{}, DerivedProps>
  route<RouteParams extends {}>(path: string, params: RouteParams): Route<RouteParams, DerivedProps>
  route(path: string, params: any = {}): Route<{}, {}> {
    return new Route(path, params, this)
  }
}

export interface RouteContext {
  handlePushState(path: string[], params: {}): boolean
  handleReplaceState(path: string[], params: {}): boolean
}
