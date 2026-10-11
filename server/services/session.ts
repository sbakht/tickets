import type { Session } from '../../shared/types'
import showsServiceDefault, { type ShowsService } from './shows'

export type CreateSessionInput = {
  showId: string
  quantity: number
  username?: string
  email?: string
}

export type UpdateSessionInput = Partial<Pick<Session, 'username' | 'email' | 'quantity'>>

export class SessionService {
  private sessions = new Map<string, Session>()

  constructor(private readonly shows: ShowsService = showsServiceDefault) {}

  create(input: CreateSessionInput) {
    if (!this.shows.getShow(input.showId)) {
      return undefined
    }

    const session: Session = {
      id: crypto.randomUUID(),
      showId: input.showId,
      username: input.username ?? '',
      email: input.email ?? '',
      quantity: input.quantity,
      complete: false
    }

    this.sessions.set(session.id, session)
    return session
  }

  get(id: string) {
    return this.sessions.get(id)
  }

  update(id: string, patch: UpdateSessionInput) {
    const session = this.sessions.get(id)
    if (!session || session.complete) {
      return undefined
    }

    Object.assign(session, patch)
    return session
  }

  complete(id: string) {
    const session = this.sessions.get(id)
    if (!session) {
      return undefined
    }

    session.complete = true
    return session
  }

  resetForTests() {
    this.sessions.clear()
  }
}

const sessionService = new SessionService()
export default sessionService
