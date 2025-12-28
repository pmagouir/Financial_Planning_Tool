import { useState, useMemo } from 'react';
import { Card } from '../ui/Card';
import { MoneyInput } from '../ui/MoneyInput';
import { RangeSlider } from '../ui/RangeSlider';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function CompoundInterest() {
  const [initial, setInitial] = useState(10000);
  const [monthly, setMonthly] = useState(500);
  const [rate, setRate] = useState(0.07);
  const [years, setYears] = useState(20);

  // Calculate compound interest projection
  const projectionData = useMemo(() => {
    const data = [];
    const monthlyRate = rate / 12;
    const totalMonths = years * 12;
    
    let principal = initial;
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
        principal += monthly;
        
        // Compound the entire balance
        const interestEarned = principal * monthlyRate;
        totalInterest += interestEarned;
        principal += interestEarned;
      }
      
      data.push({
        year,
        principal: totalPrincipal,
        interest: totalInterest,
        total: principal,
      });
    }
    
    return data;
  }, [initial, monthly, rate, years]);

  const finalValue = projectionData[projectionData.length - 1]?.total || initial;
  const totalInvested = initial + (monthly * years * 12);
  const totalInterestEarned = finalValue - totalInvested;

  // Rule of 72 calculation
  const yearsToDouble = 72 / (rate * 100);

  // Format currency
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatCurrencyTooltip = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Compound Interest Calculator</h2>
        <p className="text-slate-600">
          See how your money grows over time with compound interest
        </p>
      </div>

      {/* Inputs */}
      <Card color="blue">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Investment Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div>
              <RangeSlider
                label="Annual Return Rate"
                value={rate}
                onChange={setRate}
                min={0.01}
                max={0.15}
                step={0.001}
                formatValue={(val) => `${(val * 100).toFixed(1)}%`}
                helperText="Expected annual return percentage"
              />
            </div>
            <div>
              <RangeSlider
                label="Time Period (Years)"
                value={years}
                onChange={setYears}
                min={1}
                max={50}
                step={1}
                formatValue={(val) => `${Math.round(val)} years`}
                helperText="How long you'll invest"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Results Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card color="green">
          <div className="p-6">
            <div className="text-sm text-slate-600 mb-2">Final Value</div>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(finalValue)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              After {years} years
            </div>
          </div>
        </Card>

        <Card color="blue">
          <div className="p-6">
            <div className="text-sm text-slate-600 mb-2">Total Invested</div>
            <div className="text-3xl font-bold text-blue-600">
              {formatCurrency(totalInvested)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Principal contributions
            </div>
          </div>
        </Card>

        <Card color="purple">
          <div className="p-6">
            <div className="text-sm text-slate-600 mb-2">Interest Earned</div>
            <div className="text-3xl font-bold text-purple-600">
              {formatCurrency(totalInterestEarned)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              From compounding
            </div>
          </div>
        </Card>
      </div>

      {/* Chart */}
      <Card color="blue">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Growth Over Time</h3>
          <p className="text-sm text-slate-600 mb-6">
            See how your principal contributions and interest earnings stack up over time.
          </p>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectionData}>
                <defs>
                  <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
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
                  tickFormatter={(value) => formatCurrency(value)}
                  label={{ value: 'Value', angle: -90, position: 'insideLeft', fill: '#64748b' }}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    formatCurrencyTooltip(value),
                    name === 'principal' ? 'Principal' : name === 'interest' ? 'Interest' : 'Total'
                  ]}
                  labelFormatter={(label) => `Year: ${label}`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="principal" 
                  stackId="1"
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPrincipal)"
                  name="Principal"
                />
                <Area 
                  type="monotone" 
                  dataKey="interest" 
                  stackId="1"
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorInterest)"
                  name="Interest"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Rule of 72 */}
      <Card color="purple">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">The Rule of 72</h3>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-purple-900 font-medium mb-2">
              At {(rate * 100).toFixed(1)}% annual return, your money will double approximately every:
            </p>
            <p className="text-3xl font-bold text-purple-600 mb-2">
              {yearsToDouble.toFixed(1)} years
            </p>
          </div>
          <div className="prose prose-sm text-slate-600">
            <p>
              The <strong>Rule of 72</strong> is a simple way to estimate how long it takes for an investment to double in value. 
              Divide 72 by your annual return rate (as a percentage) to get the approximate number of years.
            </p>
            <p className="mt-2">
              This rule demonstrates the power of compound interest - the longer you invest, the more dramatic the growth becomes 
              as your interest starts earning interest on itself.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

