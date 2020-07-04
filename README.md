# Async Context

## Thinks TODO:
- [ ] Add fancy [badges](https://shields.io/)
- [ ] Setup CI/CD (Github Actions or Circle)
- [ ] Add tests

## Installation
```bash
npm install @nestjs-steroids/async-context
```

## Usage
### AsyncHooksModule
```typescript
import { Module } from '@nestjs/common';
import { AsyncHooksModule } from '@nestjs-steroids/async-context';

@Module({
  imports: [
    AsyncHooksModule
  ],
})
export class AppModule {}
```

### AsyncContext
```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AsyncContext } from '@nestjs-steroids/async-context';
import { v4 as uuid } from 'uuid';

@Injectable()
export class TraceMiddleware implements NestMiddleware {
  constructor(private readonly asyncHook: AsyncContext) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Register AsyncContext
    // Without registration accessing to AsyncContext (get or set methods), will throw an error
    this.asyncHook.register();
    // Putting up UUID string by key 'traceId'
    this.asyncHook.set<string, string>('traceId', uuid());
    // Retrieving value by key
    this.asyncContext.get<string, string>('traceId')
    next();
  }
}
```

## Example (traceId or requestId)

Let's track `traceId` in every log message.

First of all define trace interceptor than register async context

> **trace.interceptor.ts**
```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AsyncContext } from '@nestjs-steroids/async-context';
import { v4 as uuid } from 'uuid';

@Injectable()
export class TraceInterceptor implements NestInterceptor {
  constructor(private readonly asyncHook: AsyncContext) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    this.asyncHook.register(); // <-- Register async context
    this.asyncHook.set<string, string>('traceId', uuid()); // <-- Define traceId
    return next.handle();
  }
}
```

Then we need to register `AsyncHooksModule` and `TraceInterceptor`

> **app.module.ts**
```typescript
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Logger, Module } from '@nestjs/common';
import { AsyncHooksModule } from '@nestjs-steroids/async-context';
import { TraceInterceptor } from './trace.interceptor';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [AsyncHooksModule], // <-- Register AsyncHooksModule
  controllers: [AppController],
  providers: [
    {
      provide: Logger,
      useValue: new Logger(),
    },
    { // <-- Setup interceptor for entire module
      provide: APP_INTERCEPTOR,
      useClass: TraceInterceptor,
    },
    AppService,
  ],
})
export class AppModule {}
```

Last step, inject `AsyncContex` into controller, service, etc... and use it

> **app.controller.ts**
```typescript
import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { AsyncContext } from '@nestjs-steroids/async-context';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly asyncContext: AsyncContext, // <-- Inject AsyncContext
    private readonly logger: Logger,
  ) {}

  @Get()
  getHello(): string {
    this.logger.log(
      'AppController.getHello',
      this.asyncContext.get<string, string>('traceId'), // <-- Usage of AsyncContext
    );
    process.nextTick(() => {
      this.logger.log(
        'AppController.getHello -> nextTick',
        this.asyncContext.get<string, string>('traceId'),
      );
      setTimeout(() => {
        this.logger.log(
          'AppController.getHello -> nextTick -> setTimeout',
          this.asyncContext.get<string, string>('traceId'),
        );
      }, 0);
    });
    return this.appService.getHello();
  }
}
```

### Result example

```
[Nest] 30483   - 07/04/2020, 12:21:06 PM   [NestFactory] Starting Nest application...
[Nest] 30483   - 07/04/2020, 12:21:06 PM   [InstanceLoader] AsyncHooksModule dependencies initialized +8ms
[Nest] 30483   - 07/04/2020, 12:21:06 PM   [InstanceLoader] AppModule dependencies initialized +0ms
[Nest] 30483   - 07/04/2020, 12:21:06 PM   [RoutesResolver] AppController {}: +3ms
[Nest] 30483   - 07/04/2020, 12:21:06 PM   [RouterExplorer] Mapped {, GET} route +1ms
[Nest] 30483   - 07/04/2020, 12:21:06 PM   [NestApplication] Nest application successfully started +2ms
[Nest] 30483   - 07/04/2020, 12:21:11 PM   [1cf8ad02-7bae-4fa7-963d-66238c94abd3] AppController.getHello
[Nest] 30483   - 07/04/2020, 12:21:11 PM   [1cf8ad02-7bae-4fa7-963d-66238c94abd3] AppController.getHello -> nextTick
[Nest] 30483   - 07/04/2020, 12:21:11 PM   [1cf8ad02-7bae-4fa7-963d-66238c94abd3] AppController.getHello -> nextTick -> setTimeout
```

## License
[MIT](LICENSE.md)