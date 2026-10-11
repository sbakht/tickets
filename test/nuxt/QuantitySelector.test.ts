import { describe, expect, it } from 'vitest'
import { renderSuspended } from '@nuxt/test-utils/runtime'
import { screen } from '@testing-library/vue'
import QuantitySelector from '~/components/QuantitySelector.vue'

describe('QuantitySelector', () => {
  it('renders increment/decrement controls and a spinbutton', async () => {
    await renderSuspended(QuantitySelector, {
      props: { modelValue: 2, max: 3 }
    })

    const input = screen.getByRole('spinbutton')
    expect(input.getAttribute('aria-valuenow')).toBe('2')
    expect(input.getAttribute('aria-valuemax')).toBe('3')
    expect(screen.getByRole('button', { name: 'Increment' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Decrement' })).toBeTruthy()
  })

  it('defaults max to MAX_TICKET_QUANTITY', async () => {
    await renderSuspended(QuantitySelector, {
      props: { modelValue: 1 }
    })

    expect(screen.getByRole('spinbutton').getAttribute('aria-valuemax')).toBe('4')
  })
})
