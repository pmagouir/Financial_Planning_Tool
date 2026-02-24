import { useStore } from '@nanostores/react';
import { inputs, results } from '../stores/financialPlan';
import { FintechCard } from './ui/FintechCard';
import { RangeSlider } from './ui/RangeSlider';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Step2Props {
  onNext?: () => void;
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

export function Step2_RetirementDesign({ onNext }: Step2Props) {
  const i = useStore(inputs);
  const res = useStore(results);

  // ── Current values (from Step 1) ───────────────────────────────────────────
  const currentValues: Record<string, number> = {
    housing: i.rent + i.propTax + i.utilities + i.internet,
    transport: i.carPayment + i.carIns + i.gas + i.carMaint,
    groceries: i.groceries,
    health: i.healthIns,
    child: i.childcare,
    ins: i.otherIns,
    debt: i.debtMin,
    ent: i.ent + i.travel + i.hobbies,
    dining: i.dining,
    personal: i.personal + i.clothes + i.gifts + i.dev,
    misc: i.tech + i.homeImp + i.misc,
  };

  const retirementValues: Record<string, number> = {
    housing: i.retHousing,
    transport: i.retTransport,
    groceries: i.retGroceries,
    health: i.retHealth,
    child: i.retChild,
    ins: i.retIns,
    debt: i.retDebt,
    ent: i.retEnt,
    dining: i.retDining,
    personal: i.retPersonal,
    misc: i.retMisc,
  };

  // Handle slider change
  const handleSliderChange = (category: string, value: number) => {
    const keyMap: Record<string, string> = {
      housing: 'retHousing', transport: 'retTransport', groceries: 'retGroceries',
      health: 'retHealth', child: 'retChild', ins: 'retIns', debt: 'retDebt',
      ent: 'retEnt', dining: 'retDining', personal: 'retPersonal', misc: 'retMisc',
    };
    inputs.setKey(keyMap[category] as any, value);
    inputs.setKey('hasModifiedRetirement', true);
  };

  const getMaxValue = (currentValue: number): number =>
    Math.max(currentValue * 2, 10000);

  const categories = [
    { key: 'housing', label: 'Housing', isFixed: true },
    { key: 'transport', label: 'Transport', isFixed: true },
    { key: 'groceries', label: 'Groceries', isFixed: true },
    { key: 'health', label: 'Healthcare', isFixed: true },
    { key: 'child', label: 'Childcare', isFixed: true },
    { key: 'ins', label: 'Insurance', isFixed: true },
    { key: 'debt', label: 'Debt Payments', isFixed: true },
    { key: 'ent', label: 'Entertainment', isFixed: false },
    { key: 'dining', label: 'Dining Out', isFixed: false },
    { key: 'personal', label: 'Personal', isFixed: false },
    { key: 'misc', label: 'Misc', isFixed: false },
  ];

  // ── Per-category chart data (only rows with any value) ─────────────────────
  const chartData = categories
    .map((cat) => ({
      name: cat.label,
      Today: currentValues[cat.key],
      Retirement: retirementValues[cat.key],
    }))
    .filter((d) => d.Today > 0 || d.Retirement > 0);

  const retMonthlySpend =
    i.retHousing + i.retTransport + i.retGroceries + i.retHealth +
    i.retChild + i.retIns + i.retDebt + i.retEnt + i.retDining +
    i.retPersonal + i.retMisc;

  const delta = retMonthlySpend - res.totalAllocated;
  const deltaPositive = delta >= 0;

  const hasCurrent = res.totalAllocated > 0;

  return (
    <div className="space-y-8">

      {/* ── Intro ──────────────────────────────────────────────────────────── */}
      <FintechCard variant="info">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-shiny-text">Design Your Retirement Lifestyle</h3>
          <p className="text-sm text-shiny-muted leading-relaxed">
            Spending shifts in retirement. Some costs drop (no commute, no childcare). Others rise
            (healthcare, travel, hobbies you finally have time for). Sliders start from your current
            spending — adjust each to reflect your vision.
          </p>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-text-secondary space-y-1">
            <p className="font-medium text-text-primary mb-2">Smart defaults applied:</p>
            <p>• Healthcare: +30% (medical costs rise with age)</p>
            <p>• Transportation: −50% (no daily commute)</p>
            <p>• Entertainment: +20% (more time for the things you love)</p>
            <p>• Debt: −80% (most debt paid off by retirement)</p>
          </div>
        </div>
      </FintechCard>

      {/* ── Live Category Comparison Chart ─────────────────────────────────── */}
      <FintechCard variant="primary">
        <h3 className="text-lg font-semibold text-shiny-text mb-1">Now vs. Retirement — by Category</h3>
        <p className="text-sm text-shiny-muted mb-5">
          Updates live as you adjust sliders below. Blue = today, violet = retirement.
        </p>

        {hasCurrent && chartData.length > 0 ? (
          <>
            {/* Chart */}
            <div style={{ height: `${Math.max(220, chartData.length * 48)}px` }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                  barCategoryGap="28%"
                  barGap={3}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis
                    type="number"
                    tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: '#cbd5e1', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={82}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [formatCurrency(value), name]}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={9}
                    wrapperStyle={{ fontSize: '11px', color: '#94a3b8', paddingTop: '8px' }}
                  />
                  <Bar dataKey="Today" fill="#3b82f6" radius={[0, 3, 3, 0]} maxBarSize={13} />
                  <Bar dataKey="Retirement" fill="#8b5cf6" radius={[0, 3, 3, 0]} maxBarSize={13} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Summary strip below chart */}
            <div
              style={{
                display: 'flex',
                alignItems: 'stretch',
                marginTop: '20px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.07)',
                overflow: 'hidden',
              }}
            >
              {[
                { label: 'Current Monthly', value: formatCurrency(res.totalAllocated), color: '#3b82f6' },
                { label: 'Retirement Monthly', value: formatCurrency(retMonthlySpend), color: '#8b5cf6' },
                {
                  label: deltaPositive ? 'Increase' : 'Decrease',
                  value: `${deltaPositive ? '+' : ''}${formatCurrency(delta)}`,
                  color: deltaPositive ? '#f59e0b' : '#10b981',
                },
              ].map((stat, idx) => (
                <div
                  key={stat.label}
                  style={{
                    flex: 1,
                    padding: '14px 16px',
                    textAlign: 'center',
                    borderRight: idx < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                    background: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <div style={{ fontSize: '0.65rem', color: '#475569', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '5px' }}>
                    {stat.label}
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: stat.color, fontVariantNumeric: 'tabular-nums' }}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div
            style={{
              height: '120px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
              fontSize: '0.875rem',
              borderRadius: '8px',
              border: '1px dashed rgba(255,255,255,0.07)',
            }}
          >
            Complete Step 1 to see a live spending comparison here
          </div>
        )}
      </FintechCard>

      {/* ── Fixed Costs Sliders ─────────────────────────────────────────────── */}
      <FintechCard variant="info">
        <h3 className="text-lg font-semibold text-shiny-text mb-2">Fixed Costs in Retirement</h3>
        <p className="text-sm text-shiny-muted mb-6">
          Essentials: housing, transport, food, healthcare, insurance, debt.
        </p>
        <div className="space-y-6">
          {categories
            .filter((cat) => cat.isFixed)
            .map((category) => {
              const current = currentValues[category.key];
              const retirement = retirementValues[category.key];
              const pct = current > 0 ? Math.round((retirement / current) * 100) : null;
              const pctLabel =
                pct === null ? null
                : pct > 100 ? `+${pct - 100}% vs today`
                : pct < 100 ? `−${100 - pct}% vs today`
                : 'same as today';
              const pctColor =
                pct === null ? '#475569'
                : pct > 100 ? '#f59e0b'
                : pct < 100 ? '#10b981'
                : '#64748b';

              return (
                <div key={category.key}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium text-shiny-text">{category.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-shiny-muted text-xs">Today: {formatCurrency(current)}</span>
                      <span className="font-bold text-shiny-text">{formatCurrency(retirement)}</span>
                      {pctLabel && (
                        <span style={{ fontSize: '0.7rem', color: pctColor, fontWeight: 600 }}>
                          {pctLabel}
                        </span>
                      )}
                    </div>
                  </div>
                  <RangeSlider
                    value={retirement}
                    onChange={(value) => handleSliderChange(category.key, value)}
                    min={0}
                    max={getMaxValue(current || 1000)}
                    step={50}
                    formatValue={formatCurrency}
                  />
                </div>
              );
            })}
        </div>
      </FintechCard>

      {/* ── Discretionary Sliders ───────────────────────────────────────────── */}
      <FintechCard variant="primary">
        <h3 className="text-lg font-semibold text-shiny-text mb-2">Discretionary Spending in Retirement</h3>
        <p className="text-sm text-shiny-muted mb-6">
          Lifestyle spending: entertainment, dining, personal care, miscellaneous.
        </p>
        <div className="space-y-6">
          {categories
            .filter((cat) => !cat.isFixed)
            .map((category) => {
              const current = currentValues[category.key];
              const retirement = retirementValues[category.key];
              const pct = current > 0 ? Math.round((retirement / current) * 100) : null;
              const pctLabel =
                pct === null ? null
                : pct > 100 ? `+${pct - 100}% vs today`
                : pct < 100 ? `−${100 - pct}% vs today`
                : 'same as today';
              const pctColor =
                pct === null ? '#475569'
                : pct > 100 ? '#f59e0b'
                : pct < 100 ? '#10b981'
                : '#64748b';

              return (
                <div key={category.key}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium text-shiny-text">{category.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-shiny-muted text-xs">Today: {formatCurrency(current)}</span>
                      <span className="font-bold text-shiny-text">{formatCurrency(retirement)}</span>
                      {pctLabel && (
                        <span style={{ fontSize: '0.7rem', color: pctColor, fontWeight: 600 }}>
                          {pctLabel}
                        </span>
                      )}
                    </div>
                  </div>
                  <RangeSlider
                    value={retirement}
                    onChange={(value) => handleSliderChange(category.key, value)}
                    min={0}
                    max={getMaxValue(current || 1000)}
                    step={50}
                    formatValue={formatCurrency}
                  />
                </div>
              );
            })}
        </div>
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
