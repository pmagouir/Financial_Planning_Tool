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
  it('row 2 (single engine): cone expected, projectedPortfolio, and net-worth peak all agree', () => {
    inputs.setKey('currentPortfolio', 100000);
    inputs.setKey('monthlyContrib', 1000);
    inputs.setKey('annualReturn', 7);
    inputs.setKey('contribIncrease', 3);
    inputs.setKey('retYear', CURRENT_YEAR + 25);
    inputs.setKey('contribStopYear', 0);
    const r = results.get();
    const coneExpectedFinal = r.coneSeries[r.coneSeries.length - 1].expected;
    const preRetirement = r.netWorthData.filter((d) => d.phase === 'Pre-Retirement');
    const netWorthPeak = preRetirement[preRetirement.length - 1].netWorth;
    expect(coneExpectedFinal).toBeCloseTo(r.projectedPortfolio, 6);
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
