import { AnyRoute } from './route'
import { takeWhile, merge, map } from 'lodash'

const Recognizer = require('route-recognizer') as any

/*
 * Runtime store for the route configuration.
 *
 * This is stateless and can be safely shared between server requests.
 */
export class RouteMapper {
  private matcher = new Recognizer()
  private routes: { [key: string]: AnyRoute } = {}

  constructor(routeList: AnyRoute[]) {
    routeList.forEach(route => {
      this.routes[route.routename()] = route
      this.matcher.add(route.parents().map(r => ({
        path: r.path,
        handler: r.routename()
      })))
    })
  }

  match(path: string): Match | undefined {
    const matches = this.matcher.recognize(path)
    if (!matches) return undefined

    const ids = map(matches, (x: any) => x.handler)
    const params = merge.apply(undefined,
      map(matches, (m: any) => m.params)
    )

    return { ids, params }
  }

  /**
   * Return ids of the first active route not included in the current match
   * and all of its active children
   */
  removedRoutes(state: RouteState, match: Match): string[] {
    const keptRoutes = takeWhile(match.ids, (newID: string) => {
      if (!state[newID]) {
        return false
      }

      const { params } = state[newID]
      if (Object.keys(params).some(paramKey => params[paramKey] !== match.params[paramKey])) {
        return false
      }

      return true
    })

    return Object.keys(state).filter(k => !keptRoutes.some(r => r === k))
  }

  /**
   * Currently active routes where either no route of that type is in the new match
   * or some param used by the route is different
   */
  addedRoutes(state: RouteState, match: Match): string[] {
    return match.ids.filter(id =>
      !state[id] || Object.keys(state[id].params).some(paramKey =>
        match.params[paramKey] !== state[id].params[paramKey]
      )
    )
  }

  getRoute(id: string): AnyRoute {
    return this.routes[id]
  }
}

export interface Match {
  ids: string[]
  params: { [key: string]: string }
}

export interface RouteState {
  [id: string]: {
    params: { [key: string]: string }
  }
}
