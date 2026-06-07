# Spec: dead-token layer — migrate palette to a Tailwind v4 @theme block
# Owner: finplan-designer → finplan-engineer | Created: 2026-06-07 | Status: **shipped 2026-06-07** (closes errors.md row 4; audit dead-token-layer_v1.md 8.6/10)

## Problem
Closes `errors.md` row 4 (Pattern 3 — canonical drift). The app references two custom token vocabularies and **neither resolves to any CSS** under Tailwind v4:
- The `*-shiny-*` utilities (149 references across 13 files) exist in neither `tailwind.config.mjs` nor `global.css`.
- The JS-config namespace (`text-text-primary`, `bg-background-paper`, `bg-accent-primary`, …) is defined in `tailwind.config.mjs`, but Tailwind v4 with `@tailwindcss/vite` does not auto-load the JS config (no `@theme` block, no `@config` directive).

Verified empirically: a production build's `dist/_astro/*.css` contains **zero** `shiny` rules and **zero** `.text-text-primary` / `.bg-background-paper` / `.bg-accent-primary` rules. `#94a3b8` (the AA-safe secondary) never renders. The entire custom palette is dead; the look is carried by `.fintech-*` classes, inline `style`, and built-in utilities. Several `variant` props resolve to dead classes (or are never read), so they silently do nothing.

## The change
1. **Add an `@theme` block to `src/styles/global.css`** implementing canonical §6 exactly (this is the v4 way; it merges with — does not replace — the default palette, so `slate-*`, `white`, `blue-*` still work):
   ```css
   @theme {
     --color-background: #0f172a;
     --color-background-paper: #1e293b;
     --color-background-subtle: #334155;
     --color-text-primary: #f8fafc;
     --color-text-secondary: #94a3b8;
     --color-text-muted: #64748b;     /* large/decorative only — see §7 */
     --color-accent-primary: #3b82f6;
     --color-accent-success: #10b981;
     --color-accent-warning: #f59e0b;
     --color-accent-danger: #ef4444;
     --font-sans: "Inter", system-ui, sans-serif;
     --shadow-card: 0 8px 32px 0 rgb(0 0 0 / 0.3);
   }
   ```
   This immediately lights up the namespaced classes already in `MoneyInput`/`RangeSlider`/`NavigationTabs`.
2. **Replace every `*-shiny-*` reference** (all 13 files) with the real token utility, by role:

   | Dead class | Replacement | Canonical role |
   |---|---|---|
   | `text-shiny-text` | `text-text-primary` | text.primary |
   | `text-shiny-muted` | `text-text-secondary` | text.secondary (secondary body text by role; **not** text.muted, which §6 reserves for large/decorative) |
   | `bg-shiny-surface` | `bg-background-paper` | background.paper |
   | `bg-shiny-border` / `bg-shiny-neutral` | `bg-background-subtle` | background.subtle |
   | `border-shiny-border` | `border-background-subtle` | background.subtle |
   | `bg-shiny-primary` / `bg-shiny-info` | `bg-accent-primary` | accent.primary (no separate "info" in §6) |
   | `bg-shiny-success` | `bg-accent-success` | accent.success |
   | `bg-shiny-warning` | `bg-accent-warning` | accent.warning |
   | `border-t-shiny-primary` / `border-t-shiny-info` | `border-t-accent-primary` | accent.primary |
   | `border-t-shiny-success` | `border-t-accent-success` | accent.success |
   | `border-t-shiny-warning` | `border-t-accent-warning` | accent.warning |
   | `shadow-shiny-card` / `shadow-shiny-hover` | `shadow-card` | §6 card shadow |
   | `shadow-shiny-lg` / `shadow-shiny-xl` | `shadow-lg` / `shadow-xl` | built-in |

   Also fix the stray dead `bg-surface-light` (orphan `NavigationButton`) → `bg-background-subtle`.
3. **Resolve ignored `variant` props:**
   - `Card.tsx` — `variant` maps to dead `border-t-shiny-*`; the swap above makes it real (`border-t-accent-*`). No further change.
   - `GradientBtn` / `GradientText` / `NavigationButton` (orphans) — `variant`/`gradient` maps to dead `bg-shiny-*`; the swap makes them real. De-shiny only; do not delete (orphan cleanup is Wave 2).
   - `FintechCard.tsx` / `MetricCard.tsx` — accept `variant` but **never read it** (35 call sites pass `variant="info|primary|success|warning"`). Wire it to a colored top-border accent, applied only when `variant` is set (undefined → no accent border, preserving the plain cards in `Welcome`):
     `primary→border-t-accent-primary`, `success→border-t-accent-success`, `warning→border-t-accent-warning`, `info→border-t-accent-primary`.
4. **Delete `tailwind.config.mjs`** — fully superseded by the `@theme` block and not loaded by v4. Keeping it is the canonical-drift trap row 4 names.

## Canonical references
- §6 (design tokens) — every `@theme` value traces here; no new token introduced.
- §7 (contrast) — the `text-shiny-muted → text-text-secondary` choice keeps secondary body text on the AA-safe side. (Full §7 sweep is the a11y loop, rows 5–6.)

## Sources & Assumptions
- Source: Tailwind CSS v4 `@theme` directive (official docs) — v4 derives the theme from CSS `@theme`, not the JS config, when using `@tailwindcss/vite`. Confidence: high (verified against the built CSS).
- Assumption: lighting up the namespaced classes is a visual **improvement** (the intended design finally renders: dimmer secondary text, tinted active tab, real card backgrounds). Must be confirmed in Claude_Preview at 375px and 1280px — a token that renders a broken screen is not done.
- Assumption (handed to the a11y loop, not claimed here): with tokens now live, `text-text-muted` on body text in `MoneyInput`/`RangeSlider` now resolves to the failing `#64748b`. That is errors.md row 5's scope — Loop 1 does not claim it.

## Acceptance criteria (what QA tests)
- [ ] `grep -rn "shiny" src/` returns **zero**.
- [ ] The built CSS contains the real token rules (e.g., `.text-text-secondary{color:#94a3b8}`, `.bg-accent-primary`, `.shadow-card`) — verified, not assumed.
- [ ] No accepted `variant`/`gradient` prop resolves to nothing: `FintechCard`/`MetricCard` render an accent border when `variant` is set.
- [ ] `tailwind.config.mjs` is deleted and the build still passes (`npm run build`).
- [ ] All 8 existing store tests still pass; a new guard test asserts zero `*-shiny-*` in `src/` and an `@theme` block in `global.css`.
- [ ] Screen renders correctly in Claude_Preview at 375px and 1280px (evidence captured).

## Out of scope
- Contrast/label/ARIA/keyboard remediation — that is the a11y loop (rows 5, 6).
- Orphan/dead-code deletion of `GradientBtn`/`GradientText`/`NavigationButton`/duplicate `CompoundCalculator`+`Resources` — Wave 2.
- Card-system consolidation beyond wiring the variant — Wave 2 / a later designer pass.
- `prefers-reduced-motion` — handled in the a11y loop.
