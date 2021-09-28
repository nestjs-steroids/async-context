import { createHook, HookCallbacks } from 'async_hooks';
import { AsyncHooksStorage } from './async-hooks-storage';

export class AsyncHooksHelper {
  static createHooks(storage: AsyncHooksStorage) {
    function init(asyncId: number, type: string, triggerId: number) {
      if (storage.has(triggerId)) {
        storage.inherit(asyncId, triggerId);
      }
    }

    function destroy(asyncId: number) {
      storage.delete(asyncId);
    }

    return createHook({
      init,
      destroy,
    } as HookCallbacks);
  }
}
