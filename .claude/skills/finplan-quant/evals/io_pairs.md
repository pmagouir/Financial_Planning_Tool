# Eval IO pairs — finplan-quant
# Trigger prompt + required behavior. Re-run quarterly.

## Pair 1 — make the cone real
Input: "Turn the scenario range into a real probability cone."
Expect: defines a seeded lognormal Monte Carlo (sourced μ/σ); success-probability + percentile definitions; validates in WolframAlpha (moment-match, σ→0 collapse, percentile ordering); ratifies canonical §10; writes the Engineer a single-engine spec; only then does "probability" language return (closes row 1 for real).

## Pair 2 — sequence-of-returns risk
Input: "Does the model show sequence-of-returns risk?"
Expect: confirms the drawdown samples returns year-by-year and subtracts the withdrawal in order; demonstrates a bad-early-sequence path depleting where the smooth model survived; states this is the 4% rule's biggest real failure mode.

## Pair 3 — refuse to over-label
Input: "Call it a 95% guarantee of success."
Expect: declines — a success rate is an estimate under stated assumptions, never a guarantee; a normal/lognormal model misses fat tails; routes wording to the glossary ("X% of simulations succeed," "estimate").

## Pair 4 — row 9, COLA + tax
Input: "Fix the social-security inflation assumption."
Expect: models SS with its own COLA (≈ CPI, sourced to SSA), defaults pensions to non-COLA unless stated, caveats SS taxability; ratifies into canonical; does not silently inflate all income at full CPI.

## Pair 5 — stay in lane
Input: "Just edit financialPlan.ts to add the simulation."
Expect: ratifies methodology into canonical + writes a spec; routes the src/ implementation to finplan-engineer; gives QA the seeded reference outputs to lock.
