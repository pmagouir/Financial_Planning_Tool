import { useMemo } from 'react';
import { useStore } from '@nanostores/react';
import { inputs, results } from '../stores/financialPlan';
import { FintechCard } from './ui/FintechCard';
import { MetricCard } from './ui/MetricCard';
import {
  ComposedChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

// ─── Formatters ────────────────────────────────────────────────────────────────

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const formatLarge = (value: number): string => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${Math.round(value).toLocaleString('en-US')}`;
  return `$${value}`;
};

const formatYAxis = (value: number): string => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
  return `$${value}`;
};

const formatPercent = (value: number): string => `${value.toFixed(1)}%`;

// ─── Custom Tooltip for Net Worth Chart ────────────────────────────────────────

interface TooltipPayloadEntry {
  value: number;
  name: string;
  payload: {
    year: number;
    netWorth: number;
    phase: string;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string | number;
  requiredPortfolio: number;
}

function NetWorthTooltip({ active, payload, label, requiredPortfolio }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const entry = payload[0];
  const value = entry.value;
  const phase = entry.payload?.phase ?? (entry.name === 'Accumulation' ? 'Pre-Retirement' : 'Retirement');
  const diff = value - requiredPortfolio;
  const isAbove = diff >= 0;

  return (
    <div
      style={{
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '10px',
        padding: '12px 16px',
        minWidth: '200px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ color: '#94a3b8', fontSize: '11px', marginBottom: '6px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Year {label}
      </div>
      <div style={{ color: '#f8fafc', fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
        {formatCurrency(value)}
      </div>
      <div style={{
        display: 'inline-block',
        fontSize: '11px',
        fontWeight: 600,
        padding: '2px 8px',
        borderRadius: '9999px',
        marginBottom: '8px',
        backgroundColor: phase === 'Pre-Retirement' ? 'rgba(59,130,246,0.2)' : 'rgba(139,92,246,0.2)',
        color: phase === 'Pre-Retirement' ? '#60a5fa' : '#a78bfa',
      }}>
        {phase === 'Pre-Retirement' ? 'Accumulation' : 'Withdrawal'}
      </div>
      <div style={{ borderTop: '1px solid #334155', paddingTop: '8px', marginTop: '4px' }}>
        <span style={{ fontSize: '11px', color: '#94a3b8' }}>vs Target: </span>
        <span style={{ fontSize: '12px', fontWeight: 700, color: isAbove ? '#22c55e' : '#ef4444' }}>
          {isAbove ? '+' : ''}{formatCurrency(diff)}
        </span>
      </div>
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function Step5_Summary() {
  const i = useStore(inputs);
  const res = useStore(results);

  const handlePrint = () => window.print();

  // ── Spending breakdown ──
  const currentHousing = i.rent + i.propTax + i.utilities + i.internet;
  const currentTransport = i.carPayment + i.carIns + i.gas + i.carMaint;

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

  const retMonthlySpend =
    retSpending.housing + retSpending.transport + retSpending.groceries +
    retSpending.health + retSpending.child + retSpending.ins + retSpending.debt +
    retSpending.ent + retSpending.dining + retSpending.personal + retSpending.misc;

  const monthlyNeedFuture = retMonthlySpend * res.inflationMult;

  // ── Progress toward target ──
  const progressPct = Math.min(100, (res.projectedPortfolio / Math.max(1, res.requiredPortfolio)) * 100);
  const gapIsPositive = res.gap >= 0;

  // ── Chart data: split netWorthData into two connected series ──
  const { accumulationData, withdrawalData } = useMemo(() => {
    const all = res.netWorthData as { year: number; netWorth: number; phase: string }[];
    const accum = all.filter((d) => d.phase === 'Pre-Retirement');
    const withdrawal = all.filter((d) => d.phase === 'Retirement');

    // Bridge point: last accumulation entry heads the withdrawal series so lines connect
    const bridgePoint = accum.length > 0 ? accum[accum.length - 1] : null;

    return {
      accumulationData: accum,
      withdrawalData: bridgePoint ? [bridgePoint, ...withdrawal] : withdrawal,
    };
  }, [res.netWorthData]);

  const retirementYear = i.retYear;

  // ── Spending comparison for grouped bar chart ──
  const spendingComparison = useMemo(() => {
    const raw = [
      {
        category: 'Housing',
        current: currentHousing,
        retirement: retSpending.housing,
      },
      {
        category: 'Transport',
        current: currentTransport,
        retirement: retSpending.transport,
      },
      {
        category: 'Food',
        current: i.groceries,
        retirement: retSpending.groceries,
      },
      {
        category: 'Healthcare',
        current: i.healthIns,
        retirement: retSpending.health,
      },
      {
        category: 'Entertainment',
        current: i.ent + i.travel + i.hobbies,
        retirement: retSpending.ent,
      },
      {
        category: 'Personal',
        current: i.personal + i.clothes + i.gifts,
        retirement: retSpending.personal,
      },
    ];
    return raw.filter((d) => d.current > 0 || d.retirement > 0);
  }, [i, currentHousing, currentTransport, retSpending]);

  // ── Key assumptions grid data ──
  const currentYear = new Date().getFullYear();
  const yearsAway = Math.max(0, retirementYear - currentYear);

  return (
    <div className="space-y-8 print-container">

      {/* ── Print Button ── */}
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

      {/* ── Header ── */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-shiny-text">Executive Summary</h1>
        <p className="text-base text-shiny-muted">
          Your complete retirement planning overview — as of {currentYear}
        </p>
      </div>

      {/* ── 4 Key Metric Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Required Portfolio */}
        <MetricCard variant="info">
          <div className="uppercase text-xs tracking-widest text-text-muted mb-2">Required Portfolio</div>
          <div className="text-3xl font-light tracking-tighter text-white leading-none">
            {formatLarge(res.requiredPortfolio)}
          </div>
          <div className="text-xs text-shiny-muted mt-2">
            To fund {i.retDuration} yrs at {formatPercent(res.withdrawalRate * 100)} withdrawal
          </div>
        </MetricCard>

        {/* Projected Portfolio */}
        <MetricCard variant="success">
          <div className="uppercase text-xs tracking-widest text-text-muted mb-2">Projected Portfolio</div>
          <div className="text-3xl font-light tracking-tighter text-white leading-none">
            {formatLarge(res.projectedPortfolio)}
          </div>
          <div className="text-xs text-shiny-muted mt-2">
            By {retirementYear} at {formatPercent(i.annualReturn)} avg. return
          </div>
        </MetricCard>

        {/* Gap */}
        <MetricCard variant={gapIsPositive ? 'success' : 'warning'}>
          <div className="uppercase text-xs tracking-widest text-text-muted mb-2">
            {gapIsPositive ? 'Surplus' : 'Shortfall'}
          </div>
          <div
            className="text-3xl font-light tracking-tighter leading-none"
            style={{ color: gapIsPositive ? '#22c55e' : '#f97316' }}
          >
            <span style={{ marginRight: '4px', fontSize: '22px' }}>
              {gapIsPositive ? '↑' : '↓'}
            </span>
            {formatLarge(Math.abs(res.gap))}
          </div>
          <div className="text-xs text-shiny-muted mt-2">
            {gapIsPositive
              ? 'You are on track — buffer above target'
              : `Additional ${formatLarge(res.monthlyShortfall)}/mo needed`}
          </div>
        </MetricCard>

        {/* Withdrawal Rate */}
        <MetricCard variant="primary">
          <div className="uppercase text-xs tracking-widest text-text-muted mb-2">Withdrawal Rate</div>
          <div className="text-3xl font-light tracking-tighter text-white leading-none">
            {formatPercent(res.withdrawalRate * 100)}
          </div>
          <div className="text-xs text-shiny-muted mt-2">
            Trinity Study ({i.retDuration} yr retirement)
          </div>
        </MetricCard>

      </div>

      {/* ── Inflation Impact ── */}
      <MetricCard variant="primary">
        <h3 className="text-sm font-semibold text-shiny-text mb-4 uppercase tracking-widest">Inflation Impact</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-xs text-shiny-muted mb-1">Monthly Need (Today's $)</div>
            <div className="text-2xl font-bold text-shiny-text">{formatCurrency(retMonthlySpend)}</div>
          </div>
          <div>
            <div className="text-xs text-shiny-muted mb-1">Monthly Need ({retirementYear} $)</div>
            <div className="text-2xl font-bold text-shiny-text">{formatCurrency(monthlyNeedFuture)}</div>
          </div>
          <div>
            <div className="text-xs text-shiny-muted mb-1">Inflation Multiplier</div>
            <div className="text-2xl font-bold text-shiny-text">{res.inflationMult.toFixed(2)}x</div>
            <div className="text-xs text-shiny-muted mt-1">
              {formatPercent(i.inflation)} avg. annual over {yearsAway} yrs
            </div>
          </div>
        </div>
      </MetricCard>

      {/* ── Progress Bar / Gap Indicator ── */}
      <FintechCard variant="info">
        <h3 className="text-sm font-semibold text-shiny-text mb-4 uppercase tracking-widest">
          Progress Toward Target
        </h3>

        {/* Labels above bar */}
        <div className="flex justify-between text-xs text-shiny-muted mb-2">
          <span>
            Projected: <span className="text-white font-semibold">{formatLarge(res.projectedPortfolio)}</span>
          </span>
          <span>
            Target: <span className="text-white font-semibold">{formatLarge(res.requiredPortfolio)}</span>
          </span>
        </div>

        {/* Bar track */}
        <div
          style={{
            width: '100%',
            height: '16px',
            borderRadius: '9999px',
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progressPct}%`,
              borderRadius: '9999px',
              background: gapIsPositive
                ? 'linear-gradient(90deg, #16a34a, #22c55e)'
                : 'linear-gradient(90deg, #2563eb, #3b82f6)',
              transition: 'width 0.6s ease',
            }}
          />
          {/* Target marker at 100% */}
          {progressPct < 100 && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: '2px',
                backgroundColor: '#ef4444',
                opacity: 0.8,
              }}
            />
          )}
        </div>

        {/* Percentage and gap label below bar */}
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs" style={{ color: gapIsPositive ? '#22c55e' : '#60a5fa' }}>
            {progressPct.toFixed(1)}% of target reached
          </span>
          <span
            className="text-sm font-bold"
            style={{ color: gapIsPositive ? '#22c55e' : '#f97316' }}
          >
            {gapIsPositive
              ? `${formatLarge(res.gap)} surplus`
              : `${formatLarge(Math.abs(res.gap))} shortfall`}
          </span>
        </div>
      </FintechCard>

      {/* ── Net Worth Projection Chart ── */}
      <FintechCard variant="info">
        <h3 className="text-sm font-semibold text-shiny-text mb-1 uppercase tracking-widest">
          Net Worth Projection
        </h3>
        <p className="text-xs text-shiny-muted mb-6">
          Portfolio growth through accumulation (blue) and drawdown during withdrawal (purple).
          The amber line marks retirement; the red line is your target portfolio.
        </p>

        <div style={{ height: '420px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart margin={{ top: 10, right: 24, left: 10, bottom: 20 }}>
              <defs>
                <linearGradient id="gradientBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradientPurple" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

              <XAxis
                dataKey="year"
                type="number"
                domain={['dataMin', 'dataMax']}
                allowDuplicatedCategory={false}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                label={{ value: 'Year', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 11 }}
              />

              <YAxis
                tickFormatter={formatYAxis}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={72}
              />

              <Tooltip
                content={
                  <NetWorthTooltip requiredPortfolio={res.requiredPortfolio} />
                }
              />

              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                iconSize={10}
                wrapperStyle={{ paddingBottom: '16px', fontSize: '12px', color: '#94a3b8' }}
                formatter={(value: string) => (
                  <span style={{ color: '#cbd5e1' }}>{value}</span>
                )}
              />

              {/* Retirement vertical reference line */}
              <ReferenceLine
                x={retirementYear}
                stroke="#f59e0b"
                strokeDasharray="6 4"
                strokeWidth={1.5}
                label={{
                  value: 'Retirement',
                  position: 'top',
                  fill: '#f59e0b',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              />

              {/* Target portfolio horizontal reference line */}
              <ReferenceLine
                y={res.requiredPortfolio}
                stroke="#ef4444"
                strokeDasharray="6 4"
                strokeWidth={1.5}
                label={{
                  value: 'Target',
                  position: 'right',
                  fill: '#ef4444',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              />

              {/* Accumulation area */}
              <Area
                data={accumulationData}
                type="monotone"
                dataKey="netWorth"
                fill="url(#gradientBlue)"
                stroke="#3b82f6"
                strokeWidth={3}
                name="Accumulation"
                dot={false}
                activeDot={{ r: 5, fill: '#3b82f6', stroke: '#1e40af', strokeWidth: 2 }}
                connectNulls
              />

              {/* Withdrawal area */}
              <Area
                data={withdrawalData}
                type="monotone"
                dataKey="netWorth"
                fill="url(#gradientPurple)"
                stroke="#8b5cf6"
                strokeWidth={3}
                name="Withdrawal"
                dot={false}
                activeDot={{ r: 5, fill: '#8b5cf6', stroke: '#6d28d9', strokeWidth: 2 }}
                connectNulls
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Manual phase legend */}
        <div className="mt-4 flex flex-wrap gap-6 text-xs text-shiny-muted">
          <div className="flex items-center gap-2">
            <div style={{ width: 14, height: 14, borderRadius: 3, background: '#3b82f6', opacity: 0.85 }} />
            <span>Accumulation (Pre-Retirement)</span>
          </div>
          <div className="flex items-center gap-2">
            <div style={{ width: 14, height: 14, borderRadius: 3, background: '#8b5cf6', opacity: 0.85 }} />
            <span>Withdrawal (Retirement)</span>
          </div>
          <div className="flex items-center gap-2">
            <div style={{ width: 20, height: 2, background: '#f59e0b' }} />
            <span>Retirement Date</span>
          </div>
          <div className="flex items-center gap-2">
            <div style={{ width: 20, height: 2, background: '#ef4444' }} />
            <span>Target Portfolio</span>
          </div>
        </div>
      </FintechCard>

      {/* ── Two visual cards: Spending Comparison + Key Assumptions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Card A: Spending Comparison Bar Chart */}
        <FintechCard variant="primary">
          <h3 className="text-sm font-semibold text-shiny-text mb-1 uppercase tracking-widest">
            Now vs. Retirement Spending
          </h3>
          <p className="text-xs text-shiny-muted mb-5">Monthly by category</p>

          {spendingComparison.length > 0 ? (
            <div style={{ height: `${Math.max(200, spendingComparison.length * 52)}px` }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={spendingComparison}
                  layout="vertical"
                  margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                  barCategoryGap="28%"
                  barGap={4}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis
                    type="number"
                    tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="category"
                    tick={{ fill: '#cbd5e1', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={80}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [formatCurrency(value), name]}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={9}
                    wrapperStyle={{ fontSize: '11px', color: '#94a3b8', paddingTop: '8px' }}
                  />
                  <Bar dataKey="current" name="Today" fill="#3b82f6" radius={[0, 3, 3, 0]} maxBarSize={14} />
                  <Bar dataKey="retirement" name="Retirement" fill="#8b5cf6" radius={[0, 3, 3, 0]} maxBarSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-shiny-muted text-sm">
              Enter spending data in Step 1 to see comparison
            </div>
          )}
        </FintechCard>

        {/* Card B: Key Assumptions at a Glance */}
        <FintechCard variant="success">
          <h3 className="text-sm font-semibold text-shiny-text mb-1 uppercase tracking-widest">
            Key Assumptions
          </h3>
          <p className="text-xs text-shiny-muted mb-5">At a glance</p>

          <div className="grid grid-cols-2 gap-0">
            {[
              { label: 'Retirement Year', value: String(retirementYear) },
              { label: 'Years Away', value: `${yearsAway} yrs` },
              { label: 'Ret. Duration', value: `${i.retDuration} yrs` },
              { label: 'Return Rate', value: formatPercent(i.annualReturn) },
              { label: 'Withdrawal Rate', value: formatPercent(res.withdrawalRate * 100) },
              { label: 'Inflation', value: formatPercent(i.inflation) },
              { label: 'Contrib. Increase', value: formatPercent(i.contribIncrease) },
              { label: 'Monthly Contrib.', value: formatCurrency(i.monthlyContrib) },
              { label: 'Current Portfolio', value: formatLarge(i.currentPortfolio) },
              { label: 'Inflation Mult.', value: `${res.inflationMult.toFixed(2)}x` },
            ].map((item, idx) => (
              <div
                key={item.label}
                style={{
                  padding: '10px 12px',
                  borderBottom: '1px solid #1e293b',
                  borderRight: idx % 2 === 0 ? '1px solid #1e293b' : 'none',
                  backgroundColor: idx % 4 < 2 ? 'transparent' : 'rgba(255,255,255,0.02)',
                }}
              >
                <div className="text-xs text-shiny-muted leading-tight">{item.label}</div>
                <div className="text-sm font-semibold text-shiny-text mt-0.5">{item.value}</div>
              </div>
            ))}
          </div>
        </FintechCard>
      </div>

      {/* ── Retirement Income Sources ── */}
      <FintechCard variant="warning">
        <h3 className="text-sm font-semibold text-shiny-text mb-1 uppercase tracking-widest">
          Retirement Income Sources
        </h3>
        <p className="text-xs text-shiny-muted mb-5">
          Annual income that reduces portfolio draw — reducing your required portfolio size
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <th className="text-left py-3 px-4 text-xs font-semibold text-shiny-muted uppercase tracking-wider">
                  Source
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-shiny-muted uppercase tracking-wider">
                  Annual (Today's $)
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-shiny-muted uppercase tracking-wider">
                  Annual ({retirementYear} $)
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-shiny-muted uppercase tracking-wider">
                  Portfolio Offset
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Social Security', today: i.socialSecurity },
                { label: 'Pension', today: i.pension },
                { label: 'Other Income', today: i.otherIncome },
              ].map((row, idx) => {
                const future = row.today * res.inflationMult;
                const offset = future / res.withdrawalRate;
                return (
                  <tr
                    key={row.label}
                    style={{
                      borderBottom: '1px solid #1e293b',
                      backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                    }}
                  >
                    <td className="py-3 px-4 text-shiny-text">{row.label}</td>
                    <td className="py-3 px-4 text-right font-medium text-shiny-text">
                      {row.today > 0 ? formatCurrency(row.today) : <span className="text-shiny-muted">—</span>}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-shiny-text">
                      {future > 0 ? formatCurrency(future) : <span className="text-shiny-muted">—</span>}
                    </td>
                    <td className="py-3 px-4 text-right font-medium" style={{ color: offset > 0 ? '#22c55e' : '#64748b' }}>
                      {offset > 0 ? formatLarge(offset) : <span className="text-shiny-muted">—</span>}
                    </td>
                  </tr>
                );
              })}
              {/* Total row */}
              <tr style={{ borderTop: '1px solid #334155', backgroundColor: 'rgba(255,255,255,0.04)' }}>
                <td className="py-3 px-4 font-bold text-shiny-text">Total</td>
                <td className="py-3 px-4 text-right font-bold text-shiny-text">
                  {formatCurrency(i.socialSecurity + i.pension + i.otherIncome)}
                </td>
                <td className="py-3 px-4 text-right font-bold text-shiny-text">
                  {formatCurrency((i.socialSecurity + i.pension + i.otherIncome) * res.inflationMult)}
                </td>
                <td className="py-3 px-4 text-right font-bold" style={{ color: '#22c55e' }}>
                  {formatLarge((i.socialSecurity + i.pension + i.otherIncome) * res.inflationMult / res.withdrawalRate)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </FintechCard>

      {/* ── Disclaimer ── */}
      <div
        style={{
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.08)',
          backgroundColor: 'rgba(255,255,255,0.04)',
          padding: '16px',
          fontSize: '12px',
          color: '#64748b',
          lineHeight: '1.6',
        }}
      >
        These projections are estimates based on constant return assumptions. Actual results will vary based on
        market conditions, tax implications, sequence-of-returns risk, and personal circumstances. This is not
        financial advice — consider reviewing your plan annually with a Certified Financial Planner (CFP).
      </div>

    </div>
  );
}
