<script setup lang="ts">
const { data: cards } = await useFetch('/shows')
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    <ContentCard
      v-for="card in cards"
      :key="card.title"
      :title="card.title"
      :description="card.description"
      :image="card.image"
      :price="card.price"
      :remaining="card.remaining"
    />
  </div>
</template>
