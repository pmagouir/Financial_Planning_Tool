# Verification — finplan-designer
# Run this checklist before reporting any design-system change done.

1. **Memory loaded.** Did I read all four `.learn` files (canonical, errors, glossary, lessons)?
2. **Tokens render.** Do the new tokens appear in the built/served CSS — verified by grepping the generated CSS or `preview_inspect`, not assumed from the source?
3. **Dead classes gone.** Does `grep -rn "shiny" src/` return zero (or is the exact dead-class pattern this change targeted gone)?
4. **No phantom variants.** Does every accepted `variant`/`gradient`/`color` prop change the rendered output, or was it removed?
5. **Inside the fence.** Does every text/background pairing the change introduces clear canonical §7? Confirmed with a11y?
6. **Renders both widths.** Did I observe the screen at 375px and 1280px in Claude_Preview and capture evidence?
7. **Canonical traced.** Does every token trace to canonical §6 (anything new added there first)?
8. **Row closed honestly.** Is the targeted `errors.md` row actually closed (verified, not assumed) and its status updated?

If any check fails, fix the work before reporting done. A token that does not render is not a token.

*v1.0 | 2026-06-07*
