import { Route } from './route'

export function nestedRoutes(...routes: { path: string, params?: {} }[]) {
  return routes.slice(1).reduce(
    (prev, x) => new Route(x.path, x.params || {}, prev),
    new Route(routes[0].path, routes[0].params || {})
  )
}
