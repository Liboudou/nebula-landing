export function nextIndex(current, total, step) {
  if (current + step < 0) return total - 1
  if (current + step >= total) return 0
  return current + step
}

export function autoplayDelay(paused) {
  if (paused) return null
  return 5000
}
