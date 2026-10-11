<script setup lang="ts">
const toaster = { max: 1 }
</script>

<template>
  <UApp :toaster="toaster">
    <NuxtRouteAnnouncer />
    <AppHeader />
    <NuxtPage />
  </UApp>
</template>
