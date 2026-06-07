# Studio Verification Protocol
# Source of truth for the gates every studio artifact clears before advancing. | Created: 2026-06-06

Gates are enforced two ways: skill-level mandatory steps (soft) and a Claude Code hook (hard). A hard-gate violation blocks the write. A soft-gate violation is caught by the next agent.

---

## Source hierarchy

| Tier | Source type | Examples |
|---|---|---|
| 1 | The app's own single source of truth | `.learn/canonical.md`, the live engine `financialPlan.ts`, WolframAlpha-validated reference values |
| 2 | Primary methodology / spec | Bengen 1994, Trinity Study (Cooley/Hubbard/Walz 1998), WCAG 2.2 spec, IRS Pub 590-B / 915, SSA COLA |
| 3 | Official framework / library docs | Astro, nanostores, Recharts, Tailwind v4, React, WAI-ARIA APG |
| 4 | Authoritative secondary | NN/g, Refactoring UI, Tufte, Bogleheads wiki, the seven-book library |
| 5 | Industry / blogs / forums | Medium posts, Stack Overflow, marketing pages |

**Rule:** any number a user sees must be Tier 1 (traceable to `canonical.md`). Any methodology claim cites Tier 2. UI and accessibility decisions cite Tier 2–3 (WCAG / APG) or Tier 4 (NN/g, Refactoring UI). Tier 5 can spark an idea but never grounds a shipped claim.

---

## Stage gates

### Gate: spec (`studio/specs/*.md`)
**Required structure (hard):** a `## Sources & Assumptions` section. The hook blocks a spec without it.
**Soft rules:** every formula, value, or token the spec touches references its `canonical.md` section; if a needed value is not in canonical, it is added to canonical (with a source) first.

### Gate: audit (`studio/audits/*.md`)
**Required structure (hard):** a `## Verdict` section and an errors.md `regression scan` section. The hook blocks an audit missing either.
**Soft rules:** every relevant `errors.md` row is screened and marked clean or TRIGGERED; a recurrence is escalated to Critical; findings are severity-tagged; the auditor surfaces, never rewrites.

### Gate: backlog (`studio/backlog/*.md`)
**Required structure (hard):** every row under "New items found" cites a source (URL, or a canonical/errors reference). The hook blocks an unsourced item.

### Gate: briefing (`studio/briefings/*.md`)
**Required structure (hard):** a `## Verification Note`, or the footer sentinel `[canonical-checked]`. The hook blocks a briefing without one.

---

## Enforcement mechanism

### Hard gate (Claude Code hook)
A `PostToolUse` hook on `Write`/`Edit` runs `.verification/hook_entry.sh`, which extracts the file path and calls `check_gates.sh`. The script exits 2 with a message naming the missing structure; Claude Code surfaces it and the file must be fixed before the pipeline advances. Wired in `.claude/settings.local.json`.

### Priming (UserPromptSubmit hook)
`.verification/priming_hook.sh` injects the `.learn/errors.md` Open Patterns into context whenever a prompt references studio work, so no agent starts blind to past defects.

### Soft gate (skill-level)
Each finplan-* skill has a Verification Gate section it completes before reporting done. Skipping it is a protocol violation the Auditor catches.

---

## Escalation rules

- **A user-facing number not traceable to canonical** → full stop. Trace it or remove it.
- **A defect recurs that already has an `errors.md` row** → Critical. The prevention failed; fix the prevention, not just the instance.
- **A contrast pair below the canonical §7 threshold** → blocks the component until the color changes.
- **A projection that disagrees across two screens** → blocks ship until both read the single engine.

---

*Version 1.0 | 2026-06-06 | Maintained by: finplan-qa + finplan-auditor | Applies to all artifacts under studio/*
