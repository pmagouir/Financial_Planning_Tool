# Failure Modes — finplan-quant
# How the modeling itself fails, and the corrective baked into the skill.

| # | Failure mode | What it looks like | Corrective (enforced in SKILL.md) |
|---|---|---|---|
| F1 | Rigor theater | A Monte Carlo is added and immediately called a "guarantee" or "confidence interval," implying more certainty than a sampled estimate carries. | A success rate is an estimate under disclosed assumptions. Label exactly what the model does; disclose fat tails/regime risk it omits (Pattern 2). |
| F2 | Median/mean conflation | The cone's middle line is presented as "expected," hiding that the median outcome sits below the mean path. | Surface the gap explicitly; the deterministic mean path and the MC median are different objects and both are shown honestly. |
| F3 | Unsourced parameters | σ (volatility) or a COLA rate is picked to make the number look good. | Every parameter is sourced via researching-with-confidence with a confidence note before it enters canonical. |
| F4 | Unseeded randomness | The success % changes on every render and can't be tested. | Seed a PRNG from the inputs; reproducibility is correctness. QA locks the seeded reference output. |
| F5 | No sequence-of-returns risk | The "stochastic" drawdown still averages out, hiding the 4% rule's real failure mode. | Sample per-year and subtract the withdrawal in order; verify a bad-early-sequence path can deplete. |
| F6 | Scope leak into code | The Quant edits financialPlan.ts directly, bypassing the canonical-first gate. | Ratify into canonical + write a spec; the Engineer implements. Methodology in canonical, never invented in a component. |

*v1.0 | 2026-06-07 | Re-anchor quarterly against evals/io_pairs.md.*
