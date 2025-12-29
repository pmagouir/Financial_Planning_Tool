import { useState, useMemo } from 'react';
import { FintechCard } from '../ui/FintechCard';
import { MoneyInput } from '../ui/MoneyInput';
import { RangeSlider } from '../ui/RangeSlider';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function CompoundCalculator() {
  // Inputs from line 1756: Initial, Monthly, Rate, Years
  const [initial, setInitial] = useState(10000);
  const [monthly, setMonthly] = useState(500);
  const [rate, setRate] = useState(0.07);
  const [years, setYears] = useState(20);

  // Quick Scenarios handlers (lines 1756 logic)
  const handleScenario = (scenarioRate: number) => {
    setRate(scenarioRate);
  };

  // Calculate compound interest projection
  const projectionData = useMemo(() => {
    const data = [];
    const monthlyRate = rate / 12;
    const totalMonths = years * 12;
    
    let currentBalance = initial;
    let totalPrincipal = initial;
    let totalInterest = 0;
    
    // Add starting point
    data.push({
      year: 0,
      principal: initial,
      interest: 0,
      total: initial,
    });

    // Calculate for each year
    for (let year = 1; year <= years; year++) {
      // Calculate for the 12 months in this year
      for (let month = 1; month <= 12; month++) {
        // Add monthly contribution to principal
        totalPrincipal += monthly;
        currentBalance += monthly;
        
        // Compound the entire balance
        const interestEarned = currentBalance * monthlyRate;
        totalInterest += interestEarned;
        currentBalance += interestEarned;
      }
      
      data.push({
        year,
        principal: totalPrincipal,
        interest: totalInterest,
        total: currentBalance,
      });
    }
    
    return data;
  }, [initial, monthly, rate, years]);

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format percentage
  const formatPercent = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  // Final values
  const finalData = projectionData[projectionData.length - 1];
  const finalTotal = finalData?.total || 0;
  const finalPrincipal = finalData?.principal || 0;
  const finalInterest = finalData?.interest || 0;

  return (
    <div className="space-y-8">
      {/* Quick Scenario Buttons */}
      <FintechCard variant="primary">
        <h3 className="text-lg font-semibold text-shiny-text mb-4">Quick Scenarios</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => handleScenario(0.05)}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              rate === 0.05
                ? 'bg-shiny-info text-white shadow-shiny-card'
                : 'bg-shiny-surface text-shiny-text hover:bg-shiny-border'
            }`}
          >
            Conservative (5%)
          </button>
          <button
            onClick={() => handleScenario(0.07)}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              rate === 0.07
                ? 'bg-shiny-primary text-white shadow-shiny-card'
                : 'bg-shiny-surface text-shiny-text hover:bg-shiny-border'
            }`}
          >
            Moderate (7%)
          </button>
          <button
            onClick={() => handleScenario(0.09)}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              rate === 0.09
                ? 'bg-shiny-success text-white shadow-shiny-card'
                : 'bg-shiny-surface text-shiny-text hover:bg-shiny-border'
            }`}
          >
            Aggressive (9%)
          </button>
        </div>
      </FintechCard>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FintechCard variant="info">
          <h3 className="text-lg font-semibold text-shiny-text mb-4">Investment Inputs</h3>
          <div className="space-y-4">
            <MoneyInput
              label="Initial Investment"
              helperText="Starting amount"
              value={initial}
              onChange={setInitial}
            />
            <MoneyInput
              label="Monthly Contribution"
              helperText="Amount added each month"
              value={monthly}
              onChange={setMonthly}
            />
          </div>
        </FintechCard>

        <FintechCard variant="primary">
          <h3 className="text-lg font-semibold text-shiny-text mb-4">Growth Parameters</h3>
          <div className="space-y-4">
            <RangeSlider
              label="Annual Return Rate"
              value={rate}
              onChange={setRate}
              min={0}
              max={0.15}
              step={0.001}
              formatValue={formatPercent}
              helperText={`Current rate: ${formatPercent(rate)}`}
            />
            <RangeSlider
              label="Years"
              value={years}
              onChange={setYears}
              min={1}
              max={50}
              step={1}
              formatValue={(val) => `${Math.round(val)} years`}
              helperText={`Investment period: ${years} years`}
            />
          </div>
        </FintechCard>
      </div>

      {/* Results Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FintechCard variant="info">
          <div className="text-sm text-shiny-muted mb-2">Total Principal</div>
          <div className="text-2xl font-bold text-shiny-text">
            {formatCurrency(finalPrincipal)}
          </div>
        </FintechCard>
        <FintechCard variant="success">
          <div className="text-sm text-shiny-muted mb-2">Interest Earned</div>
          <div className="text-2xl font-bold text-shiny-text">
            {formatCurrency(finalInterest)}
          </div>
        </FintechCard>
        <FintechCard variant="primary">
          <div className="text-sm text-shiny-muted mb-2">Final Value</div>
          <div className="text-2xl font-bold text-shiny-text">
            {formatCurrency(finalTotal)}
          </div>
        </FintechCard>
      </div>

      {/* Stacked Area Chart */}
      <FintechCard variant="primary">
        <h3 className="text-lg font-semibold text-shiny-text mb-4">Growth Over Time</h3>
        <p className="text-sm text-shiny-muted mb-6">
          Visual breakdown of principal contributions vs. interest earned
        </p>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projectionData}>
              <defs>
                <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="year"
                tick={{ fill: '#94a3b8' }}
                tickLine={{ stroke: '#334155' }}
                label={{ value: 'Years', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
              />
              <YAxis
                tick={{ fill: '#94a3b8' }}
                tickLine={{ stroke: '#334155' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                label={{ value: 'Value ($)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
              />
              <Tooltip
                formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ''}
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f8fafc',
                }}
                labelStyle={{ color: '#f8fafc' }}
              />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
              <Area
                type="monotone"
                dataKey="principal"
                stackId="1"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorPrincipal)"
                name="Total Principal"
              />
              <Area
                type="monotone"
                dataKey="interest"
                stackId="1"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorInterest)"
                name="Interest Earned"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </FintechCard>

      {/* Rule of 72 */}
      <FintechCard variant="info">
        <h3 className="text-lg font-semibold text-shiny-text mb-2">Rule of 72</h3>
        <p className="text-sm text-shiny-muted">
          Your investment will approximately double every{' '}
          <span className="font-bold text-shiny-text">
            {(72 / (rate * 100)).toFixed(1)} years
          </span>{' '}
          at a {formatPercent(rate)} annual return rate.
        </p>
      </FintechCard>
    </div>
  );
}

