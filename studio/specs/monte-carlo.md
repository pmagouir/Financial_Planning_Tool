# Spec: Monte Carlo — the real probability layer (Wave 1)
# Owner: finplan-quant (math) → finplan-engineer (wiring) | Created: 2026-06-07 | Status: **SHIPPED 2026-06-07** — engine + UI (real cone) + Step 5 success metric; row 1 FIXED; audit monte-carlo_v1.md (8.5/10). Remaining Wave 1: row 9 (COLA/tax).

## Problem
Closes `errors.md` row 1 for real (deterministic "Scenario Range" → a real probability cone with a stated success rate) and resolves the §4 "no sequence-of-returns risk" gap. Re-earns the word "probability" (sequencing rule: quant ships before probabilistic language returns).

## The change
- **Methodology (ratified):** canonical §10 — seeded lognormal Monte Carlo, moment-matched (Wolfram-validated), σ 16% accumulation / 10% retirement (sourced); success = portfolio > 0 through `retDuration`; percentile cone = p10/p50/p90; N=1000; mulberry32 seed.
- **§4 ratified change:** retirement return `×0.6 → ×0.85` (realistic ~60/40, ~3% real) — Preston's call 2026-06-07. Affects the deterministic drawdown too.
- **Engine (shipped):** `runMonteCarlo` in `financialPlan.ts`; `results` now exposes `successProbability`, `mcCone` ({year,p10,p50,p90}), `medianPortfolio`. Deterministic `projectedPortfolio` unchanged (still the §5 LOCKED mean). Drawdown now withdraws `netNeed` not gross (row 11).
- **UI (PENDING):** Step 4 cone → plot `mcCone` percentile fan + relabel to probability language; Step 5 → success-probability headline. This is what flips row 1 to fully FIXED.

## Canonical references
§10 (Monte Carlo, all parameters + reference values), §4 (ratified return), §2 (netNeed), §8/§10.5 (labeling), glossary (allowed probability language once shipped).

## Sources & Assumptions
- Source: macrotrends S&P annual returns; NYU V-Lab SPX GARCH; CFA Institute 60/40. Lognormal moment-matching validated in WolframAlpha 2026-06-07 (μ=5.95%,σ=10% → mean 1.0595, sd 0.10).
- Assumption: educational long-run μ/σ; misses fat tails/regime change/serial correlation — disclosed, never implied otherwise.

## Acceptance criteria (what QA tests) — DONE for the engine
- [x] Seeded determinism: identical inputs → identical success rate.
- [x] Percentile cone ordered p10≤p50≤p90, length yearsToRet+1.
- [x] Median < deterministic mean (lognormal skew); median in the Wolfram band (~$1.3M).
- [x] Drawdown success ≈ Wolfram ground truth (~73%) for the isolated $1M/4%/30-yr case.
- [x] Deterministic `projectedPortfolio` still = $1,574,534.16 (single engine intact). 27/27 green.
- [ ] **PENDING:** Step 4 shows the percentile cone with honest "probability" labeling; Step 5 shows the success rate; preview-verified; auditor pass; row 1 → FIXED.

## Out of scope (this pass)
- Row 9 (SS COLA vs pension non-COLA + SS taxability) — next within Wave 1.
- Step 4/5 UI rewrite + preview + audit — next focused step.
