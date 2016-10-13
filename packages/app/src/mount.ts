import { Store, combineReducers } from 'redux'
import { omit, flatMap, assign, compact, clone } from 'lodash'

import { RouteMapper } from './matcher'
import { AnyRoute, BindOpts } from './route'

export interface MountRouteOpts {
  params: { [key: string]: string }
  mapper: RouteMapper
  routeState: MountedRouteState
  addedRoutes: string[]
  removedRoutes: string[]
  store: Store<{}>
  queryParams: { [key: string]: string }
}

export interface MountedRouteState {
  [key: string]: MountedRoute
}

export interface MountedRoute {
  params: { [key: string]: string }
  routeObject: AnyRoute
  parentRoute?: string
}

export function mountRoutes({ store, mapper, routeState, addedRoutes, removedRoutes, params, queryParams }: MountRouteOpts): Promise<MountedRouteState> {
  // Remove the old route objects
  const state = omit<MountedRouteState, any>(routeState, removedRoutes)

  // Add the new route objects
  addedRoutes.forEach(r => {
    const routeObject = mapper.getRoute(r)
    state[r] = {
      params: clone(params),
      routeObject,
      parentRoute: routeObject.parent && routeObject.parent.routename()
    }
  })

  // Replace the store reducer with reducers for the new route
  const reducers = Object.keys(state).map(key => state[key].routeObject.reducers())
  const reducerMap = assign.apply(undefined, reducers)

  if (Object.keys(reducerMap).length === 0) {
    store.replaceReducer((x: {}) => x || {})

  } else {
    store.replaceReducer(combineReducers(reducerMap))
  }

  // Dispatch the tasks required to initialize the new route
  return Promise.all(
      flatMap(
        addedRoutes, r => mapper.getRoute(r).tasks.map(task => store.dispatch(task))
      )
    )
    .then(() => {
      // Then step through data dependencies to load data
      const dataDependencies = flatMap(addedRoutes.map(id => mapper.getRoute(id)), (route: AnyRoute) => route.bindings.map(binding => ({ id: route.routename(), binding })))
      return step(dataDependencies, params)
        .then(() => state)
    })

  function step(tasks: BoundRoute[], params: {}): Promise<void> {
    const shouldKeep = (t: BoundRoute) => {
      const prerequisites = t.binding.prerequisites(params) as any
      return !Object.keys(prerequisites).some(key => typeof prerequisites[key] === 'undefined')
    }

    // Split remaining tasks into those where we do or dont have the prerequisite data
    const currentTasks = tasks.filter(shouldKeep)
    const remainingTasks = tasks.filter(x => !shouldKeep(x))

    if (currentTasks.length === 0 && remainingTasks.length === 0) {
      return Promise.resolve()
    }

    if (currentTasks.length === 0 && remainingTasks.length !== 0) {
      throw new Error(`Prerequisite data is unavailable for tasks ${remainingTasks}`)
    }

    // Dispatch the tasks where we do
    const stepTasks = currentTasks.map(t => {
      const query = t.binding.query(t.binding.prerequisites(params), queryParams)
      if (!query.task) return undefined

      return Promise.resolve(query.task((x: any) => store.dispatch(x), () => store.getState()))
        .then(q => query.select((x: any) => store.dispatch(x), () => store.getState()))
        .then(s => t.binding.bindTo(s))
    })

    // When all tasks in this stage have completed, recurse into the tasks
    // we didn't previously have prerequisite data for
    return Promise.all(compact<any>(stepTasks)).then(params => {
      const mergedParams = assign.apply(undefined, [{}].concat(params))
      return step(remainingTasks, mergedParams)
    })
  }
}

interface BoundRoute { id: string, binding: BindOpts<{}, {}, {}, {}, {}> }
