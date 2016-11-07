import { assign } from 'lodash'
import * as path from 'path'

import { MountRequest } from './request'
import { Middleware, compose, noop } from './middleware'

export interface RouteProps<R extends MountRequest> {
  path: string
  middleware: Middleware<MountRequest, R>
}

export class Route<R extends MountRequest> implements RouteProps<R> {
  path: string
  middleware: Middleware<MountRequest, R>

  constructor(props: RouteProps<R>) {
    assign(this, props)
  }

  use<R2 extends MountRequest>(m: Middleware<MountRequest, R2>) {
    return new Route({
      path: this.path,
      middleware: compose(this.middleware, m)
    })
  }

  subroute(subpath: string): Route<R>
  subroute<Params>(subpath: string, getParams: (params: { [key: string]: string }) => Params): Route<R & { pathParams: Params }>
  subroute(subpath: string, getParams?: (params: any) => any) {
    return new Route({
      path: path.join(this.path, subpath),
      middleware: this.middleware
    })

    // [todo] - Validate params
  }
}

export function app(basePath: string = '') {
  return new Route({
    path: basePath,
    middleware: noop()
  })
}
