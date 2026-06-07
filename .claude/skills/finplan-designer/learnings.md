# Learnings — finplan-designer
# Append-only, date-stamped. Propose 1–3 lines after any failure or edge case; human approves; roll stable patterns into SKILL.md.

- 2026-06-07 — Tailwind v4 with `@tailwindcss/vite` does not load `tailwind.config.mjs` at all. Both the `*-shiny-*` classes AND the JS-config namespace classes (`text-text-primary`, `bg-accent-primary`, …) compiled to **zero** CSS rules — confirmed by grepping the built `dist/_astro/*.css`. The fix is an `@theme` block in `global.css`; the proof is the generated CSS, never the source. Always verify a token by grepping the built CSS, not by reading the class name in a component.
