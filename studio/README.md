# The Studio — continuous improvement system for the Financial Planning Tool

This is the agentic studio that designs, audits, and improves the Financial Planning Tool. It is the third instantiation of the BRAIN five-agent pattern (Scout → Analyst → Builder → Auditor → Director), specialized from producing documents to continuously improving a live product. The product spans distinct expertises, so the single Builder node fans out into a specialist bench.

The agents are skills in `.claude/skills/finplan-*`. They never call each other. They hand off through the files in this directory. The path is the interface.

## Roster

**Spine**
- `finplan-scout` — *scans*. Sweeps finance research, WCAG, framework releases, and the live tool → a dated backlog. (built, Phase 3)
- `finplan-analyst` — *scores*. Ranks the backlog by impact × rigor × effort, writes one improvement spec per accepted item, routes to a builder. (built, Phase 3)
- `finplan-qa` — *tests*. Vitest suite, reference-value validation against canonical, one regression test per `errors.md` row. **(built, Phase 1)**
- `finplan-auditor` — *critiques*. Multi-lens adversarial review before ship; specializes `adversarial-audit-cowork`. **(built, Phase 1)**
- `finplan-director` — *reports up*. Weekly briefing + Definition-of-Done to Preston. (built, Phase 3)

**Bench (the Builder, fanned out)**
- `finplan-quant` — *models*. Monte Carlo, sequence-of-returns, tax-aware withdrawals, glide path. (built, Phase 2)
- `finplan-cfp` — *validates*. Formula correctness, citations, withdrawal methodology, honest labeling. **(built, Phase 1)**
- `finplan-engineer` — *implements*. Single-engine refactor, persistence, dead-code purge, token wiring, CI/CD. **(built, Phase 1)**
- `finplan-designer` — *designs*. Token system, component consolidation, motion, responsive. (built, Phase 3)
- `finplan-a11y` — *ensures access*. WCAG AA, ARIA, label binding, keyboard/focus, contrast. (built, Phase 2)
- `finplan-content` — *explains*. Resources, tooltips, the "why," attribution. (built, Phase 3)

## The pipeline (file-mediated handoff)

```
Scout ── backlog/YYYY-WNN.md ──▶ Analyst ── specs/{feature}.md ──▶ a Builder
                                                                      │
                                              code change + QA tests ─┤
                                                                      ▼
                                          Auditor ── audits/{feature}_vN.md ──▶ (revise loop)
                                                                      │
   Director ── briefings/YYYY-WNN.md ──▶ Preston (terminal authority on every decision)
```

| Directory | Owner | Contents |
|---|---|---|
| `backlog/` | Scout | Dated improvement backlog, each item sourced |
| `specs/` | Analyst + Builders | One improvement spec per accepted item; gated for a Sources & Assumptions section |
| `audits/` | Auditor | Multi-lens review reports, severity-tagged |
| `briefings/` | Director | Weekly status up to Preston |
| `feedback/` | Analyst reads before re-prioritizing | Per-feature outcomes after a change ships |
| `.learn/` | all agents (read at session start) | `canonical.md`, `errors.md`, `glossary.md`, `lessons.md` |
| `.verification/` | the gate hook | `check_gates.sh`, `hook_entry.sh`, `priming_hook.sh` |

## The two learning loops

1. **Shared `.learn/`** — read by every agent at session start. `canonical.md` is the single source of truth for every formula, reference value, and token; if it is not there, it does not ship. `errors.md` turns every shipped defect into a live regression test. `glossary.md` fixes load-bearing language. `lessons.md` holds the durable why.
2. **Per-feature `feedback/`** — after a change ships, what was observed; the Analyst reads it before the next prioritization pass.

## Gates

A `PostToolUse` hook runs `.verification/check_gates.sh` on writes under `specs/`, `audits/`, `backlog/`, `briefings/`. Hard gates (structural) block the write. Soft gates (content correctness against canonical) are caught by the next agent. See `VERIFICATION.md`.

## Build status

- **Phase 0 — complete.** Workspace, `.learn/` (canonical seeded + validated, errors seeded), gate hook.
- **Phase 1 — complete.** `finplan-cfp`, `finplan-engineer`, `finplan-qa`, `finplan-auditor`. Closed the credibility, correctness, and data-loss defects (`errors.md` rows 1–3, 7–9).
- **Phase 2 — complete.** `finplan-quant`, `finplan-a11y` (Waves 0–1: real Monte Carlo + the WCAG AA floor).
- **Phase 3 — complete (2026-06-08).** `finplan-designer` (Wave 0), `finplan-content` (Wave 3), `finplan-scout` / `finplan-analyst` / `finplan-director` (Wave 4). **The full eleven-agent roster is built and the standing loop is live.**

The four sweep waves (0–4) are complete: tokens + accessibility floor, real Monte Carlo, the long-tail close, the per-screen audit + education pass, and ship-as-a-resource (public methodology page, Recharts code-split, hardened CI). See `studio/SWEEP-PLAN.md`.

---

*Studio v1.0 | 2026-06-06 | Pattern: BRAIN five-agent (third instantiation) | Governs: src/stores/financialPlan.ts + src/components/*
