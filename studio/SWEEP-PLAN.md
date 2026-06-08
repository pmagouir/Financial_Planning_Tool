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

## Agents still to build
| Agent | Verb | Unlocks |
|---|---|---|
| `finplan-designer` | designs | the `@theme` token system, component consolidation, motion, the "beautiful" axis |
| `finplan-a11y` | ensures access | WCAG AA across every screen (the worst dimension, 2/10) |
| `finplan-quant` | models | real Monte Carlo + sequence-of-returns + tax/COLA (the "rigorous/innovative" axis) |
| `finplan-content` | explains | the "why" behind each input, tooltips, attribution, Resources |
| `finplan-scout` / `-analyst` / `-director` | scan / score / report | the standing weekly improvement loop |

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

### Wave 3 — Per-screen audit + education  (build `finplan-content`)
Auditor full pass on every screen; content adds the "why" behind each input, tooltips, attribution, and the Resources page; QA expands coverage. Every screen clears the lenses with zero Critical.

### Wave 4 — Ship as a resource  (build `finplan-scout`, `-analyst`, `-director`)
Stand up the standing loop (weekly scout sweep → analyst prioritization → director briefing). Add a public methodology page (every formula + source), a bundle-size pass (code-split Recharts, 590 kB today), final WCAG AA sign-off, and a green CI gate. Public-trust statement: every figure validated, open source, no data leaves the browser.

## Per-screen audit matrix
| Screen | Audited? | Known open items |
|---|---|---|
| Welcome | no | lens pass pending |
| Step 1 — Current Reality | no | dead tokens, a11y |
| Step 2 — Retirement Design | no | dead tokens, a11y, slider ARIA |
| Step 3 — Your Number | no | a11y, labeling |
| Step 4 — Investment Path | partial (single-engine v1) | tokens ✅, a11y ✅, real MC cone ✅ (W1), zero-target guard ✅ (W2); open: full lens pass |
| Step 5 — Summary | **yes (cold audit v1)** | row 9 caveat ✅, contrast ✅, dead tokens ✅ (W0/1), zero-target bug ✅ (row 16, W2); open: full re-audit |
| Bonus — CompoundCalculator / Resources | no | dedupe orphans ✅ (W2 — 4 triplication orphans + 3 dead UI components deleted), a11y pending |

## Sequencing rules
- Tokens (designer) land before any UI/a11y polish — otherwise work piles onto the broken layer.
- Quant ships before "probability" language returns anywhere.
- Every fix follows the loop: spec → build → test → audit → `errors.md` update. Nothing ships without a passing test and a clean auditor pass.
- Preston holds ship authority at the end of each wave.

---

*Sweep plan v1.0 | 2026-06-06 | Execute wave by wave; log every fix in errors.md and studio/audits/.*
