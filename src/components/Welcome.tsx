import { FintechCard } from './ui/FintechCard';
import { Reveal } from './ui/Reveal';
import { CountUp } from './ui/CountUp';
import { TryItDemo } from './TryItDemo';

interface WelcomeProps {
  onStart?: () => void;
}

// Aesthetic 2.0: color encodes meaning, not sequence — the five steps share one quiet
// treatment (emerald numerals on a neutral bubble) instead of the old five-color rainbow.
const steps = [
  { num: '01', title: 'Current Reality', desc: 'Map where your money actually goes today.' },
  { num: '02', title: 'Retirement Design', desc: 'Envision the lifestyle you want in retirement.' },
  { num: '03', title: 'Your Number', desc: 'Calculate the exact portfolio you need.' },
  { num: '04', title: 'Investment Path', desc: "See if you're on track — and what to do if not." },
  { num: '05', title: 'Summary', desc: 'Your complete retirement plan at a glance.' },
];

const pillars = [
  {
    pill: 'Conscious Spending',
    pillColor: '#3b82f6',
    author: 'Ramit Sethi',
    book: 'I Will Teach You To Be Rich',
    url: 'https://www.iwillteachyoutoberich.com',
    insight:
      "Spend extravagantly on what you love. Cut mercilessly on what you don't. Automate the rest.",
  },
  {
    pill: 'Simple Investing',
    pillColor: '#10b981',
    author: 'JL Collins',
    book: 'The Simple Path to Wealth',
    url: 'https://jlcollinsnh.com',
    insight: 'Low-cost index funds + time + consistency beats clever strategies every time.',
  },
  {
    pill: 'Behavioral Wisdom',
    pillColor: '#8b5cf6',
    author: 'Morgan Housel',
    book: 'The Psychology of Money',
    url: 'https://www.morganhousel.com',
    insight: 'Wealth is more about behavior than intelligence. Enough-ness matters.',
  },
];

const stats = [
  { count: 4, format: (n: number) => `${Math.round(n)}%`, label: 'Proven since 1994' },
  { count: 25, format: (n: number) => `${Math.round(n)}x`, label: 'Portfolio multiplier' },
  { count: 0, format: (n: number) => `${Math.round(n)}`, label: 'Data leaves your browser' },
  { count: 5, format: (n: number) => `${Math.round(n)} Steps`, label: 'Start to finish' },
];

export function Welcome({ onStart }: WelcomeProps) {
  return (
    <div className="space-y-12">
      {/* ── Hero Section ─────────────────────────────────────────────────────── */}
      <div
        className="relative text-center py-16 space-y-6"
        style={{ borderRadius: '24px', overflow: 'hidden' }}
      >
        {/* Eyebrow label */}
        <Reveal>
          <div
            style={{
              display: 'inline-block',
              padding: '4px 14px',
              borderRadius: '999px',
              border: '1px solid rgba(59,130,246,0.35)',
              background: 'rgba(59,130,246,0.08)',
              fontSize: '0.75rem',
              letterSpacing: '0.05em',
              color: '#93c5fd',
              fontWeight: 500,
              position: 'relative',
            }}
          >
            Spending · Investing · Behavior
          </div>
        </Reveal>

        {/* Main headline */}
        <Reveal delay={0.08}>
          <h1
            className="text-5xl font-bold text-white tracking-tight leading-tight"
            style={{ position: 'relative' }}
          >
            Find Your
            <br />
            <span style={{ color: '#3b82f6' }}>Retirement Number.</span>
          </h1>
        </Reveal>

        {/* Sub-headline */}
        <Reveal delay={0.16}>
          <p
            className="text-lg max-w-xl mx-auto leading-relaxed"
            style={{ color: '#94a3b8', position: 'relative' }}
          >
            Five steps. No accounts. No data leaving your browser.
            <br />
            Built on battle-tested financial research.
          </p>
        </Reveal>

        {/* CTA Button */}
        <Reveal delay={0.24}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              position: 'relative',
            }}
          >
            {onStart ? (
              <button
                onClick={onStart}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 32px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#3b82f6',
                  color: '#ffffff',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  letterSpacing: '0.01em',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#3b82f6';
                }}
              >
                Get Started{' '}
                <span aria-hidden="true" style={{ fontSize: '1.1rem' }}>
                  →
                </span>
              </button>
            ) : (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.03)',
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                }}
              >
                <span style={{ fontSize: '1rem' }}>↓</span>
                Select Step 1 to begin
              </div>
            )}
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              or jump straight to any step
            </div>
          </div>
        </Reveal>
      </div>

      {/* ── Try It — live interactive demo ───────────────────────────────────── */}
      <Reveal>
        <TryItDemo />
      </Reveal>

      {/* ── Stats Strip ──────────────────────────────────────────────────────── */}
      <Reveal>
        {/* 2×2 on phones (4-up crushes the labels under ~640px), 4-up on desktop. Dividers via nth-child. */}
        <style>{`
        .welcome-stats { display: grid; grid-template-columns: repeat(2, 1fr); }
        .welcome-stats > div { border-right: 1px solid rgba(255,255,255,0.06); border-bottom: 1px solid rgba(255,255,255,0.06); }
        .welcome-stats > div:nth-child(2n) { border-right: none; }
        .welcome-stats > div:nth-child(n + 3) { border-bottom: none; }
        @media (min-width: 640px) {
          .welcome-stats { grid-template-columns: repeat(4, 1fr); }
          .welcome-stats > div,
          .welcome-stats > div:nth-child(2n),
          .welcome-stats > div:nth-child(n + 3) { border-right: 1px solid rgba(255,255,255,0.06); border-bottom: none; }
          .welcome-stats > div:last-child { border-right: none; }
        }
      `}</style>
        <div
          className="welcome-stats"
          style={{
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(255,255,255,0.02)',
            overflow: 'hidden',
          }}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              style={{
                padding: '18px 12px',
                textAlign: 'center',
              }}
            >
              <div
                className="text-2xl font-bold text-white"
                style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}
              >
                <CountUp value={stat.count} format={stat.format} />
              </div>
              <div
                style={{
                  fontSize: '0.7rem',
                  color: '#94a3b8',
                  marginTop: '4px',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* ── How It Works — Numbered Step Flow ────────────────────────────────── */}
      <Reveal>
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-semibold text-white">How it works</h2>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
              A guided five-step process, start to finish.
            </p>
          </div>

          {/* Step cards grid with connecting line */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '0',
              position: 'relative',
            }}
            className="step-flow-grid"
          >
            {/* Desktop connecting line */}
            <div
              style={{
                position: 'absolute',
                top: '28px',
                left: '10%',
                right: '10%',
                height: '1px',
                background: 'rgba(255,255,255,0.08)',
                pointerEvents: 'none',
                zIndex: 0,
              }}
              className="hidden md:block"
            />

            {steps.map((step, idx) => (
              <div
                key={step.num}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  padding:
                    idx === 0
                      ? '20px 16px 20px 20px'
                      : idx === steps.length - 1
                        ? '20px 20px 20px 16px'
                        : '20px 16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderLeft:
                    idx > 0
                      ? '1px solid rgba(255,255,255,0.04)'
                      : '1px solid rgba(255,255,255,0.07)',
                  borderRadius:
                    idx === 0 ? '12px 0 0 12px' : idx === steps.length - 1 ? '0 12px 12px 0' : '0',
                  transition: 'background 0.2s, border-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.055)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)';
                }}
              >
                {/* Step number bubble — one quiet treatment for all five (Aesthetic 2.0) */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    marginBottom: '12px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      color: '#10b981',
                      letterSpacing: '0.05em',
                      fontFamily: 'var(--font-mono)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {step.num}
                  </span>
                </div>

                <div
                  className="font-semibold text-white"
                  style={{ fontSize: '0.875rem', marginBottom: '6px', lineHeight: 1.3 }}
                >
                  {step.title}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#94a3b8',
                    lineHeight: 1.5,
                  }}
                >
                  {step.desc}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile fallback: vertical list (shown below md, grid above) */}
          <style>{`
          @media (max-width: 767px) {
            .step-flow-grid {
              grid-template-columns: 1fr !important;
            }
            .step-flow-grid > div {
              border-radius: 0 !important;
              border-left: 1px solid rgba(255,255,255,0.07) !important;
              border-top: 1px solid rgba(255,255,255,0.04) !important;
            }
            .step-flow-grid > div:first-child {
              border-radius: 12px 12px 0 0 !important;
              border-top: 1px solid rgba(255,255,255,0.07) !important;
            }
            .step-flow-grid > div:last-child {
              border-radius: 0 0 12px 12px !important;
            }
          }
        `}</style>
        </div>
      </Reveal>

      {/* ── Three Pillars Section ─────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-semibold text-white">The philosophy behind this tool</h2>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
            Three frameworks. One coherent system.
          </p>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            An independent tool that draws on these authors&apos; published work — it has no
            affiliation with, or endorsement from, any of them.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pillars.map((pillar, idx) => (
            <Reveal key={pillar.pill} delay={idx * 0.1}>
              <FintechCard>
                <div
                  style={{
                    borderLeft: `3px solid ${pillar.pillColor}`,
                    paddingLeft: '16px',
                    marginLeft: '-4px',
                  }}
                >
                  {/* Pill label — neutral chip; the 3px left border carries the category color */}
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: '#cbd5e1',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      marginBottom: '14px',
                    }}
                  >
                    {pillar.pill}
                  </div>

                  {/* Author + book */}
                  <div className="space-y-1 mb-4">
                    <a
                      href={pillar.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${pillar.author}'s website (opens in a new tab)`}
                      className="inline-flex items-center gap-1 font-semibold text-white hover:underline"
                      style={{ fontSize: '0.9rem' }}
                    >
                      {pillar.author}
                      <span
                        aria-hidden="true"
                        style={{ color: pillar.pillColor, fontSize: '0.8rem' }}
                      >
                        ↗
                      </span>
                    </a>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#94a3b8',
                        fontStyle: 'italic',
                      }}
                    >
                      {pillar.book}
                    </div>
                  </div>

                  {/* Key insight */}
                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: '#94a3b8',
                      lineHeight: 1.65,
                    }}
                  >
                    {pillar.insight}
                  </p>
                </div>
              </FintechCard>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ── Educational Disclaimer ────────────────────────────────────────────── */}
      <div
        className="rounded-lg text-sm"
        style={{
          border: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(255,255,255,0.02)',
          padding: '16px 20px',
          color: '#94a3b8',
          lineHeight: 1.65,
        }}
      >
        <span style={{ color: '#94a3b8', fontWeight: 600 }}>Educational use only.</span> This tool
        provides estimates to help you think about retirement planning — it is not personalized
        financial advice. Projections run a 1,000-trial Monte Carlo simulation that varies market
        returns each year, so volatility and sequence-of-returns risk are modeled; figures are
        pre-tax and do not model taxes or fees. Consider consulting a Certified Financial Planner
        (CFP) before making major financial decisions.{' '}
        <span style={{ color: '#94a3b8' }}>
          Your data stays private. Everything is calculated locally in your browser.
        </span>
      </div>
    </div>
  );
}
