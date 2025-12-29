# 💰 Retirement Planning Navigator

A modern, dark-themed financial planning application built with Astro and React. Plan your retirement with confidence using data-driven projections, smart defaults, and interactive visualizations.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Astro](https://img.shields.io/badge/Astro-5.16.6-FF5D01?logo=astro)
![React](https://img.shields.io/badge/React-19.2.3-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)

## ✨ Features

### 📊 Step 1: Current Reality
- **Budget Tracking**: Real-time budget ribbon showing spending vs. take-home pay
- **Comprehensive Inputs**: Track fixed costs, investments, and guilt-free spending
- **Percentage Breakdown**: Visual breakdown of spending allocation
- **Collapsible Categories**: Organized sections for easy data entry

### 🎯 Step 2: Retirement Design
- **Smart Defaults**: Automatically calculates retirement spending estimates based on current reality
- **Interactive Sliders**: Adjust each category with real-time comparisons
- **Visual Comparisons**: Bar chart comparing current vs. retirement spending

### 💰 Step 3: Your Number
- **Trinity Study Integration**: Calculates withdrawal rates based on retirement duration
- **Inflation Adjustments**: Accounts for inflation in all future calculations
- **Customizable Parameters**: Adjust retirement year, duration, inflation rate, and withdrawal rate
- **Income Sources**: Factor in Social Security, pensions, and other income

### 📈 Step 4: Investment Path
- **Portfolio Projections**: Visualize your portfolio growth over time
- **Gap Analysis**: Identifies shortfalls and calculates additional monthly contributions needed
- **Contribution Timeline**: Set when to stop contributions before retirement
- **Return Scenarios**: Test conservative (5%), moderate (7%), and aggressive (9%) return rates

### 📋 Summary
- **Executive Summary**: Complete overview of your retirement plan
- **Net Worth Projection**: Interactive chart showing portfolio from now through retirement
- **Four Summary Tables**: Current spending, retirement spending, assumptions, and income sources
- **Print-Ready Reports**: Professional PDF export functionality

### 🧮 Bonus Features
- **Compound Interest Calculator**: Standalone calculator with quick scenario buttons
- **Resources Library**: Curated list of financial planning books and resources

## 🎨 Design

Built with a **dark fintech aesthetic** featuring:
- Glass morphism card designs
- Electric blue accent colors (#3b82f6)
- Monospace typography for financial data
- Smooth animations and transitions
- Responsive design for all screen sizes

## 🛠️ Tech Stack

- **Framework**: [Astro](https://astro.build/) 5.16.6
- **UI Library**: [React](https://react.dev/) 19.2.3
- **State Management**: [Nanostores](https://github.com/nanostores/nanostores)
- **Charts**: [Recharts](https://recharts.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) 4.1.18
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Language**: TypeScript

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/pmagouir/Financial_Planning_Tool.git
   cd Financial_Planning_Tool
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:4321`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 📖 Usage Guide

### Step-by-Step Process

1. **Current Reality**: Enter your monthly take-home pay, fixed costs, investments, and spending
2. **Retirement Design**: Review and adjust your planned retirement spending (smart defaults are provided)
3. **Your Number**: Set retirement parameters and see your target portfolio value
4. **Investment Path**: Enter your current portfolio and contributions to see if you're on track
5. **Summary**: Review your complete retirement plan and export as PDF

### Key Features

- **Smart Defaults**: The app automatically calculates retirement spending estimates based on your current reality
- **Real-Time Updates**: All calculations update instantly as you change inputs
- **Data Persistence**: Your inputs are automatically saved to local storage
- **Print Reports**: Generate professional PDF reports of your retirement plan

## 🧮 Financial Calculations

### Withdrawal Rate (Trinity Study)
- **35+ years**: 3.5% withdrawal rate
- **25-35 years**: 4.0% withdrawal rate (standard)
- **15-25 years**: 4.5% withdrawal rate
- **<15 years**: 5.0% withdrawal rate

### Portfolio Projections
- Accounts for monthly contributions with annual increases
- Compound interest calculations with monthly compounding
- Conservative return rates during retirement (60% of pre-retirement rate, minimum 4%)

### Inflation Adjustments
- Default: 3% annual inflation
- All future dollar amounts are adjusted for inflation
- User-configurable inflation rate

## 🎯 Project Structure

```
Financial_Planning_Tool/
├── src/
│   ├── components/
│   │   ├── calculator/      # Main calculation steps
│   │   ├── bonus/           # Compound calculator & resources
│   │   ├── ui/              # Reusable UI components
│   │   └── NavigationTabs.tsx
│   ├── stores/
│   │   └── financialPlan.ts # State management & calculations
│   ├── layouts/
│   │   └── Layout.astro     # Main layout
│   ├── pages/
│   │   └── index.astro      # Home page
│   └── styles/
│       └── global.css       # Global styles & theme
├── public/                   # Static assets
└── package.json
```

## 🔧 Configuration

### Customizing Colors

Edit `tailwind.config.mjs` to customize the color scheme:

```javascript
colors: {
  background: {
    DEFAULT: '#0f172a',  // Main background
    paper: '#1e293b',    // Card background
    subtle: '#334155',   // Borders/inputs
  },
  accent: {
    primary: '#3b82f6',  // Electric blue
    success: '#10b981',   // Emerald green
    warning: '#f59e0b',   // Amber
    danger: '#ef4444',    // Red
  }
}
```

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

- Based on the Trinity Study for withdrawal rate calculations
- Inspired by Ramit Sethi's "I Will Teach You To Be Rich" methodology
- Built with modern web technologies for optimal performance

## 📧 Contact

For questions or suggestions, please open an issue on GitHub.

---

**Built with ❤️ for better financial planning**
