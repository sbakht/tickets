import showsService from '../../../services/shows'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  const show = id ? showsService.getShow(id) : undefined

  if (!show) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Show not found'
    })
  }

  return show
})
