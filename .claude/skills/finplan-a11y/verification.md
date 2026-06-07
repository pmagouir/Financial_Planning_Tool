# Verification — finplan-a11y
# Run this checklist before reporting any accessibility change done.

1. **Memory loaded.** Did I read all four `.learn` files (canonical, errors, glossary, lessons)?
2. **Contrast computed.** Does every text/background pair in scope clear canonical §7, confirmed by the locked ratio or a `preview_eval` computation — not by eye? (Inline `style` and Recharts `fill`/`tick` included.)
3. **Labels associated.** Does every input have a programmatically associated label (`htmlFor`/`id`), with helper text linked via `aria-describedby`?
4. **ARIA matches the APG.** Is each widget the documented pattern, verified by role AND behavior (state, roving tabindex), not just attribute presence?
5. **Keyboard + focus.** Is the screen fully keyboard-operable with a visible focus ring, focus managed on view change — observed in Claude_Preview, not inferred from markup?
6. **No color-alone status.** Does every success/warning/danger signal carry a text or icon cue too?
7. **Gate on.** Is `eslint-plugin-jsx-a11y` enabled and `npm run lint` passing (or each remaining finding logged with a reason)?
8. **Row closed honestly.** Are the targeted `errors.md` rows actually closed (verified, not assumed), status updated, guard named?

If any check fails, fix the work before reporting done. An accessibility claim not observed in a browser is unverified.

*v1.0 | 2026-06-07*
