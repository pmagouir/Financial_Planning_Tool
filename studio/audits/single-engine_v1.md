# Audit: Single projection engine + persistence v1
# Auditor: finplan-auditor | Date: 2026-06-06

## Verdict
**Ship.** The change is correct, tested, and verified live in the browser. It closes errors.md rows 2 (multi-engine divergence) and 3 (no persistence) with no regressions. One pre-existing Critical issue (row 1, the "Probability Cone" mislabel) is now the highest-leverage next change — this fix made the cone *consistent* but it is still *mislabeled*.
**Composite: 9/10.**

## Evidence base
- Build: `npm run build` green (1041 modules, no errors).
- Tests: `npm test` → 8/8 green, including Wolfram-validated reference values, the row-2 cross-screen equality test, and the row-3 persistence test.
- Live (Claude_Preview): zero console errors; app renders; **Step 4 on-screen "Median outcome" = $1.57M**, matching the store's `projectedPortfolio` $1,574,534.16; all 59 `finplan:` keys present in localStorage after load.

## errors.md regression scan
- **Row 1 (false-rigor labeling):** TRIGGERED — live DOM still contains "Probability Cone" and "uncertainty envelope" over three deterministic lines. Pre-existing, out of scope for this spec, not introduced by this change. Flagged Critical for the next spec.
- **Row 2 (multi-engine divergence):** CLEAN — single `projectAccumulation` engine; Step 4 reads `res.coneSeries`; live median ($1.57M) equals store `projectedPortfolio`; net-worth peak equals it (tested to 6 dp). FIXED.
- **Row 3 (silent state loss):** CLEAN — `persistentMap`; 59 keys confirmed in localStorage live. FIXED.
- **Rows 4–9:** Not in scope; untouched by this change. No regression introduced (build + render clean).

## Lens 1 — Nervous First-Timer
### Critical
- None.
### Improvement
- The cone scenario labels remain "Pessimistic / Median / Optimistic." "Cautious / Expected / Optimistic" (already the store's field names) would read less intimidating to a first-timer. Low effort; pairs naturally with the row-1 relabel.

## Lens 2 — Skeptical CFP
### Critical
- None. Every projected number traces to canonical §3/§5 and the single engine; the $1,574,534.16 was independently recomputed in WolframAlpha and is locked by a test. `(1+m)^12 = 1+r` keeps the stated return honest.
### Improvement
- The flat-CPI-on-passive-income simplification (row 9) is unrelated to this change but remains uncaveated on screen. Tracked separately.

## Lens 3 — Trust & Credibility
### Critical
- **The chart is still titled "Probability Cone" with "The shaded band is the uncertainty envelope," over three deterministic lines (base ±2%).** Confirmed live (`stillSaysProbabilityCone: true`). This change made the three lines derive from one honest engine, but the *label* still implies a stochastic simulation that does not exist. A nervous first-timer reads it as a real probability. This does not block shipping the engine fix (the label is pre-existing), but it is the top credibility issue in the product and should ship next (errors.md row 1).
### Improvement
- None beyond the above.

## Lens 4 — Regression-Across-Screens
### Critical
- None. **Convergent (tests + live):** Step 4 median, store `projectedPortfolio`, and the Step 5 net-worth pre-retirement peak are now one value. The defect that motivated this spec is closed and verified two independent ways.
### Improvement
- None.

## Recommended next actions
1. **Critical (next spec, row 1):** relabel the cone. Drop "Probability Cone" / "uncertainty envelope" / "Monte Carlo" until `finplan-quant` ships a real simulation with a stated success probability. Use "scenario range" and "expected / cautious / optimistic paths" per glossary.
2. **Polish:** rename the on-screen scenario labels to match the store's honest field names; remove the now-orphaned "Monte Carlo cone" comment and the unused `onTrackMedian`/`contribStopYear` locals left in Step 4 (lint-level).

## Residual risk
- This audit verified the accumulation projection and persistence. It did not exercise the post-retirement drawdown on screen or test extreme inputs beyond `yearsToRet = 0`; those remain QA's edge-case backlog.
- The live check used the reference scenario; it did not click through every step. The unit tests, not the screenshot, are the authority on the numbers.
