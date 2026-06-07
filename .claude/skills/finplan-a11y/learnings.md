# Learnings — finplan-a11y
# Append-only, date-stamped. Propose 1–3 lines after any failure or edge case; human approves; roll stable patterns into SKILL.md.

- 2026-06-07 — The contrast failures hide in three places, not one: Tailwind classes, inline `style={{ color }}`, AND Recharts `fill`/`tick`/`label` props. A grep for `#475569`/`#64748b` across `src/` finds the inline and chart cases the class audit misses. Recharts axis labels are text and must clear §7 like any other.
- 2026-06-07 — The app's left sidebar and mobile bottom bar both switch the same view. Treat each as its own APG tablist (distinct `aria-label`, its own roving tabindex) controlling the single shared tabpanel; they are mutually exclusive by viewport, so only one is operable at a time.
