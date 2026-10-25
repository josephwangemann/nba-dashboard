# Nothing But Net

A React + TypeScript app built with Vite for browsing NBA scores, schedules, and box scores. Game data comes from ESPN's public scoreboard and summary endpoints.

## Commands

- `npm install` — install dependencies.
- `npm run dev` — start the development server.
- `npm run build` — type-check and build for production.
- `npm run lint` — run Oxlint.
- `npm run preview` — preview the production build.

## Project structure

- `src/App.tsx` manages scoreboard loading, selected date, and navigation state.
- UI components live in separate `.tsx` files under `src/components/`.
- `src/scoreboard.ts` contains scoreboard types and response parsing.
- `src/components/BoxScore.tsx` loads and displays individual game statistics.
- `src/App.css` contains component styles; `src/index.css` contains global styles.
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
