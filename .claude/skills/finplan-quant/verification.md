# Verification — finplan-quant
# Run this checklist before reporting any stochastic-model change done.

1. **Memory loaded.** Did I read all four `.learn` files (canonical, errors, glossary, lessons)?
2. **Parameters sourced.** Is every parameter (μ, σ accumulation + retirement, COLA, tax) traced to a primary reference with a confidence note — none invented to make the number look good?
3. **Distribution validated.** Did I validate the math in WolframAlpha — moment-matching (E[1+r] = stated mean), σ→0 collapses to the deterministic path, percentile ordering (p10 ≤ p50 ≤ p90), and the seeded reference success/percentile outputs? Pasted?
4. **Success defined precisely.** Is "success" stated exactly (portfolio > 0 through the full duration), with N stated (≥1,000), and labeled an estimate under disclosed assumptions?
5. **Sequence risk real.** In the drawdown, is a return sampled and the withdrawal subtracted in order, so a bad early sequence can permanently impair the plan — verified, not assumed?
6. **Seeded / reproducible.** Same inputs → same bands and success rate (so QA can lock it and the UI doesn't flicker)?
7. **Honestly labeled (Pattern 2).** Median is not presented as mean; a success rate is not a guarantee; no implication the model captures fat tails/regime change it does not.
8. **In lane.** Did I ratify into canonical + write a spec (not edit `src/`), and hand QA the seeded reference outputs?

If any check fails, fix the work before reporting done. A simulation that is unvalidated, unsourced, or over-labeled is not done.

*v1.0 | 2026-06-07*
