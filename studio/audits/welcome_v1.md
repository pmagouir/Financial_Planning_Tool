# Audit: Welcome (landing screen) v1
# Auditor: finplan-auditor | Date: 2026-06-08

## Verdict
**Revise.** Welcome is a pure presentational screen — it reads no store values, makes no financial calculation, and reintroduces no engine divergence (rows 2/8/11/13 clean by construction). It is also the most polished screen in the app and its attribution is materially accurate. But two issues block "ship":

1. **STOP-SHIP — `#334155` is used as readable text in two places (`Welcome.tsx:186`, `Welcome.tsx:450`), the exact color canonical §7 bans for text.** Computed contrast is ~1.67:1 on the page background (§7 locks it at 2.36:1 on cards; it is worse on the darker page). One of the two (`:450`) carries the single most important trust sentence on the page — *"Your data stays private — everything is calculated locally in your browser."* — rendered effectively invisible. This is a direct recurrence of errors.md row 5 (Pattern 4) on a brand-new-since-the-row screen, which the regression protocol escalates to Critical.
2. **STOP-SHIP (trust) — the hero eyebrow says "Based on the Trinity Study · JL Collins · Ramit Sethi" but Morgan Housel — the third pillar the screen itself dedicates a card to — is omitted, while the Trinity Study (a methodology, not a person) is listed in a people series.** The attribution undersells the synthesis the product is built on and reads as an inconsistent list.

A pervasive sub-issue sits underneath: the screen is built almost entirely from inline `style={{}}` with hardcoded hexes and `rgba(255,255,255,…)` rather than the `@theme` tokens that now exist in `global.css` (canonical §6). It renders fine, but it is off the token system, so it will drift.

> **Scope limitation (cold run — read with Residual Risk):** Per the auditor skill's verification gate, live observation is MANDATORY and the orchestrator owns the single live pass. I did **not** start a dev server or Claude_Preview. **Every finding below is code-derived, not screen-confirmed.** Findings needing on-screen confirmation are tagged `[NEEDS-LIVE]`, and per the cold-run fallback this verdict is capped at "revise" (never "ship") pending that pass.

**Composite: 6.5/10.**

## Evidence base
- **Files read in full:** `src/components/Welcome.tsx`, `src/components/ui/FintechCard.tsx` (its only component dependency), `src/styles/global.css`, `src/stores/financialPlan.ts` (confirmed Welcome imports nothing from it), plus all four `.learn/` files, `TEMPLATE.md`, and `step5-summary_v1.md` (exemplar).
- **Static greps run (this session):**
  - `#334155` in `Welcome.tsx` → **2 hits, both as `color:` (text)** — lines 186, 450.
  - `#475569` → 0 hits (clean).
  - off-canonical hexes → `#8b5cf6` ×2 (lines 18, 59), `#93c5fd` ×3 (105, 146, 163), `#bfdbfe` ×1 (157). None are in canonical §6.
  - `shiny` / `text-text-muted` dead-token classes → **0 hits** (row 4 does NOT recur here; the screen uses inline styles, not the dead utility vocabulary).
- **Contrast computed by hand** (WCAG 2.2 relative-luminance formula; Bash `node`/`python` execution was denied this session, so ratios were derived analytically, not script-verified — see Residual Risk):
  - `#334155` text on page `#0f172a` → **~1.67:1** (FAIL ALL; §7 banned regardless).
  - `#93c5fd` on page → ~9.5:1 (pass); `#bfdbfe` → ~12:1 (pass). The blue accent text is legible; the problem is the slate `#334155`, not the blues.
- **Wiring:** Welcome takes an optional `onStart` callback; `NavigationTabs` renders it for the landing/welcome tab. `[NEEDS-LIVE]` to confirm whether `onStart` is passed (the CTA button) or omitted (the "select a step in the sidebar" fallback renders).
- **Live behavior: NOT observed.**

## errors.md regression scan
All 17 rows screened (total, not selective):
- **Row 1 (false-rigor "probability cone"):** CLEAN. Welcome contains no cone, no "probability," "confidence interval," "Monte Carlo," "guarantee," or "you will have." The hero is marketing copy ("battle-tested financial research") — see Lens 3 for one soft phrase.
- **Row 2 (multi-engine divergence):** CLEAN by construction. Welcome imports nothing from `financialPlan.ts` and computes no projection.
- **Row 3 (silent state loss):** N/A. Welcome reads/writes no store state.
- **Row 4 (canonical drift — `*-shiny-*` / dead theme):** CLEAN. 0 `shiny`/`text-text-muted` references. (The screen is on inline styles instead of `@theme` tokens — a *different* drift smell, logged under Lens 4, but not the row-4 dead-class defect.)
- **Row 5 (contrast — `#64748b` / `#475569` / banned text colors):** **TRIGGERED (Critical).** `#334155` carries text at `Welcome.tsx:186` (the "or select a step in the sidebar" sub-CTA) and `:450` (the privacy/trust clause inside the disclaimer). §7: "`#334155`/`#475569` and below never carry text." Computed ~1.67:1 on this background. `#64748b` itself is not used here. See Lens 1 + Lens 3.
- **Row 6 (label association / ARIA):** PARTIAL. The CTA is a real `<button>` with a text label ("Get Started") so it has an accessible name (good). Heading order is `h1 → h2 → h2` (lines 114, 240, 367) — clean, single h1, no skips. `[NEEDS-LIVE]` to confirm focus ring visibility on the custom-styled button (it sets inline styles on hover but no explicit `:focus-visible` style — keyboard focus may be invisible).
- **Row 7 (monthlyContrib overwrite):** N/A — Welcome sets no inputs.
- **Row 8 (dead r==g branch):** N/A — engine internal.
- **Row 9 (flat-CPI passive income):** N/A — no income math on this screen. (The disclaimer's "do not account for taxes" is consistent with canonical §2's tax caveat — good.)
- **Row 10 (reduced-motion / animation-gated content):** CLEAN for Welcome itself — it uses no Framer Motion and no CSS animation that gates content (only `transition` on hover, which `global.css`'s reduced-motion reset neutralizes). The app-level AnimatePresence gate lives in NavigationTabs (already FIXED in row 10), not here.
- **Row 11 (gross-vs-net drawdown):** N/A — engine.
- **Row 12 (Step 5 net-worth mean-only chart):** N/A — Step 5.
- **Row 13 (mean-vs-median headline):** N/A — Welcome shows no projected number.
- **Row 14 (Required-portfolio driver hidden):** N/A — Step 5.
- **Row 15 (nominal vs today's-dollars headline):** N/A — Welcome shows no dollar figure. The `25x` / `4%` stats are dimensionless and correct.
- **Row 16 (zero-target fake good-news state):** N/A — Welcome has no target/metric state.
- **Row 17 (Welcome stats-strip "$0 data" malformed trust stat):** **CLEAN — verified FIXED.** `Welcome.tsx:70` now reads `{ value: '0', label: 'Data leaves your browser' }`, exactly the fix the row prescribes. No stray `$`, number-led, words in the label. Confirmed in source. (This is the one row that lives on *this* screen and it is correctly closed.)

## Lens 1 — Nervous First-Timer ("Would someone who's never planned understand and trust this?")
### Critical
- **The privacy promise is invisible (`Welcome.tsx:450`, `#334155` ≈1.67:1).** Inside the disclaimer block, the clause *"Your data stays private — everything is calculated locally in your browser"* is the strongest reassurance for a nervous first-timer who is about to type their salary and savings into a web page. It is rendered in the lowest-contrast color on the screen — effectively unreadable. The reassurance the whole no-accounts pitch rests on is hidden exactly where anxiety peaks. Bump to `#94a3b8` (≈6.96:1 on page). *Convergent with Row 5 / Lens 3.*
### Improvement
- **The two CTA states may confuse.** The component renders a "Get Started →" button **only if** `onStart` is passed; otherwise it shows a muted "Select Step 1 in the sidebar to begin" pill, and **below either state** always shows "or select a step in the sidebar" at `:186` in `#334155` (also unreadable). If `onStart` IS passed, the user sees both a primary button *and* an unreadable "or select a step in the sidebar" hint — redundant and low-contrast. `[NEEDS-LIVE]` to confirm which branch renders and whether both messages show at once.
- **"Find Your Retirement Number" vs glossary "your number."** The hero (`:118-121`) says "Find Your Retirement Number." The glossary's load-bearing term is **"your number"** (Housel framing) and is used well; the hero capitalizes it as a proper noun ("Retirement Number"), which is fine but slightly more product-y than the personal framing the glossary intends. Minor.

## Lens 2 — Skeptical CFP ("Is the math correct, defensible, and cited?")
### Critical
- None. Welcome performs no calculation. The `4%` ("Proven since 1994") and `25x` ("Portfolio multiplier") stats are the only quantitative claims and both trace to canonical §1/§2 (Bengen 1994; 1/0.04 = 25). "Proven since 1994" is defensible as the Bengen publication date but see Lens 3 for the word "proven."
### Improvement
- **"Battle-tested financial research" (`:131`) + "Proven since 1994" (`:68`)** slightly overstate. Bengen/Trinity is *well-supported historical* analysis, not "proven" — canonical §1 itself marks the bracket edges "confidence: medium" and the 4% anchor "confidence: high," never "proven." A CFP would soften "proven" → "studied" or "tested." Low severity (marketing copy, not a projection), but it is the same false-certainty family the lessons warn about.

## Lens 3 — Trust & Credibility ("Does any label claim more rigor or certainty than the math delivers?")
### Critical
- **Attribution inconsistency in the hero eyebrow (`Welcome.tsx:110`).** It reads *"Based on the Trinity Study · JL Collins · Ramit Sethi."* Problems: (a) **Morgan Housel is missing** though the screen devotes an entire pillar card to him (`:58-64`) and CLAUDE.md names him one of the three intellectual backbones; (b) the list mixes a **methodology** (Trinity Study) with two **authors**, an apples-to-oranges series. A skeptical reader who reads the eyebrow then sees three author cards below notices the eyebrow dropped one. Fix: either list all three authors ("JL Collins · Ramit Sethi · Morgan Housel") or all three frameworks. *This is the screen's headline credibility claim and it is internally inconsistent with its own content.*
### Improvement
- **Pillar framing copy is glossary-clean** — "Conscious Spending" (Sethi), "Simple Investing" (Collins), "Behavioral Wisdom" (Housel) are accurate and non-judgmental; the Sethi insight "Spend extravagantly on what you love. Cut mercilessly on what you don't." matches the canonical Guilt-Free framing. Good. One note: the disclaimer (`:447-449`) recommends "consulting a Certified Financial Planner (CFP)" and says "not personalized financial advice" — exactly the glossary's required stance. Well done.
- **"proven"/"battle-tested"** (see Lens 2) — soft false-certainty in marketing copy. Recommend toning to match canonical's own confidence language.

## Lens 4 — Regression-Across-Screens ("Does the same input produce the same number everywhere, and did this break another view?")
### Critical
- None. Welcome shares no computed value with any other screen, so it cannot diverge from them.
### Improvement
- **Off-token color drift (consistency, not a divergence).** Welcome hardcodes `#8b5cf6` (violet) for the Step 2 / Housel accent at `:18` and `:59`. Violet is **not in canonical §6** at all (§6 has blue/emerald/amber/red only). The same `#8b5cf6` violet appears in Step 1's budget ribbon (`Step1:202,287`) and the Step 5 drawdown series flagged in `step5-summary_v1.md` — so an **undeclared 5th brand hue is now spreading across screens**. Either add violet to canonical §6 with a defined role (it is clearly intentional as the "Step 2 / behavioral" accent) or replace it. Right now every screen invents it independently, which is exactly the canonical-drift the lessons (Pattern 3) warn about. *Convergent with the Step 5 audit's purple finding.*
- **Inline-style architecture means tokens can't govern this screen.** Nearly every color is an inline `style={{ color: '#…' }}` or `rgba(255,255,255,…)`, not a `text-*`/`@theme` class. The `@theme` migration (row 4 fix) cannot reach inline literals, so when canonical colors change, Welcome silently stays old. Not a today-divergence, but it guarantees future drift. Designer call.

## Recommended next actions
1. **Critical — fix the two `#334155` text instances (Row 5 / Lens 1 / Lens 3). [a11y + designer]** `Welcome.tsx:186` and `:450` → `#94a3b8` (or a `text-text-secondary` class). The `:450` privacy clause is the priority — it is the trust payload of the whole landing page. *Convergent (2 lenses + Row 5).*
2. **Critical — fix the hero attribution (Lens 3 / content). [content + cfp]** `Welcome.tsx:110`: make the eyebrow a consistent series and include Housel — e.g. "Built on JL Collins, Ramit Sethi & Morgan Housel" or "Based on the Trinity Study, index-fund investing & behavioral finance." Verify wording against the glossary attribution rule.
3. **Recommended — resolve the undeclared violet `#8b5cf6` (Lens 4 / designer).** Decide once: add it to canonical §6 with a role ("Step 2 / behavioral accent") or replace it everywhere. It is already on ≥3 screens. *Convergent with `step5-summary_v1.md`.*
4. **Recommended — soften "proven" / "battle-tested" (Lens 2 / Lens 3 / content)** to match canonical §1's own confidence language ("studied," "tested over historical data since 1994").
5. **Recommended — add a visible `:focus-visible` style to the CTA button (Row 6 / a11y).** The button restyles on hover via JS but has no explicit keyboard-focus style; confirm the focus ring is visible. `[NEEDS-LIVE]`.
6. **Polish — migrate Welcome's inline color literals to `@theme` tokens (Lens 4 / engineer + designer)** so the screen is governed by canonical §6 and cannot drift on the next palette change.
7. **Polish — reconcile the dual CTA / "or select a step" messaging (Lens 1).** Avoid showing a primary button and a redundant low-contrast sidebar hint simultaneously. `[NEEDS-LIVE]`.

## Residual risk
- **Live behavior was not observed — the single largest gap, and a known limitation of this cold run.** I could not confirm: which CTA branch renders (`onStart` present vs absent), the actual on-screen rendering of the `#334155` text (I infer near-invisible from the computed ~1.67:1, but a global CSS rule could in principle override an inline style — unlikely, since inline styles win specificity), keyboard focus visibility on the custom button, the responsive collapse of the 5-up step grid and 3-up pillar grid at 375px, or whether the radial-gradient hero glow reads well on a real panel. Re-confirm every `[NEEDS-LIVE]` tag and Row 5 severity in the orchestrator's live pass.
- **Contrast ratios were computed analytically, not script-verified** — Bash `node`/`python` execution was denied this session. The luminance formula is deterministic and the `#334155`-on-dark result (~1.67:1, far below every threshold) is not close to any boundary, so the FAIL verdict is robust to rounding; but the exact decimal should be reconfirmed if a borderline call ever hinges on it.
- This audit covers Welcome only. It assumes the downstream screens behave as their own audits describe; the cross-screen violet finding is corroborated by `step5-summary_v1.md` but I did not re-derive the other screens' usages beyond grep-confirming Step 1.
- Per the auditor failure-mode guidance, the Row 5 Critical rests on the computed contrast + the explicit §7 ban (a primary source), not on lens agreement alone.

---
*finplan-auditor v1.0.0 | code-only run (no live observation) | verdict capped at "revise" per cold-run fallback | exemplar: studio/audits/step5-summary_v1.md*
