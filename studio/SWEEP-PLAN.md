# Full Sweep Plan — making the Financial Planning Tool a top-flight public resource
# Orchestrator: finplan (Preston holds ship authority on each wave) | 2026-06-06

## The bar (Definition of Done)
A screen is "top-flight" when ALL of these hold:
- Every number traces to `canonical.md` and is covered by a test.
- WCAG 2.2 AA: contrast (canonical §7), label association, ARIA per APG, keyboard + focus.
- Honest labeling — no claim of more rigor or certainty than the math delivers.
- Design-system-consistent: real `@theme` tokens, no dead classes, no ignored variants.
- Reads the single engine; persists progress; loses nothing on refresh.
- Clears the auditor's lenses with zero Critical.

The tool ships as a public resource when every screen meets that bar, CI is green, the modeling is honest, and a public methodology page documents every formula and source. The throughline: a nervous first-timer can trust every number, and we can prove why.

## Baseline (verified today)
- Studio built (Phase 0 + 1: cfp, engineer, qa, auditor); evals, CI, and the gate hook in place; auditor hardened to v1.1 from a cold run.
- `errors.md`: rows **1 (relabel), 2 (single engine), 3 (persistence) FIXED + tested**. Rows 4–9 open; row 8 likely resolved by the store rewrite (verify + close); the Step 5 cold audit added a new zero-target-state bug (log as row 10).
- Scorecard movement (directional, honest): testing 0→3, rigor 6→7, eng 4→5. a11y still 2, modeling still 4, UI/UX consistency still gated on the dead-token layer.

## Agents — full roster built ✅ (as of Wave 4, 2026-06-08)
The full BRAIN five-agent bench + spine now exists in `.claude/skills/finplan-*`:
| Agent | Verb | Built |
|---|---|---|
| `finplan-cfp` / `-engineer` / `-qa` / `-auditor` | validate / implement / test / critique | Phase 1 |
| `finplan-quant` / `-a11y` | model / ensure access | Phase 2 (Waves 0–1) |
| `finplan-designer` | designs | Phase 3 (Wave 0) |
| `finplan-content` | explains | Phase 3 (Wave 3) |
| `finplan-scout` / `-analyst` / `-director` | scan / score / report | Phase 3 (Wave 4) — the standing loop |

## The waves

### Wave 0 — Foundation: tokens + accessibility  (build `finplan-designer`, `finplan-a11y`)
First because the dead `*-shiny-*` token layer (row 4) is the substrate for all UI work, and a11y (2/10) is both the worst dimension and a trust issue — the cold audit found the honesty disclaimer itself fails contrast.
- Designer: migrate the palette to `@theme` in `global.css`, remove dead classes, fix ignored `variant` props, consolidate the triplicated cards. (row 4)
- A11y: contrast to the canonical §7 palette, label/`htmlFor` association, ARIA per APG (tabs, sliders, disclosure), keyboard + focus management, turn on `jsx-a11y`. (rows 5, 6)
- Engineer wires tokens; QA + auditor confirm. Target: a11y 2→8, UI/UX consistency restored.

### Wave 1 — Modeling rigor  (build `finplan-quant`)
Real Monte Carlo with a stated success probability and sequence-of-returns risk; tax-aware withdrawals and Social Security COLA (properly resolves row 9). Earns back the word "probability" and retires the row-1 relabel into a real cone. Target: modeling 4→8, rigor 7→9.

### Wave 2 — Close the long tail  ✅ **COMPLETE 2026-06-07**
Row 7 (guard the `monthlyContrib` auto-overwrite), row 8 (verify resolved + close), the zero-target-state bug (row 10), orphan/dead-code cleanup (triplicated CompoundCalculator + Resources), and edge-case test expansion (drawdown, gap solver, smart defaults). Target: eng + testing up.

**Delivered:**
- **Row 7 FIXED** — `hasModifiedContrib` guard (flag set before value, so the synchronous smart-default subscriber can't clobber a hand-entered contribution). Live-verified + regression test.
- **Row 8 FIXED** — verified the dead `r == g` branch was removed by the single-engine rewrite (git-confirmed: added `a967ceb`, removed `72414b6`); locked with a continuity/monotonicity property test; removed the stale eslint rule + the dead `withdrawalRate` initial value it had masked.
- **Zero-target bug → logged as row 16, FIXED** (the SWEEP-PLAN's "row 10" slot was taken by the reduced-motion fix, so it became row 16). `planReady = annualRetSpend > 0` gates Step 5 (early-return prompt + "Start with Step 1 →" CTA) and Step 4 (No-target panel, neutral strip, no false "✓ on track"). Live-verified.
- **Orphan/dead-code cleanup** — 7 orphan files + 2 empty dirs deleted; eslint + a11y-test ignore lists cleaned; **2 pre-existing Recharts type errors fixed → `tsc` now strict-clean** across the tree.
- **Tests** — 30 → 41 (rows 8/7/16 regressions + 8 drawdown/gap-solver/smart-default edge cases). Lint 0 errors, build green.

**Audit:** `studio/audits/wave2-long-tail_v1.md` — **8.4/10, 0 Critical, 0 regressions** (16 errors.md rows scanned, none re-opened; row-7 ordering traced against the nanostores re-entrancy queue; suite run independently). The two "revise" items (gap-solver "approximate" label + tighter test bound; passive-income-covered card copy) and a Pattern-1 polish (`planReady` centralized on the engine) were addressed same-day and re-verified (live + green gate). Deferred to their owning agents: a contribution re-sync affordance (product), the Step5/Step4 pointer wording (content), and the `#cbd5e1` palette drift (designer).

### Wave 3 — Per-screen audit + education  (build `finplan-content`)  ✅ **COMPLETE 2026-06-08**
Auditor full pass on every screen; content adds the "why" behind each input, tooltips, attribution, and the Resources page; QA expands coverage. Every screen clears the lenses with zero Critical.

**Delivered:**
- **`finplan-content` built** — the Phase 3 "explains" agent (SKILL.md + verification.md + failure_modes.md + learnings.md + evals/io_pairs.md), modeled on the a11y skill. Owns `glossary.md`; encodes the 7-point Content Floor (the "why," attribution, glossary-locked language, honest framing with CFP, Sethi-non-judgmental, preston-writing voice, the next move).
- **Per-screen audit pass** — all 7 screens audited (4 parallel auditor agents): Welcome 6.5, Step 1 5.5, Step 2 7, Step 3 6.5, Step 4 7.5, Step 5 7 (re-audit, up from 6), Bonus 6/8.5. Audits in `studio/audits/`. The orchestrator owned the single live pass.
- **Fixes (errors.md rows 18–26, all FIXED + guarded/live-verified):** contrast recurrence — Welcome `#334155` (1.72→6.96:1) + Step 1 white-alpha (row 18); "Discretionary"→"Guilt-Free Spending" glossary (row 19); off-canonical hexes `#22c55e`/`#f97316`→canonical + violet ratified into §6 (row 20); Step 5 income-table caveat, the surviving step5_v1 Critical (row 21); Step 3/5 Pattern-1 recompute → read the engine (row 22); Step 4 dual-success reconciliation (row 23); CompoundCalc effective-monthly + estimate disclaimer (row 24); the content "why" gap on ~25 inputs (row 25); Welcome attribution (row 26).
- **Canonical** — §6/§7 extended (designer): violet `#8b5cf6` (chart/large) + `#a78bfa` (body) + the lighter-tint rule + the `#334155`-banned-as-text row, all with computed ratios.
- **QA** — 41 → 44 tests (contrast `#334155`/white-alpha guard ×2 + off-canonical-hex guard). Lint 0 errors, tsc strict-clean, build green. All 7 screens live-verified (the forced reduced-motion path used to inspect navigated screens under the documented headless-rAF throttle, then reverted).

### Wave 4 — Ship as a resource  (build `finplan-scout`, `-analyst`, `-director`)  ✅ **COMPLETE 2026-06-08**
Stand up the standing loop (weekly scout sweep → analyst prioritization → director briefing). Add a public methodology page (every formula + source), a bundle-size pass (code-split Recharts, 590 kB today), final WCAG AA sign-off, and a green CI gate. Public-trust statement: every figure validated, open source, no data leaves the browser.

**Delivered:**
- **The standing loop is built.** `finplan-scout` (scans → `backlog/`), `finplan-analyst` (scores → `specs/`), `finplan-director` (briefs → `briefings/`) — each a full 5-file skill in the house format, plus the `briefings/TEMPLATE.md`. The BRAIN five-agent spine is now complete end to end: Scout → Analyst → bench → Auditor → Director → Preston.
- **Public methodology page** (`src/components/Methodology.tsx`, wired as a bonus tab) — every formula and source from canonical §1–§10 in plain language: withdrawal brackets, the Number + COLA/pre-tax/today's-$, the projection, the Monte Carlo, the drawdown, what the tool does NOT model, the Wolfram-locked reference values, the full bibliography, and the open-by-design trust footer. Live-verified accessible (body 17.06:1, no banned colors).
- **Bundle pass** (row 28) — lazy-loaded the four chart-bearing screens: NavigationTabs **601 → 188 kB** (gzip 177 → 59); Recharts (CartesianChart 328 kB) now loads on demand. The >500 kB warning is gone.
- **CI hardened** (row 29) — `npm ci` + strict lint (`--max-warnings 0`) + test + build on every push/PR, with a concurrency guard; the one pre-existing `any` removed; a CI badge on the README.
- **README de-staled** (row 27) — the old `×0.6` drawdown and `±2%` cone (which contradicted the engine + methodology page) corrected to canonical; Trust & Methodology section added.
- **Trust statement** — "every figure validated, open source, no data leaves the browser" lives on the README, the in-app footer, and the methodology page.
- **Gate:** 44 tests green, lint 0 warnings (strict), tsc strict-clean, build green. errors.md rows 27–29 FIXED.

## Per-screen audit matrix
| Screen | Audited? | Known open items |
|---|---|---|
| Welcome | **yes (v1, W3)** | `#334155` contrast ✅, attribution ✅ (rows 18, 26); open: decorative step-number violet on small badges (residual, large-accent spirit) |
| Step 1 — Current Reality | **yes (v1, W3)** | white-alpha contrast ✅, the "why" on foot-gun/account inputs ✅ (rows 18, 25); open: helper on remaining self-evident guilt-free items (deliberately skipped per F5/F7) |
| Step 2 — Retirement Design | **yes (v1, W3)** | "Guilt-Free" glossary ✅, violet-as-text ✅, per-slider "why" ✅ (rows 19, 20, 25); zero Critical |
| Step 3 — Your Number | **yes (v1, W3)** | Pattern-1 recompute ✅, WR bracket-cliff hint ✅ (row 22); zero Critical |
| Step 4 — Investment Path | **yes (v1, W3)** | tokens ✅, a11y ✅, real MC cone ✅ (W1), zero-target ✅ (W2), dual-success reconciliation ✅ (row 23); zero Critical |
| Step 5 — Summary | **yes (v2, W3 re-audit)** | income-table caveat ✅ (row 21, the surviving v1 Critical), status hexes→canonical ✅ (row 20), Pattern-1 recompute ✅ (row 22), chart relabel ✅; zero Critical |
| Bonus — CompoundCalculator / Resources | **yes (v1, W3)** | effective-monthly + estimate disclaimer + monospace + rule-of-72 guard ✅ (row 24); Resources link aria-labels ✅; zero Critical |

## Sequencing rules
- Tokens (designer) land before any UI/a11y polish — otherwise work piles onto the broken layer.
- Quant ships before "probability" language returns anywhere.
- Every fix follows the loop: spec → build → test → audit → `errors.md` update. Nothing ships without a passing test and a clean auditor pass.
- Preston holds ship authority at the end of each wave.

---

*Sweep plan v1.0 | 2026-06-06 | Execute wave by wave; log every fix in errors.md and studio/audits/.*
