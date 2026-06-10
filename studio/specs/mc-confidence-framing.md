# Spec: Monte Carlo confidence-zone framing (Option A of the "too-drab downside" review)
# Owner: finplan-cfp + finplan-content + finplan-designer | Created: 2026-06-09 | Status: shipped

## Problem
Preston's review: does the 10th-percentile lower bound paint too drab a picture, and what do strong
products (Facet-class planners, consumer apps) do? Findings (sources verified 2026-06-09):
- The MATH is industry-standard — Empower displays exactly median + p10; Fidelity's headline score is
  computed AT the ~10th-percentile market. Nobody credible shows less downside than we do.
- The FRAMING was harsher than all of them: bare "10th percentile" labels, a "✗ shortfall" stamp,
  a downside line sinking to zero unexplained, no upside cue anywhere on Step 5, and a 73% success
  rate colored amber when professional practice (MoneyGuidePro Confidence Zone) treats 75–90% as
  the target band — with >90% flagged as over-saving (Kitces).
- A real statistical critique exists too — i.i.d. draws ignore mean reversion, so the long-horizon
  p10 runs below the entire post-1927 US record — but that is Option B (block bootstrap), specced
  in canonical §10.8 for the next quant loop, NOT shipped here.

## The change (canonical §10.7 — math untouched, framing upgraded)
1. **Healthy zone 75–90%** — thresholds 80→75 plus a ≥90 "above the zone" message, on Step 4's
   banner (4 brackets + zone teaching) and Step 5's success card (dynamic zone verdict). Row-23
   caveat aligned to the 75 floor.
2. **Plain odds** — "a 1-in-10 rough/strong market" with the percentile in parentheses: Step 4
   legend, tooltip, outcome strip; Step 5 chart copy, Recharts legend, manual legend.
3. **Capability statement** — new engine value `p10DepletionYear`; UI says "9 in 10 outcomes stay
   funded through {y−1}" or "even a 1-in-10 rough market funds all N years." Exact by construction:
   depleted paths stay at $0, so p10 > 0 ⟺ <10% of trials exhausted.
4. **Upside cue** — new engine value `p75AtRetirement`; Step 5 chart paragraph adds "1 in 4
   outcomes reach retirement above $X (today's $ + nominal)". Restores symmetry without re-drawing
   the scale-breaking p90 area (row 12 stands).
5. **Verdict softening** — outcome strip "✗ shortfall" → "short of target" (amber, text-carried);
   "✓ on track" → "✓ clears your number" (glossary term).
6. **Attribution** — Methodology §04 gains "How we display it" + "A known conservatism" paragraphs
   naming MoneyGuidePro, Fidelity, Kitces; §07 source list extended. Also fixed a "(§10)" internal
   canon reference that was leaking into Step 5 UI copy.

## Sources & Assumptions
- **MoneyGuidePro Confidence Zone** — 75–90% probability of success as the professional planning
  target band (advisor documentation / cybermanual MGP Monte Carlo guide; corroborated by advisor
  write-ups, e.g. foolwealth.com). Confidence: high. Basis for the 75/90 thresholds.
- **Fidelity Retirement Score methodology** — headline score computed in a "significantly below
  average market" = 90% confidence level (10% of scenarios perform worse), displayed as a green
  on-track score (nb.fidelity.com "About Your Score"; fidelity.com/planning/retirement/pdf/rqc_methodology.pdf).
  Confidence: high. Basis for the capability-statement framing.
- **Kitces**, "Reframing Retirement Risk As Over- And Under-Spending" (kitces.com). Confidence: high.
  Basis for the >90% over-saving teaching.
- **Empower Retirement Planner** — median + 10th-percentile display precedent (empower.com/tools/retirement-planner;
  investorjunkie review). Confidence: medium (third-party description of the UI). Used only as
  precedent, not as a value source.
- **Assumption — capability statement exactness:** depleted MC paths are floored at $0 and stay
  there, so `p10(year) > 0 ⟺ fewer than 10% of trials exhausted by that year`; "9 in 10 outcomes
  stay funded through {y−1}" is therefore an exact statement of the simulation, not a paraphrase.
- **Assumption — denomination:** the upside cue follows the §2 display convention (today's $
  headline, nominal beside) using `inflationMult` from the engine.
- **Assumption — zone copy is educational, not advice:** zone sentences describe what professional
  planning practice targets, attributed on the Methodology page; they never instruct the user to
  save less (compliance stance per glossary "educational, not personalized financial advice").
- **i.i.d. conservatism quantification** (Methodology "known conservatism" note): at μ=7%, σ=16%,
  the 25-yr lognormal p10 annualizes to ≈1.9% nominal (moment-matched params per canonical §10.1);
  worst realized 25-yr US stretches annualized ≈5–6% (macrotrends S&P data, canonical §9), with the
  survivorship caveat (Japan post-1989). Confidence: high on the model arithmetic, medium on the
  historical comparison (index-reconstruction differences). Drives §10.8 (Option B), not shipped here.

## Engine additions (Pattern 1 — computed once, in financialPlan.ts)
- `p75AtRetirement` = pct(final accumulation year, 0.75) from the existing seeded MC arrays.
- `p10DepletionYear` = first retirement-cone year with p10 ≤ 0, else null.
No existing output changed; all locked reference values intact.

## Acceptance (verified)
- [x] canonical.md §10.7 ratified + §10.8 (Option B) specced before code (Pattern 3); glossary rows added.
- [x] Lint clean, **52/52 tests** (3 new: p50 ≤ p75 ≤ p90; textbook-case depletion year exists in the
      retirement window with exact boundary; over-funded plan → null + ≥99% success), build green.
- [x] No banned glossary constructions in the new copy; status never color-alone; figures monospace.
- [~] Live screenshots blocked by the session's headless hydration stall — copy logic is
      string-templated from tested store values; renders in a real browser.

## Out of scope (deliberate)
- Option B (block-bootstrap sampler) — specced in canonical §10.8 with acceptance criteria; a future
  quant loop re-locks §10.4 reference values when it lands.
- Moving any percentile or σ — rejected as Pattern 2 in reverse.
