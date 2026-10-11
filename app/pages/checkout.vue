<template>
  <div class="p-8 max-w-3xl mx-auto">
    <UButton
      to="/"
      variant="ghost"
      icon="i-lucide-arrow-left"
      label="Back to shows"
      class="mb-6"
    />

    <div v-if="error && error.statusCode !== 404" class="text-error">
      Could not load show details. Please try again.
    </div>

    <div v-else-if="!show" class="space-y-4">
      <h1 class="text-2xl font-semibold text-highlighted">
        Show not found
      </h1>
      <p class="text-muted">
        That show may no longer be available.
      </p>
      <UButton to="/" label="Browse shows" />
    </div>

    <div v-else-if="submitted" class="space-y-4">
      <h1 class="text-2xl font-semibold text-highlighted">
        Order confirmed
      </h1>
      <p class="text-muted">
        Thanks, {{ name }}. {{ quantity }} ticket{{ quantity === 1 ? '' : 's' }} for
        <span class="text-highlighted font-medium">{{ show.title }}</span>
        are reserved. A confirmation will be sent to {{ email }}.
      </p>
      <UButton to="/" label="Back to shows" icon="i-lucide-ticket" />
    </div>

    <div v-else class="space-y-8">
      <div>
        <h1 class="text-2xl font-semibold text-highlighted">
          Checkout
        </h1>
        <p class="text-muted mt-1">
          Complete your ticket purchase
        </p>
      </div>

      <UCard>
        <div class="flex flex-col sm:flex-row gap-6">
          <img
            :src="show.image"
            :alt="show.title"
            class="w-full sm:w-40 h-40 object-cover rounded-md shrink-0"
          >
          <div class="flex-1 space-y-2">
            <h2 class="text-xl font-semibold text-highlighted">
              {{ show.title }}
            </h2>
            <p class="text-muted text-sm">
              {{ show.description }}
            </p>
            <CheckoutPrice
              :price="show.price"
              :new-price="show.newPrice"
              :resumed="isResumedSession"
              suffix="each"
            />
            <p class="text-muted text-sm">
              {{ show.remaining }} ticket{{ show.remaining === 1 ? '' : 's' }} remaining
            </p>
          </div>
        </div>
      </UCard>

      <CheckoutForm
        :session-id="sessionId"
        :show="show"
        :resumed="isResumedSession"
        :initial-name="name"
        :initial-email="email"
        :initial-quantity="quantity"
        @submitted="onOrderSubmitted"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Session, Show } from '#shared/types'

const route = useRoute()

const sessionQuery = String(route.query.session || '')
const showQuery = String(route.query.show || '')
const qtyQuery = Number(route.query.qty) || 1

const isResumedSession = Boolean(sessionQuery)
const sessionId = ref('')
const showId = ref('')
const name = ref('')
const email = ref('')
const quantity = ref(1)
const submitted = ref(false)

if (sessionQuery) {
  try {
    const session = await $fetch<Session>(`/sessions/${sessionQuery}`)
    if (session.complete) {
      await navigateTo('/')
    } else {
      sessionId.value = session.id
      showId.value = session.showId
      name.value = session.username
      email.value = session.email
      quantity.value = session.quantity
    }
  } catch {
    await navigateTo('/')
  }
} else if (showQuery) {
  try {
    const session = await $fetch<Session>('/sessions', {
      method: 'POST',
      body: {
        showId: showQuery,
        quantity: qtyQuery
      }
    })
    sessionId.value = session.id
    showId.value = session.showId
    quantity.value = session.quantity
    await navigateTo({
      path: '/checkout',
      query: { session: session.id }
    }, { replace: true })
  } catch {
    await navigateTo('/')
  }
} else {
  await navigateTo('/')
}

const { data: initialShow, error } = await useFetch<Show>(() => `/shows/${showId.value}`)

const show = useShowStream(showId, initialShow)
useCheckoutToast(show)

function onOrderSubmitted(order: { name: string, email: string, quantity: number }) {
  name.value = order.name
  email.value = order.email
  quantity.value = order.quantity
  submitted.value = true
}
</script>
