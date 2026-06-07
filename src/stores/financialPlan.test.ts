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
