<h1 align="center">Async Context</h1>

Zero-dependency module for NestJS that allow to track context between async call

## Installation
```bash
npm install @nestjs-steroids/async-context
yarn add @nestjs-steroids/async-context
pnpm install @nestjs-steroids/async-context
```

## Usage
The first step is to register `AsyncContext` inside interceptor (or middleware)
> `src/async-context.interceptor.ts`
```typescript
import { randomUUID } from 'crypto'
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common'
import { AsyncContext } from '@nestjs-steroids/async-context'
import { Observable } from 'rxjs'

@Injectable()
export class AsyncContextInterceptor implements NestInterceptor {
  constructor (private readonly ac: AsyncContext<string, any>) {}

  intercept (context: ExecutionContext, next: CallHandler): Observable<any> {
    this.ac.register() // Important to call .register or .registerCallback (good for middleware)
    this.ac.set('traceId', randomUUID()) // Setting default value traceId
    return next.handle()
  }
}
```

The second step is to register `AsyncContextModule` and interceptor inside main module
> `src/app.module.ts`
```typescript
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { AsyncContextModule } from '@nestjs-steroids/async-context';
import { AsyncContextInterceptor } from './async-context.interceptor';

@Module({
  imports: [
    AsyncContextModule.forRoot()
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AsyncContextInterceptor,
    },
  ],
})
export class AppModule {}
```
The last step is to inject `AsyncContext` inside controller or service and use it
> ``src/app.controller.ts``
```typescript
import { Controller, Get, Logger } from '@nestjs/common'
import { AppService } from './app.service'
import { AsyncContext } from '@nestjs-steroids/async-context'

@Controller()
export class AppController {
  constructor (
    private readonly appService: AppService,
    private readonly asyncContext: AsyncContext<string, string>,
    private readonly logger: Logger
  ) {}

  @Get()
  getHello (): string {
    this.logger.log('AppController.getHello', this.asyncContext.get('traceId'))
    process.nextTick(() => {
      this.logger.log(
        'AppController.getHello -> nextTick',
        this.asyncContext.get('traceId')
      )
      setTimeout(() => {
        this.logger.log(
          'AppController.getHello -> nextTick -> setTimeout',
          this.asyncContext.get('traceId')
        )
      }, 0)
    })
    return this.appService.getHello()
  }
}

```

## Output example

```
[Nest] 141168  - 02/01/2022, 11:33:11 PM     LOG [NestFactory] Starting Nest application...
[Nest] 141168  - 02/01/2022, 11:33:11 PM     LOG [InstanceLoader] AsyncContextModule dependencies initialized +47ms
[Nest] 141168  - 02/01/2022, 11:33:11 PM     LOG [InstanceLoader] AppModule dependencies initialized +1ms
[Nest] 141168  - 02/01/2022, 11:33:11 PM     LOG [RoutesResolver] AppController {/}: +12ms
[Nest] 141168  - 02/01/2022, 11:33:11 PM     LOG [RouterExplorer] Mapped {/, GET} route +7ms
[Nest] 141168  - 02/01/2022, 11:33:11 PM     LOG [NestApplication] Nest application successfully started +5ms
[Nest] 141168  - 02/01/2022, 11:33:13 PM     LOG [7398d3ad-c246-4650-8dd0-f8f29238bdd7] AppController.getHello
[Nest] 141168  - 02/01/2022, 11:33:13 PM     LOG [7398d3ad-c246-4650-8dd0-f8f29238bdd7] AppController.getHello -> nextTick
[Nest] 141168  - 02/01/2022, 11:33:13 PM     LOG [7398d3ad-c246-4650-8dd0-f8f29238bdd7] AppController.getHello -> nextTick -> setTimeout
```

## API

### `AsyncContext` almost identical to native `Map` object
```typescript
class AsyncContext {
  // Clear all values from storage
  clear(): void;

  // Delete value by key from storage
  delete(key: K): boolean;

  // Iterate over storage
  forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void;

  // Get value from storage by key
  get(key: K): V | undefined;

  // Check if key exists in storage
  has(key: K): boolean;

  // Set value by key in storage
  set(key: K, value: V): this;

  // Get number of keys that stored in storage
  get size: number;

  // Register context, it's better to use this method inside the interceptor
  register(): void

  // Register context for a callback, it's better to use this inside the middleware
  registerCallback<R, TArgs extends any[]>(callback: (...args: TArgs) => R, ...args: TArgs): R

  // Unregister context
  unregister(): void
}

```
### `AsyncContextModule`
```typescript
interface AsyncContextModuleOptions {
  // Should register this module as global, default: true
  isGlobal?: boolean

  // In case if you need to provide custom value AsyncLocalStorage
  alsInstance?: AsyncLocalStorage<any>
}

class AsyncContextModule {
  static forRoot (options?: AsyncContextModuleOptions): DynamicModule
}
```

## Migration guide from V1
You need to replace `AsyncHooksModule` by `AsyncContextModule.forRoot()`

## License
[MIT](LICENSE.md)
