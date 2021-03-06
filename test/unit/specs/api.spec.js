import Router from '../../../src/index'

describe('router.onReady', () => {
  it('should work', done => {
    const calls = []

    const router = new Router({
      mode: 'abstract',
      routes: [
        {
          path: '/a',
          component: {
            name: 'A',
            beforeRouteEnter: (to, from, next) => {
              setTimeout(() => {
                calls.push(2)
                next()
              }, 1)
            }
          }
        }
      ]
    })

    router.beforeEach((to, from, next) => {
      setTimeout(() => {
        calls.push(1)
        next()
      }, 1)
    })

    router.onReady(() => {
      expect(calls).toEqual([1, 2])
      // sync call when already ready
      router.onReady(() => {
        calls.push(3)
      })
      expect(calls).toEqual([1, 2, 3])
      done()
    })

    router.push('/a')
    expect(calls).toEqual([])
  })
})

describe('router.addRoutes', () => {
  it('should work', () => {
    const router = new Router({
      mode: 'abstract',
      routes: [
        { path: '/a', component: { name: 'A' }}
      ]
    })

    router.push('/a')
    let components = router.getMatchedComponents()
    expect(components.length).toBe(1)
    expect(components[0].name).toBe('A')

    router.push('/b')
    components = router.getMatchedComponents()
    expect(components.length).toBe(0)

    router.addRoutes([
      { path: '/b', component: { name: 'B' }}
    ])
    components = router.getMatchedComponents()
    expect(components.length).toBe(1)
    expect(components[0].name).toBe('B')

    // make sure it preserves previous routes
    router.push('/a')
    components = router.getMatchedComponents()
    expect(components.length).toBe(1)
    expect(components[0].name).toBe('A')
  })
})

describe('router.replaceRoutes', () => {
  it('should replace routes', () => {
    const routes1 = [
      { path: '/a', component: { name: 'A' }}
    ]
    const routes2 = [
      { path: '/b', component: { name: 'B' }}
    ]
    const router = new Router({
      mode: 'abstract',
      routes: routes1
    })

    router.push('/a')
    let components = router.getMatchedComponents()
    expect(components.length).toBe(1)
    expect(components[0].name).toBe('A')

    router.push('/b')
    components = router.getMatchedComponents()
    expect(components.length).toBe(0)

    router.replaceRoutes(routes2)

    // /b should be added
    components = router.getMatchedComponents()
    expect(components.length).toBe(1)
    expect(components[0].name).toBe('B')

    // /a should be removed
    router.push('/a')
    components = router.getMatchedComponents()
    expect(components.length).toBe(0)

    router.push('/b')
    components = router.getMatchedComponents()
    expect(components.length).toBe(1)
    expect(components[0].name).toBe('B')

    router.replaceRoutes(routes1)

    // /b should be removed
    components = router.getMatchedComponents()
    expect(components.length).toBe(0)
  })

  it('should remove all routes if empty array of routes passed', () => {
    const router = new Router({
      mode: 'abstract',
      routes: [
        { path: '/a', component: { name: 'A' }},
        { path: '/b', component: { name: 'B' }}
      ]
    })

    router.push('/a')
    let components = router.getMatchedComponents()
    expect(components.length).toBe(1)
    expect(components[0].name).toBe('A')

    router.push('/b')
    components = router.getMatchedComponents()
    expect(components.length).toBe(1)
    expect(components[0].name).toBe('B')

    router.replaceRoutes([])

    components = router.getMatchedComponents()
    expect(components.length).toBe(0)

    router.push('/b')
    components = router.getMatchedComponents()
    expect(components.length).toBe(0)
  })

  it('should update components of routes with same path', () => {
    const router = new Router({
      mode: 'abstract',
      routes: [
        { path: '/a', component: { name: 'A' }}
      ]
    })

    router.push('/a')
    let components = router.getMatchedComponents()
    expect(components.length).toBe(1)
    expect(components[0].name).toBe('A')

    router.replaceRoutes([
      { path: '/a', component: { name: 'B' }}
    ])

    components = router.getMatchedComponents()
    expect(components.length).toBe(1)
    expect(components[0].name).toBe('B')
  })
})

describe('router.push/replace callbacks', () => {
  let calls = []
  let router, spy1, spy2

  const Foo = {
    beforeRouteEnter (to, from, next) {
      calls.push(3)
      setTimeout(() => {
        calls.push(4)
        next()
      }, 1)
    }
  }

  beforeEach(() => {
    calls = []
    spy1 = jasmine.createSpy('complete')
    spy2 = jasmine.createSpy('abort')

    router = new Router({
      routes: [
        { path: '/foo', component: Foo }
      ]
    })

    router.beforeEach((to, from, next) => {
      calls.push(1)
      setTimeout(() => {
        calls.push(2)
        next()
      }, 1)
    })
  })

  it('push complete', done => {
    router.push('/foo', () => {
      expect(calls).toEqual([1, 2, 3, 4])
      done()
    })
  })

  it('push abort', done => {
    router.push('/foo', spy1, spy2)
    router.push('/bar', () => {
      expect(calls).toEqual([1, 1, 2, 2])
      expect(spy1).not.toHaveBeenCalled()
      expect(spy2).toHaveBeenCalled()
      done()
    })
  })

  it('replace complete', done => {
    router.replace('/foo', () => {
      expect(calls).toEqual([1, 2, 3, 4])
      done()
    })
  })

  it('replace abort', done => {
    router.replace('/foo', spy1, spy2)
    router.replace('/bar', () => {
      expect(calls).toEqual([1, 1, 2, 2])
      expect(spy1).not.toHaveBeenCalled()
      expect(spy2).toHaveBeenCalled()
      done()
    })
  })
})
