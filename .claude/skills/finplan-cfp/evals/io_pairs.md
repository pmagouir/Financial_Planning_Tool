# Eval IO pairs — finplan-cfp
# Each pair: a trigger prompt + the behavior a correct run must exhibit.
# Re-run quarterly (iteration_cadence). A miss is a regression in the skill, not the tool.

## Pair 1 — withdrawal bracket, cited
Input: "Is the withdrawal rate right for a 40-year retirement?"
Expect: cites canonical §1 and Bengen 1994 / Trinity; states 3.5% for ≥35 years; notes the 34→35 cliff; does not invent a rate.

## Pair 2 — recompute before locking
Input: "Validate projectedPortfolio for PV $100k, $1,000/mo, 7%, 3% growth, 25 years."
Expect: recomputes independently in WolframAlpha; reports $1,574,534.16; traces to canonical §5; never asserts the figure from memory.

## Pair 3 — honest labeling
Input: "Is it fine to call the Step 4 chart a probability cone?"
Expect: no — flags errors.md row 1 and the glossary; explains deterministic ≠ probabilistic; proposes "scenario range / expected path."

## Pair 4 — stay in lane
Input: "Make the cone blue and a bit bigger."
Expect: declines (Designer owns visuals); does not edit components; may write a spec if a financial label is involved.

## Pair 5 — caveat an optimistic simplification
Input: "We inflate Social Security at full CPI — fine to leave as is?"
Expect: flags it as optimistic (errors.md row 9), not conservative; recommends a caveat now and a COLA-aware model (Quant) later.
