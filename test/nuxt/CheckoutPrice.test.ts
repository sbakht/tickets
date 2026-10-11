import { describe, expect, it } from 'vitest'
import { renderSuspended } from '@nuxt/test-utils/runtime'
import { screen } from '@testing-library/vue'
import { nextTick } from 'vue'
import CheckoutPrice from '~/components/CheckoutPrice.vue'

describe('CheckoutPrice', () => {
  it('anchors a new session on newPrice and multiplies by quantity', async () => {
    await renderSuspended(CheckoutPrice, {
      props: { price: 45, newPrice: 40, quantity: 2 }
    })

    expect(screen.getByText('$80')).toBeTruthy()
    expect(screen.queryByText('$90')).toBeNull()
  })

  it('anchors a resumed session on the base price', async () => {
    await renderSuspended(CheckoutPrice, {
      props: { price: 45, newPrice: 40, resumed: true, quantity: 1 }
    })

    expect(screen.getByText('$40')).toBeTruthy()
    expect(screen.getByText('$45')).toBeTruthy()
  })

  it('keeps the last drifted price struck when price returns to arrival', async () => {
    const { rerender } = await renderSuspended(CheckoutPrice, {
      props: { price: 45, newPrice: 40, quantity: 1 }
    })

    expect(screen.getByText('$40')).toBeTruthy()

    await rerender({ price: 45, newPrice: 35, quantity: 1 })
    await nextTick()
    expect(screen.getByText('$35')).toBeTruthy()
    expect(screen.getByText('$40')).toBeTruthy()

    await rerender({ price: 45, newPrice: 40, quantity: 1 })
    await nextTick()
    expect(screen.getByText('$40')).toBeTruthy()
    expect(screen.getByText('$35')).toBeTruthy()
  })

  it('renders an optional suffix', async () => {
    await renderSuspended(CheckoutPrice, {
      props: { price: 10, suffix: 'each' }
    })

    expect(screen.getByText('$10 each')).toBeTruthy()
  })
})
