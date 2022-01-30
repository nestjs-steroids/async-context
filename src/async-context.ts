import { AsyncLocalStorage } from 'async_hooks'

export class AsyncContext<K, V> implements Map<K, V> {
  constructor (readonly als: AsyncLocalStorage<Map<K, V>>) {}

  private getStore (): Map<K, V> {
    const store = this.als.getStore()

    if (store === undefined) {
      throw new Error(
        'AsyncContext was not registered, call .register() or .registerCallback() before calling this method!'
      )
    }

    return store
  }

  clear (): void {
    return this.getStore().clear()
  }

  delete (key: K): boolean {
    return this.getStore().delete(key)
  }

  forEach (callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
    return this.getStore().forEach(callbackfn, thisArg)
  }

  get (key: K): V | undefined {
    return this.getStore().get(key)
  }

  has (key: K): boolean {
    return this.getStore().has(key)
  }

  set (key: K, value: V): this {
    this.getStore().set(key, value)
    return this
  }

  get size (): number {
    return this.getStore().size
  }

  entries (): IterableIterator<[K, V]> {
    return this.getStore().entries()
  }

  keys (): IterableIterator<K> {
    return this.getStore().keys()
  }

  values (): IterableIterator<V> {
    return this.getStore().values()
  }

  [Symbol.iterator] (): IterableIterator<[K, V]> {
    return this.getStore()[Symbol.iterator]()
  }

  [Symbol.toStringTag]: string = '[object AsyncContext]'

  register (): void {
    this.als.enterWith(new Map())
  }

  registerCallback<TArgs extends any[]>(callback: (...args: TArgs) => unknown, ...args: TArgs): void {
    this.als.run(new Map(), callback, ...args)
  }

  unregister (): void {
    this.als.disable()
  }
}
