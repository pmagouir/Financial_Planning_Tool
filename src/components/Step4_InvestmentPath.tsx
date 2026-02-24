import { useStore } from '@nanostores/react';
import { inputs, results } from '../stores/financialPlan';
import { FintechCard } from './ui/FintechCard';
import { MoneyInput } from './ui/MoneyInput';
import { RangeSlider } from './ui/RangeSlider';
import { useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

const CURRENT_YEAR = new Date().getFullYear();

interface Step4Props {
  onNext?: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const formatYAxis = (value: number): string => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
  return `$${value}`;
};

// ── Project a single portfolio scenario ──────────────────────────────────────

function projectPortfolio(
  annualReturn: number,         // decimal e.g. 0.07
  currentPortfolio: number,
  monthlyContrib: number,
  contribIncrease: number,      // decimal e.g. 0.03
  yearsToRetirement: number,
  yearsContributing: number,
): number[] {
  const rMonthly = annualReturn / 12;
  const values: number[] = [currentPortfolio];

  for (let yearOffset = 1; yearOffset <= yearsToRetirement; yearOffset++) {
    const totalMonths = yearOffset * 12;
    let portfolio = currentPortfolio * Math.pow(1 + annualReturn, yearOffset);

    const monthsContributing = Math.min(totalMonths, yearsContributing * 12);
    if (monthsContributing > 0) {
      for (let month = 0; month < monthsContributing; month++) {
        const monthlyC = monthlyContrib * Math.pow(1 + contribIncrease / 12, month);
        const monthsRemaining = totalMonths - month;
        portfolio += rMonthly > 0
          ? monthlyC * Math.pow(1 + rMonthly, monthsRemaining)
          : monthlyC;
      }
    }
    values.push(portfolio);
  }
  return values;
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────

interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
}
interface ConeTooltipProps {
  active?: boolean;
  label?: number;
  payload?: TooltipPayloadEntry[];
  requiredPortfolio: number;
}

function ConeTooltip({ active, label, payload, requiredPortfolio }: ConeTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const get = (name: string) => payload.find((p) => p.name === name)?.value;
  const pessimistic = get('Pessimistic');
  const median = get('Median');
  const optimistic = get('Optimistic');
  const target = get('Target');

  return (
    <div
      style={{
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '10px',
        padding: '12px 16px',
        minWidth: '220px',
        fontSize: '12px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ color: '#94a3b8', fontSize: '11px', marginBottom: '8px', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
        Year {label}
      </div>

      {optimistic !== undefined && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '3px' }}>
          <span style={{ color: '#10b981' }}>Optimistic</span>
          <span style={{ fontWeight: 700, fontFamily: 'monospace', color: '#f8fafc' }}>{formatCurrency(optimistic)}</span>
        </div>
      )}
      {median !== undefined && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '3px' }}>
          <span style={{ color: '#3b82f6' }}>Median</span>
          <span style={{ fontWeight: 700, fontFamily: 'monospace', color: '#f8fafc' }}>{formatCurrency(median)}</span>
        </div>
      )}
      {pessimistic !== undefined && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '3px' }}>
          <span style={{ color: '#f59e0b' }}>Pessimistic</span>
          <span style={{ fontWeight: 700, fontFamily: 'monospace', color: '#f8fafc' }}>{formatCurrency(pessimistic)}</span>
        </div>
      )}
      {target !== undefined && (
        <div style={{ borderTop: '1px solid #334155', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
          <span style={{ color: '#ef4444' }}>Target</span>
          <span style={{ fontWeight: 700, fontFamily: 'monospace', color: '#ef4444' }}>{formatCurrency(target)}</span>
        </div>
      )}
      {median !== undefined && (
        <div style={{ marginTop: '8px', borderTop: '1px solid #334155', paddingTop: '6px' }}>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            Cone spread: {formatCurrency(Math.abs((optimistic ?? 0) - (pessimistic ?? 0)))}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Step4_InvestmentPath({ onNext }: Step4Props) {
  const i = useStore(inputs);
  const res = useStore(results);

  const baseReturn = i.annualReturn / 100;
  const contribStopYear = i.contribStopYear > 0 ? i.contribStopYear : i.retYear;
  const yearsContributing = Math.max(0, Math.min(res.yearsToRet, contribStopYear - CURRENT_YEAR));

  // ── Monte Carlo cone: 3 deterministic scenarios ───────────────────────────
  // Pessimistic = base − 2%, Median = base, Optimistic = base + 2%
  const coneData = useMemo(() => {
    const pessReturn = Math.max(0.01, baseReturn - 0.02);
    const optimReturn = baseReturn + 0.02;

    const pessValues = projectPortfolio(pessReturn, i.currentPortfolio, i.monthlyContrib, i.contribIncrease / 100, res.yearsToRet, yearsContributing);
    const medValues  = projectPortfolio(baseReturn,  i.currentPortfolio, i.monthlyContrib, i.contribIncrease / 100, res.yearsToRet, yearsContributing);
    const optValues  = projectPortfolio(optimReturn, i.currentPortfolio, i.monthlyContrib, i.contribIncrease / 100, res.yearsToRet, yearsContributing);

    return Array.from({ length: res.yearsToRet + 1 }, (_, idx) => ({
      year: CURRENT_YEAR + idx,
      Pessimistic: pessValues[idx],
      Median: medValues[idx],
      Optimistic: optValues[idx],
      // recharts Area "band" trick: render a stacked area from pessimistic baseline up to optimistic
      // lower band = pessimistic (solid fill from 0 to pessimistic)
      // upper band = optimistic - pessimistic (stacked on top = full cone fill)
      coneBase: pessValues[idx],
      coneBand: optValues[idx] - pessValues[idx],
      Target: res.requiredPortfolio,
    }));
  }, [
    baseReturn,
    i.currentPortfolio,
    i.monthlyContrib,
    i.contribIncrease,
    res.yearsToRet,
    res.requiredPortfolio,
    yearsContributing,
  ]);

  // ── Gap/track status ──────────────────────────────────────────────────────
  const medianFinal = coneData[coneData.length - 1]?.Median ?? 0;
  const pessimisticFinal = coneData[coneData.length - 1]?.Pessimistic ?? 0;
  const onTrackMedian = medianFinal >= res.requiredPortfolio;
  const onTrackPessimistic = pessimisticFinal >= res.requiredPortfolio;

  const pessReturn = Math.max(0.01, baseReturn - 0.02);
  const optimReturn = baseReturn + 0.02;

  const hasData = i.currentPortfolio > 0 || i.monthlyContrib > 0;

  return (
    <div className="space-y-8">

      {/* ── Inputs ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FintechCard variant="info">
          <h3 className="text-lg font-semibold text-shiny-text mb-4">Current Portfolio</h3>
          <MoneyInput
            label="Current Portfolio Value"
            helperText="Total value of all your current investments"
            value={i.currentPortfolio}
            onChange={(value) => inputs.setKey('currentPortfolio', value)}
          />
        </FintechCard>

        <FintechCard variant="success">
          <h3 className="text-lg font-semibold text-shiny-text mb-4">Monthly Contribution</h3>
          <MoneyInput
            label="Monthly Investment Contribution"
            helperText="How much you'll invest each month going forward"
            value={i.monthlyContrib}
            onChange={(value) => inputs.setKey('monthlyContrib', value)}
          />
          <div className="mt-4">
            <RangeSlider
              label="Annual Contribution Increase"
              value={i.contribIncrease}
              onChange={(value) => inputs.setKey('contribIncrease', value)}
              min={0}
              max={10}
              step={0.1}
              formatValue={(val) => `${val.toFixed(1)}%`}
              helperText="Expected annual increase in contributions"
            />
          </div>
        </FintechCard>
      </div>

      {/* ── Return Selection ─────────────────────────────────────────────────── */}
      <FintechCard variant="primary">
        <h3 className="text-lg font-semibold text-shiny-text mb-4">Expected Annual Return</h3>
        <RangeSlider
          label="Annual Return Rate"
          value={i.annualReturn}
          onChange={(value) => inputs.setKey('annualReturn', value)}
          min={3}
          max={12}
          step={0.1}
          formatValue={(val) => `${val.toFixed(1)}%`}
          helperText="Conservative: 5%, Moderate: 7%, Aggressive: 9%"
        />
        <div className="mt-4 flex gap-4 flex-wrap">
          {[
            { label: 'Conservative (5%)', value: 5, activeClass: 'bg-shiny-info text-white shadow-shiny-card' },
            { label: 'Moderate (7%)', value: 7, activeClass: 'bg-shiny-primary text-white shadow-shiny-card' },
            { label: 'Aggressive (9%)', value: 9, activeClass: 'bg-shiny-success text-white shadow-shiny-card' },
          ].map((btn) => (
            <button
              key={btn.value}
              onClick={() => inputs.setKey('annualReturn', btn.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                i.annualReturn === btn.value
                  ? btn.activeClass
                  : 'bg-shiny-surface text-shiny-text hover:bg-shiny-border'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </FintechCard>

      {/* ── Contribution Timeline ─────────────────────────────────────────────── */}
      <FintechCard variant="info">
        <h3 className="text-lg font-semibold text-shiny-text mb-4">Contribution Timeline</h3>
        <RangeSlider
          label="Stop Contributions Year"
          value={i.contribStopYear > 0 ? i.contribStopYear : i.retYear}
          onChange={(value) => inputs.setKey('contribStopYear', Math.round(value))}
          min={CURRENT_YEAR}
          max={i.retYear}
          step={1}
          formatValue={(val) => {
            const year = Math.round(val);
            if (year >= i.retYear) return 'Never stop (retirement)';
            return year.toString();
          }}
          helperText="When you plan to stop making contributions (default: retirement year)"
        />
        <p className="mt-2 text-sm text-shiny-muted">
          {i.contribStopYear > 0 && i.contribStopYear < i.retYear
            ? `Contributions will stop in ${i.contribStopYear}, ${i.retYear - i.contribStopYear} years before retirement.`
            : 'Contributions will continue until retirement.'}
        </p>
      </FintechCard>

      {/* ── Gap Panel ────────────────────────────────────────────────────────── */}
      {hasData && res.gap < 0 && (
        <div
          style={{
            borderRadius: '16px',
            border: '1px solid rgba(245,158,11,0.3)',
            background: 'rgba(245,158,11,0.08)',
            padding: '28px 32px',
          }}
        >
          <h2 className="text-2xl font-bold text-white mb-3">Action Required</h2>
          <p className="text-lg text-slate-300 mb-4">
            Even in the <span style={{ color: '#f59e0b', fontWeight: 700 }}>median scenario</span>, you're projected to fall short by{' '}
            <span className="font-bold" style={{ color: '#fbbf24' }}>{formatCurrency(Math.abs(res.gap))}</span>.
          </p>
          <div
            style={{
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '10px',
              padding: '20px 24px',
              display: 'inline-block',
            }}
          >
            <div className="text-sm text-slate-400 mb-1">Additional monthly investment needed:</div>
            <div className="text-3xl font-bold text-white">{formatCurrency(res.monthlyShortfall)}<span className="text-lg font-normal text-slate-400">/mo</span></div>
          </div>
        </div>
      )}

      {hasData && res.gap >= 0 && (
        <div
          style={{
            borderRadius: '16px',
            border: '1px solid rgba(16,185,129,0.3)',
            background: 'rgba(16,185,129,0.07)',
            padding: '28px 32px',
          }}
        >
          <h2 className="text-2xl font-bold text-white mb-2">On Track</h2>
          <p className="text-lg text-slate-300">
            Your <span style={{ color: '#10b981', fontWeight: 700 }}>median projection</span> exceeds your target by{' '}
            <span className="font-bold" style={{ color: '#34d399' }}>{formatCurrency(res.gap)}</span>.
            {onTrackPessimistic && (
              <span className="text-slate-400 text-base ml-2">Even the pessimistic scenario clears the target.</span>
            )}
          </p>
        </div>
      )}

      {/* ── Monte Carlo Cone Chart ────────────────────────────────────────────── */}
      <FintechCard variant="info">
        <h3 className="text-lg font-semibold text-shiny-text mb-1">Probability Cone</h3>
        <p className="text-sm text-shiny-muted mb-2">
          Three return scenarios showing the range of outcomes. The shaded band is the uncertainty envelope.
        </p>

        {/* Scenario legend */}
        <div
          style={{
            display: 'flex',
            gap: '20px',
            flexWrap: 'wrap',
            marginBottom: '20px',
            padding: '12px 16px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {[
            { label: `Optimistic (${(optimReturn * 100).toFixed(1)}%)`, color: '#10b981' },
            { label: `Median (${i.annualReturn.toFixed(1)}%)`, color: '#3b82f6' },
            { label: `Pessimistic (${(pessReturn * 100).toFixed(1)}%)`, color: '#f59e0b' },
            { label: 'Target', color: '#ef4444', dashed: true },
          ].map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {item.dashed ? (
                <svg width="20" height="2" style={{ flexShrink: 0 }}>
                  <line x1="0" y1="1" x2="20" y2="1" stroke={item.color} strokeWidth="2" strokeDasharray="4 3" />
                </svg>
              ) : (
                <div style={{ width: '20px', height: '3px', borderRadius: '2px', background: item.color, flexShrink: 0 }} />
              )}
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.label}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '12px', borderRadius: '3px', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Uncertainty band</span>
          </div>
        </div>

        <div style={{ height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={coneData} margin={{ top: 10, right: 24, left: 10, bottom: 10 }}>
              <defs>
                {/* Cone fill — layered approach using stacked areas */}
                <linearGradient id="coneGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.04} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

              <XAxis
                dataKey="year"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
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
                  <ConeTooltip requiredPortfolio={res.requiredPortfolio} />
                }
              />

              {/* Hide default legend — we have the custom one above */}
              <Legend wrapperStyle={{ display: 'none' }} />

              {/* ── Cone band: stacked area from pessimistic → optimistic ── */}
              {/* Bottom of band (transparent fill, no stroke) */}
              <Area
                type="monotone"
                dataKey="coneBase"
                stroke="none"
                fill="transparent"
                dot={false}
                legendType="none"
                name="__coneBase"
                stackId="cone"
              />
              {/* Top of band (blue fill = the spread) */}
              <Area
                type="monotone"
                dataKey="coneBand"
                stroke="none"
                fill="url(#coneGradient)"
                dot={false}
                legendType="none"
                name="__coneBand"
                stackId="cone"
              />

              {/* ── Three scenario lines ── */}
              <Line
                type="monotone"
                dataKey="Optimistic"
                stroke="#10b981"
                strokeWidth={1.5}
                strokeDasharray="5 3"
                dot={false}
                name="Optimistic"
              />
              <Line
                type="monotone"
                dataKey="Median"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={false}
                name="Median"
              />
              <Line
                type="monotone"
                dataKey="Pessimistic"
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="5 3"
                dot={false}
                name="Pessimistic"
              />

              {/* ── Target line ── */}
              <Line
                type="monotone"
                dataKey="Target"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="10 5"
                dot={false}
                name="Target"
              />

              {/* ── Retirement year reference line ── */}
              {i.retYear > CURRENT_YEAR && (
                <ReferenceLine
                  x={i.retYear}
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  label={{
                    value: 'Retirement',
                    position: 'insideTopRight',
                    fill: '#f59e0b',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Outcome summary below chart */}
        {hasData && (
          <div
            style={{
              display: 'flex',
              gap: '0',
              marginTop: '20px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.07)',
              overflow: 'hidden',
            }}
          >
            {[
              {
                label: 'Pessimistic outcome',
                value: coneData[coneData.length - 1]?.Pessimistic ?? 0,
                rate: `${(pessReturn * 100).toFixed(1)}% return`,
                onTrack: (coneData[coneData.length - 1]?.Pessimistic ?? 0) >= res.requiredPortfolio,
              },
              {
                label: 'Median outcome',
                value: coneData[coneData.length - 1]?.Median ?? 0,
                rate: `${i.annualReturn.toFixed(1)}% return`,
                onTrack: (coneData[coneData.length - 1]?.Median ?? 0) >= res.requiredPortfolio,
              },
              {
                label: 'Optimistic outcome',
                value: coneData[coneData.length - 1]?.Optimistic ?? 0,
                rate: `${(optimReturn * 100).toFixed(1)}% return`,
                onTrack: (coneData[coneData.length - 1]?.Optimistic ?? 0) >= res.requiredPortfolio,
              },
            ].map((item, idx) => (
              <div
                key={item.label}
                style={{
                  flex: 1,
                  padding: '14px 16px',
                  textAlign: 'center',
                  borderRight: idx < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                  background: 'rgba(255,255,255,0.02)',
                }}
              >
                <div style={{ fontSize: '0.65rem', color: '#475569', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '5px' }}>
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: item.onTrack ? '#10b981' : '#f59e0b',
                    fontVariantNumeric: 'tabular-nums',
                    marginBottom: '3px',
                  }}
                >
                  {item.value >= 1_000_000
                    ? `$${(item.value / 1_000_000).toFixed(2)}M`
                    : `$${(item.value / 1_000).toFixed(0)}K`}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#334155' }}>{item.rate}</div>
                <div
                  style={{
                    marginTop: '4px',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    color: item.onTrack ? '#10b981' : '#f59e0b',
                  }}
                >
                  {item.onTrack ? '✓ on track' : '✗ shortfall'}
                </div>
              </div>
            ))}
          </div>
        )}
      </FintechCard>

      {/* Next Step */}
      {onNext && (
        <div className="flex justify-end">
          <button
            onClick={onNext}
            className="mt-2 flex items-center gap-2 px-6 py-3 bg-accent-primary text-white rounded-lg font-medium hover:bg-accent-primary/90 transition-colors"
          >
            Next Step <span>→</span>
          </button>
        </div>
      )}
    </div>
  );
}
