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

type TabId = 'welcome' | 'step1' | 'step2' | 'step3' | 'step4' | 'summary' | 'compound' | 'resources' | 'divider';

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

// Get page title for header
const getPageTitle = (tabId: TabId): string => {
  const tab = tabs.find(t => t.id === tabId);
  if (!tab || tab.isDivider) return 'Retirement Planning Navigator';
  return tab.label;
};

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
    <div className="flex min-h-screen">
      {/* Left Sidebar Navigation */}
      <aside className="w-64 flex-shrink-0 border-r border-white/5 bg-background-paper/30 backdrop-blur-md print:hidden">
        <nav className="sticky top-0 h-screen overflow-y-auto p-6 space-y-1">
          {/* Logo/Brand */}
          <div className="mb-8 pb-6 border-b border-white/5">
            <h2 className="text-lg font-semibold text-text-primary tracking-tight">
              Retirement Navigator
            </h2>
          </div>

          {tabs.map((tab) => {
            if (tab.isDivider) {
              return (
                <div key="divider" className="my-4 border-t border-white/5" />
              );
            }
            
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id !== 'divider' && !tab.isDivider) {
                    setActiveTab(tab.id as TabId);
                  }
                }}
                className={clsx(
                  'w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 relative group',
                  isActive
                    ? 'bg-accent-primary/20 text-accent-primary'
                    : 'text-text-secondary hover:text-accent-primary'
                )}
              >
                <span className="text-lg flex-shrink-0">{tab.icon}</span>
                <span className="text-left flex-1">{tab.label}</span>
                {/* Glow effect on hover */}
                {!isActive && (
                  <span className="absolute inset-0 rounded-lg bg-accent-primary/0 group-hover:bg-accent-primary/5 transition-all duration-200" />
                )}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent-primary rounded-r-full" />
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        {/* Top Header with Page Title */}
        <header className="sticky top-0 z-10 border-b border-white/5 bg-background/50 backdrop-blur-sm print:hidden">
          <div className="px-8 py-6">
            <h1 className="text-3xl font-light text-white tracking-tight">
              {getPageTitle(activeTab)}
            </h1>
          </div>
        </header>

        {/* Content Area */}
        <div className="relative min-h-[calc(100vh-120px)] p-8">
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
