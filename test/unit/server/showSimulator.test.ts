import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import showsService from '../../../server/services/shows'
import showSimulator from '../../../server/services/showSimulator'

const pickIndex = vi.hoisted(() => ({ value: 0 }))

vi.mock('../../../server/utils/randomPick', () => ({
  default: (fns: Array<(...args: unknown[]) => unknown>) => {
    return (...args: unknown[]) => fns[pickIndex.value]!(...args)
  }
}))

describe('showSimulator', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    showsService.resetForTests()
    showSimulator.stopAll()
    pickIndex.value = 0
  })

  afterEach(() => {
    showSimulator.stopAll()
    showsService.resetForTests()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('does nothing for unknown shows', () => {
    showSimulator.ensure('missing')
    expect(vi.getTimerCount()).toBe(0)
  })

  it('starts an interval that updates price', () => {
    const show = showsService.listShows()[0]!
    vi.spyOn(Math, 'random').mockReturnValue(0.9)

    showSimulator.ensure(show.id)
    showSimulator.ensure(show.id)
    expect(vi.getTimerCount()).toBe(1)

    vi.advanceTimersByTime(10_000)

    const updated = showsService.getShow(show.id)!
    expect(updated.newPrice).toBeDefined()
    expect(updated.newPrice).not.toBe(show.price)
  })

  it('decrements remaining when the remaining tick is selected', () => {
    pickIndex.value = 1
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const show = showsService.listShows()[0]!
    const remaining = show.remaining

    showSimulator.ensure(show.id)
    vi.advanceTimersByTime(4000)

    expect(showsService.getShow(show.id)?.remaining).toBe(remaining - 1)
  })

  it('can stop a running simulator', () => {
    const show = showsService.listShows()[0]!
    showSimulator.ensure(show.id)
    expect(vi.getTimerCount()).toBe(1)
    showSimulator.stop(show.id)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('stopAll clears every simulator', () => {
    const [a, b] = showsService.listShows()
    showSimulator.ensure(a!.id)
    showSimulator.ensure(b!.id)
    expect(vi.getTimerCount()).toBe(2)
    showSimulator.stopAll()
    expect(vi.getTimerCount()).toBe(0)
  })
})
