import { createError, defineEventHandler, getRouterParam } from 'h3'
import sessionService from '../../../services/session'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  const session = id ? sessionService.complete(id) : undefined

  if (!session) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Session not found'
    })
  }

  return session
})
