import { memo } from "react";
/**
 * HELPER: Business Logic for Color States
 * Categorizes strength based on the 80% "Hard Requirement" gate.
 */
const getBarColor = (val) => {
  if (val === 0) return 'bg-slate-200';
  if (val < 40) return 'bg-red-500';
  if (val < 80) return 'bg-yellow-500';
  return 'bg-green-500';
};

/**
 * MOLECULE: Strength Meter Bar
 * Fully accessible with ARIA attributes and smooth transitions.
 */
const StrengthMeter = ({ strength }) => {
  const barColor = getBarColor(strength);

  // Determine a descriptive label for screen readers
  const getAccessibilityLabel = (val) => {
    if (val === 0) return "No password entered";
    if (val < 40) return "Weak password";
    if (val < 80) return "Moderate password, missing requirements";
    return "Strong password, meets security requirements";
  };

  return (
    <div className="mt-2"> {/* 8px margin-top */}
      {/* Progress Track with ARIA Support */}
      <div 
        className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50"
        role="progressbar"
        aria-valuenow={strength}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label={getAccessibilityLabel(strength)}
      >
        {/* Animated Progress Bar */}
        <div 
          className={`h-full transition-all duration-500 ease-in-out ${barColor} shadow-[0_0_8px_rgba(0,0,0,0.05)]`}
          style={{ width: `${strength}%` }}
        />
      </div>

      {/* Label Group */}
      <div className="flex justify-between mt-2 text-[10px] font-bold uppercase tracking-wider" aria-hidden="true">
        <span className="text-slate-400">Security Score</span>
        <span className={strength >= 80 ? "text-green-600 font-mono" : "text-slate-600 font-mono"}>
          {strength}%
        </span>
      </div>
    </div>
  );
};
const MemoizedStrengthMeter = memo(StrengthMeter);
export default MemoizedStrengthMeter;