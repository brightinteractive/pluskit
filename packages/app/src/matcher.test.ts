import { expect } from 'chai'

import { nestedRoutes } from './util'
import { RouteMapper } from './matcher'

describe('RouteMapper', () => {
  it('should match most specific route', () => {
    expect(
      new RouteMapper([
        nestedRoutes(
          { path: 'foo' },
          { path: ':a', params: { p: 'a' } }
        ),
        nestedRoutes(
          { path: 'foo' }
        )
      ]).match('/foo/x')
    ).to.eql({
      ids: ['/foo', '/foo/:a'],
      params: { a: 'x' }
    })
  })

  it('should remove route + children when a routename changes', () => {
    expect(
      new RouteMapper([]).removedRoutes(
        { a: { params: {} }, b: { params: {} }, c: { params: {} } },
        {
          ids: ['a'],
          params: {}
        }
      )
    ).to.eql(['b', 'c'])

    expect(
      new RouteMapper([]).removedRoutes(
        { a: { params: {} }, b: { params: {} }, c: { params: {} } },
        {
          ids: ['a', 'd'],
          params: {}
        }
      )
    ).to.eql(['b', 'c'])
  })

  it('should remove route + children when route params change', () => {
    expect(
      new RouteMapper([]).removedRoutes(
        { a: { params: { aParam: '1' } }, b: { params: { bParam: '2' } }, c: { params: {} } },
        {
          ids: ['a', 'b', 'c'],
          params: { aParam: '1', bParam: '2!' }
        }
      )
    ).to.eql(['b', 'c'])
  })

  it('should add a route when its routename is unknown', () => {
    expect(
      new RouteMapper([]).addedRoutes(
        { a: { params: {} }, b: { params: {} }, c: { params: {} } },
        {
          ids: ['a', 'b', 'c', 'd'],
          params: {}
        }
      )
    ).to.eql(['d'])
  })
})
