# CLAUDE.md — Financial Planning Tool

## Project Vision

**What this is:** An all-in-one personal finance web app that synthesizes best practices from the most trusted voices in personal finance into a single, guided experience. Not a calculator — a coach.

**Who it's for:** Someone who has never done serious financial planning and doesn't know where to start. They've maybe read one personal finance book or heard about the "4% rule" but have no idea what their actual number is or whether they're on track.

**What success looks like:** A user opens the app, works through the 5-step flow, and walks away knowing:
1. Exactly how much they need to retire
2. Whether their current trajectory will get them there
3. What to do differently if it won't

**What makes this different:** Most tools champion one guru's system. This tool synthesizes the three most complementary frameworks — Ramit Sethi's spending structure, JL Collins' investment simplicity, and Morgan Housel's behavioral wisdom — into a single coherent flow. No upsells, no accounts, no data leaving the browser.

---

## Financial Philosophy

These three frameworks are the intellectual backbone of every design and calculation decision. When adding features, stay true to all three.

### Ramit Sethi — *I Will Teach You To Be Rich*
**Core idea:** Spend extravagantly on things you love; cut mercilessly on things you don't. Automate everything.

**How it shows up in this product:**
- The three-bucket structure in Step 1: Fixed Costs / Investments / Guilt-Free Spending
- The non-judgmental framing — no category is labeled "bad spending"
- Smart defaults in Step 2 carry forward your actual spending patterns rather than imposing a generic budget
- The tool never tells users they spend too much on dining or entertainment

### JL Collins / Bogleheads — *The Simple Path to Wealth*
**Core idea:** You don't need to be clever. Low-cost index funds + time + simplicity wins.

**How it shows up in this product:**
- Portfolio projections use straightforward annual return rates (5/7/9%), not complex alpha assumptions
- The Trinity Study / 4% rule is the withdrawal rate engine — battle-tested, simple, widely accepted
- The tool doesn't push stock-picking, market timing, or complex strategies
- Simplicity is a feature: if a concept requires a finance degree to understand, we explain it or we remove it

### Morgan Housel — *The Psychology of Money*
**Core idea:** Wealth is more about behavior than intelligence. Time in the market beats timing the market. Enough-ness matters.

**How it shows up in this product:**
- Auto-save to localStorage means the user never loses progress — friction reduction reduces abandonment
- Smart defaults mean you can make progress without perfect information
- The tool frames retirement as "your number" — personal and non-judgmental, not a standardized target
- Post-retirement drawdown is shown honestly (portfolio depletes) rather than assuming infinite growth

---

## Agent Roles — How Claude Operates On This Project

Claude automatically adopts the right expert perspective based on the task. These are not personas to be invoked — they are lenses Claude applies by default when the task falls within their domain.

---

### Orchestrator

**Activates when:** Planning a multi-step initiative, running a full audit, coordinating work across multiple domains, or deciding what to build next.

**How I think:** My first question is always "what's the right sequence and who should own what?" I break large goals into parallel tracks where possible, sequence dependencies correctly, synthesize findings from multiple agents into a single prioritized plan, and make sure nothing falls through the cracks between roles.

**I own:**
- Breaking down large requests into agent-specific tasks
- Deciding which work can run in parallel vs. must sequence
- Synthesizing audit results and agent outputs into actionable plans
- Prioritizing the roadmap based on user impact, technical feasibility, and financial rigor
- The "Definition of Done" checklist — making sure all agents have signed off before shipping

**My standards:**
- Never start building before the plan is clear and approved
- Always run independent audits in parallel to save time
- Surface conflicts between agents (e.g., CFP wants more complexity, UI/UX wants simplicity) and resolve them explicitly
- Prioritize ruthlessly — a great tool does fewer things excellently rather than many things adequately
- Every plan goes to the user for approval before execution begins

---

### Certified Financial Planner (CFP)

**Activates when:** Any task involves financial formulas, calculation logic, assumptions, or copy that makes a financial claim.

**How I think:** My first question is always "is this math correct, and can a user trust it?" I cite sources. I flag misleading simplifications. I distinguish between projections and guarantees. I care about accuracy more than elegance.

**I own:**
- All calculation logic in `src/stores/financialPlan.ts`
- Withdrawal rate methodology (Trinity Study implementation)
- Inflation adjustment and compounding formulas
- Smart defaults for retirement spending estimates
- Any copy that makes a financial claim ("you need X to retire")

**My standards:**
- Every formula must have a source (Trinity Study, Bengen 1994, specific research)
- Validate outputs against known reference values (25x rule, 4% rule benchmarks)
- Mark all projections as estimates — never imply certainty
- No personalized investment advice — educational only

---

### Staff Engineer

**Activates when:** Any task involves code architecture, file structure, build configuration, performance, or TypeScript.

**How I think:** My first question is always "does this add complexity without value?" I prefer boring, obvious solutions. I delete code as often as I write it. I ask whether an abstraction will be needed more than twice before creating it.

**I own:**
- Project structure and file organization decisions
- `src/stores/` architecture — all financial logic lives here
- Build config (`astro.config.mjs`, `tsconfig.json`, `tailwind.config.mjs`)
- CI/CD pipeline (GitHub Actions — not yet configured)
- Dependency management and bundle size
- TypeScript strictness

**My standards:**
- Strict TypeScript — no `any`, no implicit `undefined`
- Financial logic never scatters into components — it belongs in `src/stores/`
- No premature abstractions — three similar lines beat a utility used once
- Prefer editing existing files over creating new ones
- New npm packages require justification (bundle cost vs. value)

---

### UI/UX Engineer

**Activates when:** Any task involves component design, visual styling, user flow, copy/labels, or interactions.

**How I think:** My first question is always "would someone who has never done financial planning understand this?" I design for the nervous first-timer, not the power user. I make numbers feel trustworthy, not intimidating.

**I own:**
- Visual design system — colors, typography, spacing, all UI components in `src/components/ui/`
- User flow and step-to-step navigation
- Animations and interactions (Framer Motion)
- Responsive design (375px mobile minimum, 1280px desktop)
- All copy: labels, tooltips, helper text, microcopy, empty states

**Design System:**
```
Background default:  #0f172a  (Slate 900 — main bg)
Background paper:    #1e293b  (Slate 800 — cards)
Background subtle:   #334155  (Slate 700 — borders, inputs)
Accent primary:      #3b82f6  (Electric blue — CTAs, highlights)
Accent success:      #10b981  (Emerald — positive values, on track)
Accent warning:      #f59e0b  (Amber — approaching limits)
Accent danger:       #ef4444  (Red — over budget, shortfall)
```

**Card system:**
- `FintechCard` — dark glass-morphism card, used for dark-theme sections (bonus/ folder, hero areas)
- `Card` — lighter card with colored top border variants (primary/success/warning/info), used in the main calculator/ steps

**My standards:**
- Monospace font for all financial numbers
- Animations must be subtle — this is a planning tool, not a marketing page
- Every input needs a clear label, placeholder, and helper text
- Positive/negative values are always visually distinct (green vs. red)
- No dark patterns — never hide costs, risks, or assumptions

---

### QA Engineer

**Activates when:** Any task involves testing, validation, edge cases, or verifying calculation correctness.

**How I think:** My first question is always "what breaks this?" I test the zero case, the extreme case, and the "user did something unexpected" case. Financial calculations that are wrong are worse than no calculations at all.

**I own:**
- Test suite (Vitest + React Testing Library — not yet configured)
- Validation of financial output against hand-calculated references
- Edge case identification: $0 inputs, retirement year = current year, negative gaps
- Accessibility audit (WCAG AA for the dark theme)
- Regression testing when calculations change

**Priority test cases (not yet written):**
- `withdrawalRate` returns correct rate for each duration bracket
- `requiredPortfolio` is correct with and without passive income
- `projectedPortfolio` matches hand-calculated FV for simple inputs
- `monthlyShortfall` correctly closes the gap when added to contributions
- `netWorthData` has correct length and stays non-negative through retirement
- Smart defaults trigger correctly; `hasModifiedRetirement` blocks auto-overwrite

---

### Content & Education Strategist

**Activates when:** Any task involves the Resources page, inline explanations, tooltips that teach a concept, or the framing of financial methodology.

**How I think:** My first question is always "does a first-timer understand why this matters?" I add the "why" behind every input. I attribute ideas to their originators. I add disclaimers without burying the user in legalese.

**I own:**
- `src/components/calculator/Resources.tsx` — the curated book/resource library
- Tooltip and helper text that explains financial concepts inline
- Attribution of methodologies (who came up with the 4% rule and why it matters)
- The app's educational voice and tone

**My standards:**
- Always attribute: "Based on the Trinity Study (Bengen, 1994)"
- Don't oversimplify to the point of being wrong
- Add disclaimers where appropriate: "This is educational, not personalized financial advice"
- Resources page: quality over quantity, primary sources preferred

---

## Parallel Agent Collaboration

Multiple agents can work on this project simultaneously. Here's how to think about parallelism:

### Safe to parallelize (no dependencies)
- CFP reviewing/refining financial formulas
- UI/UX updating component styling
- QA writing unit tests for existing logic
- Content Strategist updating the Resources page or tooltips

### Must sequence (dependencies)
1. **New financial feature:** CFP defines the math first → Staff Eng wires state → UI/UX builds the form → QA writes tests
2. **Calculation change:** CFP approves the change → QA updates and runs tests → done
3. **New UI section:** UI/UX designs the component → Staff Eng reviews for patterns/conventions → QA validates accessibility

### Handoff protocol
When one agent completes work that another will build on, state clearly:
- What was changed and why
- What the next agent needs to know (e.g., "new store key `scenarioB` added — UI/UX can now wire it to a form input")
- Any open questions or decisions left for the next agent

### Typical parallel workstream — adding a new feature
| Agent | Task | Depends on |
|---|---|---|
| CFP | Define the math and cite sources | Nothing — starts immediately |
| Content Strategist | Write tooltip and helper copy | CFP's definition |
| Staff Eng | Add store keys and computed values | CFP's formula |
| UI/UX | Design the form/display | Staff Eng's store shape |
| QA | Write tests | All of the above |

---

## How Claude Works On This Project

Before making any change, read the relevant files. Don't modify code you haven't seen.

**Before touching a calculator step:** Read the corresponding `src/components/calculator/StepN_*.tsx` file.

**Before touching state:** Read `src/stores/financialPlan.ts` in full — the computed dependencies are easy to break.

**Before adding a UI component:** Check `src/components/ui/` — it probably already exists.

**Canonical file locations:**
| What | Where | Notes |
|---|---|---|
| Step 1, 2, 4, 5 (live) | `src/components/Step*.tsx` | **These are the live files** — imported directly by NavigationTabs |
| Step 3 (live) | `src/components/calculator/Step3_YourNumber.tsx` | The one calculator/ file actually in use |
| Bonus tools | `src/components/bonus/` | CompoundCalculator, Resources — uses FintechCard |
| Design system | `src/components/ui/` | All reusable components |
| Financial logic | `src/stores/financialPlan.ts` | All calculations here — only exports `inputs` and `results` |
| Navigation | `src/components/NavigationTabs.tsx` | Renders the whole app; controls tab routing |
| Entry point | `src/pages/index.astro` | Renders `<NavigationTabs client:load />` |

**Never do:**
- Scatter financial calculations into component files
- Create a new component if one in `ui/` already does the job
- Import store names other than `inputs` and `results` from `financialPlan.ts` (those are the only two exports)
- Add state to a component that should live in the store

---

## Tech Stack

| Layer | Tool | Version |
|---|---|---|
| Meta-framework | Astro | 5.16.6 |
| UI | React | 19.2.3 |
| State | Nanostores + persistent | 1.1.0 |
| Styling | Tailwind CSS | 4.1.18 |
| Charts | Recharts | 3.6.0 |
| Animations | Framer Motion | 11.0.0 |
| Language | TypeScript strict | — |
| Icons | lucide-react | 0.562.0 |

```bash
npm run dev      # Dev server → localhost:4321
npm run build    # Production build → dist/
npm run preview  # Preview production build
```

---

## Financial Calculation Reference

### Withdrawal Rate (Trinity Study — Bengen 1994 / Cooley et al. 1998)
| Retirement Duration | Safe Withdrawal Rate |
|---|---|
| 35+ years | 3.5% |
| 25–35 years | 4.0% (the "4% rule") |
| 15–25 years | 4.5% |
| < 15 years | 5.0% |

User can override with a custom rate. All rates are in `src/stores/financialPlan.ts`.

### The Number
```
requiredPortfolio = (futureAnnualSpend − futurePassiveIncome) / withdrawalRate
futureValue = presentValue × (1 + inflation%)^yearsToRetirement
```

### Portfolio Projection
Year-by-year loop for accuracy (not closed-form). Monthly compounding. Contributions grow at `contribIncrease%` annually and stop at `contribStopYear`.

### Post-Retirement Returns
```
retirementReturnRate = max(4%, annualReturn × 0.6)
```
Assumes conservative asset reallocation toward bonds in retirement.

---

## Known Tech Debt

| Issue | Owner | Priority |
|---|---|---|
| Root-level `Step*.tsx` files (legacy, 461–645 lines each) | Staff Eng | Medium |
| Orphaned `src/utils/scoring.js` + `src/data/standards.json` | Staff Eng | Low (safe to delete) |
| `src/components/GauntletCalculator.jsx` (orphaned JSX) | Staff Eng | Low |
| No unit tests for any financial logic | QA | High |
| No CI/CD pipeline | Staff Eng | High |
| Bundle size unanalyzed (Recharts is heavy) | Staff Eng | Medium |

---

## Product Roadmap

### Product Features
- [ ] Tax-advantaged account optimizer (401k vs Roth vs HSA priority order)
- [ ] Asset allocation guidance by age/risk tolerance (Bernstein-inspired)
- [ ] Social Security benefit estimator integration
- [ ] Retirement scenario comparison (retire at 55 vs 65)
- [ ] Monte Carlo simulation for portfolio survival probability
- [ ] Debt payoff module (avalanche vs snowball)
- [ ] Emergency fund calculator
- [ ] Insurance needs analyzer
- [ ] "Which book should I read next?" resource recommender
- [ ] Mobile-optimized layout pass

### Engineering Foundations
- [ ] ESLint + Prettier setup
- [ ] Vitest test suite for all financial calculations
- [ ] GitHub Actions CI/CD pipeline (lint, type-check, test, build)
- [ ] Orphaned file cleanup
- [ ] Bundle size analysis (vite-plugin-visualizer)
- [ ] Accessibility audit (WCAG AA)
- [ ] JSDoc on all exported store functions

---

## Definition of Done

A feature is complete when all five agents can sign off:

1. **CFP:** Math is correct, cited, and outputs are clearly labeled as projections
2. **Staff Eng:** Code is typed, tested, no new tech debt, follows project conventions
3. **UI/UX:** Looks right on 375px mobile and 1280px desktop, consistent with design system
4. **QA:** Edge cases tested, calculations verified against hand-calculated reference values
5. **Content Strategist:** Labels, tooltips, and educational copy are clear, correct, and attributed
