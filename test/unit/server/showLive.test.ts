import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import showsService from '../../../server/services/shows'
import showSimulator from '../../../server/services/showSimulator'
import subscribeShow, { resetShowLiveForTests } from '../../../server/services/showLive'

describe('subscribeShow', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    showsService.resetForTests()
    showSimulator.stopAll()
    resetShowLiveForTests()
  })

  afterEach(() => {
    resetShowLiveForTests()
    showSimulator.stopAll()
    showsService.resetForTests()
    vi.useRealTimers()
  })

  it('returns a noop unsubscribe for unknown shows', () => {
    const cb = vi.fn()
    const unsubscribe = subscribeShow('missing', cb)
    expect(cb).not.toHaveBeenCalled()
    expect(() => unsubscribe()).not.toThrow()
  })

  it('invokes the listener immediately with the current update', () => {
    const show = showsService.listShows()[0]!
    const cb = vi.fn()

    subscribeShow(show.id, cb)

    expect(cb).toHaveBeenCalledWith({
      remaining: show.remaining,
      price: show.price,
      newPrice: show.newPrice
    })
  })

  it('fans out show updates to listeners', () => {
    const show = showsService.listShows()[0]!
    const cb = vi.fn()
    subscribeShow(show.id, cb)
    cb.mockClear()

    showsService.updateShow(show.id, { remaining: 1, newPrice: 55 })

    expect(cb).toHaveBeenCalledWith({
      remaining: 1,
      price: show.price,
      newPrice: 55
    })
  })

  it('stops the simulator when the last listener unsubscribes', () => {
    const show = showsService.listShows()[0]!
    const stopSpy = vi.spyOn(showSimulator, 'stop')
    const unsubscribe = subscribeShow(show.id, vi.fn())

    unsubscribe()

    expect(stopSpy).toHaveBeenCalledWith(show.id)
  })
})
