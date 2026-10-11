import { describe, expect, it, vi } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { defineComponent, nextTick, ref } from 'vue'
import useCheckoutToast from '~/composables/useCheckoutToast'

const { toastAdd } = vi.hoisted(() => ({
  toastAdd: vi.fn()
}))

mockNuxtImport('useToast', () => () => ({ add: toastAdd }))

describe('useCheckoutToast', () => {
  it('does not toast the initial values, then toasts later changes', async () => {
    toastAdd.mockReset()
    const show = ref<{ newPrice?: number, remaining?: number }>({
      newPrice: 40,
      remaining: 5
    })

    const Host = defineComponent({
      setup() {
        useCheckoutToast(show)
        return () => null
      }
    })

    await mountSuspended(Host)
    await nextTick()
    await nextTick()

    expect(toastAdd).not.toHaveBeenCalled()

    show.value = { newPrice: 35, remaining: 5 }
    await nextTick()
    expect(toastAdd).toHaveBeenCalledWith({
      title: 'Price changed',
      description: '$35'
    })

    show.value = { newPrice: 35, remaining: 1 }
    await nextTick()
    expect(toastAdd).toHaveBeenCalledWith({
      title: 'Inventory updated',
      description: '1 ticket remaining'
    })

    show.value = { newPrice: 35, remaining: 2 }
    await nextTick()
    expect(toastAdd).toHaveBeenCalledWith({
      title: 'Inventory updated',
      description: '2 tickets remaining'
    })
  })
})
