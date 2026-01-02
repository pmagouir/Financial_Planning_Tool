import { useStore } from '@nanostores/react';
import { currentProfile, retirementProfile, calculations, assumptions } from '../../stores/financialPlan';
import { Card } from '../ui/Card';

export function Step5_Summary() {
  const current = useStore(currentProfile);
  const retirement = useStore(retirementProfile);
  const calc = useStore(calculations);
  const asm = useStore(assumptions);

  const handlePrint = () => {
    window.print();
  };

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate current monthly spending totals
  const currentFixed = current.housing + current.transport + current.groceries + current.healthcare + current.childcare + current.insurance + current.debt;
  const currentInvestments = current.retirement401k + current.ira + current.brokerage + current.emergency;
  const currentSpending = current.entertainment + current.dining + current.personal + current.misc;
  const currentTotal = currentFixed + currentInvestments + currentSpending;

  // Calculate retirement monthly spending totals
  const retirementFixed = retirement.housing + retirement.transport + retirement.groceries + retirement.healthcare + retirement.childcare + retirement.insurance + retirement.debt;
  const retirementSpending = retirement.entertainment + retirement.dining + retirement.personal + retirement.misc;
  const retirementTotal = retirementFixed + retirementSpending;

  // Monthly need calculations
  const monthlyNeedToday = retirementTotal;
  const monthlyNeedFuture = monthlyNeedToday * calc.inflationMultiplier;

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
    <div className="space-y-8 print-container">
      {/* Print Button */}
      <div className="print:hidden flex justify-end">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 bg-shiny-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium shadow-shiny-card"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Report
        </button>
      </div>

      {/* Executive Summary Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-slate-900">Executive Summary</h1>
        <p className="text-xl text-slate-600">
          Your complete retirement planning overview
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="info">
          <div className="p-6">
            <div className="text-sm text-slate-600 mb-2">Required Portfolio</div>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(calc.requiredPortfolio)}
            </div>
          </div>
        </Card>
        <Card variant="success">
          <div className="p-6">
            <div className="text-sm text-slate-600 mb-2">Projected Portfolio</div>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(calc.projectedPortfolio)}
            </div>
          </div>
        </Card>
        <Card variant={calc.gap >= 0 ? 'success' : 'warning'}>
          <div className="p-6">
            <div className="text-sm text-slate-600 mb-2">Gap</div>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(calc.gap)}
            </div>
          </div>
        </Card>
        <Card variant="primary">
          <div className="p-6">
            <div className="text-sm text-slate-600 mb-2">Withdrawal Rate</div>
            <div className="text-2xl font-bold text-slate-900">
              {(calc.withdrawalRate * 100).toFixed(1)}%
            </div>
          </div>
        </Card>
      </div>

      {/* Inflation Reality Card */}
      <Card variant="primary">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Inflation Reality</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="text-sm text-slate-600">Monthly Need (Today's $)</div>
              <div className="text-3xl font-bold text-slate-900">
                {formatCurrency(monthlyNeedToday)}
              </div>
              <div className="text-xs text-slate-500">
                What you need per month in today's dollars
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-slate-600">Monthly Need (Future $)</div>
              <div className="text-3xl font-bold text-shiny-primary">
                {formatCurrency(monthlyNeedFuture)}
              </div>
              <div className="text-xs text-slate-500">
                What you'll need in {asm.retirementYear} dollars
                <br />
                (Inflation multiplier: {calc.inflationMultiplier.toFixed(2)}x)
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Spending Comparison Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Monthly Spending Table */}
        <Card variant="info">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Current Monthly Spending</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Category</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td colSpan={2} className="py-2 px-4 text-xs font-semibold text-slate-500 uppercase">Fixed Costs</td>
                  </tr>
                  {fixedCategories.map((cat) => {
                    const value = (current as any)[cat.key] || 0;
                    return (
                      <tr key={cat.key} className="border-b border-slate-50">
                        <td className="py-2 px-4 text-sm text-slate-700">{cat.label}</td>
                        <td className="py-2 px-4 text-sm text-right font-medium text-slate-900">
                          {formatCurrency(value)}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="border-b border-slate-100">
                    <td className="py-2 px-4 text-sm font-semibold text-slate-700">Fixed Costs Subtotal</td>
                    <td className="py-2 px-4 text-sm text-right font-bold text-slate-900">
                      {formatCurrency(currentFixed)}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td colSpan={2} className="py-2 px-4 text-xs font-semibold text-slate-500 uppercase">Investments</td>
                  </tr>
                  <tr className="border-b border-slate-50">
                    <td className="py-2 px-4 text-sm text-slate-700">401(k)</td>
                    <td className="py-2 px-4 text-sm text-right font-medium text-slate-900">
                      {formatCurrency(current.retirement401k)}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-50">
                    <td className="py-2 px-4 text-sm text-slate-700">IRA</td>
                    <td className="py-2 px-4 text-sm text-right font-medium text-slate-900">
                      {formatCurrency(current.ira)}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-50">
                    <td className="py-2 px-4 text-sm text-slate-700">Brokerage</td>
                    <td className="py-2 px-4 text-sm text-right font-medium text-slate-900">
                      {formatCurrency(current.brokerage)}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-50">
                    <td className="py-2 px-4 text-sm text-slate-700">Emergency Fund</td>
                    <td className="py-2 px-4 text-sm text-right font-medium text-slate-900">
                      {formatCurrency(current.emergency)}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 px-4 text-sm font-semibold text-slate-700">Investments Subtotal</td>
                    <td className="py-2 px-4 text-sm text-right font-bold text-slate-900">
                      {formatCurrency(currentInvestments)}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td colSpan={2} className="py-2 px-4 text-xs font-semibold text-slate-500 uppercase">Guilt-Free Spending</td>
                  </tr>
                  {spendingCategories.map((cat) => {
                    const value = (current as any)[cat.key] || 0;
                    return (
                      <tr key={cat.key} className="border-b border-slate-50">
                        <td className="py-2 px-4 text-sm text-slate-700">{cat.label}</td>
                        <td className="py-2 px-4 text-sm text-right font-medium text-slate-900">
                          {formatCurrency(value)}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="border-b border-slate-100">
                    <td className="py-2 px-4 text-sm font-semibold text-slate-700">Spending Subtotal</td>
                    <td className="py-2 px-4 text-sm text-right font-bold text-slate-900">
                      {formatCurrency(currentSpending)}
                    </td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="py-3 px-4 text-base font-bold text-slate-900">Total Monthly Spending</td>
                    <td className="py-3 px-4 text-base text-right font-bold text-slate-900">
                      {formatCurrency(currentTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Retirement Monthly Spending Table */}
        <Card variant="primary">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Retirement Monthly Spending</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Category</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td colSpan={2} className="py-2 px-4 text-xs font-semibold text-slate-500 uppercase">Fixed Costs</td>
                  </tr>
                  {fixedCategories.map((cat) => {
                    const value = (retirement as any)[cat.key] || 0;
                    return (
                      <tr key={cat.key} className="border-b border-slate-50">
                        <td className="py-2 px-4 text-sm text-slate-700">{cat.label}</td>
                        <td className="py-2 px-4 text-sm text-right font-medium text-slate-900">
                          {formatCurrency(value)}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="border-b border-slate-100">
                    <td className="py-2 px-4 text-sm font-semibold text-slate-700">Fixed Costs Subtotal</td>
                    <td className="py-2 px-4 text-sm text-right font-bold text-slate-900">
                      {formatCurrency(retirementFixed)}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td colSpan={2} className="py-2 px-4 text-xs font-semibold text-slate-500 uppercase">Guilt-Free Spending</td>
                  </tr>
                  {spendingCategories.map((cat) => {
                    const value = (retirement as any)[cat.key] || 0;
                    return (
                      <tr key={cat.key} className="border-b border-slate-50">
                        <td className="py-2 px-4 text-sm text-slate-700">{cat.label}</td>
                        <td className="py-2 px-4 text-sm text-right font-medium text-slate-900">
                          {formatCurrency(value)}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="border-b border-slate-100">
                    <td className="py-2 px-4 text-sm font-semibold text-slate-700">Spending Subtotal</td>
                    <td className="py-2 px-4 text-sm text-right font-bold text-slate-900">
                      {formatCurrency(retirementSpending)}
                    </td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="py-3 px-4 text-base font-bold text-slate-900">Total Monthly Spending</td>
                    <td className="py-3 px-4 text-base text-right font-bold text-slate-900">
                      {formatCurrency(retirementTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}


