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

  use<R2>(m: Middleware<R, R2>) {
    return new Route<R & R2>({
      path: this.path,
      middleware: compose(this.middleware, m)
    })
  }

  subroute(subpath: string): Route<R>
  subroute<Params>(subpath: string, getParams: (params: { [key: string]: string }) => Params): Route<R & Params>
  subroute(subpath: string, getParams?: (params: any) => any): any {
    const subroute = new Route({
      path: path.join(this.path, subpath),
      middleware: this.middleware
    })

    if (!getParams) {
      return subroute
    }

    return subroute.use((req, next) => next(getParams(req.pathParams)))
  }
}

export function app(basePath: string = '') {
  return new Route({
    path: basePath,
    middleware: noop()
  })
}
