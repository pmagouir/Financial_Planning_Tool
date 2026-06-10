# Glossary — Financial Planning Tool Studio
# Load-bearing product language. Canonical wording for user-facing copy and labels.
# If a phrase is here, use it exactly. The Content agent owns this file; the Auditor checks against it.

---

## Load-bearing terms (user-facing copy)

| Canonical phrase | Do NOT use | Reason |
|---|---|---|
| **scenario range** / "optimistic / expected / cautious paths" | "probability cone," "confidence interval," "uncertainty envelope," "Monte Carlo" | The Step 4 chart is deterministic. These terms imply a distribution that does not exist yet (`.learn/errors.md` row 1). Re-allow "probability" only when a real simulation with a stated success rate ships. |
| **estimate** / **projection** | "guarantee," "you will have," "ensures" | Every output is an estimate. Never imply certainty. |
| **your number** | "the target," "the required amount" | Housel personal, non-judgmental framing for the required portfolio. |
| **Fixed Costs / Investments / Guilt-Free Spending** | "needs / wants / savings," "essentials / discretionary" | Sethi's exact three-bucket structure. |
| **Guilt-Free Spending** | "discretionary," "wants," "fun money," "non-essential" | Sethi's term. Non-judgmental by design. |
| **safe withdrawal rate** | "interest rate," "the return you live on" | It is a withdrawal rate from principal + growth, not an interest rate. |
| **on track** / **gap to close** | "behind," "failing," "you're losing" | Non-judgmental, action-oriented framing for the shortfall. |
| **educational, not personalized financial advice** | "our advice," "we recommend you invest" | Compliance + the tool's stance. Coach, not advisor. |
| **a 1-in-10 rough market** / **a 1-in-10 strong market** (percentile in a parenthetical) | bare "10th percentile" / "90th percentile" as the only label | Plain odds read human; bare percentiles read clinical-doom to a first-timer (canonical §10.7). The percentile stays available in parentheses for precision. |
| **the healthy zone (75–90%)** | "passing," "safe," any zone claim without the range | Professional planning practice (MoneyGuidePro Confidence Zone). Above 90% may signal over-saving (Kitces) — say so; below it, name the lift (contributions or a later retirement). |
| **"9 in 10 outcomes stay funded through {year}"** / **"funds all {N} years even in a 1-in-10 rough market"** | "you'll run out of money in {year}" | Capability framing (Fidelity-style): exact statements derived from `p10DepletionYear` (canonical §10.7) — frame the downside by what it funds, never as a doom date. |
| **short of target** (amber, text-carried) | "✗ shortfall" stamp | A percentile snapshot below target is a flag for attention; a red ✗ reads as a verdict (canonical §10.7, errors.md row 23 family). |

---

## Labeling rules

- No spending category is ever labeled "bad," "too much," "overspending," or "wasteful." Sethi framing: spend on what you love, cut what you don't.
- All financial numbers render in **monospace**, formatted with `Intl.NumberFormat`, `$` prefixed.
- Positive and negative values are always visually distinct (success green / danger red) AND carry a text or icon signal — never color alone (canonical §7).
- Every projection screen states the assumptions behind it in plain language.
- Attribute methodology: "Based on the Trinity Study (Bengen, 1994)" and similar.
- **Author names never appear as a bare list or byline** — a name-only strip (the old hero eyebrow "Ramit Sethi · JL Collins · Morgan Housel") reads as authorship or endorsement of the site, which is false. Names appear ONLY inside attributed constructions: "Based on…", "Inspired by…", or author + book citations (Welcome pillars, Resources, Methodology). When the three ARE attributed together, name all three consistently (never drop one, never mix author names with a methodology name in the same list — errors.md row 26). The Welcome pillars section carries the independence line ("no affiliation with, or endorsement from, the authors"). The Trinity Study is cited where the withdrawal math appears (Step 3 / Step 5). (errors.md rows 26, 34.)

---

## Banned constructions (inherited from preston-writing, for any prose the Content agent writes)

- "This isn't X — it's Y"
- "X, not Y"
- "Not X, but Y"
- "Genuinely," "honestly," "straightforward"
- "The research shows" without a specific citation
- Em-dash overuse
- Tricolon lists in serial prose

---

## Update protocol

1. Add a row when a new load-bearing phrase needs fixing.
2. Cite the `.learn/errors.md` row that prompted it.
3. If the rule is general writing voice, propagate to the preston-writing skill.

---

*Glossary v1.0 | 2026-06-06 | Consumed by: finplan-content, finplan-auditor, finplan-designer*
