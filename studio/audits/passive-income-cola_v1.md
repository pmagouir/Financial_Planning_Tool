# Audit: passive-income-cola (row 9, Wave 1 close) v1
# Auditor: finplan-auditor | Date: 2026-06-07

## Verdict
**Ship — row 9 closed; Wave 1 complete.** Passive income is now treated honestly: Social Security keeps its CPI/COLA growth (defensible — SS was never the real error), while pensions and other income are held fixed nominal (no COLA) as a deliberately conservative default, stated plainly in the UI. The drawdown (deterministic + Monte Carlo) is per-year income-aware, so a pension's real value erodes and success rates reflect it. Tax is caveated, not modeled (the honest scope choice). No regression for no-pension plans (verified identical).
**Composite: 8.7/10.**

## errors.md regression scan (rows touched / at risk)
- Row 9 (flat-CPI passive income): **CLOSED.** SS COLA + pension/other fixed nominal + per-year drawdown + tax caveat (canonical §2).
- Row 1 / §10 (Monte Carlo): **clean.** The MC drawdown signature changed (`annualWithdrawal` → `inflatingNet`/`flatIncome`); the no-income reference case ($1M/$40k/30yr, SS=pension=0) is algebraically unchanged (`flatIncome=0`, `inflatingNet=$40k`) → 73% reference holds. 30/30 green.
- Row 13 (median headline): **clean.** medianGap/median still drive the headline; row 9 lowers income → raises net draw → lowers median/success honestly, consistently across cards + chart.
- Row 2 (single engine): **clean.** Both the deterministic net-worth path and the MC read the same `inflatingNet`/`flatIncome`; no third computation.
- Rows 4/5/6/10/11/12: **clean.** Step 3 helper text + Step 5 disclaimer use §7-safe tokens; no chart/markup change.

## Lens 1 — Nervous First-Timer
- The pension input now says, in plain words, that we don't inflation-adjust it and that it's a conservative choice — a first-timer learns *why* their pension is treated cautiously. SS is labeled as growing with inflation and pre-tax. Honest and educational.

## Lens 2 — Skeptical CFP
- Correctly distinguishes COLA'd SS from non-COLA pensions (the actual modeling error row 9 named, refined). `requiredPortfolio` stays the standard 25× heuristic; the dynamic consequence (pension erosion) lives in the simulation, where it belongs. Tax is honestly caveated rather than half-modeled. Sourcing: SSA COLA methodology; non-COLA prevalence of private DB pensions.

## Lens 3 — Trust & Credibility
- The change makes the tool *more conservative* (lower future income → lower success), and it says so — no false reassurance. The pre-tax caveat is stated, not buried.

## Lens 4 — Regression-Across-Screens
- No-pension plans (incl. the demo) are byte-for-byte unchanged (verified: median $1.30M / 54%). Plans with a pension now show a lower, honest success rate. Step 3, Step 4 gap panel, and Step 5 all read the single median/medianGap.

## Residual risk
- Recharts visuals still unverifiable in the headless preview (model + text are DOM/test-verified; charts confirmed in Preston's real browser across this wave).
- "Pension grows to retirement at CPI, then flat" is a modeling choice for today's-dollar inputs; the dominant, indisputable correction (flat *during* retirement) is captured. A per-pension COLA toggle was deliberately declined (conservative default).
- Tax is not modeled — a real future loop; until then, spendable income is overstated by the (disclosed) pre-tax framing.
