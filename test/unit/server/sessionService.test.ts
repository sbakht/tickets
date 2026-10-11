import { describe, expect, it, vi } from 'vitest'
import { SessionService } from '../../../server/services/session'
import { ShowsService } from '../../../server/services/shows'

describe('SessionService', () => {
  it('creates a session for a valid show', () => {
    const shows = new ShowsService()
    const sessions = new SessionService(shows)
    const showId = shows.listShows()[0]!.id

    vi.spyOn(crypto, 'randomUUID').mockReturnValue('sess-1')

    const session = sessions.create({
      showId,
      quantity: 2,
      username: 'Ada',
      email: 'ada@example.com'
    })

    expect(session).toMatchObject({
      id: 'sess-1',
      showId,
      quantity: 2,
      username: 'Ada',
      email: 'ada@example.com',
      complete: false
    })
    expect(sessions.get('sess-1')).toEqual(session)
  })

  it('defaults username and email to empty strings', () => {
    const shows = new ShowsService()
    const sessions = new SessionService(shows)
    const session = sessions.create({
      showId: shows.listShows()[0]!.id,
      quantity: 1
    })

    expect(session?.username).toBe('')
    expect(session?.email).toBe('')
  })

  it('returns undefined when the show does not exist', () => {
    const sessions = new SessionService(new ShowsService())
    expect(sessions.create({ showId: 'missing', quantity: 1 })).toBeUndefined()
  })

  it('updates an open session and rejects completed ones', () => {
    const shows = new ShowsService()
    const sessions = new SessionService(shows)
    const session = sessions.create({
      showId: shows.listShows()[0]!.id,
      quantity: 1
    })!

    expect(sessions.update(session.id, { username: 'Bob', quantity: 3 })).toMatchObject({
      username: 'Bob',
      quantity: 3
    })

    sessions.complete(session.id)
    expect(sessions.update(session.id, { email: 'x@y.z' })).toBeUndefined()
  })

  it('complete is idempotent and returns undefined for missing ids', () => {
    const shows = new ShowsService()
    const sessions = new SessionService(shows)
    const session = sessions.create({
      showId: shows.listShows()[0]!.id,
      quantity: 1
    })!

    expect(sessions.complete(session.id)?.complete).toBe(true)
    expect(sessions.complete(session.id)?.complete).toBe(true)
    expect(sessions.complete('missing')).toBeUndefined()
    expect(sessions.update('missing', { username: 'x' })).toBeUndefined()
  })

  it('resetForTests clears sessions', () => {
    const shows = new ShowsService()
    const sessions = new SessionService(shows)
    const session = sessions.create({
      showId: shows.listShows()[0]!.id,
      quantity: 1
    })!
    sessions.resetForTests()
    expect(sessions.get(session.id)).toBeUndefined()
  })
})
