export function buildQuery(params: Record<string, string | number | readonly string[] | undefined>): string {
  const entries: string[] = []
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) return
    if (Array.isArray(value)) {
      value.forEach((item) => {
        entries.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`)
      })
      return
    }
    if (value !== '') {
      entries.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    }
  })
  if (!entries.length) {
    return ''
  }
  return `?${entries.join('&')}`
}
