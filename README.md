# GlossaryKit

A browser-based glossary manager for technical writers and documentation teams.
Add terms and definitions, search in real time, and export your glossary as JSON or CSV — no server, no database, no dependencies.

**Live App → [glossarykit.vercel.app](https://glossarykit.vercel.app)**

---

## What It Does

GlossaryKit gives technical writers a persistent, searchable, exportable reference for product and documentation terminology.

- Add a term and its definition in seconds
- Search across both terms and definitions in real time
- Edit or delete any entry at any time
- Export your full glossary as **JSON** or **CSV**
- Import a shared JSON glossary — duplicate terms are detected and skipped automatically
- All data persists in `localStorage` — no login, no server, works offline

---

## Stack

- HTML · CSS · Vanilla JavaScript
- No frameworks, no build step, no dependencies
- Deploys as a static site on Vercel

---

## Features

- **Full CRUD** — create, read, update, and delete glossary terms
- **Live search** — filters across term names and definitions on every keystroke
- **JSON export** — download your full glossary as a structured `.json` file
- **CSV export** — download as `.csv` for use in Excel or Google Sheets
- **JSON import** — load a shared glossary file, with automatic duplicate detection
- **localStorage persistence** — data survives page reloads and browser restarts
- **Dark industrial terminal aesthetic** — matches the StyleGuard design system (amber accent, monospace type, background grid)
- **Keyboard shortcut** — `⌘ + Enter` to add a term without reaching for the mouse

---

## Local Development

No build step needed. Clone the repo and open `index.html` in a browser, or use Live Server in VS Code.

## License

MIT
