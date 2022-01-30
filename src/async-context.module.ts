import { AsyncLocalStorage } from 'async_hooks'
import { DynamicModule } from '@nestjs/common'
import { AsyncContext } from './async-context'

interface AsyncContextModuleOptions {
  isGlobal?: boolean
  alsInstance?: AsyncLocalStorage<any>
}

export class AsyncContextModule {
  static forRoot (options?: AsyncContextModuleOptions): DynamicModule {
    const isGlobal = options?.isGlobal ?? true
    const alsInstance = options?.alsInstance ?? new AsyncLocalStorage()

    return {
      module: AsyncContextModule,
      global: isGlobal,
      providers: [{ provide: AsyncContext, useValue: new AsyncContext(alsInstance) }],
      exports: [AsyncContext]
    }
  }
}
