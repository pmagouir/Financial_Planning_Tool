import { useStore } from '@nanostores/react';
import { currentProfile, retirementProfile } from '../../stores/financialPlan';
import { Card } from '../ui/Card';
import { RangeSlider } from '../ui/RangeSlider';

// Format currency for display
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Get current value for a category
const getCurrentValue = (category: string, current: any): number => {
  // Fixed costs categories
  if (['housing', 'transport', 'groceries', 'healthcare', 'childcare', 'insurance', 'debt'].includes(category)) {
    return (current as any)[category] || 0;
  }
  // Spending categories
  return (current as any)[category] || 0;
};

export function Step2_RetirementDesign() {
  const current = useStore(currentProfile);
  const retirement = useStore(retirementProfile);

  // Handle slider change - update value and set isModified to true
  const handleSliderChange = (category: string, value: number) => {
    retirementProfile.setKey(category as any, value);
    retirementProfile.setKey('isModified', true);
  };

  // Calculate max value for slider (200% of current or $10,000, whichever is higher)
  const getMaxValue = (currentValue: number): number => {
    return Math.max(currentValue * 2, 10000);
  };

  // Fixed costs categories
  const fixedCategories = [
    { key: 'housing', label: 'Housing' },
    { key: 'transport', label: 'Transport' },
    { key: 'groceries', label: 'Groceries' },
    { key: 'healthcare', label: 'Healthcare' },
    { key: 'childcare', label: 'Childcare' },
    { key: 'insurance', label: 'Insurance' },
    { key: 'debt', label: 'Debt Payments' },
  ];

  // Spending categories
  const spendingCategories = [
    { key: 'entertainment', label: 'Entertainment' },
    { key: 'dining', label: 'Dining Out' },
    { key: 'personal', label: 'Personal Care' },
    { key: 'misc', label: 'Miscellaneous' },
  ];

  return (
    <div className="space-y-8">
      {/* Fixed Costs Section */}
      <Card variant="info">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Fixed Costs in Retirement</h3>
          <p className="text-sm text-slate-600 mb-6">
            Adjust your expected fixed costs during retirement
          </p>
          <div className="space-y-6">
            {fixedCategories.map((category) => {
              const currentValue = getCurrentValue(category.key, current);
              const futureValue = (retirement as any)[category.key] || 0;
              const maxValue = getMaxValue(currentValue || 1000);

              return (
                <div key={category.key} className="space-y-3">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium text-slate-700">{category.label}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-500">
                        Current: <span className="font-semibold text-slate-700">{formatCurrency(currentValue)}</span>
                      </span>
                      <span className="text-shiny-primary font-bold">
                        Future: {formatCurrency(futureValue)}
                      </span>
                    </div>
                  </div>
                  <RangeSlider
                    value={futureValue}
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
        </div>
      </Card>

      {/* Discretionary Spending Section */}
      <Card variant="primary">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Discretionary Spending in Retirement</h3>
          <p className="text-sm text-slate-600 mb-6">
            Adjust your expected discretionary spending during retirement
          </p>
          <div className="space-y-6">
            {spendingCategories.map((category) => {
              const currentValue = getCurrentValue(category.key, current);
              const futureValue = (retirement as any)[category.key] || 0;
              const maxValue = getMaxValue(currentValue || 1000);

              return (
                <div key={category.key} className="space-y-3">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium text-slate-700">{category.label}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-500">
                        Current: <span className="font-semibold text-slate-700">{formatCurrency(currentValue)}</span>
                      </span>
                      <span className="text-shiny-primary font-bold">
                        Future: {formatCurrency(futureValue)}
                      </span>
                    </div>
                  </div>
                  <RangeSlider
                    value={futureValue}
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
        </div>
      </Card>
    </div>
  );
}
