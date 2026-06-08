import { useStore } from '@nanostores/react';
import { inputs, results } from '../../stores/financialPlan';
import { FintechCard } from '../ui/FintechCard';
import { MoneyInput } from '../ui/MoneyInput';
import { RangeSlider } from '../ui/RangeSlider';
import { CountUp } from '../ui/CountUp';
import { useMemo } from 'react';

const CURRENT_YEAR = new Date().getFullYear();

interface Step3Props {
  onNext?: () => void;
}

// Compact number formatter: $1.25M, $850K, etc.
function formatLarge(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function Step3_YourNumber({ onNext }: Step3Props) {
  const i = useStore(inputs);
  const res = useStore(results);

  // Read the single engine (Pattern 1): annualRetSpend is the 11 retirement sliders × 12.
  // Don't re-sum them here — Step 4 and Step 5 read this same store value, so they can't drift.
  const monthlyNeedToday = res.annualRetSpend / 12;

  const withdrawalRateExplanation = useMemo(() => {
    if (i.retDuration >= 35) return 'Extra conservative rate for retirements lasting 35+ years';
    if (i.retDuration >= 25) return 'Standard 4% rule for 25–35 year retirements (Trinity Study)';
    if (i.retDuration >= 15) return 'Aggressive rate for shorter 15–25 year retirements';
    return 'Short duration rate for retirements under 15 years';
  }, [i.retDuration]);

  const hasRetirementData = res.planReady; // single engine predicate (Pattern 1), = annualRetSpend > 0

  // Multiplier label: 1 / withdrawalRate rounded to nearest whole
  const multiplierLabel = res.withdrawalRate > 0 ? Math.round(1 / res.withdrawalRate) : 25;

  return (
    <div className="space-y-8">
      {!hasRetirementData && (
        <FintechCard variant="info">
          <p className="text-text-primary p-2">
            Complete Steps 1 and 2 first — your retirement number will appear here automatically.
          </p>
        </FintechCard>
      )}

      {hasRetirementData && (
        <>
          {/* ── THE NUMBER — Hero Reveal ───────────────────────────────────────── */}
          <div
            style={{
              position: 'relative',
              borderRadius: '24px',
              overflow: 'hidden',
              padding: '64px 40px 56px',
              textAlign: 'center',
              border: '1px solid rgba(16,185,129,0.25)',
              background: 'radial-gradient(ellipse 90% 70% at 50% 0%, rgba(16,185,129,0.10) 0%, rgba(16,185,129,0.03) 50%, transparent 80%), rgba(255,255,255,0.02)',
            }}
          >
            {/* Ambient glow orb behind the number */}
            <div
              className="breathe"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '420px',
                height: '220px',
                borderRadius: '50%',
                background: 'radial-gradient(ellipse, rgba(16,185,129,0.12) 0%, transparent 70%)',
                pointerEvents: 'none',
                filter: 'blur(24px)',
              }}
            />

            {/* Label */}
            <div
              style={{
                display: 'inline-block',
                padding: '4px 14px',
                borderRadius: '999px',
                border: '1px solid rgba(16,185,129,0.35)',
                background: 'rgba(16,185,129,0.08)',
                fontSize: '0.7rem',
                letterSpacing: '0.1em',
                color: '#6ee7b7',
                fontWeight: 600,
                textTransform: 'uppercase',
                marginBottom: '28px',
                position: 'relative',
              }}
            >
              Your Retirement Number
            </div>

            {/* The number itself */}
            <div
              style={{
                position: 'relative',
                fontSize: 'clamp(3.5rem, 10vw, 6rem)',
                fontWeight: 800,
                letterSpacing: '-0.04em',
                lineHeight: 1,
                color: '#ffffff',
                marginBottom: '16px',
                textShadow: '0 0 60px rgba(16,185,129,0.35), 0 0 120px rgba(16,185,129,0.15)',
              }}
            >
              <span style={{ color: '#10b981' }}>
                <CountUp value={res.requiredPortfolio} format={formatLarge} />
              </span>
            </div>

            {/* Sub-line */}
            <div
              style={{
                position: 'relative',
                fontSize: '0.95rem',
                color: '#94a3b8',
                marginBottom: '32px',
              }}
            >
              total portfolio needed at retirement
            </div>

            {/* Trio of key stats */}
            <div
              style={{
                position: 'relative',
                display: 'inline-flex',
                gap: '0',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.08)',
                overflow: 'hidden',
              }}
            >
              {[
                { label: 'Monthly in retirement', value: formatCurrency(monthlyNeedToday) },
                { label: 'Withdrawal rate', value: formatPercent(res.withdrawalRate) },
                { label: 'Years to grow', value: `${res.yearsToRet} yrs` },
              ].map((stat, idx) => (
                <div
                  key={stat.label}
                  style={{
                    padding: '14px 24px',
                    textAlign: 'center',
                    borderRight: idx < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                    background: 'rgba(255,255,255,0.03)',
                    minWidth: '140px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '1.15rem',
                      fontWeight: 700,
                      color: '#f8fafc',
                      letterSpacing: '-0.02em',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontSize: '0.68rem',
                      color: '#94a3b8',
                      marginTop: '3px',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── How We Got Here — Math Chain ──────────────────────────────────── */}
          <div>
            <div className="text-center mb-4">
              <h2 className="text-xl font-semibold text-white">How we calculated this</h2>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                Every number is traceable. Here's the exact chain.
              </p>
            </div>

            {/* Chain steps */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0',
              }}
            >
              {[
                {
                  step: '01',
                  color: '#3b82f6',
                  label: 'Monthly spending in retirement (today\'s dollars)',
                  value: formatCurrency(monthlyNeedToday),
                  note: 'From your retirement lifestyle design in Step 2',
                },
                {
                  step: '02',
                  color: '#8b5cf6',
                  label: `× 12 months = annual retirement spending`,
                  value: formatCurrency(res.annualRetSpend),
                  note: null,
                },
                {
                  step: '03',
                  color: '#f59e0b',
                  label: `× Inflation adjustment (${res.yearsToRet} yrs @ ${i.inflation.toFixed(1)}% = ${res.inflationMult.toFixed(2)}×)`,
                  value: formatCurrency(res.futureAnnualNeed),
                  note: `What $${(res.annualRetSpend / 1000).toFixed(0)}K today buys in ${i.retYear}`,
                },
                {
                  step: '04',
                  color: '#10b981',
                  label: `÷ ${formatPercent(res.withdrawalRate)} withdrawal rate = ${multiplierLabel}× multiplier`,
                  value: formatLarge(res.requiredPortfolio),
                  note: withdrawalRateExplanation,
                  isResult: true,
                },
              ].map((row, idx, arr) => (
                <div key={row.step} style={{ position: 'relative' }}>
                  {/* Connector line between steps */}
                  {idx < arr.length - 1 && (
                    <div
                      style={{
                        position: 'absolute',
                        left: '28px',
                        top: '52px',
                        bottom: '-1px',
                        width: '2px',
                        background: 'rgba(255,255,255,0.06)',
                        zIndex: 0,
                      }}
                    />
                  )}
                  <div
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '16px',
                      padding: '20px 24px',
                      background: row.isResult
                        ? 'rgba(16,185,129,0.06)'
                        : 'rgba(255,255,255,0.02)',
                      border: '1px solid',
                      borderColor: row.isResult
                        ? 'rgba(16,185,129,0.2)'
                        : 'rgba(255,255,255,0.06)',
                      borderRadius: idx === 0 ? '12px 12px 0 0' : idx === arr.length - 1 ? '0 0 12px 12px' : '0',
                      borderTop: idx > 0 ? '1px solid rgba(255,255,255,0.04)' : undefined,
                    }}
                  >
                    {/* Step bubble */}
                    <div
                      style={{
                        flexShrink: 0,
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: `${row.color}18`,
                        border: `1px solid ${row.color}40`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        color: row.color,
                        letterSpacing: '0.05em',
                        marginTop: '1px',
                      }}
                    >
                      {row.step}
                    </div>

                    {/* Label + note */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.875rem',
                          color: '#cbd5e1',
                          lineHeight: 1.4,
                        }}
                      >
                        {row.label}
                      </div>
                      {row.note && (
                        <div
                          style={{
                            fontSize: '0.72rem',
                            color: '#94a3b8',
                            marginTop: '4px',
                            fontStyle: 'italic',
                          }}
                        >
                          {row.note}
                        </div>
                      )}
                    </div>

                    {/* Value */}
                    <div
                      style={{
                        flexShrink: 0,
                        fontSize: row.isResult ? '1.4rem' : '1rem',
                        fontWeight: row.isResult ? 800 : 600,
                        color: row.isResult ? '#10b981' : '#f8fafc',
                        fontFamily: 'monospace',
                        letterSpacing: row.isResult ? '-0.02em' : '0',
                        textShadow: row.isResult ? '0 0 20px rgba(16,185,129,0.4)' : 'none',
                      }}
                    >
                      {row.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Parameters ──────────────────────────────────────────────────────── */}
          <FintechCard variant="info">
            <h3 className="text-lg font-semibold text-text-primary mb-6">Retirement Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RangeSlider
                label="Retirement Year"
                value={i.retYear}
                onChange={(value) => inputs.setKey('retYear', Math.round(value))}
                min={CURRENT_YEAR}
                max={CURRENT_YEAR + 50}
                step={1}
                formatValue={(val) => Math.round(val).toString()}
                helperText="The year you plan to retire"
              />
              <RangeSlider
                label="Retirement Duration (Years)"
                value={i.retDuration}
                onChange={(value) => inputs.setKey('retDuration', Math.round(value))}
                min={10}
                max={50}
                step={1}
                formatValue={(val) => `${Math.round(val)} years`}
                helperText="How long you expect retirement to last"
              />
              <MoneyInput
                label="Annual Social Security"
                helperText="Today's dollars. Grows with inflation (COLA); shown pre-tax."
                value={i.socialSecurity}
                onChange={(value) => inputs.setKey('socialSecurity', value)}
              />
              <MoneyInput
                label="Annual Pension"
                helperText="Today's dollars. Held flat — we do NOT inflation-adjust pensions, a conservative choice since most private pensions have no COLA."
                value={i.pension}
                onChange={(value) => inputs.setKey('pension', value)}
              />
              <MoneyInput
                label="Other Annual Income"
                helperText="Today's dollars. Held flat (no inflation adjustment) — conservative."
                value={i.otherIncome}
                onChange={(value) => inputs.setKey('otherIncome', value)}
              />
              <RangeSlider
                label="Annual Inflation Rate"
                value={i.inflation}
                onChange={(value) => inputs.setKey('inflation', value)}
                min={0}
                max={8}
                step={0.1}
                formatValue={(val) => `${val.toFixed(1)}%`}
                helperText="Average annual inflation rate (default: 3%)"
              />
            </div>

            {/* Withdrawal Rate */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <RangeSlider
                label="Withdrawal Rate"
                value={i.withdrawalRate > 0 ? i.withdrawalRate : res.withdrawalRate * 100}
                onChange={(value) => inputs.setKey('withdrawalRate', value)}
                min={2.5}
                max={6.0}
                step={0.1}
                formatValue={(val) => `${val.toFixed(1)}%`}
                helperText={
                  i.withdrawalRate > 0
                    ? 'Custom withdrawal rate (overrides auto-calculation)'
                    : withdrawalRateExplanation
                }
              />
              {i.withdrawalRate === 0 && (
                <p className="mt-2 text-xs text-text-secondary italic">
                  Auto-set from your retirement duration: longer retirements use a lower, safer rate
                  (3.5% at 35+ years, up to 5% under 15). Crossing a bracket, like 34 to 35 years, steps
                  the rate and can move your number. Drag the slider to override.
                </p>
              )}
            </div>
          </FintechCard>
        </>
      )}

      {/* Next Step Navigation */}
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
