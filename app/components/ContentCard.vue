<template>
  <UCard
    :title="title"
    :description="description"
    class="w-full"
  >
    <img
      :src="image"
      :alt="alt || title"
      class="w-full h-48 object-cover rounded-md"
    >

    <div class="mt-4 flex items-center justify-between gap-3">
      <p class="text-highlighted font-semibold text-lg">
        ${{ price }}
      </p>
      <p class="text-muted text-sm">
        {{ remaining }} ticket{{ remaining === 1 ? '' : 's' }} remaining
      </p>
    </div>

    <template #footer>
      <div class="flex items-center justify-between gap-3">
        <QuantitySelector v-model="quantity" :max="maxQuantity" />
        <UButton label="Buy" icon="i-lucide-ticket" class="cursor-pointer" @click="buy" />
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { MAX_TICKET_QUANTITY } from '~/utils/tickets'

const props = defineProps<{
  id: string
  title: string
  description: string
  image: string
  price: number
  remaining: number
  alt?: string
}>()

const quantity = ref(1)
const maxQuantity = computed(() => Math.min(MAX_TICKET_QUANTITY, props.remaining))

function buy() {
  navigateTo({
    path: '/checkout',
    query: {
      show: props.id,
      qty: String(quantity.value)
    }
  })
}
</script>
