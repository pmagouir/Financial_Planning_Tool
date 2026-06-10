import { describe, it, expect, beforeEach } from 'vitest';
import { inputs, results } from './financialPlan';

// jsdom localStorage starts empty, so inputs initializes to its defaults at import.
// Capture that baseline and reset to it before every test for isolation.
const CURRENT_YEAR = new Date().getFullYear();
const BASE = { ...inputs.get() };

beforeEach(() => {
  localStorage.clear();
  inputs.set({ ...BASE });
});

// ── Reference values (canonical §5) — all independently validated in WolframAlpha ──
describe('canonical reference values', () => {
  it('inflation multiplier: 3% over 25 years = 2.093778', () => {
    inputs.setKey('inflation', 3);
    inputs.setKey('retYear', CURRENT_YEAR + 25);
    expect(results.get().inflationMult).toBeCloseTo(2.093778, 5);
  });

  it('withdrawal-rate brackets, including the 34→35 cliff (Trinity)', () => {
    inputs.setKey('withdrawalRate', 0); // auto
    inputs.setKey('retDuration', 40);
    expect(results.get().withdrawalRate).toBe(0.035);
    inputs.setKey('retDuration', 30);
    expect(results.get().withdrawalRate).toBe(0.04);
    inputs.setKey('retDuration', 20);
    expect(results.get().withdrawalRate).toBe(0.045);
    inputs.setKey('retDuration', 10);
    expect(results.get().withdrawalRate).toBe(0.05);
    inputs.setKey('retDuration', 34);
    expect(results.get().withdrawalRate).toBe(0.04);
    inputs.setKey('retDuration', 35);
    expect(results.get().withdrawalRate).toBe(0.035);
  });

  it('the Number: $60k/yr spend, $18k SS, 3% inflation, 25y, 4% WR = $2,198,466.83', () => {
    inputs.setKey('hasModifiedRetirement', true); // stop the smart-default subscriber
    (
      ['retHousing', 'retTransport', 'retGroceries', 'retHealth', 'retChild', 'retIns', 'retDebt', 'retEnt', 'retDining', 'retPersonal', 'retMisc'] as const
    ).forEach((k) => inputs.setKey(k, 0));
    inputs.setKey('retHousing', 5000); // $60k/yr
    inputs.setKey('socialSecurity', 18000);
    inputs.setKey('inflation', 3);
    inputs.setKey('retDuration', 25); // → 4% WR
    inputs.setKey('retYear', CURRENT_YEAR + 25);
    inputs.setKey('withdrawalRate', 0);
    expect(results.get().requiredPortfolio).toBeCloseTo(2198466.83, 1);
  });

  it('FV lump sum: PV $100k, 7%, 25y, no contributions = $542,743.26', () => {
    inputs.setKey('currentPortfolio', 100000);
    inputs.setKey('monthlyContrib', 0);
    inputs.setKey('annualReturn', 7);
    inputs.setKey('retYear', CURRENT_YEAR + 25);
    inputs.setKey('contribStopYear', 0);
    expect(results.get().projectedPortfolio).toBeCloseTo(542743.26, 1);
  });

  it('projectedPortfolio: PV $100k + $1,000/mo, g 3%, r 7%, 25y = $1,574,534.16', () => {
    inputs.setKey('currentPortfolio', 100000);
    inputs.setKey('monthlyContrib', 1000);
    inputs.setKey('annualReturn', 7);
    inputs.setKey('contribIncrease', 3);
    inputs.setKey('retYear', CURRENT_YEAR + 25);
    inputs.setKey('contribStopYear', 0);
    expect(results.get().projectedPortfolio).toBeCloseTo(1574534.16, 1);
  });
});

// ── errors.md regression suite — one test per closed row ──
describe('errors.md regression suite', () => {
  it('row 2 (single engine): projectedPortfolio and the net-worth peak agree', () => {
    inputs.setKey('currentPortfolio', 100000);
    inputs.setKey('monthlyContrib', 1000);
    inputs.setKey('annualReturn', 7);
    inputs.setKey('contribIncrease', 3);
    inputs.setKey('retYear', CURRENT_YEAR + 25);
    inputs.setKey('contribStopYear', 0);
    const r = results.get();
    const preRetirement = r.netWorthData.filter((d) => d.phase === 'Pre-Retirement');
    const netWorthPeak = preRetirement[preRetirement.length - 1].netWorth;
    // Net-worth accumulation reuses the single engine, so its peak == projectedPortfolio.
    expect(netWorthPeak).toBeCloseTo(r.projectedPortfolio, 6);
  });

  it('row 3 (persistence): a changed input writes through to localStorage', () => {
    inputs.setKey('currentPortfolio', 123456);
    expect(localStorage.getItem('finplan:currentPortfolio')).toBe('123456');
  });

  it('row 8 (no special-case r==g branch): projectedPortfolio is continuous & monotonic as g crosses r', () => {
    // The dead `r == g` branch (old financialPlan.ts:132-151, where the if/else ran identical
    // loops and the promised closed form was never implemented) was removed by the single-engine
    // rewrite (commit 72414b6). projectAccumulation now uses ONE month-by-month loop with no
    // branch on r vs g. This is a property test, not a value test, because the defect was the
    // existence of a divergent branch: a re-introduced special-case at g==r would surface as a
    // discontinuity (a jump) or a break in monotonicity right at the boundary.
    inputs.setKey('currentPortfolio', 100000);
    inputs.setKey('monthlyContrib', 1000);
    inputs.setKey('annualReturn', 7); // r = 7%
    inputs.setKey('retYear', CURRENT_YEAR + 25);
    inputs.setKey('contribStopYear', 0);

    inputs.setKey('contribIncrease', 6.99);
    const below = results.get().projectedPortfolio;
    inputs.setKey('contribIncrease', 7.0); // g == r exactly — the old branch's trigger
    const atRG = results.get().projectedPortfolio;
    inputs.setKey('contribIncrease', 7.01);
    const above = results.get().projectedPortfolio;

    expect(Number.isFinite(atRG)).toBe(true);
    // Strictly increasing in contribution growth, with no jump at g==r…
    expect(below).toBeLessThan(atRG);
    expect(atRG).toBeLessThan(above);
    // …and continuous: the g==r value sits on the line between its neighbors (a special-case
    // formula would deflect it off this near-linear local segment). Tolerance 1% ≫ float noise,
    // ≪ any plausible wrong-closed-form deflection.
    const midpoint = (below + above) / 2;
    expect(Math.abs(atRG - midpoint) / atRG).toBeLessThan(0.01);
  });

  it('row 7 (monthlyContrib guard): a hand-entered contribution survives a later Step 1 investment change', () => {
    // Half 1 — the smart default still seeds: with no manual override, the Step 1 investment
    // sum syncs into monthlyContrib (proves the row-7 guard did not over-gate the seed).
    inputs.setKey('k401', 1000);
    expect(inputs.get().monthlyContrib).toBe(1000);

    // User hand-enters a different contribution in Step 4. The UI sets the flag BEFORE the value
    // (so the synchronous subscriber sees intent and skips the sync) — mirror that order here.
    inputs.setKey('hasModifiedContrib', true);
    inputs.setKey('monthlyContrib', 2500);
    expect(inputs.get().monthlyContrib).toBe(2500);

    // Half 2 — the guard holds: revisiting Step 1 and bumping an investment must NOT clobber
    // the hand-entered value. Before the fix this re-synced monthlyContrib to the new total.
    inputs.setKey('k401', 1500); // totalInvest changes to 1500
    expect(inputs.get().monthlyContrib).toBe(2500); // intent wins
  });

  it('row 16 (zero-target trigger): an unentered plan has no target, so the UI must not show "funded"', () => {
    // Default state: retirement-spend sliders all $0 (the smart-default seed from an empty Step 1)
    // and SS $18k. annualRetSpend === 0 → requiredPortfolio === 0. This is the exact state Step 4
    // and Step 5 must detect (planReady = res.annualRetSpend > 0) and render a prompt for, instead
    // of the falsely reassuring "$0 / 100% of target / Surplus / 100% success." We lock the engine
    // trigger here; the prompt rendering itself is confirmed in Claude_Preview (recorded in the audit).
    const r0 = results.get();
    expect(r0.annualRetSpend).toBe(0);
    expect(r0.requiredPortfolio).toBe(0);

    // Entering any retirement spending flips it to a real, fundable target (planReady → true).
    inputs.setKey('hasModifiedRetirement', true);
    inputs.setKey('retHousing', 3000);
    const r1 = results.get();
    expect(r1.annualRetSpend).toBeGreaterThan(0);
    expect(r1.requiredPortfolio).toBeGreaterThan(0);
  });
});

// ── Edge cases ──
describe('edge cases', () => {
  it('retYear == currentYear: projectedPortfolio == currentPortfolio, no NaN', () => {
    inputs.setKey('currentPortfolio', 50000);
    inputs.setKey('monthlyContrib', 1000);
    inputs.setKey('retYear', CURRENT_YEAR);
    const r = results.get();
    expect(r.yearsToRet).toBe(0);
    expect(r.projectedPortfolio).toBe(50000);
    expect(Number.isFinite(r.requiredPortfolio)).toBe(true);
  });
});

// ── Monte Carlo (canonical §10) — the stochastic layer ──
describe('Monte Carlo (canonical §10)', () => {
  function setReferenceAccumulation() {
    inputs.setKey('currentPortfolio', 100000);
    inputs.setKey('monthlyContrib', 1000);
    inputs.setKey('contribIncrease', 3);
    inputs.setKey('annualReturn', 7);
    inputs.setKey('inflation', 3);
    inputs.setKey('retYear', CURRENT_YEAR + 25);
  }

  it('is seeded → deterministic: identical inputs give the identical success rate', () => {
    setReferenceAccumulation();
    const a = results.get().successProbability;
    inputs.setKey('annualReturn', 5); // perturb
    inputs.setKey('annualReturn', 7); // restore
    expect(results.get().successProbability).toBe(a);
  });

  it('successProbability is a valid probability in [0,1]', () => {
    setReferenceAccumulation();
    const p = results.get().successProbability;
    expect(p).toBeGreaterThanOrEqual(0);
    expect(p).toBeLessThanOrEqual(1);
  });

  it('percentile cone is ordered p10 ≤ p50 ≤ p90 at every year, length = yearsToRet+1', () => {
    setReferenceAccumulation();
    const cone = results.get().mcCone;
    expect(cone.length).toBe(26); // years 0..25
    for (const pt of cone) {
      expect(pt.p10).toBeLessThanOrEqual(pt.p50);
      expect(pt.p50).toBeLessThanOrEqual(pt.p90);
    }
  });

  it('median sits below the deterministic mean path (lognormal skew, §10.4)', () => {
    setReferenceAccumulation();
    const r = results.get();
    expect(r.medianPortfolio).toBeGreaterThan(0);
    expect(r.medianPortfolio).toBeLessThan(r.projectedPortfolio); // median < mean
    expect(r.mcCone[r.mcCone.length - 1].p50).toBeCloseTo(r.medianPortfolio, 2);
    // Wolfram ground truth ≈ $1.30M median; wide band for N=1000 + RNG differences
    expect(r.medianPortfolio).toBeGreaterThan(1_050_000);
    expect(r.medianPortfolio).toBeLessThan(1_500_000);
  });

  it('drawdown success ≈ Wolfram ground truth for the $1M / 4% / 30-yr reference (§10.4 ≈ 73%)', () => {
    // Isolate the drawdown: retire now, $1M, no accumulation, $40k net need, 30 yrs, 5.95%/σ10%
    inputs.setKey('hasModifiedRetirement', true);
    inputs.setKey('currentPortfolio', 1_000_000);
    inputs.setKey('monthlyContrib', 0);
    inputs.setKey('retYear', CURRENT_YEAR);
    inputs.setKey('retDuration', 30);
    inputs.setKey('annualReturn', 7); // → retReturn = max(0.04, 7%×0.85) = 5.95%
    inputs.setKey('inflation', 3);
    inputs.setKey('socialSecurity', 0);
    inputs.setKey('retHousing', 40000 / 12); // annualRetSpend = $40k → netNeed = $40k
    const r = results.get();
    expect(r.yearsToRet).toBe(0);
    expect(r.successProbability).toBeGreaterThan(0.66);
    expect(r.successProbability).toBeLessThan(0.80);
  });

  it('net-worth cone spans the full lifecycle and shows depletion in weak scenarios', () => {
    inputs.setKey('currentPortfolio', 100000);
    inputs.setKey('monthlyContrib', 1000);
    inputs.setKey('annualReturn', 7);
    inputs.setKey('contribIncrease', 3);
    inputs.setKey('inflation', 3);
    inputs.setKey('retYear', CURRENT_YEAR + 25);
    inputs.setKey('retDuration', 30);
    inputs.setKey('hasModifiedRetirement', true);
    inputs.setKey('socialSecurity', 0);
    inputs.setKey('retHousing', 3500); // high net need → sequence-of-returns risk bites
    const cone = results.get().mcNetWorthCone;
    expect(cone.length).toBe(26 + 30); // (yearsToRet+1) accumulation + retDuration drawdown
    for (const pt of cone) {
      expect(pt.p10).toBeLessThanOrEqual(pt.p50);
      expect(pt.p50).toBeLessThanOrEqual(pt.p90);
    }
    const last = cone[cone.length - 1];
    expect(last.p10).toBe(0); // bottom decile depletes — now visible on the chart, not hidden
    expect(last.p90).toBeGreaterThan(0); // strong scenarios still survive
  });

  it('headline gap reads from the MEDIAN, not the deterministic mean (row 13 — one number, one story)', () => {
    setReferenceAccumulation();
    const r = results.get();
    // medianGap is median-based and matches what the UI/chart show
    expect(r.medianGap).toBeCloseTo(r.medianPortfolio - r.requiredPortfolio, 2);
    // and the median is genuinely below the deterministic mean (so headlining the mean overstated it)
    expect(r.medianPortfolio).toBeLessThan(r.projectedPortfolio);
  });

  it('row 9: a flat (non-COLA) pension funds less than the same amount as COLA Social Security', () => {
    const base = () => {
      inputs.setKey('hasModifiedRetirement', true);
      inputs.setKey('currentPortfolio', 250000);
      inputs.setKey('monthlyContrib', 1500);
      inputs.setKey('annualReturn', 7);
      inputs.setKey('contribIncrease', 3);
      inputs.setKey('inflation', 4);
      inputs.setKey('retYear', CURRENT_YEAR + 25);
      inputs.setKey('retDuration', 35);
      inputs.setKey('retHousing', 4000); // annualRetSpend = $48k
    };
    // Plan B — income as COLA'd Social Security
    base();
    inputs.setKey('socialSecurity', 22000);
    inputs.setKey('pension', 0);
    const reqB = results.get().requiredPortfolio;
    const successSS = results.get().successProbability;
    // Plan A — identical dollars as a flat (non-COLA) pension
    inputs.setKey('socialSecurity', 0);
    inputs.setKey('pension', 22000);
    const reqA = results.get().requiredPortfolio;
    const successPension = results.get().successProbability;
    // The year-1 required portfolio is identical (income offsets year-1 need the same)…
    expect(reqA).toBeCloseTo(reqB, 2);
    // …but the flat pension erodes over 35 years, so it funds less → strictly lower success.
    expect(successPension).toBeLessThan(successSS);
  });
});

// ── Edge-case expansion (Wave 2): drawdown, gap solver, smart defaults ──
describe('drawdown (canonical §4) edge cases', () => {
  it('netWorthData spans the full lifecycle and never goes negative', () => {
    inputs.setKey('hasModifiedRetirement', true);
    inputs.setKey('currentPortfolio', 200000);
    inputs.setKey('monthlyContrib', 1000);
    inputs.setKey('annualReturn', 7);
    inputs.setKey('inflation', 3);
    inputs.setKey('retYear', CURRENT_YEAR + 20);
    inputs.setKey('retDuration', 30);
    inputs.setKey('socialSecurity', 0);
    inputs.setKey('retHousing', 4000); // $48k/yr need
    const r = results.get();
    // length = (yearsToRet + 1) accumulation points + retDuration drawdown points
    expect(r.netWorthData.length).toBe(20 + 1 + 30);
    expect(r.netWorthData.every((d) => d.netWorth >= 0)).toBe(true);
    // the series ends in the final retirement year
    expect(r.netWorthData[r.netWorthData.length - 1].year).toBe(CURRENT_YEAR + 20 + 30);
  });

  it('a high net need depletes the deterministic portfolio to exactly 0 (floored, never negative)', () => {
    inputs.setKey('hasModifiedRetirement', true);
    inputs.setKey('currentPortfolio', 100000);
    inputs.setKey('monthlyContrib', 0);
    inputs.setKey('annualReturn', 7);
    inputs.setKey('inflation', 3);
    inputs.setKey('retYear', CURRENT_YEAR); // retire now, no accumulation
    inputs.setKey('retDuration', 30);
    inputs.setKey('socialSecurity', 0);
    inputs.setKey('retHousing', 5000); // $60k/yr drawn on a $100k portfolio → depletes fast
    const retPhase = results.get().netWorthData.filter((d) => d.phase === 'Retirement');
    expect(retPhase.every((d) => d.netWorth >= 0)).toBe(true); // floored, never negative
    expect(retPhase[retPhase.length - 1].netWorth).toBe(0); // fully depleted by the end
  });
});

describe('gap solver (canonical §3 D) edge cases', () => {
  it('is zero when the median already clears the target (a surplus needs no top-up)', () => {
    inputs.setKey('hasModifiedRetirement', true);
    inputs.setKey('currentPortfolio', 2_000_000);
    inputs.setKey('monthlyContrib', 1000);
    inputs.setKey('retYear', CURRENT_YEAR + 25);
    inputs.setKey('retHousing', 2000); // modest need
    const r = results.get();
    expect(r.medianGap).toBeGreaterThan(0); // surplus
    expect(r.monthlyShortfall).toBe(0); // nothing to add
  });

  it('is zero when there is no time left to contribute (yearsContributing 0)', () => {
    inputs.setKey('hasModifiedRetirement', true);
    inputs.setKey('currentPortfolio', 0);
    inputs.setKey('monthlyContrib', 1000);
    inputs.setKey('retYear', CURRENT_YEAR); // retire now → can't contribute
    inputs.setKey('retHousing', 4000);
    expect(results.get().monthlyShortfall).toBe(0);
  });

  it('adding the prescribed monthlyShortfall materially closes the median gap', () => {
    inputs.setKey('hasModifiedRetirement', true);
    inputs.setKey('currentPortfolio', 50000);
    inputs.setKey('monthlyContrib', 500);
    inputs.setKey('annualReturn', 7);
    inputs.setKey('contribIncrease', 3);
    inputs.setKey('inflation', 3);
    inputs.setKey('retYear', CURRENT_YEAR + 25);
    inputs.setKey('retDuration', 30);
    inputs.setKey('socialSecurity', 18000);
    inputs.setKey('retHousing', 5000); // large need → genuine shortfall
    const before = results.get();
    expect(before.medianGap).toBeLessThan(0);
    const add = before.monthlyShortfall;
    expect(add).toBeGreaterThan(0);
    // Apply the prescribed top-up and re-evaluate the same plan.
    inputs.setKey('monthlyContrib', 500 + add);
    const after = results.get();
    expect(after.medianPortfolio).toBeGreaterThan(before.medianPortfolio);
    // The seeded MC closes ~90% of the median gap here (residual ≈0.103). The solver under-closes
    // slightly: it sizes the top-up off the DETERMINISTIC factor while the median grows slower
    // (lognormal skew). Bound at 15% residual — well above the real ~10%, but tight enough to fail
    // a ~2× solver regression (which would leave ~55% of the gap), unlike the prior loose 50%.
    const closureRatio = Math.abs(after.medianGap) / Math.abs(before.medianGap);
    expect(closureRatio).toBeLessThan(0.15);
  });

  it('a larger shortfall prescribes a larger monthly top-up (monotonic)', () => {
    inputs.setKey('hasModifiedRetirement', true);
    inputs.setKey('currentPortfolio', 50000);
    inputs.setKey('monthlyContrib', 500);
    inputs.setKey('annualReturn', 7);
    inputs.setKey('retYear', CURRENT_YEAR + 25);
    inputs.setKey('socialSecurity', 18000);
    inputs.setKey('retHousing', 4000);
    const small = results.get().monthlyShortfall;
    inputs.setKey('retHousing', 6000); // bigger need → bigger gap
    const big = results.get().monthlyShortfall;
    expect(big).toBeGreaterThan(small);
  });
});

describe('smart defaults (canonical §2 seeding) edge cases', () => {
  it('seeds retirement spend from Step 1 at the documented ratios while unmodified', () => {
    inputs.setKey('rent', 2000); // housing component
    inputs.setKey('healthIns', 500);
    inputs.setKey('dining', 400);
    const r = inputs.get();
    expect(r.retHousing).toBe(2000); // housing = rent (+ other components 0), full ratio
    expect(r.retHealth).toBe(Math.round(500 * 1.3)); // 1.3× health
    expect(r.retDining).toBe(Math.round(400 * 0.7)); // 0.7× dining
  });

  it('stops seeding once the user has modified the retirement sliders (hasModifiedRetirement)', () => {
    inputs.setKey('hasModifiedRetirement', true);
    inputs.setKey('retHousing', 9999); // user-set
    inputs.setKey('rent', 2000); // would seed retHousing=2000, but the guard blocks the overwrite
    expect(inputs.get().retHousing).toBe(9999); // user's value preserved
  });
});

// ── Feedback round 1 (errors.md row 32): new fixed-cost categories + starter-habit FV ──
describe('feedback round 1 — phone / metro / household + starter100FV', () => {
  it('phone, metro, and household flow into currentFixed and totalAllocated', () => {
    inputs.setKey('phone', 80);
    inputs.setKey('metro', 120);
    inputs.setKey('household', 150);
    const r = results.get();
    expect(r.currentFixed).toBe(80 + 120 + 150);
    expect(r.totalAllocated).toBe(80 + 120 + 150);
  });

  it('the new keys join their category seeds (phone→housing, metro→transport ×0.5, household→groceries)', () => {
    inputs.setKey('rent', 2000);
    inputs.setKey('phone', 80);
    inputs.setKey('carPayment', 400);
    inputs.setKey('metro', 120);
    inputs.setKey('groceries', 500);
    inputs.setKey('household', 150);
    const v = inputs.get();
    expect(v.retHousing).toBe(2080);                       // rent + phone, full ratio
    expect(v.retTransport).toBe(Math.round(520 * 0.5));    // (carPayment + metro) × 0.5
    expect(v.retGroceries).toBe(650);                      // groceries + household, full ratio
  });

  it('starter100FV equals the closed-form end-of-month annuity at the effective monthly rate', () => {
    // Same convention as canonical §3: m = (1+r)^(1/12) − 1; FV = C × ((1+m)^n − 1) / m.
    // The engine value must match the independent closed form — a real cross-check, not an echo.
    inputs.setKey('annualReturn', 7);
    inputs.setKey('retYear', CURRENT_YEAR + 25);
    const m = Math.pow(1.07, 1 / 12) - 1;
    const closedForm = 100 * ((Math.pow(1 + m, 300) - 1) / m);
    expect(results.get().starter100FV).toBeCloseTo(closedForm, 4);
  });

  it('starter100FV is unaffected by the plan inputs it should ignore (principal, step-up, stop year)', () => {
    inputs.setKey('annualReturn', 7);
    inputs.setKey('retYear', CURRENT_YEAR + 25);
    const baseline = results.get().starter100FV;
    inputs.setKey('currentPortfolio', 500000);
    inputs.setKey('monthlyContrib', 2500);
    inputs.setKey('contribIncrease', 5);
    inputs.setKey('contribStopYear', CURRENT_YEAR + 10);
    expect(results.get().starter100FV).toBe(baseline);
  });
});

// ── §10.7 confidence-zone display quantities (errors.md row 33) ──
// Same math, new framing: the upside cue (p75) and the capability statement (p10 depletion year)
// must be exact derivations of the existing seeded Monte Carlo, never softer than it.
describe('§10.7 — p75AtRetirement + p10DepletionYear', () => {
  it('p75 at retirement sits between the median and the 90th percentile', () => {
    inputs.setKey('currentPortfolio', 100000);
    inputs.setKey('monthlyContrib', 1000);
    inputs.setKey('annualReturn', 7);
    inputs.setKey('retYear', CURRENT_YEAR + 25);
    const r = results.get();
    const atRet = r.mcCone[r.mcCone.length - 1];
    expect(r.p75AtRetirement).toBeGreaterThanOrEqual(atRet.p50);
    expect(r.p75AtRetirement).toBeLessThanOrEqual(atRet.p90);
  });

  it('textbook $1M / 4% / 30-yr: the p10 path depletes mid-retirement, exactly where the cone says', () => {
    // Mirrors the §10.4 reference setup (≈73% success → >10% of trials fail → p10 must hit $0).
    inputs.setKey('hasModifiedRetirement', true);
    inputs.setKey('currentPortfolio', 1_000_000);
    inputs.setKey('monthlyContrib', 0);
    inputs.setKey('retYear', CURRENT_YEAR);
    inputs.setKey('retDuration', 30);
    inputs.setKey('annualReturn', 7);
    inputs.setKey('inflation', 3);
    inputs.setKey('socialSecurity', 0);
    inputs.setKey('retHousing', 40000 / 12);
    const r = results.get();
    const y = r.p10DepletionYear;
    expect(y).not.toBeNull();
    expect(y!).toBeGreaterThan(CURRENT_YEAR);
    expect(y!).toBeLessThanOrEqual(CURRENT_YEAR + 30);
    // Boundary exactness: p10 ≤ 0 at the depletion year, > 0 the year before — that is precisely
    // what licenses "9 in 10 outcomes stay funded through {y−1}" in the UI.
    const idx = r.mcNetWorthCone.findIndex((p) => p.year === y);
    expect(r.mcNetWorthCone[idx].p10).toBeLessThanOrEqual(0);
    expect(r.mcNetWorthCone[idx - 1].p10).toBeGreaterThan(0);
  });

  it('an over-funded plan never depletes the p10 path (capability statement reads "all years funded")', () => {
    inputs.setKey('hasModifiedRetirement', true);
    inputs.setKey('currentPortfolio', 1_000_000);
    inputs.setKey('monthlyContrib', 0);
    inputs.setKey('retYear', CURRENT_YEAR);
    inputs.setKey('retDuration', 30);
    inputs.setKey('annualReturn', 7);
    inputs.setKey('inflation', 3);
    inputs.setKey('socialSecurity', 0);
    inputs.setKey('retHousing', 500); // $6k/yr on $1M — a 0.6% draw
    const r = results.get();
    expect(r.successProbability).toBeGreaterThanOrEqual(0.99);
    expect(r.p10DepletionYear).toBeNull();
  });
});
