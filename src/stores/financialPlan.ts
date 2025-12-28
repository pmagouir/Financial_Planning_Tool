import { map, computed } from 'nanostores';

// 1. STATE: All Inputs from app.R
export const inputs = map({
  // Tab 1: Current Reality
  takeHomePay: 5000,
  // Fixed
  rent: 0, propTax: 0, utilities: 0, internet: 0,
  carPayment: 0, carIns: 0, gas: 0, carMaint: 0,
  groceries: 0, healthIns: 0, otherIns: 0, debtMin: 0, childcare: 0, banking: 0,
  // Investments
  k401: 0, employerMatch: 0, ira: 0, hsa: 0, taxable: 0, emergency: 0, edu529: 0, lifeIns: 0,
  // Guilt-Free
  dining: 0, ent: 0, travel: 0, hobbies: 0,
  personal: 0, clothes: 0, gifts: 0, dev: 0,
  tech: 0, homeImp: 0, misc: 0,

  // Tab 2: Retirement Design (Sliders)
  retHousing: 0, retTransport: 0, retGroceries: 0, retHealth: 0, 
  retChild: 0, retIns: 0, retDebt: 0, 
  retEnt: 0, retDining: 0, retPersonal: 0, retMisc: 0,
  hasModifiedRetirement: false, // Prevents auto-overwrite if user moves sliders
  
  // Tab 3 & 4: Assumptions
  retYear: 2049, retDuration: 25, inflation: 3.0,
  socialSecurity: 18000, pension: 0, otherIncome: 0,
  currentPortfolio: 50000, monthlyContrib: 1000, 
  contribIncrease: 3.0, annualReturn: 7.0,
});

// 2. LOGIC: Smart Defaults (Replicating app.R lines 1238-1249)
// This watches inputs and pushes updates to retirement fields UNLESS user modified them
inputs.subscribe((val) => {
  if (val.hasModifiedRetirement) return;

  // Calculate the defaults based on current reality
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
  const misc = val.tech + val.homeImp + val.misc;

  // Calculate defaults
  const defaults = {
    retHousing: housing,
    retTransport: Math.round(transport * 0.5),
    retGroceries: food,
    retHealth: Math.round(health * 1.3),
    retChild: Math.round(child * 0.1),
    retIns: Math.round(ins * 1.1),
    retDebt: Math.round(debt * 0.2),
    retEnt: Math.round(ent * 1.2),
    retDining: Math.round(dining * 0.7),
    retPersonal: personal,
    retMisc: Math.round(misc * 0.8),
  };
  
  // Update retirement values with defaults
  // Use setKey to avoid triggering another subscription cycle
  inputs.setKey('retHousing', defaults.retHousing);
  inputs.setKey('retTransport', defaults.retTransport);
  inputs.setKey('retGroceries', defaults.retGroceries);
  inputs.setKey('retHealth', defaults.retHealth);
  inputs.setKey('retChild', defaults.retChild);
  inputs.setKey('retIns', defaults.retIns);
  inputs.setKey('retDebt', defaults.retDebt);
  inputs.setKey('retEnt', defaults.retEnt);
  inputs.setKey('retDining', defaults.retDining);
  inputs.setKey('retPersonal', defaults.retPersonal);
  inputs.setKey('retMisc', defaults.retMisc);
  
  // Also sync monthly contribution with total investments (including employer match)
  const totalInvest = val.k401 + val.employerMatch + val.ira + val.hsa + val.taxable + val.emergency + val.edu529 + val.lifeIns;
  if (totalInvest > 0) {
    inputs.setKey('monthlyContrib', totalInvest);
  }
});


// 3. ENGINE: Financial Calculations (Replicating app.R lines 1191-1243)
export const results = computed(inputs, (i) => {
  const currentYear = new Date().getFullYear();
  const yearsToRet = Math.max(0, i.retYear - currentYear);
  const inflationMult = Math.pow(1 + (i.inflation / 100), yearsToRet);
  
  // A. Withdrawal Rate (Trinity Logic)
  let withdrawalRate = 0.04;
  if (i.retDuration >= 35) withdrawalRate = 0.035;
  else if (i.retDuration >= 25) withdrawalRate = 0.040;
  else if (i.retDuration >= 15) withdrawalRate = 0.045;
  else withdrawalRate = 0.050;

  // B. The Number
  const annualRetSpend = (i.retHousing + i.retTransport + i.retGroceries + i.retHealth + 
                         i.retChild + i.retIns + i.retDebt + i.retEnt + i.retDining + 
                         i.retPersonal + i.retMisc) * 12;
  const futureAnnualNeed = annualRetSpend * inflationMult;
  
  const futureIncome = (i.socialSecurity + i.pension + i.otherIncome) * inflationMult;
  const netNeed = Math.max(0, futureAnnualNeed - futureIncome);
  const requiredPortfolio = netNeed / withdrawalRate;

  // C. Projections (Replicating app.R loop lines 1215-1229)
  const r = i.annualReturn / 100;
  const g = i.contribIncrease / 100;
  
  // FV of Portfolio
  const fvPortfolio = i.currentPortfolio * Math.pow(1 + r, yearsToRet);
  
  // FV of Contributions (Increasing Annuity Formula)
  let fvContrib = 0;
  // Approximation of the R loop for performance:
  if (yearsToRet > 0) {
     if (Math.abs(r - g) < 0.0001) {
        // Special case: r == g
        // FV = n * C * (1+r)^(n-1) approx, but let's stick to the geometric series sum
        // For distinct monthly compounding + annual increase, the R loop is most accurate.
        // We will replicate the simple loop for exact parity:
        for(let y = 1; y <= yearsToRet; y++) {
            const monthly = i.monthlyContrib * Math.pow(1 + g, y - 1);
            const annual = monthly * 12;
            const yearsRemaining = yearsToRet - y;
            fvContrib += annual * Math.pow(1 + r, yearsRemaining);
        }
     } else {
        // Same loop for accuracy
        for(let y = 1; y <= yearsToRet; y++) {
            const monthly = i.monthlyContrib * Math.pow(1 + g, y - 1);
            const annual = monthly * 12;
            const yearsRemaining = yearsToRet - y;
            fvContrib += annual * Math.pow(1 + r, yearsRemaining);
        }
     }
  }
  
  const projectedPortfolio = fvPortfolio + fvContrib;
  const gap = projectedPortfolio - requiredPortfolio;

  // D. Gap Solver (Replicating app.R lines 1459-1475)
  let monthlyShortfall = 0;
  if (gap < 0 && yearsToRet > 0) {
      const shortfall = Math.abs(gap);
      let pvFactor = 0;
      if (Math.abs(g - r) < 0.0001) {
          pvFactor = yearsToRet / (1 + r);
      } else {
          pvFactor = (1 - Math.pow((1 + g)/(1 + r), yearsToRet)) / (r - g);
      }
      const annualPvFactor = pvFactor * 12; // Adjusted for monthly
      // This solves for the *First Year* additional monthly amount needed
      monthlyShortfall = shortfall / (annualPvFactor * Math.pow(1+r, yearsToRet)); 
      // Note: The R code formula was slightly approximated in the logic block 
      // "additional_annual_first_year <- shortfall / annual_pv_factor" 
      // We will match the R logic exactly:
      monthlyShortfall = (shortfall / annualPvFactor) / 12; 
  }

  // E. Spending Breakdown for Ribbon
  const currentFixed = i.rent + i.propTax + i.utilities + i.internet + i.carPayment + i.carIns + i.gas + i.carMaint + i.groceries + i.healthIns + i.otherIns + i.debtMin + i.childcare + i.banking;
  // Note: employerMatch is included in investments total for display, but NOT in budget allocation (not part of take-home pay)
  const currentInvest = i.k401 + i.employerMatch + i.ira + i.hsa + i.taxable + i.emergency + i.edu529 + i.lifeIns;
  // Investments for budget calculation (excludes employer match - not part of take-home pay)
  const currentInvestForBudget = i.k401 + i.ira + i.hsa + i.taxable + i.emergency + i.edu529 + i.lifeIns;
  const currentGuiltFree = i.dining + i.ent + i.travel + i.hobbies + i.personal + i.clothes + i.gifts + i.dev + i.tech + i.homeImp + i.misc;
  // totalAllocated excludes employer match (not part of take-home pay)
  const totalAllocated = currentFixed + currentInvestForBudget + currentGuiltFree;

  return {
    inflationMult, withdrawalRate, yearsToRet,
    annualRetSpend, futureAnnualNeed,
    requiredPortfolio, projectedPortfolio, gap,
    monthlyShortfall,
    currentFixed, currentInvest, currentGuiltFree, totalAllocated
  };
});
