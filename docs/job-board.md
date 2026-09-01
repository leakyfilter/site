# Personal job board

## Current scope

- A separate static React entry point, not a homepage route or import.
- Initially 12 curated listings across 9 companies. Two focused expansion passes on August 31, 2026 brought the board to 23 active roles and 1 archived role, with deeper coverage of inference/runtime and hardware/software co-design.
- Requested: OpenAI, Anthropic, Cohere, Modal, Baseten, Google.
- Proposed additions: Physical Intelligence, Bedrock Robotics, Etched.
- Positioning and the approved decision framework saved in `docs/career-direction.md`.
- Direction/company/text filters, priority/publication/verification sorting, listing links, compensation, fit/stretch notes, and source dates.
- A read-in-page reference and Markdown download.
- A standalone workspace theme (light by default, optional dark), a company-logo sidebar, and progressively disclosed role details.
- A daily local checker at 9 AM Pacific, with availability history, source health, and an archive. No application submission, recruiter outreach, paid API, or external notification service.

## URL and privacy

The path is configured once in `job-board.config.json`:

`/jobs/` — https://leaky.dev/jobs/

The short, readable URL was explicitly requested. It is easy to guess even without a homepage link.

The board has no homepage or navigation link, is not imported into the homepage bundle, and has its own `noindex, nofollow, noarchive` and `no-referrer` metadata. External links use `noopener noreferrer`. Do not add it to a sitemap or a path-specific robots.txt rule, which would advertise the path. Search-engine directives are advisory, not a guarantee of secrecy.

**This is unlisted, not private.** Anyone with the URL can access it after publication. Source access, browser history, sharing, or noncompliant crawlers can reveal it. The JSON and reference are embedded in the board bundle and should not contain confidential employer information, private application notes, or secrets. A public repository also reveals the path and content. True privacy requires server-side authentication or a separate private host; a client-side password or hash URL is not sufficient.

The existing host is GitHub Pages. This implementation preserves that host and does not create or migrate to another hosting service. Initial publication and subsequent daily board maintenance were approved on August 31, 2026. A focused push to `main` triggers the existing Pages deployment, including the board; do not include unrelated changes in automated publication.

## Authoring

- `content/jobs/profile.json`: exact positioning, directions, schedule, and the last published scan's source health.
- `content/jobs/companies.json`: requested versus proposed companies, official sources, funding context, and monitoring flags.
- `content/jobs/listings.json`: curated role records, with stable `companyId:sourceId` identities.
- `content/jobs/logos.json` and `assets/companies/`: locally hosted official company marks; asset sources are recorded in the asset directory's README.
- `components/JobBoard.jsx` and `components/JobBoard.css`: isolated UI.
- `build-jobs.js`: validates data and builds the standalone entry into its configured directory.
- `scripts/check-jobs.cjs`: report-only availability checker and candidate discovery.
- `lib/jobChecking.js`: source parsing and guarded availability transitions.
- `docs/daily-job-checker.md`: the scheduled agent's operating instructions.

Use `npm run build` for the complete site, `npm run build:jobs` for board-only edits, and `npm test` for the complete build plus data/filter/render/isolation tests. Serve `dist` with `npx serve dist` and open the configured path. The existing `npm run dev` remains the homepage watcher; board-only edits currently need `npm run build:jobs` and a refresh.

The build uses existing dependencies and works with the CI's Node 20. A working local Node installation is required; no system Node repair or dependency installation is part of this change.

## Reading the board

The board deliberately has its own sans-serif workspace UI and does not import the homepage stylesheet. Its light/dark preference uses `jobs-theme`, leaving the homepage's `leaky-theme` setting untouched.

On desktop, the company sidebar separates requested companies from proposed additions. On narrow screens, a company selector replaces the sidebar, and direction filters scroll horizontally. Search, direction, and company filters compose; use Clear filters to reset them.

Role cards show the company mark, title, direction, priority, location, and published compensation. Expand “Why it fits & role details” for the fit assessment, work summary, skill gaps, requirements, funding context, and source dates. Stale or unverified listings retain a visible “Needs recheck” warning even while collapsed. The watchlist and career reference also start collapsed. The approved positioning and source records are unchanged by the redesign.

All logos load from local static assets and require no new external requests or dependencies. Run the full build after adding assets so `sync-static.js` copies them into `dist/assets/`.

Preserve the original job title and direct employer URL. Use `null` for unpublished salary or publish date. Never infer remote eligibility from a city list. Distinguish employer requirements from fit assessments, and do not infer experience from the candidate's employer alone. `sourcePublishedAt` is an employer-supplied timestamp, not proof a vacancy is newly created. `firstSeenAt` is when this board first observed it. A job is “Open when checked,” not guaranteed open now; after 14 days without verification, it displays “Needs recheck.” Confirmed closed records remain in the archive, with a date, reason, and evidence; they never appear in active results. Archive results follow the same filters.

Funding notes have their own source and check date. A company-reported round is not a verification of runway or financial health. Some requested companies have only a pending-diligence note; do not present those as financially screened.

## Daily checker

The native scheduled follow-up `daily-career-job-board-check` is active in the original conversation, daily at 9 AM Pacific. It follows [the runbook](daily-job-checker.md), checks all nine companies, reviews new candidates, and publishes only verified, focused board updates. The computer must be on and the app running for this local task.

Run `npm run check:jobs` to generate `.job-check/latest.json`. It checks all saved roles (including archived ones), fetches seven Ashby feeds and Anthropic's Greenhouse feed, and searches Google Careers within a documented window. It does not mutate source data or add jobs automatically. The agent reviews candidates and applies the guarded transitions, updates scan health, tests, and publishes. The raw report is ignored by git and must not be published.

Errors, empty feeds, and a single disappearance are recheck states. Only explicit employer closure or two complete-feed absences on separate days can archive a role; positive reappearance restores it. A job's availability history retains the latest 30 daily observations. The Daily checker section shows per-company coverage and failures, not merely a generic success timestamp.
