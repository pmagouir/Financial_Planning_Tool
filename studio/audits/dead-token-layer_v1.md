# Audit: dead-token-layer v1
# Auditor: finplan-auditor | Date: 2026-06-07

## Verdict
**Ship (row 4 closed) — proceed to the a11y loop.** The migration makes both dead vocabularies real, removes all 149 `*-shiny-*` references, deletes the misleading JS config, and turns the previously-ignored `variant` props functional. No closed row regressed; persistence (row 3) was observed still working. Two honest caveats, neither blocking: (1) live per-screen rendering of Steps 2–5 could not be observed because `requestAnimationFrame` is paused in this headless preview (0 frames/500ms), so those screens are verified by built-CSS resolution + mechanical uniformity, tagged `[NEEDS-LIVE-rAF]`; (2) lighting up the tokens makes row-5 failing colors (`#64748b` body, `#475569`) *render* where they were previously masked by inheritance — expected, and owned by the a11y loop.
**Composite: 8.6/10** (for the scoped change).

## errors.md regression scan (total — every row stated)
- Row 1 (false-rigor cone labeling): **clean.** `Step4_InvestmentPath.tsx` was de-shiny'd (class names only); no label/copy text changed. "Scenario Range" framing intact. `[NEEDS-LIVE-rAF]` for the on-screen confirmation.
- Row 2 (multi-engine divergence): **clean.** No calculation or store code touched. 13/13 tests green including the row-2 cross-screen equality test.
- Row 3 (persistence): **clean — observed working.** The `$5,000` take-home value rendered after navigation, sourced from `persistentMap`. Not regressed.
- Row 4 (dead-token layer): **CLOSED — this change.** `grep -rn "shiny" src/` = 0; built CSS contains `.text-text-secondary{…#94a3b8}`, `.bg-accent-primary`, `.shadow-card`, etc.; `tailwind.config.mjs` deleted; build green; guard test added.
- Row 5 (contrast): **OPEN — TRIGGERED (surfaced, not caused).** With tokens live, `text-text-muted` (#64748b) on body text in `MoneyInput`/`RangeSlider` and inline `#475569` (mobile nav labels, observed dim at 375px) now render the failing colors. This is the a11y loop's scope; the migration deliberately mapped `text-shiny-muted → text-text-secondary` (AA-safe) to avoid worsening the bulk of body text.
- Row 6 (labels/ARIA/focus): **OPEN — untouched.** No label association or ARIA added in this loop (a11y loop). Note: the rAF-paused finding below intersects row 6's focus-management concern.
- Row 7 (`monthlyContrib` auto-overwrite): **N/A.** Store untouched.
- Row 8 (dead `r == g` branch): **N/A.** Store untouched. Still open.
- Row 9 (flat-CPI passive income): **N/A.** Labeling/methodology untouched. Still open.
- (Row 10 — Step 5 zero-target bug noted in SWEEP-PLAN: not yet logged in errors.md; out of scope here.)

## Lens 1 — Nervous First-Timer ("Would someone who's never planned understand and trust this?")
### Critical
- None in scope.
### Improvement
- The intended visual hierarchy now renders for the first time: dim-but-readable secondary text (`#94a3b8`), accent top-borders distinguishing card types, colored status dots on the three buckets. A first-timer now perceives structure that was previously flat. Net trust improvement.
- **Surfaced (pre-existing, not caused):** with rAF paused, the content area renders blank until interaction, and view changes stall (`AnimatePresence mode="wait"` waits on a frozen exit). A real browser runs rAF so this resolves in production, but it means content/visibility depends entirely on JS animation completing — fragile for background tabs, low-power mode, and reduced-motion users. Recommend a `prefers-reduced-motion` / reduced-motion fallback in the a11y loop.

## Lens 2 — Skeptical CFP ("Is the math correct, defensible, and cited?")
### Critical
- None. No number, formula, or reference value was touched. The four canonical §5 reference-value tests remain green.

## Lens 3 — Trust & Credibility ("Does any label claim more rigor or certainty than the math delivers?")
### Critical
- None. No user-facing financial label changed. The glossary-compliant "Scenario Range" / "estimate" framing is intact; the migration was className-only.

## Lens 4 — Regression-Across-Screens ("Same input → same number everywhere; did this break another view?")
### Critical
- None observed.
### Improvement
- Tokens lit up app-wide. Observed correct live: Welcome (blue gradient hero, styled CTA), Step 1 (cards, three-bucket colors, monospace numbers, **`FintechCard variant="info"` computing a 2px `rgb(59,130,246)` top border** — the ignored-variant fix), mobile 375px (sidebar hidden, bottom nav with active-tab accent + completion dots).
- `[NEEDS-LIVE-rAF]`: Steps 2, 3, 4, 5 not observed rendering live (preview rAF paused). Confidence remains high — the de-shiny was a uniform mechanical class swap, every replacement token resolves in the built CSS, and the two observed screens use the identical token set. A real-browser pass on Steps 2–5 should run before the wave closes.

## Recommended next actions
1. **Recommended** — Proceed to the a11y loop (rows 5, 6). It must clear the `#64748b`/`#475569` text now rendering, and should add a `prefers-reduced-motion` fallback so content does not depend on rAF completing (intersects Lens 1 + row 6 focus management). *Convergent (Lens 1 + Lens 4 both surfaced the rAF/animation fragility.)*
2. **Polish** — Run a real-browser pass (working rAF) over Steps 2–5 to retire the `[NEEDS-LIVE-rAF]` tags on those screens.
3. **Polish** — Wave 2: delete the now-de-shiny'd orphans (`GradientBtn`, `GradientText`, `NavigationButton`) and consolidate the card primitives; the variant wiring is correct but `Card`/`FintechCard`/`MetricCard` still triplicate.

## Residual risk
- This audit could not observe Steps 2–5 rendering live because the headless preview pauses `requestAnimationFrame`. The token correctness for those screens rests on built-CSS resolution + the mechanical uniformity of the swap, not direct observation. A real-browser pass is the only thing that fully retires that risk.
- The migration is className-level; it cannot, by construction, change a number or a financial claim — so the financial-credibility lenses are low-risk here. The risk is purely visual/contrast, which the a11y loop now owns.
