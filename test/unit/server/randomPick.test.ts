import { afterEach, describe, expect, it, vi } from 'vitest'
import randomPick from '../../../server/utils/randomPick'

describe('randomPick', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('invokes the function selected by Math.random', () => {
    const a = vi.fn(() => 'a')
    const b = vi.fn(() => 'b')
    vi.spyOn(Math, 'random').mockReturnValue(0.6)

    const picked = randomPick([a, b])
    expect(picked()).toBe('b')
    expect(a).not.toHaveBeenCalled()
    expect(b).toHaveBeenCalledOnce()
  })

  it('forwards arguments to the selected function', () => {
    const fn = vi.fn((x: number, y: string) => `${x}-${y}`)
    vi.spyOn(Math, 'random').mockReturnValue(0)

    const picked = randomPick([fn])
    expect(picked(3, 'ok')).toBe('3-ok')
    expect(fn).toHaveBeenCalledWith(3, 'ok')
  })
})
