import { createError, defineEventHandler, readBody } from 'h3'
import sessionService from '../../services/session'

type CreateBody = {
  showId?: string
  quantity?: number
  username?: string
  email?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CreateBody>(event)
  const showId = typeof body.showId === 'string' ? body.showId : ''
  const quantity = Number(body.quantity)

  if (!showId || !Number.isFinite(quantity) || quantity < 1) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid session payload'
    })
  }

  const session = sessionService.create({
    showId,
    quantity,
    username: typeof body.username === 'string' ? body.username : '',
    email: typeof body.email === 'string' ? body.email : ''
  })

  if (!session) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Show not found'
    })
  }

  return session
})
