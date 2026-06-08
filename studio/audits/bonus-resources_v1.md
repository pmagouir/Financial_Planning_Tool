# Audit: Bonus — Resources (Book Library) v1
# Auditor: finplan-auditor | Date: 2026-06-08

## Verdict
**Ship (pending live confirm).** This is the cleanest screen in the studio so far. It is a static, read-only bibliography — it computes nothing, reads no store, writes no store — so the entire Pattern-1/Pattern-5 class of defects is structurally absent. Every book attribution is factually correct, the methodology card's three framework citations match canonical §1/§9 verbatim, the prose is free of glossary-banned constructions, it carries the sanctioned estimate disclaimer, and it uses only canonical tokens (no banned colors, no dead `shiny` classes). 

The only things keeping it from an unqualified pass are **two small a11y/labeling polish items** (the seven "View on Amazon" links are visually identical and share the same accessible name, so a screen-reader user hears "View on Amazon" seven times with no book context; and the methodology disclaimer uses "estimates, **not guarantees**" — the sanctioned words, but in the "X, not Y" shape the glossary flags for prose). Neither is stop-ship. Verdict capped at "ship pending live" only because the orchestrator owns the single live pass and I could not confirm rendering / focus order on screen.

**Composite: 8.5/10.**

> **Scope limitation:** Per the orchestrator's instruction I did **not** run Claude_Preview or a dev server. Findings are code-derived; on-screen items tagged `[NEEDS-LIVE]`. Per the cold-run fallback, a screen this clean would normally clear "ship," but the live-pass cap holds it at "ship pending live."

## Evidence base
- Files read in full: `bonus/Resources.tsx`, `ui/FintechCard.tsx`, `styles/global.css`, `stores/financialPlan.ts` (for canonical cross-ref), all four `.learn` files, `audits/TEMPLATE.md`, `audits/step5-summary_v1.md`.
- Wiring confirmed: `NavigationTabs.tsx:11,116` imports and renders `<Resources />` for the `resources` tab (`:35` "Bonus: Resources") — a **live screen**.
- Static checks (grep): **0** `shiny` refs, **0** banned hex (`#64748b`/`#475569`), **0** inline hex of any kind, **0** glossary-banned construction in the prose (manually re-read all copy). Disclaimer present at `Resources.tsx:88`.
- Theme note (corrects stale step5 audit): tokens resolve via the `global.css:8-25` `@theme` block (row 4 FIXED), and `FintechCard variant` is wired (`FintechCard.tsx:12-17`), so the per-card colored top borders actually render.
- Attribution facts checked against general knowledge (all seven are well-established works); methodology citations checked against canonical §1 and §9.
- **Live behavior: NOT observed** (orchestrator owns the live pass).

## errors.md regression scan
All 17 rows stated (total, not selective).
- **Row 1 (false-rigor "probability cone"):** CLEAN. No probability/Monte-Carlo/confidence language. The only quantitative claim is the disclaimer, which is honest.
- **Row 2 (multi-engine divergence):** CLEAN / N/A. The screen performs **no** calculation and reads no store. Nothing to diverge.
- **Row 3 (silent state loss):** CLEAN / N/A. Stateless, read-only; nothing to persist.
- **Row 4 (canonical drift — `*-shiny-*` / dead theme):** CLEAN. No `shiny` refs; all classes (`text-text-primary`, `text-text-secondary`, `bg-background-paper`, `bg-background-subtle`, `border-white/10`, `bg-white/5`) resolve under the `@theme` block + Tailwind defaults. `FintechCard variant` per book is wired and paints a top border.
- **Row 5 (contrast — `#64748b`/`#475569` text):** CLEAN. Body copy is `text-text-secondary` (#94a3b8 — 5.71:1 on cards, AA pass); headings/insights are `text-text-primary` (#f8fafc — AAA). The `bg-white/5` insight/disclaimer panel (`:87`) keeps text on a near-card background, so contrast is preserved. No banned color carries text. `[NEEDS-LIVE]` to confirm the italic insight text on the translucent panel still clears AA on screen (white/5 over the glass card should, but measure it).
- **Row 6 (label association / ARIA):** **PARTIAL (polish).** No form inputs, so the label-association defect row 6 cites does not apply. But the seven "View on Amazon" anchors (`:116-136`) are link text + a decorative SVG with no `aria-hidden`/`title` and no per-book accessible-name distinction — a screen-reader user gets seven identical "View on Amazon" links with no book title in the name. WCAG 2.4.4 (Link Purpose). Polish, not Critical. The decorative SVG (`:123-135`) should also be `aria-hidden="true"`.
- **Row 7 (monthlyContrib overwrite):** N/A. Sets no inputs.
- **Row 8 (dead r==g branch):** N/A. No engine code.
- **Row 9 (flat-CPI passive income):** N/A. No financial model.
- **Row 10 (reduced-motion animation stall):** CLEAN. No Framer Motion gating; the only motion is CSS `hover:shadow-xl` / `transition-shadow` (`:96`), covered by the `global.css:97-106` reduced-motion reset. Content never depends on an animation frame.
- **Row 11 (gross-vs-net drawdown):** N/A.
- **Row 12 (mean-only net-worth chart):** N/A. No chart.
- **Row 13 (mean-vs-median headline):** N/A. No metrics.
- **Row 14 (scary number without driver):** N/A. No numbers beyond the disclaimer.
- **Row 15 (nominal-vs-today's-dollars):** N/A. No figures.
- **Row 16 (zero-target empty state):** N/A. Static content always renders; no input-derived empty state.
- **Row 17 (malformed trust stat):** N/A. Welcome-screen-specific.

## Lens 1 — Nervous First-Timer ("Would someone who's never planned understand and trust this?")
### Critical
- None.
### Improvement
- **Strong for a first-timer.** Each card leads with a plain-language "key insight," the methodology card explains *why* the tool works the way it does and *whose* ideas it rests on, and the disclaimer is present and readable. This is the screen most likely to make a nervous user trust the rest of the app.
- **Minor:** the seven books are presented as a flat grid with no "start here" guidance. A first-timer doesn't know whether to read Housel or Collins first. The roadmap already lists a "which book should I read next?" recommender — until then, a one-line "new to this? start with The Psychology of Money or The Simple Path to Wealth" would reduce choice paralysis. Optional.
- **Minor:** "View on Amazon" sends users off-site to a commercial retailer with no affiliate disclosure either way. Not a defect (no affiliate tag is present in the URLs — checked, plain `/dp/` links), but if affiliate codes are ever added, an FTC disclosure becomes mandatory. Flagging pre-emptively.

## Lens 2 — Skeptical CFP ("Is the math correct, defensible, and cited?")
### Critical
- None — there is no math.
### Findings (attribution accuracy, the CFP-relevant check here)
- **All seven author/title attributions are correct:**
  - The Psychology of Money — Morgan Housel ✓
  - The Millionaire Next Door — Thomas J. Stanley & William D. Danko ✓
  - The Simple Path to Wealth — JL Collins ✓
  - I Will Teach You To Be Rich — Ramit Sethi ✓
  - Your Money or Your Life — Vicki Robin & Joe Dominguez ✓ (Robin is the lead/living author; correct)
  - The Bogleheads' Guide to Investing — Taylor Larimore, Mel Lindauer, Michael LeBoeuf ✓
  - A Random Walk Down Wall Street — Burton Malkiel ✓
- **Methodology card citations match canonical exactly** (`:83-85`): "The Trinity Study (Bengen 1994, Cooley et al. 1998)" is verbatim canonical §1/§9; "Ramit Sethi's Conscious Spending Plan — Fixed / Investments / Guilt-Free" matches the glossary's load-bearing bucket names; "JL Collins' Simple Path to Wealth — index fund philosophy and FI/RE" matches §9. No attribution error.
- **The disclaimer is accurate and sanctioned** (`:88`): "All projections assume constant returns and are educational estimates, not guarantees." Canonical §8 + glossary explicitly allow "estimate" and "educational, not personalized financial advice." (See Lens 3 for the one prose-shape nit.)
### Improvement
- **Slight scope mismatch in the methodology card.** It says the tool "synthesizes **three** proven frameworks" and lists Trinity / Sethi / Collins — but CLAUDE.md's vision names **Housel** as the third pillar (behavioral wisdom), not the Trinity Study, and Collins+Bogleheads are arguably one pillar. The card's "three frameworks" is defensible (it's describing the *calculation* backbone) but is in mild tension with the product's own stated "Sethi / Collins / Housel" triad. A content pass could reconcile the framing. Not a factual error.

## Lens 3 — Trust & Credibility ("Does any label claim more rigor or certainty than the math delivers?")
### Critical
- None.
### Improvement
- **Disclaimer uses an "X, not Y" shape** (`:88` "…educational estimates, **not guarantees**"). The *words* are the canonical/glossary-sanctioned ones ("estimate," "not a guarantee"), but the glossary's banned-constructions list (inherited from preston-writing) flags the "X, not Y" pattern for prose the Content agent writes. This is borderline — the phrase communicates the right thing and the offending shape is mild. Content's call; a clean rewrite would be "…educational estimates and are not guaranteed." Polish only.
- **Book "key insights" are paraphrases, not quotes, but are rendered in italic quotation marks** (`:110-111` `"{book.keyInsight}"`). e.g. the Housel line ("Wealth is what you don't see…") closely tracks the book's actual language and is fine, but a few (Malkiel, Bogleheads) are the *tool's* summary dressed as a quotation. Low risk — they are accurate characterizations — but presenting a paraphrase inside quote marks slightly overstates fidelity. Consider dropping the quote marks or labeling them "the big idea." Polish.
- No false-certainty, no "will," no "guarantee," no inflated-rigor language anywhere. Trust posture is otherwise excellent.

## Lens 4 — Regression-Across-Screens ("Does the same input produce the same number everywhere, and did this break another view?")
### Critical
- None. The screen produces no number and reads no store, so it cannot diverge from or break any other view. It is the inert end of the app.
### Improvement
- **Canonical §9 names this file as the source of truth** ("The seven-book library in `src/components/bonus/Resources.tsx` is the curated starting bibliography"). So the seven-book set IS canonical by reference — there is no external list to drift from. Worth noting the inverse risk: if canonical ever specifies a different curated set, *this file* is what must change. Today they agree by definition. CLEAN.

## Recommended next actions
1. **Recommended — give each "View on Amazon" link a distinct accessible name and hide the decorative SVG. [a11y]** `:116-136`: add `aria-label={`View ${book.title} on Amazon`}` (or visually-hidden book-title text) and `aria-hidden="true"` on the SVG. Fixes WCAG 2.4.4 link-purpose for the seven identical links.
2. **Polish — rephrase the disclaimer out of the "X, not Y" shape. [content]** `:88` → e.g. "All projections assume constant returns and are educational estimates that are not guaranteed." Keeps the sanctioned meaning, drops the flagged construction.
3. **Polish — reconsider quotation marks on paraphrased "key insights." [content]** `:110-111`: either source true quotes or drop the quote marks / relabel as "the big idea," so a summary isn't presented as a verbatim quotation.
4. **Polish — reconcile "three frameworks" framing with the product's Sethi/Collins/Housel triad. [content]** `:80-86`: the methodology card lists Trinity/Sethi/Collins; the product vision pillars are Sethi/Collins/Housel. Align the framing (Housel's behavioral pillar is currently invisible on this card).
5. **Optional — add a "start here" hint** for first-timers facing seven choices (Lens 1), pending the roadmap's book recommender.

## Residual risk
- **Live behavior not observed** (orchestrator owns the live pass). Unconfirmed on-screen: the italic insight text's contrast on the translucent `bg-white/5` panel (`:87,110`) — should pass but measure it; focus order and the screen-reader experience of the seven links; the hover `shadow-xl` under reduced-motion; responsive layout of the 3-col grid at 375px. All tagged `[NEEDS-LIVE]`.
- Attribution facts were verified from general knowledge, not from each book's title page this session; all seven are canonical, widely-known works and the citations match the studio's own canonical §9, so confidence is high, but a Content pass could spot-confirm author spellings/editions if desired.
- This audit covers the Resources screen only. It assumes the screen remains static; wiring any computed/store-backed content into it later would reopen rows 2/3/16 for re-audit.

---
*finplan-auditor v1.1.0 | code-only run (orchestrator owns live pass) | screen: bonus/Resources.tsx*
