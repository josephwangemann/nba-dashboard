# Nothing But Net

A React + TypeScript app built with Vite for browsing NBA scores, schedules, and box scores. Game data comes from ESPN's public scoreboard and summary endpoints.

## Commands

- `npm install` — install dependencies.
- `npm run dev` — start the development server.
- `npm run build` — type-check and build for production.
- `npm run lint` — run Oxlint.
- `npm start` — serve the production build and ESPN API proxy (Node 22.6+).
- `npm run preview` — preview the production build.

## Project structure

- `src/App.tsx` manages selected date and navigation state; `src/main.tsx` wires up providers.
- `src/api/` contains query hooks, persistent cache configuration, and schedule-aware freshness logic.
- `src/models/` contains NBA data types and ESPN response parsers.
- `src/components/` groups UI into `games/`, `standings/`, `stats/`, `teams/`, and `shared/`.
- `src/styles/` contains component styles (`App.css`) and global styles (`index.css`).
- `src/navigation/` handles shareable tab, date, game, and profile routes and browser history.
- `src/components/profiles/` contains player and team profile views.
- `server/` serves the production build and proxies and normalizes ESPN data with bounded shared caching; Vite uses the same proxy during development and preview.
- `src/utils/` contains shared utilities, local date formatting, favorite team persistence, and game ordering helpers.
- `tests/` contains parser, cache policy, and persistence tests; run them with `npm test`.
- `public/favicon.svg` is the browser tab icon.

## Conventions

- Use arrow functions for all React components unless there is an explicit reason otherwise.
- Keep App.tsx simple by extracting substantial UI into separate components.
- Follow the existing TypeScript style: single quotes, no semicolons, and explicit prop types.
- Preserve the dark, 1990s basketball aesthetic and responsive layouts.
- Display game times in the user's local time zone.
- Handle loading, errors, and missing statistics; cancel requests when their view or date changes.
- Keep changes focused and avoid unnecessary dependencies.

## Validation

Run `npm run build` and `npm run lint` after code changes. For UI changes, check desktop and narrow layouts when browser tooling is available. For data changes, verify against real API response shapes and handle empty results.
