import showsService, { type ShowUpdate } from './shows'
import showSimulator from './showSimulator'

type ShowListener = (update: ShowUpdate) => void

const listeners = new Map<string, Set<ShowListener>>()

showsService.onChange((show) => {
  const set = listeners.get(show.id)
  if (!set) return

  const update = showsService.getShowUpdates(show)
  for (const listener of set) {
    listener(update)
  }
})

function stopSimulatorIfIdle(id: string) {
  const set = listeners.get(id)
  if (set && set.size > 0) return

  showSimulator.stop(id)
  listeners.delete(id)
}

export default function subscribeShow(id: string, cb: ShowListener) {
  const show = showsService.getShow(id)
  if (!show) {
    return () => {}
  }

  let set = listeners.get(id)
  if (!set) {
    set = new Set()
    listeners.set(id, set)
  }
  set.add(cb)
  showSimulator.ensure(id)

  cb(showsService.getShowUpdates(show))

  return () => {
    set!.delete(cb)
    stopSimulatorIfIdle(id)
  }
}
