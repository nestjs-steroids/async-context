import { OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import * as asyncHooks from 'async_hooks'
import { AsyncHooksHelper } from './async-hooks-helper'
import { AsyncHooksStorage } from './async-hooks-storage'
import {
  AsyncContextStorageData,
  AsyncStorageMap
} from './async-context.interfaces'

export class AsyncContext<
  T extends AsyncContextStorageData = AsyncContextStorageData,
  M extends AsyncStorageMap = AsyncStorageMap
> implements OnModuleInit, OnModuleDestroy {
  private static instance: AsyncContext;

  private constructor (
    private readonly internalStorage: M,
    private readonly asyncHookRef: asyncHooks.AsyncHook
  ) {}

  static getInstance (): AsyncContext {
    if (this.instance === undefined) {
      this.initialize()
    }
    return this.instance
  }

  onModuleInit (): void {
    this.asyncHookRef.enable()
  }

  onModuleDestroy (): void {
    this.asyncHookRef.disable()
  }

  set<K extends keyof T>(key: K, value: T[K]): void {
    const store = this.getAsyncStorage()
    store.set(key, value)
  }

  get (key: keyof T): T[keyof T] | undefined {
    const store = this.getAsyncStorage()
    return store.get(key)
  }

  register (): void {
    const eid = asyncHooks.executionAsyncId()
    this.internalStorage.set(eid, new Map())
  }

  private getAsyncStorage<K extends keyof T>(): Map<K, T[K]> {
    const eid = asyncHooks.executionAsyncId()
    const state = this.internalStorage.get(eid)
    if (state === undefined) {
      throw new Error(
        `Async ID (${eid}) is not registered within internal cache.`
      )
    }
    return state as Map<K, T[K]>
  }

  private static initialize (): void {
    const asyncHooksStorage = new AsyncHooksStorage()
    const asyncHook = AsyncHooksHelper.createHooks(asyncHooksStorage)
    const storage = asyncHooksStorage.getInternalStorage()

    this.instance = new AsyncContext(storage, asyncHook)
  }
}
