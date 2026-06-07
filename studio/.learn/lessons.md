# Lessons — Financial Planning Tool Studio
# Durable, narrative lessons behind the five error patterns. The "why" the gates exist.
# Read at session start alongside errors.md.

---

## Pattern 1 — One quantity, one engine

A financial quantity computed in two places will eventually disagree. This app proves it: the projected portfolio is calculated three ways (annual-add in `financialPlan.ts:154`, intra-year monthly in `:240`, and again inside Step 4), and the three give different answers for the same inputs. A user who sees $1.54M on the summary and a different median on the cone loses trust in both numbers, and they are right to.

The discipline: every derived value lives once, in `financialPlan.ts`, and every screen reads it. Components render store values; they do not recompute them. When you find yourself writing a calculation inside a component, stop — it belongs in the store. This is also why `canonical.md` exists: it is the spec the single engine implements, and the reference values QA locks it to.

## Pattern 2 — Never claim more rigor than the math delivers

The fastest way to destroy a financial tool's credibility is to dress a simple calculation in the language of a sophisticated one. The "Probability Cone" is the case study: three deterministic lines wearing the name of a Monte Carlo simulation. The fix is not to hide the simplicity. The fix is to label honestly ("expected path," "cautious path") and to build the real thing when it earns the name.

The same rule covers the flat-CPI treatment of Social Security: inflating all passive income at full CPI is a simplification that happens to be optimistic, so presenting it without a caveat reads as conservative when it is not. State assumptions in plain language. Mark every projection an estimate. A first-timer should never be misled about how much certainty stands behind a number.

## Pattern 3 — If it is not in canonical, it does not ship

Numbers and tokens drift when there is no single source of truth. The `*-shiny-*` Tailwind classes are the visual version of this: utilities referenced across components that exist nowhere, silently doing nothing because the v4 theme layer was never wired. `canonical.md` is the cure for both the financial and the visual drift. Before using a formula, a reference value, or a color, confirm it is in canonical. If it is not, add it there first with a source, then use it. The code conforms to canonical, never the reverse.

## Pattern 4 — Accessibility is measured, not judged

Contrast is a calculation, not an aesthetic opinion. `#64748b` body text fails WCAG AA at 3.07–3.75:1; `#475569` text fails everything at 2.36:1. These are not debatable — they come from the luminance formula, and they are locked in canonical §7. The same precision applies to label association, focus order, and ARIA roles: WCAG 2.2 and the WAI-ARIA APG say exactly what is required. The tool already ships with `eslint-plugin-jsx-a11y` installed and almost entirely switched off. Turning it on, associating every label, and never signaling status by color alone is the floor, not the ceiling. Accessibility is part of "beautiful," not a tax on it.

## Pattern 5 — Never lose or silently overwrite what the user gave you

Two foot-guns sit in the current build. The app uses a plain `map`, so a refresh erases everything the user entered — in a tool whose stated philosophy is reducing abandonment, that is the worst possible default, and the fix is one import away. And the smart-defaults subscriber force-syncs `monthlyContrib` to the Step 1 investment sum whenever it is positive, which can silently overwrite a contribution the user hand-entered in Step 4. Smart defaults help only until they override intent. Persist progress. Seed defaults, then let user input win.

---

*Lessons v1.0 | 2026-06-06 | Consumed by: all finplan-* skills*
