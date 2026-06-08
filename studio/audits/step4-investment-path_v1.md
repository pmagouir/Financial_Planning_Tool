# Audit: Step 4 — Investment Path v1
# Auditor: finplan-auditor | Date: 2026-06-08

## Verdict
**Revise** (capped at revise — no live pass performed this run; see Scope limitation). Step 4 is in good shape: it reads the single canonical engine for everything (no projection recomputed in the component — row 2 stays clean), the Monte Carlo cone is labeled honestly and glossary-compliantly ("1,000 Monte Carlo simulations… an estimate… not a guarantee"), the row-16 zero-target guard is correctly wired off the engine's `planReady` predicate, and the row-7 contribution foot-gun is correctly handled (flag-before-value). There is **no stop-ship Critical** in scope.

The two issues worth holding the build for are both consistency/trust, not correctness:
1. **The success-probability banner and the "Action Required / On Track" verdict use two different success criteria, computed off two different MC quantities, and can disagree on screen.** The headline "X% of simulations fund your retirement" reads `res.successProbability` (the share of full-lifecycle drawdown paths that survive), while the green/amber verdict box reads `res.medianGap ≥ 0` (whether the *median accumulation balance* clears the target). These answer different questions and can show "On Track" beside a success rate well under 50% (a plan whose median end-balance clears the 25× target can still fail most drawdown simulations to sequence risk). A nervous first-timer sees "On Track" and a scary low percentage on the same screen with no reconciliation. `[NEEDS-LIVE]`
2. **Token drift:** three off-canonical hexes (`#fbbf24`, `#34d399`, `#cbd5e1`) carry text/lines where canonical §6 names `#f59e0b` / `#10b981` / `#94a3b8`. Not stop-ship; pairs with the same drift catalogued on Step 5.

**Composite: 7.5/10.**

> **Scope limitation:** Per the orchestrator's instruction I did **not** start a dev server or Claude_Preview — the orchestrator owns the single live pass. Every behavioral claim is code-derived and tagged `[NEEDS-LIVE]`. Verdict capped at "revise" pending that pass (skill fallback: no live tool → never "ship").

## Evidence base
- Files read in full: `Step4_InvestmentPath.tsx`, `financialPlan.ts` (the engine it reads), `ui/MoneyInput.tsx`, `ui/RangeSlider.tsx`, `ui/FintechCard.tsx`, `ui/MetricCard.tsx`, `styles/global.css`, all four `.learn` files, `studio/audits/step5-summary_v1.md`.
- Static greps I ran:
  - `grep "shiny"` Step 4 → **0 hits.** `grep "text-text-muted"` → **0 hits.** (Row 4 cleanup landed; `global.css` now has a real `@theme` block, lines 8-25.)
  - `grep "#64748b" / "#475569"` → **0 hits** (row-5 banned body colors absent).
  - Off-canonical hex inventory: `#fbbf24` (1×, :267), `#34d399` (1×, :296), `#cbd5e1` (1×, :548).
  - Canonical accent hexes present and used: 44 occurrences of the §6 palette.
  - `grep "Math.pow|for(|while("` in Step 4 → **0 hits** → the component runs no projection loop; it maps `res.mcCone` (Pattern 1 satisfied).
  - Wiring: `NavigationTabs.tsx:113` renders `<Step4_InvestmentPath onNext={handleNext} />` — live screen. `onNext` advances to the summary tab; there is **no** prop to jump back to Step 2 from the shortfall panel.
- Tests: `financialPlan.test.ts` (27 tests) locks the engine values Step 4 displays — `successProbability` reproducibility (:187-190), validity in [0,1] (:193-195), the ~73% drawdown reference (:234-235), `medianPortfolio` band (:213-218), median<mean (:214), `planReady`/`annualRetSpend===0` row-16 trigger (:149-156). I did **not** execute the suite this run; I read the assertions.
- **Live behavior: NOT observed (orchestrator owns the live pass).**

## errors.md regression scan
*All 17 rows stated. Silence is failure.*
- **Row 1 (false-rigor "probability cone"):** **CLEAN — now correctly the opposite.** Post-Wave-1 a real seeded Monte Carlo ships (`runMonteCarlo`, canonical §10), so "probability" language is *allowed* and is used correctly here: "1,000 Monte Carlo simulations… 10th–90th percentile… median (typical) path… An estimate under the stated return assumptions, not a guarantee" (`Step4:326-327`), and the success banner says "of simulations fund your full N-year retirement" (`:342`). Paired with assumptions and an estimate disclaimer per §10.5. No banned phrase ("guarantee," "will have," "confidence interval" applied to a deterministic line).
- **Row 2 (multi-engine divergence):** **CLEAN.** Step 4 recomputes no projection. `coneData` maps `res.mcCone` (`:129-137`); the gap reads `res.medianGap` / `res.monthlyShortfall` / `res.successProbability`; the only local arithmetic is `medianGapToday = res.medianGap / res.inflationMult` (`:144`, a display denomination, not a re-simulation). The component-local monthly model the canonical §0 history called out is gone (confirmed: 0 loops/`Math.pow`).
- **Row 3 (silent state loss):** **CLEAN.** Reads the persistent store; the only writes are user-driven `inputs.setKey` from form controls.
- **Row 4 (canonical drift — `*-shiny-*` / dead `@theme`):** **CLEAN for Step 4** (was the project-wide defect). 0 `shiny` / 0 `text-text-muted` in this file; `global.css:8-25` defines the §6 palette in an `@theme` block; `FintechCard` `variant` is now wired to a real top-border (`ui/FintechCard.tsx:12-17`), so `variant="info|success|primary"` on this screen paints. Residual: a handful of off-canonical hexes (see row-5 note below + Lens 3) — drift, not dead-layer.
- **Row 5 (contrast — `#64748b` body / `#475569`):** **CLEAN.** Neither banned color appears. Secondary text uses `#94a3b8` (6.96:1 / 5.71:1, passes AA per §7) and `text-text-secondary`. One residual: the outcome-strip labels render at `#94a3b8` 0.65rem (~10.4px) — passes the *color* gate but is very small; `[NEEDS-LIVE]` to confirm legibility, not a contrast failure.
- **Row 6 (label association / ARIA):** **CLEAN.** All inputs route through `MoneyInput`/`RangeSlider`, which associate labels via `useId()` (`MoneyInput.tsx:52,98,107`; `RangeSlider.tsx:28,54,67`); the slider adds `aria-valuetext`. The success banner and outcome strip carry `role="status"` (`:331`). Return-rate chips are real `<button>`s with text labels. No unlabeled control found.
- **Row 7 (monthlyContrib overwrite):** **CLEAN — correctly guarded.** The contribution input sets `hasModifiedContrib` **before** writing the value (`Step4:177-178`), with an inline comment explaining the synchronous-subscriber ordering; the engine's seed is gated `totalInvest > 0 && !val.hasModifiedContrib` (`financialPlan.ts:94`). Matches the row-7 fix and its test.
- **Row 8 (dead r==g branch):** N/A — engine internal; not touched by Step 4.
- **Row 9 (flat-CPI passive income, presented as conservative):** **N/A on Step 4 (no income table here).** Step 4 shows no per-source income offset; the row-9 surface is Step 5's income table. Step 4's success rate *consumes* the engine's now-correct income treatment (SS COLA'd, pension/other flat — `financialPlan.ts:279-281`), so it inherits the honest version, not the old optimism.
- **Row 10 (reduced-motion stall):** N/A to this file — the fix lives in `NavigationTabs.tsx` + `global.css:97-106` (both present). Step 4's charts set `isAnimationActive` only on Step 5; Recharts here animates by default but content is not gated on it. `[NEEDS-LIVE]` to confirm no stall under reduced-motion.
- **Row 11 (drawdown nets income — consistency):** N/A to display; the engine nets `inflatingNet`/`flatIncome` (`financialPlan.ts:281,219,311`). Step 4 only reads the result.
- **Row 12 (Step 5 net-worth mean-only chart):** N/A — Step 5 defect.
- **Row 13 (headline mean vs median divergence):** **CLEAN — and this is the good pattern.** Step 4 headlines the **median**: the gap panels read `res.medianGap` (`:255,284`), `medianGapToday` (`:267,296`), and the success banner reads `res.successProbability`. The deterministic mean is not headlined here. Matches canonical §10.6.
- **Row 14 (scary number with no driver):** Partial — see Lens 1. The shortfall panel shows the gap + the additional $/mo to close it (`:277-279`), which is a driver+action. The success *percentage* gets a one-line qualitative read ("Fragile — more contributions or a later retirement would help," `:343`) but no numeric driver. Minor.
- **Row 15 (nominal-only headline figures):** **CLEAN.** Gap figures show today's dollars explicitly ("(today's $)", `:267,296`) via `medianGapToday`. Consistent with the §2 display convention.
- **Row 16 (zero-target false good-news):** **CLEAN — correctly guarded.** `planReady = res.planReady` (`:150`); the On-Track / Action-Required panels are gated `hasData && planReady && …` (`:255,284`); a dedicated "No target set yet" panel renders for `hasData && !planReady` (`:305-321`); the outcome strip neutralizes color to `#cbd5e1` and suppresses the ✓/✗ verdict when `!planReady` (`:548,558`). Matches the row-16 fix exactly.
- **Row 17 (Welcome stat malformed):** N/A — Welcome screen.

## Lens 1 — Nervous First-Timer ("Would someone who's never planned understand and trust this?")
### Critical
- None.
### Improvement
- **Two "are you OK?" answers on one screen can conflict (convergent with Lens 4).** The big verdict box ("On Track" / "Action Required") is driven by `res.medianGap` (median accumulation vs target), while the prominent success banner is `res.successProbability` (drawdown survival). These can point opposite directions — e.g. median end-balance clears the 25× target (box says "On Track," `:284-302`) while only, say, 55% of drawdown sims survive sequence risk (banner amber/red, `:338-344`). A first-timer has no way to reconcile "On Track" with "55%." Recommend the verdict box reference the same success-probability framing, or add one line tying them together. `[NEEDS-LIVE]` to confirm a real input set that splits them.
- **Success % has a qualitative nudge but no numeric next step.** Below ~60% the copy says "more contributions or a later retirement would help" (`:343`) but doesn't surface *how much* — the `monthlyShortfall` number only appears in the separate median-gap panel, and only when `medianGap < 0`. If the median clears the target but the success rate is low, the user is told they're fragile with no quantified action. (Edge of row 14.)
- **Shortfall panel dead-ends.** "Additional $X/mo needed" (`:277-279`) names the action but offers no link back to adjust the contribution (it's on the same screen, so minor) or to Step 2 to lower the target. The "No target set yet" panel names Step 2 in prose (`:317`) but isn't a link. `onNext` only goes forward (`NavigationTabs.tsx:113`). Low-effort to add.

## Lens 2 — Skeptical CFP ("Is the math correct, defensible, and cited?")
### Critical
- None. The cone reads the seeded MC (canonical §10), the target line reads `res.requiredPortfolio` (canonical §2), and the success rate is the §10 ground-truth (~73% reference locked in the test at `financialPlan.test.ts:234-235`). No number is recomputed off-spec.
### Improvement
- **`onTrackP10` / outcome-strip "on track" use a different success definition than the headline success rate.** `onTrackP10 = p10Final >= requiredPortfolio` (`:141`) and each outcome cell's `onTrack` (`:516,522,528`) compare the *accumulation-end* percentile balance to the target. The headline `successProbability` is *drawdown survival* through retirement. So a column can read "✓ on track" (its accumulation p10 clears 25×) while the plan's true success probability is lower because the 25× target understates what full-COLA withdrawals with sequence risk require (the very gap canonical §4/§10 was built to expose). The labels aren't wrong, but "on track" meaning two things on one screen is a defensible-but-thin presentation a CFP would flag. *Convergent with Lens 1/4.*
- **Return-rate chips (5/7/9%) are sourced in canonical §3** (Collins/Bogleheads, confidence high as an educational assumption) but the screen states no source inline. The helper "Conservative: 5%, Moderate: 7%, Aggressive: 9%" (`:207`) is fine; a one-line attribution would match the CFP standard the project sets elsewhere. Polish.

## Lens 3 — Trust & Credibility ("Does any label claim more rigor or certainty than the math delivers?")
### Critical
- None. This is the screen row 1 was about, and it now passes: the cone is a real simulation, labeled as an estimate, with the assumptions stated and "not a guarantee" present (`:327`). The success banner is "X% of simulations fund…" — exactly the §10.5 allowed framing.
### Improvement
- **Off-canonical status hexes (token drift, not a §7 status-alone violation).** `#fbbf24` for the shortfall figure (`:267`) where canonical danger/warning is `#ef4444`/`#f59e0b`; `#34d399` for the surplus figure (`:296`) where success is `#10b981`; `#cbd5e1` for the neutral no-target outcome strip (`:548`) where §6's neutral is `#94a3b8`. Status is paired with text everywhere ("Action Required"/"On Track"/"✓ on track"/"✗ shortfall"), so this is consistency drift, not an accessibility failure. Align to §6 or add these tints to canonical with a role.
- **The probability band's lower edge is the 10th percentile, drawn dashed in amber (`#f59e0b`, `:461`); the 90th in emerald (`#10b981`, `:444`).** Defensible (amber = caution downside, green = upside) and paired with text labels in the legend (`:362-365`), so no status-alone issue — noting for the designer that amber here also marks "Retirement" (`:484,489`), a mild double-duty of the warning hue. `[NEEDS-LIVE]` to confirm the two amber uses don't read as the same series on screen.

## Lens 4 — Regression-Across-Screens ("Does the same input produce the same number everywhere, and did this break another view?")
### Critical
- None.
### Improvement
- **Convergent (Lens 1 + Lens 2): one screen, two definitions of "success."** `res.successProbability` (drawdown survival) and `res.medianGap`/`onTrackP10` (accumulation-balance vs 25× target) are *both* engine values (so no Pattern-1 divergence — neither is recomputed), but they encode different questions and the screen presents both as "are you on track?" without distinguishing them. This is not a cross-screen number conflict; it's an intra-screen semantic conflict that *will read as* the tool contradicting itself. Step 5 carries the same `successProbability` (`Step5:339-351`) and the same median headline, so the two screens agree with each other — the conflict is internal to each. Recommend the builder pick one primary verdict signal (the success probability is the honest one per §10.6) and subordinate the median-gap verdict to it.
- **`requiredPortfolio` target line + `successProbability` both read the store and match Step 5 by construction.** `Step4` target = `res.requiredPortfolio` (`:136,539-equiv`); `Step5` target ReferenceLine = `res.requiredPortfolio` (`Step5:539`). Same source → cannot diverge. Row 2 closed across both screens. (Backed by the locked `financialPlan.test.ts` row-2 cross-check at :74-85, not by lens agreement alone — failure-mode F1.)

## Recommended next actions
1. **Recommended — reconcile the two success signals. [cfp defines the primary signal; engineer/content wire it]** The success-probability banner (`Step4:338-344`) and the "On Track / Action Required" verdict (`:255-302`) can disagree because one is drawdown-survival and the other is median-accumulation-vs-25×. Make the success probability the primary verdict (canonical §10.6 already names the median/success as the one story) and reframe or subordinate the median-gap box so a user never sees "On Track" beside a sub-50% success rate. *Convergent (Lens 1, 2, 4).* `[NEEDS-LIVE]` to capture a splitting input set.
2. **Recommended — surface a numeric next step when the success rate is low but the median clears.** Show `res.monthlyShortfall` (or an equivalent) alongside the success-% nudge (`:343`), not only inside the `medianGap < 0` panel, so the "Fragile" message always carries a quantified action. *Lens 1 (edge of row 14).*
3. **Polish — align off-canonical hexes to §6.** `#fbbf24`→`#f59e0b` (`:267`), `#34d399`→`#10b981` (`:296`), `#cbd5e1`→`#94a3b8` (`:548`) — or add them to canonical §6 with roles. *Lens 3 / Pattern 3.*
4. **Polish — add a back-link to act on a shortfall.** A link from the Action-Required / No-target panels to Step 2 (lower the target) would close the dead-end. *Lens 1.*
5. **Polish — inline-attribute the 5/7/9% return chips** (Collins/Bogleheads, canonical §3) to match the project's CFP citation standard. *Lens 2.*

## Residual risk
- **Live behavior was not observed** (orchestrator owns the single live pass). I could not confirm on screen: whether a real input set actually splits the success-banner and the median verdict (the lead finding), the legibility of the 0.65rem outcome-strip labels, the reduced-motion behavior of the Recharts cone (row 10), whether the two amber uses (10th-pct line vs Retirement marker) read as distinct, and the actual painted cone (Recharts SVG under headless throttles ResizeObserver per errors.md row 1's note). Re-confirm every `[NEEDS-LIVE]` before sign-off.
- I did not execute `financialPlan.test.ts` this run; the "Step 4 == Step 5 by construction" guarantee and the ~73% success reference rest on reading the locked assertions, not a green run.
- This audit assumes canonical §5/§10 engine values are Wolfram-validated (they are marked LOCKED) and does not re-derive them — per the orchestrator's scope, the meaningful check for this display screen is read-vs-recompute (Pattern 1), which it passes.
- Extreme inputs (retYear in the past — engine clamps `yearsToRet` to ≥0 at `financialPlan.ts:248`; `contribStopYear` boundary; negative/huge portfolios) were reasoned from code, not exercised — QA's edge backlog.

---
*finplan-auditor v1.1.0 | code-only run (no live observation — orchestrator owns the live pass) | reference: studio/.learn/canonical.md, studio/audits/step5-summary_v1.md*
