import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  GitBranch,
  Info,
  LockKeyhole,
  Map,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  X,
} from 'lucide-react'
import {
  allStories,
  books,
  characters,
  factions,
  popularFactions,
  sideStories,
} from './data/catalog'
import type { Book, Character } from './data/catalog'
import {
  canLinkCharacter,
  fetchContent,
  isRead,
  loadCutoff,
  safeStoryIds,
  saveCutoff,
  visibleCharacters,
  visibleEntries,
} from './lib/spoilers'
import type { Dossier, Synopsis } from './lib/spoilers'
import { Modal, SearchBox, SelectField, StarMap, Toast } from './components'
import type { SearchOption } from './components'

type Filter = { id: string; label: string; type: 'faction' | 'character' }
const pad = (n: number) => String(n).padStart(2, '0')

export default function App() {
  const [view, setView] = useState<'stories' | 'characters'>('stories')
  const [cutoff, setCutoff] = useState(loadCutoff)
  const [progressOpen, setProgressOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [showSides, setShowSides] = useState(true)
  const [filter, setFilter] = useState<Filter | null>(null)
  const [filterIds, setFilterIds] = useState<Set<string> | null>(null)
  const [filterLoading, setFilterLoading] = useState(false)
  const [filterError, setFilterError] = useState('')
  const [openedBook, setOpenedBook] = useState<Book | null>(null)
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null,
  )
  const [toast, setToast] = useState('')
  const directory = useRef<HTMLDivElement>(null)
  const allowedCharacters = visibleCharacters(cutoff)
  const endBook = cutoff === null ? null : books[cutoff - 1]

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(''), 5000)
    return () => clearTimeout(timeout)
  }, [toast])

  useEffect(() => {
    setFilterIds(null)
    setFilterError('')
    if (filter?.type !== 'character' || cutoff === null) {
      setFilterLoading(false)
      return
    }
    const controller = new AbortController()
    setFilterLoading(true)
    fetchContent<Dossier>('characters', filter.id, controller.signal)
      .then((data) => {
        setFilterIds(safeStoryIds(data, cutoff))
        setFilterLoading(false)
      })
      .catch((e) => {
        if (e.name !== 'AbortError') {
          setFilterError(e.message)
          setFilterLoading(false)
        }
      })
    return () => controller.abort()
  }, [filter, cutoff])

  function updateCutoff(value: number | null) {
    const stored = saveCutoff(value)
    setCutoff(value)
    setSelectedCharacter(null)
    if (filter?.type === 'character') setFilter(null)
    setProgressOpen(false)
    setToast(
      value === null
        ? 'Reading progress cleared.'
        : stored
          ? 'Reading progress saved on this device.'
          : 'Progress set for this visit. Browser storage is unavailable.',
    )
  }
  function changeView(next: 'stories' | 'characters') {
    setView(next)
    if (next === 'characters' && cutoff === null) setProgressOpen(true)
  }
  function openCharacter(character: Character) {
    if (cutoff === null) {
      setProgressOpen(true)
      return
    }
    if (!allowedCharacters.some((c) => c.id === character.id)) return
    setSelectedCharacter(character)
    requestAnimationFrame(() =>
      directory.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    )
  }
  function matches(book: Book) {
    if (!filter) return true
    if (filter.type === 'faction') return book.factions.includes(filter.label)
    return isRead(book, cutoff) && (filterIds?.has(book.id) ?? false)
  }
  const storyOptions: SearchOption[] = [
    ...factions.map((label) => ({
      id: `faction:${label}`,
      label,
      category: 'Legion or faction',
    })),
    ...allowedCharacters.map((c) => ({
      id: `character:${c.id}`,
      label: c.name,
      category: 'Character · within your progress',
    })),
  ]

  return (
    <>
      <header className="site-header">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault()
            setView('stories')
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          aria-label="The Spoils of Lore home"
        >
          <span className="brand-icon">
            <BookOpen size={26} strokeWidth={1.4} />
          </span>
          <span className="brand-name">
            THE SPOILS <i>of</i> LORE<span>A HORUS HERESY COMPANION</span>
          </span>
        </a>
        <nav className="view-tabs" aria-label="Main views">
          <button
            className={view === 'stories' ? 'active' : ''}
            onClick={() => changeView('stories')}
            aria-current={view === 'stories' ? 'page' : undefined}
          >
            <GitBranch size={17} />
            Story view
          </button>
          <button
            className={view === 'characters' ? 'active' : ''}
            onClick={() => changeView('characters')}
            aria-current={view === 'characters' ? 'page' : undefined}
          >
            <Users size={17} />
            Character view
          </button>
        </nav>
        <button
          className="progress-button"
          onClick={() => setProgressOpen(true)}
        >
          <ShieldCheck size={17} />
          <span>
            {cutoff
              ? `Read through book ${pad(cutoff)}`
              : 'Set reading progress'}
          </span>
          <ChevronRight size={14} />
        </button>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <p className="eyebrow">
              <span className="tiny-diamond" /> THE READER’S ARCHIVE{' '}
              <span className="edition">/ FIRST EDITION</span>
            </p>
            <h1>
              {view === 'stories' ? (
                <>
                  A galaxy of stories.
                  <br />
                  <em>Find your own way.</em>
                </>
              ) : (
                <>
                  Their story.
                  <br />
                  <em>As far as yours.</em>
                </>
              )}
            </h1>
            <p className="hero-description">
              {view === 'stories'
                ? 'Navigate the Horus Heresy, one story at a time. Follow the main path, explore the branches, and leave the unknown untouched.'
                : 'Revisit the people behind the Heresy. Only the experiences within your reading progress belong on these pages.'}
            </p>
            <div className="hero-assurance">
              <ShieldCheck size={14} />
              <span>Your reading progress is the boundary. Always.</span>
            </div>
          </div>
          <div className="hero-art">
            <StarMap />
            <span className="hero-coordinate">ARCHIVE // 001.M31</span>
          </div>
        </section>

        <div className="workspace">
          <aside className="sidebar">
            <div className="sidebar-heading">
              <span>
                {view === 'stories'
                  ? 'CHART YOUR COURSE'
                  : 'YOUR READING WINDOW'}
              </span>
              <SlidersHorizontal size={14} />
            </div>
            {view === 'stories' ? (
              <>
                <p className="field-caption">FOLLOW A THREAD</p>
                <SearchBox
                  label="Search story filters"
                  placeholder="Legion, faction, character…"
                  options={storyOptions}
                  onSelect={(o) => {
                    const [type, ...rest] = o.id.split(':')
                    setFilter({
                      id: rest.join(':'),
                      label: o.label,
                      type: type as Filter['type'],
                    })
                  }}
                />
                <p className="small-label">POPULAR FACTIONS</p>
                <div className="faction-chips">
                  {popularFactions.map((f) => (
                    <button
                      key={f}
                      className={filter?.label === f ? 'chosen' : ''}
                      onClick={() =>
                        setFilter(
                          filter?.label === f
                            ? null
                            : { id: f, label: f, type: 'faction' },
                        )
                      }
                    >
                      {f}
                      {filter?.label === f && <X size={12} />}
                    </button>
                  ))}
                </div>
                <p className="sidebar-hint">
                  Character filters become available within your saved reading
                  progress.
                </p>
                <div className="sidebar-rule" />
                <p className="field-caption">JUMP TO A VOLUME</p>
                <SearchBox
                  label="Find a book"
                  placeholder="Title or book number…"
                  options={books.map((b) => ({
                    id: b.id,
                    label: `${pad(b.number)} · ${b.title}`,
                    category: b.author,
                  }))}
                  onSelect={(o) => {
                    setFilter(null)
                    requestAnimationFrame(() =>
                      document
                        .getElementById(`story-${o.id}`)
                        ?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'center',
                        }),
                    )
                  }}
                />
                <div className="map-key">
                  <p className="small-label">READING MAP KEY</p>
                  <span>
                    <i className="key-line" />
                    Main sequence
                  </span>
                  <span>
                    <i className="key-branch" />
                    Side story
                  </span>
                  <span>
                    <i className="key-dot" />
                    Within your reading progress
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="reading-window">
                  <ShieldCheck size={24} />
                  <p>
                    {endBook ? (
                      <>
                        Through book {pad(endBook.number)}
                        <strong>{endBook.title}</strong>
                      </>
                    ) : (
                      <>
                        Your journey starts here
                        <strong>Set your boundary</strong>
                      </>
                    )}
                  </p>
                  <button
                    className="text-button"
                    onClick={() => setProgressOpen(true)}
                  >
                    {cutoff ? 'Edit reading progress' : 'Choose your last book'}
                    <ArrowRight size={14} />
                  </button>
                </div>
                <p className="sidebar-hint">
                  No future appearances. No appearance counts. No connections to
                  another identity.
                </p>
              </>
            )}
            <div className="sidebar-note">
              <BookOpen size={19} strokeWidth={1.5} />
              <h3>A companion, at your pace.</h3>
              <p>
                Open a story when you’re ready. The character archive never
                reads ahead of you.
              </p>
              <button className="text-button" onClick={() => setInfoOpen(true)}>
                How the archive works
                <ArrowRight size={13} />
              </button>
            </div>
          </aside>

          <div className="main-panel">
            {view === 'stories' ? (
              <>
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">THE HORUS HERESY</p>
                    <h2>The road to Terra</h2>
                  </div>
                  <span className="catalog-total">
                    54 VOLUMES <span>/</span> ONE MAIN PATH
                  </span>
                </div>
                <div className="map-toolbar">
                  <div className="segment-control" aria-label="Visible stories">
                    <button
                      className={showSides ? 'selected' : ''}
                      aria-pressed={showSides}
                      onClick={() => setShowSides(true)}
                    >
                      <GitBranch size={14} />
                      All stories
                    </button>
                    <button
                      className={!showSides ? 'selected' : ''}
                      aria-pressed={!showSides}
                      onClick={() => setShowSides(false)}
                    >
                      <BookOpen size={14} />
                      Main books
                    </button>
                  </div>
                  <span className="toolbar-caption">
                    <ArrowDown size={13} />
                    Publication sequence
                  </span>
                </div>
                <p className="catalog-note">
                  All 54 numbered volumes, with a curated selection of side
                  stories.{' '}
                  <button
                    className="inline-link"
                    onClick={() => setInfoOpen(true)}
                  >
                    Coverage & reading order
                  </button>
                </p>
                {filter && (
                  <div className="active-filter">
                    <span>
                      {filter.type === 'character'
                        ? 'Curated entries within your progress'
                        : 'Following a faction'}
                      <strong>{filter.label}</strong>
                    </span>
                    <button
                      className="icon-button"
                      aria-label="Clear story filter"
                      onClick={() => setFilter(null)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                {filterLoading ? (
                  <div className="empty-state compact" role="status">
                    <span className="loading-dot" />
                    Opening the permitted archive…
                  </div>
                ) : filterError ? (
                  <div className="empty-state compact" role="alert">
                    <p>{filterError}</p>
                    <button
                      className="secondary-button"
                      onClick={() => setFilter(null)}
                    >
                      Clear filter
                    </button>
                  </div>
                ) : (
                  <>
                    <div
                      className={`story-map ${showSides ? '' : 'main-only'}`}
                      aria-label="Ordered reading map"
                    >
                      {books.map((book) => {
                        const branches = showSides
                          ? sideStories.filter(
                              (s) => s.anchor === book.number && matches(s),
                            )
                          : []
                        if (!matches(book) && !branches.length) return null
                        return (
                          <div className="story-group" key={book.id}>
                            {(book.number === 1 ||
                              ((book.number - 1) % 9 === 0 && !filter)) && (
                              <div className="sequence-marker">
                                <span>
                                  SEQUENCE{' '}
                                  {pad(Math.floor((book.number - 1) / 9) + 1)}
                                </span>
                                <i />
                                <span>
                                  VOLUMES {pad(book.number)}–
                                  {pad(Math.min(book.number + 8, 54))}
                                </span>
                              </div>
                            )}
                            <div className="story-row" id={`story-${book.id}`}>
                              <div
                                className={`timeline-node ${isRead(book, cutoff) ? 'read' : ''}`}
                              >
                                <span>{pad(book.number)}</span>
                                <i>
                                  {isRead(book, cutoff) && <Check size={10} />}
                                </i>
                              </div>
                              <div className="spine-card">
                                {matches(book) ? (
                                  <BookCard
                                    book={book}
                                    cutoff={cutoff}
                                    onOpen={setOpenedBook}
                                  />
                                ) : (
                                  <div className="filtered-anchor">
                                    Book {pad(book.number)}
                                    <small>Side-story reading window</small>
                                  </div>
                                )}
                              </div>
                              {branches.length > 0 && (
                                <div className="side-branches">
                                  {branches.map((story) => (
                                    <button
                                      className="side-story"
                                      key={story.id}
                                      onClick={() => setOpenedBook(story)}
                                    >
                                      <span className="branch-symbol">
                                        <GitBranch size={13} />
                                      </span>
                                      <small>{story.kind}</small>
                                      <strong>{story.title}</strong>
                                      <span>
                                        {story.author}
                                        <ArrowRight size={13} />
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    {filter &&
                      !books.some(matches) &&
                      !(showSides && sideStories.some(matches)) && (
                        <div className="empty-state compact">
                          <Map size={30} />
                          <h3>No curated entries in this view</h3>
                          <p>
                            Try all stories or clear the filter. This makes no
                            claim about unrecorded or future appearances.
                          </p>
                          <button
                            className="secondary-button"
                            onClick={() => setFilter(null)}
                          >
                            Clear filter
                          </button>
                        </div>
                      )}
                    <div className="map-end">
                      <span className="end-diamond">◇</span>
                      <p>At the gates of Terra.</p>
                      <span>
                        The Siege of Terra is a separate series, beyond this
                        edition of the archive.
                      </span>
                      <button
                        className="text-button"
                        onClick={() =>
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }
                      >
                        Back to the beginning
                        <RotateCcw size={13} />
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div ref={directory} className="character-panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">THE PEOPLE BEHIND THE STORIES</p>
                    <h2>The character archive</h2>
                  </div>
                  <Users className="heading-icon" size={24} strokeWidth={1.3} />
                </div>
                {cutoff === null ? (
                  <div className="empty-state character-gate">
                    <div className="gate-icon">
                      <LockKeyhole size={27} strokeWidth={1.4} />
                    </div>
                    <p className="eyebrow">YOUR KNOWLEDGE IS THE LIMIT</p>
                    <h3>
                      Tell us where you are.
                      <br />
                      We’ll meet you there.
                    </h3>
                    <p>
                      Choose the last main-sequence book you’ve finished. Every
                      character page will stop at that point.
                    </p>
                    <button
                      className="primary-button"
                      onClick={() => setProgressOpen(true)}
                    >
                      Set reading progress
                      <ArrowRight size={16} />
                    </button>
                  </div>
                ) : selectedCharacter &&
                  allowedCharacters.some(
                    (c) => c.id === selectedCharacter.id,
                  ) ? (
                  <CharacterReader
                    key={`${selectedCharacter.id}-${cutoff}`}
                    character={selectedCharacter}
                    cutoff={cutoff}
                    onBack={() => setSelectedCharacter(null)}
                    onCharacter={(id) => {
                      const c = characters.find((c) => c.id === id)
                      if (c) openCharacter(c)
                    }}
                    onBook={setOpenedBook}
                  />
                ) : (
                  <CharacterDirectory
                    characters={allowedCharacters}
                    onSelect={openCharacter}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="site-footer">
        <span className="footer-brand">
          <BookOpen size={16} />
          THE SPOILS OF LORE
        </span>
        <p>
          An independent, unofficial fan project. Warhammer and the Horus Heresy
          belong to Games Workshop.
        </p>
        <button className="text-button" onClick={() => setInfoOpen(true)}>
          Archive notes
          <Info size={13} />
        </button>
      </footer>
      {progressOpen && (
        <ProgressDialog
          cutoff={cutoff}
          onSave={updateCutoff}
          onClose={() => setProgressOpen(false)}
        />
      )}
      {openedBook && (
        <BookReader
          key={openedBook.id}
          book={openedBook}
          cutoff={cutoff}
          onClose={() => setOpenedBook(null)}
          onNavigate={setOpenedBook}
        />
      )}
      {infoOpen && (
        <Modal title="How the archive works" onClose={() => setInfoOpen(false)}>
          <div className="info-content">
            <p className="eyebrow">A NOTE FROM THE ARCHIVE</p>
            <h2>The unknown stays yours.</h2>
            <h3>Your reading boundary</h3>
            <p>
              Selecting book N means you have finished main-sequence books 1
              through N. Character sections and links stop there. Your choice is
              saved in this browser only. Change it at any time.
            </p>
            <h3>A map, not a mandatory route</h3>
            <p>
              The central path follows the 54-volume publication sequence,
              including its anthologies. Side stories are attached to curated
              reading windows based on their setting; the map does not claim a
              single exact chronology. Side stories within your window are
              treated as included, as part of the reading model.
            </p>
            <h3>An archive in progress</h3>
            <p>
              This first edition has an overview for every numbered volume and
              nine selected side stories. Three-level summaries are currently
              authored for books 1–5, 9, 12, 14 and 34. Nine character dossiers
              contain selected book-by-book entries. Missing sections never
              imply that a character is absent from a book.
            </p>
            <p>
              Summaries are original editorial drafts and need a full source
              review before this becomes an authoritative guide. Individual
              short stories inside anthologies are still being catalogued. No
              generated filler is presented as a complete plot account.
            </p>
            <h3>Separate identities stay separate</h3>
            <p>
              The archive does not link changed names, search aliases across
              identities, or advertise future appearances. Character filters
              only search curated entries within your reading boundary.
            </p>
            <h3>Open deliberately</h3>
            <p>
              Story summaries can reveal events in the selected work. An unread
              story asks for a separate reveal; that choice never advances your
              reading progress. External reference sites may have no such
              protections.
            </p>
            <h3>About this project</h3>
            <p>
              An unofficial fan-made companion, with no affiliation to Games
              Workshop or Black Library. All summaries are original, and the
              visual book markers use original abstract artwork rather than
              official covers.
            </p>
            <div className="reference-links">
              <a
                href="https://www.blacklibrary.com/the-horus-heresy"
                target="_blank"
                rel="noreferrer"
              >
                Publisher catalog ↗
              </a>
              <a
                href="https://github.com/williamlow/SpoilsOfLore"
                target="_blank"
                rel="noreferrer"
              >
                Project on GitHub ↗
              </a>
            </div>
          </div>
        </Modal>
      )}
      {toast && <Toast>{toast}</Toast>}
    </>
  )
}

function BookCard({
  book,
  cutoff,
  onOpen,
}: {
  book: Book
  cutoff: number | null
  onOpen: (book: Book) => void
}) {
  return (
    <button
      className={`book-card ${isRead(book, cutoff) ? 'is-read' : ''}`}
      onClick={() => onOpen(book)}
      aria-label={`Open ${book.title}`}
    >
      <div className={`book-art art-${book.number % 6}`} aria-hidden="true">
        <span className="art-orbit" />
        <span className="art-sigil">
          {['✦', '◇', '✧', '⊕', '△', '⌘'][book.number % 6]}
        </span>
        <span className="art-number">{pad(book.number)}</span>
        <span className="art-bottom">
          HORUS
          <br />
          HERESY
        </span>
      </div>
      <div className="book-card-content">
        <div className="book-meta">
          <span>{book.kind}</span>
          <span>·</span>
          <span>{book.year}</span>
          {isRead(book, cutoff) && (
            <span className="read-indicator">
              <Check size={11} />
              Read
            </span>
          )}
        </div>
        <h3>{book.title}</h3>
        <p>{book.author}</p>
        <span className="open-label">
          Explore story
          <ArrowRight size={13} />
        </span>
      </div>
      <ChevronRight className="book-chevron" size={17} />
    </button>
  )
}

function ProgressDialog({
  cutoff,
  onSave,
  onClose,
}: {
  cutoff: number | null
  onSave: (value: number | null) => void
  onClose: () => void
}) {
  const [value, setValue] = useState(cutoff ? String(cutoff) : '')
  return (
    <Modal title="Set reading progress" onClose={onClose}>
      <div className="progress-dialog">
        <div className="gate-icon">
          <ShieldCheck size={28} strokeWidth={1.4} />
        </div>
        <p className="eyebrow">THE SPOILER BOUNDARY</p>
        <h2>How far have you travelled?</h2>
        <p>
          Choose the last main-sequence book you’ve <strong>finished</strong>.
          We’ll include everything from book one through your selection.
        </p>
        <SelectField
          label="Last book finished"
          value={value}
          onChange={setValue}
        >
          <option value="" disabled>
            Choose a book…
          </option>
          {books.map((b) => (
            <option key={b.id} value={b.number}>
              {pad(b.number)} — {b.title}
            </option>
          ))}
        </SelectField>
        <div className="progress-explainer">
          <GitBranch size={18} />
          <p>
            Side stories in the selected reading windows are included
            automatically. The main path includes numbered anthologies.
          </p>
        </div>
        <button
          className="primary-button full-width"
          disabled={!value}
          onClick={() => onSave(Number(value))}
        >
          Save my reading boundary
          <ArrowRight size={16} />
        </button>
        <p className="privacy-note">
          Saved on this device. No account. No tracking.
        </p>
        {cutoff !== null && (
          <button
            className="text-button reset-progress"
            onClick={() => onSave(null)}
          >
            Clear reading progress
          </button>
        )}
      </div>
    </Modal>
  )
}

function BookReader({
  book,
  cutoff,
  onClose,
  onNavigate,
}: {
  book: Book
  cutoff: number | null
  onClose: () => void
  onNavigate: (book: Book) => void
}) {
  const [revealed, setRevealed] = useState(() => isRead(book, cutoff))
  const [level, setLevel] = useState(0)
  const [content, setContent] = useState<Synopsis | null>(null)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    if (!revealed) return
    const controller = new AbortController()
    fetchContent<Synopsis>('books', book.id, controller.signal)
      .then(setContent)
      .catch((e) => {
        if (e.name !== 'AbortError') setError(e.message)
      })
    return () => controller.abort()
  }, [book.id, revealed, retry])
  const tier =
    content && [content.overview, content.synopsis, content.detailed][level]
  const labels = ['At a glance', 'The synopsis', 'Into the detail']
  return (
    <Modal title={book.title} onClose={onClose} wide>
      <article className="book-reader">
        <p className="eyebrow">
          {book.number ? `VOLUME ${pad(book.number)}` : book.kind.toUpperCase()}{' '}
          <span>/ THE HORUS HERESY</span>
        </p>
        <h2>{book.title}</h2>
        <p className="reader-byline">
          {book.author}
          <span>·</span>
          {book.year}
          <span>·</span>
          {book.kind}
        </p>
        {book.source && (
          <p className="source-note">
            Also collected in <em>{book.source}</em>. Curated reading window:
            book {pad(book.anchor!)}.
          </p>
        )}
        <div className="detail-control">
          <div>
            <span className="field-caption">HOW DEEP DO YOU WANT TO GO?</span>
            <span className="detail-number">0{level + 1} / 03</span>
          </div>
          <input
            type="range"
            min="0"
            max="2"
            step="1"
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
            aria-label="Summary detail level"
            aria-valuetext={labels[level]}
          />
          <div className="detail-labels">
            {labels.map((label, i) => (
              <button
                key={label}
                className={i === level ? 'active' : ''}
                onClick={() => setLevel(i)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {!revealed ? (
          <div className="story-gate">
            <LockKeyhole size={25} strokeWidth={1.5} />
            <h3>This story is beyond your reading boundary.</h3>
            <p>
              All three levels can reveal events within <em>{book.title}</em>.
              Open it only when you’re ready.
            </p>
            <button
              className="primary-button"
              onClick={() => setRevealed(true)}
            >
              Reveal this story
              <ArrowRight size={16} />
            </button>
            <p className="privacy-note">
              This does not change your reading progress.
            </p>
          </div>
        ) : (
          <div className="synopsis-content" key={level}>
            <div className="reading-status">
              <BookOpen size={14} />
              <span>
                {isRead(book, cutoff)
                  ? 'Within your saved reading progress'
                  : 'Revealed for this visit to the story'}
              </span>
            </div>
            {error ? (
              <div role="alert">
                <p>{error}</p>
                <button
                  className="secondary-button"
                  onClick={() => {
                    setError('')
                    setRetry((v) => v + 1)
                  }}
                >
                  Try again
                </button>
              </div>
            ) : !content ? (
              <p role="status">Opening the archive…</p>
            ) : (
              <>
                <p className="eyebrow">{labels[level].toUpperCase()}</p>
                {tier ? (
                  tier.map((p, i) => <p key={i}>{p}</p>)
                ) : (
                  <div className="coverage-message">
                    <Info size={20} />
                    <h3>This level is still being curated.</h3>
                    <p>
                      The top-line overview is available below. A fuller account
                      will be added after editorial review.
                    </p>
                    {content.overview.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                )}
                <p className="editorial-note">
                  Original editorial draft · Archive coverage is in progress.
                </p>
              </>
            )}
          </div>
        )}
        {book.number > 0 && (
          <div className="reader-navigation">
            <button
              disabled={book.number === 1}
              onClick={() => onNavigate(books[book.number - 2])}
            >
              <ArrowLeft size={15} />
              Previous volume
            </button>
            <span>{pad(book.number)} / 54</span>
            <button
              disabled={book.number === 54}
              onClick={() => onNavigate(books[book.number])}
            >
              Next volume
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </article>
    </Modal>
  )
}

function CharacterDirectory({
  characters: available,
  onSelect,
}: {
  characters: Character[]
  onSelect: (character: Character) => void
}) {
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState('')
  const [faction, setFaction] = useState('')
  const [browse, setBrowse] = useState(false)
  const groups = [...new Set(available.map((c) => c.group))]
  const availableFactions = [
    ...new Set(
      available
        .filter((c) => !group || c.group === group)
        .map((c) => c.faction),
    ),
  ].sort()
  const shown = available.filter(
    (c) =>
      (!query || c.name.toLowerCase().includes(query.toLowerCase())) &&
      (!group || c.group === group) &&
      (!faction || c.faction === faction),
  )
  return (
    <>
      <div className="archive-boundary">
        <ShieldCheck size={16} />
        <span>Your reading boundary is active.</span>
        <small>Only permitted identities and entries are shown.</small>
      </div>
      <div className="character-search">
        <SearchBox
          label="Search characters"
          placeholder="Find someone in your archive…"
          options={available.map((c) => ({
            id: c.id,
            label: c.name,
            category: c.group,
          }))}
          onSelect={(o) => {
            const character = available.find((c) => c.id === o.id)
            if (character) onSelect(character)
          }}
        />
        <button
          className={`secondary-button ${browse ? 'selected' : ''}`}
          aria-expanded={browse}
          onClick={() => setBrowse((v) => !v)}
        >
          <GitBranch size={15} />
          Browse by hierarchy
        </button>
      </div>
      {browse && (
        <div className="hierarchy-browser">
          <SelectField
            label="1. Origin"
            value={group}
            onChange={(v) => {
              setGroup(v)
              setFaction('')
            }}
          >
            <option value="">All origins</option>
            {groups.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </SelectField>
          <ChevronRight size={16} />
          <SelectField
            label="2. Initial affiliation"
            value={faction}
            onChange={setFaction}
          >
            <option value="">All affiliations</option>
            {availableFactions.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </SelectField>
          <ChevronRight size={16} />
          <span>3. Choose a name below</span>
        </div>
      )}
      <div className="directory-heading">
        <h3>
          {group || faction
            ? [group, faction].filter(Boolean).join(' / ')
            : 'Start with a familiar face'}
        </h3>
        {(group || faction || query) && (
          <button
            className="text-button"
            onClick={() => {
              setQuery('')
              setGroup('')
              setFaction('')
            }}
          >
            Clear filters
            <X size={13} />
          </button>
        )}
      </div>
      <div className="character-grid">
        {shown.map((c) => (
          <button
            className="character-card"
            key={c.id}
            onClick={() => onSelect(c)}
          >
            <div className="character-monogram">
              {c.initials}
              <span>✧</span>
            </div>
            <div>
              <p>{c.group}</p>
              <h3>{c.name}</h3>
              <span>{c.faction}</span>
            </div>
            <ArrowRight className="character-arrow" size={17} />
          </button>
        ))}
      </div>
      {!shown.length && (
        <div className="empty-state compact">
          <p>
            No curated identities match these filters within your reading
            boundary.
          </p>
          <button
            className="text-button"
            onClick={() => {
              setGroup('')
              setFaction('')
            }}
          >
            Clear filters
          </button>
        </div>
      )}
      <div className="coverage-footnote">
        <Info size={15} />
        <p>
          This is a growing collection of curated dossiers. An absent entry says
          nothing about a character’s presence in a book. Affiliations identify
          the starting context of an identity.
        </p>
      </div>
    </>
  )
}

function CharacterReader({
  character,
  cutoff,
  onBack,
  onCharacter,
  onBook,
}: {
  character: Character
  cutoff: number
  onBack: () => void
  onCharacter: (id: string) => void
  onBook: (book: Book) => void
}) {
  const [dossier, setDossier] = useState<Dossier | null>(null)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    fetchContent<Dossier>('characters', character.id, controller.signal)
      .then(setDossier)
      .catch((e) => {
        if (e.name !== 'AbortError') setError(e.message)
      })
    return () => controller.abort()
  }, [character.id, retry])
  function linkedText(text: string): ReactNode[] {
    return text.split(/(\[\[[^\]]+\]\])/g).map((part, i) => {
      const match = part.match(/^\[\[([a-z0-9-]+)\|([^\]]+)\]\]$/)
      if (!match) return part
      return canLinkCharacter(match[1], cutoff) ? (
        <button
          className="inline-link"
          key={i}
          onClick={() => onCharacter(match[1])}
        >
          {match[2]}
        </button>
      ) : (
        match[2]
      )
    })
  }
  const entries = dossier ? visibleEntries(dossier, cutoff) : []
  return (
    <article className="character-reader">
      <button className="text-button back-to-archive" onClick={onBack}>
        <ArrowLeft size={14} />
        Back to the archive
      </button>
      <div className="dossier-title">
        <div className="character-monogram large">
          {character.initials}
          <span>✧</span>
        </div>
        <div>
          <p className="eyebrow">
            {character.group} / {character.faction}
          </p>
          <h2>{character.name}</h2>
          <p>A record within your reading boundary.</p>
        </div>
      </div>
      <div className="archive-boundary">
        <ShieldCheck size={15} />
        <span>Read through {books[cutoff - 1].title}</span>
      </div>
      {error ? (
        <div role="alert" className="empty-state compact">
          <p>{error}</p>
          <button
            className="secondary-button"
            onClick={() => {
              setError('')
              setRetry((v) => v + 1)
            }}
          >
            Try again
          </button>
        </div>
      ) : !dossier ? (
        <p role="status" className="loading-message">
          Opening the permitted archive…
        </p>
      ) : entries.length === 0 ? (
        <div className="empty-state compact">
          <BookOpen size={24} />
          <p>
            No curated account is available within this reading boundary yet.
          </p>
        </div>
      ) : (
        <div className="dossier-sections">
          {entries.map((entry, i) => {
            const book = books.find((b) => b.id === entry.bookId)!
            const story = entry.storyId
              ? allStories.find((b) => b.id === entry.storyId)
              : null
            return (
              <section key={`${entry.bookId}-${i}`} className="dossier-section">
                <span className="dossier-volume">{pad(book.number)}</span>
                <p className="eyebrow">
                  VOLUME {pad(book.number)}
                  {story ? ` / ${story.kind.toUpperCase()}` : ''}
                </p>
                <h3>{book.title}</h3>
                {story && <p className="section-story">{story.title}</p>}
                {entry.text.map((text, j) => (
                  <p key={j}>{linkedText(text)}</p>
                ))}
                <button
                  className="text-button"
                  onClick={() => onBook(story || book)}
                >
                  Open this story
                  <ArrowRight size={13} />
                </button>
              </section>
            )
          })}
        </div>
      )}
      <div className="dossier-end">
        <ShieldCheck size={18} />
        <h3>The page stops where you do.</h3>
        <p>
          No hints about what lies ahead. You can edit your reading progress at
          the top of the page.
        </p>
      </div>
      <p className="editorial-note">
        Selected original editorial entries · Missing sections do not imply
        absence.
      </p>
    </article>
  )
}
