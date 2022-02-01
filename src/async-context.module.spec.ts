import { AsyncLocalStorage } from 'async_hooks'
import { DynamicModule, ValueProvider } from '@nestjs/common'
import { AsyncContextModule } from './async-context.module'
import { AsyncContext } from './async-context'

function getProviderValueFromModule <T> (acm: DynamicModule): T | undefined {
  const provider = (acm.providers ?? [])[0] as ValueProvider<T> | undefined

  if (provider === undefined) {
    return undefined
  }

  return provider.useValue
}

describe('AsyncContextModule', () => {
  describe('#forRoot', () => {
    it("should use 'true' as default value for 'global' module property", () => {
      const acm = AsyncContextModule.forRoot()
      expect(acm.global).toStrictEqual(true)
    })

    it("should use 'isGlobal' option for 'global' module property", () => {
      const acm = AsyncContextModule.forRoot({ isGlobal: false })
      expect(acm.global).toStrictEqual(false)
    })

    it("should use new instance of 'AsyncLocalStorage' as default value for 'AsyncContext' class", () => {
      const firstAC = getProviderValueFromModule<AsyncContext<any, any>>(AsyncContextModule.forRoot())
      const secondAC = getProviderValueFromModule<AsyncContext<any, any>>(AsyncContextModule.forRoot())
      expect(firstAC?.als).toBeDefined()
      expect(secondAC?.als).toBeDefined()
      expect(firstAC?.als === secondAC?.als).toBeFalsy()
    })

    it("should use instance of 'AsyncLocalStorage' as value for 'AsyncContext' class", () => {
      const alsInstance = new AsyncLocalStorage<any>()
      const acm = AsyncContextModule.forRoot({ alsInstance })
      const asyncContext = getProviderValueFromModule<AsyncContext<any, any>>(acm)
      expect(asyncContext?.als).toBeDefined()
      expect(alsInstance === asyncContext?.als).toBeTruthy()
    })
  })
})
