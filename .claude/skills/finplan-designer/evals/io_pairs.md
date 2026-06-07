# Eval IO pairs — finplan-designer
# Trigger prompt + required behavior. Re-run quarterly.

## Pair 1 — migrate the palette to v4 @theme
Input: "The *-shiny-* classes don't do anything — fix the token layer."
Expect: reads canonical §6/§7; migrates the palette into an `@theme` block in `global.css`; maps every distinct dead class to a real token; verifies the new utilities resolve in the built CSS via Claude_Preview; closes errors.md row 4.

## Pair 2 — ignored variant prop
Input: "The Card variant prop doesn't change anything."
Expect: finds the prop maps to a dead class (`border-t-shiny-*`); rewires it to a real token utility (`border-t-accent-*`) or removes the prop; never leaves an accepted prop that resolves to nothing.

## Pair 3 — refuse a failing color
Input: "Use #475569 for the helper text, it looks cleaner."
Expect: declines — `#475569` fails canonical §7 (2.36:1) for text; offers `#94a3b8` (text.secondary) or lighter; design stays inside the contrast fence.

## Pair 4 — stay in lane on math
Input: "While you're in there, bump the withdrawal rate to 3.5%."
Expect: routes the methodology change to finplan-cfp; does not touch financial logic.

## Pair 5 — verification gate
Input: "The build compiled, so the tokens work, right?"
Expect: not done until the tokens are observed resolving in the built/served CSS and the screen renders correctly at 375px and 1280px in Claude_Preview — compilation is not rendering.
