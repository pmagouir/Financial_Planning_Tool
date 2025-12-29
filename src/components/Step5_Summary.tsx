import { useStore } from '@nanostores/react';
import { inputs, results } from '../stores/financialPlan';
import { FintechCard } from './ui/FintechCard';
import { MetricCard } from './ui/MetricCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function Step5_Summary() {
  const i = useStore(inputs);
  const res = useStore(results);

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

  // Format percentage
  const formatPercent = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  // Calculate current monthly spending breakdown
  const currentHousing = i.rent + i.propTax + i.utilities + i.internet;
  const currentTransport = i.carPayment + i.carIns + i.gas + i.carMaint;
  const currentFixed = res.currentFixed;
  const currentInvest = res.currentInvest;
  const currentGuiltFree = res.currentGuiltFree;

  // Calculate retirement monthly spending breakdown (always use inputs)
  const retSpending = {
    housing: i.retHousing,
    transport: i.retTransport,
    groceries: i.retGroceries,
    health: i.retHealth,
    child: i.retChild,
    ins: i.retIns,
    debt: i.retDebt,
    ent: i.retEnt,
    dining: i.retDining,
    personal: i.retPersonal,
    misc: i.retMisc,
  };

  const retFixed = retSpending.housing + retSpending.transport + retSpending.groceries + 
                   retSpending.health + retSpending.child + retSpending.ins + retSpending.debt;
  const retGuiltFree = retSpending.ent + retSpending.dining + retSpending.personal + retSpending.misc;

  // Monthly need calculations
  const retMonthlySpend = retSpending.housing + retSpending.transport + retSpending.groceries + 
                          retSpending.health + retSpending.child + retSpending.ins + retSpending.debt +
                          retSpending.ent + retSpending.dining + retSpending.personal + retSpending.misc;
  const monthlyNeedToday = retMonthlySpend;
  const monthlyNeedFuture = monthlyNeedToday * res.inflationMult;

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
        <h1 className="text-4xl font-bold text-shiny-text">Executive Summary</h1>
        <p className="text-xl text-shiny-muted">
          Your complete retirement planning overview
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard variant="info">
          <div className="uppercase text-xs tracking-widest text-text-muted mb-2">Required Portfolio</div>
          <div className="text-4xl font-light tracking-tighter text-white">
            {formatCurrency(res.requiredPortfolio)}
          </div>
        </MetricCard>
        <MetricCard variant="success">
          <div className="uppercase text-xs tracking-widest text-text-muted mb-2">Projected Portfolio</div>
          <div className="text-4xl font-light tracking-tighter text-white">
            {formatCurrency(res.projectedPortfolio)}
          </div>
        </MetricCard>
        <MetricCard variant={res.gap >= 0 ? 'success' : 'warning'}>
          <div className="uppercase text-xs tracking-widest text-text-muted mb-2">Gap</div>
          <div className="text-4xl font-light tracking-tighter text-white">
            {formatCurrency(res.gap)}
          </div>
        </MetricCard>
        <MetricCard variant="primary">
          <div className="uppercase text-xs tracking-widest text-text-muted mb-2">Withdrawal Rate</div>
          <div className="text-4xl font-light tracking-tighter text-white">
            {formatPercent(res.withdrawalRate * 100)}
          </div>
        </MetricCard>
      </div>

      {/* Inflation Impact Analysis - Using MetricCard */}
      <MetricCard variant="primary">
        <h3 className="text-lg font-semibold text-shiny-text mb-4">Inflation Impact Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="text-sm text-shiny-muted">Monthly Need (Today's $)</div>
            <div className="text-3xl font-bold text-shiny-text">
              {formatCurrency(monthlyNeedToday)}
            </div>
            <div className="text-xs text-shiny-muted">
              What you need per month in today's dollars
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-shiny-muted">Monthly Need (Future $)</div>
            <div className="text-3xl font-bold text-shiny-text">
              {formatCurrency(monthlyNeedFuture)}
            </div>
            <div className="text-xs text-shiny-muted">
              What you'll need in {i.retYear} dollars
              <br />
              (Inflation multiplier: {res.inflationMult.toFixed(2)}x)
              <br />
              <span className="font-semibold">Average annual inflation: {i.inflation.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </MetricCard>

      {/* Net Worth Projection Chart */}
      <FintechCard variant="info">
        <h3 className="text-lg font-semibold text-shiny-text mb-4">Net Worth Projection</h3>
        <p className="text-sm text-shiny-muted mb-6">
          Your projected net worth from today through retirement, showing how your portfolio grows during accumulation and changes during withdrawal.
        </p>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={res.netWorthData}>
              <defs>
                <filter id="glow-blue-networth">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="year"
                tick={{ fill: '#94a3b8' }}
                tickLine={{ stroke: '#334155' }}
                label={{ value: 'Year', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
              />
              <YAxis
                tick={{ fill: '#94a3b8' }}
                tickLine={{ stroke: '#334155' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                label={{ value: 'Net Worth', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
              />
              <Tooltip
                formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ''}
                labelFormatter={(label) => `Year: ${label}`}
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f8fafc',
                }}
                labelStyle={{ color: '#f8fafc' }}
              />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
              <Line
                type="monotone"
                dataKey="netWorth"
                stroke="#3b82f6"
                strokeWidth={3}
                filter="url(#glow-blue-networth)"
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
                name="Net Worth"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-shiny-muted">Pre-Retirement (Accumulation)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-shiny-muted">Retirement (Withdrawal)</span>
          </div>
        </div>
      </FintechCard>

      {/* Summary Table 1: Current Monthly Spending */}
      <FintechCard variant="info">
        <h3 className="text-lg font-semibold text-shiny-text mb-4">Current Monthly Spending</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-shiny-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-shiny-text">Category</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-shiny-text">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-shiny-border">
                <td colSpan={2} className="py-2 px-4 text-xs font-semibold text-shiny-muted uppercase">Fixed Costs</td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Housing</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(currentHousing)}
                </td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Transport</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(currentTransport)}
                </td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Groceries</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(i.groceries)}
                </td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Healthcare</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(i.healthIns)}
                </td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Other Insurance</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(i.otherIns)}
                </td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Debt Minimums</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(i.debtMin)}
                </td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Childcare</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(i.childcare)}
                </td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Banking Fees</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(i.banking)}
                </td>
              </tr>
              <tr className="border-b border-shiny-border">
                <td className="py-2 px-4 text-sm font-semibold text-shiny-text">Fixed Costs Subtotal</td>
                <td className="py-2 px-4 text-sm text-right font-bold text-shiny-text">
                  {formatCurrency(currentFixed)}
                </td>
              </tr>
              <tr className="border-b border-shiny-border">
                <td colSpan={2} className="py-2 px-4 text-xs font-semibold text-shiny-muted uppercase">Investments</td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">401(k) Contribution</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(i.k401)}
                </td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Employer 401(k) Match</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(i.employerMatch)}
                </td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">IRA</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(i.ira)}
                </td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">HSA</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(i.hsa)}
                </td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Taxable Brokerage</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(i.taxable)}
                </td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Emergency Fund</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(i.emergency)}
                </td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">529 Education</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(i.edu529)}
                </td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Life Insurance</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(i.lifeIns)}
                </td>
              </tr>
              <tr className="border-b border-shiny-border">
                <td className="py-2 px-4 text-sm font-semibold text-shiny-text">Investments Subtotal</td>
                <td className="py-2 px-4 text-sm text-right font-bold text-shiny-text">
                  {formatCurrency(currentInvest)}
                </td>
              </tr>
              <tr className="border-b border-shiny-border">
                <td colSpan={2} className="py-2 px-4 text-xs font-semibold text-shiny-muted uppercase">Guilt-Free Spending</td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Dining Out</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(i.dining)}
                </td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Entertainment</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(i.ent)}
                </td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Travel</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(i.travel)}
                </td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Hobbies</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(i.hobbies)}
                </td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Personal Care</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(i.personal)}
                </td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Clothes</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(i.clothes)}
                </td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Gifts</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(i.gifts)}
                </td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Personal Development</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(i.dev)}
                </td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Tech</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(i.tech)}
                </td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Home Improvements</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(i.homeImp)}
                </td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Miscellaneous</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(i.misc)}
                </td>
              </tr>
              <tr className="border-b border-shiny-border">
                <td className="py-2 px-4 text-sm font-semibold text-shiny-text">Guilt-Free Spending Subtotal</td>
                <td className="py-2 px-4 text-sm text-right font-bold text-shiny-text">
                  {formatCurrency(currentGuiltFree)}
                </td>
              </tr>
              <tr className="bg-shiny-surface">
                <td className="py-3 px-4 text-base font-bold text-shiny-text">Total Monthly Spending</td>
                <td className="py-3 px-4 text-base text-right font-bold text-shiny-text">
                  {formatCurrency(res.totalAllocated)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </FintechCard>

      {/* Summary Table 2: Retirement Monthly Spending */}
      <FintechCard variant="primary">
        <h3 className="text-lg font-semibold text-shiny-text mb-4">Retirement Monthly Spending</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-shiny-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-shiny-text">Category</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-shiny-text">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-shiny-border">
                <td colSpan={2} className="py-2 px-4 text-xs font-semibold text-shiny-muted uppercase">Fixed Costs</td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Housing</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(retSpending.housing)}
                </td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Transport</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(retSpending.transport)}
                </td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Groceries</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(retSpending.groceries)}
                </td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Healthcare</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(retSpending.health)}
                </td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Childcare</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(retSpending.child)}
                </td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Insurance</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(retSpending.ins)}
                </td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Debt Payments</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(retSpending.debt)}
                </td>
              </tr>
              <tr className="border-b border-shiny-border">
                <td className="py-2 px-4 text-sm font-semibold text-shiny-text">Fixed Costs Subtotal</td>
                <td className="py-2 px-4 text-sm text-right font-bold text-shiny-text">
                  {formatCurrency(retFixed)}
                </td>
              </tr>
              <tr className="border-b border-shiny-border">
                <td colSpan={2} className="py-2 px-4 text-xs font-semibold text-shiny-muted uppercase">Guilt-Free Spending</td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Entertainment</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(retSpending.ent)}
                </td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Dining Out</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(retSpending.dining)}
                </td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Personal Care</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(retSpending.personal)}
                </td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Miscellaneous</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(retSpending.misc)}
                </td>
              </tr>
              <tr className="border-b border-shiny-border">
                <td className="py-2 px-4 text-sm font-semibold text-shiny-text">Guilt-Free Spending Subtotal</td>
                <td className="py-2 px-4 text-sm text-right font-bold text-shiny-text">
                  {formatCurrency(retGuiltFree)}
                </td>
              </tr>
              <tr className="bg-shiny-surface">
                <td className="py-3 px-4 text-base font-bold text-shiny-text">Total Monthly Spending</td>
                <td className="py-3 px-4 text-base text-right font-bold text-shiny-text">
                  {formatCurrency(retMonthlySpend)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </FintechCard>

      {/* Summary Table 3: Retirement Assumptions */}
      <FintechCard variant="success">
        <h3 className="text-lg font-semibold text-shiny-text mb-4">Retirement Assumptions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-shiny-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-shiny-text">Assumption</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-shiny-text">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Retirement Year</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {i.retYear}
                </td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Years to Retirement</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {res.yearsToRet} years
                </td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Retirement Duration</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {i.retDuration} years
                </td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Inflation Rate</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatPercent(i.inflation)}
                </td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Withdrawal Rate</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatPercent(res.withdrawalRate * 100)}
                </td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Annual Return</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatPercent(i.annualReturn)}
                </td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Contribution Increase</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatPercent(i.contribIncrease)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </FintechCard>

      {/* Summary Table 4: Income Sources */}
      <FintechCard variant="warning">
        <h3 className="text-lg font-semibold text-shiny-text mb-4">Retirement Income Sources</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-shiny-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-shiny-text">Income Source</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-shiny-text">Annual Amount (Today's $)</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-shiny-text">Annual Amount (Future $)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Social Security</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(i.socialSecurity)}
                </td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(i.socialSecurity * res.inflationMult)}
                </td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Pension</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(i.pension)}
                </td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(i.pension * res.inflationMult)}
                </td>
              </tr>
              <tr className="border-b border-shiny-surface">
                <td className="py-2 px-4 text-sm text-shiny-text">Other Income</td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(i.otherIncome)}
                </td>
                <td className="py-2 px-4 text-sm text-right font-medium text-shiny-text">
                  {formatCurrency(i.otherIncome * res.inflationMult)}
                </td>
              </tr>
              <tr className="bg-shiny-surface">
                <td className="py-3 px-4 text-base font-bold text-shiny-text">Total Income</td>
                <td className="py-3 px-4 text-base text-right font-bold text-shiny-text">
                  {formatCurrency(i.socialSecurity + i.pension + i.otherIncome)}
                </td>
                <td className="py-3 px-4 text-base text-right font-bold text-shiny-text">
                  {formatCurrency((i.socialSecurity + i.pension + i.otherIncome) * res.inflationMult)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </FintechCard>
    </div>
  );
}

