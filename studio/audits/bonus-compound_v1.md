# Audit: Bonus — Compound Interest Calculator v1
# Auditor: finplan-auditor | Date: 2026-06-08

## Verdict
**Revise.** This is a standalone "what if I invest $X" toy that does **not** feed the plan — it holds its own React state and never touches the store — so its math errors cannot corrupt a user's actual retirement number. Severity is weighed accordingly. But two issues keep it from shipping clean:

1. **Methodology divergence from the canonical engine, presented with zero caveat (Convergent, Lens 2 + Lens 4).** The bonus tool compounds at **nominal `rate/12`** (`CompoundCalculator.tsx:21`) and adds each contribution **before** that month's growth (`:42-47`), while the canonical single engine (`financialPlan.ts:119,128-131`, canonical §3) uses the **effective monthly rate** `m=(1+r)^(1/12)−1` and posts contributions **end-of-month**. For identical inputs (PV $100k, $1,000/mo, 7%, 25 yr) the lump-sum term alone diverges by ~$25k (bonus ≈ $568.5k vs canonical-locked $542,743), and the difference widens once contributions and the bonus tool's *missing* annual step-up are included. A user who runs "7% / 25 years" here and then runs the same assumptions in Step 4 sees two different futures with no explanation. This is the Pattern-1 failure the studio exists to prevent — softened only by the tool's isolation from the plan.
2. **No estimate/assumptions disclaimer anywhere on the screen.** The tool draws a confident green "Final Value" and a "Rule of 72" claim with no "educational estimate," no "assumes a constant return," no "not a guarantee" (the sibling Resources screen carries exactly this caveat at `Resources.tsx:88`; this screen has none). Canonical §8 / glossary require every projection to be labeled an estimate.

Neither is a stop-ship for *data integrity* (nothing persists, nothing feeds the plan), but #1 is a real cross-screen trust defect and #2 is a glossary violation, so the verdict is **revise**, capped there pending a live pass (no Claude_Preview this run).

**Composite: 6/10.**

> **Scope limitation:** Per the orchestrator's instruction I did **not** start a dev server or Claude_Preview (the orchestrator owns the single live pass). Every finding is **code-derived**; anything needing on-screen confirmation is tagged `[NEEDS-LIVE]`. The verdict is capped at "revise." A `node`-based numeric cross-check was blocked by the sandbox, so the dollar deltas above are hand-computed from the two formulas to ~$0.1k precision and the exact figures are tagged `[NEEDS-RECOMPUTE]` for QA to lock in Wolfram.

## Evidence base
- Files read in full: `bonus/CompoundCalculator.tsx`, `bonus/Resources.tsx`, `stores/financialPlan.ts`, `ui/MoneyInput.tsx`, `ui/RangeSlider.tsx`, `ui/FintechCard.tsx`, `styles/global.css`, all four `.learn` files, `audits/TEMPLATE.md`, `audits/step5-summary_v1.md`.
- Wiring confirmed: `NavigationTabs.tsx:10,115` imports and renders `<CompoundCalculator />` for the `compound` tab — this is a **live screen**, reached via the "Bonus" nav group.
- Static checks (grep): **0** `shiny` refs, **0** banned hex (`#64748b`/`#475569`) carrying text, **0** contribution-growth parameter, **0** disclaimer/"estimate"/"educational" string in this file.
- Theme note (corrects the stale step5 audit): `global.css:8-25` now has a real `@theme` block (errors.md row 4 FIXED 2026-06-07), so `text-text-primary`, `text-text-secondary`, `bg-accent-primary`, `bg-background-paper`, `shadow-card` all **resolve**. `FintechCard` `variant` is also wired (`FintechCard.tsx:12-17`). Row 4 is therefore CLEAN on this screen.
- Math comparison: hand-derived from `CompoundCalculator.tsx:21,42-47` vs `financialPlan.ts:119,128-131`. Exact dollar deltas `[NEEDS-RECOMPUTE]` (sandbox blocked `node`).
- **Live behavior: NOT observed** (orchestrator owns the live pass).

## errors.md regression scan
All 17 rows stated (total, not selective).
- **Row 1 (false-rigor "probability cone"):** CLEAN. No "probability cone," "confidence interval," "Monte Carlo," or distribution language on this screen. The chart is honestly a deterministic stacked area of principal vs. interest.
- **Row 2 (multi-engine divergence):** **TRIGGERED (mitigated).** The screen computes its own projection (`CompoundCalculator.tsx:20-59`) using a *different* compounding convention than the canonical engine (`financialPlan.ts`). This is literally a second projection engine. It is **isolated** (standalone state, never feeds the plan, never read by another screen), so it does not corrupt the plan — but for the same inputs it produces a different number than Step 4, which is the cross-screen trust harm row 2 names. Mitigated, not clean.
- **Row 3 (silent state loss):** N/A. Local `useState` only; this is an ephemeral scratch tool by design (no user plan data to persist). A refresh resetting it to defaults is acceptable for a calculator toy.
- **Row 4 (canonical drift — `*-shiny-*` / dead theme):** CLEAN. No `shiny` refs; tokens resolve via the `@theme` block; `FintechCard variant` is wired.
- **Row 5 (contrast — `#64748b`/`#475569` text):** CLEAN. No banned colors carry text. Body text uses `text-text-secondary` (#94a3b8, 5.71:1 on cards — passes AA). Chart axis/grid use `#94a3b8`/`#334155` (`:209-220`) — axis labels pass; grid is decoration.
- **Row 6 (label association / ARIA):** CLEAN (inherited). `MoneyInput` and `RangeSlider` associate labels via `useId()` (`MoneyInput.tsx:52,98,107`; `RangeSlider.tsx:28,54,67`). The Quick-Scenario buttons are real `<button>`s with text. `[NEEDS-LIVE]` to confirm the chart's focus/keyboard story.
- **Row 7 (monthlyContrib overwrite):** N/A. Sets no store inputs.
- **Row 8 (dead r==g branch):** N/A. Engine-internal; this tool has no such branch (and no step-up at all).
- **Row 9 (flat-CPI passive income):** N/A. This tool has no inflation, passive income, or retirement model.
- **Row 10 (reduced-motion animation stall):** CLEAN (inherited). No Framer Motion gating here; `global.css:97-106` reduced-motion reset applies to the `transition-all` button hovers. The Recharts area animation is decorative and not gating content. `[NEEDS-LIVE]`.
- **Row 11 (gross-vs-net drawdown):** N/A. No drawdown.
- **Row 12 (mean-only net-worth chart):** N/A. No retirement chart.
- **Row 13 (mean-vs-median headline):** N/A. No median/MC concept here (single deterministic line — appropriate for a generic compound calculator, but see Lens 3 on labeling).
- **Row 14 (scary number without driver):** CLEAN-ish. The result cards (Principal/Interest/Final) sit directly beside the inputs that drive them, so the driver is visible. No caveat, though (see Lens 3).
- **Row 15 (nominal-vs-today's-dollars headline):** N/A. No inflation in this tool, so figures are nominal future dollars with no "today's $" comparison — acceptable for a generic calculator, but the absence of any inflation note is worth a caveat (Lens 1/3).
- **Row 16 (zero-target empty state):** N/A (different shape). Defaults are non-zero ($10k/$500/7%/20yr), so there is no $0 degenerate state. Setting Initial=0 and Monthly=0 yields a flat $0 line — benign, not misleading.
- **Row 17 (malformed trust stat):** N/A. Welcome-screen-specific.

## Lens 1 — Nervous First-Timer ("Would someone who's never planned understand and trust this?")
### Critical
- None at the data-integrity level — the tool is self-contained and the result cards are plainly labeled.
### Improvement
- **No inflation context.** "Final Value $X" in 20–50 years is shown in nominal dollars with no hint that $X then ≠ $X today. A first-timer reads a big number as today's purchasing power. The main app fixed exactly this trust gap for its own headlines (errors.md row 15, today's-$ anchor). A one-line note ("future dollars; inflation not modeled") would close it.
- **"Rule of 72" is unglossed** (`:257-266`). A nervous first-timer does not know what "doubling time" means in practice or that it is an approximation. One sentence of plain-language framing would help, and it must carry the same estimate caveat.
- **Quick-Scenario labels "Conservative / Moderate / Aggressive (5/7/9%)"** match Step 4's chips (canonical §3) — good consistency. But "Aggressive (9%)" is styled green (success) while Moderate is blue; coloring the highest-return chip as "success" subtly implies higher = better/safer, which cuts against the tool's behavioral-honesty stance. Minor.

## Lens 2 — Skeptical CFP ("Is the math correct, defensible, and cited?")
### Critical
- **Compounding convention diverges from the ratified engine (Convergent w/ Lens 4, row 2).** `:21` `monthlyRate = rate / 12` is a **nominal** APR/12 convention; canonical §3 ratified the **effective** monthly rate `(1+r)^(1/12)−1` precisely so "7%" means a true 7% annual. Under the bonus tool's convention, a stated 7% compounds to a **7.23% effective annual** ((1+0.07/12)^12−1). A CFP reviewing both screens would flag that the same "7%" means two different things in the same product. The bonus number is also systematically **higher** (optimistic) than the plan's, compounding the trust problem.
- **Contribution timing is begin-of-month** (`:42-47`: add contribution, *then* apply that month's interest), vs the engine's **end-of-month** post (`financialPlan.ts:128-131`: grow, *then* add). Begin-of-month earns an extra month of growth on every contribution — another source of upward divergence, and a second undocumented convention.
### Improvement
- **No annual contribution step-up.** The engine grows contributions by `contribIncrease` (canonical §3); this tool holds the monthly contribution flat for up to 50 years. Defensible for a generic calculator, but it is a third axis on which it disagrees with Step 4 for "the same" inputs.
- **Rule of 72 is correct as an approximation** (`:262`, `72/(rate*100)`): at 7% it returns 10.3 yr vs the exact `ln2/ln1.07 ≈ 10.24 yr` — fine. But note it uses the *stated* rate, while the chart compounds at the higher effective rate, so the doubling claim and the chart are internally ~0.2%/yr inconsistent. Edge: at `rate = 0` (slider min is 0, `:149`) the expression is `72/0 → Infinity`, rendering **"Infinity years"** — ugly but not wrong. `[NEEDS-LIVE]` to confirm the on-screen string.

## Lens 3 — Trust & Credibility ("Does any label claim more rigor or certainty than the math delivers?")
### Critical
- **Zero disclaimer / estimate language on a projection screen.** The screen shows a definitive "Final Value," a green "Interest Earned," and a "Rule of 72" promise with **no** "estimate," "educational," "assumes a constant return," or "not a guarantee." Canonical §8 and the glossary require every projection to be labeled an estimate; the sibling Resources screen carries the exact sanctioned line (`Resources.tsx:88` "educational estimates, not guarantees") and this one carries nothing. A constant-7%-forever line is the textbook false-certainty risk (lessons Pattern 2).
### Improvement
- **No glossary banned constructions in the prose** — checked. The only sentences are the Rule-of-72 line and the chart subtitle; both are clean of "isn't X — it's Y," em-dash chains, and tricolons.
- Coloring "Aggressive (9%)" with `accent-success` (`:112`) flirts with implying the riskiest assumption is the "good" one (also noted in Lens 1).

## Lens 4 — Regression-Across-Screens ("Does the same input produce the same number everywhere, and did this break another view?")
### Critical
- **Same inputs → different number than Step 4 (Convergent w/ Lens 2, row 2).** Three independent reasons (effective vs nominal rate; end- vs begin-of-month; step-up vs flat) all push the bonus tool **above** the plan's projection for identical PV/contribution/rate/horizon. The tool is isolated so it cannot corrupt the plan, but a user who treats it as a preview of their Step 4 path will be misled. This is the canonical §0 "one quantity, one engine" spirit: even a standalone tool should either reuse the engine or visibly state it uses a simpler model.
### Improvement
- **The honest fix is cheap.** Either (a) have this tool call the same `projectAccumulation` helper (it is a pure function in `financialPlan.ts`, though not exported — would need an export), or (b) keep it standalone but add a one-line note: "This is a simplified compound calculator (constant return, nominal monthly compounding, contributions held flat); your Retirement plan in Step 4 uses a more detailed model." Option (b) is lower-risk and resolves both row-2-mitigated and the Lens-3 disclaimer in one stroke. *(Auditor surfaces; Engineer/CFP choose.)*

## Recommended next actions
1. **Critical — add an estimate/assumptions disclaimer to the screen. [content + cfp]** One block mirroring `Resources.tsx:88`: educational estimate, assumes a constant return, contributions held flat, future (not today's) dollars, not a guarantee. Closes the Lens-3 Critical and softens row-2-mitigated. *Convergent context (Lens 1 + 3).*
2. **Critical — reconcile or disclose the engine divergence. [engineer + cfp]** Either reuse the canonical `projectAccumulation` (effective monthly, end-of-month) so "7%" means the same thing everywhere, or add the explicit "simplified model, differs from Step 4" note. Do not leave two silent conventions for the same word "7%." *Convergent (Lens 2 + Lens 4), row 2.*
3. **Recommended — render the three result figures in monospace. [designer]** `:172,178,184` use `text-2xl font-bold` with no `font-mono`; the glossary requires all financial numbers in monospace, and the rest of the app (and the inputs here) honor it. Inconsistent typographic treatment of money figures.
4. **Recommended — gloss "Rule of 72" and guard the rate=0 case. [content + engineer]** Add one plain-language sentence, label it an approximation, and avoid rendering "Infinity years" when the rate slider is at 0 (`:149,262`).
5. **Polish — reconsider the green "Aggressive (9%)" chip. [designer]** Coloring the highest-return scenario as `success` implies higher = safer. Use a neutral/primary treatment.
6. **Polish — add an inflation note** (or a today's-dollars toggle) so the nominal "Final Value" is not read as today's purchasing power, consistent with the main app's row-15 fix.

## Residual risk
- **Live behavior not observed** (orchestrator owns the single live pass). Unconfirmed on-screen: the actual rendered "Rule of 72" string at rate extremes (0% → "Infinity years"; the `step=0.001` slider can land on values like 7.3%), Recharts axis-label contrast and tooltip rendering at small viewport, keyboard/focus path through the chart and sliders, and the reduced-motion behavior of the area-chart animation. All tagged `[NEEDS-LIVE]`.
- **Exact dollar deltas are hand-computed** (sandbox blocked `node`); the *direction* (bonus > canonical) and *order of magnitude* (~$25k on the lump term, larger with contributions) are robust from the formulas, but QA should lock precise figures in Wolfram before the divergence note quotes any number. Tagged `[NEEDS-RECOMPUTE]`.
- This audit covers the CompoundCalculator screen only and treats the canonical engine values as correct per canonical §5. It assumes the tool's isolation (no store writes) holds — confirmed by grep (no `inputs.setKey`/store import in the file), but a future edit that wires it to the store would escalate row 2 from mitigated to full Critical.

---
*finplan-auditor v1.1.0 | code-only run (orchestrator owns live pass) | screen: bonus/CompoundCalculator.tsx*
