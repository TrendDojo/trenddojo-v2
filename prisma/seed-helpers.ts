import crypto from 'crypto'

export function generateId(): string {
  return crypto.randomUUID()
}

export function now(): Date {
  return new Date()
}

export interface WithId {
  id: string
}

export interface WithTimestamps {
  createdAt: Date
  updatedAt: Date
}

export function withId<T>(data: T): T & WithId {
  return { ...data, id: generateId() }
}

export function withTimestamps<T>(data: T): T & WithTimestamps {
  const now = new Date()
  return { ...data, createdAt: now, updatedAt: now }
}

export function withIdAndTimestamps<T>(data: T): T & WithId & WithTimestamps {
  return withTimestamps(withId(data))
}