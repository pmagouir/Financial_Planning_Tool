import { useStore } from '@nanostores/react';
import { inputs, results } from '../../stores/financialPlan';
import { FintechCard } from '../ui/FintechCard';
import { MetricCard } from '../ui/MetricCard';
import { MoneyInput } from '../ui/MoneyInput';
import { RangeSlider } from '../ui/RangeSlider';
import { useMemo } from 'react';

const CURRENT_YEAR = new Date().getFullYear();

export function Step3_YourNumber() {
  const i = useStore(inputs);
  const res = useStore(results);

  // Calculate monthly need today
  const monthlyNeedToday = useMemo(() => {
    return i.retHousing + i.retTransport + i.retGroceries + i.retHealth + 
           i.retChild + i.retIns + i.retDebt + i.retEnt + i.retDining + 
           i.retPersonal + i.retMisc;
  }, [i.retHousing, i.retTransport, i.retGroceries, i.retHealth, 
      i.retChild, i.retIns, i.retDebt, i.retEnt, i.retDining, 
      i.retPersonal, i.retMisc]);

  // Calculate monthly need in future dollars
  const monthlyNeedFuture = useMemo(() => {
    return monthlyNeedToday * res.inflationMult;
  }, [monthlyNeedToday, res.inflationMult]);


  // Get withdrawal rate explanation
  const withdrawalRateExplanation = useMemo(() => {
    if (i.retDuration >= 35) {
      return 'Extra conservative rate for retirements lasting 35+ years';
    }
    if (i.retDuration >= 25) {
      return 'Standard 4% rule for 25-35 year retirements (Trinity Study)';
    }
    if (i.retDuration >= 15) {
      return 'Aggressive rate for shorter 15-25 year retirements';
    }
    return 'Short duration rate for retirements under 15 years';
  }, [i.retDuration]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format percentage
  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  // Check if we have valid data
  const hasRetirementData = monthlyNeedToday > 0;

  return (
    <div className="space-y-8">
      {!hasRetirementData && (
        <FintechCard variant="info">
          <div className="p-6">
            <p className="text-shiny-text">
              Please complete Steps 1 and 2 first to see your retirement number calculations.
            </p>
          </div>
        </FintechCard>
      )}
      
      {hasRetirementData && (
        <>

      {/* Monthly Need Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetricCard variant="success">
          <div className="uppercase text-xs tracking-widest text-text-muted mb-2">Monthly Need (Today's Dollars)</div>
          <div className="text-4xl font-light tracking-tighter text-white mb-2">
            {formatCurrency(monthlyNeedToday)}
          </div>
          <div className="text-xs text-text-muted">
            Based on your retirement spending design
          </div>
        </MetricCard>

        <MetricCard variant="primary">
          <div className="uppercase text-xs tracking-widest text-text-muted mb-2">Monthly Need (Future Dollars)</div>
          <div className="text-4xl font-light tracking-tighter text-white mb-2">
            {formatCurrency(monthlyNeedFuture)}
          </div>
          <div className="text-xs text-text-muted">
            Adjusted for {res.yearsToRet} years of {formatPercent(i.inflation / 100)} inflation
          </div>
        </MetricCard>
      </div>

      {/* Inputs Section */}
      <FintechCard variant="info">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-shiny-text mb-6">Retirement Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
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
            </div>

            <div>
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
            </div>

            <div>
              <MoneyInput
                label="Annual Social Security"
                helperText="Expected annual Social Security benefits (in today's dollars)"
                value={i.socialSecurity}
                onChange={(value) => inputs.setKey('socialSecurity', value)}
              />
            </div>

            <div>
              <MoneyInput
                label="Annual Pension"
                helperText="Expected annual pension income (in today's dollars)"
                value={i.pension}
                onChange={(value) => inputs.setKey('pension', value)}
              />
            </div>

            <div>
              <MoneyInput
                label="Other Annual Income"
                helperText="Any other expected retirement income (in today's dollars)"
                value={i.otherIncome}
                onChange={(value) => inputs.setKey('otherIncome', value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Annual Inflation Rate
              </label>
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
          </div>
          
          {/* Withdrawal Rate Slider */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <RangeSlider
              label="Withdrawal Rate"
              value={i.withdrawalRate > 0 ? i.withdrawalRate : res.withdrawalRate * 100}
              onChange={(value) => inputs.setKey('withdrawalRate', value)}
              min={2.5}
              max={6.0}
              step={0.1}
              formatValue={(val) => `${val.toFixed(1)}%`}
              helperText={i.withdrawalRate > 0 
                ? "Custom withdrawal rate (overrides auto-calculation)"
                : withdrawalRateExplanation}
            />
            {i.withdrawalRate === 0 && (
              <p className="mt-2 text-xs text-text-muted italic">
                Currently using auto-calculated rate based on retirement duration. Adjust slider to set custom rate.
              </p>
            )}
          </div>
        </div>
      </FintechCard>

      {/* Required Portfolio Summary */}
      <FintechCard variant="success">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-shiny-text mb-2">Your Retirement Number</h3>
              <p className="text-sm text-shiny-muted">
                The total portfolio value you'll need at retirement
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(res.requiredPortfolio)}
              </div>
              <div className="text-xs text-shiny-muted mt-1">
                Based on {formatPercent(res.withdrawalRate)} withdrawal rate
              </div>
            </div>
          </div>
        </div>
      </FintechCard>
        </>
      )}
    </div>
  );
}
