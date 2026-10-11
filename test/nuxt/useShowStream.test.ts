import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent, nextTick, ref } from 'vue'
import useShowStream from '~/composables/useShowStream'

class MockEventSource {
  static instances: MockEventSource[] = []
  url: string
  closed = false
  private listeners = new Map<string, Array<(event: MessageEvent<string>) => void>>()

  constructor(url: string) {
    this.url = url
    MockEventSource.instances.push(this)
  }

  addEventListener(type: string, cb: (event: MessageEvent<string>) => void) {
    const list = this.listeners.get(type) ?? []
    list.push(cb)
    this.listeners.set(type, list)
  }

  close() {
    this.closed = true
  }

  emit(data: string) {
    for (const cb of this.listeners.get('show-update') ?? []) {
      cb({ data } as MessageEvent<string>)
    }
  }
}

describe('useShowStream', () => {
  beforeEach(() => {
    MockEventSource.instances = []
    vi.stubGlobal('EventSource', MockEventSource)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('merges SSE updates into the show and ignores bad JSON', async () => {
    const showId = ref('show-1')
    const show = ref({
      id: 'show-1',
      title: 'T',
      description: 'D',
      image: '/i.jpg',
      price: 40,
      remaining: 5
    })

    const Host = defineComponent({
      setup() {
        const live = useShowStream(showId, show)
        return { live }
      },
      template: '<div>{{ live?.remaining }}-{{ live?.newPrice ?? live?.price }}</div>'
    })

    const wrapper = await mountSuspended(Host)
    await nextTick()

    const source = MockEventSource.instances[0]!
    expect(source.url).toBe('/shows/show-1/stream')

    source.emit('not-json')
    await nextTick()
    expect(wrapper.text()).toBe('5-40')

    source.emit(JSON.stringify({ remaining: 2, price: 40, newPrice: 35 }))
    await nextTick()
    expect(wrapper.text()).toBe('2-35')

    showId.value = 'show-2'
    await nextTick()
    expect(source.closed).toBe(true)
    expect(MockEventSource.instances.at(-1)?.url).toBe('/shows/show-2/stream')

    wrapper.unmount()
    expect(MockEventSource.instances.at(-1)?.closed).toBe(true)
  })
})
