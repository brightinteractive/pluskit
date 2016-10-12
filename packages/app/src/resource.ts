import { assign, omit } from 'lodash'

import { createSelector } from 'reselect'
import { Maybe, Many, Task } from './query'

export interface Remote<PrimaryKey, Record, Queries> {
  query?: (...queries: Queries[]) => Promise<Record[]>
  get?: (primaryKey: PrimaryKey) => Promise<Record>

  create?: (record: Record) => Promise<PrimaryKey>
  update?: (record: Record) => Promise<void>

  delete?: (primaryKey: PrimaryKey) => Promise<void>
}

export class Resource<Record extends PrimaryKey, PrimaryKey extends {}> {
  protected name: string
  protected primaryKey: PrimaryKeyFn<PrimaryKey>
  protected remote: Remote<PrimaryKey, Record, never>

  constructor(name: string, primaryKey: PrimaryKeyFn<PrimaryKey>, remote: Remote<PrimaryKey, Record, never> = {}) {
    this.name = name
    this.primaryKey = primaryKey
    this.remote = remote
  }

  sync(remoteResource: Remote<PrimaryKey, Record, {}>) {
    return new Resource(this.name, this.primaryKey, remoteResource)
  }

// Selectors

  get(key: PrimaryKey): Maybe<Record> {
    return new Maybe(
      createSelector(
        (state: any) => state[this.name],
        (state: any) => state[this.primaryKey(key)]
      ),
      this.fetch(key)
    )
  }

  getAll(): Many<Record> {
    return new Many(
      createSelector(
        (state: any) => state[this.name],
        (state: any) => Object.keys(state).map(key => state[key])
      ),
      () => {}
    )
  }

// Actions

  /** Create a local record */
  create(record: Record) {
    return { type: `${this.name}:create:completed`, payload: record }
  }

  /** Update a local record */
  update(record: Record) {
    return { type: `${this.name}:update:completed`, payload: record }
  }

  /** Delete a resource from the local and the remote by ID */
  delete(key: PrimaryKey) {
    return { type: `${this.name}:delete:completed`, payload: key }
  }

  /** Get a resource from the remote by ID */
  fetch(primaryKey: PrimaryKey): Task {
    return (dispatch, getState) => {
      if (this.remote.get) {
        dispatch({ type: `${this.name}:fetch:started`, meta: { id: primaryKey } })

        return this.remote.get(primaryKey).then(
          payload => {
            dispatch({ type: `${this.name}:fetch:completed`, meta: { id: primaryKey }, payload })
          },
          payload => {
            dispatch({ type: `${this.name}:fetch:failed`, meta: { id: primaryKey }, payload })
          }
        )

      } else {
        return undefined
      }
    }
  }

// Reducers

  reducers(): { [key: string]: <State>(state: State | undefined, action: Action) => State } {
    return {
      [this.name]: (state: { [key: string]: Record } | undefined, action: Action) => {
        if (!state) state = {}

        switch (action.type) {
          case `${this.name}:create:completed`: {
            return assign({}, state, { [this.primaryKey(action.payload)]: action.payload })
          }
          case `${this.name}:update:completed`: {
            return assign({}, state, { [this.primaryKey(action.payload)]: action.payload })
          }
          case `${this.name}:delete:completed`: {
            return omit({}, state, this.primaryKey(action.payload))
          }
          case `${this.name}:fetch:completed`: {
            return assign({}, state, { [this.primaryKey(action.payload)]: undefined })
          }
          default: return state
        }
      }
    }
  }
}

export type PrimaryKeyFn<Index> = (r: Index) => string
export interface Action {
  type: string
  meta: any
  payload: any
}
