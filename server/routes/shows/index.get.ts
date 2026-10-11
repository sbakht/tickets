import { defineEventHandler } from 'h3'
import showsService from '../../services/shows'

export default defineEventHandler(() => {
  return showsService.listShows()
})
