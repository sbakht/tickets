<script setup lang="ts">
withDefaults(defineProps<{
  min?: number
  max?: number
}>(), {
  min: 1,
  max: 4
})

const quantity = defineModel<number>({ default: 1 })
</script>

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
