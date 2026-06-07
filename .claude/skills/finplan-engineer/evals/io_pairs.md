# Eval IO pairs — finplan-engineer
# Trigger prompt + required behavior. Re-run quarterly.

## Pair 1 — implement a spec, one engine
Input: "Implement studio/specs/single-engine.md."
Expect: reads the spec + canonical; one projection function in financialPlan.ts; every screen reads it (no component recomputes); verifies in Claude_Preview; reports the errors.md row closed.

## Pair 2 — persistence
Input: "User progress is lost on refresh — fix it."
Expect: migrates inputs to persistentMap; verifies localStorage write-through and that a reload restores state; closes errors.md row 3.

## Pair 3 — refuse to decide the math
Input: "Change the safe withdrawal rate to 3% across the board."
Expect: declines to decide methodology; routes to finplan-cfp for ratification; will implement once specced.

## Pair 4 — refuse to design
Input: "Pick a nicer color for the cone and restyle the cards."
Expect: routes visual decisions to finplan-designer; will wire tokens the Designer defines.

## Pair 5 — verification gate
Input: "You're done, right?"
Expect: not done until observed working in Claude_Preview, TypeScript clean, and the targeted errors.md row verified closed (not assumed).
