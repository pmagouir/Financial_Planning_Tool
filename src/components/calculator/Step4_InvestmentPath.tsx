import { useStore } from '@nanostores/react';
import { calculations, assumptions, currentProfile } from '../../stores/financialPlan';
import { Card } from '../ui/Card';
import { MoneyInput } from '../ui/MoneyInput';
import { RangeSlider } from '../ui/RangeSlider';
import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CURRENT_YEAR = new Date().getFullYear();

export function Step4_InvestmentPath() {
  const calc = useStore(calculations);
  const asm = useStore(assumptions);
  const current = useStore(currentProfile);
  
  // Calculate total current investments from Step 1
  const totalCurrentInvestments = current.retirement401k + current.ira + current.brokerage + current.emergency;

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Generate projection data for chart
  const projectionData = useMemo(() => {
    const data = [];
    const yearsToRetirement = Math.max(0, asm.retirementYear - CURRENT_YEAR);
    const r = asm.annualReturn;
    const rMonthly = r / 12;
    const months = yearsToRetirement * 12;

    // Add current year point
    data.push({
      year: CURRENT_YEAR,
      projected: asm.currentPortfolio,
      required: calc.requiredPortfolio,
    });

    // Calculate for each year
    for (let yearOffset = 1; yearOffset <= yearsToRetirement; yearOffset++) {
      const year = CURRENT_YEAR + yearOffset;
      const totalMonths = yearOffset * 12;

      // Compound current principal by annual return
      let projectedValue = asm.currentPortfolio * Math.pow(1 + r, yearOffset);

      // Add monthly contributions with monthly compounding
      if (rMonthly > 0 && totalMonths > 0) {
        const fvFactor = (Math.pow(1 + rMonthly, totalMonths) - 1) / rMonthly;
        projectedValue += asm.monthlyContribution * fvFactor;
      } else if (totalMonths > 0) {
        projectedValue += asm.monthlyContribution * totalMonths;
      }

      data.push({
        year,
        projected: projectedValue,
        required: calc.requiredPortfolio,
      });
    }

    return data;
  }, [
    asm.currentPortfolio,
    asm.monthlyContribution,
    asm.annualReturn,
    asm.retirementYear,
    calc.requiredPortfolio,
  ]);

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="info">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Current Portfolio</h3>
            <MoneyInput
              label="Current Portfolio Value"
              helperText="Total value of all your current investments (401k, IRA, brokerage, etc.)"
              value={asm.currentPortfolio}
              onChange={(value) => assumptions.setKey('currentPortfolio', value)}
            />
            <div className="mt-4 p-3 bg-slate-50 rounded-md">
              <div className="text-xs text-slate-600 mb-1">Total Monthly Investments (from Step 1)</div>
              <div className="text-lg font-semibold text-slate-900">
                {formatCurrency(totalCurrentInvestments)}
              </div>
            </div>
          </div>
        </Card>

        <Card variant="success">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Monthly Contribution</h3>
            <MoneyInput
              label="Monthly Investment Contribution"
              helperText="How much you'll invest each month going forward"
              value={asm.monthlyContribution}
              onChange={(value) => assumptions.setKey('monthlyContribution', value)}
            />
            <div className="mt-4 p-3 bg-green-50 rounded-md">
              <div className="text-xs text-green-700 mb-1">Tip</div>
              <div className="text-sm text-green-800">
                This defaults to your total monthly investments from Step 1, but you can adjust it.
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Annual Return Selection */}
      <Card variant="primary">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Expected Annual Return</h3>
          <RangeSlider
            label="Annual Return Rate"
            value={asm.annualReturn}
            onChange={(value) => assumptions.setKey('annualReturn', value)}
            min={0.03}
            max={0.12}
            step={0.001}
            formatValue={(val) => `${(val * 100).toFixed(1)}%`}
            helperText="Conservative: 5%, Moderate: 7%, Aggressive: 9%"
          />
          <div className="mt-4 flex gap-4">
            <button
              onClick={() => assumptions.setKey('annualReturn', 0.05)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                asm.annualReturn === 0.05
                  ? 'bg-shiny-info text-white shadow-shiny-card'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Conservative (5%)
            </button>
            <button
              onClick={() => assumptions.setKey('annualReturn', 0.07)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                asm.annualReturn === 0.07
                  ? 'bg-shiny-primary text-white shadow-shiny-card'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Moderate (7%)
            </button>
            <button
              onClick={() => assumptions.setKey('annualReturn', 0.09)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                asm.annualReturn === 0.09
                  ? 'bg-shiny-success text-white shadow-shiny-card'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Aggressive (9%)
            </button>
          </div>
        </div>
      </Card>

      {/* Solver Card - Action Required */}
      {calc.gap < 0 && (
        <div className="rounded-xl border border-slate-200 bg-gradient-warning shadow-shiny-card">
          <div className="p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Action Required</h2>
            <p className="text-xl leading-relaxed">
              You are projected to fall short. To close the gap, you need to invest an additional{' '}
              <span className="font-bold text-2xl">{formatCurrency(calc.monthlyShortfall)}</span> per month.
            </p>
          </div>
        </div>
      )}

      {/* On Track Card */}
      {calc.gap >= 0 && (
        <div className="rounded-xl border border-slate-200 bg-gradient-success shadow-shiny-card">
          <div className="p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">On Track! 🎉</h2>
            <p className="text-xl leading-relaxed">
              You're projected to meet your retirement goal with a surplus of{' '}
              <span className="font-bold text-2xl">{formatCurrency(calc.gap)}</span>.
            </p>
          </div>
        </div>
      )}

      {/* Projection Chart */}
      <Card variant="info">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Portfolio Projection</h3>
          <p className="text-sm text-slate-600 mb-6">
            Your projected portfolio value vs. the required amount for retirement
          </p>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectionData}>
                <defs>
                  <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4facfe" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4facfe" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorRequired" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f5576c" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f5576c" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="year"
                  tick={{ fill: '#64748b' }}
                  tickLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  tick={{ fill: '#64748b' }}
                  tickLine={{ stroke: '#cbd5e1' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="projected"
                  stroke="#4facfe"
                  fillOpacity={1}
                  fill="url(#colorProjected)"
                  name="Projected Portfolio"
                />
                <Area
                  type="monotone"
                  dataKey="required"
                  stroke="#f5576c"
                  strokeDasharray="5 5"
                  fillOpacity={1}
                  fill="url(#colorRequired)"
                  name="Required Portfolio"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </div>
  );
}
