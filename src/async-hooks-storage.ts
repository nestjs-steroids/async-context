import { KeyOfMap, AsyncStorageMap } from './async-context.interfaces'

export class AsyncHooksStorage<
  StorageMap extends AsyncStorageMap = AsyncStorageMap
> {
  constructor (private readonly asyncStorage = new Map() as StorageMap) {
    this.initialize()
  }

  get (triggerId: KeyOfMap<StorageMap>): unknown {
    return this.asyncStorage.get(triggerId)
  }

  has (triggerId: KeyOfMap<StorageMap>): boolean {
    return this.asyncStorage.has(triggerId)
  }

  inherit (asyncId: KeyOfMap<StorageMap>, triggerId: KeyOfMap<StorageMap>): void {
    const value = this.asyncStorage.get(triggerId)
    this.asyncStorage.set(asyncId, value)
  }

  delete (asyncId: KeyOfMap<StorageMap>): void {
    this.asyncStorage.delete(asyncId)
  }

  getInternalStorage (): StorageMap {
    return this.asyncStorage
  }

  private initialize (): void {
    const initialAsyncId = 1
    this.asyncStorage.set(initialAsyncId, new Map())
  }
}
