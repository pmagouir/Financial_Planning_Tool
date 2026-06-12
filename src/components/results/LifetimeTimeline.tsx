import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency, formatAxis } from './format';

// The signature lifetime chart: one picture of the whole plan — accumulation up to retirement,
// then drawdown — with the 10th–90th percentile band (the "range of likely outcomes") and the
// median path. Reads the store's Monte Carlo lifecycle cone (canonical §10); it does NOT simulate.
//
// Display convention (canonical §2): shown in TODAY'S dollars so the curve is relatable and the
// target line is stable. The engine's cone is nominal future dollars; each year is deflated by
// (1 + inflation)^(year − today). The nominal value stays available in the tooltip.

interface ConePoint {
  year: number;
  p10: number;
  p50: number;
  p90: number;
}

interface LifetimeTimelineProps {
  cone: ConePoint[]; // res.mcNetWorthCone — nominal future dollars
  requiredPortfolio: number; // nominal
  inflation: number; // percent, e.g. 3
  retYear: number;
  currentYear: number;
}

interface Datum {
  year: number;
  p10: number;
  p50: number;
  p90: number;
  base: number; // band floor (= p10), transparent
  span: number; // band height (= p90 − p10), filled
  p50Nominal: number;
}

interface TimelineTooltipProps {
  active?: boolean;
  label?: number;
  payload?: { payload: Datum }[];
  retYear: number;
}

function TimelineTooltip({ active, label, payload, retYear }: TimelineTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0].payload;
  const year = label ?? d.year;
  const phase = year > retYear ? 'in retirement' : 'still investing';

  return (
    <div
      style={{
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '10px',
        padding: '12px 14px',
        minWidth: '210px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      }}
    >
      <div
        style={{
          color: '#94a3b8',
          fontSize: '11px',
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          marginBottom: '6px',
        }}
      >
        {year} · {phase}
      </div>
      <div style={{ color: '#f8fafc', fontSize: '17px', fontWeight: 600, fontFamily: 'monospace' }}>
        {formatCurrency(d.p50)}
      </div>
      <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px' }}>median · today&apos;s dollars</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', fontSize: '12px' }}>
        <span style={{ color: '#94a3b8' }}>likely range</span>
        <span style={{ fontFamily: 'monospace', color: '#cbd5e1' }}>
          {formatCurrency(d.p10)} – {formatCurrency(d.p90)}
        </span>
      </div>
      <div style={{ marginTop: '6px', fontSize: '11px', color: '#94a3b8' }}>
        ≈ {formatCurrency(d.p50Nominal)} in {d.year} dollars
      </div>
    </div>
  );
}

export function LifetimeTimeline({
  cone,
  requiredPortfolio,
  inflation,
  retYear,
  currentYear,
}: LifetimeTimelineProps) {
  const infl = inflation / 100;
  const deflate = (val: number, year: number): number =>
    val / Math.pow(1 + infl, Math.max(0, year - currentYear));

  const data: Datum[] = cone.map((p) => {
    const p10 = deflate(p.p10, p.year);
    const p50 = deflate(p.p50, p.year);
    const p90 = deflate(p.p90, p.year);
    return { year: p.year, p10, p50, p90, base: p10, span: Math.max(0, p90 - p10), p50Nominal: p.p50 };
  });

  const targetToday = deflate(requiredPortfolio, retYear);
  const peakMedian = data.reduce((m, d) => Math.max(m, d.p50), 0);
  // Scale to the median + target (the decision-relevant range); the explosive upper tail runs
  // above and is clipped by allowDataOverflow so the typical path stays readable (canonical §10.6).
  const yMax = Math.max(peakMedian, targetToday, 1) * 1.35;
  const lastYear = data.length ? data[data.length - 1].year : retYear;

  return (
    <div
      style={{ height: '300px' }}
      role="img"
      aria-label={`Lifetime portfolio projection in today's dollars, ${currentYear} to ${lastYear}: the median path and the 10th–90th percentile range, with your target marked.`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 78, left: 6, bottom: 6 }}>
          <defs>
            <linearGradient id="ltBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.06} />
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
          />
          <YAxis
            domain={[0, yMax]}
            allowDataOverflow
            tickFormatter={formatAxis}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={64}
          />

          <Tooltip content={<TimelineTooltip retYear={retYear} />} />

          {/* 10th–90th percentile band (stacked-area technique: transparent floor + filled span) */}
          <Area type="monotone" dataKey="base" stackId="band" stroke="none" fill="transparent" dot={false} isAnimationActive={false} />
          <Area type="monotone" dataKey="span" stackId="band" stroke="none" fill="url(#ltBand)" dot={false} isAnimationActive={false} />

          {retYear > currentYear && (
            <ReferenceLine
              x={retYear}
              stroke="#94a3b8"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{ value: `retire ${retYear}`, position: 'insideTopRight', fill: '#94a3b8', fontSize: 11 }}
            />
          )}
          {targetToday > 0 && (
            <ReferenceLine
              y={targetToday}
              stroke="#f87171"
              strokeDasharray="6 4"
              strokeWidth={1.5}
              label={{ value: 'your number', position: 'right', fill: '#f87171', fontSize: 11 }}
            />
          )}

          {/* Downside floor (10th percentile) — dashed slate so the rough-market path is legible */}
          <Line type="monotone" dataKey="p10" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
          {/* Median (typical) path — the hero line */}
          <Line type="monotone" dataKey="p50" stroke="#10b981" strokeWidth={2.5} dot={false} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
