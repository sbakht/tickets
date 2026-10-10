import showsService from '../../../services/shows'
import subscribeShow from '../../../services/showLive'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id || !showsService.getShow(id)) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Show not found'
    })
  }

  const stream = createEventStream(event)
  console.log(`SSE open /shows/${id}/stream`, event)

  const unsubscribe = subscribeShow(id, (update) => {
    console.log(`SSE push /shows/${id}/stream`, update)
    stream.push({
      event: 'show-update',
      data: JSON.stringify(update)
    }).catch(() => {
      // Client likely disconnected mid-push
    })
  })

  stream.onClosed(async () => {
    console.log(`SSE close /shows/${id}/stream`)
    unsubscribe()
    await stream.close()
  })

  return stream.send()
})
