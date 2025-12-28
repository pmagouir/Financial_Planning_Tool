import { ShinyCard } from './ui/ShinyCard';

export function Welcome() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-shiny-text">
          Welcome to Your Retirement Planning Navigator
        </h1>
        <p className="text-xl text-shiny-muted max-w-3xl mx-auto">
          A step-by-step guide to understanding your financial future and building the retirement you want
        </p>
      </div>

      {/* Process Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Step 1 Card */}
        <ShinyCard variant="info">
          <div className="p-6">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-shiny-text mb-2">Step 1: Current Reality</h3>
            <p className="text-sm text-shiny-muted">
              Document your current financial situation. Track your monthly take-home pay, fixed costs, investments, and spending. See exactly where your money goes and how it's allocated.
            </p>
          </div>
        </ShinyCard>

        {/* Step 2 Card */}
        <ShinyCard variant="primary">
          <div className="p-6">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold text-shiny-text mb-2">Step 2: Retirement Design</h3>
            <p className="text-sm text-shiny-muted">
              Design your ideal retirement lifestyle. Our smart defaults help you estimate future spending based on your current reality. Adjust each category to match your vision.
            </p>
          </div>
        </ShinyCard>

        {/* Step 3 Card */}
        <ShinyCard variant="success">
          <div className="p-6">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-lg font-semibold text-shiny-text mb-2">Step 3: Your Number</h3>
            <p className="text-sm text-shiny-muted">
              Calculate your retirement target using the Trinity Study's 4% rule. See how inflation impacts your future needs and understand exactly how much you'll need to retire comfortably.
            </p>
          </div>
        </ShinyCard>

        {/* Step 4 Card */}
        <ShinyCard variant="warning">
          <div className="p-6">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-lg font-semibold text-shiny-text mb-2">Step 4: Investment Path</h3>
            <p className="text-sm text-shiny-muted">
              See if you're on track to reach your retirement number. Get personalized recommendations if adjustments are needed. Visualize your portfolio growth over time.
            </p>
          </div>
        </ShinyCard>
      </div>

      {/* Getting Started */}
      <ShinyCard variant="info">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-shiny-text mb-4">How It Works</h3>
          <div className="space-y-3 text-shiny-muted">
            <p>
              <strong className="text-shiny-text">Step 1: Current Reality</strong> — Start by entering your current financial situation. 
              This includes your monthly take-home pay, all your expenses (fixed costs and guilt-free spending), and current investments. 
              You'll see a real-time breakdown of how your money is allocated.
            </p>
            <p>
              <strong className="text-shiny-text">Step 2: Retirement Design</strong> — Design your ideal retirement lifestyle. 
              Our smart defaults will help you estimate future spending based on your current reality, but you can adjust everything to match your vision. 
              Compare your current spending to your planned retirement spending.
            </p>
            <p>
              <strong className="text-shiny-text">Step 3: Your Number</strong> — See your retirement target. 
              We'll calculate how much you need based on the Trinity Study's proven 4% withdrawal rule, adjusted for your retirement duration. 
              Understand how inflation will impact your future needs.
            </p>
            <p>
              <strong className="text-shiny-text">Step 4: Investment Path</strong> — Check if you're on track. 
              We'll show you exactly where you stand based on your current portfolio, monthly contributions, and expected returns. 
              Get personalized recommendations if adjustments are needed to close the gap.
            </p>
          </div>
        </div>
      </ShinyCard>

      {/* Key Concepts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ShinyCard variant="success">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-shiny-text mb-3">The 4% Rule</h3>
            <p className="text-sm text-shiny-muted">
              Based on the Trinity Study, you can safely withdraw 4% of your portfolio annually in retirement (adjusted for your retirement duration). 
              This rule helps determine how much you need to save to support your desired lifestyle.
            </p>
          </div>
        </ShinyCard>

        <ShinyCard variant="primary">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-shiny-text mb-3">Smart Defaults</h3>
            <p className="text-sm text-shiny-muted">
              We automatically calculate retirement spending estimates based on your current reality. 
              For example, transportation costs typically decrease in retirement, while healthcare costs increase. 
              You can adjust any category to match your personal vision.
            </p>
          </div>
        </ShinyCard>
      </div>
    </div>
  );
}
