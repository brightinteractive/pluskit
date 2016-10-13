import { Dispatch } from 'redux'
import { Selector, createSelector } from 'reselect'

export type Task = (dispatch: Dispatch<{}>, getState: () => {}) => Promise<void> | void

export interface QueryConstructor<T, Query> {
  new(selector: Selector<any, T>, task: Task): Query
}

export class Query<T> {
  static always<T>(value: T): Query<T> {
    return new Query(() => value, () => {})
  }

  protected selector: Selector<any, T>
  task: Task

  constructor(selector: Selector<any, T>, task: Task) {
    this.selector = selector
    this.task = task
  }

  select(dispatch: Dispatch<{}>, getState: () => {}): T {
    return this.selector(getState(), { dispatch })
  }

  pipe<T_, QueryType extends Query<T_>>(Constructor: QueryConstructor<T_, QueryType>, fn: (x: T) => T_): QueryType {
    return new Constructor(
      createSelector(
        this.selector,
        fn
      ),
      this.task
    )
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
    return this.pipe(Query, (value) => {
      if (typeof value === 'undefined') {
        throw new Error('Requried value not found')
      }

      return value
    })
  }

  withDefault<Default>(defaultValue: Default): Query<T | Default> {
    return this.pipe(Query,  (value) => {
      if (typeof value === 'undefined') {
        return defaultValue
      }

      return value
    })
  }
}

export class Many<T> extends Query<T[]> {
  map<T_>(fn: (xs: T) => T_): Many<T_> {
    return this.pipe(Many, x => x.map(fn))
  }

  filter(fn: (xs: T) => any): Many<T> {
    return this.pipe(Many, x => x.filter(fn))
  }

  reduce<T_>(fn: (memo: T_, xs: T) => any, start: T_): Query<T_> {
    return this.pipe(Query, x => x.reduce(fn, start))
  }

  first(): Maybe<T> {
    return this.pipe(Maybe, x => x[0])
  }
}

export interface DomainObjectConstructor<Data, DomainObject> {
  new(data: Data, dispatch: any): DomainObject
}
