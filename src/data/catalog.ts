export type Book = {
  id: string
  title: string
  author: string
  year: number
  number: number
  kind: 'Novel' | 'Anthology' | 'Short story' | 'Novella'
  factions: string[]
  anchor?: number
  source?: string
}

type Row = [string, string, number, string[], boolean?]
const rows: Row[] = [
  ['Horus Rising', 'Dan Abnett', 2006, ['Luna Wolves']],
  ['False Gods', 'Graham McNeill', 2006, ['Luna Wolves']],
  [
    'Galaxy in Flames',
    'Ben Counter',
    2006,
    ['Sons of Horus', 'Emperor’s Children', 'Death Guard', 'World Eaters'],
  ],
  [
    'The Flight of the Eisenstein',
    'James Swallow',
    2007,
    ['Death Guard', 'Imperial Fists'],
  ],
  ['Fulgrim', 'Graham McNeill', 2007, ['Emperor’s Children', 'Iron Hands']],
  ['Descent of Angels', 'Mitchel Scanlon', 2007, ['Dark Angels']],
  ['Legion', 'Dan Abnett', 2008, ['Alpha Legion', 'Imperial Army']],
  [
    'Battle for the Abyss',
    'Ben Counter',
    2008,
    ['Ultramarines', 'Word Bearers'],
  ],
  ['Mechanicum', 'Graham McNeill', 2008, ['Mechanicum']],
  ['Tales of Heresy', 'Various authors', 2009, ['Imperium'], true],
  ['Fallen Angels', 'Mike Lee', 2009, ['Dark Angels']],
  [
    'A Thousand Sons',
    'Graham McNeill',
    2010,
    ['Thousand Sons', 'Space Wolves'],
  ],
  ['Nemesis', 'James Swallow', 2010, ['Officio Assassinorum']],
  ['The First Heretic', 'Aaron Dembski-Bowden', 2010, ['Word Bearers']],
  ['Prospero Burns', 'Dan Abnett', 2011, ['Space Wolves', 'Thousand Sons']],
  ['Age of Darkness', 'Various authors', 2011, ['Imperium'], true],
  ['The Outcast Dead', 'Graham McNeill', 2011, ['Imperium']],
  ['Deliverance Lost', 'Gav Thorpe', 2011, ['Raven Guard', 'Alpha Legion']],
  ['Know No Fear', 'Dan Abnett', 2012, ['Ultramarines', 'Word Bearers']],
  ['The Primarchs', 'Various authors', 2012, ['Imperium'], true],
  ['Fear to Tread', 'James Swallow', 2012, ['Blood Angels']],
  [
    'Shadows of Treachery',
    'Various authors',
    2012,
    ['Imperial Fists', 'Night Lords'],
    true,
  ],
  [
    'Angel Exterminatus',
    'Graham McNeill',
    2012,
    ['Iron Warriors', 'Emperor’s Children'],
  ],
  ['Betrayer', 'Aaron Dembski-Bowden', 2012, ['World Eaters', 'Word Bearers']],
  [
    'Mark of Calth',
    'Various authors',
    2013,
    ['Ultramarines', 'Word Bearers'],
    true,
  ],
  ['Vulkan Lives', 'Nick Kyme', 2013, ['Salamanders']],
  [
    'The Unremembered Empire',
    'Dan Abnett',
    2013,
    ['Ultramarines', 'Dark Angels', 'Blood Angels'],
  ],
  ['Scars', 'Chris Wraight', 2014, ['White Scars']],
  ['Vengeful Spirit', 'Graham McNeill', 2014, ['Sons of Horus']],
  [
    'The Damnation of Pythos',
    'David Annandale',
    2014,
    ['Iron Hands', 'Salamanders', 'Raven Guard'],
  ],
  ['Legacies of Betrayal', 'Various authors', 2014, ['Imperium'], true],
  ['Deathfire', 'Nick Kyme', 2015, ['Salamanders']],
  ['War Without End', 'Various authors', 2016, ['Imperium'], true],
  [
    'Pharos',
    'Guy Haley',
    2015,
    ['Ultramarines', 'Night Lords', 'Iron Warriors'],
  ],
  ['Eye of Terra', 'Various authors', 2016, ['Imperium'], true],
  ['The Path of Heaven', 'Chris Wraight', 2016, ['White Scars']],
  ['The Silent War', 'Various authors', 2016, ['Imperium'], true],
  ['Angels of Caliban', 'Gav Thorpe', 2016, ['Dark Angels']],
  [
    'Praetorian of Dorn',
    'John French',
    2016,
    ['Imperial Fists', 'Alpha Legion'],
  ],
  ['Corax', 'Gav Thorpe', 2016, ['Raven Guard'], true],
  [
    'The Master of Mankind',
    'Aaron Dembski-Bowden',
    2016,
    ['Adeptus Custodes', 'Mechanicum'],
  ],
  ['Garro', 'James Swallow', 2017, ['Death Guard']],
  [
    'Shattered Legions',
    'Various authors',
    2017,
    ['Iron Hands', 'Salamanders', 'Raven Guard'],
    true,
  ],
  ['The Crimson King', 'Graham McNeill', 2017, ['Thousand Sons']],
  ['Tallarn', 'John French', 2017, ['Imperial Army', 'Iron Warriors']],
  [
    'Ruinstorm',
    'David Annandale',
    2017,
    ['Blood Angels', 'Ultramarines', 'Dark Angels'],
  ],
  ['Old Earth', 'Nick Kyme', 2017, ['Salamanders']],
  ['The Burden of Loyalty', 'Various authors', 2018, ['Imperium'], true],
  ['Wolfsbane', 'Guy Haley', 2018, ['Space Wolves', 'Sons of Horus']],
  ['Born of Flame', 'Nick Kyme', 2018, ['Salamanders'], true],
  [
    'Slaves to Darkness',
    'John French',
    2018,
    ['Sons of Horus', 'Iron Warriors', 'Word Bearers'],
  ],
  ['Heralds of the Siege', 'Various authors', 2018, ['Imperium'], true],
  ['Titandeath', 'Guy Haley', 2018, ['Mechanicum']],
  ['The Buried Dagger', 'James Swallow', 2019, ['Death Guard']],
]

export function slug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export const books: Book[] = rows.map(
  ([title, author, year, factions, anthology], i) => ({
    id: slug(title),
    title,
    author,
    year,
    factions,
    number: i + 1,
    kind: anthology ? 'Anthology' : 'Novel',
  }),
)

// Side-story placement is a curated reading window, not a claim of exact chronology.
// Character entries may require a later cutoff than a story's placement.
export const sideStories: Book[] = [
  {
    id: 'the-wolf-of-ash-and-fire',
    title: 'The Wolf of Ash and Fire',
    author: 'Graham McNeill',
    year: 2014,
    number: 0,
    kind: 'Short story',
    anchor: 1,
    source: 'Eye of Terra',
    factions: ['Luna Wolves'],
  },
  {
    id: 'the-last-church',
    title: 'The Last Church',
    author: 'Graham McNeill',
    year: 2009,
    number: 0,
    kind: 'Short story',
    anchor: 1,
    source: 'Tales of Heresy',
    factions: ['Imperium'],
  },
  {
    id: 'after-deshea',
    title: 'After Desh’ea',
    author: 'Matthew Farrer',
    year: 2009,
    number: 0,
    kind: 'Short story',
    anchor: 2,
    source: 'Tales of Heresy',
    factions: ['World Eaters'],
  },
  {
    id: 'blood-games',
    title: 'Blood Games',
    author: 'Dan Abnett',
    year: 2009,
    number: 0,
    kind: 'Short story',
    anchor: 4,
    source: 'Tales of Heresy',
    factions: ['Adeptus Custodes'],
  },
  {
    id: 'the-voice',
    title: 'The Voice',
    author: 'James Swallow',
    year: 2009,
    number: 0,
    kind: 'Short story',
    anchor: 10,
    source: 'Tales of Heresy',
    factions: ['Sisters of Silence'],
  },
  {
    id: 'the-iron-within',
    title: 'The Iron Within',
    author: 'Rob Sanders',
    year: 2011,
    number: 0,
    kind: 'Short story',
    anchor: 16,
    source: 'Age of Darkness',
    factions: ['Iron Warriors'],
  },
  {
    id: 'little-horus',
    title: 'Little Horus',
    author: 'Dan Abnett',
    year: 2011,
    number: 0,
    kind: 'Short story',
    anchor: 16,
    source: 'Age of Darkness',
    factions: ['Sons of Horus'],
  },
  {
    id: 'the-lightning-tower',
    title: 'The Lightning Tower',
    author: 'Dan Abnett',
    year: 2007,
    number: 0,
    kind: 'Short story',
    anchor: 22,
    source: 'Shadows of Treachery',
    factions: ['Imperial Fists'],
  },
  {
    id: 'prince-of-crows',
    title: 'Prince of Crows',
    author: 'Aaron Dembski-Bowden',
    year: 2012,
    number: 0,
    kind: 'Novella',
    anchor: 22,
    source: 'Shadows of Treachery',
    factions: ['Night Lords'],
  },
]

export const factions = [
  ...new Set([...books, ...sideStories].flatMap((b) => b.factions)),
].sort()
export const popularFactions = [
  'Luna Wolves',
  'Mechanicum',
  'Ultramarines',
  'Iron Warriors',
]

export type Character = {
  id: string
  name: string
  initials: string
  group: string
  faction: string
  introducedAt: number
  featured?: boolean
}

// Separate identities have separate files. Never add an alias or successor-name link.
export const characters: Character[] = [
  {
    id: 'garviel-loken',
    name: 'Garviel Loken',
    initials: 'GL',
    group: 'Astartes',
    faction: 'Luna Wolves',
    introducedAt: 1,
    featured: true,
  },
  {
    id: 'horus-lupercal',
    name: 'Horus Lupercal',
    initials: 'HL',
    group: 'Primarchs',
    faction: 'Luna Wolves',
    introducedAt: 1,
    featured: true,
  },
  {
    id: 'euphrati-keeler',
    name: 'Euphrati Keeler',
    initials: 'EK',
    group: 'Remembrancers',
    faction: 'Imperium',
    introducedAt: 1,
    featured: true,
  },
  {
    id: 'saul-tarvitz',
    name: 'Saul Tarvitz',
    initials: 'ST',
    group: 'Astartes',
    faction: 'Emperor’s Children',
    introducedAt: 1,
    featured: true,
  },
  {
    id: 'nathaniel-garro',
    name: 'Nathaniel Garro',
    initials: 'NG',
    group: 'Astartes',
    faction: 'Death Guard',
    introducedAt: 4,
    featured: true,
  },
  {
    id: 'dalia-cythera',
    name: 'Dalia Cythera',
    initials: 'DC',
    group: 'Mechanicum',
    faction: 'Mechanicum',
    introducedAt: 9,
  },
  {
    id: 'ahriman',
    name: 'Ahzek Ahriman',
    initials: 'AA',
    group: 'Astartes',
    faction: 'Thousand Sons',
    introducedAt: 12,
  },
  {
    id: 'argel-tal',
    name: 'Argel Tal',
    initials: 'AT',
    group: 'Astartes',
    faction: 'Word Bearers',
    introducedAt: 14,
  },
  {
    id: 'barabas-dantioch',
    name: 'Barabas Dantioch',
    initials: 'BD',
    group: 'Astartes',
    faction: 'Iron Warriors',
    introducedAt: 16,
    featured: true,
  },
]

export const allStories = [...books, ...sideStories]
