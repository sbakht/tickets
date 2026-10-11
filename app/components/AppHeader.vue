<template>
  <header class="border-b border-default bg-default">
    <div class="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-8">
      <span class="text-highlighted font-semibold">
        Tickets
      </span>

      <UButton
        class="md:hidden"
        icon="i-lucide-menu"
        variant="ghost"
        color="neutral"
        aria-label="Menu"
      />

      <nav class="hidden md:flex items-center gap-6 text-sm text-muted" aria-hidden="true">
        <span>Shows</span>
        <span>Account</span>
      </nav>
    </div>
  </header>
</template>
