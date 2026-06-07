# Spec: Single projection engine + input persistence
# Owner: finplan-cfp (methodology) → finplan-engineer (implementation) | Created: 2026-06-06 | Status: ready for engineer

## Problem
Closes `errors.md` row 2 (multi-engine divergence) and row 3 (no persistence).
- The portfolio projection is computed three ways: `financialPlan.ts:154` (annual-add), `financialPlan.ts:240` (intra-year monthly), and a component-local model in `Step4_InvestmentPath.tsx`. They disagree for identical inputs, so Step 4 and Step 5 can show different projected totals for the same plan.
- `inputs` uses a plain `map`, so a page refresh wipes everything the user entered.

## The change
1. Add one exported projection function in `financialPlan.ts` that simulates month-by-month at the effective monthly rate. Every consumer (`projectedPortfolio`, the `netWorthData` accumulation phase, and Step 4's cone) calls it. Delete Step 4's local `projectPortfolio`.
2. Migrate `inputs` from `map` to `persistentMap` (`@nanostores/persistent`, already a dependency) so progress survives a refresh.

## Canonical references
- Model: canonical §3 (RATIFIED 2026-06-06). `m = (1 + annualReturn/100)^(1/12) − 1`; lump sum `currentPortfolio × (1+m)^(12·yearsToRet)`; contributions end-of-month, step up by `contribIncrease` once per year, each compounding `(1+m)^(monthsToRet − k)`; contributions stop at `contribStopYear`.
- Reference values: canonical §5. For PV $100,000, $1,000/mo, g 3%, r 7%, 25 yr — lump $542,743.26, contributions $1,031,790.90, **projectedPortfolio $1,574,534.16**.

## Sources & Assumptions
- Source: future value of an increasing annuity (time value of money). The effective-monthly-rate convention keeps the displayed annual return honest: `(1+m)^12 = 1+r`, so "7%" means a true 7% effective annual. Independently recomputed in WolframAlpha 2026-06-06.
- Assumption: contributions post end-of-month (ordinary annuity). Raises apply once per year, not monthly.
- Assumption: the stated return is an effective annual rate, not nominal.
- Assumption: the post-retirement drawdown model (canonical §4) is unchanged by this spec.

## Acceptance criteria (what QA tests)
- [ ] `projectedPortfolio` === $1,574,534.16 (±$0.01) for the reference inputs.
- [ ] lump-sum term === $542,743.26; contribution term === $1,031,790.90.
- [ ] Step 4 cone "expected" path endpoint === store `projectedPortfolio` to the cent for the reference inputs (cross-screen equality — closes row 2).
- [ ] Step 5 net-worth pre-retirement peak === store `projectedPortfolio` for the reference inputs.
- [ ] Inputs persist across a simulated remount (closes row 3).
- [ ] `yearsToRet = 0` returns `currentPortfolio` with no contributions and no divide-by-zero.

## Out of scope
- The `monthlyContrib` auto-overwrite (row 7) and the dead `r == g` branch (row 8) — same agent, separate spec.
- Monte Carlo / sequence-of-returns (finplan-quant, Phase 2).
- Relabeling the "probability cone" (row 1) — separate change.
