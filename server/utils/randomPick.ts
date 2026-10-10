export default function randomPick<Args extends unknown[], R>(
  fns: Array<(...args: Args) => R>
) {
  return (...args: Args): R => {
    const fn = fns[Math.floor(Math.random() * fns.length)]!
    return fn(...args)
  }
}
