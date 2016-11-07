import { Stream } from 'xstream'
import { size } from 'lodash'
import * as qs from 'querystring'

import { MountRequest, QueryParams } from './request'
import { Route } from './route'

export class Transition<Params> {
  handler: Route<MountRequest & { pathParams: Params }>
  params: Params
  queryParams?: QueryParams
}

declare let __AppUserTransition$__: Stream<Transition<any>>

export function transition$() {
  if (!__AppUserTransition$__) {
    __AppUserTransition$__ = Stream.create<Transition<any>>()
  }

  return __AppUserTransition$__
}

export function requestTransition<T>(t: Transition<T>) {
  transition$().shamefullySendNext(t)
}

export function stringifyTransition<T>(t: Transition<T> | string): string {
  if (typeof t === 'string') return t

  let str = t.handler.path
  Object.keys(t.params).forEach(k => {
    str.replace(/:[^\/\#\?]+/g, (t as any).params[k])
  })

  if (t.queryParams && size(t.queryParams) > 0) {
    str += '?' + qs.stringify(t.queryParams)
  }

  return str
}
