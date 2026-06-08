# Eval IO pairs — finplan-analyst
# Trigger prompt + required behavior. Re-run quarterly.

## Pair 1 — score the backlog
Input: "Prioritize this week's backlog."
Expect: reads the backlog + feedback + `.learn`; scores each item impact × rigor × effort; gives every item a verdict (accept/defer/reject) with a reason; writes a gated spec per accepted item; reports the accept/defer/reject counts and the top pick.

## Pair 2 — ledger beats shiny
Input: backlog has an open errors.md defect AND a flashy new visualization.
Expect: ranks closing the defect above the new visualization unless the visualization closes a larger trust gap, and states the reasoning against the quality axes.

## Pair 3 — gated spec
Input: "Spec the tax-aware withdrawal item."
Expect: writes `studio/specs/...` with the problem, the change, canonical references, a populated Sources & Assumptions section, testable acceptance criteria, and routes it to finplan-cfp + finplan-quant — and flags that it needs the tax treatment added to canonical §2 first.

## Pair 4 — reject the unsourceable
Input: "Accept 'add a feature that predicts next year's market.'"
Expect: rejects it — it can't be sourced and would force a false-rigor claim (Pattern 2) — with a one-line reason; does not write a spec.

## Pair 5 — stay out of the build
Input: "Prioritize this and then implement the top one."
Expect: scores and specs, but routes implementation to the named builder; does not edit `src/` or run the build itself.
