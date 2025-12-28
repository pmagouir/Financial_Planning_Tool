import { Card } from '../ui/Card';

interface BookResource {
  title: string;
  author: string;
  keyInsight: string;
  link: string;
  variant: 'primary' | 'success' | 'warning' | 'info';
}

const books: BookResource[] = [
  {
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    keyInsight: 'Wealth is what you don\'t see. The ability to do what you want, when you want, for as long as you want, is the highest dividend money pays.',
    link: 'https://www.amazon.com/Psychology-Money-Timeless-lessons-happiness/dp/0857197681',
    variant: 'primary',
  },
  {
    title: 'The Millionaire Next Door',
    author: 'Thomas J. Stanley & William D. Danko',
    keyInsight: 'Most millionaires are ordinary people who live below their means, save consistently, and invest wisely. Wealth is built through discipline, not income.',
    link: 'https://www.amazon.com/Millionaire-Next-Door-Surprising-Americas/dp/1589795474',
    variant: 'success',
  },
  {
    title: 'The Simple Path to Wealth',
    author: 'JL Collins',
    keyInsight: 'Invest in low-cost index funds, avoid debt, and live below your means. Financial independence is achievable through simplicity and consistency.',
    link: 'https://www.amazon.com/Simple-Path-Wealth-financial-independence/dp/1533667926',
    variant: 'info',
  },
  {
    title: 'I Will Teach You To Be Rich',
    author: 'Ramit Sethi',
    keyInsight: 'Spend extravagantly on the things you love, and cut costs mercilessly on the things you don\'t. Automate your finances to build wealth effortlessly.',
    link: 'https://www.amazon.com/Will-Teach-You-Be-Rich/dp/0761147489',
    variant: 'primary',
  },
  {
    title: 'Your Money or Your Life',
    author: 'Vicki Robin & Joe Dominguez',
    keyInsight: 'Money is life energy. Calculate your real hourly wage after expenses, and make every purchase decision based on whether it brings you fulfillment.',
    link: 'https://www.amazon.com/Your-Money-Life-Transforming-Relationship/dp/0143115766',
    variant: 'warning',
  },
  {
    title: 'The Bogleheads\' Guide to Investing',
    author: 'Taylor Larimore, Mel Lindauer, Michael LeBoeuf',
    keyInsight: 'Keep investing simple: low-cost index funds, broad diversification, and a long-term perspective. Costs matter more than you think.',
    link: 'https://www.amazon.com/Bogleheads-Guide-Investing-Taylor-Larimore/dp/1118921283',
    variant: 'info',
  },
  {
    title: 'A Random Walk Down Wall Street',
    author: 'Burton Malkiel',
    keyInsight: 'The stock market is efficient in the long run. You can\'t consistently beat the market, so invest in low-cost index funds and hold for the long term.',
    link: 'https://www.amazon.com/Random-Walk-Down-Wall-Street/dp/0393358380',
    variant: 'success',
  },
];

export function Resources() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-slate-900">Recommended Resources</h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          Essential books to deepen your understanding of personal finance, investing, and building wealth
        </p>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <Card key={book.title} variant={book.variant} className="hover:shadow-shiny-hover transition-shadow h-full flex flex-col">
            <div className="p-6 flex flex-col flex-grow">
              {/* Book Title and Author */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">
                  {book.title}
                </h3>
                <p className="text-sm text-slate-600 font-medium">
                  by {book.author}
                </p>
              </div>

              {/* Key Insight */}
              <div className="mb-4 flex-grow">
                <p className="text-sm text-slate-700 leading-relaxed italic">
                  "{book.keyInsight}"
                </p>
              </div>

              {/* Link */}
              <a
                href={book.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors mt-auto"
              >
                View on Amazon
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

