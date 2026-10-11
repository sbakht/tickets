import randomPick from '../utils/randomPick'
import showsService from './shows'

const simulators = new Map<string, ReturnType<typeof setInterval>>()

function tickShow(id: string) {
  const show = showsService.getShow(id)
  if (!show) return

  const current = show.newPrice ?? show.price
  const next = current + (Math.random() < 0.5 ? 5 : -5)
  if (next > 0 && next !== show.newPrice) {
    showsService.updateShow(id, { newPrice: next })
  }
}

function tickRemaining(id: string) {
  const show = showsService.getShow(id)
  if (!show || show.remaining <= 0) return

  showsService.updateShow(id, { remaining: show.remaining - 1 })
}

const showSimulator = {
  ensure(id: string) {
    if (simulators.has(id)) return
    if (!showsService.getShow(id)) return

    const timer = setInterval(
      randomPick([
        () => tickShow(id),
        () => tickRemaining(id)
      ]),
      4000 + Math.floor(Math.random() * 4000)
    )

    simulators.set(id, timer)
  },

  stop(id: string) {
    const timer = simulators.get(id)
    if (timer) {
      clearInterval(timer)
      simulators.delete(id)
    }
  },

  stopAll() {
    for (const id of [...simulators.keys()]) {
      showSimulator.stop(id)
    }
  }
}

export default showSimulator
