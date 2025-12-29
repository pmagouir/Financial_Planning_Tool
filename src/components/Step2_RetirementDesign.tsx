import { useStore } from '@nanostores/react';
import { inputs, results } from '../stores/financialPlan';
import { FintechCard } from './ui/FintechCard';
import { RangeSlider } from './ui/RangeSlider';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function Step2_RetirementDesign() {
  const i = useStore(inputs);
  const res = useStore(results);

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Get current values for comparison (from Step 1)
  const getCurrentValue = (category: string): number => {
    switch (category) {
      case 'housing':
        return i.rent + i.propTax + i.utilities + i.internet;
      case 'transport':
        return i.carPayment + i.carIns + i.gas + i.carMaint;
      case 'groceries':
        return i.groceries;
      case 'health':
        return i.healthIns;
      case 'child':
        return i.childcare;
      case 'ins':
        return i.otherIns;
      case 'debt':
        return i.debtMin;
      case 'ent':
        return i.ent + i.travel + i.hobbies;
      case 'dining':
        return i.dining;
      case 'personal':
        return i.personal + i.clothes + i.gifts + i.dev;
      case 'misc':
        return i.tech + i.homeImp + i.misc;
      default:
        return 0;
    }
  };

  // Get retirement value from inputs
  const getRetirementValue = (category: string): number => {
    switch (category) {
      case 'housing': return i.retHousing;
      case 'transport': return i.retTransport;
      case 'groceries': return i.retGroceries;
      case 'health': return i.retHealth;
      case 'child': return i.retChild;
      case 'ins': return i.retIns;
      case 'debt': return i.retDebt;
      case 'ent': return i.retEnt;
      case 'dining': return i.retDining;
      case 'personal': return i.retPersonal;
      case 'misc': return i.retMisc;
      default: return 0;
    }
  };

  // Handle slider change - update value and set flag to stop auto-updates
  const handleSliderChange = (category: string, value: number) => {
    const keyMap: Record<string, string> = {
      housing: 'retHousing',
      transport: 'retTransport',
      groceries: 'retGroceries',
      health: 'retHealth',
      child: 'retChild',
      ins: 'retIns',
      debt: 'retDebt',
      ent: 'retEnt',
      dining: 'retDining',
      personal: 'retPersonal',
      misc: 'retMisc',
    };
    
    inputs.setKey(keyMap[category] as any, value);
    // Set flag to stop auto-updates when user manually adjusts
    inputs.setKey('hasModifiedRetirement', true);
  };

  // Calculate max value for slider (200% of current or $10,000, whichever is higher)
  const getMaxValue = (currentValue: number): number => {
    return Math.max(currentValue * 2, 10000);
  };

  // Categories for sliders
  const categories = [
    { key: 'housing', label: 'Housing' },
    { key: 'transport', label: 'Transport' },
    { key: 'groceries', label: 'Groceries' },
    { key: 'health', label: 'Healthcare' },
    { key: 'child', label: 'Childcare' },
    { key: 'ins', label: 'Insurance' },
    { key: 'debt', label: 'Debt Payments' },
    { key: 'ent', label: 'Entertainment' },
    { key: 'dining', label: 'Dining Out' },
    { key: 'personal', label: 'Personal Care' },
    { key: 'misc', label: 'Miscellaneous' },
  ];

  // Calculate retirement monthly spending
  const retMonthlySpend = (i.retHousing + i.retTransport + i.retGroceries + i.retHealth + 
                           i.retChild + i.retIns + i.retDebt + i.retEnt + i.retDining + 
                           i.retPersonal + i.retMisc);

  // Prepare chart data - matching R line 1421 comparison_chart
  // Side-by-side bars: Current (Purple) vs Retirement (Green)
  const chartData = [
    {
      name: 'Monthly Spending',
      Current: res.totalAllocated,
      Retirement: retMonthlySpend,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Comparison Chart - Replicating R line 1421 */}
      <FintechCard variant="primary">
        <h3 className="text-lg font-semibold text-shiny-text mb-4">Spending Comparison</h3>
        <p className="text-sm text-shiny-muted mb-6">
          Compare your current monthly spending vs. your planned retirement spending
        </p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <defs>
                <filter id="glow-blue">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#94a3b8' }}
                tickLine={{ stroke: '#334155' }}
              />
              <YAxis 
                tick={{ fill: '#94a3b8' }}
                tickLine={{ stroke: '#334155' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
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
              <Bar 
                dataKey="Current" 
                fill="#3b82f6"
                filter="url(#glow-blue)"
                radius={[8, 8, 0, 0]}
                name="Current Spending"
              />
              <Bar 
                dataKey="Retirement" 
                fill="#10b981"
                radius={[8, 8, 0, 0]}
                name="Retirement Spending"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-sm text-shiny-muted mb-1">Current Monthly</div>
            <div className="text-2xl font-bold text-shiny-text">
              {formatCurrency(res.totalAllocated)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-shiny-muted mb-1">Retirement Monthly</div>
            <div className="text-2xl font-bold" style={{ color: '#38ef7d' }}>
              {formatCurrency(retMonthlySpend)}
            </div>
          </div>
        </div>
      </FintechCard>

      {/* Fixed Costs in Retirement */}
      <FintechCard variant="info">
        <h3 className="text-lg font-semibold text-shiny-text mb-4">Fixed Costs in Retirement</h3>
        <p className="text-sm text-shiny-muted mb-6">
          Adjust your expected fixed costs during retirement. Smart defaults are calculated from your current spending.
        </p>
        <div className="space-y-6">
          {categories
            .filter(cat => ['housing', 'transport', 'groceries', 'health', 'child', 'ins', 'debt'].includes(cat.key))
            .map((category) => {
              const currentValue = getCurrentValue(category.key);
              const retirementValue = getRetirementValue(category.key);
              const maxValue = getMaxValue(currentValue || 1000);

              return (
                <div key={category.key} className="space-y-3">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium text-shiny-text">{category.label}</span>
                    <div className="flex items-center gap-4">
                      {/* Current Value in grey text for reference */}
                      <span className="text-shiny-muted text-sm">
                        Current: {formatCurrency(currentValue)}
                      </span>
                      <span className="font-bold text-shiny-text">
                        Future: {formatCurrency(retirementValue)}
                      </span>
                    </div>
                  </div>
                  <RangeSlider
                    value={retirementValue}
                    onChange={(value) => handleSliderChange(category.key, value)}
                    min={0}
                    max={maxValue}
                    step={50}
                    formatValue={formatCurrency}
                  />
                </div>
              );
            })}
        </div>
      </FintechCard>

      {/* Discretionary Spending in Retirement */}
      <FintechCard variant="primary">
        <h3 className="text-lg font-semibold text-shiny-text mb-4">Discretionary Spending in Retirement</h3>
        <p className="text-sm text-shiny-muted mb-6">
          Adjust your expected discretionary spending during retirement. Smart defaults are calculated from your current spending.
        </p>
        <div className="space-y-6">
          {categories
            .filter(cat => ['ent', 'dining', 'personal', 'misc'].includes(cat.key))
            .map((category) => {
              const currentValue = getCurrentValue(category.key);
              const retirementValue = getRetirementValue(category.key);
              const maxValue = getMaxValue(currentValue || 1000);

              return (
                <div key={category.key} className="space-y-3">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium text-shiny-text">{category.label}</span>
                    <div className="flex items-center gap-4">
                      {/* Current Value in grey text for reference */}
                      <span className="text-shiny-muted text-sm">
                        Current: {formatCurrency(currentValue)}
                      </span>
                      <span className="font-bold text-shiny-text">
                        Future: {formatCurrency(retirementValue)}
                      </span>
                    </div>
                  </div>
                  <RangeSlider
                    value={retirementValue}
                    onChange={(value) => handleSliderChange(category.key, value)}
                    min={0}
                    max={maxValue}
                    step={50}
                    formatValue={formatCurrency}
                  />
                </div>
              );
            })}
        </div>
      </FintechCard>
    </div>
  );
}
