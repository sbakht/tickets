import { describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, renderSuspended } from '@nuxt/test-utils/runtime'
import { fireEvent, screen } from '@testing-library/vue'
import ContentCard from '~/components/ContentCard.vue'

const { navigateTo } = vi.hoisted(() => ({
  navigateTo: vi.fn()
}))

mockNuxtImport('navigateTo', () => navigateTo)

describe('ContentCard', () => {
  it('renders show details and navigates on Buy', async () => {
    navigateTo.mockReset()

    await renderSuspended(ContentCard, {
      props: {
        id: 'iron-legion-world-tour',
        title: 'Iron Legion World Tour',
        description: 'Loud',
        image: '/img.jpg',
        price: 89,
        remaining: 12
      }
    })

    expect(screen.getByText('Iron Legion World Tour')).toBeTruthy()
    expect(screen.getByText('$89')).toBeTruthy()
    expect(screen.getByText('12 tickets remaining')).toBeTruthy()

    await fireEvent.click(screen.getByRole('button', { name: /buy/i }))

    expect(navigateTo).toHaveBeenCalledWith({
      path: '/checkout',
      query: {
        show: 'iron-legion-world-tour',
        qty: '1'
      }
    })
  })

  it('uses singular remaining copy', async () => {
    await renderSuspended(ContentCard, {
      props: {
        id: 'x',
        title: 'Solo',
        description: 'd',
        image: '/i.jpg',
        price: 10,
        remaining: 1
      }
    })

    expect(screen.getByText('1 ticket remaining')).toBeTruthy()
  })
})
