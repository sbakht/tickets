import sessionService from '../../services/session'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  const session = id ? sessionService.get(id) : undefined

  if (!session) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Session not found'
    })
  }

  return session
})
