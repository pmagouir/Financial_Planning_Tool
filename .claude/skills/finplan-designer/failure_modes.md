# Failure Modes — finplan-designer
# How the design work itself fails, and the corrective baked into the skill.

| # | Failure mode | What it looks like | Corrective (enforced in SKILL.md) |
|---|---|---|---|
| F1 | "It compiles, so it works" | The build passes and the source looks right, but the token compiled to no CSS rule and the screen falls back to inherited or default colors. | A token is real only when it appears in the built/served CSS. Verify by grepping the generated CSS or `preview_inspect`; never trust the source class name. |
| F2 | Pretty over legible | A color is chosen for how it looks against the mockup, but it fails canonical §7 against the real background. | Design inside the contrast fence. Confirm every text/background pairing against §7 with a11y before locking. |
| F3 | Phantom variant | A `variant`/`gradient` prop is accepted in the type but never changes the output (or maps to a dead class). | Every accepted variant changes the render or is removed. No prop resolves to nothing. |
| F4 | Token invented, not traced | A new color is added straight into a component, bypassing canonical §6. | Canonical first: add the token to §6 with its role and hex, then use it. The code conforms to canonical. |
| F5 | Scope creep in a migration | A token migration silently swallows an orphan/dead-code cleanup or a card consolidation that was not asked for. | Keep the change to its spec. Note the adjacent cleanup as a separate item; do not fold it in unless asked. |

*v1.0 | 2026-06-07 | Re-anchor quarterly against evals/io_pairs.md.*
