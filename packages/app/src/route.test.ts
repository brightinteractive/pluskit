import { expect } from 'chai'
import { AnyRoute } from './route'
import { nestedRoutes } from './util'

describe('route', () => {
  it('should normalize path segment', () => {
    expect(nestedRoutes({ path: 'foo' }).path).to.eql('foo')
    expect(nestedRoutes({ path: '/foo/' }).path).to.eql('foo')
  })

  it('should return parents', () => {
    const routes = [
      { path: 'foo' },
      { path: 'bar' },
      { path: 'baz' }
    ]

    const leaf = nestedRoutes.apply(undefined, routes)
    expect(leaf.parents().map((x: AnyRoute) => x.path)).to.eql(routes.map(x => x.path))
  })

  it('should return routename', () => {
    expect(nestedRoutes({ path: 'foo' }).routename()).to.eql('/foo')
    expect(nestedRoutes(
      { path: 'foo' },
      { path: 'bar' },
    ).routename()).to.eql('/foo/bar')
    expect(nestedRoutes(
      { path: '/bar/:z' },
    ).routename()).to.eql('/bar/:z')
  })

  it('should return pathname with interpolated route params', () => {
    expect(
      nestedRoutes({ path: 'foo/:param', params: { paramVar: 'param' } })
        .pathname({ paramVar: 'bar'})
    ).to.eql('/foo/bar')

    expect(
      nestedRoutes(
          { path: 'foo/:param1', params: { param1Var: 'param1' } },
          { path: ':param2', params: { param2Var: 'param2' } },
        )
        .pathname({ param1Var: 'bar', param2Var: 'baz' })
    ).to.eql('/foo/bar/baz')
  })
})
