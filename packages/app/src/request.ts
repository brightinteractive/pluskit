export interface QueryParams {
  [key: string]: string[] | string | undefined
}

export interface MountRequest {
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
  params: {}
  queryParams?: {}
}

export function createRequest({ params, queryParams }: RequestParams): MountRequest {
  return {
    queryParams: queryParams || {},
    pathParams: params,
  }
}
