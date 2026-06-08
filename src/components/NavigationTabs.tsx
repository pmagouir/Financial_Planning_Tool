import { useState, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { clsx } from 'clsx';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Step1_CurrentReality } from './Step1_CurrentReality';
import { Step2_RetirementDesign } from './Step2_RetirementDesign';
import { Step3_YourNumber } from './calculator/Step3_YourNumber';
import { Step4_InvestmentPath } from './Step4_InvestmentPath';
import { Step5_Summary } from './Step5_Summary';
import { CompoundCalculator } from './bonus/CompoundCalculator';
import { Resources } from './bonus/Resources';
import { Welcome } from './Welcome';
import { inputs } from '../stores/financialPlan';

type TabId = 'welcome' | 'step1' | 'step2' | 'step3' | 'step4' | 'summary' | 'compound' | 'resources' | 'divider';

interface Tab {
  id: TabId;
  label: string;
  shortLabel: string; // for bottom nav
  icon: string;
  isDivider?: boolean;
  isBonus?: boolean;
}

const tabs: Tab[] = [
  { id: 'welcome', label: 'Welcome', shortLabel: 'Home', icon: '🏠' },
  { id: 'step1', label: 'Step 1: Current Reality', shortLabel: 'Reality', icon: '📊' },
  { id: 'step2', label: 'Step 2: Retirement Design', shortLabel: 'Design', icon: '🎯' },
  { id: 'step3', label: 'Step 3: Your Number', shortLabel: 'Number', icon: '💰' },
  { id: 'step4', label: 'Step 4: Investment Path', shortLabel: 'Invest', icon: '📈' },
  { id: 'summary', label: 'Summary', shortLabel: 'Summary', icon: '📋' },
  { id: 'divider', label: '', shortLabel: '', icon: '', isDivider: true },
  { id: 'compound', label: 'Bonus: Compound Calc', shortLabel: 'Compound', icon: '🧮', isBonus: true },
  { id: 'resources', label: 'Bonus: Resources', shortLabel: 'Resources', icon: '📚', isBonus: true },
];

// Core nav tabs shown in the bottom mobile nav (no divider/bonus)
const mobileNavTabs = tabs.filter((t) => !t.isDivider && !t.isBonus);

// Navigation order for "Next Step" flow
const navOrder: TabId[] = ['welcome', 'step1', 'step2', 'step3', 'step4', 'summary'];

const getPageTitle = (tabId: TabId): string => {
  const tab = tabs.find((t) => t.id === tabId);
  if (!tab || tab.isDivider) return 'Retirement Planning Navigator';
  return tab.label;
};

export function NavigationTabs() {
  const [activeTab, setActiveTab] = useState<TabId>('welcome');
  const i = useStore(inputs);
  const reduceMotion = useReducedMotion();

  // Roving-tabindex focus targets per surface (desktop sidebar / mobile bar).
  const desktopTabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const mobileTabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const desktopTabOrder = tabs.filter((t) => !t.isDivider).map((t) => t.id);
  const mobileTabOrder = mobileNavTabs.map((t) => t.id);

  const handleNext = () => {
    const currentIndex = navOrder.indexOf(activeTab);
    if (currentIndex !== -1 && currentIndex < navOrder.length - 1) {
      setActiveTab(navOrder[currentIndex + 1]);
    }
  };

  // WAI-ARIA APG Tabs keyboard model: arrows move + activate (automatic activation),
  // Home/End jump to ends, and focus follows the selection (focus management).
  const handleTablistKeyDown = (
    e: React.KeyboardEvent,
    order: TabId[],
    orientation: 'vertical' | 'horizontal',
    refs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>,
  ) => {
    const nextKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';
    const prevKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';
    const idx = order.indexOf(activeTab);
    let next: number | null = null;
    if (e.key === nextKey) next = (idx + 1) % order.length;
    else if (e.key === prevKey) next = (idx - 1 + order.length) % order.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = order.length - 1;
    if (next === null) return;
    e.preventDefault();
    const nextId = order[next];
    setActiveTab(nextId);
    refs.current[nextId]?.focus();
  };

  const step1Complete = i.takeHomePay > 0;
  const step2Complete = i.hasModifiedRetirement === true || i.retHousing > 0;
  const step3Complete = i.retYear > 0 && i.retDuration > 0;
  const step4Complete = i.currentPortfolio > 0 || i.monthlyContrib > 0;

  const getCompletionDot = (tabId: TabId): boolean => {
    switch (tabId) {
      case 'step1': return step1Complete;
      case 'step2': return step2Complete;
      case 'step3': return step3Complete;
      case 'step4': return step4Complete;
      default: return false;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'welcome': return <Welcome onStart={handleNext} />;
      case 'step1': return <Step1_CurrentReality onNext={handleNext} />;
      case 'step2': return <Step2_RetirementDesign onNext={handleNext} />;
      case 'step3': return <Step3_YourNumber onNext={handleNext} />;
      case 'step4': return <Step4_InvestmentPath onNext={handleNext} />;
      case 'summary': return <Step5_Summary onEditPlan={() => setActiveTab('step1')} />;
      case 'compound': return <CompoundCalculator />;
      case 'resources': return <Resources />;
      default: return <Welcome />;
    }
  };

  return (
    <>
      {/* ── Responsive layout ──────────────────────────────────────────────── */}
      <style>{`
        /* Mobile: hide sidebar, show bottom nav, add bottom padding */
        @media (max-width: 639px) {
          .nav-sidebar { display: none !important; }
          .mobile-bottom-nav { display: flex !important; }
          .main-content-area { padding-bottom: 72px !important; }
          .main-top-header .px-8 { padding-left: 16px !important; padding-right: 16px !important; }
          .main-top-header h1 { font-size: 1.25rem !important; }
        }
        /* Desktop: show sidebar, hide bottom nav */
        @media (min-width: 640px) {
          .nav-sidebar { display: flex !important; }
          .mobile-bottom-nav { display: none !important; }
        }
      `}</style>

      <div className="flex min-h-screen">

        {/* ── Left Sidebar (desktop) ────────────────────────────────────────── */}
        <aside className="nav-sidebar w-64 flex-shrink-0 border-r border-white/5 bg-background-paper/30 backdrop-blur-md print:hidden">
          <nav aria-label="Primary" className="sticky top-0 h-screen overflow-y-auto p-6">
            <div className="mb-8 pb-6 border-b border-white/5">
              <h2 className="text-lg font-semibold text-text-primary tracking-tight">
                Retirement Navigator
              </h2>
            </div>

            <div
              role="tablist"
              aria-label="Planning steps"
              aria-orientation="vertical"
              className="space-y-1"
            >
              {tabs.map((tab) => {
                if (tab.isDivider) {
                  return <div key="divider" role="presentation" className="my-4 border-t border-white/5" />;
                }

                const isActive = activeTab === tab.id;
                const isComplete = getCompletionDot(tab.id);

                return (
                  <button
                    key={tab.id}
                    role="tab"
                    id={`tab-d-${tab.id}`}
                    aria-selected={isActive}
                    aria-controls="tabpanel-main"
                    tabIndex={isActive ? 0 : -1}
                    ref={(el) => { desktopTabRefs.current[tab.id] = el; }}
                    onClick={() => setActiveTab(tab.id as TabId)}
                    onKeyDown={(e) => handleTablistKeyDown(e, desktopTabOrder, 'vertical', desktopTabRefs)}
                    className={clsx(
                      'w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 relative group',
                      isActive
                        ? 'bg-accent-primary/20 text-accent-primary'
                        : 'text-text-secondary hover:text-accent-primary'
                    )}
                  >
                    <span className="text-lg flex-shrink-0" aria-hidden="true">{tab.icon}</span>
                    <span className="text-left flex-1">{tab.label}</span>
                    {isComplete && (
                      <span
                        role="img"
                        aria-label="Complete"
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: '#10b981', boxShadow: '0 0 6px rgba(16,185,129,0.6)' }}
                      />
                    )}
                    {!isActive && (
                      <span aria-hidden="true" className="absolute inset-0 rounded-lg bg-accent-primary/0 group-hover:bg-accent-primary/5 transition-all duration-200" />
                    )}
                    {isActive && (
                      <span aria-hidden="true" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent-primary rounded-r-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        </aside>

        {/* ── Main Content ──────────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0">
          <header className="main-top-header sticky top-0 z-10 border-b border-white/5 bg-background/50 backdrop-blur-sm print:hidden">
            <div className="px-8 py-4 max-w-6xl mx-auto">
              <h1 className="text-3xl font-light text-white tracking-tight">
                {getPageTitle(activeTab)}
              </h1>
            </div>
          </header>

          <div className="main-content-area relative min-h-[calc(100vh-72px)] p-8">
            <div
              id="tabpanel-main"
              role="tabpanel"
              aria-labelledby={`tab-d-${activeTab}`}
              tabIndex={0}
              className="max-w-6xl mx-auto focus:outline-none"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={reduceMotion ? false : { opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduceMotion ? { opacity: 1 } : { opacity: 0, x: -20 }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.3, ease: 'easeInOut' }}
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>

      {/* ── Mobile Bottom Nav (≤639px) ─────────────────────────────────────── */}
      <div
        className="mobile-bottom-nav print:hidden"
        role="tablist"
        aria-label="Planning steps"
        aria-orientation="horizontal"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          height: '64px',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(15,23,42,0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'stretch',
        }}
      >
        {mobileNavTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isComplete = getCompletionDot(tab.id);

          return (
            <button
              key={tab.id}
              role="tab"
              id={`tab-m-${tab.id}`}
              aria-selected={isActive}
              aria-controls="tabpanel-main"
              aria-label={tab.label}
              tabIndex={isActive ? 0 : -1}
              ref={(el) => { mobileTabRefs.current[tab.id] = el; }}
              onClick={() => setActiveTab(tab.id as TabId)}
              onKeyDown={(e) => handleTablistKeyDown(e, mobileTabOrder, 'horizontal', mobileTabRefs)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0 2px',
                position: 'relative',
                transition: 'background 0.15s',
              }}
            >
              {/* Active indicator — top bar */}
              {isActive && (
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '20%',
                    right: '20%',
                    height: '2px',
                    borderRadius: '0 0 2px 2px',
                    background: '#3b82f6',
                    boxShadow: '0 0 8px rgba(59,130,246,0.6)',
                  }}
                />
              )}
              {/* Completion dot */}
              {isComplete && !isActive && (
                <div
                  role="img"
                  aria-label="Complete"
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: 'calc(50% - 14px)',
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    background: '#10b981',
                    boxShadow: '0 0 4px rgba(16,185,129,0.7)',
                  }}
                />
              )}
              <span aria-hidden="true" style={{ fontSize: '1.1rem', lineHeight: 1 }}>{tab.icon}</span>
              <span
                aria-hidden="true"
                style={{
                  fontSize: '0.6rem',
                  letterSpacing: '0.03em',
                  color: isActive ? '#60a5fa' : '#94a3b8',
                  fontWeight: isActive ? 600 : 400,
                  lineHeight: 1,
                }}
              >
                {tab.shortLabel}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
