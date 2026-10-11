import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, renderSuspended } from '@nuxt/test-utils/runtime'
import { fireEvent, screen, waitFor } from '@testing-library/vue'
import CheckoutForm from '~/components/CheckoutForm.vue'
import type { Show } from '#shared/types'

const { navigateTo, fetchMock } = vi.hoisted(() => ({
  navigateTo: vi.fn(),
  fetchMock: vi.fn()
}))

mockNuxtImport('navigateTo', () => navigateTo)
mockNuxtImport('$fetch', () => fetchMock)

const show: Show = {
  id: 'iron-legion-world-tour',
  title: 'Iron Legion',
  description: 'Loud',
  image: '/img.jpg',
  price: 50,
  remaining: 4
}

describe('CheckoutForm', () => {
  beforeEach(() => {
    navigateTo.mockReset()
    fetchMock.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('debounces PATCH updates while typing', async () => {
    vi.useFakeTimers()
    fetchMock.mockResolvedValue({})

    await renderSuspended(CheckoutForm, {
      props: {
        sessionId: 'sess-1',
        show,
        initialName: '',
        initialEmail: '',
        initialQuantity: 1
      }
    })

    await fireEvent.update(screen.getByPlaceholderText('Jane Doe'), 'Ada')
    await fireEvent.update(screen.getByPlaceholderText('jane@example.com'), 'ada@example.com')

    expect(fetchMock).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(300)

    expect(fetchMock).toHaveBeenCalledWith('/sessions/sess-1', expect.objectContaining({
      method: 'PATCH',
      body: expect.objectContaining({
        username: 'Ada',
        email: 'ada@example.com',
        quantity: 1
      })
    }))
  })

  it('blocks order when no tickets remain', async () => {
    await renderSuspended(CheckoutForm, {
      props: {
        sessionId: 'sess-1',
        show: { ...show, remaining: 0 },
        initialName: 'Ada',
        initialEmail: 'ada@example.com'
      }
    })

    await fireEvent.click(screen.getByRole('button', { name: /place order/i }))
    expect(screen.getByText('There are no tickets remaining for this show.')).toBeTruthy()
  })

  it('completes an order and emits submitted', async () => {
    fetchMock.mockImplementation(async (url: string, opts?: { method?: string }) => {
      if (opts?.method === 'PATCH') return {}
      if (String(url).endsWith('/complete')) {
        return { id: 'sess-1', complete: true }
      }
      return { id: 'sess-1', complete: false }
    })

    const onSubmitted = vi.fn()
    const { defineComponent, h } = await import('vue')
    const Host = defineComponent({
      setup() {
        return () => h(CheckoutForm, {
          sessionId: 'sess-1',
          show,
          initialName: 'Ada',
          initialEmail: 'ada@example.com',
          initialQuantity: 2,
          onSubmitted
        })
      }
    })

    await renderSuspended(Host)

    await fireEvent.click(screen.getByRole('button', { name: /place order/i }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/sessions/sess-1/complete',
        expect.objectContaining({ method: 'POST' })
      )
      expect(onSubmitted).toHaveBeenCalledWith({
        name: 'Ada',
        email: 'ada@example.com',
        quantity: 2
      })
    })
  })

  it('navigates home when the session is already complete', async () => {
    fetchMock.mockResolvedValue({ id: 'sess-1', complete: true })

    await renderSuspended(CheckoutForm, {
      props: {
        sessionId: 'sess-1',
        show,
        initialName: 'Ada',
        initialEmail: 'ada@example.com'
      }
    })

    await fireEvent.click(screen.getByRole('button', { name: /place order/i }))

    await waitFor(() => {
      expect(navigateTo).toHaveBeenCalledWith('/')
    })
  })

  it('navigates home when the session is missing', async () => {
    fetchMock.mockRejectedValue(new Error('missing'))

    await renderSuspended(CheckoutForm, {
      props: {
        sessionId: 'sess-1',
        show,
        initialName: 'Ada',
        initialEmail: 'ada@example.com'
      }
    })

    await fireEvent.click(screen.getByRole('button', { name: /place order/i }))

    await waitFor(() => {
      expect(navigateTo).toHaveBeenCalledWith('/')
    })
  })

  it('shows an error when complete fails without a 404', async () => {
    fetchMock.mockImplementation(async (url: string, opts?: { method?: string }) => {
      if (opts?.method === 'PATCH') return {}
      if (String(url).endsWith('/complete')) {
        const err = Object.assign(new Error('fail'), { statusCode: 500 })
        throw err
      }
      return { id: 'sess-1', complete: false }
    })

    await renderSuspended(CheckoutForm, {
      props: {
        sessionId: 'sess-1',
        show,
        initialName: 'Ada',
        initialEmail: 'ada@example.com'
      }
    })

    await fireEvent.click(screen.getByRole('button', { name: /place order/i }))

    await waitFor(() => {
      expect(screen.getByText('Could not place order. Please try again.')).toBeTruthy()
    })
  })

  it('navigates home when complete returns 404', async () => {
    fetchMock.mockImplementation(async (url: string, opts?: { method?: string }) => {
      if (opts?.method === 'PATCH') return {}
      if (String(url).endsWith('/complete')) {
        const err = Object.assign(new Error('gone'), { statusCode: 404 })
        throw err
      }
      return { id: 'sess-1', complete: false }
    })

    await renderSuspended(CheckoutForm, {
      props: {
        sessionId: 'sess-1',
        show,
        initialName: 'Ada',
        initialEmail: 'ada@example.com'
      }
    })

    await fireEvent.click(screen.getByRole('button', { name: /place order/i }))

    await waitFor(() => {
      expect(navigateTo).toHaveBeenCalledWith('/')
    })
  })
})
