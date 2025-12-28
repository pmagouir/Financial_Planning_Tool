import { useStore } from '@nanostores/react';
import { inputs, results } from '../../stores/financialPlan';
import { ShinyCard } from '../ui/ShinyCard';
import { MetricCard } from '../ui/MetricCard';
import { MoneyInput } from '../ui/MoneyInput';
import { RangeSlider } from '../ui/RangeSlider';
import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CURRENT_YEAR = new Date().getFullYear();

export function Step3_YourNumber() {
  const i = useStore(inputs);
  const res = useStore(results);

  // Calculate monthly need today
  const monthlyNeedToday = useMemo(() => {
    return i.retHousing + i.retTransport + i.retGroceries + i.retHealth + 
           i.retChild + i.retIns + i.retDebt + i.retEnt + i.retDining + 
           i.retPersonal + i.retMisc;
  }, [i.retHousing, i.retTransport, i.retGroceries, i.retHealth, 
      i.retChild, i.retIns, i.retDebt, i.retEnt, i.retDining, 
      i.retPersonal, i.retMisc]);

  // Calculate monthly need in future dollars
  const monthlyNeedFuture = useMemo(() => {
    return monthlyNeedToday * res.inflationMult;
  }, [monthlyNeedToday, res.inflationMult]);

  // Generate inflation impact data for chart
  const inflationData = useMemo(() => {
    const data = [];
    const yearsToRetirement = res.yearsToRet;
    const inflationRate = i.inflation / 100;
    
    for (let year = 0; year <= yearsToRetirement; year += Math.max(1, Math.floor(yearsToRetirement / 20))) {
      const multiplier = Math.pow(1 + inflationRate, year);
      const futureMonthly = monthlyNeedToday * multiplier;
      data.push({
        year: CURRENT_YEAR + year,
        value: futureMonthly,
        label: `Year ${year}`,
      });
    }
    
    // Always include the retirement year
    if (yearsToRetirement > 0) {
      const finalMultiplier = Math.pow(1 + inflationRate, yearsToRetirement);
      const finalMonthly = monthlyNeedToday * finalMultiplier;
      const lastPoint = data[data.length - 1];
      if (lastPoint.year !== i.retYear) {
        data.push({
          year: i.retYear,
          value: finalMonthly,
          label: `Retirement`,
        });
      }
    }
    
    return data;
  }, [i.retYear, i.inflation, monthlyNeedToday, res.yearsToRet]);

  // Get withdrawal rate explanation
  const withdrawalRateExplanation = useMemo(() => {
    if (i.retDuration >= 35) {
      return 'Extra conservative rate for retirements lasting 35+ years';
    }
    if (i.retDuration >= 25) {
      return 'Standard 4% rule for 25-35 year retirements (Trinity Study)';
    }
    if (i.retDuration >= 15) {
      return 'Aggressive rate for shorter 15-25 year retirements';
    }
    return 'Short duration rate for retirements under 15 years';
  }, [i.retDuration]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format percentage
  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  // Check if we have valid data
  const hasRetirementData = monthlyNeedToday > 0;

  return (
    <div className="space-y-8">
      {!hasRetirementData && (
        <ShinyCard variant="info">
          <div className="p-6">
            <p className="text-shiny-text">
              Please complete Steps 1 and 2 first to see your retirement number calculations.
            </p>
          </div>
        </ShinyCard>
      )}
      
      {hasRetirementData && (
        <>
      {/* Withdrawal Rate Card */}
      <ShinyCard variant="info">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-shiny-text mb-2">Withdrawal Rate</h3>
              <p className="text-sm text-shiny-muted mb-4">
                Based on the Trinity Study, this rate determines how much you can safely withdraw annually from your portfolio.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-md">
                <span className="text-sm text-shiny-muted">Your Rate:</span>
                <span className="text-2xl font-bold text-blue-600">{formatPercent(res.withdrawalRate)}</span>
              </div>
              <p className="text-xs text-shiny-muted mt-3 italic">
                {withdrawalRateExplanation}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-shiny-muted mb-1">Retirement Duration</div>
              <div className="text-2xl font-bold text-shiny-text">{i.retDuration} years</div>
            </div>
          </div>
        </div>
      </ShinyCard>

      {/* Monthly Need Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetricCard variant="success">
          <div className="text-sm text-shiny-muted mb-2">Monthly Need (Today's Dollars)</div>
          <div className="text-4xl font-bold text-shiny-text mb-2">
            {formatCurrency(monthlyNeedToday)}
          </div>
          <div className="text-xs text-shiny-muted">
            Based on your retirement spending design
          </div>
        </MetricCard>

        <MetricCard variant="primary">
          <div className="text-sm text-shiny-muted mb-2">Monthly Need (Future Dollars)</div>
          <div className="text-4xl font-bold text-shiny-text mb-2">
            {formatCurrency(monthlyNeedFuture)}
          </div>
          <div className="text-xs text-shiny-muted">
            Adjusted for {res.yearsToRet} years of {formatPercent(i.inflation / 100)} inflation
          </div>
        </MetricCard>
      </div>

      {/* Inflation Impact Chart */}
      <ShinyCard variant="info">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-shiny-text mb-4">Inflation Impact Over Time</h3>
          <p className="text-sm text-shiny-muted mb-6">
            See how your monthly retirement need grows due to inflation from today until your retirement year.
          </p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={inflationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="year" 
                  tick={{ fill: '#64748b' }}
                  tickLine={{ stroke: '#cbd5e1' }}
                  label={{ value: 'Year', position: 'insideBottom', offset: -5, fill: '#64748b' }}
                />
                <YAxis 
                  tick={{ fill: '#64748b' }}
                  tickLine={{ stroke: '#cbd5e1' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  label={{ value: 'Monthly Need', angle: -90, position: 'insideLeft', fill: '#64748b' }}
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => `Year: ${label}`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Monthly Need"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </ShinyCard>

      {/* Inputs Section */}
      <ShinyCard variant="info">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-shiny-text mb-6">Retirement Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-shiny-text mb-2">
                Retirement Year
              </label>
              <RangeSlider
                value={i.retYear}
                onChange={(value) => inputs.setKey('retYear', Math.round(value))}
                min={CURRENT_YEAR}
                max={CURRENT_YEAR + 50}
                step={1}
                formatValue={(val) => Math.round(val).toString()}
                helperText="The year you plan to retire"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-shiny-text mb-2">
                Retirement Duration (Years)
              </label>
              <RangeSlider
                value={i.retDuration}
                onChange={(value) => inputs.setKey('retDuration', Math.round(value))}
                min={10}
                max={50}
                step={1}
                formatValue={(val) => `${Math.round(val)} years`}
                helperText="How long you expect retirement to last"
              />
            </div>

            <div>
              <MoneyInput
                label="Annual Social Security"
                helperText="Expected annual Social Security benefits (in today's dollars)"
                value={i.socialSecurity}
                onChange={(value) => inputs.setKey('socialSecurity', value)}
              />
            </div>

            <div>
              <MoneyInput
                label="Annual Pension"
                helperText="Expected annual pension income (in today's dollars)"
                value={i.pension}
                onChange={(value) => inputs.setKey('pension', value)}
              />
            </div>

            <div>
              <MoneyInput
                label="Other Annual Income"
                helperText="Any other expected retirement income (in today's dollars)"
                value={i.otherIncome}
                onChange={(value) => inputs.setKey('otherIncome', value)}
              />
            </div>
          </div>
        </div>
      </ShinyCard>

      {/* Required Portfolio Summary */}
      <ShinyCard variant="success">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-shiny-text mb-2">Your Retirement Number</h3>
              <p className="text-sm text-shiny-muted">
                The total portfolio value you'll need at retirement
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(res.requiredPortfolio)}
              </div>
              <div className="text-xs text-shiny-muted mt-1">
                Based on {formatPercent(res.withdrawalRate)} withdrawal rate
              </div>
            </div>
          </div>
        </div>
      </ShinyCard>
        </>
      )}
    </div>
  );
}
