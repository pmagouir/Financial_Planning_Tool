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
  ReferenceArea,
} from 'recharts';

const CURRENT_YEAR = new Date().getFullYear();

interface Step4Props {
  onNext?: () => void;
}

// Custom tooltip for the projection chart
interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  label?: number;
  payload?: TooltipPayloadEntry[];
}

function ProjectionTooltip({ active, label, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const portfolioEntry = payload.find((p) => p.name === 'Portfolio');
  const targetEntry = payload.find((p) => p.name === 'Target Portfolio');

  return (
    <div
      style={{
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '8px',
        padding: '12px 16px',
        color: '#f8fafc',
        fontSize: '13px',
        minWidth: '200px',
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: '8px', color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Year {label}
      </div>
      {portfolioEntry && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '4px' }}>
          <span style={{ color: '#3b82f6' }}>Projected Portfolio</span>
          <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{formatCurrency(portfolioEntry.value)}</span>
        </div>
      )}
      {targetEntry && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
          <span style={{ color: '#ef4444' }}>Required Portfolio</span>
          <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{formatCurrency(targetEntry.value)}</span>
        </div>
      )}
    </div>
  );
}

export function Step4_InvestmentPath({ onNext }: Step4Props) {
  const i = useStore(inputs);
  const res = useStore(results);

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Generate projection data for chart - matching R line 1527
  const projectionData = useMemo(() => {
    const data = [];
    const yearsToRetirement = res.yearsToRet;
    const r = i.annualReturn / 100;
    const rMonthly = r / 12;
    const contribIncreaseRate = i.contribIncrease / 100 / 12;
    const contribStopYear = i.contribStopYear > 0 ? i.contribStopYear : i.retYear;
    const yearsContributing = Math.max(0, Math.min(yearsToRetirement, contribStopYear - CURRENT_YEAR));

    // Add current year point
    data.push({
      year: CURRENT_YEAR,
      portfolio: i.currentPortfolio,
      target: res.requiredPortfolio,
    });

    // Calculate for each year
    for (let yearOffset = 1; yearOffset <= yearsToRetirement; yearOffset++) {
      const year = CURRENT_YEAR + yearOffset;
      const totalMonths = yearOffset * 12;

      // Portfolio with contributions (compound principal + contributions with increase)
      let portfolio = i.currentPortfolio * Math.pow(1 + r, yearOffset);

      // Add monthly contributions with increase and compounding (only up to stop year)
      const monthsContributing = Math.min(totalMonths, yearsContributing * 12);
      if (rMonthly > 0 && monthsContributing > 0) {
        for (let month = 0; month < monthsContributing; month++) {
          const monthlyContrib = i.monthlyContrib * Math.pow(1 + contribIncreaseRate, month);
          const monthsRemaining = totalMonths - month;
          portfolio += monthlyContrib * Math.pow(1 + rMonthly, monthsRemaining);
        }
      } else if (monthsContributing > 0) {
        for (let month = 0; month < monthsContributing; month++) {
          portfolio += i.monthlyContrib * Math.pow(1 + contribIncreaseRate, month);
        }
      }

      data.push({
        year,
        portfolio,
        target: res.requiredPortfolio,
      });
    }

    return data;
  }, [
    i.currentPortfolio,
    i.monthlyContrib,
    i.annualReturn,
    i.contribIncrease,
    i.contribStopYear,
    i.retYear,
    res.requiredPortfolio,
    res.yearsToRet,
  ]);

  // Determine the range of years where projected portfolio < required portfolio
  // Used for ReferenceArea red shading
  const shortfallRanges = useMemo(() => {
    const ranges: Array<{ x1: number; x2: number }> = [];
    let rangeStart: number | null = null;

    for (let idx = 0; idx < projectionData.length; idx++) {
      const point = projectionData[idx];
      const isBehind = point.portfolio < point.target;

      if (isBehind && rangeStart === null) {
        rangeStart = point.year;
      } else if (!isBehind && rangeStart !== null) {
        ranges.push({ x1: rangeStart, x2: projectionData[idx - 1].year });
        rangeStart = null;
      }
    }

    // Close an open range at the end of data
    if (rangeStart !== null && projectionData.length > 0) {
      ranges.push({ x1: rangeStart, x2: projectionData[projectionData.length - 1].year });
    }

    return ranges;
  }, [projectionData]);

  return (
    <div className="space-y-8">
      {/* Input Section */}
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

      {/* Annual Return Selection */}
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
        <div className="mt-4 flex gap-4">
          <button
            onClick={() => inputs.setKey('annualReturn', 5)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              i.annualReturn === 5
                ? 'bg-shiny-info text-white shadow-shiny-card'
                : 'bg-shiny-surface text-shiny-text hover:bg-shiny-border'
            }`}
          >
            Conservative (5%)
          </button>
          <button
            onClick={() => inputs.setKey('annualReturn', 7)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              i.annualReturn === 7
                ? 'bg-shiny-primary text-white shadow-shiny-card'
                : 'bg-shiny-surface text-shiny-text hover:bg-shiny-border'
            }`}
          >
            Moderate (7%)
          </button>
          <button
            onClick={() => inputs.setKey('annualReturn', 9)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              i.annualReturn === 9
                ? 'bg-shiny-success text-white shadow-shiny-card'
                : 'bg-shiny-surface text-shiny-text hover:bg-shiny-border'
            }`}
          >
            Aggressive (9%)
          </button>
        </div>
      </FintechCard>

      {/* Contribution Stop Year */}
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

      {/* Dynamic Gap Panel - Replicating R lines 1447-1524 */}
      {/* Only show if user has entered data */}
      {i.currentPortfolio > 0 && i.monthlyContrib > 0 && res.gap < 0 && (
        <div className="rounded-2xl shadow-shiny-card bg-shiny-warning text-white overflow-hidden">
          <div className="p-8">
            <h2 className="text-3xl font-bold mb-4">Action Required</h2>
            <p className="text-xl leading-relaxed mb-4">
              You are projected to fall short by{' '}
              <span className="font-bold text-2xl">{formatCurrency(Math.abs(res.gap))}</span>.
            </p>
            <div className="bg-white/20 rounded-lg p-6 mt-4">
              <div className="text-lg mb-2 opacity-90">
                To close the gap, you need to invest an additional:
              </div>
              <div className="text-4xl font-bold mb-2">
                {formatCurrency(res.monthlyShortfall)}
              </div>
              <div className="text-lg opacity-90">per month</div>
            </div>
          </div>
        </div>
      )}

      {/* On Track Panel */}
      {i.currentPortfolio > 0 && i.monthlyContrib > 0 && res.gap >= 0 && (
        <div className="rounded-2xl shadow-shiny-card bg-shiny-success text-white overflow-hidden">
          <div className="p-8">
            <h2 className="text-3xl font-bold mb-4">On Track!</h2>
            <p className="text-xl leading-relaxed">
              You're projected to meet your retirement goal with a surplus of{' '}
              <span className="font-bold text-2xl">{formatCurrency(res.gap)}</span>.
            </p>
          </div>
        </div>
      )}

      {/* Projection Chart - Replicating R line 1527 */}
      <FintechCard variant="info">
        <h3 className="text-lg font-semibold text-shiny-text mb-4">Portfolio Projection</h3>
        <p className="text-sm text-shiny-muted mb-6">
          Your projected portfolio growth over time vs. your retirement target. The dashed vertical line marks your retirement year.
        </p>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={projectionData}>
              <defs>
                <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <filter id="glow-blue-portfolio">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="year"
                tick={{ fill: '#94a3b8' }}
                tickLine={{ stroke: '#334155' }}
              />
              <YAxis
                tick={{ fill: '#94a3b8' }}
                tickLine={{ stroke: '#334155' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<ProjectionTooltip />} />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />

              {/* Red shading where projected portfolio < required portfolio */}
              {shortfallRanges.map((range, idx) => (
                <ReferenceArea
                  key={`shortfall-${idx}`}
                  x1={range.x1}
                  x2={range.x2}
                  fill="#ef4444"
                  fillOpacity={0.08}
                  stroke="none"
                />
              ))}

              {/* Area/Line 1: Portfolio (Electric Blue) */}
              <Area
                type="monotone"
                dataKey="portfolio"
                stroke="#3b82f6"
                strokeWidth={3}
                fillOpacity={0.3}
                fill="url(#colorPortfolio)"
                filter="url(#glow-blue-portfolio)"
                name="Portfolio"
              />
              {/* Line 2: Target (Dashed Red) */}
              <Line
                type="monotone"
                dataKey="target"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="10 5"
                dot={false}
                name="Target Portfolio"
              />

              {/* Vertical reference line at retirement year */}
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
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </FintechCard>

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
