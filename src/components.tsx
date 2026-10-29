import { useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowRight, Check, ChevronDown, Search, X } from 'lucide-react'

export function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const el = dialog.current!
    const previous = document.activeElement as HTMLElement | null
    el.showModal()
    const old = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      el.close()
      document.body.style.overflow = old
      previous?.focus()
    }
  }, [])
  return (
    <dialog
      ref={dialog}
      className={`modal ${wide ? 'modal-wide' : ''}`}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="modal-surface">
        <button
          className="icon-button modal-close"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </dialog>
  )
}

export type SearchOption = { id: string; label: string; category: string }
export function SearchBox({
  label,
  placeholder,
  options,
  onSelect,
}: {
  label: string
  placeholder: string
  options: SearchOption[]
  onSelect: (option: SearchOption) => void
}) {
  const id = useId()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const results = options
    .filter((o) =>
      `${o.label} ${o.category}`.toLowerCase().includes(query.toLowerCase()),
    )
    .slice(0, 8)
  function choose(option: SearchOption) {
    onSelect(option)
    setQuery('')
    setOpen(false)
    setActive(0)
  }
  return (
    <div
      className="search-box"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false)
      }}
    >
      <Search size={16} aria-hidden="true" />
      <input
        type="text"
        role="combobox"
        aria-label={label}
        placeholder={placeholder}
        value={query}
        aria-expanded={open && query.length > 0}
        aria-autocomplete="list"
        aria-controls={`${id}-options`}
        aria-activedescendant={
          open && query.length > 0 && results[active]
            ? `${id}-${active}`
            : undefined
        }
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
          setActive(0)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setOpen(true)
            setActive((a) => Math.max(0, Math.min(a + 1, results.length - 1)))
          }
          if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActive((a) => Math.max(a - 1, 0))
          }
          if (e.key === 'Enter' && open && results[active]) {
            e.preventDefault()
            choose(results[active])
          }
          if (e.key === 'Escape') {
            e.stopPropagation()
            setOpen(false)
          }
        }}
      />
      {query && (
        <button
          className="search-clear"
          aria-label={`Clear ${label.toLowerCase()}`}
          onClick={() => {
            setQuery('')
            setOpen(false)
          }}
        >
          <X size={14} />
        </button>
      )}
      {open && query.length > 0 && (
        <div
          className="search-results"
          role="listbox"
          id={`${id}-options`}
          aria-label={`${label} suggestions`}
        >
          {results.length ? (
            results.map((o, i) => (
              <button
                key={o.id}
                type="button"
                role="option"
                id={`${id}-${i}`}
                aria-selected={i === active}
                className={i === active ? 'active' : ''}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(o)}
              >
                <span>
                  {o.label}
                  <small>{o.category}</small>
                </span>
                <ArrowRight size={14} />
              </button>
            ))
          ) : (
            <p className="search-empty">No matches in the available archive.</p>
          )}
        </div>
      )}
    </div>
  )
}

export function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  children: ReactNode
}) {
  const id = useId()
  return (
    <div className="select-field">
      <label htmlFor={id}>{label}</label>
      <div>
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {children}
        </select>
        <ChevronDown size={15} aria-hidden="true" />
      </div>
    </div>
  )
}

export function Toast({ children }: { children: ReactNode }) {
  return (
    <div className="toast" role="status">
      <Check size={16} />
      {children}
    </div>
  )
}

export function StarMap() {
  return (
    <svg
      className="star-map"
      viewBox="0 0 430 240"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="mapGlow">
          <stop stopColor="#ba754f" stopOpacity=".13" />
          <stop offset="1" stopColor="#ba754f" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="230" cy="120" r="120" fill="url(#mapGlow)" />
      <g stroke="#b0a487" strokeOpacity=".2">
        <circle cx="230" cy="120" r="81" />
        <circle cx="230" cy="120" r="109" strokeDasharray="2 9" />
        <ellipse
          cx="230"
          cy="120"
          rx="170"
          ry="48"
          transform="rotate(-28 230 120)"
        />
        <path d="M50 164 116 125 164 149 215 104 272 86 334 39M116 125l6-58 93 37 33 68 75 22M215 104l-14-67m47 135 60-49 68 14" />
        <path d="M230 4v22m0 188v22M112 120H90m258 0h22" />
      </g>
      <g fill="#a99274">
        {[
          [50, 164],
          [116, 125],
          [164, 149],
          [272, 86],
          [334, 39],
          [122, 67],
          [248, 172],
          [323, 194],
          [201, 37],
          [308, 123],
          [376, 137],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={i % 3 === 0 ? 2.5 : 1.5} />
        ))}
      </g>
      <circle cx="215" cy="104" r="5" fill="#ca8159" />
      <circle cx="215" cy="104" r="11" stroke="#ca8159" strokeOpacity=".5" />
      <g fill="#9b9d90" fontFamily="monospace" fontSize="8" letterSpacing="2">
        <text x="244" y="109">
          TERRA
        </text>
        <text x="59" y="191">
          SEGMENTUM SOLAR
        </text>
        <text x="288" y="26">
          M31
        </text>
      </g>
    </svg>
  )
}
