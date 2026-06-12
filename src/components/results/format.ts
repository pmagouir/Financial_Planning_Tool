// Shared display formatters for the result experience. Consolidated here so the result
// components (and, over time, Step 3/4/5) format money the same way and can't drift —
// formatCurrency/formatLarge were previously redefined in five components.

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

// Compact headline figure: $1.62M, $840K, $1,200.
export const formatLarge = (value: number): string => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${Math.round(value)}`;
};

export const formatPercent = (value: number): string => `${value.toFixed(1)}%`;

// Chart axis ticks: $1.6M / $840k / $200.
export const formatAxis = (value: number): string => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
  return `$${Math.round(value)}`;
};
