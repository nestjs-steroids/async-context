import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as asyncHooks from 'async_hooks';
import { AsyncHooksHelper } from './async-hooks-helper';
import { AsyncHooksStorage } from './async-hooks-storage';

export class AsyncContext implements OnModuleInit, OnModuleDestroy {
  private static instance: AsyncContext;

  private constructor(
    private readonly internalStorage: Map<number, any>,
    private readonly asyncHookRef: asyncHooks.AsyncHook,
  ) {}

  static getInstance(): AsyncContext {
    if (!this.instance) {
      this.initialize();
    }
    return this.instance;
  }

  onModuleInit() {
    this.asyncHookRef.enable();
  }

  onModuleDestroy() {
    this.asyncHookRef.disable();
  }

  set<TKey = any, TValue = any>(key: TKey, value: TValue) {
    const store = this.getAsyncStorage();
    store.set(key, value);
  }

  get<TKey = any, TReturnValue = any>(key: TKey): TReturnValue {
    const store = this.getAsyncStorage();
    return store.get(key) as TReturnValue;
  }

  register() {
    const eid = asyncHooks.executionAsyncId();
    this.internalStorage.set(eid, new Map());
  }

  private getAsyncStorage(): Map<unknown, unknown> {
    const eid = asyncHooks.executionAsyncId();
    const state = this.internalStorage.get(eid);
    if (!state) {
      throw new Error(
        `Async ID (${eid}) is not registered within internal cache.`,
      );
    }
    return state;
  }

  private static initialize() {
    const asyncHooksStorage = new AsyncHooksStorage();
    const asyncHook = AsyncHooksHelper.createHooks(asyncHooksStorage);
    const storage = asyncHooksStorage.getInternalStorage();

    this.instance = new AsyncContext(storage, asyncHook);
  }
}
