# Failure Modes — finplan-a11y
# How the accessibility work itself fails, and the corrective baked into the skill.

| # | Failure mode | What it looks like | Corrective (enforced in SKILL.md) |
|---|---|---|---|
| F1 | Eyeballed contrast | "Looks readable to me," so a failing pair ships. | Contrast is computed. Cite the canonical §7 ratio or compute it with `preview_eval`; never judge by eye. |
| F2 | Lint mistaken for done | jsx-a11y passes, so the screen is declared accessible — but it traps focus or has no visible ring. | The linter is necessary, not sufficient. Keyboard, focus, and computed contrast are observed in Claude_Preview. |
| F3 | ARIA theater | Roles and `aria-*` are added to a `div`, but the widget still does not behave (no roving tabindex, wrong state). | Follow the APG pattern's behavior, not just its attributes. Prefer a native element that carries the semantics for free. |
| F4 | Color-only signal persists | A red number is "fixed" by darkening it, but meaning still rides on color alone. | Add a redundant text/icon cue (1.4.1). Color is never the only carrier of status. |
| F5 | Scope bleed into the claim | Fixing the color-alone signal turns into rewording the financial message. | Add the cue; route any change to the financial claim's wording to CFP/Content. Keep glossary framing. |
| F6 | Inline + chart colors missed | The class-level audit passes, but inline `style` and Recharts `fill` still carry failing colors. | Grep `#475569`/`#64748b` across `src/`; treat chart `fill`/`tick`/`label` as text. |

*v1.0 | 2026-06-07 | Re-anchor quarterly against evals/io_pairs.md.*
