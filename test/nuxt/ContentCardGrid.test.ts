import { describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, renderSuspended } from '@nuxt/test-utils/runtime'
import { screen } from '@testing-library/vue'
import ContentCardGrid from '~/components/ContentCardGrid.vue'

const { useFetch } = vi.hoisted(() => ({
  useFetch: vi.fn()
}))

mockNuxtImport('useFetch', () => useFetch)

describe('ContentCardGrid', () => {
  it('renders a card per show', async () => {
    useFetch.mockReturnValue({
      data: ref([
        {
          id: 'a',
          title: 'Show A',
          description: 'A',
          image: '/a.jpg',
          price: 10,
          remaining: 2
        },
        {
          id: 'b',
          title: 'Show B',
          description: 'B',
          image: '/b.jpg',
          price: 20,
          remaining: 5
        }
      ])
    })

    await renderSuspended(ContentCardGrid)

    expect(screen.getByText('Show A')).toBeTruthy()
    expect(screen.getByText('Show B')).toBeTruthy()
  })

  it('renders nothing when the list is empty', async () => {
    useFetch.mockReturnValue({ data: ref([]) })

    await renderSuspended(ContentCardGrid)
    expect(screen.queryByText('Show A')).toBeNull()
    expect(screen.queryByRole('button', { name: /buy/i })).toBeNull()
  })
})
