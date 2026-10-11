import sessionService from '../../services/session'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')

  if (!id || !sessionService.delete(id)) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Session not found'
    })
  }

  return { ok: true }
})
