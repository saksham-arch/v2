// Straight-line (great-circle) distance in km. Never a walking route.
export function distanceKm([a, b], [c, d]) {
  const rad = Math.PI / 180
  const h = Math.sin((d - b) * rad / 2) ** 2 + Math.cos(b * rad) * Math.cos(d * rad) * Math.sin((c - a) * rad / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, h)))
}
