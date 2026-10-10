<template>
  <UInputNumber
    v-model="quantity"
    size="sm"
    :min="min"
    :max="max"
    :step="1"
    class="w-28"
  />
</template>

<script setup lang="ts">
import { MAX_TICKET_QUANTITY } from '~/utils/tickets'

withDefaults(defineProps<{
  min?: number
  max?: number
}>(), {
  min: 1,
  max: MAX_TICKET_QUANTITY
})

const quantity = defineModel<number>({ default: 1 })
</script>
