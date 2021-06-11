import { KeyOfMap, AsyncStorageMap } from './async-context.interfaces';

export class AsyncHooksStorage<
  StorageMap extends AsyncStorageMap = AsyncStorageMap
> {
  constructor(private readonly asyncStorage = new Map() as StorageMap) {
    this.initialize();
  }

  get(triggerId: KeyOfMap<StorageMap>) {
    return this.asyncStorage.get(triggerId);
  }

  has(triggerId: KeyOfMap<StorageMap>) {
    return this.asyncStorage.has(triggerId);
  }

  inherit(asyncId: KeyOfMap<StorageMap>, triggerId: KeyOfMap<StorageMap>) {
    const value = this.asyncStorage.get(triggerId);
    this.asyncStorage.set(asyncId, value);
  }

  delete(asyncId: KeyOfMap<StorageMap>) {
    this.asyncStorage.delete(asyncId);
  }

  getInternalStorage() {
    return this.asyncStorage;
  }

  private initialize() {
    const initialAsyncId = 1;
    this.asyncStorage.set(initialAsyncId, new Map());
  }
}
