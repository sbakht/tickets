<template>
  <span
    class="text-highlighted font-semibold flex items-baseline gap-2"
    :class="large ? 'text-xl' : undefined"
  >
    <span
      v-if="struckPrice !== null"
      class="text-muted text-base font-normal line-through"
    >
      ${{ struckPrice }}
    </span>
    <span>${{ displayPrice }}{{ suffix ? ` ${suffix}` : '' }}</span>
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  price: number
  newPrice?: number
  resumed?: boolean
  quantity?: number
  suffix?: string
  large?: boolean
}>(), {
  resumed: false,
  quantity: 1,
  large: false
})

const arrivalUnitPrice = ref<number | null>(null)

watch(
  () => [props.price, props.newPrice] as const,
  ([price, newPrice]) => {
    if (arrivalUnitPrice.value !== null) return
    arrivalUnitPrice.value = props.resumed ? price : (newPrice ?? price)
  },
  { immediate: true }
)

const unitPrice = computed(() => props.newPrice ?? props.price)

// When live price returns to the arrival anchor, keep the last drifted price struck
// so 45 → 40 → 45 still shows ~~40~~ 45 instead of dropping the cross-out.
const lastNonArrivalPrice = ref<number | null>(null)

watch(unitPrice, (current) => {
  const arrival = arrivalUnitPrice.value
  if (arrival !== null && current !== arrival) {
    lastNonArrivalPrice.value = current
  }
}, { immediate: true })

const struckUnitPrice = computed(() => {
  const arrival = arrivalUnitPrice.value
  if (arrival === null) return null
  if (unitPrice.value !== arrival) return arrival
  const last = lastNonArrivalPrice.value
  if (last !== null && last !== unitPrice.value) return last
  return null
})

const displayPrice = computed(() => unitPrice.value * props.quantity)

const struckPrice = computed(() => {
  if (struckUnitPrice.value === null) return null
  return struckUnitPrice.value * props.quantity
})
</script>
