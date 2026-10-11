import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { H3Event } from 'h3'

const h3Mocks = vi.hoisted(() => {
  const closed: Array<() => void | Promise<void>> = []
  const push = vi.fn(async () => {})
  const stream = {
    push,
    onClosed(cb: () => void | Promise<void>) {
      closed.push(cb)
    },
    async close() {},
    send: vi.fn(async () => 'sent'),
    async flushClosed() {
      for (const cb of closed.splice(0)) await cb()
    }
  }

  return {
    getRouterParam: vi.fn((event: H3Event, name: string) =>
      (event.context.params as Record<string, string> | undefined)?.[name]
    ),
    readBody: vi.fn(async (event: H3Event) =>
      (event as unknown as { _body: unknown })._body
    ),
    createEventStream: vi.fn(() => stream),
    stream
  }
})

vi.mock('h3', async (importOriginal) => {
  const actual = await importOriginal<typeof import('h3')>()
  return {
    ...actual,
    getRouterParam: h3Mocks.getRouterParam,
    readBody: h3Mocks.readBody,
    createEventStream: h3Mocks.createEventStream
  }
})

import showsService from '../../../server/services/shows'
import sessionService from '../../../server/services/session'
import showSimulator from '../../../server/services/showSimulator'
import { resetShowLiveForTests } from '../../../server/services/showLive'
import listShows from '../../../server/routes/shows/index.get'
import getShow from '../../../server/routes/shows/[id]/index.get'
import createSession from '../../../server/routes/sessions/index.post'
import getSession from '../../../server/routes/sessions/[id].get'
import patchSession from '../../../server/routes/sessions/[id].patch'
import completeSession from '../../../server/routes/sessions/[id]/complete.post'
import streamShow from '../../../server/routes/shows/[id]/stream.get'

function mockEvent(options: {
  params?: Record<string, string>
  body?: unknown
} = {}): H3Event {
  return {
    context: { params: options.params ?? {} },
    _body: options.body
  } as unknown as H3Event
}

function statusCode(err: unknown) {
  return (err as { statusCode?: number }).statusCode
}

describe('server routes', () => {
  beforeEach(() => {
    showsService.resetForTests()
    sessionService.resetForTests()
    showSimulator.stopAll()
    resetShowLiveForTests()
    h3Mocks.createEventStream.mockClear()
    h3Mocks.stream.push.mockClear()
    h3Mocks.stream.send.mockClear()
  })

  it('GET /shows lists shows', async () => {
    const result = await listShows(mockEvent())
    expect(result).toEqual(showsService.listShows())
  })

  it('GET /shows/:id returns a show or 404', async () => {
    const show = showsService.listShows()[0]!
    expect(await getShow(mockEvent({ params: { id: show.id } }))).toEqual(show)

    try {
      await getShow(mockEvent({ params: { id: 'missing' } }))
      expect.unreachable()
    } catch (err: unknown) {
      expect(statusCode(err)).toBe(404)
    }
  })

  it('POST /sessions validates body and creates sessions', async () => {
    const show = showsService.listShows()[0]!

    try {
      await createSession(mockEvent({ body: { showId: '', quantity: 0 } }))
      expect.unreachable()
    } catch (err: unknown) {
      expect(statusCode(err)).toBe(400)
    }

    try {
      await createSession(mockEvent({ body: { showId: 'missing', quantity: 1 } }))
      expect.unreachable()
    } catch (err: unknown) {
      expect(statusCode(err)).toBe(404)
    }

    const session = await createSession(mockEvent({
      body: { showId: show.id, quantity: 2, username: 'A', email: 'a@b.c' }
    }))
    expect(session).toMatchObject({
      showId: show.id,
      quantity: 2,
      username: 'A',
      email: 'a@b.c'
    })
  })

  it('GET/PATCH/complete session routes', async () => {
    const show = showsService.listShows()[0]!
    const session = sessionService.create({ showId: show.id, quantity: 1 })!

    expect(await getSession(mockEvent({ params: { id: session.id } }))).toEqual(session)

    try {
      await getSession(mockEvent({ params: { id: 'missing' } }))
      expect.unreachable()
    } catch (err: unknown) {
      expect(statusCode(err)).toBe(404)
    }

    try {
      await patchSession(mockEvent({ params: {}, body: {} }))
      expect.unreachable()
    } catch (err: unknown) {
      expect(statusCode(err)).toBe(404)
    }

    const patched = await patchSession(mockEvent({
      params: { id: session.id },
      body: { username: 'Pat', email: 'p@e.com', quantity: 3 }
    }))
    expect(patched).toMatchObject({ username: 'Pat', email: 'p@e.com', quantity: 3 })

    const completed = await completeSession(mockEvent({ params: { id: session.id } }))
    expect(completed.complete).toBe(true)

    try {
      await completeSession(mockEvent({ params: { id: 'missing' } }))
      expect.unreachable()
    } catch (err: unknown) {
      expect(statusCode(err)).toBe(404)
    }
  })

  it('GET /shows/:id/stream opens an SSE stream', async () => {
    const show = showsService.listShows()[0]!

    try {
      await streamShow(mockEvent({ params: { id: 'missing' } }))
      expect.unreachable()
    } catch (err: unknown) {
      expect(statusCode(err)).toBe(404)
    }

    const result = await streamShow(mockEvent({ params: { id: show.id } }))
    expect(result).toBe('sent')
    expect(h3Mocks.createEventStream).toHaveBeenCalled()
    expect(h3Mocks.stream.push).toHaveBeenCalled()

    showsService.updateShow(show.id, { newPrice: 99 })
    expect(h3Mocks.stream.push).toHaveBeenCalledWith({
      event: 'show-update',
      data: expect.stringContaining('99')
    })

    await h3Mocks.stream.flushClosed()
  })
})
