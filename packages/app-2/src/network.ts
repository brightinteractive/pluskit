import { Stream } from 'xstream'

export interface HTTPResource<T> {
  data: Stream<T | undefined>

  reload(): void
  put(x: T): void
  delete(): void
}

export interface HTTPResourceParams<T> {
  url: string
  validateResponse: (x: {}) => T
}

export function createResource<T>({ url, validateResponse }: HTTPResourceParams<T>): HTTPResource<T> {
  const data = Stream.createWithMemory<T | undefined>()
  const getData = () =>fetch(url)
    .then(validateStatus)
    .then(r => r.json())
    .then(validateResponse)
    .then(val => data.shamefullySendNext(val))

  getData()

  return {
    data,

    reload: getData,
    put(x: T) {
      fetch(url, {
          method: 'PUT',
          body: JSON.stringify(x)
        })
        .then(validateStatus)
        .then(() => data.shamefullySendNext(x))
    },
    delete() {
      fetch(url, {
        method: 'DELETE'
      })
      .then(validateStatus)
      .then(() => data.shamefullySendNext(undefined))
    }
  }
}

function validateStatus(r: Response): Response | Promise<Response> {
  if (r.status >= 300) {
    return r.text().then(message => Promise.reject(new Error(message)))

  } else {
    return r
  }
}
