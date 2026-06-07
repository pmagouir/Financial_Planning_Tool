# Audit: monte-carlo (Wave 1, row-1 closure) v1
# Auditor: finplan-auditor | Date: 2026-06-07

## Verdict
**Ship — row 1 closed for real.** The deterministic ±2% "Scenario Range" is gone; Step 4 now reads a seeded lognormal Monte Carlo (canonical §10) and renders a 10th–90th percentile cone with a median line, and a headline success probability ("X% of 1,000 simulations fund all N years"). Step 5 carries the same success metric. Every label is glossary-honest ("probability," "percentile," "estimate, not a guarantee"). The math is independently validated (WolframAlpha) and the engine is unit-cross-validated against it. One residual: the Recharts SVG itself could not be visually confirmed painting in the headless preview (it throttles ResizeObserver/rAF, so the chart canvas doesn't measure) — data, labels, and the success metric are DOM-verified and test-locked; the visual paint needs a real-browser pass.
**Composite: 8.5/10.**

## errors.md regression scan (total)
- Row 1 (false-rigor cone): **CLOSED — real probability cone.** Engine = seeded MC (§10); Step 4 reads `res.mcCone` (p10/p50/p90) + `successProbability`; deterministic ±2% cone deleted from the store. Labels: "Projected Range," "90th/Median/10th percentile," "1,000 Monte Carlo simulations," "an estimate … not a guarantee." Glossary-compliant.
- Row 2 (single engine): **clean.** `projectedPortfolio` deterministic path unchanged ($1,574,534.16 still locked); MC + net-worth both derive from the one store; row-2 test now asserts net-worth peak == projectedPortfolio (the dead cone reference was removed). 27/27 green.
- Row 3 (persistence): **clean.** Untouched; demo inputs persisted across the reload during verification.
- Rows 4/5/6/10 (tokens, contrast, a11y, reduced-motion): **clean.** The new Step 4 banner uses §7-safe colors + a non-color text cue (1.4.1) and `role="status"`; also fixed a stray `#334155` text contrast bug found in Step 4's outcome summary.
- Row 7 (`monthlyContrib` overwrite): **N/A.** Untouched — still OPEN.
- Row 8 (dead `r==g` branch): **N/A.** Still OPEN (lint `warn`).
- Row 9 (flat-CPI passive income): **OPEN — partially advanced.** The drawdown now nets out passive income (`netNeed`, row 11), but SS is still inflated at full CPI rather than its own COLA, and pensions are not yet treated as non-COLA, and taxability is uncaveated. This is the next Wave 1 item.
- Row 11 (gross-vs-net drawdown): **FIXED 2026-06-07** — both deterministic and MC drawdowns now withdraw `netNeed`; net-worth chart depletes correctly (slower). On-screen confirm pending (same headless caveat).

## Lens 1 — Nervous First-Timer
- The success probability is the single most legible "am I OK?" signal, and it now exists — with an honest qualifier ("Fragile / Workable / Strong footing") rather than a bare scary number. Median labeled "typical" helps a first-timer read the band.
- The demo plan shows **53%** — appropriately sobering and honest (tight plan, full sequence risk), not dressed up.

## Lens 2 — Skeptical CFP
- Distribution math validated in WolframAlpha (moment-match exact; σ→0 collapses to the deterministic path by construction). Success rate cross-validated: the isolated $1M/4%/30-yr case lands in the Wolfram ~73% band. Parameters sourced (§10.2). No number invented.

## Lens 3 — Trust & Credibility (the row-1 lens)
- **The core win.** "Probability" language is now backed by an actual simulation with a stated success rate — it earns the word (sequencing rule satisfied). The median-below-mean truth is surfaced, not hidden. Assumptions + "estimate, not a guarantee" travel with the number. No over-claim of tail-risk capture.

## Lens 4 — Regression-Across-Screens
- Single engine intact: `projectedPortfolio` still the locked deterministic mean; Step 4 and Step 5 read the same store `successProbability`. Dead deterministic cone removed cleanly (store + test + comment). Build green, 27/27.

## Recommended next actions
1. **Recommended** — Row 9: model SS COLA (≈ CPI, sourced to SSA), default pensions to non-COLA, caveat SS taxability — the last Wave 1 modeling item.
2. **Polish** — Real-browser pass to confirm the Recharts cone + the net-worth chart paint (and the netNeed drawdown shape on screen); retire the `[NEEDS-LIVE-rAF]` caveat.
3. Then Wave 2 (rows 7, 8, orphan cleanup, edge-case tests).

## Residual risk
- Headless preview does not paint Recharts (ResizeObserver/rAF throttled), so the cone/net-worth **visuals** are verified by DOM + tests, not by screenshot. A real browser is needed to fully retire that.
- MC realism is bounded by its assumptions (lognormal, fixed μ/σ, no fat tails/serial correlation) — disclosed in §10.2 and on-screen, but a sophisticated user should read it as an educational estimate.
