import { LinkTarget } from './link'

export interface HttpError extends Error {
  status?: number
  redirect?: LinkTarget<{}>
}

export class Redirect extends Error implements HttpError {
  status: number
  redirect: LinkTarget<{}>

  constructor(location: LinkTarget<{}>, status: number = 302) {
    super(`${status} redirect required to ${location}`)
    this.status = status
    this.redirect = location
  }
}

export class NotFound extends Error implements HttpError {
  status: number

  constructor(message: string = 'Not found') {
    super(message)
    this.status = 404
  }
}
