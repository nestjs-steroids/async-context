import { AsyncHook, createHook, HookCallbacks } from 'async_hooks'
import { AsyncHooksStorage } from './async-hooks-storage'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AsyncHooksHelper {
  static createHooks (storage: AsyncHooksStorage): AsyncHook {
    function init (asyncId: number, type: string, triggerId: number): void {
      if (storage.has(triggerId)) {
        storage.inherit(asyncId, triggerId)
      }
    }

    function destroy (asyncId: number): void {
      storage.delete(asyncId)
    }

    const callbacks: HookCallbacks = { init, destroy }

    return createHook(callbacks)
  }
}
