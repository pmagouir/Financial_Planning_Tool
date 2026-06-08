# Failure Modes — finplan-analyst
# How the prioritization itself fails, and the corrective baked into the skill.

| # | Failure mode | What it looks like | Corrective (enforced in SKILL.md) |
|---|---|---|---|
| F1 | Accept-everything | Most of the backlog gets a spec; nothing is deferred or rejected. | A great tool does a few things excellently. Most items defer/reject, each with a reason. The build slot is scarce on purpose. |
| F2 | Shiny over solid | A novel enhancement outranks closing a known `errors.md` defect. | Closing the ledger and trust-critical fixes rank above speculative surface area. Impact is measured against the defect list first. |
| F3 | Ungated spec | A spec ships without Sources & Assumptions or with vague acceptance criteria QA can't test. | The Sources & Assumptions section is a hard gate; every acceptance criterion is a concrete, assertable outcome. |
| F4 | Rigor laundering | A high-impact item is accepted even though its source doesn't bear the weight, or it would force a dishonest label. | Verify the source tier with researching-with-confidence; reject or reshape anything that needs false rigor (Pattern 2) or scatters logic (Pattern 1). |
| F5 | Canonical bypass | A spec quietly assumes a number/token not in canonical. | Flag "blocked on CFP/Designer adding it to canonical first"; never let an untraced value into a spec. |
| F6 | Builder ambiguity | A spec lands with no clear owner, so it stalls. | Route every accepted spec to a named builder (CFP / Quant / Engineer / Designer / A11y / Content). |

*v1.0 | 2026-06-08 | Re-anchor weekly against evals/io_pairs.md.*
