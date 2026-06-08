import { computed } from 'nanostores';
import { persistentMap } from '@nanostores/persistent';

// 1. STATE: All Inputs
export interface FinancialInputs {
  takeHomePay: number;
  // Fixed
  rent: number; propTax: number; utilities: number; internet: number;
  carPayment: number; carIns: number; gas: number; carMaint: number;
  groceries: number; healthIns: number; otherIns: number; debtMin: number; childcare: number; banking: number;
  // Investments
  k401: number; employerMatch: number; ira: number; hsa: number; taxable: number; emergency: number; edu529: number; lifeIns: number;
  // Guilt-Free
  dining: number; ent: number; travel: number; hobbies: number;
  personal: number; clothes: number; gifts: number; dev: number;
  tech: number; homeImp: number; subscriptions: number; misc: number;
  // Retirement Design (sliders)
  retHousing: number; retTransport: number; retGroceries: number; retHealth: number;
  retChild: number; retIns: number; retDebt: number;
  retEnt: number; retDining: number; retPersonal: number; retMisc: number;
  hasModifiedRetirement: boolean; // user customized retirement-spend sliders → stop seeding them
  hasModifiedContrib: boolean;    // user hand-entered monthlyContrib → stop syncing it to Step 1 (row 7)
  // Assumptions
  retYear: number; retDuration: number; inflation: number;
  socialSecurity: number; pension: number; otherIncome: number;
  currentPortfolio: number; monthlyContrib: number;
  contribIncrease: number; annualReturn: number;
  contribStopYear: number;   // 0 = never stop (defaults to retirement year)
  withdrawalRate: number;    // 0 = auto-calculate from duration
}

const DEFAULTS: FinancialInputs = {
  takeHomePay: 5000,
  rent: 0, propTax: 0, utilities: 0, internet: 0,
  carPayment: 0, carIns: 0, gas: 0, carMaint: 0,
  groceries: 0, healthIns: 0, otherIns: 0, debtMin: 0, childcare: 0, banking: 0,
  k401: 0, employerMatch: 0, ira: 0, hsa: 0, taxable: 0, emergency: 0, edu529: 0, lifeIns: 0,
  dining: 0, ent: 0, travel: 0, hobbies: 0,
  personal: 0, clothes: 0, gifts: 0, dev: 0,
  tech: 0, homeImp: 0, subscriptions: 0, misc: 0,
  retHousing: 0, retTransport: 0, retGroceries: 0, retHealth: 0,
  retChild: 0, retIns: 0, retDebt: 0,
  retEnt: 0, retDining: 0, retPersonal: 0, retMisc: 0,
  hasModifiedRetirement: false,
  hasModifiedContrib: false,
  retYear: 2049, retDuration: 25, inflation: 3.0,
  socialSecurity: 18000, pension: 0, otherIncome: 0,
  currentPortfolio: 0, monthlyContrib: 0,
  contribIncrease: 3.0, annualReturn: 7.0,
  contribStopYear: 0,
  withdrawalRate: 0,
};

// Persist inputs to localStorage so a refresh never wipes progress (errors.md row 3).
// Each value is JSON-encoded so numbers and the boolean round-trip with their types.
export const inputs = persistentMap<FinancialInputs>('finplan:', DEFAULTS, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

// 2. LOGIC: Smart Defaults — seed retirement spending and contribution from Step 1,
// unless the user has modified the retirement sliders (hasModifiedRetirement guard).
inputs.subscribe((val) => {
  if (val.hasModifiedRetirement) return;

  const housing = val.rent + val.propTax + val.utilities + val.internet;
  const transport = val.carPayment + val.carIns + val.gas + val.carMaint;
  const food = val.groceries;
  const health = val.healthIns;
  const child = val.childcare;
  const ins = val.otherIns;
  const debt = val.debtMin;
  const ent = val.ent + val.travel + val.hobbies;
  const dining = val.dining;
  const personal = val.personal + val.clothes + val.gifts + val.dev;
  const misc = val.tech + val.homeImp + val.subscriptions + val.misc;

  inputs.setKey('retHousing', housing);
  inputs.setKey('retTransport', Math.round(transport * 0.5));
  inputs.setKey('retGroceries', food);
  inputs.setKey('retHealth', Math.round(health * 1.3));
  inputs.setKey('retChild', Math.round(child * 0.1));
  inputs.setKey('retIns', Math.round(ins * 1.1));
  inputs.setKey('retDebt', Math.round(debt * 0.2));
  inputs.setKey('retEnt', Math.round(ent * 1.2));
  inputs.setKey('retDining', Math.round(dining * 0.7));
  inputs.setKey('retPersonal', personal);
  inputs.setKey('retMisc', Math.round(misc * 0.8));

  // Seed monthly contribution from total investments (incl. employer match) — but ONLY until
  // the user takes manual control. errors.md row 7: a value hand-entered in Step 4 sets
  // hasModifiedContrib, after which this sync never clobbers it again. Defaults seed; intent wins.
  const totalInvest = val.k401 + val.employerMatch + val.ira + val.hsa + val.taxable + val.emergency + val.edu529 + val.lifeIns;
  if (totalInvest > 0 && !val.hasModifiedContrib) {
    inputs.setKey('monthlyContrib', totalInvest);
  }
});

// ── Canonical projection engine (canonical §3, ratified 2026-06-06) ──────────────
// THE single projection in the app. Every screen reads from this — no component
// recomputes a projection (errors.md row 2).
//
// Month-by-month simulation at the EFFECTIVE monthly rate m = (1+annualRate)^(1/12) − 1,
// so (1+m)^12 = 1+annualRate exactly and the displayed annual return stays honest.
// Contributions post end-of-month, step up by contribGrowth once per year, and stop
// after `yearsContributing` years. Returns end-of-year balances; index 0 = today,
// length = yearsToRet + 1.
//
// Validated in WolframAlpha 2026-06-06: PV $100k, $1,000/mo, g 3%, r 7%, 25 yr →
// lump $542,743.26, contributions $1,031,790.90, total $1,574,534.16 (canonical §5).
function projectAccumulation(
  annualRate: number,        // decimal, e.g. 0.07
  currentPortfolio: number,
  monthlyContrib: number,
  contribGrowth: number,     // decimal, e.g. 0.03
  yearsToRet: number,
  yearsContributing: number,
): number[] {
  const m = Math.pow(1 + annualRate, 1 / 12) - 1;
  const contributingMonths = yearsContributing * 12;
  const series: number[] = [currentPortfolio];
  let balance = currentPortfolio;
  let globalMonth = 0;

  for (let year = 1; year <= yearsToRet; year++) {
    for (let monthInYear = 0; monthInYear < 12; monthInYear++) {
      globalMonth += 1;
      balance *= 1 + m;                                   // grow one month
      if (globalMonth <= contributingMonths) {            // end-of-month contribution
        const stepUps = Math.floor((globalMonth - 1) / 12);
        balance += monthlyContrib * Math.pow(1 + contribGrowth, stepUps);
      }
    }
    series.push(balance);
  }
  return series;
}

// ── Monte Carlo stochastic layer (canonical §10) ────────────────────────────────
// Seeded so identical inputs always produce identical bands and success rate
// (reproducible, testable, no render flicker — canonical §10.3).
const MC_TRIALS = 1000;
const MC_SEED = 0x9e3779b9;
const SIGMA_ACCUM = 0.16; // canonical §10.2 (S&P long-run σ, trimmed)
const SIGMA_RET = 0.10;   // canonical §10.2 (60/40 σ)

// mulberry32 — small deterministic PRNG, uniform [0,1).
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Standard normal via Box–Muller from a uniform generator.
function makeNormal(rand: () => number): () => number {
  return function () {
    let u1 = rand();
    const u2 = rand();
    if (u1 < 1e-12) u1 = 1e-12;
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  };
}

// Lognormal annual gross-return params, moment-matched to arithmetic mean (1+mu)
// and volatility sigma so E[G]=1+mu, Var[G]=sigma^2 exactly (canonical §10.1).
function lognormalParams(mu: number, sigma: number): { nu: number; s: number } {
  const M = 1 + mu;
  const s2 = Math.log(1 + (sigma * sigma) / (M * M));
  return { nu: Math.log(M) - s2 / 2, s: Math.sqrt(s2) };
}

interface PercentilePoint { year: number; p10: number; p50: number; p90: number; }
interface MonteCarloResult {
  successProbability: number;          // fraction of trials surviving the full retirement
  cone: PercentilePoint[];             // accumulation percentile bands (Step 4)
  medianPortfolio: number;             // p50 balance at retirement
  netWorthCone: PercentilePoint[];     // FULL lifecycle bands incl. drawdown (Step 5 — shows depletion)
}

// One seeded Monte Carlo over the full lifecycle: stochastic accumulation, then
// stochastic drawdown with sequence-of-returns risk (return applied BEFORE the
// withdrawal each year, so a bad early sequence can permanently impair the plan).
function runMonteCarlo(
  annualReturn: number, currentPortfolio: number, monthlyContrib: number, contribGrowth: number,
  yearsToRet: number, yearsContributing: number,
  retReturn: number, retDuration: number, inflatingNet: number, flatIncome: number, inflation: number,
  currentYear: number,
): MonteCarloResult {
  const rand = mulberry32(MC_SEED);
  const normal = makeNormal(rand);
  const accumP = lognormalParams(annualReturn, SIGMA_ACCUM);
  const retP = lognormalParams(retReturn, SIGMA_RET);
  const annualContrib = monthlyContrib * 12;

  const accumByYear: number[][] = Array.from({ length: yearsToRet + 1 }, () => []);
  const retByYear: number[][] = Array.from({ length: retDuration + 1 }, () => []); // index 1..retDuration
  let successes = 0;

  for (let t = 0; t < MC_TRIALS; t++) {
    let bal = currentPortfolio;
    accumByYear[0].push(bal);
    for (let y = 1; y <= yearsToRet; y++) {
      bal *= Math.exp(accumP.nu + accumP.s * normal());          // sampled annual growth
      if (y <= yearsContributing) bal += annualContrib * Math.pow(1 + contribGrowth, y - 1);
      accumByYear[y].push(bal);
    }

    // Drawdown — sequence-of-returns risk: grow, THEN withdraw, each year in order.
    // Record EVERY year (not just until depletion) so the net-worth band shows depleting
    // paths honestly; once a path hits 0 it stays at 0.
    let rbal = bal;
    let survived = true;
    for (let y = 1; y <= retDuration; y++) {
      // SS-adjusted spending grows with CPI; the flat (non-COLA) pension/other is then netted off.
      const withdrawal = Math.max(0, inflatingNet * Math.pow(1 + inflation, y - 1) - flatIncome);
      rbal = rbal * Math.exp(retP.nu + retP.s * normal()) - withdrawal;
      if (rbal <= 0) { rbal = 0; survived = false; }
      retByYear[y].push(rbal);
    }
    if (survived) successes++;
  }

  const pct = (sorted: number[], p: number) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
  const band = (arr: number[], year: number): PercentilePoint => {
    const s = arr.slice().sort((a, b) => a - b);
    return { year, p10: pct(s, 0.1), p50: pct(s, 0.5), p90: pct(s, 0.9) };
  };
  const cone = accumByYear.map((arr, idx) => band(arr, currentYear + idx));
  const retYearAbs = currentYear + yearsToRet;
  const retCone: PercentilePoint[] = [];
  for (let y = 1; y <= retDuration; y++) retCone.push(band(retByYear[y], retYearAbs + y));

  return {
    successProbability: successes / MC_TRIALS,
    cone,
    medianPortfolio: cone.length ? cone[cone.length - 1].p50 : currentPortfolio,
    netWorthCone: [...cone, ...retCone],
  };
}

// 3. ENGINE: Financial calculations
export const results = computed(inputs, (i) => {
  const currentYear = new Date().getFullYear();
  const yearsToRet = Math.max(0, i.retYear - currentYear);
  const inflationMult = Math.pow(1 + i.inflation / 100, yearsToRet);

  // A. Withdrawal rate (Trinity Study — canonical §1). Every branch below (incl. the final
  // else) assigns, so no dead initial value — the bracket fully determines the rate.
  let withdrawalRate: number;
  if (i.withdrawalRate > 0) {
    withdrawalRate = i.withdrawalRate / 100;
  } else if (i.retDuration >= 35) {
    withdrawalRate = 0.035;
  } else if (i.retDuration >= 25) {
    withdrawalRate = 0.040;
  } else if (i.retDuration >= 15) {
    withdrawalRate = 0.045;
  } else {
    withdrawalRate = 0.050;
  }

  // B. The Number (canonical §2)
  const annualRetSpend = (i.retHousing + i.retTransport + i.retGroceries + i.retHealth +
    i.retChild + i.retIns + i.retDebt + i.retEnt + i.retDining +
    i.retPersonal + i.retMisc) * 12;
  const futureAnnualNeed = annualRetSpend * inflationMult;
  const futureIncome = (i.socialSecurity + i.pension + i.otherIncome) * inflationMult;
  const netNeed = Math.max(0, futureAnnualNeed - futureIncome);
  const requiredPortfolio = withdrawalRate > 0 ? netNeed / withdrawalRate : 0;

  // Row 9 (canonical §2): SS keeps pace with CPI (COLA); pension + other are FIXED NOMINAL
  // (no COLA — a deliberately conservative default). So during retirement the portfolio's draw
  // grows faster than CPI as the pension's real value erodes. `inflatingNet` (spending − SS)
  // grows with CPI; `flatIncome` (pension + other) is held flat. At t=1 the draw equals netNeed.
  const ssRet = i.socialSecurity * inflationMult;                 // COLA'd
  const flatIncome = (i.pension + i.otherIncome) * inflationMult; // fixed nominal in retirement
  const inflatingNet = Math.max(0, futureAnnualNeed - ssRet);

  // C. Projection — single canonical engine (canonical §3)
  const r = i.annualReturn / 100;
  const g = i.contribIncrease / 100;
  const contribStopYear = i.contribStopYear > 0 ? i.contribStopYear : i.retYear;
  const yearsContributing = Math.max(0, Math.min(yearsToRet, contribStopYear - currentYear));

  const expectedSeries = projectAccumulation(r, i.currentPortfolio, i.monthlyContrib, g, yearsToRet, yearsContributing);
  // Deterministic MEAN path — the engine's compounding result. Retained (canonical §5 LOCKED,
  // single-engine guard), but NOT the headline: the user-facing "projected" number is the MC
  // median below (mean > median for right-skewed returns — errors.md row 13).
  const projectedPortfolio = expectedSeries[expectedSeries.length - 1];
  const gap = projectedPortfolio - requiredPortfolio;
  // D. Gap solver moved below — it now closes the MEDIAN gap (needs the Monte Carlo result).

  // E. Net worth series — accumulation reuses the canonical engine (so it ends exactly
  // at projectedPortfolio), then the post-retirement drawdown (canonical §4).
  const netWorthData: { year: number; netWorth: number; phase: string }[] =
    expectedSeries.map((netWorth, idx) => ({
      year: currentYear + idx,
      netWorth,
      phase: 'Pre-Retirement',
    }));

  const retirementReturnRate = Math.max(0.04, r * 0.85); // realistic ~60/40 retirement return (canonical §4, ratified 2026-06-07)
  let portfolioAtRetirement = projectedPortfolio;
  for (let yearOffset = 1; yearOffset <= i.retDuration; yearOffset++) {
    let netWorth = portfolioAtRetirement * (1 + retirementReturnRate);
    // Per-year net draw: SS-adjusted spending grows with CPI, flat (non-COLA) income netted off (§2, row 9).
    const annualWithdrawalInflated = Math.max(0, inflatingNet * Math.pow(1 + i.inflation / 100, yearOffset - 1) - flatIncome);
    netWorth = Math.max(0, netWorth - annualWithdrawalInflated);
    netWorthData.push({ year: i.retYear + yearOffset, netWorth, phase: 'Retirement' });
    portfolioAtRetirement = netWorth;
  }

  // F. Spending breakdown for the budget ribbon.
  // employerMatch is shown in the investments total but excluded from budget allocation (not take-home pay).
  const currentFixed = i.rent + i.propTax + i.utilities + i.internet + i.carPayment + i.carIns + i.gas + i.carMaint + i.groceries + i.healthIns + i.otherIns + i.debtMin + i.childcare + i.banking;
  const currentInvest = i.k401 + i.employerMatch + i.ira + i.hsa + i.taxable + i.emergency + i.edu529 + i.lifeIns;
  const currentInvestForBudget = i.k401 + i.ira + i.hsa + i.taxable + i.emergency + i.edu529 + i.lifeIns;
  const currentGuiltFree = i.dining + i.ent + i.travel + i.hobbies + i.personal + i.clothes + i.gifts + i.dev + i.tech + i.homeImp + i.subscriptions + i.misc;
  const totalAllocated = currentFixed + currentInvestForBudget + currentGuiltFree;

  // G. Monte Carlo (canonical §10) — the real probability layer. Seeded, so the same
  // plan always yields the same success rate and percentile cone. The deterministic
  // projectedPortfolio above remains the mean/expected path (canonical §5, LOCKED);
  // the MC adds the distribution around it and the retirement-survival probability.
  const mc = runMonteCarlo(
    r, i.currentPortfolio, i.monthlyContrib, g, yearsToRet, yearsContributing,
    retirementReturnRate, i.retDuration, inflatingNet, flatIncome, i.inflation / 100, currentYear,
  );

  // ── Headline projection = the MC MEDIAN (the typical outcome the user should plan around).
  // Every user-facing "projected / surplus / progress / additional-needed" number reads from
  // the median so it matches the net-worth chart and the success rate — one number, one story
  // (Pattern 1; errors.md row 13). The deterministic mean (projectedPortfolio/gap) is retained
  // above as the engine value but is no longer headlined.
  const medianGap = mc.medianPortfolio - requiredPortfolio;

  // D. Gap solver — additional monthly contribution to lift the MEDIAN outcome to the target.
  let monthlyShortfall = 0;
  if (medianGap < 0 && yearsContributing > 0) {
    const m = Math.pow(1 + r, 1 / 12) - 1;
    const monthsToRet = yearsToRet * 12;
    const contributingMonths = yearsContributing * 12;
    let factorSum = 0;
    for (let k = 1; k <= contributingMonths; k++) factorSum += Math.pow(1 + m, monthsToRet - k);
    if (factorSum > 0) monthlyShortfall = Math.abs(medianGap) / factorSum;
  }

  return {
    inflationMult, withdrawalRate, yearsToRet,
    annualRetSpend, futureAnnualNeed,
    // Has the user entered a retirement-spend target yet? The single source of the "is the plan
    // ready to summarize?" predicate, so Step 4 and Step 5 don't each recompute it (Pattern 1).
    planReady: annualRetSpend > 0,
    requiredPortfolio, projectedPortfolio, gap,
    monthlyShortfall,
    currentFixed, currentInvest, currentGuiltFree, totalAllocated,
    netWorthData, yearsContributing,
    // Monte Carlo (canonical §10) — the median is the headline projection
    successProbability: mc.successProbability,
    mcCone: mc.cone,
    medianPortfolio: mc.medianPortfolio,
    medianGap,
    mcNetWorthCone: mc.netWorthCone,
  };
});
