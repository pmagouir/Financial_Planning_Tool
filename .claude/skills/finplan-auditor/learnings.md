# Learnings — finplan-auditor
# Append-only, date-stamped. Propose 1–3 lines after any failure or edge case; human approves; roll stable patterns into SKILL.md.

## 2026-06-06 — Cold-run audit (Step 5): self-sufficiency findings
A fresh agent ran this skill cold on `Step5_Summary.tsx`. The intellectual content (four lenses, errors.md-as-regression-suite, failure modes) worked unaided and surfaced three Critical findings. File/tooling gaps found and fixed in v1.1:
- `evals/io_pairs.md` and `learnings.md` were referenced in frontmatter but absent → both now created.
- No fallback when Claude_Preview is unavailable (the skill hard-blocks on it) → added: tag `[NEEDS-LIVE]`, cap verdict at "revise".
- No protocol for auditing a screen with no spec → added: audit against canonical/errors/glossary.
- `{feature}` slug and version `N` derivation underspecified → defined.
- "Relevant errors.md row" ambiguous → now "state all rows, mark N/A."
- Pre-Run "spot-check 5 numbers" awkward for read-only screens → engine-vs-display distinction added.
Source: cold-test run; audit at `studio/audits/step5-summary_v1.md`.
