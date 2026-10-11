<script setup lang="ts">
const toaster = { max: 1 }
</script>

<template>
  <UApp :toaster="toaster">
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </UApp>
</template>
