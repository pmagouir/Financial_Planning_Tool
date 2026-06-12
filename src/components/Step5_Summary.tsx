import { useMemo } from 'react';
import { useStore } from '@nanostores/react';
import { inputs, results } from '../stores/financialPlan';
import { FintechCard } from './ui/FintechCard';
import { MetricCard } from './ui/MetricCard';
import { Button } from './ui/Button';
import { CountUp } from './ui/CountUp';
import { Reveal } from './ui/Reveal';
import { ResultMoment } from './results/ResultMoment';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ComposedChart,
  Area,
  Line,
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
    p10: number;
    p50: number;
    p90: number;
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

  const row = payload[0].payload;
  const median = row.p50;
  const diff = median - requiredPortfolio;
  const isAbove = diff >= 0;

  return (
    <div
      style={{
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '10px',
        padding: '12px 16px',
        minWidth: '230px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ color: '#94a3b8', fontSize: '11px', marginBottom: '6px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Year {label}
      </div>
      <div style={{ color: '#f8fafc', fontSize: '18px', fontWeight: 700 }}>
        {formatCurrency(median)}
      </div>
      <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px' }}>median (typical)</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', fontSize: '12px' }}>
        <span style={{ color: '#94a3b8' }}>10th–90th pct</span>
        <span style={{ fontFamily: 'monospace', color: '#cbd5e1' }}>{formatCurrency(row.p10)} – {formatCurrency(row.p90)}</span>
      </div>
      <div style={{ borderTop: '1px solid #334155', paddingTop: '8px', marginTop: '8px' }}>
        <span style={{ fontSize: '11px', color: '#94a3b8' }}>median vs target: </span>
        <span style={{ fontSize: '12px', fontWeight: 700, color: isAbove ? '#10b981' : '#ef4444' }}>
          {isAbove ? '+' : ''}{formatCurrency(diff)}
        </span>
      </div>
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────

interface Step5Props {
  onEditPlan?: () => void;
}

export function Step5_Summary({ onEditPlan }: Step5Props) {
  const i = useStore(inputs);
  const res = useStore(results);
  const reduce = useReducedMotion();

  const handlePrint = () => window.print();

  // ── Spending breakdown ──
  const currentHousing = i.rent + i.propTax + i.utilities + i.internet + i.phone;
  const currentTransport = i.carPayment + i.carIns + i.gas + i.carMaint + i.metro;

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

  // Single engine (Pattern 1): annualRetSpend already sums the 11 retirement sliders × 12.
  // Read it rather than re-summing here, so Step 3 / Step 4 / Step 5 can never disagree.
  const retMonthlySpend = res.annualRetSpend / 12;

  const monthlyNeedFuture = retMonthlySpend * res.inflationMult;

  // ── Progress toward target ── (uses the MEDIAN projection — the headline number, matching
  // the net-worth chart and success rate; not the deterministic mean. errors.md row 13.)
  const progressPct = Math.min(100, (res.medianPortfolio / Math.max(1, res.requiredPortfolio)) * 100);
  const gapIsPositive = res.medianGap >= 0;

  // Today's-dollars view (errors.md row 15): the engine works in nominal future dollars, but the
  // headline figures are ALSO shown in today's purchasing power (÷ inflationMult) so "your number"
  // doesn't shrink just because you retire sooner (less inflation baked in). Both are displayed.
  const inflMult = res.inflationMult || 1;
  const requiredToday = res.requiredPortfolio / inflMult;
  const medianToday = res.medianPortfolio / inflMult;
  const medianGapToday = res.medianGap / inflMult;
  const p75Today = res.p75AtRetirement / inflMult;

  // ── Chart data: Monte Carlo net-worth band across the full lifecycle (canonical §10) ──
  // Honest replacement for the old smooth deterministic line — the band shows the
  // 10th–90th percentile, so depleting (sequence-of-returns) scenarios are visible.
  // The outcome distribution is heavily right-skewed: over decades the 90th percentile
  // compounds into the tens of millions, which dwarfs the median and the depletion downside.
  // A retirement chart should answer "will it last," so we plot the MEDIAN path + the DOWNSIDE
  // band (10th percentile → median). The explosive upside is reported in the tooltip + the
  // success-probability banner, not drawn as a giant area.
  const netWorthBand = useMemo(
    () => res.mcNetWorthCone.map((p) => ({ year: p.year, p10: p.p10, p50: p.p50, p90: p.p90 })),
    [res.mcNetWorthCone],
  );

  // Scale to the median + target + downside (the decision-relevant range); the upside runs above.
  const peakMedian = netWorthBand.reduce((m, p) => Math.max(m, p.p50), 0);
  const nwYMax = Math.max(res.requiredPortfolio, peakMedian, 1) * 1.5;

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
        category: 'Food & Household',
        current: i.groceries + i.household,
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

  // Zero-target guard (errors.md row 16): with no retirement spend entered, requiredPortfolio is
  // $0 and every headline below collapses to a falsely reassuring "$0 / 100% / Surplus / 100%
  // success." There is nothing to summarize until the user has set what they'll spend in
  // retirement — so show a prompt instead of fake good news. `planReady` comes from the engine
  // (single source, Pattern 1) and is `annualRetSpend > 0`; note requiredPortfolio can legitimately
  // be $0 when passive income fully covers spending — a real funded state, not an empty one (handled below).
  const planReady = res.planReady;
  if (!planReady) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-text-primary">Executive Summary</h1>
        </div>
        <FintechCard variant="info">
          <div className="mx-auto max-w-xl px-6 py-12 text-center space-y-4" role="status">
            <h2 className="text-2xl font-semibold text-text-primary">Your summary isn&apos;t ready yet</h2>
            <p className="text-base text-text-secondary">
              Add your current spending in <span className="font-semibold text-white">Step 1</span> and design your
              retirement lifestyle in <span className="font-semibold text-white">Step 2</span>. Once you&apos;ve set
              what you&apos;ll spend in retirement, your required portfolio, projection, success probability, and
              progress all appear here.
            </p>
            {onEditPlan && (
              <Button onClick={onEditPlan} className="group">
                Start with Step 1
                <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
              </Button>
            )}
          </div>
        </FintechCard>
      </div>
    );
  }

  return (
    <div className="space-y-8 print-container">

      {/* ── Print Button ── */}
      <div className="print:hidden flex justify-end">
        <Button variant="ghost" onClick={handlePrint} className="print:hidden">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Report
        </Button>
      </div>

      {/* ── Header ── */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-text-primary">Executive Summary</h1>
        <p className="text-base text-text-secondary">
          Your complete retirement planning overview — as of {currentYear}
        </p>
      </div>

      {/* ── Flagship result moment — the headline number, your odds, the lifetime timeline ── */}
      <ResultMoment />

      {/* ── The details ── */}
      <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-widest pt-2">The details</h2>

      {/* ── 4 Key Metric Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Required Portfolio */}
        <MetricCard variant="info">
          <div className="uppercase text-xs tracking-widest text-text-secondary mb-2">Required Portfolio</div>
          <div className="text-3xl font-light tracking-tighter text-white leading-none">
            <CountUp value={requiredToday} format={formatLarge} />
          </div>
          <div className="text-xs text-text-secondary mt-2">
            {res.requiredPortfolio === 0 ? (
              <>Your guaranteed income (Social Security / pension) fully covers your {formatCurrency(retMonthlySpend)}/mo retirement spending — no investment portfolio required.</>
            ) : (
              <>In today&apos;s $ · ≈{formatLarge(res.requiredPortfolio)} in {retirementYear}. Funds {formatCurrency(retMonthlySpend)}/mo for {i.retDuration} yrs at {formatPercent(res.withdrawalRate * 100)} — lower spending in Step 2 to lower this.</>
            )}
          </div>
        </MetricCard>

        {/* Projected Portfolio */}
        <MetricCard variant="success">
          <div className="uppercase text-xs tracking-widest text-text-secondary mb-2">Projected Portfolio</div>
          <div className="text-3xl font-light tracking-tighter text-white leading-none">
            <CountUp value={medianToday} format={formatLarge} />
          </div>
          <div className="text-xs text-text-secondary mt-2">
            Median (typical) outcome, in today's $ · ≈{formatLarge(res.medianPortfolio)} in {retirementYear}
          </div>
        </MetricCard>

        {/* Gap */}
        <MetricCard variant={gapIsPositive ? 'success' : 'warning'}>
          <div className="uppercase text-xs tracking-widest text-text-secondary mb-2">
            {gapIsPositive ? 'Surplus' : 'Shortfall'}
          </div>
          <div
            className="text-3xl font-light tracking-tighter leading-none"
            style={{ color: gapIsPositive ? '#10b981' : '#f59e0b' }}
          >
            <span style={{ marginRight: '4px', fontSize: '22px' }}>
              {gapIsPositive ? '↑' : '↓'}
            </span>
            <CountUp value={Math.abs(medianGapToday)} format={formatLarge} />
          </div>
          <div className="text-xs text-text-secondary mt-2">
            {gapIsPositive
              ? "Today's $ buffer above target"
              : `Today's $ gap — add ${formatLarge(res.monthlyShortfall)}/mo to close it`}
          </div>
        </MetricCard>

        {/* Withdrawal Rate */}
        <MetricCard variant="primary">
          <div className="uppercase text-xs tracking-widest text-text-secondary mb-2">Withdrawal Rate</div>
          <div className="text-3xl font-light tracking-tighter text-white leading-none">
            <CountUp value={res.withdrawalRate * 100} format={(n) => `${n.toFixed(1)}%`} />
          </div>
          <div className="text-xs text-text-secondary mt-2">
            Trinity Study ({i.retDuration} yr retirement)
          </div>
        </MetricCard>

      </div>

      {/* ── Inflation Impact ── */}
      <MetricCard variant="primary">
        <h3 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-widest">Inflation Impact</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-xs text-text-secondary mb-1">Monthly Need (Today's $)</div>
            <div className="text-2xl font-bold text-text-primary">{formatCurrency(retMonthlySpend)}</div>
          </div>
          <div>
            <div className="text-xs text-text-secondary mb-1">Monthly Need ({retirementYear} $)</div>
            <div className="text-2xl font-bold text-text-primary">{formatCurrency(monthlyNeedFuture)}</div>
          </div>
          <div>
            <div className="text-xs text-text-secondary mb-1">Inflation Multiplier</div>
            <div className="text-2xl font-bold text-text-primary">{res.inflationMult.toFixed(2)}x</div>
            <div className="text-xs text-text-secondary mt-1">
              {formatPercent(i.inflation)} avg. annual over {yearsAway} yrs
            </div>
          </div>
        </div>
      </MetricCard>

      {/* ── Progress Bar / Gap Indicator ── */}
      <FintechCard variant="info">
        <h3 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-widest">
          Progress Toward Target
        </h3>

        {/* Labels above bar */}
        <div className="flex justify-between text-xs text-text-secondary mb-2">
          <span>
            Projected (median, today's $): <span className="text-white font-semibold">{formatLarge(medianToday)}</span>
          </span>
          <span>
            Target: <span className="text-white font-semibold">{formatLarge(requiredToday)}</span>
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
          <motion.div
            initial={reduce ? false : { width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={reduce ? { duration: 0 } : { duration: 0.9, ease: 'easeOut' }}
            style={{
              height: '100%',
              borderRadius: '9999px',
              background: gapIsPositive
                ? 'linear-gradient(90deg, #16a34a, #10b981)'
                : 'linear-gradient(90deg, #2563eb, #3b82f6)',
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
          <span className="text-xs" style={{ color: gapIsPositive ? '#10b981' : '#60a5fa' }}>
            {progressPct.toFixed(1)}% of target reached
          </span>
          <span
            className="text-sm font-bold"
            style={{ color: gapIsPositive ? '#10b981' : '#f59e0b' }}
          >
            {gapIsPositive
              ? `${formatLarge(medianGapToday)} surplus`
              : `${formatLarge(Math.abs(medianGapToday))} shortfall`}
          </span>
        </div>
      </FintechCard>

      {/* ── Net Worth Projection Chart ── */}
      <Reveal>
      <FintechCard variant="info">
        <h3 className="text-sm font-semibold text-text-primary mb-1 uppercase tracking-widest">
          Net Worth Projection
        </h3>
        <p className="text-xs text-text-secondary mb-6">
          1,000 Monte Carlo simulations. The solid filled line is the median (typical) path; the
          dashed line is a <strong>1-in-10 rough market</strong> (the 10th percentile).{' '}
          {res.p10DepletionYear === null ? (
            <>Even that rough market stays funded through all {i.retDuration} retirement years.</>
          ) : (
            <>
              Where it touches zero, the weakest scenarios have run out — 9 in 10 outcomes stay
              funded through {res.p10DepletionYear - 1}.
            </>
          )}{' '}
          The luckiest outcomes run far higher and are left off the chart so the typical path stays
          readable
          {p75Today > 0 && (
            <>
              {' '}— 1 in 4 outcomes reach retirement above{' '}
              <span className="font-mono">{formatLarge(p75Today)}</span> in today&apos;s dollars
              (≈{formatLarge(res.p75AtRetirement)} in {retirementYear})
            </>
          )}
          . Amber marks retirement; red is your target. <strong>Shown in future dollars</strong> —
          the cards above are in today&apos;s dollars.
        </p>

        <div style={{ height: '420px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={netWorthBand} margin={{ top: 10, right: 24, left: 10, bottom: 20 }}>
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
                label={{ value: 'Year', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 11 }}
              />

              <YAxis
                domain={[0, nwYMax]}
                allowDataOverflow
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

              {/* Median (typical) path — single clean filled area + line */}
              <Area
                type="monotone"
                dataKey="p50"
                stroke="#3b82f6"
                strokeWidth={3}
                fill="url(#gradientBlue)"
                name="Median (typical)"
                dot={false}
                activeDot={{ r: 5, fill: '#3b82f6', stroke: '#1e40af', strokeWidth: 2 }}
                isAnimationActive={false}
              />
              {/* 10th-percentile downside floor — dashed line; dips to $0 where weak scenarios deplete */}
              <Line
                type="monotone"
                dataKey="p10"
                stroke="#cbd5e1"
                strokeWidth={2}
                strokeDasharray="5 4"
                name="1-in-10 rough market"
                dot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Manual phase legend */}
        <div className="mt-4 flex flex-wrap gap-6 text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            <div style={{ width: 20, height: 3, borderRadius: 2, background: '#3b82f6' }} />
            <span>Median (typical) path</span>
          </div>
          <div className="flex items-center gap-2">
            <div style={{ width: 20, height: 0, borderTop: '2px dashed #cbd5e1' }} />
            <span>1-in-10 rough market (10th pct)</span>
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
      </Reveal>

      {/* ── Two visual cards: Spending Comparison + Key Assumptions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Card A: Spending Comparison Bar Chart */}
        <FintechCard variant="primary">
          <h3 className="text-sm font-semibold text-text-primary mb-1 uppercase tracking-widest">
            Now vs. Retirement Spending
          </h3>
          <p className="text-xs text-text-secondary mb-5">Your main categories, monthly</p>

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
                    formatter={(value, name) => [formatCurrency(Number(value)), name]}
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
            <div className="flex items-center justify-center h-40 text-text-secondary text-sm">
              Enter spending data in Step 1 to see comparison
            </div>
          )}
        </FintechCard>

        {/* Card B: Key Assumptions at a Glance */}
        <FintechCard variant="success">
          <h3 className="text-sm font-semibold text-text-primary mb-1 uppercase tracking-widest">
            Key Assumptions
          </h3>
          <p className="text-xs text-text-secondary mb-5">At a glance</p>

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
                <div className="text-xs text-text-secondary leading-tight">{item.label}</div>
                <div className="text-sm font-semibold text-text-primary mt-0.5">{item.value}</div>
              </div>
            ))}
          </div>
        </FintechCard>
      </div>

      {/* ── Retirement Income Sources ── */}
      <Reveal>
      <FintechCard variant="warning">
        <h3 className="text-sm font-semibold text-text-primary mb-1 uppercase tracking-widest">
          Retirement Income Sources
        </h3>
        <p className="text-xs text-text-secondary mb-5">
          Annual income that reduces portfolio draw — reducing your required portfolio size
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <th className="text-left py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Source
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Annual (Today's $)
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Annual ({retirementYear} $)
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
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
                    <td className="py-3 px-4 text-text-primary">{row.label}</td>
                    <td className="py-3 px-4 text-right font-medium text-text-primary">
                      {row.today > 0 ? formatCurrency(row.today) : <span className="text-text-secondary">—</span>}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-text-primary">
                      {future > 0 ? formatCurrency(future) : <span className="text-text-secondary">—</span>}
                    </td>
                    <td className="py-3 px-4 text-right font-medium" style={{ color: offset > 0 ? '#10b981' : '#94a3b8' }}>
                      {offset > 0 ? formatLarge(offset) : <span className="text-text-secondary">—</span>}
                    </td>
                  </tr>
                );
              })}
              {/* Total row */}
              <tr style={{ borderTop: '1px solid #334155', backgroundColor: 'rgba(255,255,255,0.04)' }}>
                <td className="py-3 px-4 font-bold text-text-primary">Total</td>
                <td className="py-3 px-4 text-right font-bold text-text-primary">
                  {formatCurrency(i.socialSecurity + i.pension + i.otherIncome)}
                </td>
                <td className="py-3 px-4 text-right font-bold text-text-primary">
                  {formatCurrency((i.socialSecurity + i.pension + i.otherIncome) * res.inflationMult)}
                </td>
                <td className="py-3 px-4 text-right font-bold" style={{ color: '#10b981' }}>
                  {formatLarge((i.socialSecurity + i.pension + i.otherIncome) * res.inflationMult / res.withdrawalRate)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-text-secondary leading-relaxed">
          How this is treated: Social Security keeps pace with inflation through its cost-of-living
          adjustment, so it holds its value. Pension and other income are shown at their {retirementYear} value
          but are not inflation-adjusted after that — most pensions have no cost-of-living raise, so their
          real spending power erodes through retirement. The success probability above already reflects that
          erosion; this offset is a simplified, retirement-year snapshot. All figures are pre-tax.
        </p>
      </FintechCard>
      </Reveal>

      {/* ── Disclaimer ── */}
      <div
        style={{
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.08)',
          backgroundColor: 'rgba(255,255,255,0.04)',
          padding: '16px',
          fontSize: '12px',
          color: '#94a3b8',
          lineHeight: '1.6',
        }}
      >
        These projections are estimates. The success probability and ranges come from 1,000 Monte Carlo simulations
        that vary market returns each year and account for sequence-of-returns risk, so they are probabilities rather
        than promises. All figures are pre-tax and do not model taxes or fees. This tool is educational and not
        personalized financial advice; consider reviewing your plan annually with a Certified Financial Planner (CFP).
      </div>

    </div>
  );
}
