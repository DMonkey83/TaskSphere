export function enumToOptions<E extends Record<string, string>>(e: E) {
  return (Object.keys(e) as Array<keyof E>).map((key) => ({
    label: key,
    value: e[key]
  }))
}
