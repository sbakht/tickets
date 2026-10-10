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
            <p class="text-highlighted font-semibold flex items-baseline gap-2">
              <span v-if="hasNewPrice" class="text-muted text-base font-normal line-through">
                ${{ show.price }}
              </span>
              <span>${{ unitPrice }} each</span>
            </p>
            <p class="text-muted text-sm">
              {{ show.remaining }} ticket{{ show.remaining === 1 ? '' : 's' }} remaining
            </p>
          </div>
        </div>
      </UCard>

      <UCard>
        <form class="space-y-5" @submit.prevent="placeOrder">
          <div class="flex items-center justify-between gap-4">
            <label class="text-sm font-medium text-highlighted">
              Quantity
            </label>
            <QuantitySelector v-model="quantity" :max="maxQuantity" />
          </div>

          <UFormField label="Full name" name="name" required>
            <UInput v-model="name" placeholder="Jane Doe" class="w-full" />
          </UFormField>

          <UFormField label="Email" name="email" required>
            <UInput
              v-model="email"
              type="email"
              placeholder="jane@example.com"
              class="w-full"
            />
          </UFormField>

          <div class="flex items-center justify-between border-t border-default pt-4">
            <span class="text-muted">
              Total
            </span>
            <span class="text-xl font-semibold text-highlighted flex items-baseline gap-2">
              <span v-if="hasNewPrice" class="text-muted text-base font-normal line-through">
                ${{ originalTotal }}
              </span>
              <span>${{ total }}</span>
            </span>
          </div>

          <UButton
            type="submit"
            label="Place order"
            icon="i-lucide-check"
            size="lg"
            block
            :disabled="!name.trim() || !email.trim()"
          />
          <p v-if="orderError" class="text-error text-sm">
            {{ orderError }}
          </p>
        </form>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MAX_TICKET_QUANTITY } from '~/utils/tickets'

type Show = {
  id: string
  title: string
  description: string
  image: string
  price: number
  newPrice?: number
  remaining: number
}

const route = useRoute()

const showId = computed(() => String(route.query.show || ''))
const qtyParam = computed(() => Number(route.query.qty) || 1)

if (!showId.value) {
  await navigateTo('/')
}

const { data: initialShow, error } = await useFetch<Show>(() => `/shows/${showId.value}`)

const show = useShowStream(showId, initialShow)
useCheckoutToast(show)

const maxQuantity = computed(() => {
  if (!show.value) return 1
  return Math.min(MAX_TICKET_QUANTITY, show.value.remaining)
})

const quantity = ref(Math.min(Math.max(qtyParam.value, 1), maxQuantity.value))

watch(show, (value) => {
  if (value) {
    quantity.value = Math.min(
      Math.max(quantity.value, 1),
      Math.min(MAX_TICKET_QUANTITY, value.remaining)
    )
  }
}, { immediate: true })


const hasNewPrice = computed(() => {
  return typeof show.value?.newPrice === 'number'
})

const unitPrice = computed(() => {
  if (!show.value) return 0
  return hasNewPrice.value ? show.value.newPrice! : show.value.price
})

const originalTotal = computed(() => {
  if (!show.value) return 0
  return show.value.price * quantity.value
})

const total = computed(() => unitPrice.value * quantity.value)

const email = ref('')
const name = ref('')
const submitted = ref(false)
const orderError = ref('')

function placeOrder() {
  if (!show.value || !name.value.trim() || !email.value.trim()) return

  if (show.value.remaining <= 0) {
    orderError.value = 'There are no tickets remaining for this show.'
    return
  }

  orderError.value = ''
  submitted.value = true
}
</script>
