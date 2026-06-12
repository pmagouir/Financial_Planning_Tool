// Confidence-zone framing (canonical §10.7). 75–90% is the healthy zone professional planning
// practice targets (MoneyGuidePro "Confidence Zone"). One source for the verdict, the plain-odds
// phrasing, and the downside statement so the result hero, Step 4, and Step 5 can never disagree.

export type ConfidenceTone = 'above' | 'healthy' | 'below' | 'fragile';

export interface ConfidenceZone {
  tone: ConfidenceTone;
  label: string; // short pill text
  color: string; // accent hex for the tone (canonical §6 palette)
  message: string; // one-line verdict
}

export function confidenceZone(successPct: number): ConfidenceZone {
  if (successPct >= 90) {
    return {
      tone: 'above',
      label: 'Above the zone',
      color: '#10b981',
      message:
        'Above the 75–90% zone planners target — sturdy, and possibly room to enjoy a little more today.',
    };
  }
  if (successPct >= 75) {
    return {
      tone: 'healthy',
      label: 'Healthy zone',
      color: '#10b981',
      message: 'Inside the 75–90% healthy zone professional planners target.',
    };
  }
  if (successPct >= 60) {
    return {
      tone: 'below',
      label: 'Just below',
      color: '#f59e0b',
      message:
        'Slightly below the 75–90% zone — more contributions or a later retirement would lift it.',
    };
  }
  return {
    tone: 'fragile',
    label: 'Needs attention',
    color: '#ef4444',
    message: 'Fragile — more contributions or a later retirement would help.',
  };
}

// Plain-odds phrasing: 83% → "8 in 10". Boldin/Fidelity both show first-timers absorb odds more
// readily than a bare percentage. Clamped to 0–10.
export function oddsOutOfTen(successPct: number): number {
  return Math.max(0, Math.min(10, Math.round(successPct / 10)));
}

// Honest-but-reassuring downside (canonical §10.7), reusing the approved Step 4 phrasing.
// p10DepletionYear === null means even the 10th-percentile path funds the whole plan.
export function downsideStatement(
  p10DepletionYear: number | null,
  retDuration: number,
  lastYear: number,
): string {
  return p10DepletionYear === null
    ? `Even in a 1-in-10 rough market, your money lasts all ${retDuration} years — through ${lastYear}.`
    : `A 1-in-10 rough market runs short around ${p10DepletionYear}; 9 in 10 futures stay funded through ${p10DepletionYear - 1}.`;
}
