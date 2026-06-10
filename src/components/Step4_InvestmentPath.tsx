import { useStore } from '@nanostores/react';
import { inputs, results } from '../stores/financialPlan';
import { FintechCard } from './ui/FintechCard';
import { MoneyInput } from './ui/MoneyInput';
import { Button } from './ui/Button';
import { RangeSlider } from './ui/RangeSlider';
import { CountUp } from './ui/CountUp';
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

// Projection + Monte Carlo live in the store's single canonical engine (financialPlan.ts,
// canonical §3 + §10). Step 4 reads res.mcCone — it does not recompute (errors.md rows 2, 1).

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
}

function ConeTooltip({ active, label, payload }: ConeTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const get = (name: string) => payload.find((p) => p.name === name)?.value;
  const pessimistic = get('P10');
  const median = get('Median');
  const optimistic = get('P90');
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
          <span style={{ color: '#10b981' }}>Strong market (90th pct)</span>
          <span style={{ fontWeight: 700, fontFamily: 'monospace', color: '#f8fafc' }}>{formatCurrency(optimistic)}</span>
        </div>
      )}
      {median !== undefined && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '3px' }}>
          <span style={{ color: '#3b82f6' }}>Median (typical)</span>
          <span style={{ fontWeight: 700, fontFamily: 'monospace', color: '#f8fafc' }}>{formatCurrency(median)}</span>
        </div>
      )}
      {pessimistic !== undefined && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '3px' }}>
          <span style={{ color: '#f59e0b' }}>Rough market (10th pct)</span>
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
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            10th–90th pct range: {formatCurrency(Math.abs((optimistic ?? 0) - (pessimistic ?? 0)))}
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

  // ── Probability cone (canonical §10) — real Monte Carlo percentiles ────────
  // Read straight from the single store engine; Step 4 does not simulate locally.
  // The shaded band spans the 10th–90th percentile of 1,000 simulations; the line
  // is the median (typical) path.
  const coneData = res.mcCone.map((p) => ({
    year: p.year,
    P10: p.p10,
    Median: p.p50,
    P90: p.p90,
    coneBase: p.p10,
    coneBand: p.p90 - p.p10,
    Target: res.requiredPortfolio,
  }));

  // ── Gap/track status ──────────────────────────────────────────────────────
  const p10Final = coneData[coneData.length - 1]?.P10 ?? 0;
  const onTrackP10 = p10Final >= res.requiredPortfolio;
  const successPct = Math.round(res.successProbability * 100);
  // Confidence-zone verdict (canonical §10.7): 75–90% is the healthy zone professional planning
  // practice targets (MoneyGuidePro Confidence Zone; see the Methodology page for sources).
  const zoneMsg =
    successPct >= 90
      ? 'Above the 75–90% zone professional planners target — if staying here takes real sacrifice, that margin could fund more living today.'
      : successPct >= 75
        ? 'Inside the 75–90% healthy zone professional planners target.'
        : successPct >= 60
          ? 'Slightly below the 75–90% healthy zone — more contributions or a later retirement would lift it.'
          : 'Fragile — more contributions or a later retirement would help.';
  // Today's-dollars gap (errors.md row 15) — shown so the figure doesn't move with the calendar.
  const medianGapToday = res.medianGap / (res.inflationMult || 1);

  const hasData = i.currentPortfolio > 0 || i.monthlyContrib > 0;
  // Zero-target guard (errors.md row 16): without a retirement-spend target, requiredPortfolio
  // is $0, so every "on track" verdict below is vacuously true (everything clears $0). Read the
  // single `planReady` predicate from the engine (Pattern 1) — until then, prompt rather than reassure.
  const planReady = res.planReady;

  return (
    <div className="space-y-8">

      {/* ── Inputs ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FintechCard variant="info">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Current Portfolio</h3>
          <MoneyInput
            label="Current Portfolio Value"
            helperText="Total value of all your current investments"
            value={i.currentPortfolio}
            onChange={(value) => inputs.setKey('currentPortfolio', value)}
          />
        </FintechCard>

        <FintechCard variant="success">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Monthly Contribution</h3>
          <MoneyInput
            label="Monthly Investment Contribution"
            helperText="How much you'll invest each month going forward"
            value={i.monthlyContrib}
            onChange={(value) => {
              // Row 7: flag manual intent BEFORE writing the value. The Step 1 smart-default
              // subscriber fires synchronously on the setKey below; setting the flag first means
              // it sees hasModifiedContrib and won't clobber this hand-entered contribution.
              inputs.setKey('hasModifiedContrib', true);
              inputs.setKey('monthlyContrib', value);
            }}
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
        <h3 className="text-lg font-semibold text-text-primary mb-4">Expected Annual Return</h3>
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
            { label: 'Conservative (5%)', value: 5, activeClass: 'bg-accent-primary text-white shadow-card' },
            { label: 'Moderate (7%)', value: 7, activeClass: 'bg-accent-primary text-white shadow-card' },
            { label: 'Aggressive (9%)', value: 9, activeClass: 'bg-accent-success text-white shadow-card' },
          ].map((btn) => (
            <button
              key={btn.value}
              onClick={() => inputs.setKey('annualReturn', btn.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                i.annualReturn === btn.value
                  ? btn.activeClass
                  : 'bg-background-paper text-text-primary hover:bg-background-subtle'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </FintechCard>

      {/* ── Contribution Timeline ─────────────────────────────────────────────── */}
      <FintechCard variant="info">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Contribution Timeline</h3>
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
        <p className="mt-2 text-sm text-text-secondary">
          {i.contribStopYear > 0 && i.contribStopYear < i.retYear
            ? `Contributions will stop in ${i.contribStopYear}, ${i.retYear - i.contribStopYear} years before retirement.`
            : 'Contributions will continue until retirement.'}
        </p>
      </FintechCard>

      {/* ── Gap Panel ────────────────────────────────────────────────────────── */}
      {hasData && planReady && res.medianGap < 0 && (
        <div
          style={{
            borderRadius: '16px',
            border: '1px solid rgba(245,158,11,0.3)',
            background: 'rgba(245,158,11,0.08)',
            padding: 'clamp(20px, 5vw, 28px) clamp(18px, 5vw, 32px)',
          }}
        >
          <h2 className="text-2xl font-bold text-white mb-3">Action Required</h2>
          <p className="text-lg text-slate-300 mb-4">
            Even in the <span style={{ color: '#f59e0b', fontWeight: 700 }}>median scenario</span>, you're projected to fall short by{' '}
            <span className="font-bold" style={{ color: '#fbbf24' }}>{formatCurrency(Math.abs(medianGapToday))}</span> (today's $).
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
            <div className="text-xs text-slate-400 mt-2">Approximate — a starting point. Because real returns vary, the typical (median) outcome may need a bit more.</div>
          </div>
        </div>
      )}

      {hasData && planReady && res.medianGap >= 0 && (
        <div
          style={{
            borderRadius: '16px',
            border: '1px solid rgba(16,185,129,0.3)',
            background: 'rgba(16,185,129,0.07)',
            padding: 'clamp(20px, 5vw, 28px) clamp(18px, 5vw, 32px)',
          }}
        >
          <h2 className="text-2xl font-bold text-white mb-2">On Track</h2>
          <p className="text-lg text-slate-300">
            Your <span style={{ color: '#10b981', fontWeight: 700 }}>median projection</span> exceeds your target by{' '}
            <span className="font-bold" style={{ color: '#34d399' }}>{formatCurrency(medianGapToday)}</span> (today's $).
            {onTrackP10 && (
              <span className="text-slate-400 text-base ml-2">Even the 10th-percentile outcome clears the target.</span>
            )}
          </p>
          {successPct < 75 && (
            <p className="text-sm text-slate-400 mt-3">
              Your balance clears the target at retirement, yet only {successPct}% of simulations fund all {i.retDuration} years — below the 75–90% healthy zone. The order of returns in early retirement is why a clearing balance can still fall short. A later retirement or a larger buffer would raise it.
            </p>
          )}
        </div>
      )}

      {/* No target yet: savings entered but no retirement spend set — don't render an "on track" verdict against a $0 target (errors.md row 16). */}
      {hasData && !planReady && (
        <div
          style={{
            borderRadius: '16px',
            border: '1px solid rgba(59,130,246,0.3)',
            background: 'rgba(59,130,246,0.07)',
            padding: 'clamp(20px, 5vw, 28px) clamp(18px, 5vw, 32px)',
          }}
        >
          <h2 className="text-2xl font-bold text-white mb-2">No target set yet</h2>
          <p className="text-lg text-slate-300">
            You&apos;ve entered your savings, but you haven&apos;t set what you&apos;ll spend in retirement.
            Design your retirement spending in{' '}
            <span style={{ color: '#3b82f6', fontWeight: 700 }}>Step 2</span> to see whether you&apos;re on track.
          </p>
        </div>
      )}

      {/* ── Monte Carlo Cone Chart ────────────────────────────────────────────── */}
      <FintechCard variant="info">
        <h3 className="text-lg font-semibold text-text-primary mb-1">Projected Range</h3>
        <p className="text-sm text-text-secondary mb-4">
          1,000 Monte Carlo simulations of your plan. The shaded band spans the 10th–90th percentile of outcomes; the line is the median (typical) path. An estimate under the stated return assumptions, not a guarantee.
        </p>
        {hasData && (
          <div
            role="status"
            style={{
              display: 'flex', alignItems: 'baseline', gap: '14px', marginBottom: '18px',
              padding: '16px 20px', borderRadius: '10px',
              background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
            }}
          >
            <span style={{ fontSize: '2.25rem', fontWeight: 700, fontFamily: 'monospace', lineHeight: 1, color: successPct >= 75 ? '#10b981' : successPct >= 60 ? '#f59e0b' : '#ef4444' }}>
              <CountUp value={successPct} format={(n) => `${Math.round(n)}%`} />
            </span>
            <span className="text-sm text-text-secondary">
              of simulations fund your full {i.retDuration}-year retirement. {zoneMsg}
              {planReady && (
                <span style={{ display: 'block', marginTop: '6px' }}>
                  {res.p10DepletionYear === null
                    ? `Even a 1-in-10 rough market keeps it funded through all ${i.retDuration} years.`
                    : `A 1-in-10 rough market runs short around ${res.p10DepletionYear} — 9 in 10 outcomes stay funded through ${res.p10DepletionYear - 1}.`}
                </span>
              )}
            </span>
          </div>
        )}

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
            { label: '1-in-10 strong market (90th pct)', color: '#10b981' },
            { label: 'Median (typical)', color: '#3b82f6' },
            { label: '1-in-10 rough market (10th pct)', color: '#f59e0b' },
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
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Probability band (10th–90th)</span>
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

              <Tooltip content={<ConeTooltip />} />

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
                dataKey="P90"
                stroke="#10b981"
                strokeWidth={1.5}
                strokeDasharray="5 3"
                dot={false}
                name="P90"
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
                dataKey="P10"
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="5 3"
                dot={false}
                name="P10"
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
                label: '10th percentile',
                value: coneData[coneData.length - 1]?.P10 ?? 0,
                rate: 'a 1-in-10 rough market',
                onTrack: (coneData[coneData.length - 1]?.P10 ?? 0) >= res.requiredPortfolio,
              },
              {
                label: 'Median (typical)',
                value: coneData[coneData.length - 1]?.Median ?? 0,
                rate: 'the typical outcome',
                onTrack: (coneData[coneData.length - 1]?.Median ?? 0) >= res.requiredPortfolio,
              },
              {
                label: '90th percentile',
                value: coneData[coneData.length - 1]?.P90 ?? 0,
                rate: 'a 1-in-10 strong market',
                onTrack: (coneData[coneData.length - 1]?.P90 ?? 0) >= res.requiredPortfolio,
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
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '5px' }}>
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: !planReady ? '#cbd5e1' : item.onTrack ? '#10b981' : '#f59e0b',
                    fontVariantNumeric: 'tabular-nums',
                    marginBottom: '3px',
                  }}
                >
                  {item.value >= 1_000_000
                    ? `$${(item.value / 1_000_000).toFixed(2)}M`
                    : `$${(item.value / 1_000).toFixed(0)}K`}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{item.rate}</div>
                {planReady && (
                  <div
                    style={{
                      marginTop: '4px',
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      color: item.onTrack ? '#10b981' : '#f59e0b',
                    }}
                  >
                    {item.onTrack ? '✓ clears your number' : 'short of target'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </FintechCard>

      {/* Next Step */}
      {onNext && (
        <div className="flex justify-end">
          <Button onClick={onNext} className="group mt-2">
            Next Step
            <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </Button>
        </div>
      )}
    </div>
  );
}
