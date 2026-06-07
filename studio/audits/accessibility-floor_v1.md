# Audit: accessibility-floor v1
# Auditor: finplan-auditor | Date: 2026-06-07

## Verdict
**Ship (rows 5, 6, 10 closed).** Contrast now clears canonical §7 everywhere (0 elements compute the banned colors on the live screens; `#94a3b8` renders at the verified 6.96:1); inputs are programmatically labeled; `NavigationTabs` implements the APG Tabs pattern with working keyboard nav, roving tabindex, and focus management; the reduced-motion path renders content immediately. The jsx-a11y gate is on and green (0 errors). One real gap surfaced **during** live observation — Step 2's sliders had no accessible name (the linter did not catch it) — and was fixed and re-verified within the loop. a11y moves from the floor (2/10) toward the bar.
**Composite: 8.7/10.**

## errors.md regression scan (total — every row stated)
- Row 1 (false-rigor cone labeling): **clean.** Step 4 touched for color only; no label/copy changed.
- Row 2 (multi-engine divergence): **clean.** No engine/calc code touched; 22/22 tests green.
- Row 3 (persistence): **clean.** Untouched; `$5,000` observed surviving across navigation earlier.
- Row 4 (dead tokens): **clean.** Tokens consumed, not regressed; `text.secondary` (#94a3b8) renders.
- Row 5 (contrast): **CLOSED — this loop.** Inline `#475569`/`#64748b` text swapped to `#94a3b8` across Welcome/Step2/Step3/Step4/Step5/NavigationTabs; `text-text-muted` body usages → `text-text-secondary`; placeholder → `#94a3b8`. Live scan: **0** elements compute the banned colors on Step 1 and Step 2; `.text-text-secondary` computes `rgb(148,163,184)`. Guarded by `src/accessibility.test.ts`.
- Row 6 (labels/ARIA/keyboard/focus): **CLOSED — this loop.** `MoneyInput`/`RangeSlider` associate labels via `useId()` (`htmlFor`/`id` + `aria-describedby`) — verified: the take-home input resolves an accessible name "Monthly Take-Home Income". `NavigationTabs` is now an APG tablist (2 tablists, 14 tabs, a `tabpanel`, `aria-selected`, roving tabindex) — verified live: ArrowDown moved welcome→step1, End jumped to the last tab, Home returned, focus followed selection, the panel/header updated. Completion dots carry `role="img"`/`aria-label`. Step 2 slider names added (see Convergent finding). jsx-a11y on + green.
- Row 7 (`monthlyContrib` overwrite): **N/A.** Store untouched.
- Row 8 (dead `r==g` branch): **N/A — but surfaced.** The new lint gate flagged `financialPlan.ts:143` (`no-useless-assignment`) — this *is* row 8. Downgraded to `warn` (engine hygiene, the Engineer owns it); still **OPEN**.
- Row 9 (flat-CPI passive income): **N/A.** Methodology/labeling untouched.
- Row 10 (reduced motion): **CLOSED — this loop.** `useReducedMotion()` gates the step `motion.div` (`initial={false}`, instant exit, `duration:0`); `global.css` adds a `prefers-reduced-motion` reset. Verified by temporarily forcing the reduced path: content rendered at `opacity:1` immediately and navigation stopped stalling. Reverted after verification.

## Lens 1 — Nervous First-Timer ("Would someone who's never planned understand and trust this?")
### Improvement
- Secondary text is now legibly dim rather than failing or washed-out; the disclaimer-contrast trust issue the cold audit raised is resolved (no body text below AA on the live screens).
- Keyboard-only and screen-reader users can now operate the whole flow: every step is a named tab, every input has a name, the slider announces "$1,200" rather than "1200".

## Lens 2 — Skeptical CFP ("Is the math correct, defensible, and cited?")
### Critical
- None. No number, formula, or reference value touched; the 4 canonical §5 reference tests remain green.

## Lens 3 — Trust & Credibility ("Does any label claim more rigor or certainty than the math delivers?")
### Improvement
- Status is no longer color-alone: the Step 2 ± labels already carry text ("+20% vs today"), and completion dots now carry `role="img"`/`aria-label="Complete"`. No financial claim was reworded (CFP/Content own copy) — only non-color cues were added.

## Lens 4 — Regression-Across-Screens ("Same input → same number everywhere; did this break another view?")
### Critical
- **Convergent (Lens 1 + Lens 4) — found and fixed in-loop:** Step 2's 11 category sliders were rendered without a `label` prop, so they had **no accessible name** — jsx-a11y did **not** catch this (a native range with no label is not flagged by the recommended set). Caught only by live observation (`input.labels` empty). Fixed by adding `aria-label={`${category.label} — monthly spending in retirement`}`; re-verified all 11 now expose names ("Housing — …", "Transport — …"). Guard test added. Step 4 sliders already had `label` and were unaffected.
### Improvement
- Tokens/contrast changes are className/color-level and cannot move a number; Step 1 and Step 2 observed rendering correctly with the fixes; the financial reference tests are green.

## Recommended next actions
1. **Polish** — A real-browser pass (working rAF) over Step 3, Step 4, Step 5, and the bonus screens to retire the static-guard-only contrast coverage on those views and exercise reduced-motion under a real `prefers-reduced-motion: reduce` setting (the preview harness does not expose that media emulation; verified here via a forced code path + guard test + the global CSS rule).
2. **Recommended** — Hand row 8 (`financialPlan.ts:143` dead `r==g` branch, now lint-flagged) to the Engineer; it is `warn` only so it does not block the a11y gate.
3. **Polish** — Wave 2: delete the orphan components currently excluded from the lint gate, then drop the eslint `ignores` for them.

## Residual risk
- Live behavioral verification used a forced reduced-motion code path because the headless preview pauses `requestAnimationFrame` and exposes no `prefers-reduced-motion` emulation. Keyboard, ARIA, label association, and contrast were all observed live; the reduced-motion *render path* was observed via the forced flag (then reverted) plus the guard test and the CSS rule — not under a real OS reduced-motion setting.
- Contrast on Step 3/4/5/bonus rests on the comprehensive static guard (no banned hex in any live source) plus representative live scans on Steps 1–2; a per-screen live pass is the only thing that fully retires it.
- Screen-reader *announcement quality* (how a specific AT verbalizes the tab/slider) is not testable here; the roles/names/states are correct per the APG, which is the measurable floor.
