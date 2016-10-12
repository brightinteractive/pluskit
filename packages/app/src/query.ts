import { Dispatch } from 'redux'
import { Selector, createSelector } from 'reselect'

export type Task = (dispatch: Dispatch<{}>, getState: () => {}) => Promise<void> | void

export class Query<T> {
  protected selector: Selector<any, T>
  task: Task

  constructor(selector: Selector<any, T>, task: Task) {
    this.select = selector
    this.task = task
  }

  select(dispatch: Dispatch<{}>, getState: () => {}): T {
    return this.selector(getState(), { dispatch })
  }

  as<T_>(DomainObject: DomainObjectConstructor<T, T_>): Query<T_> {
    return new Query<T_>(
      createSelector(
        this.selector,
        (_: never, params: any) => params.dispatch,
        (data: T, dispatcher: Dispatch<{}>) => new DomainObject(data, dispatcher)
      ),
      this.task
    )
  }
}

export class Maybe<T> extends Query<T | undefined> {
  required() {
    return new Query(
      createSelector(
        this.selector,
        (value) => {
          if (typeof value === 'undefined') {
            throw new Error('Requried value not found')
          }

          return value
        },
      ),
      this.task
    )
  }

  withDefault<Default>(defaultValue: Default): Query<T | Default> {
    return new Query(
      createSelector(
        this.selector,
        (value) => {
          if (typeof value === 'undefined') {
            return defaultValue
          }

          return value
        },
      ),
      this.task
    )
  }
}

export class Many<T> extends Query<T[]> {
  map<T_>(fn: (xs: T) => T_): Many<T_> {
    return new Many(
      createSelector(
        this.selector,
        x => x.map(fn)
      ),
      this.task
    )
  }

  filter(fn: (xs: T) => any): Many<T> {
    return new Many(
      createSelector(
        this.selector,
        x => x.filter(fn)
      ),
      this.task
    )
  }

  reduce<T_>(fn: (memo: T_, xs: T) => any, start: T_): Query<T_> {
    return new Query(
      createSelector(
        this.selector,
        x => x.reduce(fn, start)
      ),
      this.task
    )
  }

  first(): Maybe<T> {
    return new Maybe(
      createSelector(
        this.selector,
        x => x[0]
      ),
      this.task
    )
  }
}

export interface DomainObjectConstructor<Data, DomainObject> {
  new(data: Data, dispatch: any): DomainObject
}
