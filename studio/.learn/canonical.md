# Canonical — Financial Planning Tool Studio
# Single source of truth for every formula, reference value, and design token in the app.
# If a formula or number is not here, it does not ship. If this file conflicts with the code, the code is wrong — fix the code.
# Every finance value below was independently recomputed in WolframAlpha before being locked. Every contrast ratio was computed by the WCAG 2.2 luminance formula.
# Engine under governance: src/stores/financialPlan.ts

---

## 0. The single-engine rule (read first)

The app currently computes a portfolio projection **three different ways** and they disagree for identical inputs (see `.learn/errors.md` row 2):

1. `financialPlan.ts:154` `projectedPortfolio` — annual contribution model (12× the monthly amount added once per year, compounded annually).
2. `financialPlan.ts:240` `netWorthData` — intra-year monthly compounding of contributions.
3. `Step4_InvestmentPath.tsx` — its own component-local monthly model.

**Rule going forward: there is exactly ONE projection engine, it lives in `financialPlan.ts`, and every screen reads from it.** No component recomputes a projection. The Step 4 cone, the Step 5 net-worth chart, and `projectedPortfolio` must all derive from the same function. The CFP ratifies the model; the Engineer implements the single source; QA locks its output as a reference value. Until that refactor lands, the contribution-projection reference value below is marked PROVISIONAL.

---

## 1. Withdrawal rate (Trinity Study)

Auto-selected by retirement duration unless the user sets a custom rate (`financialPlan.ts:94-105`):

| Retirement duration | Safe withdrawal rate |
|---|---|
| ≥ 35 years | 3.5% |
| 25–34 years | 4.0% (the "4% rule") |
| 15–24 years | 4.5% |
| < 15 years | 5.0% |

**Source:** Bengen, W.P. (1994), "Determining Withdrawal Rates Using Historical Data," *Journal of Financial Planning* 7(4):171-180; Cooley, Hubbard & Walz (1998), "Retirement Savings: Choosing a Withdrawal Rate That Is Sustainable," *AAII Journal* (the Trinity Study). **Confidence: high** for the 4% / 30-year anchor. **Confidence: medium** for the exact bracket cutoffs — Bengen's work centers on 30-year horizons; the ≥35→3.5% and <15→5.0% extensions are the tool's own interpolation. CFP to validate or refine the bracket edges and cite the specific basis for each.

Edge note: the bracket is a step function, so a 34-year horizon gets 4.0% and a 35-year horizon gets 3.5% (a cliff). Flagged for CFP review; a smoother curve may be more defensible.

## 2. The Number (required portfolio)

```
inflationMult       = (1 + inflation/100) ^ yearsToRet
annualRetSpend      = Σ(11 retirement spending categories) × 12
futureAnnualNeed    = annualRetSpend × inflationMult
futureIncome        = (socialSecurity + pension + otherIncome) × inflationMult
netNeed             = max(0, futureAnnualNeed − futureIncome)
requiredPortfolio   = netNeed / withdrawalRate
```
Source for `requiredPortfolio = annualNeed / withdrawalRate`: the 4% rule restated as the 25× rule (1 / 0.04 = 25). **Confidence: high.**

**Passive-income COLA treatment — RATIFIED 2026-06-07 (resolves `.learn/errors.md` row 9):**
- **Social Security → grows with CPI (COLA).** SS COLA is CPI-indexed (CPI-W), so inflating it at the same CPI multiplier is defensible — SS keeps its real value. (Source: SSA COLA methodology.) Shown **pre-tax** (SS is partially taxable; see tax note).
- **Pension + Other income → FIXED NOMINAL (no COLA).** Most private pensions have no cost-of-living adjustment, so they are held flat in nominal terms — their real value erodes over retirement. This is a **deliberately conservative** default (no per-pension toggle; stated plainly in the UI). It is the material correction: a flat pension loses ~half its real value over 25 years at 3%.
- **`requiredPortfolio` is unchanged** — still the year-1 net need (`netNeed`, with all income at its retirement-year value) ÷ withdrawal rate, the standard 25× heuristic. The COLA differentiation lives in the **drawdown**, where the portfolio's annual draw grows *faster* than CPI as the pension erodes (so the Monte Carlo success rate, not `requiredPortfolio`, carries the honest consequence).
- **Drawdown (per year t of retirement):** `withdrawal_t = max(0, inflatingNet × (1+inflation)^(t−1) − flatIncome)`, where `inflatingNet = futureAnnualNeed − ssRet` (spending minus COLA'd SS, both grow with CPI) and `flatIncome = (pension + other) × inflationMult` (held flat). Applies to BOTH the deterministic net-worth path and the §10 Monte Carlo. At t=1 this equals `netNeed` (consistent with `requiredPortfolio`).

**Tax — caveated, NOT modeled (ratified 2026-06-07).** All figures are **pre-tax**. SS is partially taxable (up to 85% via provisional income) and traditional 401(k)/IRA withdrawals are ordinary income, so real spendable income is lower than shown. A full tax engine (brackets, account types, provisional income, RMDs) is a separate future loop — a half-modeled version would be its own false-rigor risk. State the caveat; do not pretend to model it.

**Display convention — RATIFIED 2026-06-07 (resolves `.learn/errors.md` row 15).** The engine computes in **nominal future dollars** (so the projected-vs-required comparison and the §10 success rate are internally consistent). But headline figures (Required, Projected, Surplus, Monthly Need) are **displayed in today's dollars** (nominal ÷ `inflationMult`) with the nominal "≈ $X in {retYear}" shown beside them. Rationale: a "what you need" figure shown only in nominal dollars *decreases* the earlier you retire (less inflation compounded to a nearer date), which is backwards and erodes trust. In today's dollars it is stable — driven by spending and retirement length, not the calendar. Charts remain nominal and are labeled "future dollars." Both denominations are always visible.

## 3. Portfolio projection

```
m           = (1 + annualReturn/100) ^ (1/12) - 1   [effective monthly rate; (1+m)^12 = 1 + annualReturn/100]
fvPortfolio = currentPortfolio × (1 + m) ^ (12 × yearsToRet)     [lump sum — LOCKED]
fvContrib   = Σ_{k=1..12×yearsContributing} monthlyContrib × (1 + contribIncrease/100)^floor((k-1)/12) × (1 + m)^(monthsToRet - k)
              stopping at contribStopYear                                 [contributions end-of-month, annual step-up, stop at contribStopYear — RATIFIED & LOCKED 2026-06-06]
projectedPortfolio = fvPortfolio + fvContrib
```
Both terms compound at the same effective monthly rate `m`, so the engine is one month-by-month simulation. **RATIFIED 2026-06-06 (finplan-cfp):** the stated return is an effective annual rate (so `(1+m)^12 = 1+r` and "7%" means a true 7% annual), contributions post end-of-month, raises step up once per year. The lump-sum term is unchanged and stays locked at $542,743.26. Standard return rate chips: Conservative 5% / Moderate 7% / Aggressive 9% (`Step4_InvestmentPath.tsx`). Source for the simple-index-fund return premise: Collins, *The Simple Path to Wealth*; Bogleheads. **Confidence: high** as an educational assumption; these are nominal long-run equity-heavy estimates, not guarantees.

## 4. Post-retirement drawdown

```
retirementReturnRate     = max(0.04, annualReturn × 0.85)   [RATIFIED 2026-06-07 — realistic 60/40 return]
annualWithdrawal(year)   = futureAnnualNeed × (1 + inflation/100) ^ (year − 1)
netWorth(year)           = max(0, netWorth(year−1) × (1 + retirementReturnRate) − annualWithdrawal(year))
```
Premise: conservative reallocation toward a ~60/40 mix in retirement (`financialPlan.ts`). **RATIFIED 2026-06-07 (Preston's call):** the multiplier changed `0.6 → 0.85` so the default 7% accumulation maps to ~5.95% nominal (~2.9% real after 3% inflation) — a realistic 60/40 retirement return, not the old ~4.2% which was a *deterministic-depletion artifact* far below any real expected return. The `4%` floor remains for very low return assumptions. **Confidence: medium** (educational). The deterministic path here is the smooth mean; the **sequence-of-returns risk and volatility now live in the Monte Carlo (§10)** — this smooth line is explicitly the "expected/mean" view, shown alongside the §10 percentile cone, never as the only story.

## 5. Reference values (LOCKED — QA asserts against these)

Independently computed in WolframAlpha 2026-06-06. QA writes one test per row. Any code path that produces a different number for these inputs is a regression.

| Quantity | Inputs | Value | Status |
|---|---|---|---|
| Inflation multiplier | 3%, 25 yr | **2.093778** | LOCKED |
| 1.07^25 | — | **5.427433** | LOCKED |
| FV lump sum | PV $100,000, 7%, 25 yr | **$542,743.26** | LOCKED |
| Future annual need | $60,000/yr today, 3%, 25 yr | **$125,626.68** | LOCKED |
| Future SS income | $18,000/yr today, 3%, 25 yr | **$37,688.00** | LOCKED |
| Required portfolio | need above, SS above, 4% WR | **$2,198,466.83** | LOCKED |
| 25× rule | $40,000 × 25 | **$1,000,000** | LOCKED |
| 4% of $1M | — | **$40,000** | LOCKED |
| FV contributions (canonical monthly model) | $1,000/mo, g=3%, r=7%, 25 yr | **$1,031,790.90** | LOCKED 2026-06-06 — effective-monthly simulation, end-of-month |
| projectedPortfolio (canonical) | the two rows above | **$1,574,534.16** | LOCKED 2026-06-06 |

## 6. Design tokens (the @theme system)

The palette is already specified in `tailwind.config.mjs`, but the project runs **Tailwind v4**, which does not auto-load the JS config. `global.css` has `@import "tailwindcss"` with no `@theme` block and no `@config` directive, so these tokens may not be active, and every `*-shiny-*` utility referenced in components resolves to nothing (`.learn/errors.md` row 4). Engineer + Designer task: migrate this palette into an `@theme` block in `global.css` (the v4 way) and replace all `*-shiny-*` references.

| Token | Hex | Role |
|---|---|---|
| `background.DEFAULT` | `#0f172a` | Slate 900 — main background |
| `background.paper` | `#1e293b` | Slate 800 — cards |
| `background.subtle` | `#334155` | Slate 700 — borders, input backgrounds |
| `text.primary` | `#f8fafc` | Slate 50 — body and headings |
| `text.secondary` | `#94a3b8` | Slate 400 — secondary text |
| `text.muted` | `#64748b` | Slate 500 — large/decorative text ONLY (see §7) |
| `accent.primary` | `#3b82f6` | Electric blue — CTAs, highlights |
| `accent.success` | `#10b981` | Emerald — positive values, on track |
| `accent.warning` | `#f59e0b` | Amber — approaching limits |
| `accent.danger` | `#ef4444` | Red — over budget, shortfall |
| `accent.retire` (violet) | `#8b5cf6` | **Secondary / data-viz accent — RATIFIED 2026-06-08 (designer, Wave 3).** The retirement / future-phase series and the Guilt-Free bucket, used consistently across Welcome, Step 1, Step 2, Step 5. It is the app's established "future you" hue, distinct from the four functional accents. **Charts and large accents only:** 4.22:1 on bg / 3.45:1 on cards passes AA for large text (≥3:1) but FAILS AA for normal text (§7). |
| `accent.retire.text` (violet) | `#a78bfa` | The AA-safe body-size violet — 6.56:1 on bg / 5.38:1 on cards. Use this, **not** `#8b5cf6`, whenever violet carries normal-size text. |

`#cbd5e1` (Slate 300) is an acceptable chart-axis / legend / secondary-label mid-tone (12.02:1 on bg, 9.85:1 on cards — passes §7); it sits between `text.primary` and `text.secondary` and is documented, not a drift violation. The off-canonical status hexes `#22c55e` (use `accent.success` `#10b981`) and `#f97316` (use `accent.warning` `#f59e0b` or `accent.danger` `#ef4444`) are NOT canonical — they pass contrast but break §6 and must be swapped on the standard glass cards.

**Lighter accent tints — RATIFIED 2026-06-08 (designer, Wave 3).** A lighter tint of an accent (`#34d399` emerald-400, `#fbbf24` amber-400, `#93c5fd`/`#60a5fa` blue-300/400, `#6ee7b7` emerald-300) is permitted **only** as text on a *same-hue tinted panel* (e.g. a green number on a `rgba(16,185,129,0.07)` panel), where the base accent would under-contrast against the tint. On the standard `#1e293b` glass cards, use the base accent. This is why `#34d399`/`#fbbf24` are correct on Step 4's tinted On-Track / Action panels but `#22c55e` is wrong on Step 5's glass MetricCards.

Type: Inter (sans). All financial numbers render in monospace (UI/UX standing rule). Motion is subtle; respect `prefers-reduced-motion`.

## 7. Contrast palette (LOCKED — computed, WCAG 2.2)

Ratios computed by the WCAG relative-luminance formula 2026-06-06. AA thresholds: **4.5:1** normal text, **3:1** large text (≥18.66px bold or ≥24px). AAA: 7:1.

| Foreground | On background | On cards (`#1e293b`) | Verdict |
|---|---|---|---|
| `#f8fafc` primary | 17.06:1 | — | Pass AAA. Use freely. |
| `#94a3b8` secondary | 6.96:1 | 5.71:1 | Pass AA (both). Smallest safe body text. |
| `#10b981` / `#f59e0b` accents | 7.04 / 8.31:1 | — | Pass AA. |
| `#3b82f6` / `#ef4444` accents | 4.85 / 4.74:1 | — | Pass AA normal (margin is thin — do not darken). |
| `#8b5cf6` violet | 4.22:1 | 3.45:1 | Pass AA **large text only** (≥3:1). **FAIL AA normal text.** Charts / large accents — for body-size violet use `#a78bfa`. |
| `#a78bfa` violet (light) | 6.56:1 | 5.38:1 | Pass AA (both). The body-size violet. |
| `#64748b` muted | 3.75:1 | 3.07:1 | **FAIL AA for body text.** Large text only. |
| `#475569` | 2.36:1 | — | **FAIL all.** Banned for text. Borders/decoration only. |
| `#334155` (Slate 700) | 1.72:1 | — | **FAIL all.** Banned for text (it is `background.subtle`). Borders/decoration only. (Caught carrying text on Welcome, Wave 3 — errors.md row 18.) |

Rules: body text uses `#94a3b8` or lighter. `#64748b` is permitted only for large text. `#475569` and `#334155` and below never carry text. Body-size violet uses `#a78bfa`, not `#8b5cf6`. White at reduced opacity (`rgba(255,255,255,α)`) is text only when the blended ratio clears §7 — `α≤0.45` over the dark bg computes below AA (≈4.2:1 and down), so use `#94a3b8` instead. Status must never be conveyed by color alone — pair every red/green/amber signal with text or an icon.

## 8. Honest-labeling rules (credibility)

- The Step 4 "Probability Cone" is **three deterministic lines** (base, base−2%, base+2%), not a stochastic simulation (`.learn/errors.md` row 1). Until the Quant agent ships a real Monte Carlo with a success probability, it may not be called a "probability cone," "confidence interval," or anything implying a distribution. Allowed framing: "scenario range" or "optimistic / expected / cautious paths." See `.learn/glossary.md`.
- Every projection is labeled an estimate. Never imply certainty.
- No personalized investment advice. Educational framing only.
- No category is labeled "bad spending" (Ramit Sethi framing).

## 9. Sources

- Bengen (1994), *Journal of Financial Planning* — the 4% rule.
- Cooley, Hubbard & Walz (1998) — the Trinity Study.
- Collins, *The Simple Path to Wealth* — index-fund return premise, simplicity.
- Sethi, *I Will Teach You To Be Rich* — three-bucket spending structure, non-judgmental framing.
- Housel, *The Psychology of Money* — behavior over math, anti-abandonment (persistence).
- Bogleheads wiki — SWR and variable withdrawal.
- IRS Pub 590-B (account taxation, RMDs), Pub 915 (SS taxation); SSA COLA history — for the Quant agent's tax/COLA work.
- W3C WCAG 2.2 — contrast (1.4.3, 1.4.6).
- The seven-book library in `src/components/bonus/Resources.tsx` is the curated starting bibliography.
- Volatility / capital-market assumptions (Monte Carlo, §10): macrotrends S&P 500 annual returns 1927–2026; NYU Stern V-Lab SPX GARCH volatility; CFA Institute, *The Performance of the 60/40 Portfolio* (2025).

---

## 10. Monte Carlo simulation (the stochastic layer — finplan-quant)

Purpose: replace the deterministic ±2% "scenario range" (`.learn/errors.md` row 1) with a real probability cone and a stated success probability, and give the drawdown genuine sequence-of-returns risk — the gap §4 flags. **Until this engine ships, "probability" / "confidence interval" / "Monte Carlo" language stays banned (§8, glossary).**

### 10.1 Return model — lognormal, moment-matched
Annual gross return `G = 1 + r` is drawn from a lognormal, so a draw can never fall below −100%:
```
Given target arithmetic mean M = 1 + μ and volatility σ (variance V = σ²):
  s² = ln(1 + V / M²)      [log-variance]
  ν  = ln(M) − s²/2        [log-mean]
  G  = exp( Normal(ν, s) )
```
Exact moment-matching: E[G] = exp(ν + s²/2) = M and Var[G] = (e^{s²} − 1)·e^{2ν+s²} = V. **Validated in WolframAlpha 2026-06-07:** μ=5%, σ=10% → Mean[G]=1.05, SD[G]=0.10 to machine precision.

### 10.2 Parameters (sourced — Confidence: medium, educational not guarantees)
| Phase | Mean μ | Volatility σ | Basis |
|---|---|---|---|
| Accumulation | user `annualReturn` (default 7%) | **0.16** | S&P 500 long-run annualized σ ≈ 18% (1926–2025), recent ≈ 17%; trimmed to 16% for a diversified equity-heavy index paired with the conservative 7% mean |
| Retirement | `max(0.04, annualReturn×0.85)` (§4, ratified 2026-06-07) | **0.10** | 60/40 historical σ ≈ 9.5–11%, consistent with §4's reallocation |

These miss fat tails, regime changes, and serial correlation — disclose, never imply otherwise.

### 10.3 Algorithm
- **Seeded** PRNG (mulberry32) seeded deterministically from the inputs → identical inputs give identical bands and success rate (reproducible, testable, no render flicker). Reproducibility is correctness for a sampled claim.
- **N = 1,000 trials** (stable percentiles; MC standard error on a 50–95% rate at N=1000 ≈ ±1.5pp).
- **Accumulation:** each year grow the balance by a sampled `G`, then add that year's contributions (stepped up by `contribIncrease`, stopping at `contribStopYear`).
- **Drawdown:** each retirement year **first** apply a sampled `G`, **then** subtract the inflation-adjusted withdrawal — in that order, so a bad early sequence permanently impairs the portfolio (**sequence-of-returns risk**).
- **Success** = balance > 0 through the entire `retDuration`. **Success probability** = fraction of the N trials that succeed.
- **Percentile cone** = 10th / 50th / 90th percentile of balance across trials at each year. The median (p50) **sits below** the deterministic mean path (§3) due to lognormal skew — show both; do not reconcile them.

### 10.4 Reference values
| Quantity | Inputs | Value | Status |
|---|---|---|---|
| Moment-match (μ=5.95%, σ=10%) | — | Mean 1.0595, SD 0.10 | **LOCKED** (Wolfram 2026-06-07) |
| Accumulation bands | $100k start; $12k/yr × (1.03)^(y−1); 25 yr; μ 7%, σ 16% | p10 ≈ $0.69M, **median ≈ $1.30M**, p90 ≈ $2.68M, mean ≈ $1.54M | REFERENCE (Wolfram 10k). Median **< mean** ($1.30M < $1.54M) and MC mean ≈ deterministic $1.574M (§5) ✓ |
| Drawdown success rate | $1,000,000; $40,000 × (1.03)^(y−1); 30 yr; μ_ret 5.95%, σ_ret 10% | ≈ **73%** (Wolfram, 10k trials) | REFERENCE ground-truth — QA locks the seeded in-app value (N=1000, mulberry32) within ±~2pp |

**FINDING — RESOLVED 2026-06-07 (Preston ratified "realistic real return").** §4's retirement multiplier moved `0.6 → 0.85` (~5.95% nominal / ~2.9% real). The textbook "$1M / 4% / 30-yr" plan now simulates at ~73% success — credible for full-COLA withdrawals with sequence-of-returns risk, and no longer the misleadingly-pessimistic 57% the old deterministic-depletion rate produced. The number is reported honestly; it was **not** tuned to hit a comforting target. This unlocks "probability" language (§10.5) once the engine ships.

### 10.5 Honest labeling (extends §8, once shipped)
Allowed: "probability," "X% of simulations succeed," "10th–90th percentile range" — always paired with the assumptions and an estimate disclaimer. Still banned: "guarantee," "ensures," and any implication the model captures crashes/fat tails it does not.

### 10.6 Headline projection = the median (not the mean) — ratified 2026-06-07
The user-facing **"Projected Portfolio," surplus/shortfall, progress-to-target, and additional-needed** all read the Monte Carlo **median** (`medianPortfolio`, `medianGap = medianPortfolio − requiredPortfolio`), matching the net-worth chart's median line and the success probability — one number, one story (Pattern 1). The deterministic `projectedPortfolio` (§3/§5) is the engine's mean compounding result and is **retained** (single-engine guard + LOCKED reference) but **not headlined**: returns are right-skewed, so the mean exceeds the median and headlining the mean overstates the typical outcome (`.learn/errors.md` row 13). The net-worth chart shows the median path + the 10th-percentile downside line; the explosive upper tail is reported via the success rate, not drawn.

---

## Update protocol

1. Update this file FIRST when any formula, reference value, or token changes.
2. Re-run the WolframAlpha validation for any changed finance value; paste the new locked value with its date.
3. Update the QA reference-value fixtures to match.
4. Log the change in `.learn/errors.md` with date and reason.
5. Provisional values get re-locked (not silently promoted) once the underlying decision is ratified.

---

*Canonical v1.0 | 2026-06-06 | Single source of truth | Consumed by: all finplan-* skills. Finance values validated in WolframAlpha; contrast computed by WCAG 2.2 luminance formula.*
