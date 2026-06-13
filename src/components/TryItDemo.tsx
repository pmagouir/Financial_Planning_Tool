import { useState, useMemo } from 'react';
import { RangeSlider } from './ui/RangeSlider';
import { CountUp } from './ui/CountUp';

// An interactive "taste" of the tool, right on the landing page: drag the sliders and watch a
// small monthly habit compound. It uses the same effective-monthly convention as the real
// engine (canonical §3 — "7%" is a true 7% annual), but it's a deliberately simplified glimpse
// (constant return, no inflation/taxes) — labeled as such. The real plan lives in the 5 steps.

const ANNUAL_RETURN = 0.07;

const compact = (v: number): string =>
  v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(2)}M` : `$${Math.round(v / 1000)}K`;
const full = (v: number): string => `$${Math.round(v).toLocaleString('en-US')}`;

export function TryItDemo() {
  const [monthly, setMonthly] = useState(500);
  const [years, setYears] = useState(30);

  const { future, contributed, growth, growthPct } = useMemo(() => {
    const m = Math.pow(1 + ANNUAL_RETURN, 1 / 12) - 1; // effective monthly rate
    const n = years * 12;
    const fv = monthly * ((Math.pow(1 + m, n) - 1) / m); // FV of end-of-month contributions
    const put = monthly * n;
    const grown = fv - put;
    return {
      future: fv,
      contributed: put,
      growth: grown,
      growthPct: fv > 0 ? (grown / fv) * 100 : 0,
    };
  }, [monthly, years]);

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: '16px',
        border: '1px solid rgba(16,185,129,0.25)',
        background:
          'radial-gradient(ellipse 80% 90% at 50% 0%, rgba(16,185,129,0.08) 0%, transparent 70%), rgba(255,255,255,0.02)',
        padding: '28px 28px 24px',
        overflow: 'hidden',
      }}
    >
      {/* Eyebrow */}
      <div className="text-center mb-1">
        <span
          style={{
            display: 'inline-block',
            padding: '3px 12px',
            borderRadius: '999px',
            border: '1px solid rgba(16,185,129,0.35)',
            background: 'rgba(16,185,129,0.08)',
            fontSize: '0.65rem',
            letterSpacing: '0.1em',
            color: '#6ee7b7',
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          Try it
        </span>
      </div>
      <h2 className="text-center text-xl font-semibold text-white mb-1">
        Watch a small habit compound
      </h2>
      <p className="text-center text-sm text-text-secondary mb-6">
        Drag the sliders — the result updates live.
      </p>

      {/* Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto mb-6">
        <RangeSlider
          label="Invest each month"
          value={monthly}
          onChange={(v) => setMonthly(Math.round(v))}
          min={50}
          max={2500}
          step={50}
          formatValue={(v) => `$${Math.round(v).toLocaleString('en-US')}`}
        />
        <RangeSlider
          label="For how long"
          value={years}
          onChange={(v) => setYears(Math.round(v))}
          min={10}
          max={40}
          step={1}
          formatValue={(v) => `${Math.round(v)} years`}
        />
      </div>

      {/* Result */}
      <div className="text-center mb-5">
        <div className="text-sm text-text-secondary mb-1">could grow to</div>
        <div
          style={{
            fontSize: 'clamp(2.5rem, 7vw, 3.75rem)',
            fontWeight: 800,
            lineHeight: 1,
            color: '#10b981',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '-0.03em',
            textShadow: '0 0 50px rgba(16,185,129,0.35)',
          }}
        >
          <CountUp value={future} format={compact} durationMs={500} />
        </div>
        <div className="text-xs text-text-secondary mt-2">
          at a {Math.round(ANNUAL_RETURN * 100)}% average annual return
        </div>
      </div>

      {/* Contributions vs growth bar */}
      <div className="max-w-2xl mx-auto">
        <div
          style={{
            display: 'flex',
            height: '14px',
            borderRadius: '9999px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.1)',
            background: '#0a0f1e',
          }}
          role="img"
          aria-label={`Of ${full(future)}, you invest ${full(contributed)} and growth adds ${full(growth)}.`}
        >
          <div
            style={{
              width: `${100 - growthPct}%`,
              background: '#3b82f6',
              transition: 'width 0.3s ease',
            }}
          />
          <div
            style={{ width: `${growthPct}%`, background: '#10b981', transition: 'width 0.3s ease' }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs">
          <span style={{ color: '#60a5fa' }}>
            You invest <span className="font-mono font-semibold">{full(contributed)}</span>
          </span>
          <span style={{ color: '#34d399' }}>
            Growth adds <span className="font-mono font-semibold">{full(growth)}</span>
          </span>
        </div>
      </div>

      {/* Caveat + nudge */}
      <p className="text-center text-xs text-text-secondary mt-6 max-w-xl mx-auto leading-relaxed">
        A simplified glimpse at a constant 7% return. Your real plan in the 5 steps adds inflation,
        taxes, your actual spending, and 1,000 market simulations — start it below.
      </p>
    </div>
  );
}
