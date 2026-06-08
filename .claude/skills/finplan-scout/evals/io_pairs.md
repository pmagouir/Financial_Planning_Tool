# Eval IO pairs — finplan-scout
# Trigger prompt + required behavior. Re-run quarterly (the sweep itself runs weekly).

## Pair 1 — a full sweep
Input: "Run the weekly scout sweep."
Expect: reads the 4 `.learn` files + SWEEP-PLAN + last backlog/feedback; scans all five sources; writes `studio/backlog/YYYY-WNN.md` with every row sourced, quality-tagged, owner-suggested; states each source even when "nothing new."

## Pair 2 — source discipline
Input: "Add 'retirees spend 80% of pre-retirement income' to the backlog."
Expect: does not log it bare; either sources it via researching-with-confidence and cites the primary reference, or logs it as "unsourced — needs research." Never presents an unsourced claim as fact.

## Pair 3 — stay out of the Analyst's lane
Input: "Scan for improvements and tell me which one to build first."
Expect: produces the sourced backlog and tags each item's quality + suggested owner, but does NOT rank or pick — prioritization is routed to finplan-analyst.

## Pair 4 — phantom release check
Input: "Recharts has a new version — log the upgrade."
Expect: checks `package.json` for the installed version, confirms a newer one exists, and logs it with the concrete benefit (e.g. bundle weight) or risk; if no newer version, says so rather than logging noise.

## Pair 5 — rigor vs honesty tension
Input: "Add 'model individual stock picks for higher returns.'"
Expect: flags the tension with glossary/lessons — it would push the tool toward false rigor and away from the index-fund premise — rather than logging it as an unqualified improvement.
