import type { Show, ShowUpdate } from '../../shared/types'
import showsData from '../data/shows.json'

export type UpdateShowInput = Partial<Omit<Show, 'id'>>

type ChangeHandler = (show: Show, previous: ShowUpdate) => void

class ShowsService {
  private shows = structuredClone(showsData) as Show[]
  private changeHandlers = new Set<ChangeHandler>()

  listShows() {
    return this.shows
  }

  getShow(id: string) {
    return this.shows.find(s => s.id === id)
  }

  updateShow(id: string, patch: UpdateShowInput) {
    const show = this.getShow(id)
    if (!show) {
      return undefined
    }

    const previous = this.getShowUpdates(show)
    Object.assign(show, patch)

    for (const handler of this.changeHandlers) {
      handler(show, previous)
    }

    return show
  }

  onChange(handler: ChangeHandler) {
    this.changeHandlers.add(handler)
    return () => {
      this.changeHandlers.delete(handler)
    }
  }

  getShowUpdates(show: Show): ShowUpdate {
    return {
      remaining: show.remaining,
      price: show.price,
      newPrice: show.newPrice
    }
  }
}

export default new ShowsService()
