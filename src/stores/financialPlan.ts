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
  tech: 0, homeImp: 0, subscriptions: 0, misc: 0,

  // Tab 2: Retirement Design (Sliders)
  retHousing: 0, retTransport: 0, retGroceries: 0, retHealth: 0, 
  retChild: 0, retIns: 0, retDebt: 0, 
  retEnt: 0, retDining: 0, retPersonal: 0, retMisc: 0,
  hasModifiedRetirement: false, // Prevents auto-overwrite if user moves sliders
  
  // Tab 3 & 4: Assumptions
  retYear: 2049, retDuration: 25, inflation: 3.0,
  socialSecurity: 18000, pension: 0, otherIncome: 0,
  currentPortfolio: 0, monthlyContrib: 0, 
  contribIncrease: 3.0, annualReturn: 7.0,
  contribStopYear: 0, // Year to stop contributions (0 = never stop, or retirement year)
  withdrawalRate: 0, // User-defined withdrawal rate (0 = auto-calculate based on duration)
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
  const misc = val.tech + val.homeImp + val.subscriptions + val.misc;

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
  
  // A. Withdrawal Rate (Trinity Logic or User-Defined)
  let withdrawalRate = 0.04;
  if (i.withdrawalRate > 0) {
    // User has set a custom withdrawal rate
    withdrawalRate = i.withdrawalRate / 100;
  } else {
    // Auto-calculate based on duration (Trinity Study)
    if (i.retDuration >= 35) withdrawalRate = 0.035;
    else if (i.retDuration >= 25) withdrawalRate = 0.040;
    else if (i.retDuration >= 15) withdrawalRate = 0.045;
    else withdrawalRate = 0.050;
  }

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
  // Account for contribution stop year if set
  const contribStopYear = i.contribStopYear > 0 ? i.contribStopYear : i.retYear;
  const yearsContributing = Math.max(0, Math.min(yearsToRet, contribStopYear - currentYear));
  
  let fvContrib = 0;
  // Approximation of the R loop for performance:
  if (yearsContributing > 0) {
     if (Math.abs(r - g) < 0.0001) {
        // Special case: r == g
        // FV = n * C * (1+r)^(n-1) approx, but let's stick to the geometric series sum
        // For distinct monthly compounding + annual increase, the R loop is most accurate.
        // We will replicate the simple loop for exact parity:
        for(let y = 1; y <= yearsContributing; y++) {
            const monthly = i.monthlyContrib * Math.pow(1 + g, y - 1);
            const annual = monthly * 12;
            const yearsRemaining = yearsToRet - y;
            fvContrib += annual * Math.pow(1 + r, yearsRemaining);
        }
     } else {
        // Same loop for accuracy
        for(let y = 1; y <= yearsContributing; y++) {
            const monthly = i.monthlyContrib * Math.pow(1 + g, y - 1);
            const annual = monthly * 12;
            const yearsRemaining = yearsToRet - y;
            fvContrib += annual * Math.pow(1 + r, yearsRemaining);
        }
     }
  }
  
  const projectedPortfolio = fvPortfolio + fvContrib;
  const gap = projectedPortfolio - requiredPortfolio;

  // D. Gap Solver - Calculate additional monthly contribution needed
  // This solves for the additional monthly amount needed to close the gap
  // Uses monthly compounding to match the contribution calculation
  let monthlyShortfall = 0;
  if (gap < 0 && yearsContributing > 0) {
      const shortfall = Math.abs(gap);
      const rMonthly = r / 12;
      const gMonthly = g / 12; // Monthly equivalent of annual increase
      
      // Calculate FV factor sum for monthly contributions with monthly compounding
      // Each month's contribution compounds for the remaining months until retirement
      let fvFactorSum = 0;
      const totalMonths = yearsContributing * 12;
      
      for (let month = 0; month < totalMonths; month++) {
          // Contribution amount for this month (increases annually, so use year-based increase)
          const yearIndex = Math.floor(month / 12);
          const monthlyContribAmount = Math.pow(1 + g, yearIndex);
          
          // Months remaining until retirement
          const monthsRemaining = (yearsToRet * 12) - month;
          
          // FV factor: contribution amount * (1 + rMonthly)^monthsRemaining
          const fvFactor = monthlyContribAmount * Math.pow(1 + rMonthly, monthsRemaining);
          fvFactorSum += fvFactor;
      }
      
      // Solve for additional monthly contribution needed (first year amount)
      if (fvFactorSum > 0) {
          monthlyShortfall = shortfall / fvFactorSum;
      }
  }
  
  // Calculate net worth projection data for summary chart
  // This must correctly handle:
  // 1. Portfolio growth from investment returns (every year until retirement)
  // 2. Monthly contributions (with annual increases) until stop year
  // 3. Continued growth (without contributions) after stop year until retirement
  // 4. Retirement withdrawals and growth during retirement
  
  const netWorthData = [];
  const rMonthly = r / 12;
  const contribGrowthRate = i.contribIncrease / 100;
  
  // Start with current portfolio
  let netWorth = i.currentPortfolio;
  
  // Record starting value
  netWorthData.push({
    year: currentYear,
    netWorth,
    phase: 'Pre-Retirement'
  });
  
  // Pre-retirement phase - calculate year by year
  // Key insight: Portfolio grows EVERY year from investment returns
  // Contributions are added only until stop year, but portfolio continues growing after
  
  for (let yearOffset = 1; yearOffset <= yearsToRet; yearOffset++) {
    const year = currentYear + yearOffset;
    
    // Step 1: ALWAYS grow the portfolio from last year's END value (investment returns)
    // This happens EVERY year, regardless of whether contributions continue
    netWorth = netWorth * (1 + r);
    
    // Step 2: Add contributions for this year (ONLY if still contributing)
    if (yearOffset <= yearsContributing) {
      // Calculate the monthly contribution amount for this year
      // Year 1: base monthlyContrib
      // Year 2: monthlyContrib * (1 + contribGrowthRate)
      // Year 3: monthlyContrib * (1 + contribGrowthRate)^2
      const yearContribMultiplier = Math.pow(1 + contribGrowthRate, yearOffset - 1);
      const monthlyContribThisYear = i.monthlyContrib * yearContribMultiplier;
      
      // Add 12 monthly contributions made throughout this year
      // Each contribution is made at the start of a month and compounds until the END of this year
      // Then the total contributions for the year are added to the portfolio
      let totalContributionsThisYear = 0;
      
      for (let month = 0; month < 12; month++) {
        // Contribution made at month 'month' of this year
        // It compounds for the remaining months in this year
        const monthsRemainingInYear = 12 - month;
        const contributionAtYearEnd = monthlyContribThisYear * Math.pow(1 + rMonthly, monthsRemainingInYear);
        totalContributionsThisYear += contributionAtYearEnd;
      }
      
      // Add total contributions for this year to the portfolio
      netWorth += totalContributionsThisYear;
    }
    // If contributions have stopped (yearOffset > yearsContributing), 
    // portfolio just continues growing from investment returns (Step 1 already handled this)
    // NO contributions are added, but portfolio still grows!
    
    netWorthData.push({
      year,
      netWorth,
      phase: 'Pre-Retirement'
    });
  }
  
  // Post-retirement phase
  // During retirement, asset allocation shifts to more conservative (bonds/cash)
  // Use a lower return rate (e.g., 4-5% instead of 7%)
  const retirementReturnRate = Math.max(0.04, r * 0.6); // 60% of pre-retirement rate, minimum 4%
  const annualWithdrawal = futureAnnualNeed;
  let portfolioAtRetirement = netWorthData[netWorthData.length - 1]?.netWorth || 0;
  
  for (let yearOffset = 1; yearOffset <= i.retDuration; yearOffset++) {
    const year = i.retYear + yearOffset;
    
    // Start with portfolio from previous year (or retirement start)
    let netWorth: number = portfolioAtRetirement;
    
    // Apply growth for this year (conservative rate during retirement)
    netWorth = netWorth * (1 + retirementReturnRate);
    
    // Subtract this year's withdrawal (adjusted for inflation since retirement start)
    const annualWithdrawalInflated = annualWithdrawal * Math.pow(1 + (i.inflation / 100), yearOffset - 1);
    netWorth = netWorth - annualWithdrawalInflated;
    
    // Ensure non-negative
    netWorth = Math.max(0, netWorth);
    
    netWorthData.push({
      year,
      netWorth,
      phase: 'Retirement'
    });
    
    // Update for next iteration
    portfolioAtRetirement = netWorth;
  }

  // E. Spending Breakdown for Ribbon
  const currentFixed = i.rent + i.propTax + i.utilities + i.internet + i.carPayment + i.carIns + i.gas + i.carMaint + i.groceries + i.healthIns + i.otherIns + i.debtMin + i.childcare + i.banking;
  // Note: employerMatch is included in investments total for display, but NOT in budget allocation (not part of take-home pay)
  const currentInvest = i.k401 + i.employerMatch + i.ira + i.hsa + i.taxable + i.emergency + i.edu529 + i.lifeIns;
  // Investments for budget calculation (excludes employer match - not part of take-home pay)
  const currentInvestForBudget = i.k401 + i.ira + i.hsa + i.taxable + i.emergency + i.edu529 + i.lifeIns;
  const currentGuiltFree = i.dining + i.ent + i.travel + i.hobbies + i.personal + i.clothes + i.gifts + i.dev + i.tech + i.homeImp + i.subscriptions + i.misc;
  // totalAllocated excludes employer match (not part of take-home pay)
  const totalAllocated = currentFixed + currentInvestForBudget + currentGuiltFree;

  return {
    inflationMult, withdrawalRate, yearsToRet,
    annualRetSpend, futureAnnualNeed,
    requiredPortfolio, projectedPortfolio, gap,
    monthlyShortfall,
    currentFixed, currentInvest, currentGuiltFree, totalAllocated,
    netWorthData, yearsContributing
  };
});
