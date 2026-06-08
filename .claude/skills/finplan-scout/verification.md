# Verification — finplan-scout
# Run this checklist before reporting any sweep done.

1. **Memory loaded.** Did I read all four `.learn` files (canonical, errors, glossary, lessons)?
2. **All five sources scanned.** Quality axes, finance research, WCAG/APG, framework releases, the live tool + open errors.md rows — each covered and stated, even when "nothing new"?
3. **Every row sourced.** Does each backlog item carry a primary source (URL or canonical/errors reference) and a confidence note from researching-with-confidence? Unsourced rows cut or explicitly flagged?
4. **Owner + quality tagged.** Does each row name the quality axis it serves and a suggested builder?
5. **No duplication.** Did I check the last backlog and feedback files so nothing is re-logged?
6. **Released, not imagined.** For a dependency item, did I confirm against `package.json` that a newer version actually exists?
7. **In lane.** Did I only present options — no prioritization, no specs, no code?
8. **Saved correctly.** Is it at `studio/backlog/YYYY-WNN.md` (ISO week) using the template?

If any check fails, fix the sweep before reporting done. A sweep that skipped a source looks identical to a quiet field — say which you checked.

*v1.0 | 2026-06-08*
