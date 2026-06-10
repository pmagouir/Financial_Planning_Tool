# Spec: Visual cohesion & finish ("designed by one hand")
# Owner: finplan-designer | Created: 2026-06-09 | Status: shipped

## Problem
"Make it hum" → the user chose **visual cohesion & finish**. The app worked but read as assembled by
several hands:
- **Three card primitives**: `Card.tsx` (an off-theme *white* card, fully orphaned — nobody imports it),
  and `FintechCard`/`MetricCard` which are **byte-identical** duplicates. Violates the designer
  standard "one card, not three."
- **The Next-Step CTA is copy-pasted 4×** (Steps 1–4) and the other primary buttons drift: different
  padding (`px-6 py-3` vs `px-4 py-2` vs `px-5 py-2.5`), different hover (`hover:bg-accent-primary/90`
  vs `hover:opacity-90`), some with `shadow-card`, some without.
- **Focus rings barely exist**: only `RangeSlider` has one. Buttons, nav tabs, links, and the new
  mobile More-menu had no consistent keyboard focus indicator (a polish gap *and* a WCAG 2.4.11 gap).
- **Step 3's empty state was a bare `<p>`** while Step 5's was a polished centered prompt — inconsistent.

## The change
- **One card.** Deleted orphan `ui/Card.tsx`. `ui/MetricCard.tsx` is now a one-line alias —
  `export { FintechCard as MetricCard }` — so there is a single implementation that can't drift, and
  Step 5's imports keep working untouched.
- **One button.** New `ui/Button.tsx` (`variant: 'primary' | 'ghost'`) with one treatment: `rounded-lg`,
  hover-darken, `active:scale-[0.97]` press, consistent padding/shadow. Applied to all four Next-Step
  CTAs (primary, with a 2px arrow-nudge on hover) and Step 5's Print (ghost — it's a secondary utility)
  + the empty-state Start (primary). Focus is delegated to the global ring (below), not baked in, so
  there's no double-ring.
- **One focus ring.** A single `:focus-visible { outline: 2px solid #3b82f6; outline-offset: 2px }`
  in `global.css @layer base` gives every button, link, tab, and menu item one accent indicator. Form
  fields are excluded (`input/textarea/select:focus-visible { outline:none }`) — they keep their own
  border-based affordance (`.fintech-input`, RangeSlider ring), so nothing is double-treated.
- **Cohesive empty state.** Step 3's bare prompt now matches Step 5's pattern (centered heading + body
  + a `Button` CTA wired to `onEditPlan → setActiveTab('step1')`). Uses the glossary phrase "your number."

## Canonical references
- §6 tokens only — `accent.primary #3b82f6`, `background.paper`, `text.secondary`, the `border-t-accent-*`
  variant borders. No new token. The focus ring reuses `accent.primary`.
- §7 contrast — the `#3b82f6` focus outline is 4.85:1 on the `#0f172a` background, clearing the 3:1
  floor for non-text focus indicators (WCAG 2.4.11 / 1.4.11). No banned color introduced.

## Sources & Assumptions
- Source: designer charter standard #5 ("one card, not three"); WCAG 2.4.11 (focus appearance),
  WAI-ARIA APG (button/menu). Confidence: high (standard patterns, no methodology change).
- Assumption: Print is a *secondary* action on the summary (the content is the deliverable), so it
  reads as a quiet `ghost` button; the in-flow CTAs stay solid `primary`.
- Assumption: the arrow-nudge counts as "finish," not new motion — it's a 2px transform on hover,
  neutralized by the existing `prefers-reduced-motion` reset.

## Acceptance criteria (verified)
- [x] `npm run lint` clean (`--max-warnings 0`).
- [x] `npm test` 45/45 — the row-4 guard now asserts the single card: FintechCard holds the variant
      logic, MetricCard aliases it, and `Card.tsx` is gone.
- [x] `npm run build` green.
- [x] No financial logic, formula, reference value, or token *value* changed.
- [~] Live screenshot of the Button / focus ring / Step-3 empty state — gated behind the same headless
      `AnimatePresence`+rAF navigation stall (errors.md row 10/30); correctness established by build +
      tests. Renders in a real browser / `npm run dev`.

## Out of scope
- The other "hum" tracks the user did NOT pick (snappy `mode="wait"` removal, alive number
  re-counts, the "Your Number" reveal moment) — separate, on request.
- Wholesale radius-scale normalization across every inline panel — diffuse, low payoff; only the
  elements touched in this pass were kept consistent (`rounded-lg` buttons, `rounded-xl`/card panels).
- Converting Welcome's bespoke hero "Get Started" button to the primitive — left as a deliberate
  hero treatment; it still receives the unified focus ring.
