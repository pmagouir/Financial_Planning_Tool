# Audit: Step 5 — Executive Summary v1
# Auditor: finplan-auditor | Date: 2026-06-07

## Verdict
**Revise.** The numbers Step 5 *displays* are sound — it reads `projectedPortfolio`, `requiredPortfolio`, `gap`, `withdrawalRate`, and `netWorthData` straight from the single canonical engine, so it does not reintroduce the multi-engine divergence (row 2 stays clean). The two stop-ship issues are not in the engine, they are in this screen:

1. **The "Retirement Income Sources" table turns the optimistic flat-CPI simplification (errors.md row 9) into a concrete, green, uncaveated dollar figure ("Portfolio Offset").** Inflating Social Security and pensions at full CPI overstates income and understates the required portfolio; this screen presents that overstatement as a precise, reassuring number with no caveat. This is the single most credibility-damaging element on the page.
2. **The disclaimer — the one block whose entire job is legibility — is rendered in `#64748b` at 12px, which fails WCAG AA (3.07:1 on the card background).** The honesty text is the least readable text on the screen (canonical §7, errors.md row 5).

A third, pervasive defect (row 4) sits underneath everything: ~40 `text-shiny-*` / `text-text-muted` classes and both `MetricCard`/`FintechCard` `variant` props are dead, so the intended typographic hierarchy and the colored-card system do not render at all. Not stop-ship on its own (text falls back to legible white), but it means the screen you ship is not the screen that was designed.

**Composite: 6/10.**

> **Scope limitation (read with the Residual Risk section):** Claude_Preview was **not available** in this run (the preview MCP and a dev server were both denied). The skill marks live observation MANDATORY and I could not perform it. **Every finding below is code-derived, not screen-confirmed.** Findings that specifically need on-screen confirmation are tagged `[NEEDS-LIVE]`. This is itself a gap against the verification gate (check 3) and is disclosed rather than papered over.

## Evidence base
- Files read: `Step5_Summary.tsx` (full), `financialPlan.ts` (full, the engine it reads), `financialPlan.test.ts`, `ui/MetricCard.tsx`, `ui/FintechCard.tsx`, `styles/global.css`, `NavigationTabs.tsx` (wiring), and all four `.learn` files + the prior `single-engine_v1` audit.
- Static checks: grep for `shiny`/`text-text-muted` (41 hits in Step 5), grep for off-canonical hex literals, confirmation that `global.css` has **no `@theme` block and no `@config`** and defines no `shiny`/token utilities.
- Wiring confirmed: `NavigationTabs.tsx:9,83` renders `<Step5_Summary />` for the `summary` tab — this is a live screen.
- Tests: `financialPlan.test.ts` exists and locks the engine values Step 5 displays (projectedPortfolio = $1,574,534.16, the Number = $2,198,466.83). I did **not** run the suite this session (no Bash for test exec was exercised); I relied on the prior audit's "8/8 green" plus reading the assertions.
- **Live behavior: NOT observed (see limitation above).**

## errors.md regression scan
- **Row 1 (false-rigor labeling — "probability cone"):** CLEAN for Step 5. The cone lives in Step 4; Step 5 contains no "probability cone," "confidence interval," "Monte Carlo," "guarantee," or "will have." The chart copy ("Portfolio growth through accumulation… and drawdown during withdrawal") and the disclaimer ("These projections are estimates") are glossary-compliant.
- **Row 2 (multi-engine divergence):** CLEAN. Step 5 recomputes **no** projection. It reads `res.projectedPortfolio`, `res.requiredPortfolio`, `res.gap`, `res.monthlyShortfall`, `res.netWorthData`, `res.inflationMult`, `res.withdrawalRate` from the single engine. The net-worth chart is a split/filter of `res.netWorthData` (Step5:149-161), not a re-simulation. No divergence path introduced.
- **Row 3 (silent state loss):** CLEAN / not-applicable. Step 5 reads the persistent store; it writes nothing.
- **Row 4 (canonical drift — `*-shiny-*` / dead theme):** **TRIGGERED.** 41 occurrences of `text-shiny-text` / `text-shiny-muted` / `bg-shiny-primary` / `shadow-shiny-card` / `text-text-muted` in this file (Step5:213, 224-225, 235-688). `global.css` defines none of them and has no `@theme`/`@config`. Additionally `MetricCard`/`FintechCard` accept a `variant` prop that their implementations ignore (`ui/MetricCard.tsx:10-22`, `ui/FintechCard.tsx:10-23`) — every `variant="info|success|warning|primary"` on this screen is inert. Pre-existing project-wide defect, **recurs heavily here.** Critical-adjacent (see Recommended).
- **Row 5 (contrast — `#64748b` body text / `#475569`):** **TRIGGERED.** `#64748b` carries body-sized text at `Step5:708` (disclaimer, 12px) and `Step5:676` (table cell). Canonical §7 marks `#64748b` FAIL AA for normal text (3.07:1 on cards). `#475569` is not used (good). Chart-axis label at `:416` also uses `#64748b` at 11px (decorative-ish, lower severity).
- **Row 6 (label association / ARIA):** PARTIAL / mostly clean for this screen. The income table uses correct `<table><thead><th>` semantics (better than the components row 6 cites), though `<th>` lacks `scope`. The Print button has a visible text label ("Print Report") so it has an accessible name. No unlabeled inputs on this screen (Step 5 has no form inputs). `[NEEDS-LIVE]` to confirm focus order through the charts.
- **Row 7 (monthlyContrib overwrite):** Not applicable — Step 5 sets no inputs.
- **Row 8 (dead r==g branch):** Not applicable — engine internal, not touched by Step 5.
- **Row 9 (flat-CPI on passive income, presented as conservative):** **TRIGGERED — and amplified.** The "Retirement Income Sources" table (`Step5:626-698`) inflates SS/pension/other at `res.inflationMult` (full CPI) and renders a green "Portfolio Offset" = `future / withdrawalRate` per row plus a bold green total — with **no caveat anywhere on the screen.** This is the most prominent surfacing of the row-9 optimism in the app: it converts the simplification into a specific dollar amount that *reduces the user's apparent target* and is colored as good news.

## Lens 1 — Nervous First-Timer ("Would someone who's never planned understand and trust this?")
### Critical
- **Zero-target / unfilled-plan state is misleading.** Defaults seed `socialSecurity = $18,000` but all 11 retirement-spend sliders at `$0` (`financialPlan.ts:40-46`). If a user opens Summary before completing the retirement-spend step, `netNeed → 0 → requiredPortfolio = $0`, and Step 5 shows **"Required Portfolio $0," a "Surplus," and "100.0% of target reached."** `progressPct` (`Step5:145`) divides by `Math.max(1, requiredPortfolio)`, so a $0 target reads as fully funded. A first-timer reads "you're done / over-funded" when they have simply not entered their plan. The spending-comparison chart guards its empty state (`Step5:582-586`); the four metric cards and the progress bar do not. `[NEEDS-LIVE]` to confirm the exact on-screen rendering, but the code path is unambiguous.
### Improvement
- **"Now vs. Retirement Spending" silently drops categories from "Now."** `spendingComparison` (`Step5:166-200`) buckets only Housing, Transport, Food, Healthcare, Entertainment, Personal — and even within those omits fields the user entered: Healthcare = `i.healthIns` only (drops `otherIns`), Personal drops `i.dev`, and **Dining, debt, childcare, subscriptions, tech, home-improvement, banking, and misc have no "current" bar at all.** The "Now" column does not reconcile to the Step 1 total, so the comparison understates current spending. A nervous user comparing the two columns is being shown an incomplete "now." Either total the remainder into an "Other" bar or state the chart shows selected categories.
- Shortfall card gives a next action ("Additional $X/mo needed", `Step5:272`) but no path back to Step 4 to act on it; the terminal screen dead-ends on the fix. Low-effort link would help.

## Lens 2 — Skeptical CFP ("Is the math correct, defensible, and cited?")
### Critical
- **Uncaveated optimistic income offset (row 9, convergent with Lens 3).** The "Portfolio Offset" column (`Step5:660,692`) is *internally* consistent with canonical §2 (`offset = futureIncome / WR`), so it is not a divergence bug — but it inherits the engine's documented optimism (SS/pension inflated at full CPI) and presents it without the caveat canonical §2 and errors.md row 9 explicitly require ("Documented simplification, currently optimistic. Do not present as conservative."). A CFP would not sign a client summary that shows a precise pension/SS "portfolio offset" with no note that real SS COLA differs and most pensions are not inflation-indexed. **The math is defensible; the *presentation* is not.**
### Improvement
- **Withdrawal-rate attribution is correct but thin.** `Step5:283` cites "Trinity Study (N yr retirement)" — good. But the bracket edges (≥35→3.5%, <15→5.0%) are the tool's own interpolation (canonical §1, confidence: medium), and a duration of exactly 34 vs 35 silently flips the entire required portfolio via the WR cliff. Step 5 shows the resulting WR but gives the user no hint that a one-year change in duration moved it. Not wrong; worth a tooltip.
- The disclaimer correctly names "sequence-of-returns risk" as un-modeled (`Step5:712-714`) — good, this is exactly the honesty canonical §4 asks for.

## Lens 3 — Trust & Credibility ("Does any label claim more rigor or certainty than the math delivers?")
### Critical
- **The honesty disclaimer is the hardest text on the page to read.** `Step5:701-715`: 12px text in `#64748b` (FAIL AA, canonical §7, row 5). The block whose job is to communicate uncertainty and "not financial advice" is rendered below the legibility floor. This both fails accessibility and undercuts the credibility move it is trying to make. Bump to `#94a3b8` (passes AA at 5.71:1 on cards) at minimum.
- **Green "Portfolio Offset" frames an optimistic assumption as good news (convergent with Lens 2, row 9).** Colour (`#22c55e`) + a positive dollar total signals "this is working for you," with no caveat. This is precisely the row-9 / lesson-2 failure: "presenting it without a caveat reads as conservative when it is not."
### Improvement
- **Off-canonical status colors.** Step 5 hardcodes `#22c55e` for success (canonical success is `#10b981`) and `#f97316` orange for shortfall (canonical danger `#ef4444` / warning `#f59e0b`) — `Step5:103,262,345,368,373,676,691`. The Withdrawal series and tooltip badge use `#8b5cf6` / `#a78bfa` purple, **a hue that is not in the canonical palette at all** (§6 has no purple). Status-by-color is paired with text/icons in most places (the gap card has ↑/↓ + "Surplus/Shortfall" — good), so this is a drift/consistency issue, not a §7 status-alone violation.

## Lens 4 — Regression-Across-Screens ("Does the same input produce the same number everywhere, and did this break another view?")
### Critical
- None. **Convergent (code + the locked test suite):** Step 5's "Projected Portfolio" card and the net-worth chart peak both come from `res.projectedPortfolio` / `res.netWorthData`, which `financialPlan.test.ts:74-87` asserts equal to the Step-4 cone's expected-final to 6 dp. So Step 4 and Step 5 cannot disagree on the projected total by construction. The row-2 defect stays closed on this screen.
### Improvement
- **Component recomputes a sum the store already owns (Pattern-1 smell, not a divergence).** `retMonthlySpend` (`Step5:137-140`) re-adds the 11 retirement sliders; the store already exposes `annualRetSpend` (= same 11 × 12). Same inputs → same result today, so no current divergence, but it is exactly the "calculation inside a component" the lessons warn against — if the engine's spend definition ever changes, this screen drifts. Read `res.annualRetSpend / 12` instead.
- `monthlyNeedFuture` (`Step5:142`) multiplies the local `retMonthlySpend` by `res.inflationMult`; harmless today (reads the store's multiplier) but compounds the above smell.

## Recommended next actions
1. **Critical — caveat the income offset (row 9). [CFP owns the wording, Engineer/UI place it]** Add a visible caveat to the "Retirement Income Sources" table: Social Security has its own COLA and is partially taxable; many pensions are not inflation-indexed; inflating all passive income at full CPI is a simplification that **understates** the required portfolio. Do not color the offset as unqualified good news until Phase-2 COLA modelling lands. *Convergent (Lens 2 + Lens 3).*
2. **Critical — fix disclaimer contrast (row 5). [UI/Designer]** `Step5:708` `#64748b` → `#94a3b8` (or lighter) for the 12px disclaimer; same for the `#64748b` table-cell text at `:676`. Verify against canonical §7.
3. **Critical — guard the zero/unfilled-plan state. [UI + Engineer]** When `requiredPortfolio === 0` (or retirement spend is unentered), the four metric cards and progress bar must show an empty/prompt state ("Complete Step 3 to see your number"), not "$0 / 100% / Surplus." *Lens 1.*
4. **Recommended — kill the dead theme on this screen (row 4). [Engineer + Designer, project-wide]** Either implement `MetricCard`/`FintechCard` `variant` (the colored-border system CLAUDE.md describes) or remove the props; migrate the palette into an `@theme` block in `global.css` and replace all `text-shiny-*` / `bg-shiny-primary` / `shadow-shiny-card` / `text-text-muted` so the designed hierarchy actually renders. 41 references in this file alone.
5. **Recommended — reconcile the "Now vs. Retirement" chart's current column** to the Step 1 total (add an "Other" bucket or relabel as selected categories). *Lens 1.*
6. **Polish — replace `retMonthlySpend` with `res.annualRetSpend / 12`** so no projection-adjacent arithmetic lives in the component. *Lens 4 / Pattern 1.*
7. **Polish — align status hexes to canonical** (`#22c55e`→`#10b981`, `#f97316`→`#f59e0b`/`#ef4444`) and decide whether the purple drawdown hue is an intentional addition (if so, add it to canonical §6 with a role; if not, replace it).

## Residual risk
- **Live behavior was not observed — the largest gap in this audit.** Claude_Preview and a dev server were both unavailable this run, and the skill marks observation mandatory. I could not confirm: the actual rendered color of the dead `text-shiny-*` text (I infer white fallback, but a global CSS rule could override), the on-screen reading of the zero-target state, focus order through the two charts, the print stylesheet output, or how the cone/charts read to a real first-timer. Every `[NEEDS-LIVE]` finding and the row-4 severity should be re-confirmed in the browser before the fixes are signed off.
- I did not run the test suite this session; the engine-value confidence rests on the locked assertions in `financialPlan.test.ts` and the prior audit's green result. If the suite is currently red, the "Step 4 == Step 5" guarantee in Lens 4 weakens.
- This audit covers Step 5 only. It assumes the upstream engine values are correct per canonical §5 (independently Wolfram-validated); it does not re-derive them. Per failure mode F1, the convergence in Lens 4 is backed by the primary locked reference value, not by lens agreement alone.
- Extreme inputs beyond the zero-target case (e.g. `retDuration` driving the WR cliff, negative/huge portfolios, `retYear` in the past) were reasoned about from code, not exercised — that remains QA's edge-case backlog.

---
*finplan-auditor v1.0.0 | code-only run (no live observation) | reference: studio/audits/single-engine_v1.md*
