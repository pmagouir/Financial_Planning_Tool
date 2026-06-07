# Failure Modes — finplan-auditor
# How the audit itself fails, and the corrective baked into the skill. The auditor is auditable.

| # | Failure mode | What it looks like | Corrective (enforced in SKILL.md) |
|---|---|---|---|
| F1 | Convergence mistaken for proof | All four lenses flag the same number as fine, so it ships — but all four read the same wrong value from canonical.md. | Convergence escalates a concern; it does not confirm correctness. For any high-stakes number, spot-check canonical itself against the primary source. |
| F2 | Code-only review | The cone looks correctly built in the code, but on screen it reads as a probability distribution to a first-timer. | Claude_Preview observation is mandatory. Behavioral findings require on-screen evidence. |
| F3 | Severity inflation | A long list of cosmetic nitpicks buries the one stop-ship issue. | Lead with the 1–2 Critical issues. Cap Polish items. Every finding carries a severity tag. |
| F4 | Rewriting instead of surfacing | The audit hands back rewritten copy/code, making Preston the editor of the audit. | Findings name the issue, the location, and the builder who fixes it. No rewrites (rewrites belong to an opt-in, separate step). |
| F5 | Silence as acceptance | "Looks good" with no errors.md scan, so a recurring defect slips through. | State each relevant errors.md row screened, clean or TRIGGERED. A recurrence is Critical. |
| F6 | Auditing against the spec's own assumptions | The change does exactly what the spec said, but the spec was wrong. | Lens 2 (Skeptical CFP) and Lens 3 (Trust) audit the methodology and labeling, not just conformance to the spec. |

*v1.0 | 2026-06-06 | Re-anchor quarterly against evals/io_pairs.md.*
