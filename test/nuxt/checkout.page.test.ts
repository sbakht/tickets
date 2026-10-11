import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, renderSuspended } from '@nuxt/test-utils/runtime'
import { fireEvent, screen, waitFor } from '@testing-library/vue'
import { computed, toValue } from 'vue'
import CheckoutPage from '~/pages/checkout.vue'
import type { Session, Show } from '#shared/types'

const { navigateTo, routeQuery, useFetch, fetchMock } = vi.hoisted(() => ({
  navigateTo: vi.fn(),
  routeQuery: { value: {} as Record<string, string> },
  useFetch: vi.fn(),
  fetchMock: vi.fn()
}))

mockNuxtImport('navigateTo', () => navigateTo)
mockNuxtImport('useRoute', () => () => ({
  query: routeQuery.value
}))
mockNuxtImport('useFetch', () => useFetch)
mockNuxtImport('$fetch', () => fetchMock)

vi.mock('~/composables/useShowStream', () => ({
  default: (_id: unknown, show: unknown) => computed(() => toValue(show as never))
}))

vi.mock('~/composables/useCheckoutToast', () => ({
  default: () => {}
}))

const show: Show = {
  id: 'iron-legion-world-tour',
  title: 'Iron Legion World Tour',
  description: 'Loud night',
  image: '/img.jpg',
  price: 89,
  remaining: 12
}

describe('checkout page', () => {
  beforeEach(() => {
    navigateTo.mockReset()
    fetchMock.mockReset()
    routeQuery.value = {}
    vi.stubGlobal('EventSource', class {
      close() {}
      addEventListener() {}
    })

    useFetch.mockImplementation((url: () => string) => {
      const id = url().split('/').pop()
      if (!id || id === 'missing') {
        return {
          data: ref(null),
          error: ref({ statusCode: 404 })
        }
      }
      if (id === 'error-show') {
        return {
          data: ref(null),
          error: ref({ statusCode: 500 })
        }
      }
      return {
        data: ref<Show>({
          id,
          title: 'Iron Legion World Tour',
          description: 'Loud night',
          image: '/img.jpg',
          price: 89,
          remaining: 12
        }),
        error: ref(null)
      }
    })
  })

  it('creates a session for ?show=&qty= and replaces the URL', async () => {
    routeQuery.value = { show: show.id, qty: '2' }
    fetchMock.mockResolvedValueOnce({
      id: 'sess-new',
      showId: show.id,
      quantity: 2,
      username: '',
      email: '',
      complete: false
    } satisfies Session)

    await renderSuspended(CheckoutPage)

    expect(fetchMock).toHaveBeenCalledWith('/sessions', expect.objectContaining({
      method: 'POST',
      body: { showId: show.id, quantity: 2 }
    }))
    expect(navigateTo).toHaveBeenCalledWith({
      path: '/checkout',
      query: { session: 'sess-new' }
    }, { replace: true })
  })

  it('resumes an open session and shows the form', async () => {
    routeQuery.value = { session: 'sess-1' }
    fetchMock.mockResolvedValueOnce({
      id: 'sess-1',
      showId: show.id,
      quantity: 3,
      username: 'Ada',
      email: 'ada@example.com',
      complete: false
    } satisfies Session)

    await renderSuspended(CheckoutPage)

    expect(screen.getByRole('heading', { name: 'Checkout' })).toBeTruthy()
    expect(screen.getByText('Iron Legion World Tour')).toBeTruthy()
    expect((screen.getByPlaceholderText('Jane Doe') as HTMLInputElement).value).toBe('Ada')
  })

  it('redirects home when the session is complete', async () => {
    routeQuery.value = { session: 'sess-done' }
    fetchMock.mockResolvedValueOnce({
      id: 'sess-done',
      showId: show.id,
      quantity: 1,
      username: '',
      email: '',
      complete: true
    } satisfies Session)

    await renderSuspended(CheckoutPage)
    expect(navigateTo).toHaveBeenCalledWith('/')
  })

  it('redirects home when the session is missing', async () => {
    routeQuery.value = { session: 'gone' }
    fetchMock.mockRejectedValueOnce(new Error('404'))

    await renderSuspended(CheckoutPage)
    expect(navigateTo).toHaveBeenCalledWith('/')
  })

  it('redirects home when query is empty', async () => {
    routeQuery.value = {}
    await renderSuspended(CheckoutPage)
    expect(navigateTo).toHaveBeenCalledWith('/')
  })

  it('shows show-not-found state', async () => {
    routeQuery.value = { session: 'sess-1' }
    fetchMock.mockResolvedValueOnce({
      id: 'sess-1',
      showId: 'missing',
      quantity: 1,
      username: '',
      email: '',
      complete: false
    } satisfies Session)

    await renderSuspended(CheckoutPage)
    expect(screen.getByText('Show not found')).toBeTruthy()
  })

  it('shows a load error for non-404 failures', async () => {
    routeQuery.value = { session: 'sess-1' }
    fetchMock.mockResolvedValueOnce({
      id: 'sess-1',
      showId: 'error-show',
      quantity: 1,
      username: '',
      email: '',
      complete: false
    } satisfies Session)

    await renderSuspended(CheckoutPage)
    expect(screen.getByText('Could not load show details. Please try again.')).toBeTruthy()
  })

  it('shows order confirmed after submit', async () => {
    routeQuery.value = { session: 'sess-1' }
    fetchMock.mockImplementation(async (url: string, opts?: { method?: string }) => {
      if (url === '/sessions/sess-1' && !opts?.method) {
        return {
          id: 'sess-1',
          showId: show.id,
          quantity: 1,
          username: 'Ada',
          email: 'ada@example.com',
          complete: false
        } satisfies Session
      }
      if (url === '/sessions/sess-1/complete') {
        return { id: 'sess-1', complete: true }
      }
      return { id: 'sess-1', complete: false }
    })

    await renderSuspended(CheckoutPage)

    await fireEvent.click(screen.getByRole('button', { name: /place order/i }))

    await waitFor(() => {
      expect(screen.getByText('Order confirmed')).toBeTruthy()
    })
  })
})
