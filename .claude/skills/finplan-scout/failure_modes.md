# Failure Modes — finplan-scout
# How the scan itself fails, and the corrective baked into the skill.

| # | Failure mode | What it looks like | Corrective (enforced in SKILL.md) |
|---|---|---|---|
| F1 | Unsourced enthusiasm | A "great idea" logged with no primary source, so the Analyst can't weigh its rigor. | researching-with-confidence on every row; no source → cut it or mark "unsourced — needs research." |
| F2 | Scope creep into prioritization | The backlog starts ranking, scoring, or recommending what to build first. | Present options, never decisions. Ranking is the Analyst's job; the Scout only tags the quality and a suggested owner. |
| F3 | Silent skip | A sweep quietly covers three of five sources; the gap looks like a quiet field. | State all five sources every time, even when the finding is "nothing new." Silence is not coverage. |
| F4 | Phantom release | "Upgrade Recharts" logged without checking the installed version, so the item is noise. | Confirm against `package.json` that a newer version exists before logging a dependency item. |
| F5 | Rigor that breaks honesty | A "more sophisticated model" item that, if built, would force a false-rigor label (Pattern 2). | Flag the tension with glossary/lessons, not just the idea. An improvement that needs a dishonest label is not an improvement. |
| F6 | Re-logging | The same item reappears every week because feedback/ and the prior backlog weren't read. | Read the last backlog + feedback first; dedupe. |

*v1.0 | 2026-06-08 | Re-anchor weekly against evals/io_pairs.md.*
