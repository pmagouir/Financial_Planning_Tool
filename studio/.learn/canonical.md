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

**Open assumption flag (CFP + Quant):** passive income (SS, pension, other) is inflated by the *same* CPI multiplier as spending (`financialPlan.ts:113`). Social Security has its own COLA and is partially taxable; many pensions are not inflation-adjusted at all. Inflating all passive income at full CPI likely **overstates** future income and therefore **understates** the required portfolio. Documented simplification, currently optimistic. Do not present as conservative.

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
retirementReturnRate     = max(0.04, annualReturn × 0.6)
annualWithdrawal(year)   = futureAnnualNeed × (1 + inflation/100) ^ (year − 1)
netWorth(year)           = max(0, netWorth(year−1) × (1 + retirementReturnRate) − annualWithdrawal(year))
```
Premise: conservative reallocation toward bonds in retirement (`financialPlan.ts:261`). **Confidence: medium.** The `0.6×` haircut and `4%` floor are reasonable but un-sourced heuristics — CFP to attach a basis or replace with an age-based glide path. This model has **no sequence-of-returns risk and no volatility** — depletion is smooth, which hides the single biggest real-world failure mode of the 4% rule. The Quant agent owns adding stochastic drawdown in Phase 2.

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

Type: Inter (sans). All financial numbers render in monospace (UI/UX standing rule). Motion is subtle; respect `prefers-reduced-motion`.

## 7. Contrast palette (LOCKED — computed, WCAG 2.2)

Ratios computed by the WCAG relative-luminance formula 2026-06-06. AA thresholds: **4.5:1** normal text, **3:1** large text (≥18.66px bold or ≥24px). AAA: 7:1.

| Foreground | On background | On cards (`#1e293b`) | Verdict |
|---|---|---|---|
| `#f8fafc` primary | 17.06:1 | — | Pass AAA. Use freely. |
| `#94a3b8` secondary | 6.96:1 | 5.71:1 | Pass AA (both). Smallest safe body text. |
| `#10b981` / `#f59e0b` accents | 7.04 / 8.31:1 | — | Pass AA. |
| `#3b82f6` / `#ef4444` accents | 4.85 / 4.74:1 | — | Pass AA normal (margin is thin — do not darken). |
| `#64748b` muted | 3.75:1 | 3.07:1 | **FAIL AA for body text.** Large text only. |
| `#475569` | 2.36:1 | — | **FAIL all.** Banned for text. Borders/decoration only. |

Rules: body text uses `#94a3b8` or lighter. `#64748b` is permitted only for large text. `#475569` and below never carry text. Status must never be conveyed by color alone — pair every red/green/amber signal with text or an icon.

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

---

## Update protocol

1. Update this file FIRST when any formula, reference value, or token changes.
2. Re-run the WolframAlpha validation for any changed finance value; paste the new locked value with its date.
3. Update the QA reference-value fixtures to match.
4. Log the change in `.learn/errors.md` with date and reason.
5. Provisional values get re-locked (not silently promoted) once the underlying decision is ratified.

---

*Canonical v1.0 | 2026-06-06 | Single source of truth | Consumed by: all finplan-* skills. Finance values validated in WolframAlpha; contrast computed by WCAG 2.2 luminance formula.*
