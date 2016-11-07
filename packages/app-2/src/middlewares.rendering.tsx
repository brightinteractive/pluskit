import * as React from 'react'
import { assign } from 'lodash'
import { Stream } from 'xstream'

import { mapResponse } from './response'
import { MountRequest } from './request'
import { Middleware } from './middleware'
import { toStream } from './util'

export type RenderFn<R extends MountRequest, T> = (req: R) => T | Stream<T>
export type RenderMiddleware<R extends MountRequest> = Middleware<R, R>

export function render<R extends MountRequest>(fn: RenderFn<R, React.ReactElement<{}>>): RenderMiddleware<R> {
  return (req, next) => Promise.resolve({
    state: 'render',
    title: '',
    body: toStream(fn(req))
  })
}

export function renderContainer<R extends MountRequest>(fn: RenderFn<R, React.ReactElement<{}>>): RenderMiddleware<R> {
  return (req, next) => next(req).then(
    mapResponse(res =>
      assign(res, {
        body: Stream.combine(toStream(fn(req)), res.body).map(x =>
          React.cloneElement(x[0], {}, x[1])
        )
      })
    )
  )
}

export function renderTitle<R extends MountRequest>(fn: RenderFn<R, string>): RenderMiddleware<R> {
  return (req, next) => next(req).then(
    mapResponse(res =>
      assign(res, {
        title: toStream(fn(req))
      })
    )
  )
}
