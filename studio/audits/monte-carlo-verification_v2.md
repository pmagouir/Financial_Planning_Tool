# Audit: Monte Carlo — full measurement pass (pre-deploy) v2
# Auditor: finplan-quant + finplan-qa | Date: 2026-06-09
# Trigger: pre-deploy verification — "confirm the MC is right; the 10th percentile looks bad."

## Verdict
**Correct — ship.** The Monte Carlo engine is mathematically sound and its live output matches independent ground truth within Monte Carlo sampling error for N=1000. The "10th percentile looks bad" is the model being honest about real downside risk, not a defect — independently confirmed. **Do not make it rosier** (that is the Pattern-2 false-comfort trap the tool exists to avoid).

## errors.md regression scan
This is a verification of existing math, not a code change; the relevant MC rows are re-confirmed clean.
- Row 1 (false-rigor labeling — the "probability" claim): **CLEAN** — the seeded simulation genuinely earns "probability"; Wolfram N=100k independently reproduces the §10.4 reference, so the label matches the math.
- Row 2 (multi-engine divergence): **CLEAN** — MC and the deterministic mean derive once in `financialPlan.ts`; no component recompute. Test "row 2" passes (net-worth peak == projectedPortfolio to 6 dp).
- Row 9 (flat pension < COLA SS): **CLEAN** — test passes (successPension < successSS).
- Row 11 (drawdown nets income, withdraws netNeed): **CLEAN** — verified in the drawdown success measurement (netNeed = $40k, no income).
- Row 12 (net-worth chart shows median + p10 downside, not the mean): **CLEAN** — measured net-worth cone p10 $0 / p50 $860k / p90 $3.65M; depletion visible.
- Row 13 (headline reads the MEDIAN, not the mean): **CLEAN** — measured median $1.289M < deterministic mean $1.575M; medianGap drives the headline (test passes).
- Row 16 (zero-target guard): **CLEAN** — N/A to the math here; guarded by its own test.
- Rows 3–8, 10, 14–15, 17–29 (persistence, tokens, contrast, content, bundle, CI, copy): **N/A** — outside the MC engine's scope; unaffected by this verification.
- No row TRIGGERED. No prior fix re-opened.

## Method — verified four independent ways
1. **Test suite:** `financialPlan.test.ts` — **27/27 pass, including all 9 Monte Carlo tests** (seeded determinism, [0,1] probability, cone ordering p10≤p50≤p90 at every year, median<deterministic-mean, drawdown success bounded, full-lifecycle net-worth cone with p10 depletion, median-based headline gap, flat-pension < COLA-SS success).
2. **Spec trace:** the engine's `runMonteCarlo` (financialPlan.ts) implements canonical §10 exactly — lognormal moment-matching (§10.1), σ_accum 0.16 / σ_ret 0.10 (§10.2), seeded mulberry32, N=1000, grow-then-contribute (accum) and grow-then-withdraw (drawdown, sequence-of-returns order), p10/p50/p90 cone (§10.3).
3. **Independent Wolfram re-derivation (N=100,000), fresh from the spec:**
   - Moment-match accum (μ=7%, σ=16%): mean **1.0700**, SD **0.1600** — exact (§10.1).
   - Moment-match retire (μ=5.95%, σ=10%): mean **1.0595**, SD **0.1000** — exact.
   - Accumulation bands ($100k + $12k/yr×1.03^(y−1), 25 yr): p10 **$687,421** / median **$1,305,762** / p90 **$2,670,931** / mean **$1,545,337** — matches the LOCKED §10.4 reference.
   - Drawdown success ($1M, $40k×1.03^(y−1), 30 yr, μ_ret 5.95%, σ 10%): **73.5%** — matches §10.4's ≈73%.
4. **Live engine measurement (actual seeded N=1000 output), same inputs:**

   | Quantity | Engine (N=1000) | Wolfram (N=100k) | Δ |
   |---|---|---|---|
   | Accum p10 | $698,238 | $687,421 | +1.6% |
   | Accum median | $1,288,711 | $1,305,762 | −1.3% |
   | Accum p90 | $2,632,529 | $2,670,931 | −1.4% |
   | Drawdown success | 71.9% | 73.5% | −1.6 pp |
   | Net-worth final p10 / p50 / p90 | $0 / $860,487 / $3,651,424 | — | — |

   All deltas sit inside the N=1000 sampling error (canonical §10.3: ±~1.5pp on a success rate; a few % on terminal percentiles). The seeded mulberry32 RNG differs from Wolfram's, so exact agreement is neither expected nor required — convergence to the same population values is.

## The "10th percentile looks bad" finding — RESOLVED (correct, not a bug)
- **Accumulation p10 = $698k = 44% of the $1.57M mean.** Wolfram independently returns the same 44%. This is the honest 1-in-10 *unlucky* terminal outcome under σ=16% equity volatility compounded over 25 years — still a gain on ~$400k contributed, just far below the median. The band width is real risk, correctly modeled.
- **Net-worth p10 → $0.** With ~28% of paths depleting (success ≈72%), the bottom decile is by definition a depleting path, so its terminal value is $0. This is the sequence-of-returns risk the MC was built to surface (the pre-Wave-1 smooth deterministic line hid it). Labeled honestly on Step 5 ("10th percentile downside … the weakest scenarios have run out").

## Residual risk (disclosed, not a defect)
- **IID-lognormal model** has no mean-reversion or return/inflation correlation, so it is *more conservative* than the historical-bootstrap behind the canonical "4% rule ≈ 95% / 30 yr." That is why $1M/4%/30yr reads ~72% here. This is a documented, sourced modeling choice (§10.2), intentionally sober. A historical-bootstrap or lower-σ model would read friendlier — that is a future quant decision with its own tradeoffs, **not** a correction to make because the downside looks alarming.
- N=1000 is fixed for reproducibility/performance; percentile noise is ~a few % (acceptable, and the bands are presented as estimates).

---
*finplan-quant + finplan-qa | independent ground truth: WolframAlpha N=100k (2026-06-09); live engine measured via throwaway harness, since removed. Reference: studio/audits/monte-carlo_v1.md, canonical §10.*
