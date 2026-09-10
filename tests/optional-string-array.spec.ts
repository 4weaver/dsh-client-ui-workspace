/**
 * The fork-local copy of `optionalStringArray` must keep upstream's exact
 * contract, because it feeds the bundle-purity gate: `dsh.client.external`
 * decides which specifiers stay external, so a silently loosened validator
 * would let a cross-plugin value import inline a duplicate runtime instance.
 *
 * Run: npx vitest run tests/optional-string-array.spec.ts
 */
import { describe, expect, it } from 'vitest'
import { optionalStringArray } from '../build/optional-string-array.ts'

describe('optionalStringArray (fork copy)', () => {
  it('returns undefined for an absent field', () => {
    expect(optionalStringArray('pkg', 'dsh.client.external', undefined)).toBeUndefined()
  })

  it('returns the same array for a valid string array', () => {
    const value = ['react', '@deepseek-ai/dsh-client-store']
    expect(optionalStringArray('pkg', 'dsh.client.external', value)).toBe(value)
  })

  it('accepts an empty array', () => {
    expect(optionalStringArray('pkg', 'dsh.client.external', [])).toEqual([])
  })

  it('rejects a non-array', () => {
    expect(() => optionalStringArray('pkg', 'dsh.client.external', 'react'))
      .toThrow('client-modules: pkg dsh.client.external must be a string array')
  })

  it('rejects an array holding a non-string', () => {
    expect(() => optionalStringArray('pkg', 'dsh.client.external', ['react', 7]))
      .toThrow('client-modules: pkg dsh.client.external must be a string array')
  })
})
