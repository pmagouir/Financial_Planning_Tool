# Verification — finplan-analyst
# Run this checklist before reporting any prioritization pass done.

1. **Memory loaded.** Did I read all four `.learn` files (canonical, errors, glossary, lessons)?
2. **Feedback first.** Did I read `studio/feedback/` before scoring, so prior outcomes inform the ranking?
3. **Every item scored.** Does each backlog item have an impact × rigor × effort read and a verdict (accept / defer / reject) with a one-line reason — none skipped?
4. **Ledger ranked first.** Are items that close an open `errors.md` row ranked above speculative enhancements?
5. **Rigor gate held.** Did I reject or reshape anything unsourceable or that would force a false-rigor label / Pattern violation, regardless of its impact?
6. **Specs gated.** Does every accepted item have a spec from the template with a populated `## Sources & Assumptions` section and acceptance criteria QA can assert (reference values / the regression test)?
7. **Routed + dependencies flagged.** Is each spec routed to a named builder, with any "needs a value added to canonical first" dependency stated explicitly?
8. **In lane.** Did I avoid scanning, implementing, editing canonical, or running the build?

If any check fails, fix the pass before reporting done. A spec without Sources & Assumptions, or an "accept" with no testable criterion, is not done.

*v1.0 | 2026-06-08*
