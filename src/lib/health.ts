/**
 * Compute a "health" score for a location based on its item conditions.
 * 1.0 = all good (green), 0.0 = all broken (red).
 */
export function healthScore(good: number, broken: number, repair = 0): number {
  const total = good + broken + repair;
  if (total === 0) return 1;
  return good / total;
}

/**
 * Map a health score to a Tailwind-compatible HSL color string for room fill.
 * Returns CSS color: green → amber → red gradient.
 */
export function healthColor(score: number, opacity = 1): string {
  // Hue: green 150° at score=1, red 0° at score=0
  const hue = Math.round(150 * score);
  return `hsl(${hue} 75% 45% / ${opacity})`;
}

/**
 * Pick a stroke color matching the health fill (slightly darker).
 */
export function healthStroke(score: number, opacity = 1): string {
  const hue = Math.round(150 * score);
  return `hsl(${hue} 80% 30% / ${opacity})`;
}

/**
 * Status label for the broken count.
 */
export function healthLabel(score: number): 'healthy' | 'attention' | 'critical' {
  if (score >= 0.85) return 'healthy';
  if (score >= 0.5) return 'attention';
  return 'critical';
}
