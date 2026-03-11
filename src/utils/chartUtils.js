/**
 * src/utils/chartUtils.js
 * High-Performance Data Engine for SMARTAQUA Dashboard.
 */
import { formatStats } from './formatStats';
import { SENSOR_CONFIG, EMPTY_STATE, APP_SETTINGS } from '../constants';

// --- 1. HELPER: Data Sanitization ---
/**
 * Ensures we only deal with numbers or nulls for chart stability.
 * Note: useSortedLogs handles the bulk cleaning; this handles specific metric extraction.
 */
const normalizeSensorValue = (val) => {
  if (val === undefined || val === null || val === '') return null;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? null : parsed;
};

// --- 2. PROCESSOR: Time-Series Segmentation ---
/**
 * Segments logs into current and previous windows for trend analysis.
 * UPDATED: Optimized to utilize __normalizedTs provided by useSortedLogs.
 */
export const processLogsInWindows = (
  sortedLogs = [], 
  { 
    metricKey, 
    metricId, 
    currentWindowStart = Date.now(), 
    comparisonWindowStart = Date.now() - 3600000 
  } = {}
) => {
  // Guard Clause: Prevent processing without essential identifiers
  if (!metricKey || !metricId) {
    console.error("[Data Engine]: Missing required metricKey or metricId mapping.");
    return { current: [], previous: [], currentValues: [], previousValues: [], lastTs: 0 };
  }

  const result = { 
    current: [], 
    previous: [], 
    currentValues: [],  
    previousValues: [], 
    lastTs: 0 
  };
  
  const gapThreshold = APP_SETTINGS.STALE_THRESHOLD; 
  const now = Date.now();

  for (const entry of sortedLogs) {
    // Optimization: Prioritize the pre-normalized timestamp from useSortedLogs
    const ts = entry.__normalizedTs || entry.timestamp;
    if (!ts) continue;

    // Safety: Skip future logs and logs outside our comparison range
    // We break because sortedLogs is guaranteed to be chronological by useSortedLogs
    if (ts > now + 5000) break; 
    if (ts < comparisonWindowStart) continue;

    const val = normalizeSensorValue(entry[metricKey]);

    if (ts < currentWindowStart) {
      // Historical baseline collection
      if (val !== null) {
        result.previous.push({ ...entry, value: val });
        result.previousValues.push(val); 
      }
    } else {
      // Active window processing with gap detection
      const hasGap = result.lastTs > 0 && (ts - result.lastTs) > gapThreshold;
      
      if (hasGap) {
        result.current.push({ 
          timestamp: result.lastTs + 1, 
          value: null, 
          isGap: true 
        });
      }

      result.current.push({ ...entry, timestamp: ts, value: val });
      if (val !== null) result.currentValues.push(val); 
      
      result.lastTs = ts;
    }
  }

  return result;
};

// --- 3. ORCHESTRATOR: Safety & Validation ---
/**
 * Converts windowed data into UI-ready statistics while validating hardware health.
 */
export const getFormattedStats = (windowData, metricId) => {
  if (!windowData?.currentValues || windowData.currentValues.length === 0) {
    return EMPTY_STATE.stats;
  }

  try {
    const stats = formatStats(windowData);
    const config = SENSOR_CONFIG[metricId] || {};

    // Logic: Validation against hardware physical limits
    if (config.max && stats.latest > config.max) {
      console.warn(`[Hardware Alert]: ${metricId} reading (${stats.latest}) is physically impossible.`);
    }

    // Logic: Detection of stuck/stale sensor hardware
    const isStale = stats.count > 10 && stats.min === stats.max;
    if (isStale) {
      console.warn(`[Hardware Alert]: ${metricId} sensor output is flatlining (stale).`);
    }

    return stats;
  } catch (error) {
    console.error("[Data Engine Error]: Stats orchestration failed.", error.message);
    return EMPTY_STATE.stats;
  }
};