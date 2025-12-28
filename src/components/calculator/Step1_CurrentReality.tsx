import { useStore } from '@nanostores/react';
import { currentProfile, calculations } from '../../stores/financialPlan';
import { Card } from '../ui/Card';
import { MoneyInput } from '../ui/MoneyInput';

export function Step1_CurrentReality() {
  const profile = useStore(currentProfile);
  const calc = useStore(calculations);

  // Determine ribbon styling based on spendRatio
  const getRibbonStyle = () => {
    if (calc.spendRatio > 100) {
      return {
        bg: 'bg-gradient-warning',
        text: 'OVERSPENDING',
        textColor: 'text-white',
      };
    } else if (calc.spendRatio < 90) {
      return {
        bg: 'bg-gradient-success',
        text: 'Great! Saving Aggressively',
        textColor: 'text-white',
      };
    } else {
      return {
        bg: 'bg-gradient-primary',
        text: 'Balanced Budget',
        textColor: 'text-white',
      };
    }
  };

  const ribbon = getRibbonStyle();

  return (
    <div className="space-y-8">
      {/* Sticky Ribbon Header */}
      <div className={`sticky top-0 z-10 ${ribbon.bg} ${ribbon.textColor} rounded-xl p-4 shadow-shiny-card`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{ribbon.text}</h2>
            <p className="text-sm opacity-90 mt-1">
              Spending {calc.spendRatio.toFixed(1)}% of take-home pay
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              ${(calc.categories?.totalSpent || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
            <div className="text-sm opacity-90">
              of ${profile.monthlyTakeHome.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Take-Home Input */}
      <Card variant="info">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Monthly Take-Home Pay</h3>
          <MoneyInput
            label="Monthly Take-Home Income"
            helperText="Your after-tax monthly income"
            value={profile.monthlyTakeHome}
            onChange={(value) => currentProfile.setKey('monthlyTakeHome', value)}
          />
        </div>
      </Card>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fixed Costs Column */}
        <Card variant="info">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Fixed Costs</h3>
            <p className="text-sm text-slate-600 mb-4">
              Essential expenses that stay relatively constant
            </p>
            <div className="space-y-4">
              <MoneyInput
                label="Housing"
                helperText="Rent or mortgage payment"
                value={profile.housing}
                onChange={(value) => currentProfile.setKey('housing', value)}
              />
              <MoneyInput
                label="Transport"
                helperText="Car payment, gas, insurance"
                value={profile.transport}
                onChange={(value) => currentProfile.setKey('transport', value)}
              />
              <MoneyInput
                label="Groceries"
                helperText="Monthly grocery budget"
                value={profile.groceries}
                onChange={(value) => currentProfile.setKey('groceries', value)}
              />
              <MoneyInput
                label="Healthcare"
                helperText="Insurance, prescriptions, medical"
                value={profile.healthcare}
                onChange={(value) => currentProfile.setKey('healthcare', value)}
              />
              <MoneyInput
                label="Childcare"
                helperText="Daycare, babysitting, etc."
                value={profile.childcare}
                onChange={(value) => currentProfile.setKey('childcare', value)}
              />
              <MoneyInput
                label="Insurance"
                helperText="Life, disability, other insurance"
                value={profile.insurance}
                onChange={(value) => currentProfile.setKey('insurance', value)}
              />
              <MoneyInput
                label="Debt Payments"
                helperText="Credit cards, student loans, etc."
                value={profile.debt}
                onChange={(value) => currentProfile.setKey('debt', value)}
              />
            </div>
          </div>
        </Card>

        {/* Investments Column */}
        <Card variant="success">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Investments</h3>
            <p className="text-sm text-slate-600 mb-4">
              Money you're setting aside for the future
            </p>
            <div className="space-y-4">
              <MoneyInput
                label="401(k)"
                helperText="Employer-sponsored retirement plan"
                value={profile.retirement401k}
                onChange={(value) => currentProfile.setKey('retirement401k', value)}
              />
              <MoneyInput
                label="IRA"
                helperText="Individual Retirement Account"
                value={profile.ira}
                onChange={(value) => currentProfile.setKey('ira', value)}
              />
              <MoneyInput
                label="Brokerage"
                helperText="Taxable investment accounts"
                value={profile.brokerage}
                onChange={(value) => currentProfile.setKey('brokerage', value)}
              />
              <MoneyInput
                label="Emergency Fund"
                helperText="Savings for emergencies"
                value={profile.emergency}
                onChange={(value) => currentProfile.setKey('emergency', value)}
              />
            </div>
          </div>
        </Card>

        {/* Guilt-Free Spending Column */}
        <Card variant="primary">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Guilt-Free Spending</h3>
            <p className="text-sm text-slate-600 mb-4">
              Money for fun, experiences, and things you love
            </p>
            <div className="space-y-4">
              <MoneyInput
                label="Entertainment"
                helperText="Movies, streaming, hobbies"
                value={profile.entertainment}
                onChange={(value) => currentProfile.setKey('entertainment', value)}
              />
              <MoneyInput
                label="Dining Out"
                helperText="Restaurants, takeout, coffee"
                value={profile.dining}
                onChange={(value) => currentProfile.setKey('dining', value)}
              />
              <MoneyInput
                label="Personal Care"
                helperText="Clothing, grooming, self-care"
                value={profile.personal}
                onChange={(value) => currentProfile.setKey('personal', value)}
              />
              <MoneyInput
                label="Miscellaneous"
                helperText="Other discretionary spending"
                value={profile.misc}
                onChange={(value) => currentProfile.setKey('misc', value)}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
