<script setup lang="ts">
defineProps<{
  title: string
  description: string
  image: string
  alt?: string
}>()

const quantity = ref(1)

function buy() {
  // Placeholder for checkout / cart flow
  console.log(`Buying ${quantity.value} ticket(s)`)
}
</script>

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

    <template #footer>
      <div class="flex items-center justify-between gap-3">
        <QuantitySelector v-model="quantity" />
        <UButton label="Buy" icon="i-lucide-ticket" class="cursor-pointer" @click="buy" />
      </div>
    </template>
  </UCard>
</template>
