import showsService from '../../services/shows'

export default defineEventHandler(() => {
  return showsService.listShows()
})
