import { describe, expect, it, vi } from 'vitest'
import { ShowsService } from '../../../server/services/shows'

describe('ShowsService', () => {
  it('lists shows and finds by id', () => {
    const service = new ShowsService()
    const list = service.listShows()

    expect(list.length).toBeGreaterThan(0)
    expect(service.getShow(list[0]!.id)).toEqual(list[0])
    expect(service.getShow('missing')).toBeUndefined()
  })

  it('updates a show and notifies handlers with previous snapshot', () => {
    const service = new ShowsService()
    const show = service.listShows()[0]!
    const originalRemaining = show.remaining
    const originalPrice = show.price
    const handler = vi.fn()
    service.onChange(handler)

    const updated = service.updateShow(show.id, {
      remaining: originalRemaining - 1,
      newPrice: 42
    })

    expect(updated?.remaining).toBe(originalRemaining - 1)
    expect(updated?.newPrice).toBe(42)
    expect(handler).toHaveBeenCalledOnce()
    expect(handler.mock.calls[0]![1]).toMatchObject({
      remaining: originalRemaining,
      price: originalPrice
    })
  })

  it('returns undefined for unknown show updates', () => {
    const service = new ShowsService()
    expect(service.updateShow('nope', { remaining: 1 })).toBeUndefined()
  })

  it('unsubscribes onChange handlers', () => {
    const service = new ShowsService()
    const show = service.listShows()[0]!
    const handler = vi.fn()
    const unsubscribe = service.onChange(handler)
    unsubscribe()

    service.updateShow(show.id, { newPrice: 10 })
    expect(handler).not.toHaveBeenCalled()
  })

  it('builds show updates from a show', () => {
    const service = new ShowsService()
    const show = {
      id: 'x',
      title: 't',
      description: 'd',
      image: 'i',
      price: 20,
      newPrice: 15,
      remaining: 3
    }

    expect(service.getShowUpdates(show)).toEqual({
      remaining: 3,
      price: 20,
      newPrice: 15
    })
  })

  it('resetForTests restores seed data', () => {
    const service = new ShowsService()
    const show = service.listShows()[0]!
    const original = show.remaining
    service.updateShow(show.id, { remaining: 0 })
    service.resetForTests()
    expect(service.getShow(show.id)?.remaining).toBe(original)
  })
})
