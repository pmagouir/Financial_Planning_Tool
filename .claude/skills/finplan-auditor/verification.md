# Verification — finplan-auditor
# Auditing the auditor. Run this checklist before delivering any audit report.

1. **Memory loaded.** Did I read all four `.learn` files (canonical, errors, glossary, lessons)?
2. **Regression scan stated.** Did I screen every relevant `errors.md` row and state the result (clean / TRIGGERED), not stay silent?
3. **Behavior observed.** Did I run the change in Claude_Preview and base behavioral findings on what I saw, not only on the code?
4. **Findings located.** Does every finding carry a file:line or a screenshot reference, plus a severity tag?
5. **No rewrites.** Did I surface and locate problems rather than rewriting the artifact?
6. **Verdict present.** Is there a clear `## Verdict` (ship / revise / do not ship) and a composite score at the top?
7. **Convergence verified.** For anything 2+ lenses converged on, did I check it against ground truth (the primary source / canonical), not trust the convergence itself (F1)?
8. **Actionable.** Could Preston act on every Critical finding without asking "what do I do?" If a finding fails this, it is not specific enough.

If any check fails, fix the audit before delivering. An audit that is itself unverified is not done.

*v1.0 | 2026-06-06*
