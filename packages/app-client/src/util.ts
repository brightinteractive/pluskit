import { Stream } from 'xstream'

export function toPromise<T>(stream: Stream<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    stream.addListener({
      next: x => resolve(x),
      complete: () => reject(new Error('Empty stream')),
      error: reject
    })
  })
}

export const popState$ = Stream.create<string>({
  start(listener) {
    window.onpopstate = (ev) => listener.next(location.href)
  },
  stop() {}
})

export function toStream<T>(x: Stream<T> | T): Stream<T> {
  return (x instanceof Stream) ? x : Stream.fromArray([x])
}
