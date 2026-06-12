import { useStore } from '@nanostores/react';
import { Lock, ShieldCheck, TrendingUp } from 'lucide-react';
import { inputs, results } from '../../stores/financialPlan';
import { CountUp } from '../ui/CountUp';
import { RangeSlider } from '../ui/RangeSlider';
import { LifetimeTimeline } from './LifetimeTimeline';
import { formatCurrency, formatLarge } from './format';
import { confidenceZone, oddsOutOfTen, downsideStatement } from './confidence';

// The flagship "result moment": one calm, confident screen that answers the three questions a
// first-timer actually has — how much do I need, will I make it, and what happens if markets are
// rough. Everything reads from the single store engine (Pattern 1); nothing is recomputed here.
// Rendered only when the plan is ready (the Summary already guards on res.planReady).

const CURRENT_YEAR = new Date().getFullYear();

export function ResultMoment() {
  const i = useStore(inputs);
  const res = useStore(results);

  // Today's-dollars headline figures (canonical §2): divide nominal by the inflation multiplier
  // so the number is stable and relatable, with the nominal future figure shown beside it.
  const inflMult = res.inflationMult || 1;
  const requiredToday = res.requiredPortfolio / inflMult;
  const p75Today = res.p75AtRetirement / inflMult;

  const successPct = Math.round(res.successProbability * 100);
  const zone = confidenceZone(successPct);
  const odds = oddsOutOfTen(successPct);
  const lastYear = i.retYear + i.retDuration;
  const downside = downsideStatement(res.p10DepletionYear, i.retDuration, lastYear);

  // Confidence/timeline are only meaningful once there's a savings trajectory to simulate.
  const hasData = i.currentPortfolio > 0 || i.monthlyContrib > 0;

  return (
    <section
      aria-label="Your plan at a glance"
      style={{
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.02)',
        padding: 'clamp(22px, 5vw, 40px)',
      }}
    >
      {/* Top row: eyebrow + privacy badge */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600 }}>
          Your plan
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.72rem',
            color: '#94a3b8',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '999px',
            padding: '4px 10px',
          }}
        >
          <Lock size={13} aria-hidden="true" /> Private · on-device
        </span>
      </div>

      {/* Hero number */}
      <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>
        The portfolio you&apos;re building toward
      </div>
      <div
        style={{
          fontFamily: 'monospace',
          fontVariantNumeric: 'tabular-nums',
          fontSize: 'clamp(2.75rem, 8vw, 4.25rem)',
          fontWeight: 600,
          letterSpacing: '-0.03em',
          lineHeight: 1.02,
          color: '#10b981',
        }}
      >
        <CountUp value={requiredToday} format={formatLarge} />
      </div>
      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '6px', fontVariantNumeric: 'tabular-nums' }}>
        in today&apos;s dollars · ≈ <span style={{ fontFamily: 'monospace' }}>{formatLarge(res.requiredPortfolio)}</span> in {i.retYear} dollars
      </div>

      {/* Confidence */}
      {hasData ? (
        <div style={{ marginTop: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span
              style={{
                background: `${zone.color}1f`,
                color: zone.color,
                fontSize: '0.72rem',
                fontWeight: 600,
                padding: '4px 11px',
                borderRadius: '8px',
                letterSpacing: '0.02em',
              }}
            >
              {zone.label}
            </span>
            <span style={{ fontSize: 'clamp(1.05rem, 2.4vw, 1.35rem)', color: '#f8fafc' }}>
              You&apos;re on track in <span style={{ fontWeight: 700, color: zone.color }}>{odds} of 10</span> futures.
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '6px' }}>
            {successPct}% of 1,000 market simulations fund all {i.retDuration} years. {zone.message}
          </div>

          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              <ShieldCheck
                size={18}
                aria-hidden="true"
                style={{ color: res.p10DepletionYear === null ? '#10b981' : '#f59e0b', flexShrink: 0, marginTop: '1px' }}
              />
              <span>{downside}</span>
            </div>
            {p75Today > 0 && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                <TrendingUp size={18} aria-hidden="true" style={{ color: '#3b82f6', flexShrink: 0, marginTop: '1px' }} />
                <span>
                  1 in 4 futures clear <span style={{ fontFamily: 'monospace', color: '#f8fafc' }}>{formatLarge(p75Today)}</span> — room to spend a little more, or retire a little sooner.
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          style={{
            marginTop: '24px',
            padding: '14px 16px',
            borderRadius: '10px',
            background: 'rgba(59,130,246,0.06)',
            border: '1px solid rgba(59,130,246,0.18)',
            fontSize: '0.9rem',
            color: '#cbd5e1',
          }}
        >
          Add your current portfolio and monthly investing below to see your odds and your lifetime timeline.
        </div>
      )}

      {/* Signature timeline */}
      <div style={{ marginTop: '28px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Your money over a lifetime</span>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>today&apos;s dollars · shaded band = likely range</span>
        </div>
        <LifetimeTimeline
          cone={res.mcNetWorthCone}
          requiredPortfolio={res.requiredPortfolio}
          inflation={i.inflation}
          retYear={i.retYear}
          currentYear={CURRENT_YEAR}
        />
      </div>

      {/* Live what-if */}
      <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '16px' }}>
          <span style={{ fontWeight: 600, color: '#cbd5e1' }}>Try it</span> — drag a lever and watch your number and timeline move.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <RangeSlider
            label="Retirement year"
            value={i.retYear}
            onChange={(v) => inputs.setKey('retYear', Math.round(v))}
            min={CURRENT_YEAR}
            max={CURRENT_YEAR + 50}
            step={1}
            formatValue={(v) => Math.round(v).toString()}
          />
          <RangeSlider
            label="Monthly investing"
            value={i.monthlyContrib}
            onChange={(v) => {
              // Match Step 4: flag manual intent before writing, so the Step 1 smart-default
              // subscriber doesn't clobber a hand-set contribution (errors.md row 7).
              inputs.setKey('hasModifiedContrib', true);
              inputs.setKey('monthlyContrib', Math.round(v));
            }}
            min={0}
            max={10000}
            step={100}
            formatValue={(v) => formatCurrency(v)}
          />
          <RangeSlider
            label="Annual return"
            value={i.annualReturn}
            onChange={(v) => inputs.setKey('annualReturn', v)}
            min={3}
            max={12}
            step={0.1}
            formatValue={(v) => `${v.toFixed(1)}%`}
          />
        </div>
      </div>

      {/* How we calculate this — transparency disclosure */}
      <details style={{ marginTop: '22px' }}>
        <summary style={{ cursor: 'pointer', fontSize: '0.82rem', color: '#3b82f6' }}>How we calculate this</summary>
        <p style={{ marginTop: '10px', fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.65 }}>
          Your number is your Step 2 retirement spending, grown for {i.inflation.toFixed(1)}% inflation, divided by a{' '}
          {(res.withdrawalRate * 100).toFixed(1)}% safe withdrawal rate — the Trinity Study (Bengen, 1994). The odds and
          the band come from 1,000 Monte Carlo simulations that vary market returns year by year, including the order they
          arrive in (sequence-of-returns risk). These are estimates, not guarantees — revisit yearly.
        </p>
      </details>
    </section>
  );
}
