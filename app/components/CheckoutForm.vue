<template>
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
        <CheckoutPrice
          :price="show.price"
          :new-price="show.newPrice"
          :resumed="resumed"
          :quantity="quantity"
          large
        />
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
</template>

<script setup lang="ts">
import type { Session, Show } from '#shared/types'
import { MAX_TICKET_QUANTITY } from '~/utils/tickets'

const props = defineProps<{
  sessionId: string
  show: Show
  resumed?: boolean
  initialName?: string
  initialEmail?: string
  initialQuantity?: number
}>()

const emit = defineEmits<{
  submitted: [order: { name: string, email: string, quantity: number }]
}>()

const name = ref(props.initialName ?? '')
const email = ref(props.initialEmail ?? '')
const quantity = ref(props.initialQuantity ?? 1)
const orderError = ref('')
const placing = ref(false)

const maxQuantity = computed(() =>
  Math.min(MAX_TICKET_QUANTITY, props.show.remaining)
)

watch(() => props.show.remaining, () => {
  quantity.value = Math.min(
    Math.max(quantity.value, 1),
    Math.min(MAX_TICKET_QUANTITY, props.show.remaining)
  )
}, { immediate: true })

let patchTimer: ReturnType<typeof setTimeout> | undefined

watch([name, email, quantity], () => {
  if (!props.sessionId || placing.value) return

  clearTimeout(patchTimer)
  patchTimer = setTimeout(() => {
    $fetch(`/sessions/${props.sessionId}`, {
      method: 'PATCH',
      body: {
        username: name.value,
        email: email.value,
        quantity: quantity.value
      }
    }).catch(() => {})
  }, 300)
})

onBeforeUnmount(() => {
  clearTimeout(patchTimer)
})

async function placeOrder() {
  if (placing.value) return
  if (!name.value.trim() || !email.value.trim()) return

  if (!props.sessionId) {
    await navigateTo('/')
    return
  }

  if (props.show.remaining <= 0) {
    orderError.value = 'There are no tickets remaining for this show.'
    return
  }

  orderError.value = ''

  try {
    const session = await $fetch<Session>(`/sessions/${props.sessionId}`)
    if (session.complete) {
      await navigateTo('/')
      return
    }
  } catch {
    await navigateTo('/')
    return
  }

  placing.value = true

  try {
    await $fetch<Session>(`/sessions/${props.sessionId}/complete`, {
      method: 'POST'
    })
    emit('submitted', {
      name: name.value,
      email: email.value,
      quantity: quantity.value
    })
  } catch (err: unknown) {
    placing.value = false
    const status = (err as { statusCode?: number })?.statusCode
    if (status === 404) {
      await navigateTo('/')
      return
    }
    orderError.value = 'Could not place order. Please try again.'
  }
}
</script>
