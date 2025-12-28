import { Card } from '../ui/Card';

interface BookResource {
  title: string;
  author: string;
  description: string;
  link: string;
  color: 'blue' | 'green' | 'red' | 'purple';
  coverColor: string;
}

const books: BookResource[] = [
  {
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    description: 'Timeless lessons on wealth, greed, and happiness. Explores how people think about money and make financial decisions.',
    link: 'https://www.amazon.com/Psychology-Money-Timeless-lessons-happiness/dp/0857197681',
    color: 'blue',
    coverColor: 'bg-blue-500',
  },
  {
    title: 'The Simple Path to Wealth',
    author: 'JL Collins',
    description: 'Your road map to financial independence and a rich, free life. Focuses on low-cost index fund investing and living below your means.',
    link: 'https://www.amazon.com/Simple-Path-Wealth-financial-independence/dp/1533667926',
    color: 'green',
    coverColor: 'bg-green-500',
  },
  {
    title: 'I Will Teach You To Be Rich',
    author: 'Ramit Sethi',
    description: 'A 6-week program for living your rich life. Covers banking, saving, budgeting, and investing with a no-BS approach.',
    link: 'https://www.amazon.com/Will-Teach-You-Be-Rich/dp/0761147489',
    color: 'purple',
    coverColor: 'bg-purple-500',
  },
];

export function Resources() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Recommended Resources</h2>
        <p className="text-slate-600">
          Essential books to deepen your understanding of personal finance and investing
        </p>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {books.map((book) => (
          <Card key={book.title} color={book.color} className="hover:shadow-lg transition-shadow">
            <div className="p-6">
              {/* Book Cover Placeholder */}
              <div className={`${book.coverColor} rounded-lg h-48 mb-4 flex items-center justify-center shadow-md`}>
                <div className="text-white text-center">
                  <div className="text-4xl mb-2">📚</div>
                  <div className="text-sm font-medium opacity-90">{book.title.split(' ')[0]}</div>
                </div>
              </div>

              {/* Book Info */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{book.title}</h3>
                  <p className="text-sm text-slate-600 font-medium">{book.author}</p>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {book.description}
                </p>

                <a
                  href={book.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`
                    inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm
                    transition-colors
                    ${
                      book.color === 'blue'
                        ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        : book.color === 'green'
                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                        : book.color === 'red'
                        ? 'bg-red-50 text-red-700 hover:bg-red-100'
                        : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                    }
                  `}
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
            </div>
          </Card>
        ))}
      </div>

      {/* Additional Resources Section */}
      <Card color="blue">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Additional Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-900">Online Tools</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• <a href="https://www.bogleheads.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Bogleheads Forum</a> - Investment community</li>
                <li>• <a href="https://www.portfoliovisualizer.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Portfolio Visualizer</a> - Backtesting tool</li>
                <li>• <a href="https://www.firecalc.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">FireCalc</a> - Retirement calculator</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-900">Key Concepts</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• <strong>4% Rule</strong> - Safe withdrawal rate for retirement</li>
                <li>• <strong>Index Funds</strong> - Low-cost, diversified investing</li>
                <li>• <strong>Asset Allocation</strong> - Balancing risk and return</li>
                <li>• <strong>Emergency Fund</strong> - 3-6 months of expenses</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

