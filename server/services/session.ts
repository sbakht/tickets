export type Session = {
  id: string
  showId: string
  username: string
  email: string
  quantity: number
}

export type CreateSessionInput = Omit<Session, 'id'>

export type UpdateSessionInput = Partial<CreateSessionInput>

class SessionService {
  private sessions = new Map<string, Session>()

  create(input: CreateSessionInput) {
    const session: Session = {
      id: crypto.randomUUID(),
      showId: input.showId,
      username: input.username,
      email: input.email,
      quantity: input.quantity
    }

    this.sessions.set(session.id, session)
    return session
  }

  get(id: string) {
    return this.sessions.get(id)
  }

  update(id: string, patch: UpdateSessionInput) {
    const session = this.sessions.get(id)
    if (!session) {
      return undefined
    }

    Object.assign(session, patch)
    return session
  }

  delete(id: string) {
    return this.sessions.delete(id)
  }
}

export default new SessionService()
