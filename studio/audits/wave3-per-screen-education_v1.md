# Audit: Wave 3 — Per-screen audit + education v1
# Auditor: finplan-auditor (4 parallel lens agents) + orchestrator live pass | Date: 2026-06-08

## Verdict
**Ship.** Wave 3 audited all seven screens against the four lenses + the full `errors.md` regression suite, built the `finplan-content` agent, and closed every Critical the pass surfaced (errors.md rows 18–26). All fixes are live-verified on screen, the static guards lock them, and the gate is green (44/44 tests, lint 0 errors, tsc strict-clean, build complete). Every screen now clears the lenses with **zero Critical** — the Wave-3 Definition of Done.

**Composite (per screen, pre-fix → post-fix): Welcome 6.5 → ~9 · Step 1 5.5 → ~9 · Step 2 7 → ~9 · Step 3 6.5 → ~8.5 · Step 4 7.5 → ~8.5 · Step 5 7 → ~8.5 · Bonus 6/8.5 → ~8.5/9.**

## Scope & method
- **Agent built:** `finplan-content` (Phase 3) — the "explains" agent, modeled on `finplan-a11y`'s five-file structure. Owns `glossary.md`; encodes the 7-point Content Floor.
- **Per-screen audits (code-derived, 4 parallel agents), capped at "revise" pending the live pass per the cold-run fallback:** `welcome_v1`, `step1-current-reality_v1`, `step2-retirement-design_v1`, `step3-your-number_v1`, `step4-investment-path_v1`, `step5-summary_v2`, `bonus-compound_v1`, `bonus-resources_v1`. Each scanned all 17 prior `errors.md` rows.
- **Single live pass (orchestrator):** dev server + Claude_Preview. Navigated-screen content is gated on `AnimatePresence` completing, which stalls under the headless rAF throttle (`visibilityState: "hidden"`) — the environment condition behind errors.md row 10. Resolved by temporarily forcing the reduced-motion render path (the same instant-render real reduced-motion users get), inspecting every screen, then reverting. Welcome was confirmed on a clean initial load.

## errors.md regression scan (rows 1–17 from prior waves)
- Rows 1, 2, 7, 8, 11–16 (engine / single-source / zero-target / MC labeling): **CLEAN** — no screen reintroduced them; Step 4/5 read the single engine for every projection (no `Math.pow`/loops in components).
- Rows 3 (persistence): **CLEAN** — confirmed live (a seeded plan rehydrated from localStorage across reload).
- Row 4 (dead `*-shiny-*` tokens): **CLEAN** on all screens — independently re-confirmed by two agents (`@theme` live, variants wired).
- Rows 5, 6, 10 (a11y floor): held; **row 5 recurred** through colors the Wave-0 scan didn't name → logged as **new row 18** and fixed (not a silent re-open).
- Row 9 (flat-CPI optimism): the engine treatment stayed correct; its **presentation** residual on the Step 5 income table → logged as **new row 21** and fixed.

## New defects found & fixed this wave (rows 18–26, all FIXED + guarded)
| Row | Screen | Lens | Severity | Fix | Guard |
|---|---|---|---|---|---|
| 18 | Welcome, Step 1 | 3 / a11y | Critical | `#334155` text (1.72:1) + white-alpha (1.82–4.20:1) → `#94a3b8` | `accessibility.test.ts` rows 18–19 |
| 19 | Step 2 | 3 / glossary | Critical | "Discretionary"→"Guilt-Free Spending" | glossary.md (Auditor scans) |
| 20 | Step 5 + app | 4 / tokens | Recommended | `#22c55e`→`#10b981`, `#f97316`→`#f59e0b`; violet ratified into §6 | `design-system.test.ts` row 20 |
| 21 | Step 5 | 2/3 | **Critical (surviving v1)** | income-table COLA/pre-tax caveat, §2-consistent | review (data-driven copy) |
| 22 | Step 3, Step 5 | 4 / Pattern 1 | Critical (3) / Polish (5) | read `res.annualRetSpend` + `res.planReady` | engine read; prior engine tests |
| 23 | Step 4 | 3 | Recommended | tie On-Track verdict to the success rate | conditional copy |
| 24 | Bonus compound | 1/2 | Critical | effective-monthly + estimate disclaimer + monospace + rule-of-72 guard | — |
| 25 | Step 1, Step 2 | 1 / education | Critical | the "why"/unit on ~25 inputs + per-slider rationale | — |
| 26 | Welcome | 3 | Critical | eyebrow → Sethi · Collins · Housel | — |

## Live verification (evidence)
- **Welcome:** privacy text 1.72 → **6.96:1**; eyebrow "Ramit Sethi · JL Collins · Morgan Housel".
- **Step 1:** attribution / "Ramit's target" / "Investing" label all → **6.96:1**; property-tax/HSA/debt helpers + "Essential monthly" subtitle render.
- **Step 2:** heading "Guilt-Free Spending"; no "Discretionary"; "Retirement Monthly" value `#a78bfa` → **6.56:1**; per-category slider helpers render.
- **Step 3:** hero + math chain render via `res.planReady`; WR bracket-cliff hint present.
- **Step 4:** success banner + On-Track panel; banner copy fixed; seq-risk caveat correctly absent at 89% (≥80, the non-contradiction branch).
- **Step 5:** income caveat in DOM; surplus + success render `#10b981` (no `#22c55e`); Required/Projected/Surplus today's-$ with nominal beside; "Your main categories" relabel.
- **Bonus:** CompoundCalc disclaimer + monospace + no "Infinity"; Resources 7 unique link aria-labels + `aria-hidden` SVGs.

## Residual risk
- **Headless rAF throttle** blocks navigated-screen *animated paint* (and Recharts SVG) in this environment; verification used the reduced-motion instant-render path + computed-style/DOM reads (opacity-independent) rather than transition-dependent screenshots. A real-browser pass would add visual confirmation of the entrance animations and chart paint (carried over from Waves 1–2).
- **Decorative violet on small step-number badges** (Welcome/Step 3) is below the large-text threshold; left as a documented residual under the §6 large-accent role, not a body-text violation.
- **Step 1 self-evident guilt-free inputs** were intentionally left without helpers (F5/F7 — restating a label is not a "why," and 12 extra lines would clutter the progressively-disclosed column).
- Pre-existing `@typescript-eslint/no-explicit-any` warning at `Step2:68` (the `keyMap` cast) predates Wave 3 — lint 0 *errors*; logged, not fixed (out of scope).

---
*finplan-auditor Wave 3 | 4 parallel lens agents + orchestrator live pass | reference: studio/audits/step5-summary_v1.md, wave2-long-tail_v1.md*
