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

---

## Labeling rules

- No spending category is ever labeled "bad," "too much," "overspending," or "wasteful." Sethi framing: spend on what you love, cut what you don't.
- All financial numbers render in **monospace**, formatted with `Intl.NumberFormat`, `$` prefixed.
- Positive and negative values are always visually distinct (success green / danger red) AND carry a text or icon signal — never color alone (canonical §7).
- Every projection screen states the assumptions behind it in plain language.
- Attribute methodology: "Based on the Trinity Study (Bengen, 1994)" and similar.
- Attribute the three frameworks consistently and completely — **Ramit Sethi · JL Collins · Morgan Housel** (never drop one, never mix author names with a methodology name in the same list). The Trinity Study is cited where the withdrawal math appears (Step 3 / Step 5), not in the hero list of thinkers. (errors.md row 26.)

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
