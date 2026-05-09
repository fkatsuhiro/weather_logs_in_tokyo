---
name: Weather Automation Project Overview
description: Architecture, tech stack, and key decisions for the Tokyo weather dashboard
type: project
---

Tokyo weather dashboard auto-updated via GitHub Actions (Open-Meteo API → public/weather_log.json → build → GitHub Pages).

**Why:** Automated data pipeline; frontend is purely static, no API calls from browser.

**Stack:** React 19, TypeScript 5.9 (strict), Vite 7, pnpm, deployed to `/weather_automation_Tokyo/`.

**Test setup (added 2026-05-09):**
- Vitest 4 + @testing-library/react — unit tests under `src/**/*.test.ts`
- Playwright 1.59 — E2E tests under `tests/e2e/`, runs against `pnpm preview` (port 4173)
- ESLint 9 — ignores `dist`, `coverage`, `playwright-report`, `test-results`
- Scripts: `pnpm test`, `pnpm test:coverage`, `pnpm test:e2e`

**Feature added (2026-05-09):** Monthly summary view
- `src/types/weather.ts` — shared interfaces (WeatherData, MonthlySummary, ViewMode)
- `src/utils/weatherUtils.ts` — pure functions: getWeatherDisplay, groupByDate, groupByMonth, calcMonthlySummary, buildMonthlySummaries
- `src/components/ViewToggle.tsx` — daily/monthly toggle button group
- `src/components/DailyView.tsx` — extracted daily card view
- `src/components/MonthlyView.tsx` — monthly summary cards (avg/max/min temp + weather distribution)

**How to apply:** New features should follow the same pattern: pure utils in `src/utils/`, typed interfaces in `src/types/`, components in `src/components/`.
