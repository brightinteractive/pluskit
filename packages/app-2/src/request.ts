export interface QueryParams {
  [key: string]: string[] | string | undefined
}

export interface MountRequest<Params> {
  /** Query parameters in the url */
  queryParams: QueryParams

  /** Path parameters extracted from the url */
  pathParams: Params
}

export interface RequestParams {
  params: {}
  queryParams?: {}
}

export function createRequest({ params, queryParams }: RequestParams): MountRequest<{}> {
  return {
    queryParams: queryParams || {},
    pathParams: params,
  }
}
