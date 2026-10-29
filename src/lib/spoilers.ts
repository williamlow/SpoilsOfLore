import { books, characters } from '../data/catalog'
import type { Book, Character } from '../data/catalog'

export type ReadingEntry = {
  bookId: string
  through: number
  text: string[]
  storyId?: string
}
export type Dossier = { entries: ReadingEntry[]; note?: string }
export type Synopsis = {
  overview: string[]
  synopsis?: string[]
  detailed?: string[]
  note?: string
}

export const STORAGE_KEY = 'spoils-of-lore.reading-cutoff.v1'
export function validCutoff(value: unknown): number | null {
  return typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= books.length
    ? value
    : null
}
export function loadCutoff(): number | null {
  try {
    return validCutoff(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'))
  } catch {
    return null
  }
}
export function saveCutoff(value: number | null): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validCutoff(value)))
    return true
  } catch {
    return false
  }
}
export function isRead(book: Book, cutoff: number | null): boolean {
  return cutoff !== null && (book.anchor ?? book.number) <= cutoff
}
export function visibleCharacters(cutoff: number | null): Character[] {
  return cutoff === null
    ? []
    : characters.filter((c) => c.introducedAt <= cutoff)
}
export function visibleEntries(
  dossier: Dossier,
  cutoff: number | null,
): ReadingEntry[] {
  if (cutoff === null) return []
  return dossier.entries
    .filter((e) => e.through <= cutoff)
    .sort((a, b) => a.through - b.through)
}
export function canLinkCharacter(id: string, cutoff: number | null): boolean {
  return visibleCharacters(cutoff).some((c) => c.id === id)
}
export function safeStoryIds(
  dossier: Dossier,
  cutoff: number | null,
): Set<string> {
  return new Set(
    visibleEntries(dossier, cutoff).flatMap((e) => [
      e.bookId,
      ...(e.storyId ? [e.storyId] : []),
    ]),
  )
}

export async function fetchContent<T>(
  kind: 'books' | 'characters',
  id: string,
  signal?: AbortSignal,
): Promise<T> {
  // Content is fetched only on opening a gated page. No spoiler snippets in the catalog.
  if (!/^[a-z0-9-]+$/.test(id)) throw new Error('Invalid archive identifier')
  const response = await fetch(
    `${import.meta.env.BASE_URL}content/${kind}/${id}.json`,
    { signal },
  )
  if (!response.ok)
    throw new Error('This archive entry could not be loaded. Please try again.')
  const type = response.headers.get('content-type') || ''
  if (!type.includes('application/json'))
    throw new Error('This archive entry is not available yet.')
  return response.json()
}
