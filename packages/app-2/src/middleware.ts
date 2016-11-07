import { MountResponse } from './response'
import { MountRequest } from './request'

/**
 * The bulding block of the mount pipeline.
 *
 * Given a request, returns a response, optionally passing the request
 * and response down the middleware chain and optionally transforming
 * the response from the next middleware.
 */
export type Middleware<Params, Req1 extends MountRequest<Params>, Req2 extends MountRequest>
= (request: Req1, next: NextFn<Req2>) => Promise<MountResponse>

export type GenericMiddleware
= <Params, Req1 extends MountRequest<Params>, Req2 extends MountRequest<Params>>
  (request: Req1, next: NextFn<Req2>) => Promise<MountResponse>

/** Represents the next function in the middleware chain */
export type NextFn<Req extends MountRequest>
= (request: Req) => Promise<MountResponse>


/**
 * Sequence 2 functions in the middleware chain
 */
export function compose<
  R1 extends MountRequest,
  R2 extends MountRequest,
  R3 extends MountRequest
>
(lhs: Middleware<R1, R2>, rhs: Middleware<R2, R3>): Middleware<R1, R3> {
  return (req1, next) => (
    lhs(req1, req2 => rhs(req2, next))
  )
}


/**
 * Terminate the middleware sequence
 */
export function terminate(): NextFn<MountRequest> {
  return () => Promise.reject(new Error('No renderer defined!'))
}


/**
 * Passthrough middleware.
 */
export function noop(): GenericMiddleware {
  return <Req extends MountRequest>(req: Req, next: NextFn<Req>) => next(req)
}
