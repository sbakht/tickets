export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname

  if (!path.startsWith('/api') && !path.startsWith('/shows')) {
    return
  }

  const method = getMethod(event)
  const start = Date.now()

  event.node.res.on('finish', () => {
    const status = event.node.res.statusCode
    const duration = Date.now() - start
    console.log(`${method} ${path} → ${status} (${duration}ms)`)
  })
})
