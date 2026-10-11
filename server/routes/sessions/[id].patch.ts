import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import sessionService, { type UpdateSessionInput } from '../../services/session'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Session not found'
    })
  }

  const body = await readBody<UpdateSessionInput>(event)
  const patch: UpdateSessionInput = {}

  if (typeof body.username === 'string') {
    patch.username = body.username
  }
  if (typeof body.email === 'string') {
    patch.email = body.email
  }
  if (typeof body.quantity === 'number' && Number.isFinite(body.quantity) && body.quantity >= 1) {
    patch.quantity = body.quantity
  }

  const session = sessionService.update(id, patch)

  if (!session) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Session not found'
    })
  }

  return session
})
