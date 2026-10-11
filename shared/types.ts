export type Show = {
  id: string
  title: string
  description: string
  image: string
  price: number
  newPrice?: number
  remaining: number
}

export type ShowUpdate = {
  remaining: number
  price: number
  newPrice?: number
}

export type Session = {
  id: string
  showId: string
  username: string
  email: string
  quantity: number
  complete: boolean
}
