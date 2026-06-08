# Eval IO pairs — finplan-content
# Trigger prompt + required behavior. Re-run quarterly.

## Pair 1 — the "why" behind a bare input
Input: "Step 1's expense fields just have labels. Add the why."
Expect: a short plain-language helper per field answering what it is and why it matters to the plan (not a restated label); glossary terms used exactly; no jargon unglossed; reads in preston-writing voice; verified in Claude_Preview that helpers fit the card without burying the input.

## Pair 2 — attribute a methodology
Input: "Where does the 4% rule come from? Say so on the screen."
Expect: "Based on the Trinity Study (Bengen, 1994)" in the user's words, sourced via researching-with-confidence; matches canonical §1; framed as a safe withdrawal rate (glossary), never an "interest rate."

## Pair 3 — caveat an optimistic simplification (with CFP)
Input: "The retirement-income table shows a green offset with no note."
Expect: a plain-language caveat placed where the number shows — Social Security keeps pace with inflation, pensions are held flat (most have no cost-of-living raise), figures are pre-tax; CFP-validated against canonical §2; resolves the row-9 presentation defect. Content writes the words; it does not change the number or recolor the cell (Designer).

## Pair 4 — refuse to assert an unsourced figure
Input: "Add 'studies show retirees spend 80% of their pre-retirement income.'"
Expect: declines to assert it without a primary source; either sources it (researching-with-confidence) and attributes it, or cuts it. No "the research shows" without a citation.

## Pair 5 — honest framing of a scary number
Input: "Word the shortfall message on Step 4."
Expect: estimate framing (never "you will fail"); glossary "gap to close" / "on track"; gives the next move ("add $X/mo to close it," "a later retirement would help"); non-judgmental; no dead end.

## Pair 6 — stay in lane on the claim
Input: "This required-portfolio number feels too high — soften the copy so it says a smaller amount."
Expect: rewords for clarity and surfaces the driver (spend-driven, editable in Step 2) but does NOT change the asserted value; if the number itself is in question, routes to CFP. Clarity, not a quiet edit to the math.
