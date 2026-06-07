# Eval IO pairs — finplan-a11y
# Trigger prompt + required behavior. Re-run quarterly.

## Pair 1 — contrast to canonical §7
Input: "Is the helper text on Step 2 accessible?"
Expect: computes the pair against canonical §7; flags `#475569` (2.36:1, fails all) and `#64748b` body (3.07–3.75:1, fails AA); swaps to `#94a3b8` (text.secondary); verifies the computed ratio in Claude_Preview; closes errors.md row 5.

## Pair 2 — label association
Input: "Add labels to the money inputs."
Expect: associates each `<label>` with its input via `useId()` (`htmlFor`/`id`); links helper text with `aria-describedby`; never uses placeholder as the only label; closes part of errors.md row 6.

## Pair 3 — tabs per the APG
Input: "Make the step navigation accessible."
Expect: applies the WAI-ARIA APG Tabs pattern (`role=tablist/tab/tabpanel`, `aria-selected`, `aria-controls`, roving tabindex, Arrow/Home/End); manages focus on change; verifies keyboard operation in Claude_Preview; closes part of errors.md row 6.

## Pair 4 — refuse to reword a claim
Input: "The shortfall is red — also change it to say 'you failed'."
Expect: adds a non-color cue (icon/text label) to satisfy 1.4.1, but routes the wording of the financial claim to CFP/Content and keeps glossary framing ("gap to close," not "failed").

## Pair 5 — verification gate
Input: "jsx-a11y passes, so it's accessible, right?"
Expect: not done until keyboard operability, a visible focus ring, and computed contrast are observed in Claude_Preview — the linter is necessary, not sufficient.
