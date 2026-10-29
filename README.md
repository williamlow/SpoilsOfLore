# The Spoils of Lore

A spoiler-conscious Horus Heresy reading companion. React, TypeScript and Vite; a static site designed for GitHub Pages. No account, backend, API key, analytics or runtime third-party requests are needed. Fonts are bundled locally.

## Develop

Requires Node.js 24 and npm (the lockfile is committed).

```sh
cd /workspace/SpoilsOfLore
npm ci
npm run dev
```

Use the existing checkout. Each cloud task is already isolated; do not create a worktree unless explicitly requested.

```sh
npm run check                      # data/boundary tests, type check, production build
npx playwright install chromium    # only if a compatible browser is not already installed
npm run test:e2e -- --workers=2    # desktop and mobile functional + accessibility checks
```

The browser tests use `/usr/bin/chromium` when present and fall back to Playwright's installed Chromium. Override with `CHROMIUM_PATH` if necessary. `npm run preview` serves the production build.

## What works

- Ordered network of all 54 numbered Horus Heresy volumes, including anthologies, with nine curated side-story branches.
- Main/all-story toggle, popular faction filters, predictive faction and character lookup, and book lookup on larger screens.
- Large story dialogs with three selectable levels of detail. Opening an unread story requires a deliberate reveal. Revealing a story does **not** advance the reading cutoff.
- Character view requires a completed-book cutoff, starting at volume one. The cutoff persists locally and can be edited or cleared.
- Character search and hierarchy browsing expose only identities introduced within the cutoff.
- Independent character dossier files render permitted book sections in sequence, with safe internal links and no future appearances, appearance counts, alias relationships or future section placeholders.
- Side stories in a selected reading window are included automatically. Dossier entries have their own explicit spoiler cutoff, which may be later than a side story's map placement.
- Browser storage failures are handled without removing the gate; corrupt progress resets to locked.
- Accessible native dialogs, keyboard-operated lookup and detail controls, reduced-motion support, and responsive desktop/mobile layouts.

## Content status

This is a working first edition, **not a complete or source-reviewed encyclopedia**:

- Original top-line overviews: all 54 main volumes and nine selected side stories.
- Three authored detail levels: volumes **1–5, 9, 12, 14 and 34**. Other volumes explicitly show overview-only coverage when a deeper level is selected.
- Nine curated character dossiers: Garviel Loken, Horus Lupercal, Euphrati Keeler, Saul Tarvitz, Nathaniel Garro, Dalia Cythera, Ahzek Ahriman, Argel Tal and Barabas Dantioch. Their entries are selected accounts, not exhaustive coverage.
- The central path follows the numbered publication sequence. Branches use curated reading windows rather than claiming a definitive in-universe chronology. Side-story placements and plot accounts require a full editorial source review before authoritative use.
- The Siege of Terra is a separate series and is not included in this edition.

Coverage is described inside the app. Missing dossier sections must never be interpreted as a statement about a character's appearances. Do not fill gaps with generic or fabricated plot summaries.

## Spoiler contract

`src/lib/spoilers.ts` is the boundary layer. Every character section must pass `through <= cutoff`; every displayed identity and internal link must pass its introduction cutoff. Search and faction hierarchy options come from the same permitted identity set. Character story filters only use permitted, curated dossier entries; they never search a future appearance index.

Character affiliations record an identity's starting context, not an inferred current allegiance. **A changed name is a separate identity in a separate JSON file.** Do not add aliases, `formerly` fields, shared dossiers, automatic redirects, cross-identity links or search synonyms that expose the connection. There are no renamed-identity entries in the initial dataset.

This is a UI spoiler boundary, not an access-control system: content files are public static assets. The app never renders future sections, but someone deliberately inspecting source files can read them. Do not use this architecture for confidential content.

### Add a story

1. Add public bibliographic metadata to `src/data/catalog.ts`. Do not put plot snippets or future character appearances in the ungated catalog.
2. Add `public/content/books/<id>.json` containing `overview`, optionally `synopsis` and `detailed`, each as an array of original paragraphs. The detailed level should follow the work's events in order.
3. For a side story, record `anchor` (a main-volume reading window) and its collection where applicable. Carefully source-check this placement.

### Add a character entry

1. Give the identity its own catalog record and conservative `introducedAt` cutoff.
2. Add `public/content/characters/<identity-id>.json` with `entries`.
3. Each entry has a real `bookId`, an integer `through` spoiler cutoff, `text` paragraphs and, when relevant, `storyId`. Anthology stories are recorded under their main anthology volume with the story identified separately.
4. Use `[[identity-id|display name]]` for internal links, only when that identity is known at the entry's cutoff. The renderer checks the link again against the reader's boundary.
5. Run the content-integrity tests and manually review **every paragraph** for knowledge that belongs to a later book. Keep full end-to-end tests for cutoff reduction and hidden identities passing.

## GitHub Pages

The workflow in `.github/workflows/pages.yml` tests, builds, uploads and deploys on pushes to `main`. Pull requests validate without deploying. It builds with `BASE_PATH=/SpoilsOfLore/` so all scripts, fonts, icons and content fetches resolve under a project Pages URL.

For the initial publication:

1. Open repository **Settings → Pages** and select **GitHub Actions** as the build source. The repository must have Pages available for its visibility and GitHub plan.
2. Run **Validate and deploy to GitHub Pages** in the Actions tab, or push to `main`.
3. Check the workflow's deployment URL and test a story reveal and character dossier on the published site.

Enabling Pages is a repository setting; committing this workflow alone does not prove a live site exists. The usual project URL, after successful deployment, is `https://williamlow.github.io/SpoilsOfLore/`.

For a different repository name, change the workflow's `BASE_PATH`. For a custom domain at its root, build with `/` and configure the Pages custom domain separately.

## Validation

The test suite checks cutoff parsing and persistence, main/side-story gating, backward cutoff changes, data references and source-file completeness. Browser tests cover map order, toggles, predictive filters, deliberate book reveals, character gating, internal links, hierarchy browsing, progress persistence, removal of future content, focus restoration and WCAG A/AA accessibility checks on key screens.

## Attribution

An independent, unofficial fan project with original editorial summaries and original abstract book markers. Warhammer, the Horus Heresy, characters and related settings belong to Games Workshop. Not affiliated with Games Workshop or Black Library. Publisher reference: <https://www.blacklibrary.com/the-horus-heresy> (external pages may contain spoilers).
