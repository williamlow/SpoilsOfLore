import { describe, expect, it, afterEach, vi } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { allStories, books, characters, sideStories } from '../data/catalog'
import {
  canLinkCharacter,
  isRead,
  loadCutoff,
  safeStoryIds,
  saveCutoff,
  validCutoff,
  visibleCharacters,
  visibleEntries,
} from './spoilers'
import type { Dossier, Synopsis } from './spoilers'

const readDossier = (id: string): Dossier =>
  JSON.parse(
    readFileSync(resolve('public/content/characters', `${id}.json`), 'utf8'),
  )

afterEach(() => vi.unstubAllGlobals())

describe('reading boundaries', () => {
  it.each([undefined, null, 0, -1, 55, 1.5, '3', {}, [], NaN, Infinity])(
    'rejects invalid saved cutoff %s',
    (value) => {
      expect(validCutoff(value)).toBeNull()
    },
  )
  it('accepts only the 54 complete numbered volumes', () => {
    expect(validCutoff(1)).toBe(1)
    expect(validCutoff(54)).toBe(54)
  })
  it('locks every character when no boundary is set', () => {
    expect(visibleCharacters(null)).toEqual([])
    expect(visibleEntries(readDossier('garviel-loken'), null)).toEqual([])
    expect(canLinkCharacter('garviel-loken', null)).toBe(false)
  })
  it('does not expose Dantioch or his later sections before their cutoffs', () => {
    const dossier = readDossier('barabas-dantioch')
    expect(visibleCharacters(15).some((c) => c.id === 'barabas-dantioch')).toBe(
      false,
    )
    expect(visibleEntries(dossier, 15)).toEqual([])
    expect(visibleEntries(dossier, 16).map((e) => e.through)).toEqual([16])
    expect(visibleEntries(dossier, 27).map((e) => e.through)).toEqual([16, 27])
    expect(visibleEntries(dossier, 34).map((e) => e.through)).toEqual([
      16, 27, 34,
    ])
    expect(JSON.stringify(visibleEntries(dossier, 27))).not.toContain(
      'overloads',
    )
    expect(safeStoryIds(dossier, 16)).toEqual(
      new Set(['age-of-darkness', 'the-iron-within']),
    )
    expect(safeStoryIds(dossier, 16).has('pharos')).toBe(false)
  })
  it('uses side-story reading placement without advancing the boundary', () => {
    const ironWithin = sideStories.find((b) => b.id === 'the-iron-within')!
    expect(isRead(ironWithin, 15)).toBe(false)
    expect(isRead(ironWithin, 16)).toBe(true)
    expect(isRead(books[16], 16)).toBe(false)
  })
  it('removes later content when a reader moves their boundary backwards', () => {
    const dossier = readDossier('garviel-loken')
    expect(visibleEntries(dossier, 3)).toHaveLength(3)
    expect(visibleEntries(dossier, 1).map((e) => e.bookId)).toEqual([
      'horus-rising',
    ])
    expect(canLinkCharacter('nathaniel-garro', 1)).toBe(false)
  })
})

describe('local persistence', () => {
  it('fails closed when storage is corrupted or unavailable', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => '{',
      setItem: () => {
        throw new Error('denied')
      },
    })
    expect(loadCutoff()).toBeNull()
    expect(saveCutoff(3)).toBe(false)
    vi.stubGlobal('localStorage', { getItem: () => '"54"' })
    expect(loadCutoff()).toBeNull()
  })
  it('round-trips a valid boundary and a reset', () => {
    let saved = ''
    vi.stubGlobal('localStorage', {
      getItem: () => saved,
      setItem: (_key: string, value: string) => {
        saved = value
      },
    })
    expect(saveCutoff(16)).toBe(true)
    expect(loadCutoff()).toBe(16)
    saveCutoff(null)
    expect(loadCutoff()).toBeNull()
  })
})

describe('archive content integrity', () => {
  it('has 54 contiguous main volumes and unique story IDs', () => {
    expect(books.map((b) => b.number)).toEqual(
      Array.from({ length: 54 }, (_, i) => i + 1),
    )
    expect(new Set(allStories.map((b) => b.id)).size).toBe(allStories.length)
    for (const story of sideStories)
      expect(validCutoff(story.anchor)).toBe(story.anchor)
  })
  it('has an actual overview file for every story', () => {
    for (const story of allStories) {
      const path = resolve('public/content/books', `${story.id}.json`)
      expect(existsSync(path), story.id).toBe(true)
      const synopsis: Synopsis = JSON.parse(readFileSync(path, 'utf8'))
      expect(synopsis.overview.length, story.id).toBeGreaterThan(0)
      if (synopsis.detailed)
        expect(synopsis.synopsis?.length, story.id).toBeGreaterThan(0)
    }
  })
  it('keeps dossier cutoffs, source references and inline links consistent', () => {
    for (const character of characters) {
      const dossier = readDossier(character.id)
      for (const entry of dossier.entries) {
        expect(validCutoff(entry.through), character.id).toBe(entry.through)
        expect(entry.through, character.id).toBeGreaterThanOrEqual(
          character.introducedAt,
        )
        expect(
          books.some((b) => b.id === entry.bookId),
          entry.bookId,
        ).toBe(true)
        if (entry.storyId) {
          const story = sideStories.find((b) => b.id === entry.storyId)
          expect(story, entry.storyId).toBeDefined()
          expect(story!.anchor).toBeLessThanOrEqual(entry.through)
        }
        for (const paragraph of entry.text) {
          for (const match of paragraph.matchAll(
            /\[\[([a-z0-9-]+)\|[^\]]+\]\]/g,
          )) {
            expect(
              canLinkCharacter(match[1], entry.through),
              `${character.id} -> ${match[1]}`,
            ).toBe(true)
          }
        }
      }
    }
  })
})
