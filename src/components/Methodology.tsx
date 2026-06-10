import { FintechCard } from './ui/FintechCard';
import type { ReactNode } from 'react';

// ── Public methodology page (Wave 4) ────────────────────────────────────────────
// Every formula and source the tool uses, in plain language. Open methodology is the
// trust artifact: a nervous first-timer (and a skeptical CFP) can trace every number.
// Content traces to studio/.learn/canonical.md §1–§10; all finance values were
// independently recomputed in WolframAlpha before being locked.

function Formula({ children }: { children: ReactNode }) {
  return (
    <pre
      className="font-mono text-sm overflow-x-auto rounded-lg"
      style={{
        background: 'rgba(15,23,42,0.6)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: '#f8fafc',
        padding: '14px 16px',
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
      }}
    >
      {children}
    </pre>
  );
}

function Source({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs text-text-secondary mt-3" style={{ lineHeight: 1.6 }}>
      <span className="font-semibold text-text-primary">Source: </span>
      {children}
    </p>
  );
}

function Section({ tag, title, children }: { tag: string; title: string; children: ReactNode }) {
  return (
    <FintechCard variant="info">
      <div className="flex items-baseline gap-3 mb-4">
        <span
          className="font-mono text-xs font-bold"
          style={{ color: '#3b82f6', letterSpacing: '0.08em' }}
        >
          {tag}
        </span>
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
      </div>
      <div className="space-y-3 text-sm text-text-secondary" style={{ lineHeight: 1.7 }}>
        {children}
      </div>
    </FintechCard>
  );
}

export function Methodology() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div
          style={{
            display: 'inline-block',
            padding: '4px 14px',
            borderRadius: '999px',
            border: '1px solid rgba(59,130,246,0.35)',
            background: 'rgba(59,130,246,0.08)',
            fontSize: '0.7rem',
            letterSpacing: '0.1em',
            color: '#93c5fd',
            fontWeight: 600,
            textTransform: 'uppercase',
          }}
        >
          Open methodology
        </div>
        <h1 className="text-4xl font-bold text-text-primary">How every number is calculated</h1>
        <p className="text-base text-text-secondary max-w-2xl mx-auto" style={{ lineHeight: 1.7 }}>
          Every figure this tool shows traces to a formula and a primary source below. Each finance
          value was recomputed independently in WolframAlpha before it shipped. Nothing is hidden.
        </p>
      </div>

      {/* Trust statement */}
      <FintechCard variant="success">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { h: 'Every figure validated', b: 'Each formula is recomputed in WolframAlpha and locked to a reference value a test asserts against.' },
            { h: 'No data leaves your browser', b: 'There are no accounts and no servers. Everything is calculated locally and saved only to your browser.' },
            { h: 'Educational, not advice', b: 'Every projection is an estimate, never a guarantee. This is a coach, not a substitute for a CFP.' },
          ].map((c) => (
            <div key={c.h}>
              <div className="text-sm font-semibold text-text-primary mb-1">{c.h}</div>
              <div className="text-xs text-text-secondary" style={{ lineHeight: 1.6 }}>{c.b}</div>
            </div>
          ))}
        </div>
      </FintechCard>

      {/* §1 Withdrawal rate */}
      <Section tag="01" title="The safe withdrawal rate (Trinity Study)">
        <p>
          Your <span className="text-text-primary font-medium">safe withdrawal rate</span> is the
          share of your portfolio you can draw in the first year of retirement and adjust for
          inflation each year afterward, with a high historical chance of never running out. The
          tool auto-selects it from how long your retirement lasts; you can override it.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <th className="text-left py-2 pr-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Retirement duration</th>
                <th className="text-left py-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">Safe withdrawal rate</th>
              </tr>
            </thead>
            <tbody className="font-mono text-text-primary">
              <tr style={{ borderBottom: '1px solid #1e293b' }}><td className="py-2 pr-4">≥ 35 years</td><td className="py-2">3.5%</td></tr>
              <tr style={{ borderBottom: '1px solid #1e293b' }}><td className="py-2 pr-4">25–34 years</td><td className="py-2">4.0% — the "4% rule"</td></tr>
              <tr style={{ borderBottom: '1px solid #1e293b' }}><td className="py-2 pr-4">15–24 years</td><td className="py-2">4.5%</td></tr>
              <tr><td className="py-2 pr-4">&lt; 15 years</td><td className="py-2">5.0%</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          The brackets are a step function, so a one-year change in duration can move the rate (34
          vs. 35 years steps 4.0% → 3.5%) and with it your number. The 4% / 30-year anchor is
          high-confidence; the longer and shorter brackets are this tool's own interpolation.
        </p>
        <Source>
          Bengen, W.P. (1994), "Determining Withdrawal Rates Using Historical Data," <em>Journal of
          Financial Planning</em> 7(4):171–180; Cooley, Hubbard &amp; Walz (1998), the Trinity Study,
          <em> AAII Journal</em>.
        </Source>
      </Section>

      {/* §2 The Number */}
      <Section tag="02" title="Your number (the required portfolio)">
        <p>
          Your number is the portfolio that funds your retirement spending net of any guaranteed
          income, at your withdrawal rate. It restates the 4% rule as the 25× rule (1 ÷ 0.04 = 25).
        </p>
        <Formula>{`futureAnnualNeed  = annual retirement spend × (1 + inflation)^years
futureIncome      = (Social Security + pension + other) × (1 + inflation)^years
netNeed           = max(0, futureAnnualNeed − futureIncome)
requiredPortfolio = netNeed ÷ withdrawalRate`}</Formula>
        <p>
          <span className="text-text-primary font-medium">Income treatment.</span> Social Security
          grows with inflation (it has a cost-of-living adjustment), so it keeps its value. Pensions
          and other income are held flat in today's dollars — most private pensions have no
          cost-of-living raise, so this is a deliberately conservative default whose effect shows up
          in the success probability, not in this headline number.
        </p>
        <p>
          <span className="text-text-primary font-medium">Today's dollars.</span> The engine works
          in future dollars, but headline figures are shown in today's purchasing power (with the
          future-dollar amount beside them) so your number does not shrink just because you retire
          sooner. <span className="text-text-primary font-medium">All figures are pre-tax.</span>
        </p>
        <Source>The 25× rule restated from the 4% rule (Bengen 1994). SS COLA: SSA methodology. Pre-tax caveat per IRS Pub 590-B / 915.</Source>
      </Section>

      {/* §3 Projection */}
      <Section tag="03" title="Growing your portfolio (the projection)">
        <p>
          One month-by-month simulation grows your current portfolio and your contributions at an
          effective monthly rate, so a stated "7%" is a true 7% annual return. Contributions post at
          month-end, step up once a year, and stop when you say.
        </p>
        <Formula>{`m           = (1 + annualReturn)^(1/12) − 1        // (1 + m)^12 = 1 + annualReturn
projected   = currentPortfolio compounded at m
            + each monthly contribution compounded at m to retirement`}</Formula>
        <p>
          Return chips: Conservative 5% · Moderate 7% · Aggressive 9%. These are long-run,
          equity-heavy nominal estimates — educational assumptions, not guarantees.
        </p>
        <Source>Collins, <em>The Simple Path to Wealth</em>; Bogleheads wiki — the low-cost index-fund premise.</Source>
      </Section>

      {/* §10 Monte Carlo */}
      <Section tag="04" title="The probability (Monte Carlo)">
        <p>
          Real returns vary, so the tool runs <span className="text-text-primary font-medium">1,000
          simulations</span> of your plan. Each year's return is drawn from a lognormal distribution
          matched to a target average and volatility, so a draw can never fall below −100%. The same
          inputs always produce the same result (the simulation is seeded).
        </p>
        <Formula>{`Accumulation:  mean = your return,  volatility σ = 16%   (S&P long-run, trimmed)
Retirement:    mean = max(4%, return × 0.85),  σ = 10%   (a 60/40 mix)
Success = the share of the 1,000 paths whose balance lasts the full retirement`}</Formula>
        <p>
          In retirement each year applies a sampled return <em>first</em>, then subtracts the
          withdrawal — so a bad early sequence permanently impairs the plan. This is
          {' '}<span className="text-text-primary font-medium">sequence-of-returns risk</span>, the
          single biggest threat the deterministic math misses. The cone shows the 10th, 50th, and
          90th percentiles; the headline "projected" figure is the median (typical) path, not the
          mean — returns are right-skewed, so the mean overstates the typical outcome.
        </p>
        <p>
          <span className="text-text-primary font-medium">How we display it.</span> The success rate
          is judged against the <span className="text-text-primary font-medium">75–90% "healthy
          zone"</span> used by professional planning software: below it the plan leans on luck, and
          research on retirement income treats results above ~90% as possible <em>over</em>-saving —
          security bought with living you could be doing now. The downside line is framed by what it
          funds ("9 in 10 outcomes stay funded through {'{year}'}"), the way Fidelity's retirement
          score judges plans in a significantly-below-average market rather than presenting a doom
          date. Percentiles are labeled in plain odds ("a 1-in-10 rough market") with the statistic
          kept in parentheses. None of this changes the math — only how the same numbers are said.
        </p>
        <p>
          <span className="text-text-primary font-medium">A known conservatism.</span> Each year's
          return is drawn independently, with no memory — so the model ignores the mild long-horizon
          mean reversion real markets have shown, and its deep downside paths run bleaker than
          anything in the post-1927 US record (though markets abroad have done worse). Treat the
          rough-market line as a stress case, and expect a future version using historical
          block-sampling to tighten it honestly.
        </p>
        <Source>Volatility: macrotrends S&amp;P 500 annual returns 1927–2026; NYU Stern V-Lab GARCH volatility; CFA Institute, <em>The Performance of the 60/40 Portfolio</em> (2025). Display conventions: MoneyGuidePro's Confidence Zone (75–90% success target); Fidelity Retirement Score methodology ("significantly below average market" = the 10% of scenarios that perform worst); Kitces, <em>Reframing Retirement Risk As Over- And Under-Spending</em>.</Source>
      </Section>

      {/* What we don't model */}
      <Section tag="05" title="What this tool does not model (the honest limits)">
        <ul className="space-y-2 list-disc pl-5">
          <li><span className="text-text-primary font-medium">Taxes.</span> All figures are pre-tax. Social Security is partly taxable and traditional 401(k)/IRA withdrawals are ordinary income, so real spendable income is lower than shown.</li>
          <li><span className="text-text-primary font-medium">Fat tails and crashes.</span> The lognormal model misses extreme events, regime changes, and serial correlation. It is a guide, not a forecast.</li>
          <li><span className="text-text-primary font-medium">Personal circumstances.</span> Health, long-term care, family changes, and your own risk tolerance are not in the math.</li>
        </ul>
        <p>A half-built tax engine would be its own false precision, so the tool states the caveat instead of pretending to model it.</p>
      </Section>

      {/* Reference values */}
      <Section tag="06" title="Reference values (independently recomputed)">
        <p>These are locked in WolframAlpha; an automated test asserts the engine reproduces each one. Any code path that returns a different number is a regression.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <th className="text-left py-2 pr-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Quantity</th>
                <th className="text-left py-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">Value</th>
              </tr>
            </thead>
            <tbody className="font-mono text-text-primary">
              <tr style={{ borderBottom: '1px solid #1e293b' }}><td className="py-2 pr-4">25× rule — $40k/yr spend</td><td className="py-2">$1,000,000</td></tr>
              <tr style={{ borderBottom: '1px solid #1e293b' }}><td className="py-2 pr-4">FV of $100k at 7%, 25 yr</td><td className="py-2">$542,743.26</td></tr>
              <tr style={{ borderBottom: '1px solid #1e293b' }}><td className="py-2 pr-4">$1,000/mo, +3%/yr, 7%, 25 yr</td><td className="py-2">$1,031,790.90</td></tr>
              <tr style={{ borderBottom: '1px solid #1e293b' }}><td className="py-2 pr-4">Projected (the two above)</td><td className="py-2">$1,574,534.16</td></tr>
              <tr><td className="py-2 pr-4">Textbook $1M / 4% / 30-yr success</td><td className="py-2">≈ 73%</td></tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* Sources */}
      <Section tag="07" title="Full source list">
        <ul className="space-y-2 list-disc pl-5">
          <li>Bengen, W.P. (1994) — the 4% rule. <em>Journal of Financial Planning</em>.</li>
          <li>Cooley, Hubbard &amp; Walz (1998) — the Trinity Study. <em>AAII Journal</em>.</li>
          <li>JL Collins — <em>The Simple Path to Wealth</em> (index-fund premise, simplicity).</li>
          <li>Ramit Sethi — <em>I Will Teach You To Be Rich</em> (the Fixed / Investments / Guilt-Free structure).</li>
          <li>Morgan Housel — <em>The Psychology of Money</em> (behavior over math, anti-abandonment).</li>
          <li>Bogleheads wiki — safe withdrawal rate and variable withdrawal.</li>
          <li>MoneyGuidePro Confidence Zone &amp; Fidelity Retirement Score methodology — the 75–90% healthy-zone and funded-through display conventions; Kitces.com on over- vs under-spending risk.</li>
          <li>IRS Pub 590-B (account taxation, RMDs), Pub 915 (Social Security taxation); SSA COLA history.</li>
          <li>W3C WCAG 2.2 — the contrast and accessibility standard this tool is built to.</li>
        </ul>
      </Section>

      {/* Footer */}
      <div
        className="rounded-lg text-sm text-center"
        style={{
          border: '1px solid rgba(16,185,129,0.2)',
          background: 'rgba(16,185,129,0.05)',
          padding: '20px',
          color: '#94a3b8',
          lineHeight: 1.7,
        }}
      >
        <span className="text-text-primary font-semibold">Open by design.</span> Every figure here is
        validated and traceable, the tool is open source, and no data ever leaves your browser. If a
        number ever looks wrong, the formula and its source are on this page — check our work.
      </div>
    </div>
  );
}
