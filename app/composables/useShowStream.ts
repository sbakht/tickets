import type { ShowUpdate } from '#shared/types'

export default function useShowStream<T extends ShowUpdate>(
  showId: MaybeRefOrGetter<string>,
  show: MaybeRefOrGetter<T | null | undefined>
) {
  const live = ref<ShowUpdate | null>(null)
  let source: EventSource | undefined

  const liveShow = computed(() => {
    const base = toValue(show)
    if (!base) return base ?? null
    if (!live.value) return base

    return {
      ...base,
      remaining: live.value.remaining,
      price: live.value.price,
      ...(live.value.newPrice !== undefined ? { newPrice: live.value.newPrice } : {})
    }
  })

  function connect() {
    source?.close()
    source = undefined
    live.value = null

    const id = toValue(showId)
    if (!id || !import.meta.client) return

    source = new EventSource(`/shows/${id}/stream`)

    source.addEventListener('show-update', (event) => {
      const message = event as MessageEvent<string>
      try {
        live.value = JSON.parse(message.data) as ShowUpdate
      } catch {
        // Ignore malformed payloads
      }
    })
  }

  onMounted(() => {
    connect()
  })

  watch(() => toValue(showId), () => {
    connect()
  })

  onBeforeUnmount(() => {
    source?.close()
    source = undefined
  })

  return liveShow
}
