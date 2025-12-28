import { useState } from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Step1_CurrentReality } from './Step1_CurrentReality';
import { Step2_RetirementDesign } from './Step2_RetirementDesign';
import { Step3_YourNumber } from './calculator/Step3_YourNumber';
import { Step4_InvestmentPath } from './Step4_InvestmentPath';
import { Step5_Summary } from './Step5_Summary';
import { CompoundCalculator } from './bonus/CompoundCalculator';
import { Resources } from './bonus/Resources';
import { Welcome } from './Welcome';

type TabId = 'welcome' | 'step1' | 'step2' | 'step3' | 'step4' | 'summary' | 'compound' | 'resources';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
  isDivider?: boolean;
  isBonus?: boolean;
}

const tabs: Tab[] = [
  { id: 'welcome', label: 'Welcome', icon: '🏠' },
  { id: 'step1', label: 'Step 1: Current Reality', icon: '📊' },
  { id: 'step2', label: 'Step 2: Retirement Design', icon: '🎯' },
  { id: 'step3', label: 'Step 3: Your Number', icon: '💰' },
  { id: 'step4', label: 'Step 4: Investment Path', icon: '📈' },
  { id: 'summary', label: 'Summary', icon: '📋' },
  { id: 'divider', label: '', icon: '', isDivider: true },
  { id: 'compound', label: 'Bonus: Compound Calc', icon: '🧮', isBonus: true },
  { id: 'resources', label: 'Bonus: Resources', icon: '📚', isBonus: true },
];

export function NavigationTabs() {
  const [activeTab, setActiveTab] = useState<TabId>('welcome');

  const renderContent = () => {
    switch (activeTab) {
      case 'welcome':
        return <Welcome />;
      case 'step1':
        return <Step1_CurrentReality />;
      case 'step2':
        return <Step2_RetirementDesign />;
      case 'step3':
        return <Step3_YourNumber />;
      case 'step4':
        return <Step4_InvestmentPath />;
      case 'summary':
        return <Step5_Summary />;
      case 'compound':
        return <CompoundCalculator />;
      case 'resources':
        return <Resources />;
      default:
        return <Welcome />;
    }
  };

  return (
    <div className="flex w-full gap-8">
      {/* Sidebar Navigation */}
      <aside className="w-64 flex-shrink-0 print:hidden">
        <nav className="sticky top-8 space-y-1">
          {tabs.map((tab) => {
            if (tab.isDivider) {
              return (
                <div key="divider" className="my-4 border-t border-slate-200" />
              );
            }
            
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id !== 'divider') {
                    setActiveTab(tab.id as TabId);
                  }
                }}
                className={clsx(
                  'w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all',
                  activeTab === tab.id
                    ? 'bg-gradient-primary text-white shadow-shiny-card'
                    : tab.isBonus
                    ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <span className="text-lg flex-shrink-0">{tab.icon}</span>
                <span className="text-left">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

