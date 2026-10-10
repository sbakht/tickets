type ShowLike = {
  newPrice?: number
  remaining?: number
}

export default function useCheckoutToast(
  show: MaybeRefOrGetter<ShowLike | null | undefined>
) {
  const toast = useToast()
  const enabled = ref(false)

  onMounted(async () => {
    // Avoid toasting the initial fetch / first SSE snapshot
    await nextTick()
    enabled.value = true
  })

  watch(
    () => toValue(show)?.newPrice,
    (price, previous) => {
      if (!enabled.value) return
      if (typeof price !== 'number') return
      if (price === previous) return

      toast.add({
        title: 'Price changed',
        description: `$${price}`
      })
    }
  )

  watch(
    () => toValue(show)?.remaining,
    (remaining, previous) => {
      if (!enabled.value) return
      if (typeof remaining !== 'number') return
      if (remaining === previous) return

      toast.add({
        title: 'Inventory updated',
        description: `${remaining} ticket${remaining === 1 ? '' : 's'} remaining`
      })
    }
  )
}
