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
  hasModifiedRetirement: boolean;
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

  // Sync monthly contribution with total investments (including employer match).
  // NOTE (errors.md row 7): this can overwrite a Step 4 hand-entry; gating is a separate spec.
  const totalInvest = val.k401 + val.employerMatch + val.ira + val.hsa + val.taxable + val.emergency + val.edu529 + val.lifeIns;
  if (totalInvest > 0) {
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

// 3. ENGINE: Financial calculations
export const results = computed(inputs, (i) => {
  const currentYear = new Date().getFullYear();
  const yearsToRet = Math.max(0, i.retYear - currentYear);
  const inflationMult = Math.pow(1 + i.inflation / 100, yearsToRet);

  // A. Withdrawal rate (Trinity Study — canonical §1)
  let withdrawalRate = 0.04;
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

  // C. Projection — single canonical engine (canonical §3)
  const r = i.annualReturn / 100;
  const g = i.contribIncrease / 100;
  const contribStopYear = i.contribStopYear > 0 ? i.contribStopYear : i.retYear;
  const yearsContributing = Math.max(0, Math.min(yearsToRet, contribStopYear - currentYear));

  const expectedSeries = projectAccumulation(r, i.currentPortfolio, i.monthlyContrib, g, yearsToRet, yearsContributing);
  const projectedPortfolio = expectedSeries[expectedSeries.length - 1];
  const gap = projectedPortfolio - requiredPortfolio;

  // Scenario cone — the same engine at ±2% return. These are deterministic scenario
  // paths, not a probability distribution (relabel pending errors.md row 1).
  const cautiousSeries = projectAccumulation(Math.max(0.01, r - 0.02), i.currentPortfolio, i.monthlyContrib, g, yearsToRet, yearsContributing);
  const optimisticSeries = projectAccumulation(r + 0.02, i.currentPortfolio, i.monthlyContrib, g, yearsToRet, yearsContributing);
  const coneSeries = expectedSeries.map((expected, idx) => ({
    year: currentYear + idx,
    cautious: cautiousSeries[idx],
    expected,
    optimistic: optimisticSeries[idx],
  }));

  // D. Gap solver — additional first-year monthly contribution to close a negative gap,
  // using the same effective monthly rate as the engine.
  let monthlyShortfall = 0;
  if (gap < 0 && yearsContributing > 0) {
    const m = Math.pow(1 + r, 1 / 12) - 1;
    const monthsToRet = yearsToRet * 12;
    const contributingMonths = yearsContributing * 12;
    let factorSum = 0;
    for (let k = 1; k <= contributingMonths; k++) {
      factorSum += Math.pow(1 + m, monthsToRet - k);
    }
    if (factorSum > 0) monthlyShortfall = Math.abs(gap) / factorSum;
  }

  // E. Net worth series — accumulation reuses the canonical engine (so it ends exactly
  // at projectedPortfolio), then the post-retirement drawdown (canonical §4).
  const netWorthData: { year: number; netWorth: number; phase: string }[] =
    expectedSeries.map((netWorth, idx) => ({
      year: currentYear + idx,
      netWorth,
      phase: 'Pre-Retirement',
    }));

  const retirementReturnRate = Math.max(0.04, r * 0.6); // conservative reallocation in retirement
  let portfolioAtRetirement = projectedPortfolio;
  for (let yearOffset = 1; yearOffset <= i.retDuration; yearOffset++) {
    let netWorth = portfolioAtRetirement * (1 + retirementReturnRate);
    const annualWithdrawalInflated = futureAnnualNeed * Math.pow(1 + i.inflation / 100, yearOffset - 1);
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

  return {
    inflationMult, withdrawalRate, yearsToRet,
    annualRetSpend, futureAnnualNeed,
    requiredPortfolio, projectedPortfolio, gap,
    monthlyShortfall,
    currentFixed, currentInvest, currentGuiltFree, totalAllocated,
    netWorthData, yearsContributing,
    coneSeries,
  };
});
