import shows from '../../data/shows.json'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  const show = shows.find(s => s.id === id)

  if (!show) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Show not found'
    })
  }

  return show
})
