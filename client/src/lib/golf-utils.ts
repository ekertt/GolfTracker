export function calculateScoreToPar(score: number, par: number): string {
  const difference = score - par;
  if (difference === 0) return "E";
  return difference > 0 ? `+${difference}` : `${difference}`;
}

export function calculateHandicap(scores: number[], courseRatings: number[], slopeRatings: number[]): number {
  // Simplified handicap calculation
  // In a real app, this would use the official USGA handicap formula
  if (scores.length < 5) return 0;
  
  const differentials = scores.map((score, index) => {
    const courseRating = courseRatings[index] || 72;
    const slopeRating = slopeRatings[index] || 113;
    return ((score - courseRating) * 113) / slopeRating;
  });
  
  // Use best 8 of last 20 scores (simplified)
  const sortedDiffs = differentials.sort((a, b) => a - b);
  const bestDiffs = sortedDiffs.slice(0, Math.min(8, sortedDiffs.length));
  const average = bestDiffs.reduce((sum, diff) => sum + diff, 0) / bestDiffs.length;
  
  return Math.round(average * 0.96 * 10) / 10; // 96% factor
}

export function getScoreDescription(score: number, par: number): string {
  const difference = score - par;
  switch (difference) {
    case -4: return "Condor";
    case -3: return "Albatross";
    case -2: return "Eagle";
    case -1: return "Birdie";
    case 0: return "Par";
    case 1: return "Bogey";
    case 2: return "Double Bogey";
    case 3: return "Triple Bogey";
    default: return difference > 0 ? `+${difference}` : `${difference}`;
  }
}

export function formatRoundDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date));
}
