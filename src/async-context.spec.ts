import { AsyncLocalStorage } from 'async_hooks'
import { AsyncContext } from './async-context'

let als: AsyncLocalStorage<Map<any, any>>
let ac: AsyncContext<any, any>

beforeEach(() => {
  als = new AsyncLocalStorage<Map<any, any>>()
  ac = new AsyncContext<any, any>(als)
})

afterEach(() => {
  ac.unregister()
})

describe('AsyncContext', () => {
  const error = new Error(
    'AsyncContext was not registered, call .register() or .registerCallback() before calling this method!'
  )

  describe('#als', () => {
    it('should expose AsyncLocalStorageInstance', () => {
      expect(ac.als === als).toBeTruthy()
    })
  })

  describe('#clear()', () => {
    it('should throw an error that AsyncContext was not registered', () => {
      expect(ac.clear.bind(ac)).toThrow(error)
    })

    it('should clear AsyncContext', () => {
      ac.register()
      ac.set('fizz', 24)
      ac.set('buzz', 42)

      ac.clear()

      expect(ac.has('fizz')).toBeFalsy()
      expect(ac.has('buzz')).toBeFalsy()
    })
  })

  describe('#delete()', () => {
    it('should throw an error that AsyncContext was not registered', () => {
      expect(ac.delete.bind(ac)).toThrow(error)
    })

    it('should clear AsyncContext', () => {
      ac.register()
      ac.set('fizz', 42)

      ac.delete('fizz')

      expect(ac.has('fizz')).toBeFalsy()
    })
  })

  describe('#forEach()', () => {
    it('should throw an error that AsyncContext was not registered', () => {
      expect(ac.forEach.bind(ac)).toThrow(error)
    })

    it('should call callback per each stored item', () => {
      const callback = jest.fn()

      ac.register()
      ac.set('fizz', 24)
      ac.set('buzz', 42)

      ac.forEach(callback)

      expect(callback).toHaveBeenNthCalledWith(1, 24, 'fizz', expect.any(Map))
      expect(callback).toHaveBeenNthCalledWith(2, 42, 'buzz', expect.any(Map))
    })
  })

  describe('#get()', () => {
    it('should throw an error that AsyncContext was not registered', () => {
      expect(ac.get.bind(ac)).toThrow(error)
    })

    it('should return value that stored in AsyncContext', () => {
      ac.register()

      ac.set('fizz', 42)

      expect(ac.get('fizz')).toStrictEqual(42)
    })
  })

  describe('#has()', () => {
    it('should throw an error that AsyncContext was not registered', () => {
      expect(ac.has.bind(ac)).toThrow(error)
    })

    it('should check if key exists in AsyncContext', () => {
      ac.register()

      ac.set('bar', 42)

      expect(ac.has('bar')).toBeTruthy()
      expect(ac.get('foo')).toBeFalsy()
    })
  })

  describe('#set()', () => {
    it('should throw an error that AsyncContext was not registered', () => {
      expect(ac.set.bind(ac)).toThrow(error)
    })

    it('should sets value in AsyncContext', () => {
      ac.register()

      ac.set('foo', 24)
      ac.set('bar', 42)

      expect(ac.get('foo')).toStrictEqual(24)
      expect(ac.get('bar')).toStrictEqual(42)
    })
  })

  describe('#size (getter)', () => {
    it('should throw an error that AsyncContext was not registered', () => {
      expect(() => ac.size).toThrow(error)
    })

    it('should return amount of keys that registered in AsyncContext', () => {
      ac.register()

      expect(ac.size).toStrictEqual(0)
      ac.set('foo', 24)
      expect(ac.size).toStrictEqual(1)
      ac.set('bar', 42)
      expect(ac.size).toStrictEqual(2)
    })
  })

  describe('#entries()', () => {
    it('should throw an error that AsyncContext was not registered', () => {
      expect(ac.entries.bind(ac)).toThrow(error)
    })

    it('should return entries that stored in AsyncContext', () => {
      ac.register()

      ac.set('foo', 24)
      ac.set('bar', 42)

      const iterator = ac.entries()

      expect(iterator.next()).toStrictEqual({ value: ['foo', 24], done: false })
      expect(iterator.next()).toStrictEqual({ value: ['bar', 42], done: false })
      expect(iterator.next()).toStrictEqual({ value: undefined, done: true })
    })
  })

  describe('#keys()', () => {
    it('should throw an error that AsyncContext was not registered', () => {
      expect(ac.keys.bind(ac)).toThrow(error)
    })

    it('should return keys that stored in AsyncContext', () => {
      ac.register()

      ac.set('foo', 24)
      ac.set('bar', 42)

      const iterator = ac.keys()

      expect(iterator.next()).toStrictEqual({ value: 'foo', done: false })
      expect(iterator.next()).toStrictEqual({ value: 'bar', done: false })
      expect(iterator.next()).toStrictEqual({ value: undefined, done: true })
    })
  })

  describe('#values()', () => {
    it('should throw an error that AsyncContext was not registered', () => {
      expect(ac.values.bind(ac)).toThrow(error)
    })

    it('should return values that stored in AsyncContext', () => {
      ac.register()

      ac.set('foo', 24)
      ac.set('bar', 42)

      const iterator = ac.values()

      expect(iterator.next()).toStrictEqual({ value: 24, done: false })
      expect(iterator.next()).toStrictEqual({ value: 42, done: false })
      expect(iterator.next()).toStrictEqual({ value: undefined, done: true })
    })
  })

  describe('#[Symbol.iterator]()', () => {
    it('should throw an error that AsyncContext was not registered', () => {
      expect(ac[Symbol.iterator].bind(ac)).toThrow(error)
    })

    it('should return iterator with entries that stored in AsyncContext', () => {
      ac.register()

      ac.set('foo', 24)
      ac.set('bar', 42)

      const iterator = ac[Symbol.iterator]()

      expect(iterator.next()).toStrictEqual({ value: ['foo', 24], done: false })
      expect(iterator.next()).toStrictEqual({ value: ['bar', 42], done: false })
      expect(iterator.next()).toStrictEqual({ value: undefined, done: true })
    })
  })

  describe('#[Symbol.toStringTag]', () => {
    it('should return [object AsyncContext]', () => {
      expect(ac[Symbol.toStringTag]).toStrictEqual('[object AsyncContext]')
    })
  })

  describe('#register()', () => {
    it('should register AsyncContext', () => {
      expect(ac.get.bind(ac)).toThrow(error)

      ac.register()

      expect(ac.get.bind(ac, 'foo')).not.toThrow(error)
    })
  })

  describe('#registerCallback()', () => {
    it('should register AsyncContext', () => {
      const payload = 'PAYLOAD_MESSAGE'

      expect(ac.get.bind(ac)).toThrow(error)

      const callbackData = ac.registerCallback<string, [string]>((data): string => {
        expect(ac.get.bind(ac, 'foo')).not.toThrow(error)
        expect(data).toStrictEqual(payload)
        return data
      }, payload)

      expect(callbackData).toStrictEqual(payload)
    })
  })

  describe('#unregister()', () => {
    it('should unregister AsyncContext', () => {
      expect(ac.get.bind(ac)).toThrow(error)

      ac.register()
      expect(ac.get.bind(ac, 'foo')).not.toThrow(error)

      ac.unregister()
      expect(ac.get.bind(ac)).toThrow(error)
    })
  })
})
