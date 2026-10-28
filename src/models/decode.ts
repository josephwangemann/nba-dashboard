// Validate consumed fields and discard everything else at the API boundary.
export type Decoder<T> = (value: unknown) => T
export const text: Decoder<string> = value => {
  if (typeof value !== 'string') throw new Error('Expected text')
  return value
}
export const identity: Decoder<string> = value => {
  const id = text(value)
  if (!/^\d+$/.test(id)) throw new Error('Expected an ESPN identity')
  return id
}
export const finite: Decoder<number> = value => {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error('Expected a finite number')
  return value
}
export const boolean: Decoder<boolean> = value => {
  if (typeof value !== 'boolean') throw new Error('Expected a boolean')
  return value
}
export const optional = <T>(decode: Decoder<T>): Decoder<T | undefined> => value => value == null ? undefined : decode(value)
export const list = <T>(decode: Decoder<T>): Decoder<T[]> => value => {
  if (!Array.isArray(value)) throw new Error('Expected a list')
  return value.map(decode)
}
export const object = <S extends Record<string, Decoder<unknown>>>(shape: S): Decoder<{ [K in keyof S]: ReturnType<S[K]> }> => value => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected an object')
  const source = value as Record<string, unknown>
  return Object.fromEntries(Object.entries(shape).map(([key, decode]) => [key, decode(source[key])]).filter(([, item]) => item !== undefined)) as { [K in keyof S]: ReturnType<S[K]> }
}
export const teamIdentity = object({ id: identity, displayName: text })
export const position = object({ abbreviation: optional(text), displayName: optional(text) })
export const athleteIdentity = object({ id: identity, displayName: text, position: optional(position) })

export const dateText: Decoder<string> = value => {
  const date = text(value)
  if (!Number.isFinite(Date.parse(date))) throw new Error('Expected a valid date')
  return date
}

export const listOrEmpty = <T>(decode: Decoder<T>): Decoder<T[]> => value => value == null ? [] : list(decode)(value)
