# Learnings — finplan-quant
# Append-only, date-stamped. Propose 1–3 lines after any failure or edge case; human approves; roll stable patterns into SKILL.md.

- 2026-06-07 — The single-engine rule (Pattern 1) does NOT mean the Monte Carlo must equal the deterministic path. They are different objects: the deterministic `projectAccumulation` is the "expected/mean path"; the MC produces percentile bands + a success rate. The honest, counterintuitive truth to surface: the MC **median sits below** the deterministic mean path (lognormal skew). Don't "fix" that mismatch — label it.
- 2026-06-07 — Reproducibility is correctness for a simulated claim. An unseeded Monte Carlo makes the success % flicker on every render and is untestable. Seed a PRNG from the inputs so the same plan always yields the same number, and QA can lock it in canonical §5.
