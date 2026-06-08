import { useStore } from '@nanostores/react';
import { inputs, results } from '../stores/financialPlan';
import { FintechCard } from './ui/FintechCard';
import { MoneyInput } from './ui/MoneyInput';

// Budget Ribbon Component - HUD Style Trading Ticker
function BudgetRibbon() {
  const i = useStore(inputs);
  const res = useStore(results);

  const takeHome = i.takeHomePay;
  const totalAllocated = res.totalAllocated;
  const remaining = takeHome - totalAllocated;
  const remainingPercent = takeHome > 0 ? (remaining / takeHome) * 100 : 0;

  // Determine health indicator color
  let healthColor = '#10b981'; // Green (default: saving)
  let healthGlow = 'rgba(16, 185, 129, 0.5)';
  
  if (totalAllocated > takeHome) {
    healthColor = '#ef4444'; // Red (overspending)
    healthGlow = 'rgba(239, 68, 68, 0.5)';
  } else if (remainingPercent <= 10 && remainingPercent > 0) {
    healthColor = '#f59e0b'; // Amber (balanced)
    healthGlow = 'rgba(245, 158, 11, 0.5)';
  }

  // Format currency with monospace
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="fixed bottom-8 left-8 z-50 print:hidden">
      <div className="fintech-card min-w-[320px]">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
            <span className="text-xs uppercase tracking-widest text-text-secondary font-medium">Budget Status</span>
            <div 
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: healthColor,
                boxShadow: `0 0 8px ${healthGlow}, 0 0 12px ${healthGlow}`,
              }}
            />
          </div>
          
          {/* Main Metrics */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary uppercase tracking-wider">Take Home</span>
              <span className="font-mono text-sm font-semibold text-text-primary">
                {formatCurrency(takeHome)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary uppercase tracking-wider">Allocated</span>
              <span className="font-mono text-sm font-semibold text-text-primary">
                {formatCurrency(totalAllocated)}
              </span>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-secondary uppercase tracking-wider">Remaining</span>
                <div 
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: healthColor,
                    boxShadow: `0 0 6px ${healthGlow}`,
                  }}
                />
              </div>
              <span 
                className="font-mono text-base font-bold"
                style={{ color: healthColor }}
              >
                {formatCurrency(remaining)}
              </span>
            </div>
            
            {/* Percentage */}
            <div className="pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary uppercase tracking-wider">Usage</span>
                <span className="font-mono text-xs font-medium text-text-secondary">
                  {takeHome > 0 ? ((totalAllocated / takeHome) * 100).toFixed(1) : '0.0'}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Step1Props {
  onNext?: () => void;
}

export function Step1_CurrentReality({ onNext }: Step1Props) {
  const i = useStore(inputs);
  const res = useStore(results);

  // Format currency helper
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate category totals
  const housingTotal = i.rent + i.propTax + i.utilities + i.internet;
  const transportTotal = i.carPayment + i.carIns + i.gas + i.carMaint;
  const otherFixedTotal = i.groceries + i.healthIns + i.otherIns + i.debtMin + i.childcare + i.banking;

  // Calculate percentages
  const takeHome = i.takeHomePay;
  const fixedPercent = takeHome > 0 ? (res.currentFixed / takeHome) * 100 : 0;
  const investPercent = takeHome > 0 ? (res.currentInvest / takeHome) * 100 : 0;
  const guiltFreePercent = takeHome > 0 ? (res.currentGuiltFree / takeHome) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Floating Budget HUD */}
      <BudgetRibbon />

      {/* Budget Allocation Visualization */}
      <FintechCard>
        {/* Top row: header + unallocated badge */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-text-secondary font-medium">
              Budget Allocation
            </span>
            <div className="text-lg font-semibold text-white mt-0.5">
              Monthly Budget
              {takeHome > 0 && (
                <span className="font-mono ml-2 text-text-secondary">
                  — {formatCurrency(takeHome)} / mo
                </span>
              )}
            </div>
          </div>
          {takeHome > 0 && res.totalAllocated <= takeHome && (takeHome - res.totalAllocated) > 0 && (
            <div
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '9999px',
                padding: '4px 12px',
              }}
            >
              <span className="text-xs font-mono text-text-secondary">
                Unallocated: {formatCurrency(takeHome - res.totalAllocated)}
              </span>
            </div>
          )}
        </div>

        {/* Stacked progress bar */}
        <div
          style={{
            display: 'flex',
            height: '20px',
            borderRadius: '9999px',
            overflow: 'hidden',
            backgroundColor: '#0f172a',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div
            style={{
              width: `${Math.min(fixedPercent, 100)}%`,
              background: '#3b82f6',
              transition: 'width 0.4s ease',
              flexShrink: 0,
            }}
          />
          <div
            style={{
              width: `${Math.min(investPercent, Math.max(0, 100 - fixedPercent))}%`,
              background: '#10b981',
              transition: 'width 0.4s ease',
              flexShrink: 0,
            }}
          />
          <div
            style={{
              width: `${Math.min(guiltFreePercent, Math.max(0, 100 - fixedPercent - investPercent))}%`,
              background: '#8b5cf6',
              transition: 'width 0.4s ease',
              flexShrink: 0,
            }}
          />
        </div>

        {/* Three stat columns */}
        <div className="grid grid-cols-3 gap-4 mt-5">
          {/* Fixed Costs */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#3b82f6',
                  boxShadow: '0 0 6px rgba(59,130,246,0.7)',
                  flexShrink: 0,
                }}
              />
              <span
                className="text-xs uppercase tracking-widest"
                style={{ color: '#94a3b8' }}
              >
                Fixed Costs
              </span>
            </div>
            <div className="font-mono text-2xl font-semibold text-white">
              {formatCurrency(res.currentFixed)}
            </div>
            <div className="text-sm mt-0.5" style={{ color: '#94a3b8' }}>
              {fixedPercent.toFixed(1)}% of income
            </div>
            <div
              className="text-xs italic mt-1"
              style={{ color: '#94a3b8' }}
            >
              Ramit's target: 50–60%
            </div>
          </div>

          {/* Investing */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 6px rgba(16,185,129,0.7)',
                  flexShrink: 0,
                }}
              />
              <span
                className="text-xs uppercase tracking-widest"
                style={{ color: '#94a3b8' }}
              >
                Investing
              </span>
            </div>
            <div className="font-mono text-2xl font-semibold text-white">
              {formatCurrency(res.currentInvest)}
            </div>
            <div className="text-sm mt-0.5" style={{ color: '#94a3b8' }}>
              {investPercent.toFixed(1)}% of income
            </div>
            <div
              className="text-xs italic mt-1"
              style={{ color: '#94a3b8' }}
            >
              Ramit's target: ≥ 20%
            </div>
          </div>

          {/* Guilt-Free Spending */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#8b5cf6',
                  boxShadow: '0 0 6px rgba(139,92,246,0.7)',
                  flexShrink: 0,
                }}
              />
              <span
                className="text-xs uppercase tracking-widest"
                style={{ color: '#94a3b8' }}
              >
                Guilt-Free Spending
              </span>
            </div>
            <div className="font-mono text-2xl font-semibold text-white">
              {formatCurrency(res.currentGuiltFree)}
            </div>
            <div className="text-sm mt-0.5" style={{ color: '#94a3b8' }}>
              {guiltFreePercent.toFixed(1)}% of income
            </div>
            <div
              className="text-xs italic mt-1"
              style={{ color: '#94a3b8' }}
            >
              Your money, your choice
            </div>
          </div>
        </div>

        {/* Overspending warning */}
        {res.totalAllocated > takeHome && takeHome > 0 && (
          <div
            className="mt-4 flex items-center gap-2 rounded-lg px-4 py-2.5"
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
            }}
          >
            <span style={{ color: '#ef4444', fontSize: '15px' }}>⚠</span>
            <span className="text-sm font-medium" style={{ color: '#ef4444' }}>
              You've allocated {formatCurrency(res.totalAllocated - takeHome)} more than your take-home pay
            </span>
          </div>
        )}

        {/* Unallocated reminder */}
        {takeHome > 0 && res.totalAllocated <= takeHome && (takeHome - res.totalAllocated) > 0 && (
          <div className="mt-3">
            <span className="text-xs" style={{ color: '#94a3b8' }}>
              {formatCurrency(takeHome - res.totalAllocated)} unallocated — consider increasing investments
            </span>
          </div>
        )}

        {/* Attribution */}
        <div
          className="mt-4 pt-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <span className="text-xs italic" style={{ color: '#94a3b8' }}>
            Based on Ramit Sethi's Conscious Spending Plan (I Will Teach You To Be Rich)
          </span>
        </div>
      </FintechCard>

      {/* Monthly Take-Home Input */}
      <FintechCard variant="info">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Monthly Take-Home Pay</h3>
        <MoneyInput
          label="Monthly Take-Home Income"
          helperText="Your after-tax monthly income"
          value={i.takeHomePay}
          onChange={(value) => inputs.setKey('takeHomePay', value)}
        />
      </FintechCard>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fixed Costs Column - Collapsible */}
        <FintechCard variant="info">
          <details className="group">
            <summary className="cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">Fixed Costs</h3>
                  <p className="text-sm text-text-secondary">
                    Essential monthly expenses that stay relatively constant
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-text-primary">
                    {formatCurrency(res.currentFixed)}
                  </div>
                  <div className="text-xs text-text-secondary">Total</div>
                </div>
              </div>
            </summary>
            <div className="space-y-4">
              {/* Housing - Collapsible */}
              <details className="group">
                <summary className="cursor-pointer flex items-center justify-between py-2 px-3 rounded-md hover:bg-background-paper transition-colors">
                  <span className="font-medium text-text-primary">Housing</span>
                  <span className="text-sm text-text-secondary font-semibold">
                    {formatCurrency(housingTotal)}
                  </span>
                </summary>
                <div className="mt-3 space-y-3 pl-4 border-l-2 border-background-subtle">
                  <MoneyInput
                    label="Rent/Mortgage"
                    value={i.rent}
                    onChange={(value) => inputs.setKey('rent', value)}
                  />
                  <MoneyInput
                    label="Property Tax"
                    helperText="Monthly — your annual bill ÷ 12"
                    value={i.propTax}
                    onChange={(value) => inputs.setKey('propTax', value)}
                  />
                  <MoneyInput
                    label="Utilities"
                    value={i.utilities}
                    onChange={(value) => inputs.setKey('utilities', value)}
                  />
                  <MoneyInput
                    label="Internet"
                    value={i.internet}
                    onChange={(value) => inputs.setKey('internet', value)}
                  />
                </div>
              </details>

              {/* Transport - Collapsible */}
              <details className="group">
                <summary className="cursor-pointer flex items-center justify-between py-2 px-3 rounded-md hover:bg-background-paper transition-colors">
                  <span className="font-medium text-text-primary">Transport</span>
                  <span className="text-sm text-text-secondary font-semibold">
                    {formatCurrency(transportTotal)}
                  </span>
                </summary>
                <div className="mt-3 space-y-3 pl-4 border-l-2 border-background-subtle">
                  <MoneyInput
                    label="Car Payment"
                    value={i.carPayment}
                    onChange={(value) => inputs.setKey('carPayment', value)}
                  />
                  <MoneyInput
                    label="Car Insurance"
                    value={i.carIns}
                    onChange={(value) => inputs.setKey('carIns', value)}
                  />
                  <MoneyInput
                    label="Gas"
                    value={i.gas}
                    onChange={(value) => inputs.setKey('gas', value)}
                  />
                  <MoneyInput
                    label="Car Maintenance"
                    value={i.carMaint}
                    onChange={(value) => inputs.setKey('carMaint', value)}
                  />
                </div>
              </details>

              {/* Other Fixed Costs - Collapsible */}
              <details className="group">
                <summary className="cursor-pointer flex items-center justify-between py-2 px-3 rounded-md hover:bg-background-paper transition-colors">
                  <span className="font-medium text-text-primary">Other</span>
                  <span className="text-sm text-text-secondary font-semibold">
                    {formatCurrency(otherFixedTotal)}
                  </span>
                </summary>
                <div className="mt-3 space-y-3 pl-4 border-l-2 border-background-subtle">
                  <MoneyInput
                    label="Groceries"
                    value={i.groceries}
                    onChange={(value) => inputs.setKey('groceries', value)}
                  />
                  <MoneyInput
                    label="Health Insurance"
                    helperText="Monthly premium — your share after any employer contribution"
                    value={i.healthIns}
                    onChange={(value) => inputs.setKey('healthIns', value)}
                  />
                  <MoneyInput
                    label="Other Insurance"
                    helperText="Life, disability, or umbrella, billed monthly"
                    value={i.otherIns}
                    onChange={(value) => inputs.setKey('otherIns', value)}
                  />
                  <MoneyInput
                    label="Debt Minimums"
                    helperText="Monthly minimum payments on loans or cards"
                    value={i.debtMin}
                    onChange={(value) => inputs.setKey('debtMin', value)}
                  />
                  <MoneyInput
                    label="Childcare"
                    value={i.childcare}
                    onChange={(value) => inputs.setKey('childcare', value)}
                  />
                  <MoneyInput
                    label="Banking Fees"
                    helperText="Monthly account, card, or ATM fees"
                    value={i.banking}
                    onChange={(value) => inputs.setKey('banking', value)}
                  />
                </div>
              </details>
            </div>
          </details>
        </FintechCard>

        {/* Investments Column - Collapsible */}
        <FintechCard variant="success">
          <details className="group">
            <summary className="cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">Investments</h3>
                  <p className="text-sm text-text-secondary">
                    Money you're setting aside for the future (including employer match - not part of take-home pay)
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-text-primary">
                    {formatCurrency(res.currentInvest)}
                  </div>
                  <div className="text-xs text-text-secondary">Total</div>
                </div>
              </div>
            </summary>
            <div className="space-y-3">
              <MoneyInput
                label="401(k) Contribution"
                helperText="Your monthly 401(k) contribution (from your paycheck)"
                value={i.k401}
                onChange={(value) => inputs.setKey('k401', value)}
              />
              <MoneyInput
                label="Employer 401(k) Match"
                helperText="Your employer's monthly match (NOT part of take-home pay, but IS part of investments)"
                value={i.employerMatch}
                onChange={(value) => inputs.setKey('employerMatch', value)}
              />
              <MoneyInput
                label="IRA"
                helperText="Monthly into a Roth or traditional IRA"
                value={i.ira}
                onChange={(value) => inputs.setKey('ira', value)}
              />
              <MoneyInput
                label="HSA"
                helperText="Monthly into a health savings account (triple tax-advantaged)"
                value={i.hsa}
                onChange={(value) => inputs.setKey('hsa', value)}
              />
              <MoneyInput
                label="Taxable Brokerage"
                helperText="Monthly into a regular, taxable brokerage account"
                value={i.taxable}
                onChange={(value) => inputs.setKey('taxable', value)}
              />
              <MoneyInput
                label="Emergency Fund"
                helperText="Monthly, until you've saved 3–6 months of expenses"
                value={i.emergency}
                onChange={(value) => inputs.setKey('emergency', value)}
              />
              <MoneyInput
                label="529 Education"
                helperText="Monthly into a 529 college-savings plan"
                value={i.edu529}
                onChange={(value) => inputs.setKey('edu529', value)}
              />
              <MoneyInput
                label="Life Insurance"
                helperText="Monthly premium, if it builds cash value (whole/universal)"
                value={i.lifeIns}
                onChange={(value) => inputs.setKey('lifeIns', value)}
              />
            </div>
          </details>
        </FintechCard>

        {/* Guilt-Free Spending Column - Collapsible */}
        <FintechCard variant="primary">
          <details className="group">
            <summary className="cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">Guilt-Free Spending</h3>
                  <p className="text-xs text-text-secondary italic mb-3">
                    Inspired by Ramit Sethi's conscious spending framework — spend extravagantly on what you love, cut ruthlessly on what you don't.
                  </p>
                  <p className="text-sm text-text-secondary">
                    Money for fun, experiences, and things you love
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-text-primary">
                    {formatCurrency(res.currentGuiltFree)}
                  </div>
                  <div className="text-xs text-text-secondary">Total</div>
                </div>
              </div>
            </summary>
            <div className="space-y-3">
              <MoneyInput
                label="Dining Out"
                value={i.dining}
                onChange={(value) => inputs.setKey('dining', value)}
              />
              <MoneyInput
                label="Entertainment"
                value={i.ent}
                onChange={(value) => inputs.setKey('ent', value)}
              />
              <MoneyInput
                label="Travel"
                value={i.travel}
                onChange={(value) => inputs.setKey('travel', value)}
              />
              <MoneyInput
                label="Hobbies"
                value={i.hobbies}
                onChange={(value) => inputs.setKey('hobbies', value)}
              />
              <MoneyInput
                label="Personal Care"
                value={i.personal}
                onChange={(value) => inputs.setKey('personal', value)}
              />
              <MoneyInput
                label="Clothes"
                value={i.clothes}
                onChange={(value) => inputs.setKey('clothes', value)}
              />
              <MoneyInput
                label="Gifts"
                value={i.gifts}
                onChange={(value) => inputs.setKey('gifts', value)}
              />
              <MoneyInput
                label="Personal Development"
                helperText="Courses, books, or coaching"
                value={i.dev}
                onChange={(value) => inputs.setKey('dev', value)}
              />
              <MoneyInput
                label="Tech"
                value={i.tech}
                onChange={(value) => inputs.setKey('tech', value)}
              />
              <MoneyInput
                label="Home Improvements"
                value={i.homeImp}
                onChange={(value) => inputs.setKey('homeImp', value)}
              />
              <MoneyInput
                label="Subscriptions"
                helperText="Streaming, apps, and memberships"
                value={i.subscriptions}
                onChange={(value) => inputs.setKey('subscriptions', value)}
              />
              <MoneyInput
                label="Miscellaneous"
                helperText="Anything that didn't fit the categories above"
                value={i.misc}
                onChange={(value) => inputs.setKey('misc', value)}
              />
            </div>
          </details>
        </FintechCard>
      </div>

      {/* Next Step Navigation */}
      {onNext && (
        <div className="flex justify-end">
          <button
            onClick={onNext}
            className="mt-2 flex items-center gap-2 px-6 py-3 bg-accent-primary text-white rounded-lg font-medium hover:bg-accent-primary/90 transition-colors"
          >
            Next Step <span>→</span>
          </button>
        </div>
      )}
    </div>
  );
}
