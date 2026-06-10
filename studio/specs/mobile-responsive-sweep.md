# Spec: Mobile responsive sweep (375px floor)
# Owner: finplan-designer | Created: 2026-06-09 | Status: in-progress → shipped

## Problem
The app was built desktop-first. The shell does the hard part (NavigationTabs swaps the sidebar
for a bottom nav ≤639px via a hand-rolled `<style>` block), but the screens break or waste space at
the 375px floor (UI/UX charter: "375px mobile minimum"). Concretely, at 375px:

1. **Step 1 budget breakdown** — `grid grid-cols-3` packs three `text-2xl` mono figures into ~77px
   columns, so the numbers overlap ("$1,700" collides with its neighbours). Reproduced in-preview.
2. **Step 3 hero trio** — `display:inline-flex` with three `minWidth:140px` cells = 420px inside an
   `overflow:hidden` hero (~263px usable), so the 3rd stat ("Years to grow") is clipped.
3. **Bonus pages unreachable** — `mobileNavTabs` filters out `isBonus`, and there was no other path,
   so Compound Calc / Resources / Methodology had **no way to be opened on a phone**.
4. **Floating Budget HUD** — `BudgetRibbon` is `fixed bottom-8 left-8`; on mobile it floats over
   content and collides with the 64px bottom nav.
5. **Wasted width** — `.main-content-area` kept `p-8` (32px) on mobile and `FintechCard`/`MetricCard`
   added `p-6` (24px), squeezing card content to ~263px on a 375px screen.
6. **Sidebar-referencing copy** — Welcome said "select a step in the sidebar"; there is no sidebar on
   mobile. The Welcome stats strip crushed four columns into ~78px each (labels wrapped 3–4 lines).
7. **Step 2 slider rows** — label + a 3-item meta cluster in one non-wrapping `justify-between` row.

No `errors.md` row covered responsive/mobile layout — this is the "Mobile-optimized layout pass"
roadmap item. New row 30 added.

## The change
Files touched (responsive/markup only — no financial logic, no token values changed):

- **`NavigationTabs.tsx`** — (a) mobile `<style>` block: `.main-content-area` → `padding: 20px 16px 88px`
  (was `p-8`; the 88px clears the 64px bottom nav). (b) Header title bar becomes a flex row with a
  **mobile-only (`sm:hidden`) "⋯ More" overflow menu** (`aria-haspopup`, `role="menu"`/`menuitem`,
  Escape-to-close on the button, tap-away backdrop) that opens the three bonus pages. The desktop
  sidebar already lists them. Title gets `truncate min-w-0`. The locked APG tablist markup (row 6)
  is untouched — the menu is additive.
- **`ui/FintechCard.tsx`, `ui/MetricCard.tsx`** — inner padding `p-6` → `p-4 sm:p-6` (16px mobile,
  24px desktop). `variant && variantBorder[variant]` logic unchanged (design-system.test row 4).
- **`Step1_CurrentReality.tsx`** — budget breakdown `grid-cols-3` → `grid-cols-1 md:grid-cols-3`
  (stacks below 768px, where 3-up otherwise under-fits even with the sidebar). `BudgetRibbon` outer
  div → `hidden sm:block` (its data is already in the static allocation card at the top).
- **`calculator/Step3_YourNumber.tsx`** — hero `padding: 64px 40px 56px` → `clamp()`d. Trio gets a
  scoped class `.ret-number-trio`: mobile-first **stacked column** (borderTop dividers), flips to the
  inline strip (borderRight dividers, `minWidth:140px`) only at `min-width: 860px` — the width where
  3-up reliably fits even with the 256px desktop sidebar eating space.
- **`Step2_RetirementDesign.tsx`** — slider meta rows: `flex` → `flex flex-wrap` (outer + inner
  cluster) with `gap-x/gap-y`, so the cluster wraps under the label instead of overflowing.
- **`Welcome.tsx`** — copy "select a step in the sidebar" → "jump straight to any step"; fallback
  "Select Step 1 in the sidebar" → "Select Step 1". Stats strip: 4-col flex → responsive grid
  (`.welcome-stats`: `repeat(2,1fr)` mobile / `repeat(4,1fr)` ≥640px) with nth-child dividers.
- **`Step4_InvestmentPath.tsx`** — action-panel `padding: 28px 32px` → `clamp()`d for small screens.

### Breakpoint strategy
- **640px (Tailwind `sm`)** is the shell's existing sidebar↔bottom-nav line; card padding and the More
  menu key off it.
- **768px (`md`)** for the Step 1 budget triptych — 3-up needs ≥~122px/col, available at 768px+.
- **860px (scoped)** for the Step 3 trio — the only width where the 420px strip fits inside the hero
  once the 256px sidebar is present. A pure `sm`/`md` breakpoint mis-fits in the 640–840px sidebar band.

## Canonical references
None changed. No token value, formula, or reference value is touched. All colors used in the new
markup are existing canonical §6 tokens / already-present rgba values; the new dividers reuse the
`rgba(255,255,255,0.06–0.08)` hairlines already in the strips. No banned §7 text color introduced
(accessibility.test rows 5, 18–19 still green).

## Sources & Assumptions
- Source: UI/UX charter (CLAUDE.md) — "375px mobile minimum, 1280px desktop"; WAI-ARIA APG
  Menu Button pattern for the overflow menu. Confidence: high (standard patterns).
- Assumption: the three bonus pages are *secondary* to the 5-step core flow, so on mobile they belong
  in a header overflow menu rather than the thumb-reachable bottom bar (which stays the 6-item core
  flow). The desktop sidebar continues to list everything.
- Assumption: hiding the floating Budget HUD on mobile loses nothing — the same figures render in the
  static allocation card at the top of Step 1.

## Acceptance criteria (what QA tests / what was verified)
- [x] `npm run lint` clean (`--max-warnings 0`).
- [x] `npm test` 44/44 (design-system + accessibility + financialPlan guards all green — no regression
      to the APG tablist, card-variant, or contrast locks).
- [x] `npm run build` succeeds; lazy chart-splitting (row 28) intact (CartesianChart still its own chunk).
- [x] Desktop 1280px: full sidebar (all 9 entries incl. bonus), More button hidden, stats 4-up, hero
      unregressed — captured.
- [x] Mobile 375px Welcome: stats 2×2, More button present, "jump straight to any step" copy, zero
      element overflow — captured.
- [~] Mobile 375px Step 1–5 inner panels: structurally verified (grid → 1col, 0 horizontal overflow on
      the screens that mounted) + via lint/test/build. Live per-screen screenshots were blocked by the
      headless preview's `AnimatePresence`+throttled-rAF swap stall (errors.md row 10's failure mode for
      active motion) — an environment artifact, not a code defect (zero console errors; the app hydrates
      and runs). Confirm on a real device / `npm run dev`.

## Out of scope
- The Step 5 "Retirement Income Sources" table stays a horizontal-scroll (`overflow-x-auto`) on mobile
  rather than a restructured card list — acceptable, low priority; a future content/UX pass owns it.
- Root-level legacy file cleanup, bundle analysis — Staff Eng, separate.
- Making the headless preview drive Framer animations reliably — QA/tooling, separate.
