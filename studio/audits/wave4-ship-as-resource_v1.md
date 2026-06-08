# Audit: Wave 4 — Ship as a resource v1
# Auditor: finplan-auditor + orchestrator live pass | Date: 2026-06-08

## Verdict
**Ship.** Wave 4 completes the sweep. The standing improvement loop is built (Scout → Analyst → Director), every number is publicly traceable on an in-app methodology page, the Recharts bundle is split, CI is hardened to a strict gate, and the README no longer contradicts the engine. The gate is green (44/44 tests, lint 0 warnings under `--max-warnings 0`, tsc strict-clean, build complete) and the two user-facing additions (the methodology page; the lazy-mount path) are live-verified. errors.md rows 27–29 FIXED; no prior row re-opened.

**Composite: 9/10.** (The −1 is the carried-over environment limit: Recharts SVG paint and animated transitions are not observable under the headless rAF throttle — confirmed not a regression, deferred to a real-browser pass.)

## What shipped
- **Spine agents** — `finplan-scout`, `finplan-analyst`, `finplan-director`, each a full 5-file skill in the house format, plus `studio/briefings/TEMPLATE.md`. The BRAIN five-agent pattern is now complete; eleven finplan agents total.
- **`src/components/Methodology.tsx`** — wired as a bonus tab; documents canonical §1–§10 in plain language + the Wolfram-locked reference values + the full bibliography + the honest "what we don't model."
- **Code-split** — `React.lazy` + `Suspense` on Step 2 / 4 / 5 + CompoundCalculator (the four Recharts screens).
- **CI** — `npm ci` + strict lint + test + build on every push/PR, concurrency-guarded; CI badge on the README.
- **README** — stale formulas corrected to canonical; Trust & Methodology section added.

## errors.md regression scan
- **Rows 1–26:** none re-opened. Spot-checked the Wave-3 fixes (contrast guards, the income caveat, the glossary heading, the Pattern-1 engine reads) — all intact; the static guards still pass. Row 4 (dead tokens) and rows 5/18 (contrast) re-confirmed clean on the new Methodology page (17.06:1 body, no `#334155`/`#475569`/sub-AA white as text).
- **Row 27 (stale README):** FIXED — `×0.6`→`×0.85`, `±2%` cone → real seeded MC, caveats + trust + badge added.
- **Row 28 (bundle weight):** FIXED — NavigationTabs 601→188 kB; CartesianChart 328 kB on-demand; build-verified.
- **Row 29 (type hygiene / CI gate):** FIXED — `keyMap` typed (no `any`); strict lint; CI hardened.

## Lens pass (the four lenses, applied to the wave's surface)
- **Nervous First-Timer:** the methodology page answers "can I trust this?" without jargon — a trust strip up top, plain-language formulas, an explicit limits section. The lazy-load shows a brief "Loading…" (role="status") on first open of a chart screen; acceptable.
- **Skeptical CFP:** every formula on the page matches canonical; the reference values are the Wolfram-locked ones; the README now agrees with the engine. The "what we don't model" section (taxes, fat tails) pre-empts the CFP's objection rather than hiding it.
- **Trust & Credibility:** the page is glossary-honest — "estimate," "probability," "pre-tax," "not a guarantee"; the public-trust statement (validated / no data leaves / open) appears on README + footer + page, and is true (CI enforces the validation).
- **Regression-Across-Screens:** the code-split changed how screens load, not what they compute — the engine and the 44 tests are untouched; Step 2/4/5 mount and read the same store values. No number moved.

## Live verification (evidence)
- **Methodology page:** mounted; Trinity Study + sequence-of-returns + reference values ($1,574,534.16 / $542,743.26) + trust statement all present; body text 17.06:1; no banned text colors; sidebar tab + trust strip + bracket table render (screenshot).
- **Lazy mount:** Step 4 chunk loads via Suspense and the component mounts (h1 + content present). Its Recharts SVG does not paint under headless (rAF/ResizeObserver throttle) — the documented limitation, unchanged from Waves 1–3.
- **Build:** NavigationTabs 188 kB (gzip 59), CartesianChart 328 kB split out, no >500 kB warning.

## Residual risk
- **Headless rAF throttle** still blocks observing the animated transitions and the Recharts SVG paint; verification used the reduced-motion instant-render path + DOM/computed-style reads. A real-browser pass remains the one open verification item across the whole sweep — and is now itself a standing backlog candidate for the Scout (logged in finplan-scout/learnings).
- **CI is configured but unproven in this environment** — it will run on the next push to GitHub; the steps mirror the locally-green gate exactly (`npm ci` → lint → test → build).
- The methodology page is static content traced to canonical; if canonical changes, the page must be updated in lockstep (the Content agent owns this; noted for the standing loop).

---
*finplan-auditor Wave 4 | reference: studio/audits/wave2-long-tail_v1.md, wave3-per-screen-education_v1.md. The sweep (Waves 0–4) is complete.*
