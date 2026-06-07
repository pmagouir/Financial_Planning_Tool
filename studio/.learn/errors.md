# Errors Log — Financial Planning Tool Studio
# Purpose: every caught defect. Every finplan-* skill reads this BEFORE starting work.
# Schema (adapted for a code product): # | Date | Pattern | Location | Defect | Correct behavior | Source of truth | Owner + status
# Append-only. Do not delete rows. A defect that recurs is a protocol failure — escalate to Critical.

---

## How to use this file

1. **At session start** — every finplan-* skill reads this file. The "Open Patterns" section at the bottom summarizes what to watch for.
2. **During work** — when a defect matches a past pattern, cite the row number. The Auditor treats every row as a live regression test: scan the change against all rows; a recurrence is Critical, not minor.
3. **When a defect is fixed** — change its status to `FIXED YYYY-MM-DD` and add the QA test that now guards it. Never delete the row.
4. **At session end** — append new defects found this session.

Patterns are numbered 1–5 to match `lessons.md`.

---

## Error Log (append-only)

| # | Date | Pattern | Location | Defect | Correct behavior | Source of truth | Owner + status |
|---|------|---------|----------|--------|------------------|-----------------|----------------|
| 1 | 2026-06-06 | 2 (false-rigor labeling) | `Step4_InvestmentPath.tsx` (the "Probability Cone") | Labeled a probability cone / uncertainty envelope but renders three deterministic lines (base, base−2%, base+2%). Implies a stochastic simulation that does not exist. A nervous first-timer reads it as a real probability. | Relabel as a scenario range ("optimistic / expected / cautious") until a real Monte Carlo with a stated success probability ships. | Audit 2026-06-06; canonical §8 | Relabeled 2026-06-06: "Scenario Range" + "deterministic … not a probability forecast" + Expected/Cautious labels (glossary-compliant). False-rigor resolved. A real "probability" cone returns only when finplan-quant ships Monte Carlo (Phase 2). **FIXED (relabel) 2026-06-06.** |
| 2 | 2026-06-06 | 1 (multi-engine divergence) | `financialPlan.ts:154` vs `:240` vs `Step4_InvestmentPath.tsx` | Three projection engines (annual-add; intra-year monthly; component-local monthly) produce different answers for identical inputs. Step 5 and Step 4 can show different projected totals for the same plan. | Exactly one engine in `financialPlan.ts`; every screen reads from it. No component recomputes a projection. | canonical §0 | Model RATIFIED 2026-06-06 (finplan-cfp, canonical §3 + §5: effective-monthly simulation; reference projectedPortfolio = $1,574,534.16). Single engine `projectAccumulation` shipped in financialPlan.ts; Step 4 reads `res.coneSeries`; netWorthData reuses it. Guarded by financialPlan.test.ts (row-2 cross-screen test + projectedPortfolio = $1,574,534.16). Build + 8/8 tests green. **FIXED 2026-06-06.** |
| 3 | 2026-06-06 | 5 (silent state loss) | `financialPlan.ts` (`map`, not `persistentMap`); `package.json:17` | `@nanostores/persistent` is a dependency but unused. A page refresh wipes all user input, directly contradicting the stated Housel anti-abandonment philosophy. | Persist `inputs` to localStorage via `persistentMap`. | package.json; CLAUDE.md vision | `inputs` migrated to `persistentMap('finplan:', …)`. Guarded by financialPlan.test.ts (row-3 persistence test). **FIXED 2026-06-06.** |
| 4 | 2026-06-06 | 3 (canonical drift) | components referencing `*-shiny-*`; `tailwind.config.mjs`; `global.css` | Components use `*-shiny-*` utilities that exist in neither the config nor the CSS. Tailwind v4 likely does not load the JS-config palette (no `@theme` block, no `@config`). Much styling silently no-ops; the look is carried by inline styles + `.fintech-*` classes. | Migrate the palette to an `@theme` block in `global.css`; remove all `*-shiny-*` references. | canonical §6 | Designer + Engineer; build/preview check. **OPEN.** |
| 5 | 2026-06-06 | 4 (accessibility regression) | global theme; `MoneyInput.tsx`, `RangeSlider.tsx` | `#475569` text computes to 2.36:1 (fails all). `#64748b` body text computes to 3.07–3.75:1 (fails AA for normal text). | Body text uses `#94a3b8` or lighter; `#64748b` large text only; `#475569` never carries text. | canonical §7 (WCAG 2.2, computed) | A11y contrast gate; jsx-a11y rules on. **OPEN.** |
| 6 | 2026-06-06 | 4 (accessibility regression) | `MoneyInput.tsx`, `RangeSlider.tsx`, `NavigationTabs.tsx` | `<label>` rendered without `htmlFor`/`id`; zero `aria-*` across components; the tab nav is not marked up as a tablist; no focus management on tab change. | Associate every label; apply WAI-ARIA APG patterns for tabs/sliders/disclosure; manage focus and announce on navigation. | Audit 2026-06-06; WCAG 1.3.1, 4.1.2 | A11y per-component checklist. **OPEN.** |
| 7 | 2026-06-06 | 5 (input foot-gun) | `financialPlan.ts:81-84` | `inputs.subscribe` force-sets `monthlyContrib` to the Step 1 investment sum whenever that sum is >0. A contribution a user hand-enters in Step 4 can be silently overwritten when they revisit Step 1. | Gate the contribution sync; never clobber a user-entered value without explicit intent. | financialPlan.ts:81-84 | Engineer guard; QA test. **OPEN.** |
| 8 | 2026-06-06 | 1 (dead/duplicate logic) | `financialPlan.ts:132-151` | Dead `r == g` branch: the `if` and `else` run identical loops; the comment promises a closed-form geometric handling that was never implemented. | Collapse to one loop, or implement and test the documented closed form. | financialPlan.ts:132-151 | Engineer cleanup (low risk). **OPEN.** |
| 9 | 2026-06-06 | 2 (false-rigor labeling) | `financialPlan.ts:113` | All passive income (SS, pension, other) inflated at full CPI, presented without caveat. Overstates future income, understates the required portfolio; reads as conservative when it is optimistic. | Caveat the simplification now; model SS COLA and pension treatment in Phase 2. | canonical §2 | CFP labeling; Quant COLA model. **OPEN.** |

---

## Open Patterns (read this at session start)

- **Pattern 1 — multi-engine divergence.** The same financial quantity must be computed in exactly one place. Before adding any calculation to a component, check whether `financialPlan.ts` already owns it. If a number appears on two screens, the two screens must read the same store value. Never recompute a projection in a component.
- **Pattern 2 — false-rigor / false-certainty labeling.** Never describe an output as more rigorous than it is. Deterministic is not "probabilistic." A point estimate is not a "confidence interval." Every projection is an estimate, never a guarantee. Check the label against what the math actually does. See `.learn/glossary.md`.
- **Pattern 3 — canonical drift.** Every formula, reference value, and design token must trace to `.learn/canonical.md`. If the number or token you reach for is not in canonical.md, do not use it — add it to canonical first (with a source), then use it.
- **Pattern 4 — accessibility regression.** Every text/background pair must clear the canonical contrast table (§7). Every input needs an associated label. Status is never conveyed by color alone. Run the a11y checklist before any component ships.
- **Pattern 5 — silent state loss / input foot-gun.** Never lose or silently overwrite user input. Progress persists across refresh. A value the user typed is not overwritten by a default without intent.

---

*Errors log v1.0 | 2026-06-06 | Append-only | Consumed by: all finplan-* skills*
