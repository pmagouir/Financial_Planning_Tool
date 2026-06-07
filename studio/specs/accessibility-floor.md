# Spec: accessibility floor — WCAG 2.2 AA across the live screens
# Owner: finplan-a11y (impl) ← finplan-designer (safe palette) | Created: 2026-06-07 | Status: **shipped 2026-06-07** (closes errors.md rows 5, 6, 10; audit accessibility-floor_v1.md 8.7/10)

## Problem
Closes `errors.md` rows 5, 6, and 10 (Pattern 4 — accessibility is measured, not judged). a11y is the tool's worst dimension (2/10) and a trust issue — the cold audit found the honesty disclaimer itself fails contrast. With the row-4 token layer now live, the failing colors actually render.
- **Row 5 (contrast):** `#475569` (2.36:1, fails all) and `#64748b` (3.07–3.75:1, fails AA body) carry text in ~26 inline `style`/Recharts spots across live screens, plus 13 `text-text-muted` (#64748b) body-text class usages, plus the input placeholder.
- **Row 6 (labels / ARIA / keyboard / focus):** `MoneyInput` and `RangeSlider` render `<label>` with no `htmlFor`/`id`; zero `aria-*`; `NavigationTabs` is a set of `<button>`s, not a tablist — no roles, no `aria-selected`, no roving tabindex, no keyboard arrow nav, no focus management, no tabpanel.
- **Row 10 (reduced motion):** content visibility and navigation depend on Framer Motion animations completing; no `prefers-reduced-motion` fallback.

## The change
1. **Contrast (row 5) — every failing text pair to the §7-safe `#94a3b8` (text.secondary):**
   - Swap inline `color/fill/tick` `#475569` → `#94a3b8` and `#64748b` → `#94a3b8` across live files (`Welcome`, `Step2`, `Step3` (`calculator/`), `Step4`, `Step5`, `NavigationTabs`). Meaningful status colors (`#f59e0b` amber, `#10b981` green, `#3b82f6` blue, `#ef4444` red) are untouched — they already pass and already carry text labels (not color-alone).
   - Swap the `text-text-muted` class → `text-text-secondary` on the 13 small-text usages (`Step1`, `Step3`, `Step5`, `MoneyInput`, `RangeSlider`). `text.muted` stays defined for genuine large/decorative use only.
   - `global.css`: input placeholder `#64748b` → `#94a3b8`.
2. **Labels (row 6):** `MoneyInput` + `RangeSlider` — generate ids with `useId()`; `<label htmlFor={id}>` + `id` on the control; helper text linked by `aria-describedby`. The `$` prefix is `aria-hidden`. `RangeSlider` adds `aria-valuetext` for the formatted value (e.g., "$1,200", "7%").
3. **ARIA + keyboard + focus (row 6) — `NavigationTabs` to the WAI-ARIA APG Tabs pattern:**
   - Both the desktop sidebar and the mobile bottom bar become `role="tablist"` (`aria-label="Planning steps"`, vertical/horizontal `aria-orientation`); each button `role="tab"`, `id="tab-{id}"`, `aria-selected`, `aria-controls="tabpanel-main"`, roving `tabIndex` (active = 0, others = −1). The divider is `role="presentation"`.
   - The content area is `role="tabpanel"`, `id="tabpanel-main"`, `aria-labelledby="tab-{activeTab}"`, `tabIndex={0}`.
   - Keyboard: ArrowUp/Down (sidebar) and ArrowLeft/Right (mobile) move with wrap, Home/End jump; automatic activation — selection follows focus and focus moves to the newly selected tab (focus management).
   - Completion dots get `role="img"` + an accessible name; status is presence + label, not color alone.
4. **Reduced motion (row 10):** `NavigationTabs` reads `useReducedMotion()`; when reduced, the step `motion.div` uses `initial={false}`, an instant `exit`, and `duration: 0` so content never depends on an animation frame and `AnimatePresence mode="wait"` cannot stall. `global.css` adds a `@media (prefers-reduced-motion: reduce)` reset for CSS transitions/animations.
5. **Gate:** add `eslint.config.js` (flat, ESLint 10) with `eslint-plugin-jsx-a11y` recommended + React rules; `npm run lint` passes.

## Canonical references
- §7 (contrast, LOCKED, WCAG 2.2): `#94a3b8` = 6.96:1 (bg) / 5.71:1 (cards), passes AA both. `#64748b` body and `#475569` text are the banned cases this closes.
- §6 (tokens): `text.secondary` `#94a3b8`; `text.muted` `#64748b` reserved for large/decorative only; "respect prefers-reduced-motion."
- glossary: status never by color alone.

## Sources & Assumptions
- Source: W3C WCAG 2.2 — 1.4.3 (contrast), 1.3.1 (info & relationships), 4.1.2 (name/role/value), 2.1.1 (keyboard), 2.4.3 (focus order), 2.4.7 (focus visible), 1.4.1 (use of color), 2.3.3 (animation). WAI-ARIA APG — Tabs and Slider patterns. Confidence: high (normative).
- Assumption: collapsing `text.muted` → `text.secondary` for the current small-text usages is correct because none are large enough for `#64748b` to pass; no hierarchy tier is lost that AA would have allowed.

## Acceptance criteria (what QA tests)
- [ ] No live component carries text in `#475569` or body text in `#64748b` (static guard over live files) — and the computed color of a former-offender resolves to `rgb(148,163,184)` in Claude_Preview.
- [ ] `MoneyInput`/`RangeSlider`: a label is programmatically associated with the control (guard: `useId` + `htmlFor`/`id`; behavioral: accessible name present).
- [ ] `NavigationTabs`: `role="tablist"`/`tab`/`tabpanel`, `aria-selected` tracks the active tab, roving tabindex, and Arrow/Home/End move + activate (observed in Claude_Preview via dispatched keys).
- [ ] `prefers-reduced-motion` path renders content immediately (no animation dependence) — closes row 10.
- [ ] `npm run lint` (jsx-a11y) passes; `npm run build` passes; all prior tests stay green; new a11y guard tests added.

## Out of scope
- Orphan components (`tools/`, `calculator/CompoundInterest`, `calculator/Resources`, `pages/Resources`, `ui/Gradient*`, `ui/NavigationButton`) — Wave 2 deletion; not in the live tree.
- White-on-accent button contrast (large/bold, passes) and full per-screen auditor pass — Wave 3.
- Reworking any financial claim's wording — CFP/Content own copy; this loop only adds non-color cues.
