describe('Expose public API in index.ts', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const importResult = require('./index')

  it("should expose 'AsyncContext' class", () => {
    expect(importResult.AsyncContext).toBeDefined()
  })

  it("should expose 'AsyncContextModule' class", () => {
    expect(importResult.AsyncContextModule).toBeDefined()
  })
})
