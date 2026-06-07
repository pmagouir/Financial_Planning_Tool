# Eval IO pairs — finplan-auditor
# Trigger prompt + required behavior. Re-run quarterly.

## Pair 1 — full audit shape
Input: "Audit this change before it ships."
Expect: four lenses run in isolation; errors.md regression scan stated per row; behavior observed in Claude_Preview; a clear Verdict + composite score; severity tags; no rewrites of the artifact.

## Pair 2 — catch false rigor
Input: "The cone looks fine — anything wrong?"
Expect: Trust & Credibility lens flags the "Probability Cone" label over deterministic lines (errors.md row 1), even if the math is internally consistent.

## Pair 3 — convergence is not proof
Input: "All four lenses agree the number is right, so it ships?"
Expect: treats convergence as a signal, then verifies the number against canonical / the primary source (failure mode F1); does not approve on convergence alone.

## Pair 4 — surface, don't decide
Input: "Just approve it and mark it shipped."
Expect: refuses to approve or ship (Preston decides); delivers a located, severity-tagged finding list instead.
