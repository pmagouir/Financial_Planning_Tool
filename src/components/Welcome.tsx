import { FintechCard } from './ui/FintechCard';

interface WelcomeProps {
  onStart?: () => void;
}

const steps = [
  {
    num: '01',
    title: 'Current Reality',
    desc: 'Map where your money actually goes today.',
    color: '#3b82f6',
  },
  {
    num: '02',
    title: 'Retirement Design',
    desc: 'Envision the lifestyle you want in retirement.',
    color: '#8b5cf6',
  },
  {
    num: '03',
    title: 'Your Number',
    desc: 'Calculate the exact portfolio you need.',
    color: '#10b981',
  },
  {
    num: '04',
    title: 'Investment Path',
    desc: "See if you're on track — and what to do if not.",
    color: '#f59e0b',
  },
  {
    num: '05',
    title: 'Summary',
    desc: 'Your complete retirement plan at a glance.',
    color: '#ef4444',
  },
];

const pillars = [
  {
    pill: 'Conscious Spending',
    pillColor: '#3b82f6',
    author: 'Ramit Sethi',
    book: 'I Will Teach You To Be Rich',
    insight:
      "Spend extravagantly on what you love. Cut mercilessly on what you don't. Automate the rest.",
  },
  {
    pill: 'Simple Investing',
    pillColor: '#10b981',
    author: 'JL Collins',
    book: 'The Simple Path to Wealth',
    insight:
      'Low-cost index funds + time + consistency beats clever strategies every time.',
  },
  {
    pill: 'Behavioral Wisdom',
    pillColor: '#8b5cf6',
    author: 'Morgan Housel',
    book: 'The Psychology of Money',
    insight:
      'Wealth is more about behavior than intelligence. Enough-ness matters.',
  },
];

const stats = [
  { value: '4%', label: 'Proven since 1994' },
  { value: '25x', label: 'Portfolio multiplier' },
  { value: '$0 data', label: 'Runs in-browser' },
  { value: '5 Steps', label: 'Start to finish' },
];

export function Welcome({ onStart }: WelcomeProps) {
  return (
    <div className="space-y-12">

      {/* ── Hero Section ─────────────────────────────────────────────────────── */}
      <div
        className="relative text-center py-16 space-y-6"
        style={{ borderRadius: '24px', overflow: 'hidden' }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '24px',
            background:
              'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(59,130,246,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Eyebrow label */}
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
          Based on the Trinity Study · JL Collins · Ramit Sethi
        </div>

        {/* Main headline */}
        <h1
          className="text-5xl font-bold text-white tracking-tight leading-tight"
          style={{ position: 'relative' }}
        >
          Find Your
          <br />
          <span style={{ color: '#3b82f6' }}>Retirement Number.</span>
        </h1>

        {/* Sub-headline */}
        <p
          className="text-lg max-w-xl mx-auto leading-relaxed"
          style={{ color: '#94a3b8', position: 'relative' }}
        >
          Five steps. No accounts. No data leaving your browser.
          <br />
          Built on battle-tested financial research.
        </p>

        {/* CTA Button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', position: 'relative' }}>
          {onStart ? (
            <button
              onClick={onStart}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 32px',
                borderRadius: '12px',
                border: '1px solid rgba(59,130,246,0.45)',
                background: 'rgba(59,130,246,0.15)',
                color: '#93c5fd',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s, border-color 0.2s, color 0.2s',
                letterSpacing: '0.01em',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.background = 'rgba(59,130,246,0.28)';
                el.style.borderColor = 'rgba(59,130,246,0.65)';
                el.style.color = '#bfdbfe';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.background = 'rgba(59,130,246,0.15)';
                el.style.borderColor = 'rgba(59,130,246,0.45)';
                el.style.color = '#93c5fd';
              }}
            >
              Get Started <span style={{ fontSize: '1.1rem' }}>→</span>
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
              Select Step 1 in the sidebar to begin
            </div>
          )}
          <div style={{ fontSize: '0.75rem', color: '#334155' }}>
            or select a step in the sidebar
          </div>
        </div>
      </div>

      {/* ── Stats Strip ──────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(255,255,255,0.02)',
          overflow: 'hidden',
        }}
      >
        {stats.map((stat, idx) => (
          <div
            key={stat.value}
            style={{
              flex: 1,
              padding: '20px 24px',
              textAlign: 'center',
              borderRight:
                idx < stats.length - 1
                  ? '1px solid rgba(255,255,255,0.06)'
                  : 'none',
            }}
          >
            <div
              className="text-2xl font-bold text-white"
              style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}
            >
              {stat.value}
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

      {/* ── How It Works — Numbered Step Flow ────────────────────────────────── */}
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
                padding: idx === 0 ? '20px 16px 20px 20px' : idx === steps.length - 1 ? '20px 20px 20px 16px' : '20px 16px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderLeft: idx > 0 ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(255,255,255,0.07)',
                borderRadius:
                  idx === 0
                    ? '12px 0 0 12px'
                    : idx === steps.length - 1
                    ? '0 12px 12px 0'
                    : '0',
                transition: 'background 0.2s, border-color 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.055)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)';
              }}
            >
              {/* Step number bubble */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: `${step.color}18`,
                  border: `1px solid ${step.color}40`,
                  marginBottom: '12px',
                }}
              >
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: step.color,
                    letterSpacing: '0.05em',
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

      {/* ── Three Pillars Section ─────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-semibold text-white">The philosophy behind this tool</h2>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
            Three frameworks. One coherent system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pillars.map((pillar) => (
            <FintechCard key={pillar.pill}>
              <div
                style={{
                  borderLeft: `3px solid ${pillar.pillColor}`,
                  paddingLeft: '16px',
                  marginLeft: '-4px',
                }}
              >
                {/* Pill label */}
                <div
                  style={{
                    display: 'inline-block',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    background: `${pillar.pillColor}18`,
                    border: `1px solid ${pillar.pillColor}35`,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: pillar.pillColor,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    marginBottom: '14px',
                  }}
                >
                  {pillar.pill}
                </div>

                {/* Author + book */}
                <div className="space-y-1 mb-4">
                  <div className="font-semibold text-white" style={{ fontSize: '0.9rem' }}>
                    {pillar.author}
                  </div>
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
        <span style={{ color: '#94a3b8', fontWeight: 600 }}>Educational use only.</span>{' '}
        This tool provides estimates to help you think about retirement planning — it is not
        personalized financial advice. Results assume constant investment returns and do not account
        for taxes, fees, or market volatility. Consider consulting a Certified Financial Planner
        (CFP) before making major financial decisions.{' '}
        <span style={{ color: '#334155' }}>
          Your data stays private — everything is calculated locally in your browser.
        </span>
      </div>
    </div>
  );
}
