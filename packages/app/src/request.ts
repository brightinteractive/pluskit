import { Route } from './route'

export interface QueryParams {
  [key: string]: string[] | string | undefined
}

export interface MountRequest {
  /**
   * The route being mounted
   */
  route: Route<MountRequest>


  /** Query parameters in the url */
  queryParams: QueryParams

  /**
   * Opaque object containing path parameters.
   *
   * Don't use this directly, use the second parameter to a route instance's
   * `subroute` method to to extract the parameters in a typesafe manner
   **/
  pathParams: {}
}

export interface RequestParams {
  route: Route<MountRequest>
  params: {}
  queryParams?: {}
}

export function createRequest({ route, params, queryParams }: RequestParams): MountRequest {
  return {
    route: route,
    queryParams: queryParams || {},
    pathParams: params
  }
}
