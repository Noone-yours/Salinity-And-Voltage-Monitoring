import { EMPTY_STATE } from '../constants';

/**
 * STATS FORMATTER: High-performance single-pass calculation.
 * Logic: Calculates sum, max, and min in one loop to optimize CPU cycles.
 */
export const formatStats = (windowResult = {}) => {
  const current = Array.isArray(windowResult.currentValues) ? windowResult.currentValues : [];
  const previous = Array.isArray(windowResult.previousValues) ? windowResult.previousValues : [];

  // 1. Immediate Safety Guard
  if (current.length === 0) return EMPTY_STATE.stats;

  // 2. Single-Pass Aggregation
  let sum = 0;
  let max = -Infinity;
  let min = Infinity;

  for (const val of current) {
    const num = Number(val) || 0;
    sum += num;
    if (num > max) max = num;
    if (num < min) min = num;
  }

  const currentCount = current.length;
  const currentAvg = sum / currentCount;

  // 3. Historical Baseline (Simpler reduce is fine for historical comparison)
  const prevCount = previous.length;
  const prevSum = previous.reduce((a, b) => a + (Number(b) || 0), 0);
  const previousAvg = prevCount > 0 ? prevSum / prevCount : 0;

  // 4. Trend Calculation (The Percentage Delta)
  let trend = 0;
  if (previousAvg !== 0) {
    trend = ((currentAvg - previousAvg) / previousAvg) * 100;
  }

  // 5. Semantic Return Object
  return {
    latest: current[currentCount - 1] ?? 0,
    avg: currentAvg,
    max: max === -Infinity ? 0 : max,
    min: min === Infinity ? 0 : min,
    trend: trend,
    isRising: trend > 0,
    hasComparison: prevCount > 0,
    count: currentCount
  };
};